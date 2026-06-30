import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CompiledDynamicForm,
  compileFormConfig,
  ModuleRegistryManager,
  processFormConfig
} from '../packages/dynamic-form/dist/index.mjs';

test('ModuleRegistryManager registers, lists, looks up, and unregisters modules', () => {
  const registry = new ModuleRegistryManager();
  const module = {
    type: 'UserSelector',
    createConfig: () => ({ id: 'userId', component: 'Select' })
  };

  registry.register(module);

  assert.equal(registry.has('UserSelector'), true);
  assert.equal(registry.get('UserSelector'), module);
  assert.deepEqual(registry.list(), [module]);
  assert.equal(registry.unregister('UserSelector'), true);
  assert.equal(registry.has('UserSelector'), false);
});

test('ModuleRegistryManager rejects duplicate modules unless override is explicit', () => {
  const registry = new ModuleRegistryManager();
  const first = {
    type: 'Department',
    createConfig: () => ({ id: 'departmentId', component: 'Select' })
  };
  const second = {
    type: 'Department',
    createConfig: () => ({ id: 'deptId', component: 'TextInput' })
  };

  registry.register(first);

  assert.throws(() => registry.register(second), /already registered/);

  registry.register(second, { override: true });
  assert.equal(registry.get('Department'), second);
});

test('compileFormConfig expands modules into standard FormConfig', () => {
  const registry = new ModuleRegistryManager();
  const effect = () => ({ value: 'resolved' });
  const Component = () => null;

  registry.register({
    type: 'UserSelector',
    component: Component,
    dependencies: ['companyId'],
    effect,
    defaultProps: { mode: 'single', allowClear: true },
    createConfig: (options) => ({
      id: 'fromFactory',
      label: options.label,
      component: 'Select',
      componentProps: { allowClear: false, placeholder: 'Choose user' },
      dependents: ['regionId']
    })
  });

  const compiled = compileFormConfig(
    {
      fields: [
        {
          type: 'UserSelector',
          id: 'ownerId',
          options: { label: 'Owner' },
          overrides: {
            required: true,
            componentProps: { placeholder: 'Owner name' }
          }
        }
      ]
    },
    { registry }
  );

  assert.deepEqual(Object.keys(compiled.componentRegistry), ['UserSelector']);
  assert.equal(compiled.componentRegistry.UserSelector, Component);
  assert.equal(compiled.formConfig.fields.length, 1);

  const [field] = compiled.formConfig.fields;

  assert.equal(field.id, 'ownerId');
  assert.equal(field.label, 'Owner');
  assert.equal(field.component, 'UserSelector');
  assert.deepEqual(field.dependents, ['companyId', 'regionId']);
  assert.equal(field.effect, effect);
  assert.equal(field.required, true);
  assert.deepEqual(field.componentProps, {
    mode: 'single',
    allowClear: false,
    placeholder: 'Owner name'
  });

  const processed = processFormConfig(compiled.formConfig);
  assert.equal(Object.hasOwn(processed.fieldRegistry, 'ownerId'), true);
  assert.deepEqual(processed.effectMap.ownerId.dependents, ['companyId', 'regionId']);
});

test('compileFormConfig reports unregistered module type and id', () => {
  const registry = new ModuleRegistryManager();

  assert.throws(
    () => compileFormConfig({ fields: [{ type: 'MissingModule', id: 'missingId' }] }, { registry }),
    /MissingModule.*missingId/
  );
});

test('CompiledDynamicForm injects compiled components and preserves explicit custom components', () => {
  const CompiledComponent = () => null;
  const ExtraComponent = () => null;
  const OverrideComponent = () => null;
  const form = {};
  const compiled = {
    formConfig: { fields: [] },
    componentRegistry: {
      UserSelector: CompiledComponent
    }
  };

  const element = CompiledDynamicForm({
    compiled,
    form,
    componentRegistry: {
      customComponents: {
        UserSelector: OverrideComponent,
        ExtraField: ExtraComponent
      },
      allowOverride: true
    }
  });

  assert.equal(element.props.formConfig, compiled.formConfig);
  assert.equal(element.props.form, form);
  assert.equal(element.props.componentRegistry.allowOverride, true);
  assert.equal(element.props.componentRegistry.customComponents.UserSelector, OverrideComponent);
  assert.equal(element.props.componentRegistry.customComponents.ExtraField, ExtraComponent);
});

test('compileFormConfig runs hooks in order and wraps hook failures with module context', () => {
  const registry = new ModuleRegistryManager();
  const calls = [];

  registry.register({
    type: 'Department',
    createConfig: () => ({ id: 'departmentId', component: 'Select' })
  });

  const compiled = compileFormConfig(
    { fields: [{ type: 'Department', id: 'departmentId' }] },
    {
      registry,
      hooks: {
        beforeCompile: (context) => {
          calls.push(`beforeCompile:${context.moduleFormConfig.fields.length}`);
        },
        beforeModuleExpand: (context) => {
          calls.push(`beforeModuleExpand:${context.moduleConfig.type}`);
        },
        afterModuleExpand: (context) => {
          context.field.label = 'Department';
          calls.push(`afterModuleExpand:${context.field.id}`);
        },
        afterCompile: (context) => {
          calls.push(`afterCompile:${context.fields.length}`);
        }
      }
    }
  );

  assert.deepEqual(calls, [
    'beforeCompile:1',
    'beforeModuleExpand:Department',
    'afterModuleExpand:departmentId',
    'afterCompile:1'
  ]);
  assert.equal(compiled.formConfig.fields[0].label, 'Department');

  assert.throws(
    () =>
      compileFormConfig(
        { fields: [{ type: 'Department', id: 'departmentId' }] },
        {
          registry,
          hooks: {
            beforeModuleExpand: () => {
              throw new Error('blocked');
            }
          }
        }
      ),
    /beforeModuleExpand.*Department.*departmentId.*blocked/
  );
});

test('compileFormConfig assembles mixed fields and groups with group-owned rules', () => {
  const registry = new ModuleRegistryManager();
  const Component = () => null;

  registry.register({
    type: 'TextField',
    component: Component,
    createConfig: () => ({ id: 'fromFactory', component: 'TextInput' })
  });

  const compiled = compileFormConfig(
    {
      id: 'mixed-form',
      fields: [
        { type: 'TextField', id: 'accountType' },
        { type: 'TextField', id: 'companyName', groupId: 'companyInfo' },
        { type: 'TextField', id: 'taxNo', groupId: 'companyInfo' }
      ],
      groups: [
        {
          id: 'companyInfo',
          title: 'Company',
          initialVisible: false,
          dependents: ['legacyType'],
          effect: () => ({ visible: false }),
          rules: [
            {
              when: { field: 'accountType', equals: 'company' },
              then: { action: 'show' }
            }
          ]
        }
      ]
    },
    { registry }
  );

  assert.equal(compiled.formConfig.id, 'mixed-form');
  assert.deepEqual(
    compiled.formConfig.fields.map((field) => field.id),
    ['accountType']
  );
  assert.deepEqual(
    compiled.formConfig.groups[0].fields.map((field) => field.id),
    ['companyName', 'taxNo']
  );
  assert.deepEqual(compiled.formConfig.groups[0].dependents, ['legacyType', 'accountType']);
  assert.deepEqual(compiled.formConfig.groups[0].effect(undefined, { accountType: 'company' }), {
    visible: true
  });
  assert.equal(compiled.componentRegistry.TextField, Component);

  const processed = processFormConfig(compiled.formConfig);
  assert.ok(processed.initializedFields.accountType);
  assert.ok(processed.initializedGroupFields.companyInfo.fields.companyName);
});

test('compileFormConfig rejects invalid group membership and ids', () => {
  const registry = new ModuleRegistryManager([
    {
      type: 'TextField',
      createConfig: () => ({ id: 'fromFactory', component: 'TextInput' })
    }
  ]);

  assert.throws(
    () =>
      compileFormConfig(
        { fields: [{ type: 'TextField', id: 'name', groupId: 'missing' }] },
        { registry }
      ),
    /unknown group "missing"/
  );
  assert.throws(
    () => compileFormConfig({ fields: [], groups: [{ id: 'empty', rules: [] }] }, { registry }),
    /group "empty" must contain at least one field/
  );
  assert.throws(
    () =>
      compileFormConfig(
        {
          fields: [{ type: 'TextField', id: 'same', groupId: 'same' }],
          groups: [{ id: 'same' }]
        },
        { registry }
      ),
    /duplicate field or group id "same"/
  );
});

test('compileFormConfig supports a purely grouped module form', () => {
  const registry = new ModuleRegistryManager([
    {
      type: 'TextField',
      createConfig: () => ({ id: 'fromFactory', component: 'TextInput' })
    }
  ]);

  const compiled = compileFormConfig(
    {
      fields: [{ type: 'TextField', id: 'name', groupId: 'profile' }],
      groups: [{ id: 'profile', title: 'Profile' }]
    },
    { registry }
  );

  assert.equal(compiled.formConfig.fields, undefined);
  assert.deepEqual(
    compiled.formConfig.groups[0].fields.map((field) => field.id),
    ['name']
  );
});
