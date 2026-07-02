import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compileFormConfig,
  createRuleEngine,
  evaluateRule,
  ModuleRegistryManager
} from '../packages/dynamic-form-core/dist/index.mjs';

test('RuleEngine evaluates field conditions and default target actions', () => {
  assert.deepEqual(
    evaluateRule(
      {
        when: { field: 'type', equals: 'company' },
        then: { action: 'show' }
      },
      { fieldId: 'companyName', values: { type: 'company' } }
    ),
    { visible: true }
  );

  assert.deepEqual(
    evaluateRule(
      {
        when: { field: 'type', notEquals: 'person' },
        then: [{ action: 'disable' }, { action: 'readonly' }]
      },
      { fieldId: 'companyName', values: { type: 'company' } }
    ),
    { disabled: true, readonly: true }
  );

  assert.deepEqual(
    evaluateRule(
      {
        when: { field: 'name', empty: true },
        then: { action: 'clearValue' }
      },
      { fieldId: 'alias', values: { name: '' } }
    ),
    { value: undefined }
  );

  assert.deepEqual(
    evaluateRule(
      {
        when: { field: 'name', notEmpty: true },
        then: { action: 'setValue', value: 'ready' }
      },
      { fieldId: 'status', values: { name: 'Snow' } }
    ),
    { value: 'ready' }
  );
});

test('RuleEngine evaluates composed conditions, skips disabled rules, and merges in order', () => {
  const engine = createRuleEngine();
  const result = engine.evaluate(
    [
      {
        when: {
          all: [
            { field: 'type', equals: 'company' },
            { field: 'country', notEmpty: true }
          ]
        },
        then: { action: 'show' }
      },
      {
        when: {
          any: [
            { field: 'level', equals: 'blocked' },
            { field: 'locked', equals: true }
          ]
        },
        then: { action: 'disable' }
      },
      {
        enabled: false,
        when: { field: 'type', equals: 'company' },
        then: { action: 'hide' }
      },
      {
        when: { not: { field: 'readonly', equals: true } },
        then: { action: 'editable' }
      }
    ],
    {
      fieldId: 'companyName',
      values: { type: 'company', country: 'CN', level: 'normal', locked: true, readonly: false }
    }
  );

  assert.deepEqual(result, {
    visible: true,
    disabled: true,
    readonly: false
  });
});

test('RuleEngine rejects target configuration because rules are field-owned', () => {
  const engine = createRuleEngine();

  assert.throws(
    () =>
      evaluateRule(
        {
          target: 'otherField',
          when: { field: 'type', equals: 'company' },
          then: { action: 'show' }
        },
        { fieldId: 'companyName', values: { type: 'company' } }
      ),
    /rule target is not supported/
  );

  assert.throws(
    () =>
      evaluateRule(
        {
          when: { field: 'type', equals: 'company' },
          then: { action: 'show', target: 'otherField' }
        },
        { fieldId: 'companyName', values: { type: 'company' } }
      ),
    /rule action target is not supported/
  );

  assert.throws(
    () =>
      engine.evaluate(
        [
          {
            target: 'otherField',
            when: { field: 'type', equals: 'company' },
            then: { action: 'show' }
          }
        ],
        { fieldId: 'companyName', values: { type: 'company' } }
      ),
    /rule target is not supported/
  );
});

test('compileFormConfig compiles module and instance rules into field effect and dependents', () => {
  const registry = new ModuleRegistryManager();

  registry.register({
    type: 'CompanyName',
    dependencies: ['legacyDependency'],
    effect: () => ({ visible: false, disabled: false }),
    rules: [
      {
        when: { field: 'type', equals: 'company' },
        then: { action: 'show' }
      }
    ],
    createConfig: () => ({
      id: 'fromFactory',
      component: 'TextInput',
      dependents: ['region']
    })
  });

  const compiled = compileFormConfig(
    {
      fields: [
        {
          type: 'CompanyName',
          id: 'companyName',
          rules: [
            {
              when: { field: 'locked', equals: true },
              then: { action: 'disable' }
            }
          ]
        }
      ]
    },
    { registry }
  );

  const [field] = compiled.formConfig.fields;

  assert.deepEqual(field.dependents, ['legacyDependency', 'region', 'type', 'locked']);
  assert.deepEqual(field.effect(undefined, { type: 'company', locked: true }), {
    visible: true,
    disabled: true
  });
});

test('compileFormConfig models one source affecting multiple fields as multiple field-owned effects', () => {
  const registry = new ModuleRegistryManager();

  registry.register({
    type: 'TextRuleField',
    createConfig: () => ({
      id: 'fromFactory',
      component: 'TextInput'
    })
  });

  const compiled = compileFormConfig(
    {
      fields: [
        {
          type: 'TextRuleField',
          id: 'companyName',
          rules: [
            {
              when: { field: 'customerType', equals: 'company' },
              then: { action: 'show' }
            }
          ]
        },
        {
          type: 'TextRuleField',
          id: 'taxNo',
          rules: [
            {
              when: { field: 'customerType', equals: 'company' },
              then: { action: 'show' }
            }
          ]
        }
      ]
    },
    { registry }
  );

  const [companyName, taxNo] = compiled.formConfig.fields;

  assert.deepEqual(companyName.dependents, ['customerType']);
  assert.deepEqual(taxNo.dependents, ['customerType']);
  assert.deepEqual(companyName.effect(undefined, { customerType: 'company' }), { visible: true });
  assert.deepEqual(taxNo.effect(undefined, { customerType: 'company' }), { visible: true });
});

test('compileFormConfig keeps unregistered module errors', () => {
  const registry = new ModuleRegistryManager();

  assert.throws(
    () =>
      compileFormConfig({ fields: [{ type: 'MissingRuleModule', id: 'target' }] }, { registry }),
    /MissingRuleModule.*target/
  );
});
