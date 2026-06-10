import assert from 'node:assert/strict';
import test from 'node:test';
import {
  adaptModuleConfigs,
  AdapterRegistryManager,
  compileAdaptedFormConfig,
  ModuleConfigPassthroughAdapter,
  ModuleRegistryManager
} from '../dist/index.mjs';

test('AdapterRegistryManager registers, lists, looks up, and unregisters adapters', () => {
  const registry = new AdapterRegistryManager();
  const adapter = {
    type: 'custom',
    supports: (input) => input === 'custom',
    adapt: () => [{ type: 'TextInputModule', id: 'name' }]
  };

  registry.register(adapter);

  assert.equal(registry.has('custom'), true);
  assert.equal(registry.get('custom'), adapter);
  assert.deepEqual(registry.list(), [adapter]);
  assert.equal(registry.unregister('custom'), true);
  assert.equal(registry.has('custom'), false);
});

test('AdapterRegistryManager rejects duplicate adapters unless override is explicit', () => {
  const registry = new AdapterRegistryManager();
  const first = {
    type: 'custom',
    supports: () => true,
    adapt: () => [{ type: 'TextInputModule', id: 'first' }]
  };
  const second = {
    type: 'custom',
    supports: () => true,
    adapt: () => [{ type: 'TextInputModule', id: 'second' }]
  };

  registry.register(first);

  assert.throws(() => registry.register(second), /already registered/);

  registry.register(second, { override: true });
  assert.equal(registry.get('custom'), second);
});

test('ModuleConfigPassthroughAdapter adapts ModuleConfig arrays without changing them', () => {
  const moduleConfigs = [{ type: 'TextInputModule', id: 'name', options: { label: 'Name' } }];
  const registry = new AdapterRegistryManager([ModuleConfigPassthroughAdapter]);

  const adapted = adaptModuleConfigs(moduleConfigs, { registry });

  assert.equal(adapted, moduleConfigs);
  assert.deepEqual(adapted, moduleConfigs);
});

test('adaptModuleConfigs reports missing and unsupported adapters', () => {
  const registry = new AdapterRegistryManager([ModuleConfigPassthroughAdapter]);

  assert.throws(
    () => adaptModuleConfigs({ fields: [] }, { registry }),
    /no adapter supports input object/
  );
  assert.throws(
    () => adaptModuleConfigs([], { registry, adapterType: 'missing' }),
    /adapter type "missing" is not registered/
  );
  assert.throws(
    () => adaptModuleConfigs({ fields: [] }, { registry, adapterType: 'module-config' }),
    /adapter type "module-config" does not support input object/
  );
});

test('ModuleConfigPassthroughAdapter validates shallow ModuleConfig structure', () => {
  assert.throws(() => ModuleConfigPassthroughAdapter.adapt([{ id: 'name' }]), /non-empty type/);
  assert.throws(
    () => ModuleConfigPassthroughAdapter.adapt([{ type: 'TextInputModule' }]),
    /non-empty id/
  );
});

test('compileAdaptedFormConfig adapts input before using the module compiler', () => {
  const moduleRegistry = new ModuleRegistryManager();
  const Component = () => null;

  moduleRegistry.register({
    type: 'UserSelector',
    component: Component,
    dependencies: ['departmentId'],
    defaultProps: { allowClear: true },
    createConfig: (options) => ({
      id: 'fromFactory',
      label: options.label,
      component: 'Select',
      componentProps: { placeholder: 'Choose user' }
    })
  });

  const compiled = compileAdaptedFormConfig(
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
    { moduleRegistry }
  );

  assert.equal(compiled.componentRegistry.UserSelector, Component);
  assert.equal(compiled.formConfig.fields.length, 1);
  assert.equal(compiled.formConfig.fields[0].id, 'ownerId');
  assert.equal(compiled.formConfig.fields[0].label, 'Owner');
  assert.equal(compiled.formConfig.fields[0].required, true);
  assert.deepEqual(compiled.formConfig.fields[0].dependents, ['departmentId']);
  assert.deepEqual(compiled.formConfig.fields[0].componentProps, {
    allowClear: true,
    placeholder: 'Owner name'
  });
});
