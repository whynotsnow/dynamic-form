import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const modulePromise = build({
  entryPoints: [
    'packages/dynamic-form/src/config/processor/configParser.ts',
    'packages/dynamic-form/src/shared/utils/fieldAddress.ts'
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
