import React from 'react';
import { Form } from 'antd';
import { supplierFormConfig } from '../tests/testData';
import { DynamicForm } from '@/exports';
import { useDemoInitHandlers } from './useDemoInitHandlers';
import OperatingAreaField from '../demos/customComponents/OperatingAreaField';

type StoreBoundaryFormValues = {
  [fieldName: string]: string | number | boolean | string[] | undefined;
};

const StoreBoundaryDemo: React.FC = () => {
  const handleSubmit = (values: StoreBoundaryFormValues) => {
    console.log('[StoreBoundaryDemo] 表单提交:', values);
  };

  // 初始化处理器系统，确保所有演示组件都能正常工作
  useDemoInitHandlers();

  const [form] = Form.useForm();

  return (
    <div>
      <DynamicForm
        onSubmit={(values) => handleSubmit(values as StoreBoundaryFormValues)}
        form={form}
        submitButtonText="提交表单"
        formConfig={supplierFormConfig}
        componentRegistry={{ customComponents: { OperatingAreaField } }}
      />
    </div>
  );
};

export default StoreBoundaryDemo;
