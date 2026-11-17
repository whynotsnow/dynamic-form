import React, { useMemo } from 'react';
import { Button, Form, Space } from 'antd';
import type { FormInstance } from 'antd';
import DynamicForm from '@/index';
import type { FormValues } from '@/exports';
import { useDemoInitHandlers } from './useDemoInitHandlers';
import { useDemoSubmitResult } from './useDemoSubmitResult';
import { nodeModel4DemoConfig, nodeModel4DemoValues } from './nodeModel4DemoConfig';

const NodeModel4Demo: React.FC<{ form?: FormInstance; hideSubmitButton?: boolean }> = ({
  form: externalForm,
  hideSubmitButton = false
}) => {
  useDemoInitHandlers();

  const [localForm] = Form.useForm();
  const form = externalForm ?? localForm;
  const isCompany = Form.useWatch('isCompany', form);
  const { showSubmitResult, submitResultModal } = useDemoSubmitResult();

  const initialDemoValues = useMemo(() => nodeModel4DemoValues, []);

  const addContact = () => {
    const contacts = form.getFieldValue('contacts') || [];
    form.setFieldValue('contacts', [
      ...contacts,
      {
        contactName: `联系人 ${contacts.length + 1}`,
        contactPhone: `1380000000${contacts.length + 1}`
      }
    ]);
  };

  const removeLastContact = () => {
    const contacts = form.getFieldValue('contacts') || [];
    form.setFieldValue('contacts', contacts.slice(0, -1));
  };

  const handleSubmit = (values: FormValues) => {
    showSubmitResult(values);
  };

  return (
    <div>
      {isCompany !== false && (
        <Space>
          <Button onClick={addContact}>添加联系人</Button>
          <Button onClick={removeLastContact}>移除最后一个联系人</Button>
        </Space>
      )}

      <DynamicForm
        form={form}
        formConfig={nodeModel4DemoConfig}
        values={initialDemoValues}
        submitButtonText="提交 4.0 node form"
        onSubmit={handleSubmit}
        renderFormInner={({ defaultRender }) => (
          <>
            {defaultRender.fieldsArea}
            {hideSubmitButton ? null : defaultRender.submitArea}
          </>
        )}
      />
      {submitResultModal}
    </div>
  );
};

export default NodeModel4Demo;
