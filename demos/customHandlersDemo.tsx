import React, { useEffect, useMemo, useState } from 'react';
import { Card, Space, Typography, Alert, Spin, SelectProps, Form } from 'antd';
import { exampleHandlers } from './customHandlers';
import { FlatFormConfig, FormValues } from '@/exports';
import { DynamicForm } from '@/exports';
import { useDemoInitHandlers } from './useDemoInitHandlers';

const { Title, Paragraph } = Typography;

type DemoFormValues = {
  name: string;
  status: string;
  age: number | string;
  email: string;
  emailNote?: string;
  fruit: string[];
  multipleSelect: string[];
};

const getNameStyleEffect = (changedValue: DemoFormValues['name'], _allValues: DemoFormValues) => {
  // 使用自定义样式处理器
  return {
    formItemProps: {
      style: {
        backgroundColor: changedValue === 'admin' ? '#ff4d4f' : '#52c41a',
        color: changedValue === 'admin' ? '#ff4d4f' : '#52c41a',
        fontSize: '16px'
      }
    }
  };
};

const getAgeTransformEffect = (changedValue: DemoFormValues['age'], _allValues: DemoFormValues) => {
  // 使用数据转换处理器
  return {
    dataTransform: changedValue
  };
};

const getEmailNoteDisplayEffect = (
  _changedValue: DemoFormValues['email'],
  allValues: DemoFormValues
) => ({
  conditionalDisplay: {
    condition: !allValues.email || allValues.email.includes('@'),
    message: '请输入有效的邮箱地址'
  }
});

const getStatusChainedEffect = (
  changedValue: DemoFormValues['status'],
  _allValues: DemoFormValues
) => {
  // 使用链式处理器
  return {
    chained: [
      {
        type: 'style',
        value: {
          backgroundColor: changedValue === 'active' ? '#52c41a' : '#ff4d4f',
          textColor: 'white',
          fontSize: '14px'
        }
      },
      {
        type: 'transform',
        value: changedValue.toUpperCase()
      }
    ]
  };
};

const options: SelectProps['options'] = [];

for (let i = 10; i < 36; i++) {
  options.push({
    value: i.toString(36) + i,
    label: i.toString(36) + i
  });
}

const getConfig = (initialValues: DemoFormValues): FlatFormConfig => {
  const demoFormConfig = {
    fields: [
      {
        id: 'name',
        label: '姓名',
        component: 'TextInput',
        span: 24,
        initialValue: () => {
          return {
            value: initialValues.name,
            formItemProps: {
              style: {
                backgroundColor: initialValues.name === 'admin' ? '#ff4d4f' : '#52c41a',
                color: initialValues.name === 'admin' ? '#ff4d4f' : '#52c41a',
                fontSize: '16px'
              }
            }
          };
        },
        effect: (changedValue: DemoFormValues['name'], allValues: FormValues) =>
          getNameStyleEffect(changedValue, allValues as DemoFormValues)
      },
      {
        id: 'age',
        label: '年龄',
        component: 'TextInput',
        span: 24,
        effect: (changedValue: DemoFormValues['age'], allValues: FormValues) =>
          getAgeTransformEffect(changedValue, allValues as DemoFormValues)
      },
      {
        id: 'email',
        label: '邮箱',
        component: 'TextInput',
        span: 24,
        dependents: ['emailNote']
      },
      {
        id: 'emailNote',
        label: '邮箱备注',
        component: 'TextInput',
        span: 24,
        initialValue: '邮箱有效时显示；隐藏时不会提交旧值，再显示时会恢复。',
        effect: (changedValue: DemoFormValues['email'], allValues: FormValues) =>
          getEmailNoteDisplayEffect(changedValue, allValues as DemoFormValues)
      },
      {
        id: 'status',
        label: '状态',
        component: 'SelectField',
        span: 24,
        options: [
          { value: 'active', label: '激活' },
          { value: 'inactive', label: '未激活' }
        ],
        initialValue: () => {
          const color = initialValues.status === 'active' ? '#52c41a' : '#ff4d4f';
          return {
            formItemProps: {
              style: {
                backgroundColor: initialValues.status ? color : '#7FFFAA'
              }
            }
          };
        },
        effect: (changedValue: DemoFormValues['status'], allValues: FormValues) =>
          getStatusChainedEffect(changedValue, allValues as DemoFormValues)
      },
      {
        id: 'fruit',
        label: '水果',
        component: 'CheckboxGroup',
        span: 24,
        componentProps: {
          options: [
            { label: 'Apple', value: 'Apple', className: 'label-1' },
            { label: 'Pear', value: 'Pear', className: 'label-2' },
            { label: 'Orange', value: 'Orange', className: 'label-3' }
          ],
          style: { width: 800 }
        }
      },
      {
        id: 'multipleSelect',
        label: '多选',
        component: 'Select',
        span: 24,
        componentProps: {
          options,
          mode: 'multiple'
          // style: { width: 800 }
        }
      }
    ]
  };

  return demoFormConfig;
};

const mockFetchFormData = (): Promise<DemoFormValues> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'admin',
        // status: 'ACTIVE',
        status: '',
        age: 10,
        email: 'whynotsnow@163.com',
        fruit: ['Apple', 'Orange'],
        multipleSelect: ['a10', 'b11', 'h17']
      });
    }, 800);
  });
};

const CustomHandlersDemo: React.FC = () => {
  const { registeredCount } = useDemoInitHandlers({ handlers: exampleHandlers });

  const handleSubmit = (values: DemoFormValues) => {
    console.log('表单提交:', values);
  };

  const [initialValues, setInitialValues] = useState<DemoFormValues>();
  const [form] = Form.useForm();

  useEffect(() => {
    async function fetchData() {
      const data = await mockFetchFormData();
      setInitialValues(data);
    }
    fetchData();
  }, []);

  const memoConfig = useMemo(() => {
    if (initialValues) {
      return getConfig(initialValues);
    }
  }, [initialValues]);

  // 有数据才渲染
  if (!initialValues) return <Spin />;

  return (
    <div style={{ padding: '20px' }}>
      <Alert
        message="处理器初始化成功"
        description={`成功注册了 ${registeredCount} 个处理器`}
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Card title="自定义处理器演示">
        <Space direction="vertical">
          <Title level={4}>自定义处理器功能</Title>

          <Paragraph>这个演示展示了如何使用自定义的 EffectResultHandler：</Paragraph>

          <ul>
            <li>
              <strong>customStyle</strong>: 根据字段值动态改变样式
            </li>
            <li>
              <strong>dataTransform</strong>: 转换数据格式（年龄自动乘以2）
            </li>
            <li>
              <strong>conditionalDisplay</strong>: 根据条件控制字段显示
            </li>
            <li>
              <strong>chained</strong>: 链式处理多个效果
            </li>
          </ul>

          <Paragraph>
            <strong>使用说明：</strong>
          </Paragraph>
          <ol>
            <li>在&quot;姓名&quot;字段输入 &quot;admin&quot; 会触发红色背景样式</li>
            <li>在&quot;年龄&quot;字段输入数字会自动乘以2（如输入10显示20）</li>
            <li>
              在&quot;邮箱&quot;字段输入无效邮箱会隐藏&quot;邮箱备注&quot;字段，隐藏时清理提交值，重新显示时恢复原值
            </li>
            <li>在&quot;状态&quot;字段选择不同状态会应用不同样式和数据转换</li>
          </ol>
        </Space>
      </Card>

      <div style={{ padding: 24, maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <DynamicForm
          formConfig={memoConfig as FlatFormConfig}
          values={initialValues}
          form={form}
          onSubmit={(values) => handleSubmit(values as DemoFormValues)}
          submitButtonText="提交表单"
        />
      </div>
    </div>
  );
};

export default CustomHandlersDemo;
