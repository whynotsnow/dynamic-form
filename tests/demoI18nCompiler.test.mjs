import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import demoI18nLoader from '../apps/docs-site/loaders/demoI18n.cjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const transformDemoFile = async (relativePath) => {
  const resourcePath = path.join(repoRoot, 'demos', relativePath);
  const source = await readFile(resourcePath, 'utf8');
  return demoI18nLoader.call({ resourcePath }, source);
};

test('docs-site localizes prefilled values and dynamic demo output at compile time', async () => {
  const customHandlers = await transformDemoFile('customHandlersDemo.tsx');
  const formValidation = await transformDemoFile('formValidationDemo.tsx');
  const headlessRenderer = await transformDemoFile('headlessRendererDemo.tsx');
  const nodeModel4 = await transformDemoFile('nodeModel4Demo.tsx');

  assert.match(customHandlers, /translateDemoValues\(initialValues, t\)/);
  assert.match(customHandlers, /translateDemoConfig\(memoConfig as FlatFormConfig, t\)/);
  assert.match(formValidation, /translateDemoValues\(cloneDemoValues\(initialValues\), t\)/);
  assert.match(headlessRenderer, /translateDemoValues\(/);
  assert.match(nodeModel4, /Contact \$\{contacts\.length \+ 1\}/);

  for (const output of [customHandlers, formValidation, headlessRenderer, nodeModel4]) {
    const result = ts.transpileModule(output, {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
      reportDiagnostics: true
    });
    const errors = (result.diagnostics ?? []).filter(
      (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
    );
    assert.deepEqual(errors, []);
  }
});

test('demo i18n catalog is grouped by responsibility and includes visible sample values', async () => {
  const sampleValues = JSON.parse(
    await readFile(path.join(repoRoot, 'demos/demoI18n/data/shared.json'), 'utf8')
  );

  assert.equal(sampleValues['示例用户'], 'Demo user');
  assert.equal(sampleValues['客户门户改版'], 'Customer portal redesign');
  assert.equal(sampleValues['小型企业'], 'Small business');
  assert.equal(sampleValues['浦东新区'], 'Pudong New Area');
  assert.equal(sampleValues['工商注册地址'], 'Registered business address');
});
