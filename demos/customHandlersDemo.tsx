import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Form } from 'antd';
import { exampleHandlers } from './customHandlers';
import { FlatFormConfig, FormValues } from '@/exports';
import { DynamicForm } from '@/exports';
import { useDemoInitHandlers } from './useDemoInitHandlers';
import { useDemoSubmitResult } from './useDemoSubmitResult';
import DemoLoading from './DemoLoading';

type DemoFormValues = {
  name: string;
  status: string;
  age: number | string;
  email: string;
  emailNote?: string;
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
      }
    ]
  };

  return demoFormConfig;
};

const mockFetchFormData = (): Promise<DemoFormValues> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: '普通用户',
        // status: 'ACTIVE',
        status: '',
        age: 10,
        email: 'whynotsnow@163.com'
      });
    }, 800);
  });
};

const CustomHandlersDemo: React.FC = () => {
  const { registeredCount } = useDemoInitHandlers({ handlers: exampleHandlers });
  const { showSubmitResult, submitResultModal } = useDemoSubmitResult();

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
  if (!initialValues) return <DemoLoading />;

  return (
    <div>
      <Alert
        message="处理器初始化成功"
        description={`成功注册了 ${registeredCount} 个处理器`}
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <div style={{ maxWidth: 720, width: '100%' }}>
        <DynamicForm
          formConfig={memoConfig as FlatFormConfig}
          values={initialValues}
          form={form}
          onSubmit={(values) => {
            const submittedValues = values as DemoFormValues;
            handleSubmit(submittedValues);
            showSubmitResult(submittedValues);
          }}
          submitButtonText="提交表单"
        />
      </div>
      {submitResultModal}
    </div>
  );
};

export default CustomHandlersDemo;
