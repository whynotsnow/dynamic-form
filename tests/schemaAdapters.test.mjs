import assert from 'node:assert/strict';
import test from 'node:test';
import {
  adaptModuleConfigs,
  compileAdaptedFormConfig,
  JsonSchemaAdapter,
  MetadataAdapter,
  ModuleRegistryManager,
  OpenApiAdapter
} from '../packages/dynamic-form-core/dist/index.mjs';

test('JsonSchemaAdapter converts top-level properties into ModuleConfig entries', () => {
  const moduleFormConfig = JsonSchemaAdapter.adapt({
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
          name: ['profile', 'name'],
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

  assert.deepEqual(moduleFormConfig, {
    nodes: [
      {
        nodeType: 'field',
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
          name: ['profile', 'name'],
          initialValue: 'Snow'
        }
      },
      {
        nodeType: 'field',
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
          name: 'status',
          label: 'status',
          required: false,
          componentProps: { allowClear: true }
        }
      }
    ]
  });
});

test('JsonSchemaAdapter rejects missing module metadata on leaf fields', () => {
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

  assert.deepEqual(OpenApiAdapter.adapt(document, { metadata: { schemaName: 'Company' } }), {
    nodes: [
      {
        nodeType: 'field',
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
          name: 'companyName',
          label: 'companyName',
          required: false
        }
      }
    ]
  });

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
    ).nodes[0].id,
    'name'
  );
});

test('JsonSchemaAdapter converts nested objects and object arrays into containers', () => {
  const adapted = JsonSchemaAdapter.adapt({
    type: 'object',
    properties: {
      profile: {
        type: 'object',
        title: 'Profile',
        required: ['city'],
        properties: {
          city: {
            type: 'string',
            metadata: { module: 'TextInputModule' }
          }
        }
      },
      contacts: {
        type: 'array',
        title: 'Contacts',
        items: {
          type: 'object',
          properties: {
            phone: {
              type: 'string',
              metadata: { module: 'TextInputModule' }
            }
          }
        }
      }
    }
  });

  assert.deepEqual(adapted.nodes[0], {
    nodeType: 'container',
    id: 'profile',
    title: 'Profile',
    name: 'profile',
    children: [
      {
        nodeType: 'field',
        type: 'TextInputModule',
        id: 'profile.city',
        options: {
          label: 'city',
          required: true,
          enum: undefined,
          default: undefined,
          format: undefined,
          description: undefined,
          schemaType: 'string'
        },
        rules: undefined,
        overrides: {
          name: 'city',
          label: 'city',
          required: true
        }
      }
    ]
  });
  assert.equal(adapted.nodes[1].repeatable, true);
  assert.equal(adapted.nodes[1].children[0].id, 'contacts.phone');
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
    id: 'metadata-form',
    fields: [
      {
        id: 'name',
        name: ['profile', 'name'],
        type: 'TextInputModule',
        options: { label: 'Name' },
        rules: [{ when: { field: 'enabled', equals: true }, then: { action: 'show' } }],
        overrides: { required: true },
        groupId: 'profile'
      }
    ],
    groups: [{ id: 'profile', title: 'Profile' }]
  };

  assert.deepEqual(MetadataAdapter.adapt(input), {
    id: 'metadata-form',
    fields: [
      {
        type: 'TextInputModule',
        id: 'name',
        groupId: 'profile',
        options: { label: 'Name' },
        rules: [{ when: { field: 'enabled', equals: true }, then: { action: 'show' } }],
        overrides: { name: ['profile', 'name'], required: true }
      }
    ],
    groups: [{ id: 'profile', title: 'Profile' }]
  });
});

test('OpenApiAdapter preserves groups from the selected schema', () => {
  const adapted = OpenApiAdapter.adapt(
    {
      openapi: '3.1.0',
      components: {
        schemas: {
          Company: {
            type: 'object',
            'x-dynamic-form': {
              groups: [{ id: 'companyInfo', title: 'Company' }]
            },
            properties: {
              companyName: {
                type: 'string',
                'x-dynamic-form': {
                  module: 'TextInputModule',
                  groupId: 'companyInfo'
                }
              }
            }
          }
        }
      }
    },
    {}
  );

  assert.equal(adapted.nodes[0].groupId, 'companyInfo');
  assert.equal(adapted.groups[0].id, 'companyInfo');
});

test('default adapter registry can adapt schema inputs by adapterType', () => {
  assert.deepEqual(
    adaptModuleConfigs(
      {
        fields: [{ id: 'name', type: 'TextInputModule' }]
      },
      { adapterType: 'metadata' }
    ),
    {
      fields: [
        {
          type: 'TextInputModule',
          id: 'name',
          options: undefined,
          rules: undefined,
          overrides: undefined
        }
      ]
    }
  );
});

test('schema adapters preserve explicit groups and field membership', () => {
  const adapted = JsonSchemaAdapter.adapt({
    type: 'object',
    'x-dynamic-form': {
      groups: [
        {
          id: 'companyInfo',
          title: 'Company',
          initialVisible: false,
          rules: [
            {
              when: { field: 'accountType', equals: 'company' },
              then: { action: 'show' }
            }
          ]
        }
      ]
    },
    properties: {
      accountType: {
        type: 'string',
        'x-dynamic-form': { module: 'TextInputModule' }
      },
      companyName: {
        type: 'string',
        'x-dynamic-form': {
          module: 'TextInputModule',
          groupId: 'companyInfo'
        }
      }
    }
  });

  assert.equal(adapted.nodes[1].groupId, 'companyInfo');
  assert.deepEqual(adapted.groups, [
    {
      id: 'companyInfo',
      title: 'Company',
      initialVisible: false,
      dependents: undefined,
      rules: [
        {
          when: { field: 'accountType', equals: 'company' },
          then: { action: 'show' }
        }
      ]
    }
  ]);

  assert.throws(
    () =>
      JsonSchemaAdapter.adapt({
        type: 'object',
        'x-dynamic-form': {
          groups: [{ id: 'invalid', effect: () => ({ visible: true }) }]
        },
        properties: {}
      }),
    /cannot declare a function effect/
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
  assert.deepEqual(compiled.formConfig.nodes, [
    {
      nodeType: 'field',
      id: 'name',
      name: 'name',
      label: 'Name',
      component: 'TextInput',
      componentProps: { placeholder: 'Enter name' },
      dependents: [],
      effect: undefined,
      required: true
    }
  ]);
});
