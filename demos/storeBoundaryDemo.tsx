import React from 'react';
import { Card, Form } from 'antd';
import { supplierFormConfig } from '../tests/testData';
import { DynamicForm } from '@/exports';
import { useDemoInitHandlers } from './useDemoInitHandlers';
import { useDemoSubmitResult } from './useDemoSubmitResult';
import OperatingAreaField from '../demos/customComponents/OperatingAreaField';

type StoreBoundaryFormValues = {
  [fieldName: string]: string | number | boolean | string[] | undefined;
};

const StoreBoundaryDemo: React.FC = () => {
  const { showSubmitResult, submitResultModal } = useDemoSubmitResult();

  const handleSubmit = (values: StoreBoundaryFormValues) => {
    console.log('[StoreBoundaryDemo] 表单提交:', values);
    showSubmitResult(values);
  };

  // 初始化处理器系统，确保所有演示组件都能正常工作
  useDemoInitHandlers();

  const [form] = Form.useForm();
  const currentValues = Form.useWatch([], { form, preserve: true }) ?? {};

  return (
    <div>
      <DynamicForm
        onSubmit={(values) => handleSubmit(values as StoreBoundaryFormValues)}
        form={form}
        submitButtonText="提交表单"
        formConfig={supplierFormConfig}
        componentRegistry={{ customComponents: { OperatingAreaField } }}
      />
      <Card title="当前 AntD Form values" style={{ marginTop: 16 }}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(currentValues, null, 2)}
        </pre>
      </Card>
      {submitResultModal}
    </div>
  );
};

export default StoreBoundaryDemo;
