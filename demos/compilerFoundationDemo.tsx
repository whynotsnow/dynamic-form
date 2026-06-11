import React, { useMemo } from 'react';
import { Card, Form, Select, Space, Typography } from 'antd';
import {
  DynamicForm,
  ModuleRegistryManager,
  compileAdaptedFormConfig,
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

    return compileAdaptedFormConfig(
      {
        type: 'object',
        'x-dynamic-form': {
          groups: [
            {
              id: 'reviewGroup',
              title: 'Review Departments / 审核部门',
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
        properties: {
          ownerDepartment: {
            type: 'string',
            title: 'Owner Department / 归属部门',
            'x-dynamic-form': {
              module: 'DepartmentPicker'
            }
          },
          reviewDepartment: {
            type: 'string',
            title: 'Review Department / 审核部门',
            'x-dynamic-form': {
              module: 'DepartmentPicker',
              groupId: 'reviewGroup'
            }
          }
        }
      },
      {
        adapterType: 'json-schema',
        moduleRegistry: registry,
        groupOverrides: {
          reviewGroup: {
            // Schema 不能携带函数；业务 effect 在 adapter 后、compiler 前注入。
            effect: () => ({ visible: false })
          }
        }
      }
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
            本示例把 Schema 适配为 mixed module config，并通过 groupOverrides 注入函数 effect。
          </Paragraph>
          <Paragraph>
            This demo adapts Schema into mixed module config and injects a function effect through
            groupOverrides before compilation.
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
