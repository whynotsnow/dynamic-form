import React, { useState } from 'react';
import { Form, Card, Tag, Tooltip, Typography, Input, Tabs, Button } from 'antd';
import {
  InfoCircleOutlined,
  StarOutlined,
  FireOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import DynamicForm from '@/index';
import type {
  RenderFieldItemParams,
  RenderFormParams,
  FieldComponentProps,
  RenderGroupItemParams,
  GroupedFormConfig,
  RenderGroupsParams,
  RenderFieldsParams
} from '@/types';
import { useInitHandlers } from '@/exports';

const { Text } = Typography;

/**
 * 自定义用户名字段
 */
const CustomUsernameField: React.FC<FieldComponentProps> & { wrapWithFormItem?: boolean } = ({
  field
}) => (
  <div>
    <Text strong>{field.label}</Text>
    <Tag color="blue" style={{ marginLeft: 8 }}>
      <StarOutlined /> 推荐
    </Tag>
    <Form.Item
      name={field.id}
      rules={[{ required: field.required, message: `请输入${field.label}` }]}
    >
      <Input placeholder="请输入用户名" />
    </Form.Item>
    <Tooltip title="用户名将用于系统登录和显示">
      <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
    </Tooltip>
  </div>
);

/**
 * 自定义邮箱字段
 */
const CustomEmailField: React.FC<FieldComponentProps> & { wrapWithFormItem?: boolean } = ({
  field
}) => (
  <div>
    <Text strong>{field.label}</Text>
    <Tag color="green" style={{ marginLeft: 8 }}>
      <FireOutlined /> 必填
    </Tag>
    <Form.Item
      name={field.id}
      rules={[
        { required: field.required, message: `请输入${field.label}` },
        { type: 'email', message: '请输入正确的邮箱格式' }
      ]}
    >
      <Input type="email" placeholder="请输入邮箱地址" />
    </Form.Item>
  </div>
);
CustomUsernameField.wrapWithFormItem = false;
CustomEmailField.wrapWithFormItem = false;

const RenderExtensionDemo: React.FC = () => {
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const formConfig: GroupedFormConfig = {
    groups: [
      {
        id: 'userInfo',
        title: '用户信息',
        fields: [
          {
            id: 'username',
            label: '用户名',
            component: 'CustomUsername',
            required: true,
            span: 12
          },
          { id: 'email', label: '邮箱', component: 'CustomEmail', required: true, span: 12 }
        ]
      },
      {
        id: 'extraInfo',
        title: '额外信息',
        fields: [
          {
            id: 'age',
            label: '年龄',
            component: 'NumberInput',
            span: 12,
            componentProps: { min: 0, max: 150 }
          },
          {
            id: 'city',
            label: '城市',
            component: 'SelectField',
            span: 12,
            componentProps: {
              options: [
                { value: 'beijing', label: '北京' },
                { value: 'shanghai', label: '上海' },
                { value: 'guangzhou', label: '广州' },
                { value: 'shenzhen', label: '深圳' }
              ]
            }
          },
          {
            id: 'bio',
            label: '个人简介',
            component: 'TextArea',
            span: 24,
            componentProps: { rows: 3 }
          }
        ]
      }
    ]
  };

  // 自定义组件注册配置
  const componentRegistry = {
    customComponents: {
      CustomUsername: CustomUsernameField,
      CustomEmail: CustomEmailField
    }
  };
  // 初始化处理器
  useInitHandlers({
    enabled: true,
    handlers: [], // 使用默认处理器
    options: { override: false },
    debug: true
  });

  const handleSubmit = (values: Record<string, any>) => {
    console.log('表单提交值:', JSON.stringify(values, null, 2), form.getFieldsValue(true));
    setFormValues(values);
  };

  /** 单字段覆盖 */
  const renderFieldItem = ({ defaultRender }: RenderFieldItemParams) => (
    <div style={{ border: '1px dashed red', padding: 8, marginBottom: 8, borderRadius: 4 }}>
      <span style={{ color: 'red', fontSize: 12 }}>FieldItem</span>
      {defaultRender}
    </div>
  );

  /** 一组字段覆盖 */
  const renderFields = ({ defaultRender }: RenderFieldsParams) => (
    <div style={{ background: '#e6f7ff', padding: 12, borderRadius: 6 }}>
      <span style={{ color: '#1890ff', fontSize: 12 }}>Fields</span>
      {defaultRender}
    </div>
  );

  /** 单分组覆盖 */
  const renderGroupItem = ({ group, defaultRender }: RenderGroupItemParams) => (
    <Card
      key={group.id}
      title={
        <>
          <FolderOpenOutlined /> {group.title}
        </>
      }
      style={{ marginBottom: 16, border: '1px solid green' }}
    >
      {defaultRender}
    </Card>
  );

  /** 分组集合覆盖 */
  const renderGroups = ({ groupFields, renderFields, renderGroupItem }: RenderGroupsParams) => {
    const items = Object.values(groupFields).map((group) => ({
      key: group.id,
      label: group.title,
      children: renderGroupItem(group)
    }));
    return <Tabs defaultActiveKey={items[0]?.key} items={items} />;
  };

  /** Form 覆盖：保留 fieldsArea，提交按钮自定义 */
  const renderFormInner = ({ defaultRender }: RenderFormParams) => (
    <>
      {defaultRender.fieldsArea}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Button type="primary" htmlType="submit">
          🚀 提交表单
        </Button>
      </div>
    </>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Card title="🎯 渲染扩展能力演示" style={{ marginBottom: 24 }}>
        <ul>
          <li>
            <b>renderFieldItem：</b> 给单字段外层加红色边框
          </li>
          <li>
            <b>renderFields：</b> 给字段集合加蓝色背景
          </li>
          <li>
            <b>renderGroupItem：</b> 分组用绿色边框和图标卡片
          </li>
          <li>
            <b>renderGroups：</b> 整体切换为 Tabs
          </li>
          <li>
            <b>renderFormInner：</b> 自定义提交按钮
          </li>
        </ul>
      </Card>

      <Card title="📝 表单演示">
        <DynamicForm
          formConfig={formConfig}
          form={form}
          onSubmit={handleSubmit}
          componentRegistry={componentRegistry}
          renderFieldItem={renderFieldItem}
          renderFields={renderFields}
          renderGroupItem={renderGroupItem}
          renderGroups={renderGroups}
          renderFormInner={renderFormInner}
        />
      </Card>

      {Object.keys(formValues).length > 0 && (
        <Card title="📊 提交结果" style={{ marginTop: 24 }}>
          <pre style={{ background: '#f6f8fa', padding: 16, borderRadius: 6 }}>
            {JSON.stringify(formValues, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};

export default RenderExtensionDemo;
