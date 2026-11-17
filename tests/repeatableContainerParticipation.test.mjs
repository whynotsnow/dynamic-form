import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const modulePromise = build({
  entryPoints: [
    'packages/dynamic-form-core/src/config/processor/configParser.ts',
    'packages/dynamic-form-core/src/runtime/runtimeState.ts',
    'demos/nodeModel4DemoConfig.ts',
    'packages/dynamic-form/src/consumer/hooks/repeatableContainerParticipation.ts'
  ],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'silent',
  outdir: 'out',
  external: ['antd', 'react', '@whynotsnow/hooks']
}).then(async ({ outputFiles }) => {
  const modules = {};

  for (const outputFile of outputFiles) {
    const name = outputFile.path.endsWith('configParser.js')
      ? 'configParser'
      : outputFile.path.endsWith('runtimeState.js')
        ? 'runtimeState'
        : outputFile.path.endsWith('nodeModel4DemoConfig.js')
          ? 'demoConfig'
          : 'participation';
    modules[name] = await import(
      `data:text/javascript;base64,${Buffer.from(outputFile.text).toString('base64')}`
    );
  }

  return modules;
});

function createAdapter(initialValues) {
  const values = structuredClone(initialValues);

  return {
    values,
    getFieldValue(name) {
      return name.reduce((value, segment) => value?.[segment], values);
    },
    setFieldValue(name, nextValue) {
      const parent = name.slice(0, -1).reduce((value, segment) => value[segment], values);
      parent[name.at(-1)] = nextValue;
    }
  };
}

test('hidden repeatable containers are omitted from values and restored when shown', async () => {
  const { configParser, demoConfig, runtimeState, participation } = await modulePromise;
  const configProcessInfo = configParser.processFormConfig(demoConfig.nodeModel4DemoConfig);
  const state = {
    fields: configProcessInfo.initializedFields,
    groupFields: configProcessInfo.initializedGroupFields,
    nodes: configProcessInfo.initializedNodes,
    containerFields: configProcessInfo.initializedContainerFields,
    rootNodeIds: configProcessInfo.rootNodeIds,
    initialized: true,
    configProcessInfo,
    staticUIConfig: {},
    dynamicUIConfig: {}
  };
  const contactRows = structuredClone(demoConfig.nodeModel4DemoValues.contacts);
  const formAdapter = createAdapter({ contacts: contactRows });
  const previousRendered = {};
  const hiddenValueCache = {};

  participation.synchronizeRepeatableContainerParticipation(
    formAdapter,
    state,
    runtimeState.resolveRuntimeState(state),
    previousRendered,
    hiddenValueCache
  );

  state.nodes.contacts.meta.behavior.visible = false;
  participation.synchronizeRepeatableContainerParticipation(
    formAdapter,
    state,
    runtimeState.resolveRuntimeState(state),
    previousRendered,
    hiddenValueCache
  );

  assert.equal(formAdapter.getFieldValue(['contacts']), undefined);
  assert.deepEqual(hiddenValueCache.contacts, contactRows);

  state.nodes.contacts.meta.behavior.visible = true;
  participation.synchronizeRepeatableContainerParticipation(
    formAdapter,
    state,
    runtimeState.resolveRuntimeState(state),
    previousRendered,
    hiddenValueCache
  );

  assert.deepEqual(formAdapter.getFieldValue(['contacts']), contactRows);
  assert.equal(Object.hasOwn(hiddenValueCache, 'contacts'), false);
});

test('initially hidden nested repeatable containers clear and restore their list path', async () => {
  const { configParser, runtimeState, participation } = await modulePromise;
  const configProcessInfo = configParser.processFormConfig({
    nodes: [
      {
        nodeType: 'container',
        id: 'company',
        name: 'company',
        children: [
          {
            nodeType: 'container',
            id: 'contacts',
            name: 'contacts',
            repeatable: true,
            initialVisible: false,
            children: [{ nodeType: 'field', id: 'contactName', component: 'TextInput' }]
          }
        ]
      }
    ]
  });
  const state = {
    fields: configProcessInfo.initializedFields,
    groupFields: configProcessInfo.initializedGroupFields,
    nodes: configProcessInfo.initializedNodes,
    containerFields: configProcessInfo.initializedContainerFields,
    rootNodeIds: configProcessInfo.rootNodeIds,
    initialized: true,
    configProcessInfo,
    staticUIConfig: {},
    dynamicUIConfig: {}
  };
  const contactRows = [{ contactName: 'Ada' }];
  const formAdapter = createAdapter({ company: { contacts: structuredClone(contactRows) } });
  const previousRendered = {};
  const hiddenValueCache = {};

  assert.equal(participation.isInsideRepeatableContainer('contactName', state), true);
  participation.synchronizeRepeatableContainerParticipation(
    formAdapter,
    state,
    runtimeState.resolveRuntimeState(state),
    previousRendered,
    hiddenValueCache
  );
  assert.equal(formAdapter.getFieldValue(['company', 'contacts']), undefined);

  state.nodes.contacts.meta.behavior.visible = true;
  participation.synchronizeRepeatableContainerParticipation(
    formAdapter,
    state,
    runtimeState.resolveRuntimeState(state),
    previousRendered,
    hiddenValueCache
  );
  assert.deepEqual(formAdapter.getFieldValue(['company', 'contacts']), contactRows);
});
