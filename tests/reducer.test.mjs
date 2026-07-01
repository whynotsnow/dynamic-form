import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const reducerModulePromise = build({
  entryPoints: ['packages/dynamic-form/src/state/reducer.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'silent'
}).then(async ({ outputFiles }) => {
  const source = outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
});

async function getReducer() {
  const module = await reducerModulePromise;
  return module.default;
}

function createState() {
  return {
    fields: {
      name: {
        id: 'name',
        component: 'TextInput',
        meta: {
          behavior: { visible: true },
          componentProps: { placeholder: 'Name' }
        }
      }
    },
    groupFields: {
      profile: {
        id: 'profile',
        title: 'Profile',
        meta: { behavior: { visible: true }, layout: 'horizontal' },
        fields: {
          age: {
            id: 'age',
            component: 'NumberInput',
            meta: { behavior: { disabled: false } }
          }
        }
      }
    },
    initialized: false,
    configProcessInfo: {
      effectMap: {},
      fieldRegistry: {
        name: { isGroupField: false },
        age: { isGroupField: true, groupId: 'profile' }
      },
      initializedFields: {},
      initializedGroupFields: {},
      computedInitialValues: {}
    },
    staticUIConfig: {
      rowProps: { gutter: 16, align: 'top' },
      buttonProps: { type: 'primary' }
    },
    dynamicUIConfig: {}
  };
}

test('INIT replaces processed state branches without mutating the previous state', async () => {
  const reducer = await getReducer();
  const state = createState();
  const initializedFields = { email: { id: 'email', component: 'TextInput', meta: {} } };
  const initializedGroupFields = {};
  const configProcessInfo = {
    ...state.configProcessInfo,
    initializedFields,
    initializedGroupFields
  };

  const next = reducer(state, { type: 'INIT', payload: { configProcessInfo } });

  assert.notStrictEqual(next, state);
  assert.strictEqual(next.fields, initializedFields);
  assert.strictEqual(next.groupFields, initializedGroupFields);
  assert.strictEqual(next.configProcessInfo, configProcessInfo);
  assert.equal(next.initialized, true);
  assert.strictEqual(next.staticUIConfig, state.staticUIConfig);
  assert.strictEqual(next.dynamicUIConfig, state.dynamicUIConfig);
  assert.equal(state.initialized, false);
});

test('UPDATE_META immutably updates a flat field and normalizes legacy behavior keys', async () => {
  const reducer = await getReducer();
  const state = createState();

  const next = reducer(state, {
    type: 'UPDATE_META',
    payload: {
      fieldId: 'name',
      meta: { visible: false, componentProps: { maxLength: 20 } }
    }
  });

  assert.deepEqual(next.fields.name.meta, {
    behavior: { visible: false },
    componentProps: { placeholder: 'Name', maxLength: 20 }
  });
  assert.notStrictEqual(next, state);
  assert.notStrictEqual(next.fields, state.fields);
  assert.notStrictEqual(next.fields.name, state.fields.name);
  assert.strictEqual(next.groupFields, state.groupFields);
  assert.deepEqual(state.fields.name.meta, {
    behavior: { visible: true },
    componentProps: { placeholder: 'Name' }
  });
});

test('UPDATE_META immutably updates only the targeted grouped field', async () => {
  const reducer = await getReducer();
  const state = createState();

  const next = reducer(state, {
    type: 'UPDATE_META',
    payload: { fieldId: 'age', meta: { behavior: { disabled: true }, readonly: true } }
  });

  assert.deepEqual(next.groupFields.profile.fields.age.meta, {
    behavior: { disabled: true, readonly: true }
  });
  assert.strictEqual(next.fields, state.fields);
  assert.notStrictEqual(next.groupFields, state.groupFields);
  assert.notStrictEqual(next.groupFields.profile, state.groupFields.profile);
  assert.notStrictEqual(next.groupFields.profile.fields, state.groupFields.profile.fields);
  assert.equal(state.groupFields.profile.fields.age.meta.behavior.disabled, false);
});

test('SET_GROUP_META merges metadata immutably and normalizes legacy visibility', async () => {
  const reducer = await getReducer();
  const state = createState();

  const next = reducer(state, {
    type: 'SET_GROUP_META',
    payload: { groupId: 'profile', meta: { visible: false, layout: 'vertical' } }
  });

  assert.deepEqual(next.groupFields.profile.meta, {
    behavior: { visible: false },
    layout: 'vertical'
  });
  assert.strictEqual(next.fields, state.fields);
  assert.equal(state.groupFields.profile.meta.behavior.visible, true);
  assert.equal(state.groupFields.profile.meta.layout, 'horizontal');
});

test('UPDATE_DYNAMIC_UICONFIG shallow-merges each config section without mutation', async () => {
  const reducer = await getReducer();
  const state = createState();

  const next = reducer(state, {
    type: 'UPDATE_DYNAMIC_UICONFIG',
    payload: {
      config: {
        rowProps: { gutter: 24 },
        buttonProps: { danger: true },
        submitAreaProps: { className: 'actions' }
      }
    }
  });

  assert.deepEqual(next.dynamicUIConfig, {
    rowProps: { gutter: 24 },
    buttonProps: { danger: true },
    submitAreaProps: { className: 'actions' }
  });
  assert.notStrictEqual(next.dynamicUIConfig, state.dynamicUIConfig);
  assert.strictEqual(next.staticUIConfig, state.staticUIConfig);
  assert.deepEqual(state.staticUIConfig, {
    rowProps: { gutter: 16, align: 'top' },
    buttonProps: { type: 'primary' }
  });
  assert.deepEqual(state.dynamicUIConfig, {});
});

test('invalid or empty updates return the original state reference', async (t) => {
  const reducer = await getReducer();
  const state = createState();
  const warn = t.mock.method(console, 'warn', () => {});
  const error = t.mock.method(console, 'error', () => {});

  assert.strictEqual(
    reducer(state, { type: 'UPDATE_META', payload: { fieldId: 'missing', meta: {} } }),
    state
  );
  assert.strictEqual(
    reducer(state, { type: 'UPDATE_META', payload: { fieldId: 'name', meta: undefined } }),
    state
  );
  assert.strictEqual(
    reducer(state, { type: 'SET_GROUP_META', payload: { groupId: 'missing', meta: {} } }),
    state
  );
  assert.strictEqual(
    reducer(state, { type: 'UPDATE_DYNAMIC_UICONFIG', payload: { config: undefined } }),
    state
  );
  assert.strictEqual(reducer(state, { type: 'UNKNOWN' }), state);
  assert.equal(warn.mock.callCount(), 1);
  assert.equal(error.mock.callCount(), 1);
});
