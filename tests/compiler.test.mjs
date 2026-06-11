import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CompiledDynamicForm,
  compileFormConfig,
  ModuleRegistryManager,
  processFormConfig
} from '../dist/index.mjs';

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
    [
      {
        type: 'UserSelector',
        id: 'ownerId',
        options: { label: 'Owner' },
        overrides: {
          required: true,
          componentProps: { placeholder: 'Owner name' }
        }
      }
    ],
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
    () => compileFormConfig([{ type: 'MissingModule', id: 'missingId' }], { registry }),
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
  assert.equal(
    element.props.componentRegistry.customComponents.UserSelector,
    OverrideComponent
  );
  assert.equal(element.props.componentRegistry.customComponents.ExtraField, ExtraComponent);
});

test('compileFormConfig runs hooks in order and wraps hook failures with module context', () => {
  const registry = new ModuleRegistryManager();
  const calls = [];

  registry.register({
    type: 'Department',
    createConfig: () => ({ id: 'departmentId', component: 'Select' })
  });

  const compiled = compileFormConfig([{ type: 'Department', id: 'departmentId' }], {
    registry,
    hooks: {
      beforeCompile: (context) => {
        calls.push(`beforeCompile:${context.moduleConfigs.length}`);
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
  });

  assert.deepEqual(calls, [
    'beforeCompile:1',
    'beforeModuleExpand:Department',
    'afterModuleExpand:departmentId',
    'afterCompile:1'
  ]);
  assert.equal(compiled.formConfig.fields[0].label, 'Department');

  assert.throws(
    () =>
      compileFormConfig([{ type: 'Department', id: 'departmentId' }], {
        registry,
        hooks: {
          beforeModuleExpand: () => {
            throw new Error('blocked');
          }
        }
      }),
    /beforeModuleExpand.*Department.*departmentId.*blocked/
  );
});
