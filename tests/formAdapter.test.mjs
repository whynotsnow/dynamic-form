import assert from 'node:assert/strict';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const bundlePath = '/private/tmp/dynamic-form-adapter-boundary-test.cjs';

const modulePromise = build({
  stdin: {
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import FormContent from './packages/dynamic-form/src/consumer/render/FormContent';
      import {
        assertFormAdapter,
        createAntdFormAdapter,
        createMemoryFormAdapter
      } from './packages/dynamic-form/src/consumer/formAdapter';
      import { headlessRenderer } from './packages/dynamic-form/src/consumer/render/headlessRenderer';
      import { assertRendererAdapter } from './packages/dynamic-form/src/consumer/render/rendererAdapter';
      import { FormChainContext } from './packages/dynamic-form/src/shared/context/FormChainContext';
      import { processFormConfig } from './packages/dynamic-form-core/src/config/processor/configParser';

      const defaultUIConfig = {
        formProps: {},
        buttonProps: {},
        cardProps: {},
        rowProps: { gutter: [16, 0] },
        colProps: { span: 8 },
        submitAreaProps: {},
        formItemProps: {}
      };

      function getAtPath(values, name) {
        const path = Array.isArray(name) ? name : [name];
        return path.reduce((current, segment) => current?.[segment], values);
      }

      function setAtPath(values, name, value) {
        const path = Array.isArray(name) ? name : [name];
        let current = values;
        path.forEach((segment, index) => {
          if (index === path.length - 1) {
            current[segment] = value;
            return;
          }
          current[segment] ||= {};
          current = current[segment];
        });
      }

      export function createMockAntdForm(initialValues = {}) {
        const values = structuredClone(initialValues);
        const validatedNames = [];
        return {
          values,
          validatedNames,
          getFieldValue: (name) => getAtPath(values, name),
          getFieldsValue: (includeAll) => {
            if (includeAll !== undefined) values.__includeAll = includeAll;
            return values;
          },
          setFieldValue: (name, value) => setAtPath(values, name, value),
          setFieldsValue: (patch) => Object.assign(values, patch),
          validateFields: async (names) => {
            validatedNames.push(names);
            return values;
          }
        };
      }

      function createState(formConfig) {
        const configProcessInfo = processFormConfig(formConfig);
        return {
          fields: configProcessInfo.initializedFields,
          groupFields: configProcessInfo.initializedGroupFields,
          nodes: configProcessInfo.initializedNodes,
          rootNodeIds: configProcessInfo.rootNodeIds,
          containerFields: configProcessInfo.initializedContainerFields,
          initialized: true,
          configProcessInfo,
          staticUIConfig: defaultUIConfig,
          dynamicUIConfig: {}
        };
      }

      export function exerciseAntdFormAdapter() {
        const form = createMockAntdForm({ profile: { name: 'Ada' } });
        const adapter = createAntdFormAdapter(form);
        const before = adapter.getFieldValue(['profile', 'name']);
        adapter.setFieldValue(['profile', 'name'], 'Grace');
        adapter.setFieldsValue({ status: 'active' });
        return {
          before,
          after: adapter.getFieldValue(['profile', 'name']),
          values: adapter.getFieldsValue(true)
        };
      }

      export function exerciseMemoryFormAdapter() {
        const adapter = createMemoryFormAdapter({ profile: { name: 'Ada' } });
        const before = adapter.getFieldValue(['profile', 'name']);
        adapter.setFieldValue(['profile', 'name'], 'Grace');
        adapter.setFieldsValue({ status: 'active' });
        return adapter.validateFields([['profile', 'name']]).then((validated) => ({
          before,
          after: adapter.getFieldValue(['profile', 'name']),
          values: adapter.getFieldsValue(true),
          validated,
          rawValues: adapter.values
        }));
      }

      export function exerciseAdapterAssertions() {
        const errors = [];
        try {
          assertFormAdapter({ getFieldValue: () => undefined });
        } catch (error) {
          errors.push(error.message);
        }

        try {
          assertRendererAdapter({ renderForm: () => null });
        } catch (error) {
          errors.push(error.message);
        }

        return errors;
      }

      export function renderWithCustomRenderer() {
        const form = createMockAntdForm({ name: 'Ada', hidden: 'skip' });
        const formAdapter = createAntdFormAdapter(form);
        const state = createState({
          fields: [
            { id: 'name', component: 'Marker', required: true },
            { id: 'hidden', component: 'Marker', initialVisible: false, required: true }
          ]
        });
        let capturedFinish;
        const calls = [];

        function Marker({ field }) {
          return React.createElement('span', { 'data-field': field.id });
        }

        const renderer = {
          renderForm: ({ onFinish, children }) => {
            capturedFinish = onFinish;
            calls.push('form');
            return React.createElement('form', { 'data-custom-form': 'yes' }, children);
          },
          renderFieldItem: ({ children }) => React.createElement('label', {}, children),
          renderFieldsLayout: ({ children }) => React.createElement('section', {}, children),
          renderFieldLayout: ({ field, children }) =>
            React.createElement('div', { 'data-layout-field': field.id }, children),
          renderGroup: ({ id, children }) => React.createElement('article', { 'data-group': id }, children),
          renderRepeatable: ({ id }) => React.createElement('article', { 'data-repeatable': id }),
          renderSubmit: () => React.createElement('button', { type: 'submit' }, 'submit')
        };

        const contextValue = {
          form,
          formAdapter,
          state,
          dispatch: () => undefined,
          onValuesChange: () => undefined,
          manualTrigger: () => undefined
        };

        const html = renderToStaticMarkup(
          React.createElement(
            FormChainContext.Provider,
            { value: contextValue },
            React.createElement(FormContent, {
              form,
              formAdapter,
              renderer,
              componentRegistry: {
                customComponents: { Marker },
                allowOverride: true
              }
            })
          )
        );

        return { html, calls, capturedFinish, form };
      }

      export function renderWithHeadlessRenderer() {
        const formAdapter = createMemoryFormAdapter({ name: 'Ada' });
        const state = createState({
          fields: [{ id: 'name', label: 'Name', component: 'Marker', required: true }]
        });

        function Marker({ field }) {
          return React.createElement('input', { name: field.id, defaultValue: 'Ada' });
        }

        const contextValue = {
          form: formAdapter,
          formAdapter,
          state,
          dispatch: () => undefined,
          onValuesChange: () => undefined,
          manualTrigger: () => undefined
        };

        return renderToStaticMarkup(
          React.createElement(
            FormChainContext.Provider,
            { value: contextValue },
            React.createElement(FormContent, {
              formAdapter,
              renderer: headlessRenderer,
              componentRegistry: {
                customComponents: { Marker },
                allowOverride: true
              }
            })
          )
        );
      }
    `,
    resolveDir: process.cwd(),
    sourcefile: 'formAdapterBoundaryTestEntry.tsx',
    loader: 'tsx'
  },
  bundle: true,
  format: 'cjs',
  platform: 'node',
  outfile: bundlePath,
  write: true,
  logLevel: 'silent'
}).then(async () => import(pathToFileURL(bundlePath).href));

test('createAntdFormAdapter preserves nested field paths and setFieldsValue compatibility', async () => {
  const { exerciseAntdFormAdapter } = await modulePromise;
  const result = exerciseAntdFormAdapter();

  assert.equal(result.before, 'Ada');
  assert.equal(result.after, 'Grace');
  assert.equal(result.values.status, 'active');
  assert.equal(result.values.__includeAll, true);
});

test('createMemoryFormAdapter provides a UI-library-free value runtime', async () => {
  const { exerciseMemoryFormAdapter } = await modulePromise;
  const result = await exerciseMemoryFormAdapter();

  assert.equal(result.before, 'Ada');
  assert.equal(result.after, 'Grace');
  assert.equal(result.values.status, 'active');
  assert.deepEqual(result.validated, result.rawValues);
});

test('adapter assertions report missing required methods early', async () => {
  const { exerciseAdapterAssertions } = await modulePromise;
  const errors = exerciseAdapterAssertions();

  assert.equal(errors.length, 2);
  assert.match(errors[0], /formAdapter is invalid/);
  assert.match(errors[0], /validateFields/);
  assert.match(errors[1], /renderer is invalid/);
  assert.match(errors[1], /renderSubmit/);
});

test('renderer adapter can replace the default AntD form shell', async () => {
  const { renderWithCustomRenderer } = await modulePromise;
  const result = renderWithCustomRenderer();

  assert.deepEqual(result.calls, ['form']);
  assert.match(result.html, /data-custom-form="yes"/);
  assert.match(result.html, /data-layout-field="name"/);
  assert.doesNotMatch(result.html, /data-layout-field="hidden"/);
});

test('submit validation filters hidden fields through runtime capability before reading values', async () => {
  const { renderWithCustomRenderer } = await modulePromise;
  const result = renderWithCustomRenderer();

  await result.capturedFinish();

  assert.deepEqual(result.form.validatedNames, [['name']]);
  assert.equal(result.form.values.__includeAll, true);
});

test('headlessRenderer renders a native form shell without AntD components', async () => {
  const { renderWithHeadlessRenderer } = await modulePromise;
  const html = renderWithHeadlessRenderer();

  assert.match(html, /^<form>/);
  assert.match(html, /data-field-layout="name"/);
  assert.match(html, /data-field-name="&quot;name&quot;"/);
  assert.match(html, /<button type="submit">提交<\/button>/);
});
