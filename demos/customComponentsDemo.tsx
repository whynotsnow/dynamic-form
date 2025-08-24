import React, { useEffect, useMemo, useState } from 'react';
import type {
  ComponentRegistryConfig,
  FieldState,
  GroupedFormConfig,
  RenderFieldItemParams
} from '../types';
import DynamicForm from '../index';
import { useInitHandlers } from '../exports';
import { exampleHandlers } from './customHandlers';
import { customComponents } from './customComponents';
import { Button, Form, message, Space, Spin } from 'antd';
import { mockFetchFormData } from '../utils/utils';

// 组件注册器配置
const componentRegistryConfig: ComponentRegistryConfig = {
  customComponents,
  allowOverride: false // 不允许覆盖默认组件
};

const ReadOnlyField: React.FC<{ field: FieldState; value: any }> = ({ field, value }) => {
  return (
    <div style={{ padding: '4px 0' }}>
      <strong>{field.label}：</strong>
      <span style={{ color: '#555' }}>{value?.toString() ?? '-'}</span>
    </div>
  );
};

const getConfig = (initialValues: Record<string, any>): GroupedFormConfig => {
  const formConfig = {
    groups: [
      {
        id: 'baseInfo',
        title: '基础信息',
        fields: [
          {
            id: 'name',
            label: '姓名',
            component: 'TextInput',
            span: 12
          },
          {
            id: 'age',
            label: '年龄',
            component: 'NumberInput',
            span: 12
          }
        ]
      },
      {
        id: 'customComponent',
        title: '自定义组件',
        fields: [
          {
            id: 'password',
            label: '密码',
            component: 'EnhancedTextInput', // 覆盖默认的TextInput
            componentProps: {
              placeholder: '请输入密码'
            },
            span: 12
          },
          {
            id: 'category',
            label: '分类',
            component: 'DynamicSelect',
            componentProps: {
              options: [
                { value: 'tech', label: '技术' },
                { value: 'design', label: '设计' }
              ]
            },
            span: 12
          },
          {
            id: 'showExtra',
            label: '显示额外信息',
            component: 'Switch',
            dependents: ['extraInfo'],
            span: 12
          },
          {
            id: 'extraInfo',
            label: '额外信息',
            component: 'TextInput',
            componentProps: {
              placeholder: '请输入额外信息'
            },
            initialValue: () => {
              return {
                visible: initialValues.showExtra === true
              };
            },
            effect: (_changedValue: any, allValues: Record<string, any>) => {
              const showExtra = allValues.showExtra;
              return { visible: showExtra === true };
            },
            span: 12
          },
          {
            id: 'quantity',
            label: '数量',
            component: 'UnitNumberInput',
            componentProps: {
              unit: '件',
              min: 1,
              max: 100
            },
            span: 12
          },
          {
            id: 'email',
            label: '邮箱',
            component: 'EmailInput', // 使用自定义组件
            span: 12
          },
          {
            id: 'satisfaction',
            label: '满意度评分',
            component: 'CustomSlider',
            componentProps: {
              min: 0,
              max: 10
            },
            span: 12
          },
          {
            id: 'themeColor',
            label: '主题颜色',
            component: 'CustomColorPicker',
            span: 12
          },
          {
            id: 'avatar',
            label: '头像上传',
            component: 'CustomUpload',
            span: 12
          },
          {
            id: 'description',
            label: '详细描述',
            component: 'CustomTextArea',
            componentProps: {
              rows: 6,
              placeholder: '请详细描述您的需求...'
            },
            span: 24
          }
        ]
      }
    ]
  };
  return formConfig;
};

const CustomComponentsDemo: React.FC = () => {
  const handleSubmit = (values: Record<string, any>) => {
    console.log('表单提交:', values);
    message.success('表单提交成功！');
  };

  useInitHandlers({
    enabled: true,
    handlers: exampleHandlers,
    options: { override: false },
    debug: true
  });

  const [initialValues, setInitialValues] = useState<Record<string, any>>();
  const [form] = Form.useForm();

  useEffect(() => {
    async function fetchData() {
      const data: Record<string, any> = await mockFetchFormData({
        name: 'asdf',
        age: 18,
        password: 'sdfsasdf',
        category: 'option_3',
        showExtra: true,
        quantity: 88,
        email: 'whynotsnow@163.com',
        satisfaction: 4,
        themeColor: '#10adaa',
        description: '阿斯顿发阿斯顿发SA',
        extraInfo: '信息'
      });
      setInitialValues(data);
    }
    fetchData();
  }, []);

  const memoConfig = useMemo(() => {
    if (initialValues) {
      return getConfig(initialValues);
    }
  }, [initialValues]);

  const renderFieldItem = ({ field, fieldValue, defaultRender }: RenderFieldItemParams) => {
    // 这里可以写你的自定义组件的查看模式时的显示
    if (viewMode === 'customRender') {
      if (field.component === 'CustomUpload') return defaultRender;
      return <ReadOnlyField field={field} value={fieldValue} />;
    }
    return defaultRender;
  };

  const [viewMode, setViewMode] = useState<'customRender' | 'disabledFields'>('disabledFields');

  // 有数据才渲染
  if (!initialValues) return <Spin />;
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type={viewMode === 'disabledFields' ? 'primary' : 'default'}
          onClick={() => setViewMode('disabledFields')}
        >
          控件禁用
        </Button>
        <Button
          type={viewMode === 'customRender' ? 'primary' : 'default'}
          onClick={() => setViewMode('customRender')}
        >
          自定义渲染
        </Button>
      </Space>
      <DynamicForm
        form={form}
        formConfig={memoConfig as GroupedFormConfig}
        uiConfig={{ formProps: { disabled: viewMode === 'disabledFields' } }}
        renderFormInner={({ defaultRender }) => (
          <>
            {defaultRender.fieldsArea}
            {/* 只渲染字段区域，不渲染 submitArea */}
            {/* {defaultRender.submitArea} */}
          </>
        )}
        renderFieldItem={renderFieldItem}
        values={initialValues}
        onSubmit={handleSubmit}
        componentRegistry={componentRegistryConfig}
        submitButtonText="提交表单"
      />
    </div>
  );
};

export default CustomComponentsDemo;
