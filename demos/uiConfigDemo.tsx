import React from 'react';
import DynamicForm from '@/index';
import type { ComponentRegistryConfig, FormConfig, FormValues, UIConfig } from '@/exports';
import { Tag, Space, Form } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useDemoInitHandlers } from './useDemoInitHandlers';
import { PriorityField, priorityEffect } from '../demos/customComponents/PriorityField';

type DynamicUIFormValues = {
  title?: string;
  requester?: string;
  status?: 'open' | 'in_progress' | 'resolved';
  priority?: string;
  description?: string;
};

const getStatusUIEffect = (
  _changedValue: DynamicUIFormValues['status'],
  allValues: DynamicUIFormValues
) => {
  const status = allValues.status;

  // 新增：测试UIConfig动态配置
  const uiConfigUpdates: Partial<UIConfig> = {};

  if (status === 'open') {
    uiConfigUpdates.formProps = {
      style: { backgroundColor: '#e6f4ff', border: '2px solid #1677ff' }
    };
    uiConfigUpdates.buttonProps = {
      type: 'primary',
      style: { backgroundColor: '#1677ff', borderColor: '#1677ff' }
    };
    uiConfigUpdates.cardProps = {
      style: { borderColor: '#1677ff', backgroundColor: '#e6f4ff' }
    };
  } else if (status === 'in_progress') {
    uiConfigUpdates.formProps = {
      style: { backgroundColor: '#fffbe6', border: '2px solid #faad14' }
    };
    uiConfigUpdates.buttonProps = {
      type: 'default',
      style: { backgroundColor: '#faad14', borderColor: '#faad14', color: 'white' }
    };
    uiConfigUpdates.cardProps = {
      style: { borderColor: '#faad14', backgroundColor: '#fffbe6' }
    };
  } else if (status === 'resolved') {
    uiConfigUpdates.formProps = {
      style: { backgroundColor: '#f6ffed', border: '2px solid #52c41a' }
    };
    uiConfigUpdates.buttonProps = {
      type: 'primary',
      style: { backgroundColor: '#52c41a', borderColor: '#52c41a' }
    };
    uiConfigUpdates.cardProps = {
      style: { borderColor: '#52c41a', backgroundColor: '#f6ffed' }
    };
  }
  return {
    formProps: uiConfigUpdates.formProps,
    buttonProps: uiConfigUpdates.buttonProps
    // 不是分组没有card组件
    // cardProps: uiConfigUpdates.cardProps
  };
};

const getDescriptionUIEffect = (changedValue: DynamicUIFormValues['description']) => {
  const description = changedValue ?? '';

  return {
    componentProps: {
      rows: description.length > 2 ? 5 : 3,
      style:
        description.length > 2 ? { backgroundColor: '#fff2f0', border: '1px solid #ff4d4f' } : {}
    }
  };
};

const UIConfigDemo: React.FC = () => {
  const [dynamicForm] = Form.useForm();
  // 动态label表单配置 - 展示useInitHandlers处理effect返回值的功能
  const dynamicFormConfig: FormConfig = {
    fields: [
      {
        id: 'title',
        component: 'TextInput',
        label: '工单标题',
        required: true,
        formItemProps: {
          label: (
            <Space>
              <span>🎫</span>
              <span style={{ fontWeight: 'bold', color: '#1890ff' }}>工单标题</span>
              <Tag color="blue">必填</Tag>
            </Space>
          ),
          style: { borderLeft: '4px solid #1890ff', paddingLeft: '12px' },
          className: 'required-field-highlight'
        }
      },
      {
        id: 'requester',
        component: 'TextInput',
        label: '申请人',
        required: true,
        formItemProps: {
          label: (
            <Space>
              <span>👤</span>
              <span style={{ fontWeight: 'bold', color: '#52c41a' }}>申请人</span>
              <Tag color="green">必填</Tag>
            </Space>
          ),
          style: { borderLeft: '4px solid #52c41a', paddingLeft: '12px' },
          className: 'required-field-highlight'
        }
      },
      {
        id: 'status',
        component: 'SelectField',
        label: '工单状态',
        componentProps: {
          options: [
            { label: '待处理', value: 'open' },
            { label: '处理中', value: 'in_progress' },
            { label: '已解决', value: 'resolved' }
          ]
        },
        formItemProps: {
          label: (
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span style={{ fontWeight: 'bold' }}>工单状态</span>
              <Tag color="orange">动态样式</Tag>
            </Space>
          ),
          style: { borderLeft: '4px solid #52c41a', paddingLeft: '12px' }
        },
        effect: (changedValue: DynamicUIFormValues['status'], allValues: DynamicUIFormValues) =>
          getStatusUIEffect(changedValue, allValues)
      },
      {
        id: 'priority',
        component: 'PriorityField',
        label: '工单优先级',
        componentProps: {
          options: [
            { label: '高', value: 'high' },
            { label: '中', value: 'medium' },
            { label: '低', value: 'low' }
          ]
        },
        formItemProps: {
          label: (
            <Space>
              <span>🎯 工单优先级</span>
              <Tag color="blue">默认</Tag>
            </Space>
          ),
          style: { borderLeft: '4px solid #faad14', paddingLeft: '12px' }
        },
        effect: priorityEffect
      },
      {
        id: 'description',
        component: 'TextArea',
        label: '问题描述',
        formItemProps: {
          label: (
            <Space>
              <span>📝</span>
              <span style={{ fontWeight: 'bold', color: '#722ed1' }}>详细描述</span>
              <Tag color="purple">可选</Tag>
            </Space>
          ),
          style: { borderLeft: '4px solid #722ed1', paddingLeft: '12px' }
        },
        componentProps: {
          rows: 3
        },
        effect: (changedValue: DynamicUIFormValues['description']) =>
          getDescriptionUIEffect(changedValue)
      }
    ]
  };

  // 动态label UI配置
  const dynamicUIConfig: UIConfig = {
    colProps: {
      span: 8
    },
    formItemProps: {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
  };

  // 动态表单提交处理
  const handleDynamicSubmit = (values: FormValues) => {
    console.log('动态表单提交:', values);
  };

  // 使用useInitHandlers处理effect函数返回值
  useDemoInitHandlers();

  const componentRegistryConfig: ComponentRegistryConfig = {
    customComponents: { PriorityField }
  };

  return (
    <DynamicForm
      formConfig={dynamicFormConfig}
      uiConfig={dynamicUIConfig}
      componentRegistry={componentRegistryConfig}
      onSubmit={handleDynamicSubmit}
      form={dynamicForm}
    />
  );
};

export default UIConfigDemo;
