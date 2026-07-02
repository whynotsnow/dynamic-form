import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const modulePromise = build({
  entryPoints: [
    'packages/dynamic-form-core/src/config/diagnostics.ts',
    'packages/dynamic-form-core/src/config/processor/configParser.ts',
    'packages/dynamic-form-core/src/runtime/runtimeState.ts',
    'packages/dynamic-form-core/src/runtime/inspection.ts'
  ],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'silent',
  outdir: 'out',
  external: ['antd', 'react', 'form-chain-effect-engine']
}).then(async ({ outputFiles }) => {
  const modules = {};

  for (const outputFile of outputFiles) {
    const name = outputFile.path.endsWith('diagnostics.js')
      ? 'diagnostics'
      : outputFile.path.endsWith('configParser.js')
        ? 'configParser'
        : outputFile.path.endsWith('runtimeState.js')
          ? 'runtimeState'
          : 'inspection';
    modules[name] = await import(
      `data:text/javascript;base64,${Buffer.from(outputFile.text).toString('base64')}`
    );
  }

  return modules;
});

test('getFormConfigDiagnostics reports structural errors and component warnings', async () => {
  const { diagnostics } = await modulePromise;
  const result = diagnostics.getFormConfigDiagnostics({
    fields: [
      { id: 'name', name: ['profile', 'name'], component: 'TextInput' },
      { id: 'name', name: ['profile', 'name'], component: 'UnknownWidget' }
    ],
    nodes: [
      {
        nodeType: 'container',
        id: 'contacts',
        repeatable: true,
        children: []
      }
    ]
  });

  assert.deepEqual(
    result.map((item) => item.code),
    [
      'EMPTY_CONTAINER',
      'REPEATABLE_NAME_REQUIRED',
      'DUPLICATE_ID',
      'DUPLICATE_NAME',
      'UNKNOWN_COMPONENT'
    ]
  );
  assert.equal(result.filter((item) => item.severity === 'error').length, 4);
  assert.equal(result.filter((item) => item.severity === 'warning').length, 1);
});

test('validateFormConfig returns valid false only for error diagnostics', async () => {
  const { diagnostics } = await modulePromise;
  const warningOnly = diagnostics.validateFormConfig(
    {
      fields: [{ id: 'custom', component: 'ProjectSelect' }]
    },
    { knownComponents: ['ProjectSelect'] }
  );

  assert.equal(warningOnly.valid, true);
  assert.deepEqual(warningOnly.diagnostics, []);

  const invalid = diagnostics.validateFormConfig({
    nodes: [{ nodeType: 'container', id: 'empty', children: [] }]
  });

  assert.equal(invalid.valid, false);
  assert.equal(invalid.diagnostics[0].code, 'EMPTY_CONTAINER');
});

test('designer metadata is preserved but ignored by Runtime capability', async () => {
  const { configParser, runtimeState } = await modulePromise;
  const configProcessInfo = configParser.processFormConfig({
    fields: [
      {
        id: 'name',
        component: 'TextInput',
        designer: { title: '姓名', category: 'basic', locked: true }
      }
    ]
  });
  const state = {
    fields: configProcessInfo.initializedFields,
    groupFields: configProcessInfo.initializedGroupFields,
    nodes: configProcessInfo.initializedNodes,
    rootNodeIds: configProcessInfo.rootNodeIds,
    containerFields: configProcessInfo.initializedContainerFields,
    initialized: true,
    configProcessInfo,
    staticUIConfig: {},
    dynamicUIConfig: {}
  };
  const resolvedRuntime = runtimeState.resolveRuntimeState(state);

  assert.deepEqual(configProcessInfo.initializedFields.name.designer, {
    title: '姓名',
    category: 'basic',
    locked: true
  });
  assert.equal(resolvedRuntime.fields.name.rendered, true);
  assert.equal(Object.hasOwn(resolvedRuntime.fields.name, 'designer'), false);
});

test('runtime inspection helpers expose rendered submitable and validatable ids', async () => {
  const { configParser, runtimeState, inspection } = await modulePromise;
  const configProcessInfo = configParser.processFormConfig({
    fields: [
      { id: 'visible', component: 'TextInput' },
      { id: 'hidden', component: 'TextInput', initialVisible: false }
    ]
  });
  const state = {
    fields: configProcessInfo.initializedFields,
    groupFields: configProcessInfo.initializedGroupFields,
    nodes: configProcessInfo.initializedNodes,
    rootNodeIds: configProcessInfo.rootNodeIds,
    containerFields: configProcessInfo.initializedContainerFields,
    initialized: true,
    configProcessInfo,
    staticUIConfig: {},
    dynamicUIConfig: {}
  };
  const resolvedRuntime = runtimeState.resolveRuntimeState(state);

  assert.deepEqual(inspection.getRenderedFieldIds(resolvedRuntime), ['visible']);
  assert.deepEqual(inspection.getSubmitableFieldIds(resolvedRuntime), ['visible']);
  assert.deepEqual(inspection.getValidatableFieldIds(resolvedRuntime), ['visible']);
  assert.deepEqual(inspection.getFieldRuntimeSnapshot(resolvedRuntime, 'hidden'), {
    rendered: false,
    submitable: false,
    editable: false,
    readonly: false,
    disabled: false,
    validatable: false
  });
});
