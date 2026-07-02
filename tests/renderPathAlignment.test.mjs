import assert from 'node:assert/strict';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const bundlePath = '/private/tmp/dynamic-form-render-path-alignment-test.cjs';

const modulePromise = build({
  stdin: {
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import { Form } from 'antd';
      import FormContent from './packages/dynamic-form/src/consumer/render/FormContent';
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

      function MarkerField({ field, formItemProps }) {
        return React.createElement('span', {
          'data-field': field.id,
          'data-name': JSON.stringify(formItemProps?.name)
        });
      }
      MarkerField.wrapWithFormItem = false;

      function createState(formConfig, initialValues) {
        const configProcessInfo = processFormConfig(formConfig);
        const nextConfigProcessInfo = {
          ...configProcessInfo,
          initialValues: initialValues ?? configProcessInfo.initialValues
        };

        return {
          fields: configProcessInfo.initializedFields,
          groupFields: configProcessInfo.initializedGroupFields,
          nodes: configProcessInfo.initializedNodes,
          rootNodeIds: configProcessInfo.rootNodeIds,
          containerFields: configProcessInfo.initializedContainerFields,
          initialized: true,
          configProcessInfo: nextConfigProcessInfo,
          staticUIConfig: defaultUIConfig,
          dynamicUIConfig: {}
        };
      }

      export function renderFormContent(formConfig, initialValues) {
        const renderFieldsCalls = [];
        const renderGroupItemCalls = [];

        function App() {
          const [form] = Form.useForm();
          const state = createState(formConfig, initialValues);
          const contextValue = {
            form,
            state,
            dispatch: () => undefined,
            onValuesChange: () => undefined,
            manualTrigger: () => undefined
          };

          return React.createElement(
            FormChainContext.Provider,
            { value: contextValue },
            React.createElement(FormContent, {
              form,
              componentRegistry: {
                customComponents: { MarkerField },
                allowOverride: true
              },
              renderFields: ({ fields, defaultRender }) => {
                const ids = fields.map((field) => field.id).join(',');
                renderFieldsCalls.push(ids);
                return React.createElement(
                  'section',
                  { 'data-render-fields': ids },
                  defaultRender
                );
              },
              renderGroupItem: ({ group, defaultRender }) => {
                renderGroupItemCalls.push(group.id);
                return React.createElement(
                  'article',
                  { 'data-render-group': group.id },
                  defaultRender
                );
              }
            })
          );
        }

        return {
          html: renderToStaticMarkup(React.createElement(App)),
          renderFieldsCalls,
          renderGroupItemCalls
        };
      }
    `,
    resolveDir: process.cwd(),
    sourcefile: 'renderPathAlignmentTestEntry.tsx',
    loader: 'tsx'
  },
  bundle: true,
  format: 'cjs',
  platform: 'node',
  outfile: bundlePath,
  write: true,
  logLevel: 'silent'
}).then(async () => import(pathToFileURL(bundlePath).href));

const field = (id, extra = {}) => ({
  id,
  nodeType: 'field',
  label: id,
  component: 'MarkerField',
  ...extra
});

test('flat fields render as one top-level field segment through renderFields', async () => {
  const { renderFormContent } = await modulePromise;
  const result = renderFormContent({
    fields: [field('first'), field('second'), field('third')]
  });

  assert.deepEqual(result.renderFieldsCalls, ['first,second,third']);
  assert.match(result.html, /data-render-fields="first,second,third"/);
  assert.match(result.html, /data-field="first"/);
  assert.match(result.html, /data-field="third"/);
});

test('mixed root nodes keep field segments split by container blocks', async () => {
  const { renderFormContent } = await modulePromise;
  const result = renderFormContent({
    nodes: [
      field('rootA'),
      {
        id: 'profile',
        nodeType: 'container',
        title: 'Profile',
        children: [field('profileName')]
      },
      field('rootB'),
      field('rootC'),
      {
        id: 'settings',
        nodeType: 'container',
        title: 'Settings',
        children: [field('enabled')]
      },
      field('rootD')
    ]
  });

  assert.deepEqual(result.renderFieldsCalls, [
    'rootA',
    'profileName',
    'rootB,rootC',
    'enabled',
    'rootD'
  ]);
  assert.deepEqual(result.renderGroupItemCalls, ['profile', 'settings']);
});

test('nested containers render each direct field segment through renderFields', async () => {
  const { renderFormContent } = await modulePromise;
  const result = renderFormContent({
    nodes: [
      {
        id: 'profile',
        nodeType: 'container',
        title: 'Profile',
        name: 'profile',
        children: [
          field('firstName'),
          {
            id: 'address',
            nodeType: 'container',
            title: 'Address',
            name: 'address',
            children: [field('city'), field('zip')]
          },
          field('note')
        ]
      }
    ]
  });

  assert.deepEqual(result.renderFieldsCalls, ['firstName', 'city,zip', 'note']);
  assert.deepEqual(new Set(result.renderGroupItemCalls), new Set(['profile', 'address']));
  assert.match(result.html, /data-render-group="profile"/);
  assert.match(result.html, /data-render-group="address"/);
});

test('repeatable containers render item field segments with Form.List-relative names', async () => {
  const { renderFormContent } = await modulePromise;
  const result = renderFormContent(
    {
      nodes: [
        {
          id: 'contacts',
          nodeType: 'container',
          title: 'Contacts',
          name: 'contacts',
          repeatable: true,
          children: [field('contactName'), field('contactPhone')]
        }
      ]
    },
    {
      contacts: [
        { contactName: 'Ada', contactPhone: '13800000001' },
        { contactName: 'Grace', contactPhone: '13800000002' }
      ]
    }
  );

  assert.deepEqual(result.renderFieldsCalls, ['contactName,contactPhone', 'contactName,contactPhone']);
  assert.match(result.html, /data-name="\[0,&quot;contactName&quot;\]"/);
  assert.match(result.html, /data-name="\[1,&quot;contactPhone&quot;\]"/);
});
