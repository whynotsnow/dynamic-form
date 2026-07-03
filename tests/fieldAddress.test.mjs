import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const modulePromise = build({
  entryPoints: [
    'packages/dynamic-form-core/src/config/processor/configParser.ts',
    'packages/dynamic-form-core/src/shared/utils/fieldAddress.ts'
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
    const name = outputFile.path.endsWith('configParser.js') ? 'configParser' : 'fieldAddress';
    modules[name] = await import(
      `data:text/javascript;base64,${Buffer.from(outputFile.text).toString('base64')}`
    );
  }

  return modules;
});

test('field address defaults name to id for backward compatibility', async () => {
  const { fieldAddress } = await modulePromise;

  assert.deepEqual(fieldAddress.resolveFieldAddress({ id: 'username' }), {
    id: 'username',
    name: 'username'
  });
});

test('processFormConfig builds nested initial values and an address registry', async () => {
  const { configParser } = await modulePromise;
  const result = configParser.processFormConfig({
    fields: [
      {
        id: 'shippingCity',
        name: ['shipping', 'city'],
        component: 'TextInput',
        initialValue: 'Shanghai'
      },
      {
        id: 'legacyName',
        component: 'TextInput',
        initialValue: 'Ada'
      },
      {
        id: 'shippingLabel',
        name: ['shipping', 'label'],
        component: 'TextInput',
        initialValue: (values) => `${values.shippingCity} delivery`
      }
    ]
  });

  assert.deepEqual(result.initialValues, {
    shipping: { city: 'Shanghai', label: 'Shanghai delivery' },
    legacyName: 'Ada'
  });
  assert.deepEqual(result.fieldAddressRegistry.shippingCity, {
    id: 'shippingCity',
    name: ['shipping', 'city']
  });
  assert.deepEqual(result.fieldAddressRegistry.legacyName, {
    id: 'legacyName',
    name: 'legacyName'
  });
});

test('processFormConfig supports grouped fields with nested name paths', async () => {
  const { configParser } = await modulePromise;
  const result = configParser.processFormConfig({
    fields: [
      {
        id: 'customerType',
        name: ['customer', 'type'],
        component: 'TextInput',
        initialValue: 'company'
      }
    ],
    groups: [
      {
        id: 'companyInfo',
        fields: [
          {
            id: 'companyName',
            name: ['company', 'name'],
            component: 'TextInput',
            initialValue: (values) => `${values.customerType}: Snow Ltd`
          }
        ]
      }
    ]
  });

  assert.deepEqual(result.initialValues, {
    customer: { type: 'company' },
    company: { name: 'company: Snow Ltd' }
  });
  assert.deepEqual(result.fieldAddressRegistry.companyName, {
    id: 'companyName',
    name: ['company', 'name']
  });
  assert.ok(result.initializedGroupFields.companyInfo.fields.companyName);
});

test('processFormConfig applies default object initialValue results in core', async () => {
  const { configParser } = await modulePromise;
  const result = configParser.processFormConfig({
    fields: [
      {
        id: 'status',
        component: 'TextInput',
        initialValue: () => ({
          value: 'ready',
          visible: false,
          disabled: true,
          readonly: true,
          formItemProps: { labelCol: { span: 6 } },
          componentProps: { placeholder: 'Status' },
          groupsVisible: { profile: false }
        })
      }
    ],
    groups: [
      {
        id: 'profile',
        fields: [{ id: 'name', component: 'TextInput' }]
      }
    ]
  });

  assert.deepEqual(result.initialValues, { status: 'ready' });
  assert.deepEqual(result.initializedFields.status.meta, {
    behavior: { visible: false, disabled: true, readonly: true },
    formItemProps: { labelCol: { span: 6 } },
    componentProps: { placeholder: 'Status' }
  });
  assert.equal(result.initializedGroupFields.profile.meta.behavior.visible, false);
  assert.equal(result.initializedNodes.profile.meta.behavior.visible, false);
});

test('processFormConfig lets callers handle object initialValue results', async () => {
  const { configParser } = await modulePromise;
  const calls = [];
  const result = configParser.processFormConfig(
    {
      fields: [
        {
          id: 'status',
          component: 'TextInput',
          initialValue: () => ({ customValue: 'ready', visible: false })
        }
      ]
    },
    {
      applyInitialEffectResult: ({
        field,
        result: effectResult,
        initialValues,
        initializedFields,
        fieldRegistry,
        fieldAddressRegistry
      }) => {
        calls.push({
          fieldId: field.id,
          result: effectResult,
          hasFieldState: Boolean(initializedFields[field.id]),
          registryName: fieldAddressRegistry[field.id].name,
          isGroupField: fieldRegistry[field.id].isGroupField
        });
        initialValues[field.id] = effectResult.customValue;
        initializedFields[field.id].meta = {
          ...initializedFields[field.id].meta,
          customMeta: true
        };
      }
    }
  );

  assert.deepEqual(calls, [
    {
      fieldId: 'status',
      result: { customValue: 'ready', visible: false },
      hasFieldState: true,
      registryName: 'status',
      isGroupField: false
    }
  ]);
  assert.deepEqual(result.initialValues, { status: 'ready' });
  assert.deepEqual(result.initializedFields.status.meta, {
    behavior: { visible: true },
    customMeta: true
  });
});

test('field address registry rejects duplicate Ant Design name paths', async () => {
  const { configParser } = await modulePromise;

  assert.throws(
    () =>
      configParser.processFormConfig({
        fields: [
          { id: 'billingCity', name: ['address', 'city'], component: 'TextInput' },
          { id: 'shippingCity', name: ['address', 'city'], component: 'TextInput' }
        ]
      }),
    /use the same name path/
  );
});

test('field address registry rejects duplicate name paths across flat and grouped fields', async () => {
  const { configParser } = await modulePromise;

  assert.throws(
    () =>
      configParser.processFormConfig({
        fields: [{ id: 'billingCity', name: ['address', 'city'], component: 'TextInput' }],
        groups: [
          {
            id: 'shippingGroup',
            fields: [
              { id: 'shippingCity', name: ['address', 'city'], component: 'TextInput' }
            ]
          }
        ]
      }),
    /use the same name path/
  );
});

test('processFormConfig rejects duplicate node ids', async () => {
  const { configParser } = await modulePromise;

  assert.throws(
    () =>
      configParser.processFormConfig({
        fields: [{ id: 'profile', component: 'TextInput' }],
        groups: [{ id: 'profile', fields: [{ id: 'companyName', component: 'TextInput' }] }]
      }),
    /duplicate node id "profile"/
  );
});

test('processFormConfig supports nested container nodes and cross-level dependents', async () => {
  const { configParser } = await modulePromise;
  const result = configParser.processFormConfig({
    nodes: [
      {
        nodeType: 'container',
        id: 'profile',
        name: 'profile',
        dependents: ['city'],
        children: [
          {
            nodeType: 'container',
            id: 'address',
            name: 'address',
            children: [
              {
                nodeType: 'field',
                id: 'city',
                component: 'TextInput',
                initialValue: 'Shanghai'
              }
            ]
          }
        ]
      }
    ]
  });

  assert.deepEqual(result.initialValues, {
    profile: {
      address: {
        city: 'Shanghai'
      }
    }
  });
  assert.deepEqual(result.fieldAddressRegistry.city, {
    id: 'city',
    name: ['profile', 'address', 'city']
  });
  assert.deepEqual(result.effectMap.profile.dependents, ['city']);
  assert.deepEqual(result.rootNodeIds, ['profile']);
  assert.deepEqual(result.initializedNodes.profile.children, ['address']);
});

test('processFormConfig validates node graph shape', async () => {
  const { configParser } = await modulePromise;

  assert.throws(
    () =>
      configParser.processFormConfig({
        nodes: [
          {
            nodeType: 'container',
            id: 'empty',
            children: []
          }
        ]
      }),
    /container "empty" must contain at least one child/
  );

  assert.throws(
    () =>
      configParser.processFormConfig({
        nodes: [
          {
            nodeType: 'container',
            id: 'items',
            repeatable: true,
            children: [{ nodeType: 'field', id: 'name', component: 'TextInput' }]
          }
        ]
      }),
    /repeatable container "items" must declare name/
  );

  assert.throws(
    () =>
      configParser.processFormConfig({
        nodes: [
          {
            nodeType: 'field',
            id: 'source',
            component: 'TextInput',
            dependents: ['missing']
          }
        ]
      }),
    /references unknown dependent "missing"/
  );
});

test('nested changed values map back to stable effect and runtime ids', async () => {
  const { fieldAddress } = await modulePromise;
  const registry = {
    shippingCity: { id: 'shippingCity', name: ['shipping', 'city'] },
    billingCity: { id: 'billingCity', name: ['billing', 'city'] }
  };

  assert.deepEqual(fieldAddress.getChangedFieldIds({ shipping: { city: 'Suzhou' } }, registry), [
    'shippingCity'
  ]);
});

test('mergeFormValues preserves nested initial siblings while edit values override leaves', async () => {
  const { fieldAddress } = await modulePromise;

  assert.deepEqual(
    fieldAddress.mergeFormValues(
      { shipping: { city: 'Shanghai', country: 'CN' } },
      { shipping: { city: 'Suzhou' } }
    ),
    { shipping: { city: 'Suzhou', country: 'CN' } }
  );
});

test('effect value view preserves nested values and exposes stable id aliases', async () => {
  const { fieldAddress } = await modulePromise;
  const values = { shipping: { city: 'Suzhou' } };

  assert.deepEqual(
    fieldAddress.createFieldValueView(values, {
      shippingCity: { id: 'shippingCity', name: ['shipping', 'city'] }
    }),
    {
      shipping: { city: 'Suzhou' },
      shippingCity: 'Suzhou'
    }
  );
});
