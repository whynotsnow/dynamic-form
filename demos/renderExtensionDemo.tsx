import React, { useState } from 'react';
import { Form, Card, Tag, Tooltip, Typography, Input, Tabs, Button, Space } from 'antd';
import type { FormInstance } from 'antd';
import {
  InfoCircleOutlined,
  StarOutlined,
  FireOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import DynamicForm from '@/index';
import { getFieldName } from '@/exports';
import type {
  RenderFieldItemParams,
  RenderFormParams,
  FieldComponentProps,
  RenderGroupItemParams,
  GroupedFormConfig,
  RenderGroupsParams,
  RenderFieldsParams
} from '@/exports';
import { useDemoInitHandlers } from './useDemoInitHandlers';
import { useDemoSubmitResult } from './useDemoSubmitResult';

const { Text } = Typography;

type RenderExtensionFormValues = {
  username?: string;
  email?: string;
  age?: number;
  city?: string;
  bio?: string;
};

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
      name={getFieldName(field)}
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
      name={getFieldName(field)}
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

const RenderExtensionDemo: React.FC<{ form?: FormInstance; hideSubmitButton?: boolean }> = ({
  form: externalForm,
  hideSubmitButton = false
}) => {
  const [localForm] = Form.useForm();
  const form = externalForm ?? localForm;
  const [showExtensions, setShowExtensions] = useState(true);
  const { showSubmitResult, submitResultModal } = useDemoSubmitResult();

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
  useDemoInitHandlers();

  const handleSubmit = (values: RenderExtensionFormValues) => {
    console.log('表单提交值:', values);
    showSubmitResult(values);
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
  const renderGroups = ({
    groupFields,
    renderFields: _renderFields,
    renderGroupItem
  }: RenderGroupsParams) => {
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
      {!hideSubmitButton ? (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button type="primary" htmlType="submit">
            🚀 提交表单
          </Button>
        </div>
      ) : null}
    </>
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type={showExtensions ? 'primary' : 'default'}
          onClick={() => setShowExtensions(true)}
        >
          扩展示例
        </Button>
        <Button
          type={!showExtensions ? 'primary' : 'default'}
          onClick={() => setShowExtensions(false)}
        >
          默认渲染
        </Button>
      </Space>
      <DynamicForm
        formConfig={formConfig}
        form={form}
        uiConfig={
          hideSubmitButton ? { submitAreaProps: { style: { display: 'none' } } } : undefined
        }
        onSubmit={(values) => handleSubmit(values as RenderExtensionFormValues)}
        componentRegistry={componentRegistry}
        renderFieldItem={showExtensions ? renderFieldItem : undefined}
        renderFields={showExtensions ? renderFields : undefined}
        renderGroupItem={showExtensions ? renderGroupItem : undefined}
        renderGroups={showExtensions ? renderGroups : undefined}
        renderFormInner={showExtensions ? renderFormInner : undefined}
      />
      {submitResultModal}
    </div>
  );
};

export default RenderExtensionDemo;
