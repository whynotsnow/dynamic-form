import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const modulePromise = build({
  entryPoints: [
    'packages/dynamic-form/src/config/processor/configParser.ts',
    'demos/nodeModel4DemoConfig.ts'
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
    const name = outputFile.path.endsWith('configParser.js') ? 'configParser' : 'demoConfig';
    modules[name] = await import(
      `data:text/javascript;base64,${Buffer.from(outputFile.text).toString('base64')}`
    );
  }

  return modules;
});

test('node model 4 demo config exposes nested and repeatable containers', async () => {
  const { configParser, demoConfig } = await modulePromise;
  const result = configParser.processFormConfig(demoConfig.nodeModel4DemoConfig);

  assert.deepEqual(result.rootNodeIds, ['isCompany', 'companyInfo', 'contacts']);
  assert.equal(result.containerRegistry.companyInfo.config.repeatable, undefined);
  assert.equal(result.containerRegistry.contacts.config.repeatable, true);
  assert.deepEqual(result.initialValues.company, {
    companyName: 'Snow Tech',
    companyType: 'enterprise',
    address: {
      companyProvince: 'Shanghai',
      companyCity: 'Shanghai',
      companyDistrict: '浦东新区',
      addressUsage: '工商注册地址'
    }
  });
  assert.deepEqual(result.fieldAddressRegistry.companyType.name, ['company', 'companyType']);
  assert.deepEqual(result.fieldAddressRegistry.companyProvince.name, [
    'company',
    'address',
    'companyProvince'
  ]);
  assert.deepEqual(result.fieldAddressRegistry.addressUsage.name, [
    'company',
    'address',
    'addressUsage'
  ]);
  assert.deepEqual(result.fieldAddressRegistry.companyCity.name, [
    'company',
    'address',
    'companyCity'
  ]);
  assert.deepEqual(result.effectMap.isCompany.dependents, ['companyInfo']);
  assert.deepEqual(result.effectMap.companyType.dependents, ['addressUsage']);
  assert.deepEqual(result.effectMap.companyProvince.dependents, ['companyCity']);
  assert.deepEqual(result.effectMap.companyCity.dependents, ['contacts', 'companyDistrict']);
  assert.deepEqual(result.effectMap.companyDistrict.dependents, []);
  assert.deepEqual(result.effectMap.addressUsage.dependents, []);

  assert.deepEqual(
    result.effectMap.addressUsage.effect(undefined, {
      company: { companyType: 'branch' }
    }),
    {
      value: '分支机构地址',
      componentProps: {
        options: [
          { label: '分支机构地址', value: '分支机构地址' },
          { label: '办事处地址', value: '办事处地址' }
        ]
      }
    }
  );

  assert.equal(
    result.effectMap.companyProvince.effect(undefined, {
      company: { address: { companyProvince: 'Guangdong' } }
    }),
    undefined
  );

  assert.deepEqual(
    result.effectMap.companyCity.effect(
      undefined,
      {
        company: { address: { companyProvince: 'Guangdong', companyCity: 'Shanghai' } }
      },
      { path: ['companyProvince', 'companyCity'] }
    ),
    {
      value: 'Shenzhen',
      groupsVisible: {
        contacts: false
      },
      componentProps: {
        options: [
          { label: '深圳', value: 'Shenzhen' },
          { label: '广州', value: 'Guangzhou' }
        ]
      }
    }
  );

  assert.deepEqual(
    result.effectMap.companyDistrict.effect(undefined, {
      company: { address: { companyCity: 'Beijing' } }
    }),
    {
      value: '朝阳区',
      componentProps: {
        options: [
          { label: '朝阳区', value: '朝阳区' },
          { label: '海淀区', value: '海淀区' },
          { label: '东城区', value: '东城区' }
        ]
      }
    }
  );
});

test('node model 4 demo values contain repeatable contact rows', async () => {
  const { demoConfig } = await modulePromise;

  assert.deepEqual(demoConfig.nodeModel4DemoValues, {
    contacts: [
      { contactName: 'Ada', contactPhone: '13800000001' },
      { contactName: 'Grace', contactPhone: '13800000002' }
    ]
  });
});
