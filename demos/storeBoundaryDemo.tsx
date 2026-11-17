import React from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd';
import { supplierFormConfig } from '../tests/testData';
import { DynamicForm } from '@/exports';
import { useDemoInitHandlers } from './useDemoInitHandlers';
import { useDemoSubmitResult } from './useDemoSubmitResult';
import OperatingAreaField from '../demos/customComponents/OperatingAreaField';

type StoreBoundaryFormValues = {
  [fieldName: string]: string | number | boolean | string[] | undefined;
};

const StoreBoundaryDemo: React.FC<{ form?: FormInstance; hideSubmitButton?: boolean }> = ({
  form: externalForm,
  hideSubmitButton = false
}) => {
  const { showSubmitResult, submitResultModal } = useDemoSubmitResult();

  const handleSubmit = (values: StoreBoundaryFormValues) => {
    console.log('[StoreBoundaryDemo] 表单提交:', values);
    showSubmitResult(values);
  };

  // 初始化处理器系统，确保所有演示组件都能正常工作
  useDemoInitHandlers();

  const [localForm] = Form.useForm();
  const form = externalForm ?? localForm;

  return (
    <div>
      <DynamicForm
        onSubmit={(values) => handleSubmit(values as StoreBoundaryFormValues)}
        form={form}
        uiConfig={
          hideSubmitButton ? { submitAreaProps: { style: { display: 'none' } } } : undefined
        }
        submitButtonText="提交表单"
        formConfig={supplierFormConfig}
        componentRegistry={{ customComponents: { OperatingAreaField } }}
      />
      {submitResultModal}
    </div>
  );
};

export default StoreBoundaryDemo;
