import assert from 'node:assert/strict';
import test from 'node:test';
import {
  adaptModuleConfigs,
  compileAdaptedFormConfig,
  JsonSchemaAdapter,
  MetadataAdapter,
  ModuleRegistryManager,
  OpenApiAdapter
} from '../dist/index.mjs';

test('JsonSchemaAdapter converts top-level properties into ModuleConfig entries', () => {
  const moduleConfigs = JsonSchemaAdapter.adapt({
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        title: 'Name',
        description: 'Customer name',
        default: 'Snow',
        metadata: {
          module: 'TextInputModule',
          options: { placeholder: 'Enter name' }
        }
      },
      status: {
        type: 'string',
        enum: ['active', 'disabled'],
        'x-dynamic-form': {
          module: 'SelectModule',
          overrides: {
            componentProps: { allowClear: true }
          }
        }
      }
    }
  });

  assert.deepEqual(moduleConfigs, [
    {
      type: 'TextInputModule',
      id: 'name',
      options: {
        label: 'Name',
        required: true,
        enum: undefined,
        default: 'Snow',
        format: undefined,
        description: 'Customer name',
        schemaType: 'string',
        placeholder: 'Enter name'
      },
      rules: undefined,
      overrides: {
        label: 'Name',
        required: true,
        initialValue: 'Snow'
      }
    },
    {
      type: 'SelectModule',
      id: 'status',
      options: {
        label: 'status',
        required: false,
        enum: ['active', 'disabled'],
        default: undefined,
        format: undefined,
        description: undefined,
        schemaType: 'string'
      },
      rules: undefined,
      overrides: {
        label: 'status',
        required: false,
        componentProps: { allowClear: true }
      }
    }
  ]);
});

test('JsonSchemaAdapter rejects missing module metadata and nested object schemas', () => {
  assert.throws(
    () =>
      JsonSchemaAdapter.adapt({
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      }),
    /property "name" must declare dynamic form module metadata/
  );

  assert.throws(
    () =>
      JsonSchemaAdapter.adapt({
        type: 'object',
        properties: {
          profile: {
            type: 'object',
            properties: {},
            metadata: { module: 'ProfileModule' }
          }
        }
      }),
    /nested object property "profile" is not supported/
  );
});

test('OpenApiAdapter resolves schemas by schemaName and by single-schema default', () => {
  const document = {
    openapi: '3.1.0',
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              metadata: { module: 'TextInputModule' }
            }
          }
        },
        Company: {
          type: 'object',
          properties: {
            companyName: {
              type: 'string',
              metadata: { module: 'TextInputModule' }
            }
          }
        }
      }
    }
  };

  assert.deepEqual(OpenApiAdapter.adapt(document, { metadata: { schemaName: 'Company' } }), [
    {
      type: 'TextInputModule',
      id: 'companyName',
      options: {
        label: 'companyName',
        required: false,
        enum: undefined,
        default: undefined,
        format: undefined,
        description: undefined,
        schemaType: 'string'
      },
      rules: undefined,
      overrides: {
        label: 'companyName',
        required: false
      }
    }
  ]);

  assert.deepEqual(
    OpenApiAdapter.adapt(
      {
        openapi: '3.1.0',
        components: {
          schemas: {
            User: document.components.schemas.User
          }
        }
      },
      {}
    )[0].id,
    'name'
  );
});

test('OpenApiAdapter reports ambiguous or missing schemas', () => {
  const document = {
    openapi: '3.1.0',
    components: {
      schemas: {
        User: { type: 'object', properties: {} },
        Company: { type: 'object', properties: {} }
      }
    }
  };

  assert.throws(() => OpenApiAdapter.adapt(document, {}), /schemaName is required/);
  assert.throws(
    () => OpenApiAdapter.adapt(document, { metadata: { schemaName: 'Missing' } }),
    /schema "Missing" was not found/
  );
});

test('MetadataAdapter passes id, type, options, rules, and overrides through', () => {
  const input = {
    fields: [
      {
        id: 'name',
        type: 'TextInputModule',
        options: { label: 'Name' },
        rules: [{ when: { field: 'enabled', equals: true }, then: { action: 'show' } }],
        overrides: { required: true }
      }
    ]
  };

  assert.deepEqual(MetadataAdapter.adapt(input), [
    {
      type: 'TextInputModule',
      id: 'name',
      options: { label: 'Name' },
      rules: [{ when: { field: 'enabled', equals: true }, then: { action: 'show' } }],
      overrides: { required: true }
    }
  ]);
});

test('default adapter registry can adapt schema inputs by adapterType', () => {
  assert.deepEqual(
    adaptModuleConfigs(
      {
        fields: [{ id: 'name', type: 'TextInputModule' }]
      },
      { adapterType: 'metadata' }
    ),
    [
      {
        type: 'TextInputModule',
        id: 'name',
        options: undefined,
        rules: undefined,
        overrides: undefined
      }
    ]
  );
});

test('compileAdaptedFormConfig compiles schema adapter output into standard FormConfig', () => {
  const moduleRegistry = new ModuleRegistryManager();

  moduleRegistry.register({
    type: 'TextInputModule',
    createConfig: (options) => ({
      id: 'fromFactory',
      label: options.label,
      component: 'TextInput',
      componentProps: {
        placeholder: options.placeholder
      }
    })
  });

  const compiled = compileAdaptedFormConfig(
    {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          title: 'Name',
          metadata: {
            module: 'TextInputModule',
            options: { placeholder: 'Enter name' }
          }
        }
      }
    },
    {
      adapterType: 'json-schema',
      moduleRegistry
    }
  );

  assert.deepEqual(compiled.componentRegistry, {});
  assert.deepEqual(compiled.formConfig.fields, [
    {
      id: 'name',
      label: 'Name',
      component: 'TextInput',
      componentProps: { placeholder: 'Enter name' },
      dependents: [],
      effect: undefined,
      required: true
    }
  ]);
});
