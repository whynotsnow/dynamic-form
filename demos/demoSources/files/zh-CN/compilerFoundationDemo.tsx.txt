import React, { useMemo } from 'react';
import { Form, Select } from 'antd';
import type { SelectProps } from 'antd';
import {
  DynamicForm,
  ModuleRegistryManager,
  compileAdaptedFormConfig,
  type FieldComponentProps,
  type FieldModule,
  type FormValues,
  type UIConfig
} from '@/exports';
import { useDemoInitHandlers } from './useDemoInitHandlers';
import { useDemoSubmitResult } from './useDemoSubmitResult';

const toText = (value: unknown, fallback: string) => {
  return typeof value === 'string' ? value : fallback;
};

const toBoolean = (value: unknown, fallback = false) => {
  return typeof value === 'boolean' ? value : fallback;
};

const DepartmentPicker: React.FC<FieldComponentProps> = ({ value, onChange, field }) => {
  const componentProps = field.componentProps as SelectProps | undefined;
  return (
    <Select
      value={value as SelectProps['value']}
      onChange={onChange}
      {...componentProps}
      style={{ width: '100%', ...componentProps?.style }}
    />
  );
};

const departmentModule: FieldModule = {
  type: 'DepartmentPicker',
  component: DepartmentPicker,
  defaultProps: {
    allowClear: true,
    placeholder: '选择部门',
    style: { width: '100%' },
    options: [
      { label: '工程部', value: 'engineering' },
      { label: '财务部', value: 'finance' },
      { label: '运营部', value: 'operations' }
    ]
  },
  createConfig: (options) => ({
    id: 'departmentId',
    label: String(options?.label ?? '部门'),
    component: 'Select',
    required: toBoolean(options?.required, true),
    rules: [{ required: toBoolean(options?.required, true), message: '请选择部门' }]
  })
};

const textModule: FieldModule = {
  type: 'TextField',
  createConfig: (options) => ({
    id: 'textField',
    label: toText(options?.label, 'Text'),
    component: 'TextInput',
    required: toBoolean(options?.required),
    componentProps: {
      placeholder: toText(options?.placeholder, '请输入')
    }
  })
};

const selectModule: FieldModule = {
  type: 'SelectFieldModule',
  createConfig: (options) => ({
    id: 'selectField',
    label: toText(options?.label, 'Select'),
    component: 'SelectField',
    required: toBoolean(options?.required),
    componentProps: {
      placeholder: toText(options?.placeholder, '请选择'),
      options: Array.isArray(options?.options) ? options.options : []
    }
  })
};

const numberModule: FieldModule = {
  type: 'NumberField',
  createConfig: (options) => ({
    id: 'numberField',
    label: toText(options?.label, 'Number'),
    component: 'NumberInput',
    componentProps: {
      min: typeof options?.min === 'number' ? options.min : 0,
      max: typeof options?.max === 'number' ? options.max : undefined,
      placeholder: toText(options?.placeholder, '请输入数字')
    }
  })
};

const textareaModule: FieldModule = {
  type: 'TextareaField',
  createConfig: (options) => ({
    id: 'textareaField',
    label: toText(options?.label, 'Textarea'),
    component: 'TextArea',
    componentProps: {
      rows: typeof options?.rows === 'number' ? options.rows : 3,
      placeholder: toText(options?.placeholder, '请输入说明')
    }
  })
};

const CompilerFoundationDemo: React.FC = () => {
  useDemoInitHandlers();
  const [form] = Form.useForm();
  const { showSubmitResult, submitResultModal } = useDemoSubmitResult();

  const compiled = useMemo(() => {
    const registry = new ModuleRegistryManager([
      departmentModule,
      textModule,
      selectModule,
      numberModule,
      textareaModule
    ]);

    return compileAdaptedFormConfig(
      {
        fields: [
          {
            id: 'requestTitle',
            type: 'TextField',
            options: {
              label: '申请标题',
              required: true,
              placeholder: '例如：新增内部系统字段'
            }
          },
          {
            id: 'ownerDepartment',
            type: 'DepartmentPicker',
            options: { label: '归属部门' }
          },
          {
            id: 'priority',
            type: 'SelectFieldModule',
            options: {
              label: '优先级',
              placeholder: '选择优先级',
              options: [
                { label: '高', value: 'high' },
                { label: '中', value: 'medium' },
                { label: '低', value: 'low' }
              ]
            }
          },
          {
            id: 'budget',
            type: 'NumberField',
            options: {
              label: '预算',
              min: 0,
              max: 100000,
              placeholder: '输入预算金额'
            }
          },
          {
            id: 'reviewDepartment',
            type: 'DepartmentPicker',
            groupId: 'reviewGroup',
            options: { label: '审核部门' }
          },
          {
            id: 'riskLevel',
            type: 'SelectFieldModule',
            groupId: 'reviewGroup',
            options: {
              label: '风险等级',
              placeholder: '选择风险等级',
              options: [
                { label: '高', value: 'high' },
                { label: '中', value: 'medium' },
                { label: '低', value: 'low' }
              ]
            }
          },
          {
            id: 'reviewNote',
            type: 'TextareaField',
            groupId: 'reviewGroup',
            options: {
              label: '审核说明',
              rows: 4,
              placeholder: '填写审核关注点'
            }
          }
        ],
        groups: [
          {
            id: 'reviewGroup',
            title: '工程部门技术审核',
            initialVisible: false,
            rules: [
              {
                when: { field: 'ownerDepartment', equals: 'engineering' },
                then: { action: 'show' }
              }
            ]
          }
        ]
      },
      {
        adapterType: 'metadata',
        moduleRegistry: registry,
        groupOverrides: {
          reviewGroup: {
            // 外部 metadata 不携带函数；业务 effect 在 adapter 后、compiler 前注入。
            effect: () => ({ visible: false })
          }
        }
      }
    );
  }, []);

  const handleSubmit = (values: FormValues) => {
    console.log('[CompilerFoundationDemo] submit:', values);
    showSubmitResult(values);
  };

  const uiConfig: UIConfig = {
    formItemProps: {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 }
    },
    colProps: { span: 24 }
  };

  return (
    <div>
      <DynamicForm
        form={form}
        formConfig={compiled.formConfig}
        componentRegistry={{ customComponents: compiled.componentRegistry }}
        submitButtonText="提交编译后表单"
        onSubmit={handleSubmit}
        uiConfig={uiConfig}
      />
      {submitResultModal}
    </div>
  );
};

export default CompilerFoundationDemo;
