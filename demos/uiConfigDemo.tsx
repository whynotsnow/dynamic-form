import React from 'react';
import DynamicForm from '@/index';
import { ComponentRegistryConfig, FieldComponentProps, FormConfig, UIConfig } from '@/types';
import { Tag, Space, Form, Select } from 'antd';
import { CheckCircleOutlined, StarOutlined } from '@ant-design/icons';
import { useInitHandlers } from '@/hooks';

const PriorityField: React.FC<FieldComponentProps> = ({ field, form }) => {
  // 在自定义组件内部处理 label 的动态展示
  const value = form.getFieldValue('priority');
  const renderLabel = () => {
    if (value === 'high') {
      return (
        <Space>
          <span>🔥 高优先级</span>
          <Tag color="red">重要</Tag>
        </Space>
      );
    }
    if (value === 'low') {
      return (
        <Space>
          <span>🧊 低优先级</span>
          <Tag color="blue">次要</Tag>
        </Space>
      );
    }
    return field?.formItemProps?.label || '优先级';
  };

  return (
    <Form.Item label={renderLabel()} name={field.id}>
      <Select options={field.componentProps?.options} />
    </Form.Item>
  );
};

(PriorityField as any).wrapWithFormItem = false;

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
              <Tag color="orange">动态</Tag>
            </Space>
          ),
          style: { borderLeft: '4px solid #52c41a', paddingLeft: '12px' }
        },
        effect: (_changedValue, allValues) => {
          const status = allValues.status;

          // 新增：测试UIConfig动态配置
          const uiConfigUpdates: any = {};

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
        }
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
              <StarOutlined style={{ color: '#faad14' }} />
              <span style={{ fontWeight: 'bold' }}>优先级设置</span>
              <Tag color="red">重要1</Tag>
            </Space>
          ),
          style: { borderLeft: '4px solid #faad14', paddingLeft: '12px' }
        }
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
        effect: (changedValue) => {
          return {
            componentProps: {
              rows: changedValue?.length > 2 ? 5 : 3,
              style:
                changedValue?.length > 2
                  ? { backgroundColor: '#fff2f0', border: '1px solid #ff4d4f' }
                  : {}
            }
          };
        }
      }
    ]
  };

  // 动态label UI配置
  const dynamicUIConfig: UIConfig = {
    formItemProps: {
      labelCol: { span: 12 },
      wrapperCol: { span: 12 }
    }
  };

  // 动态表单提交处理
  const handleDynamicSubmit = (values: any) => {
    console.log('动态表单提交:', values);
  };

  // 使用useInitHandlers处理effect函数返回值
  useInitHandlers({
    enabled: true,
    handlers: [],
    options: { override: false },
    debug: true
  });

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
