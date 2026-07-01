import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Form, Space, Typography } from 'antd';
import DynamicForm from '@/index';
import type { FormValues } from '@/exports';
import { useDemoInitHandlers } from './useDemoInitHandlers';
import { nodeModel4DemoConfig, nodeModel4DemoValues } from './nodeModel4DemoConfig';

const { Paragraph, Text } = Typography;

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
    <div style={{ padding: 20 }}>
      <Card title="4.0 Node Model / Container 演示" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={8}>
          <Paragraph>
            按下面的操作可以验证 4.0 node form 的嵌套结构、级联联动和跨层级 effect。
          </Paragraph>
          <Paragraph>
            <Text strong>隐藏整段企业信息：</Text>
            关闭“企业客户”开关后，“企业信息”整段会隐藏；再次提交时，隐藏段落里的字段不会出现在提交值里。
          </Paragraph>
          <Paragraph>
            <Text strong>父级字段带动子级字段：</Text>
            修改“企业类型”，嵌套在“注册地址”里的“地址用途”会跟着切换默认值和可选项。
          </Paragraph>
          <Paragraph>
            <Text strong>地址级联选择：</Text>
            修改“省级行政区”会更新“城市”；修改“城市”会更新“区县”。
          </Paragraph>
          <Paragraph>
            <Text strong>跨层级控制联系人：</Text>
            把“城市”从“上海”改成其他城市后，页面底部的“联系人”列表会隐藏；改回“上海”后列表恢复显示。
          </Paragraph>
          <Space>
            <Button onClick={addContact}>添加联系人</Button>
            <Button onClick={removeLastContact}>移除最后一个联系人</Button>
          </Space>
        </Space>
      </Card>

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
