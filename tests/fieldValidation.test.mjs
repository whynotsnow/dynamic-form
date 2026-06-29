import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);

function loadFieldValidationModule() {
  const sourcePath = path.resolve('packages/dynamic-form/src/consumer/render/fieldValidation.ts');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true
    }
  }).outputText;
  const module = { exports: {} };

  vm.runInNewContext(output, {
    exports: module.exports,
    module,
    require
  });

  return module.exports;
}

const { resolveFieldRequired, resolveFieldRules } = loadFieldValidationModule();

function createField(overrides = {}) {
  return {
    id: 'name',
    label: '姓名',
    component: 'TextInput',
    meta: {},
    ...overrides
  };
}

test('resolveFieldRules creates an AntD required rule from field.required', () => {
  const field = createField({ required: true });
  const rules = resolveFieldRules(field, true);

  assert.equal(rules.length, 1);
  assert.equal(rules[0].required, true);
  assert.equal(rules[0].message, '姓名不能为空');
  assert.equal(resolveFieldRequired(field, rules, true), true);
});

test('resolveFieldRules does not duplicate explicit required rules', () => {
  const explicitRequiredRule = { required: true, message: '请输入姓名' };
  const field = createField({
    required: true,
    rules: [explicitRequiredRule, { min: 2, message: '至少两个字符' }]
  });
  const rules = resolveFieldRules(field, true);

  assert.equal(rules, field.rules);
  assert.deepEqual(rules, [explicitRequiredRule, { min: 2, message: '至少两个字符' }]);
  assert.equal(resolveFieldRequired(field, rules, true), true);
});

test('resolveFieldRules removes rules and required marker when field is not validatable', () => {
  const field = createField({
    required: true,
    rules: [{ required: true, message: '请输入姓名' }]
  });
  const rules = resolveFieldRules(field, false);

  assert.equal(rules.length, 0);
  assert.equal(resolveFieldRequired(field, rules, false), false);
});

test('resolveFieldRequired honors explicit required rules when field.required is false', () => {
  const field = createField({
    required: false,
    rules: [{ required: true, message: '请输入姓名' }]
  });
  const rules = resolveFieldRules(field, true);

  assert.equal(rules, field.rules);
  assert.equal(resolveFieldRequired(field, rules, true), true);
});
