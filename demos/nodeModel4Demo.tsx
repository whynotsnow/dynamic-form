import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Form, Space, Typography } from 'antd';
import DynamicForm from '@/index';
import type { FormValues } from '@/exports';
import { useDemoInitHandlers } from './useDemoInitHandlers';
import { nodeModel4DemoConfig, nodeModel4DemoValues } from './nodeModel4DemoConfig';

const { Text } = Typography;

function formatValues(values: FormValues) {
  return JSON.stringify(values, null, 2);
}

interface FormValuesWatcherProps {
  form: ReturnType<typeof Form.useForm>[0];
  onChange: (values: FormValues) => void;
}

const FormValuesWatcher: React.FC<FormValuesWatcherProps> = ({ form, onChange }) => {
  const watchedValues = Form.useWatch([], { form, preserve: true });
  const lastSnapshotRef = useRef('');
  void watchedValues;

  useEffect(() => {
    const nextValues = form.getFieldsValue(true);
    const nextSnapshot = formatValues(nextValues);

    if (nextSnapshot !== lastSnapshotRef.current) {
      lastSnapshotRef.current = nextSnapshot;
      onChange(nextValues);
    }
  });

  return null;
};

const NodeModel4Demo: React.FC = () => {
  useDemoInitHandlers();

  const [form] = Form.useForm();
  const [currentValues, setCurrentValues] = useState<FormValues>({});
  const [submittedValues, setSubmittedValues] = useState<FormValues>({});

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
    setSubmittedValues(values);
  };

  return (
    <div>
      <Space>
        <Button onClick={addContact}>添加联系人</Button>
        <Button onClick={removeLastContact}>移除最后一个联系人</Button>
      </Space>

      <DynamicForm
        form={form}
        formConfig={nodeModel4DemoConfig}
        values={initialDemoValues}
        submitButtonText="提交 4.0 node form"
        onSubmit={handleSubmit}
        renderFormInner={({ defaultRender }) => (
          <>
            <FormValuesWatcher form={form} onChange={setCurrentValues} />
            {defaultRender.fieldsArea}
            {defaultRender.submitArea}
          </>
        )}
      />

      <Card title="当前 AntD Form values" style={{ marginTop: 16 }}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{formatValues(currentValues)}</pre>
      </Card>

      <Card title="最近一次提交值" style={{ marginTop: 16 }}>
        <Text type="secondary">
          隐藏 container 的字段会按 Runtime participation 策略从提交值中移除。
        </Text>
        <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>{formatValues(submittedValues)}</pre>
      </Card>
    </div>
  );
};

export default NodeModel4Demo;
