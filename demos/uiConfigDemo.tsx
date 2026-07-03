import React from 'react';
import DynamicForm from '@/index';
import type { ComponentRegistryConfig, FormConfig, FormValues, UIConfig } from '@/exports';
import { Tag, Space, Form } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useDemoInitHandlers } from './useDemoInitHandlers';
import { PriorityField, priorityEffect } from '../demos/customComponents/PriorityField';

type DynamicUIFormValues = {
  username?: string;
  email?: string;
  status?: 'active' | 'pending' | 'disabled';
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

  if (status === 'active') {
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
  } else if (status === 'pending') {
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
  } else if (status === 'disabled') {
    uiConfigUpdates.formProps = {
      style: { backgroundColor: '#fff2f0', border: '2px solid #ff4d4f' }
    };
    uiConfigUpdates.buttonProps = {
      type: 'default',
      style: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f', color: 'white' }
    };
    uiConfigUpdates.cardProps = {
      style: { borderColor: '#ff4d4f', backgroundColor: '#fff2f0' }
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
        id: 'username',
        component: 'TextInput',
        label: '用户名',
        required: true,
        formItemProps: {
          label: (
            <Space>
              <span>👤</span>
              <span style={{ fontWeight: 'bold', color: '#1890ff' }}>用户名</span>
              <Tag color="blue">必填</Tag>
            </Space>
          ),
          style: { borderLeft: '4px solid #1890ff', paddingLeft: '12px' },
          className: 'required-field-highlight'
        }
      },
      {
        id: 'email',
        component: 'TextInput',
        label: '邮箱',
        required: true,
        formItemProps: {
          label: (
            <Space>
              <span>📧</span>
              <span style={{ fontWeight: 'bold', color: '#52c41a' }}>邮箱地址</span>
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
        label: '状态',
        componentProps: {
          options: [
            { label: '活跃', value: 'active' },
            { label: '待审核', value: 'pending' },
            { label: '已禁用', value: 'disabled' }
          ]
        },
        formItemProps: {
          label: (
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span style={{ fontWeight: 'bold' }}>当前状态</span>
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
        label: '优先级',
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
              <span>😋 默认优先级</span>
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
        label: '描述',
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
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2>动态/静态 全局配置字段配置演示</h2>
        <ul>
          <li>
            <strong>全局配置</strong>
            ：状态字段影响全局UIConfig（formProps、buttonProps、cardProps等），存储在store的dynamicUIConfig中
          </li>
          <li>
            <strong>字段级别配置</strong>
            ：优先级字段影响自身配置（formItemProps、componentProps、style、className、rules等），存储在字段的meta中
          </li>
        </ul>
        <p>配置优先级：字段级别配置 &gt; 动态全局配置 &gt; 静态全局配置</p>
        <div
          style={{
            border: '2px solid #1890ff',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f0f8ff'
          }}
        >
          <DynamicForm
            formConfig={dynamicFormConfig}
            uiConfig={dynamicUIConfig}
            componentRegistry={componentRegistryConfig}
            onSubmit={handleDynamicSubmit}
            form={dynamicForm}
          />
        </div>
      </div>
    </div>
  );
};

export default UIConfigDemo;
