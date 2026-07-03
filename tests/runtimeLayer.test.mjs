import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const modulePromise = build({
  entryPoints: [
    'packages/dynamic-form-core/src/runtime/runtimeState.ts',
    'packages/dynamic-form/src/consumer/hooks/fieldParticipationPolicy.ts'
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
    const name = outputFile.path.endsWith('runtimeState.js')
      ? 'runtimeState'
      : 'fieldParticipationPolicy';
    modules[name] = await import(
      `data:text/javascript;base64,${Buffer.from(outputFile.text).toString('base64')}`
    );
  }

  return modules;
});

function createState() {
  const accountType = {
    id: 'accountType',
    component: 'TextInput',
    meta: { behavior: { visible: true } }
  };
  const companyName = {
    id: 'companyName',
    component: 'TextInput',
    meta: { behavior: { visible: true } }
  };
  const taxNo = {
    id: 'taxNo',
    component: 'TextInput',
    meta: { behavior: { visible: true, disabled: true } }
  };

  return {
    fields: {
      accountType
    },
    groupFields: {
      companyInfo: {
        id: 'companyInfo',
        title: 'Company',
        meta: { behavior: { visible: false } },
        fields: {
          companyName,
          taxNo
        }
      }
    },
    nodes: {
      accountType,
      companyInfo: {
        id: 'companyInfo',
        nodeType: 'container',
        title: 'Company',
        meta: { behavior: { visible: false } },
        children: ['companyName', 'taxNo']
      },
      companyName,
      taxNo
    },
    rootNodeIds: ['accountType', 'companyInfo'],
    containerFields: {
      companyInfo: {
        companyName,
        taxNo
      }
    },
    initialized: true,
    configProcessInfo: {
      effectMap: {},
      nodeRegistry: {
        accountType: {
          id: 'accountType',
          nodeType: 'field',
          config: accountType,
          path: ['0']
        },
        companyInfo: {
          id: 'companyInfo',
          nodeType: 'container',
          config: {
            id: 'companyInfo',
            nodeType: 'container',
            title: 'Company',
            children: []
          },
          path: ['1']
        },
        companyName: {
          id: 'companyName',
          nodeType: 'field',
          parentId: 'companyInfo',
          config: companyName,
          path: ['1', '0']
        },
        taxNo: {
          id: 'taxNo',
          nodeType: 'field',
          parentId: 'companyInfo',
          config: taxNo,
          path: ['1', '1']
        }
      },
      containerRegistry: {
        companyInfo: {
          id: 'companyInfo',
          config: {
            id: 'companyInfo',
            nodeType: 'container',
            title: 'Company',
            children: []
          },
          path: ['1']
        }
      },
      fieldRegistry: {
        accountType: { id: 'accountType', isGroupField: false, config: accountType },
        companyInfo: {
          id: 'companyInfo',
          isGroupField: true,
          config: { id: 'companyInfo', fields: [companyName, taxNo] }
        },
        companyName: {
          id: 'companyName',
          isGroupField: true,
          groupId: 'companyInfo',
          config: companyName
        },
        taxNo: {
          id: 'taxNo',
          isGroupField: true,
          groupId: 'companyInfo',
          config: taxNo
        }
      },
      fieldAddressRegistry: {},
      initialValues: {},
      initializedFields: {},
      initializedGroupFields: {},
      initializedNodes: {},
      initializedContainerFields: {},
      rootNodeIds: ['accountType', 'companyInfo']
    },
    staticUIConfig: {},
    dynamicUIConfig: {}
  };
}

test('RuntimeState makes grouped fields non-rendered, non-submitable, and non-validatable when their group is hidden', async () => {
  const { runtimeState } = await modulePromise;
  const result = runtimeState.resolveRuntimeState(createState());

  assert.deepEqual(result.groups.companyInfo, { rendered: false });
  assert.equal(result.fields.companyName.rendered, false);
  assert.equal(result.fields.companyName.submitable, false);
  assert.equal(result.fields.companyName.validatable, false);
  assert.equal(result.fields.accountType.rendered, true);
});

test('RuntimeState keeps disabled grouped fields non-editable and non-validatable when their group becomes visible', async () => {
  const { runtimeState } = await modulePromise;
  const state = createState();
  state.groupFields.companyInfo.meta.behavior.visible = true;
  state.nodes.companyInfo.meta.behavior.visible = true;

  const result = runtimeState.resolveRuntimeState(state);

  assert.equal(result.fields.taxNo.rendered, true);
  assert.equal(result.fields.taxNo.submitable, true);
  assert.equal(result.fields.taxNo.disabled, true);
  assert.equal(result.fields.taxNo.editable, false);
  assert.equal(result.fields.taxNo.validatable, false);
});

test('RuntimeState inherits visibility from ancestor containers', async () => {
  const { runtimeState } = await modulePromise;
  const state = createState();
  const city = {
    id: 'city',
    component: 'TextInput',
    meta: { behavior: { visible: true } }
  };

  state.nodes.companyInfo.meta.behavior.visible = false;
  state.nodes.address = {
    id: 'address',
    nodeType: 'container',
    meta: { behavior: { visible: true } },
    children: ['city']
  };
  state.nodes.city = city;
  state.containerFields.address = { city };
  state.configProcessInfo.nodeRegistry.address = {
    id: 'address',
    nodeType: 'container',
    parentId: 'companyInfo',
    config: { id: 'address', nodeType: 'container', children: [] },
    path: ['1', '2']
  };
  state.configProcessInfo.nodeRegistry.city = {
    id: 'city',
    nodeType: 'field',
    parentId: 'address',
    config: city,
    path: ['1', '2', '0']
  };
  state.configProcessInfo.containerRegistry.address = {
    id: 'address',
    parentId: 'companyInfo',
    config: { id: 'address', nodeType: 'container', children: [] },
    path: ['1', '2']
  };
  state.configProcessInfo.fieldRegistry.city = {
    id: 'city',
    isGroupField: true,
    groupId: 'address',
    config: city
  };

  const result = runtimeState.resolveRuntimeState(state);

  assert.equal(result.groups.address.rendered, false);
  assert.equal(result.fields.city.rendered, false);
});

test('field participation policy preserves hidden values only when explicitly requested and restores by default', async () => {
  const { fieldParticipationPolicy } = await modulePromise;

  assert.deepEqual(fieldParticipationPolicy.resolveFieldParticipationPolicy({}), {
    preserveValueOnHide: false,
    restoreValueOnShow: true
  });
  assert.deepEqual(
    fieldParticipationPolicy.resolveFieldParticipationPolicy({
      preserveValueOnHide: true,
      restoreValueOnShow: false
    }),
    {
      preserveValueOnHide: true,
      restoreValueOnShow: false
    }
  );
});
