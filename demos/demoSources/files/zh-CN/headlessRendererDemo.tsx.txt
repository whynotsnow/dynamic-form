import React, { useMemo, useState } from 'react';
import { Space } from 'antd';
import {
  createMemoryFormAdapter,
  DynamicForm,
  type FieldComponentProps,
  type FormConfig,
  headlessRenderer
} from '../packages/dynamic-form/src/exports';
import { useDemoSubmitResult } from './useDemoSubmitResult';

const HeadlessInput: React.FC<FieldComponentProps> & { wrapWithFormItem?: boolean } = ({
  field,
  formAdapter
}) => {
  const name = field.name ?? field.id;
  const [value, setValue] = useState(() => String(formAdapter?.getFieldValue(name) ?? ''));

  return (
    <input
      name={field.id}
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
        formAdapter?.setFieldValue(name, event.target.value);
      }}
    />
  );
};

const formConfig: FormConfig = {
  fields: [
    {
      id: 'name',
      name: ['profile', 'name'],
      label: '姓名',
      component: 'HeadlessInput',
      required: true,
      initialValue: 'Ada'
    },
    {
      id: 'internalNote',
      label: '隐藏备注',
      component: 'HeadlessInput',
      initialVisible: false,
      initialValue: '不参与默认渲染'
    }
  ],
  nodes: [
    {
      nodeType: 'container',
      id: 'contact',
      title: '联系方式',
      designer: {
        title: '联系方式区块',
        category: 'preview'
      },
      children: [
        {
          nodeType: 'field',
          id: 'email',
          name: ['profile', 'email'],
          label: '邮箱',
          component: 'HeadlessInput',
          initialValue: 'ada@example.com'
        }
      ]
    }
  ]
};

const HeadlessRendererDemo: React.FC = () => {
  const formAdapter = useMemo(
    () =>
      createMemoryFormAdapter({
        profile: {
          name: 'Ada',
          email: 'ada@example.com'
        }
      }),
    []
  );
  const { showSubmitResult, submitResultModal } = useDemoSubmitResult();

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <DynamicForm
        formAdapter={formAdapter}
        renderer={headlessRenderer}
        formConfig={formConfig}
        componentRegistry={{
          customComponents: {
            HeadlessInput
          },
          allowOverride: true
        }}
        renderFieldItem={({ field, defaultRender }) => (
          <div data-demo-field={field.id} style={{ marginBottom: 12 }}>
            {defaultRender}
          </div>
        )}
        submitButtonText="提交 Headless 表单"
        onSubmit={(values) => showSubmitResult({ ...values })}
      />
      {submitResultModal}
    </Space>
  );
};

export default HeadlessRendererDemo;
