import assert from 'node:assert/strict';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const bundlePath = '/private/tmp/dynamic-form-headless-renderer-demo-test.cjs';

const modulePromise = build({
  stdin: {
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import HeadlessRendererDemo from './demos/headlessRendererDemo';

      export function renderDemo() {
        return renderToStaticMarkup(React.createElement(HeadlessRendererDemo));
      }
    `,
    resolveDir: process.cwd(),
    sourcefile: 'headlessRendererDemoTestEntry.tsx',
    loader: 'tsx'
  },
  bundle: true,
  format: 'cjs',
  platform: 'node',
  outfile: bundlePath,
  write: true,
  logLevel: 'silent'
}).then(async () => import(pathToFileURL(bundlePath).href));

test('HeadlessRendererDemo renders the memory adapter reference form', async () => {
  const { renderDemo } = await modulePromise;
  const html = renderDemo();

  assert.match(html, /Headless Renderer \/ Memory Adapter 演示/);
  assert.match(html, /<form>/);
  assert.match(html, /提交 Headless 表单/);
});
