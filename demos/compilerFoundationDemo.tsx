import React, { useMemo } from 'react';
import { Card, Form, Select, Space, Typography } from 'antd';
import {
  DynamicForm,
  ModuleRegistryManager,
  compileFormConfig,
  type FieldComponentProps,
  type FieldModule,
  type FormValues
} from '@/exports';
import { useDemoInitHandlers } from './useDemoInitHandlers';

const { Paragraph } = Typography;

const DepartmentPicker: React.FC<FieldComponentProps> = ({ value, onChange, field }) => {
  return <Select value={value} onChange={onChange} {...field.componentProps} />;
};

const departmentModule: FieldModule = {
  type: 'DepartmentPicker',
  component: DepartmentPicker,
  defaultProps: {
    allowClear: true,
    placeholder: 'Select department',
    options: [
      { label: 'Engineering', value: 'engineering' },
      { label: 'Finance', value: 'finance' },
      { label: 'Operations', value: 'operations' }
    ]
  },
  createConfig: (options) => ({
    id: 'departmentId',
    label: String(options?.label ?? 'Department'),
    component: 'Select',
    rules: [{ required: true, message: 'Please select a department' }]
  })
};

const CompilerFoundationDemo: React.FC = () => {
  useDemoInitHandlers();
  const [form] = Form.useForm();

  const compiled = useMemo(() => {
    const registry = new ModuleRegistryManager([departmentModule]);

    return compileFormConfig(
      [
        {
          type: 'DepartmentPicker',
          id: 'ownerDepartment',
          options: { label: 'Owner Department' },
          overrides: {
            span: 12,
            componentProps: {
              placeholder: 'Choose owner department'
            }
          }
        },
        {
          type: 'DepartmentPicker',
          id: 'reviewDepartment',
          options: { label: 'Review Department' },
          overrides: {
            span: 12
          }
        }
      ],
      { registry }
    );
  }, []);

  const handleSubmit = (values: FormValues) => {
    console.log('[CompilerFoundationDemo] submit:', values);
  };

  return (
    <div style={{ padding: 20 }}>
      <Card title="Compiler Foundation Demo" style={{ marginBottom: 20 }}>
        <Space direction="vertical">
          <Paragraph>
            本示例把 FieldModule 编译为标准 FormConfig，再使用现有 DynamicForm runtime 渲染。
          </Paragraph>
          <Paragraph>
            This demo compiles FieldModule definitions into standard FormConfig, then renders the
            result with the existing DynamicForm runtime.
          </Paragraph>
        </Space>
      </Card>

      <DynamicForm
        form={form}
        formConfig={compiled.formConfig}
        componentRegistry={{ customComponents: compiled.componentRegistry }}
        submitButtonText="Submit compiled form"
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CompilerFoundationDemo;
