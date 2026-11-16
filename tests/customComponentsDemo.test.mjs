import assert from 'node:assert/strict';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const bundlePath = '/private/tmp/dynamic-form-custom-component-props-test.cjs';

const modulePromise = build({
  entryPoints: ['demos/customComponents/demoComponentProps.ts'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  outfile: bundlePath,
  write: true,
  logLevel: 'silent'
}).then(async () => import(pathToFileURL(bundlePath).href));

test('custom component props default to an empty object when omitted', async () => {
  const { getDemoComponentProps } = await modulePromise;

  assert.deepEqual(getDemoComponentProps({}), {});
});

test('custom component props preserve explicitly configured values', async () => {
  const { getDemoComponentProps } = await modulePromise;
  const componentProps = {
    disabled: true,
    options: [{ label: 'Option A', value: 'a' }]
  };

  assert.equal(getDemoComponentProps({ componentProps }), componentProps);
});
