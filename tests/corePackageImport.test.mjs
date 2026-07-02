import assert from 'node:assert/strict';
import test from 'node:test';

import {
  compileFormConfig as compileFromCore,
  processFormConfig as processFromCore,
  validateFormConfig as validateFromCore
} from '../packages/dynamic-form-core/dist/index.mjs';
import {
  compileFormConfig as compileFromDynamicForm,
  DynamicForm,
  processFormConfig as processFromDynamicForm,
  validateFormConfig as validateFromDynamicForm
} from '../packages/dynamic-form/dist/index.mjs';

test('core package exports pure configuration APIs', () => {
  const validation = validateFromCore({
    fields: [{ id: 'name', component: 'TextInput' }]
  });
  const processed = processFromCore({
    fields: [{ id: 'name', component: 'TextInput' }]
  });

  assert.equal(typeof compileFromCore, 'function');
  assert.equal(validation.valid, true);
  assert.equal(Object.hasOwn(processed.fieldRegistry, 'name'), true);
});

test('dynamic-form keeps compatible exports for core APIs and React entry', () => {
  const validation = validateFromDynamicForm({
    fields: [{ id: 'email', component: 'TextInput' }]
  });
  const processed = processFromDynamicForm({
    fields: [{ id: 'email', component: 'TextInput' }]
  });

  assert.equal(typeof DynamicForm, 'function');
  assert.equal(typeof compileFromDynamicForm, 'function');
  assert.equal(validation.valid, true);
  assert.equal(Object.hasOwn(processed.fieldRegistry, 'email'), true);
});
