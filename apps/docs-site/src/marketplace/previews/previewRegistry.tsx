import React, { useMemo, useState } from 'react';
import { Avatar, Form, message, Select, Space } from 'antd';
import { EditableProTable, type ProColumns } from '@ant-design/pro-components';
import type {
  ComponentRegistryConfig,
  CustomEffectResultHandler,
  FieldComponentProps,
  FlatFormConfig,
  FormConfig,
  GroupedFormConfig,
  UIConfig
} from '@whynotsnow/dynamic-form';
import { DynamicForm, useInitHandlers } from '@whynotsnow/dynamic-form';
import styles from '../../pages/marketplace.module.css';

export type MarketplacePreviewComponent = React.FC;

const baseFormProps = {
  formProps: { layout: 'vertical' as const },
  submitAreaProps: { style: { display: 'none' } }
} satisfies UIConfig;

const previewShellStyle: React.CSSProperties = {
  maxWidth: 720
};

function DynamicFormPreview({
  formConfig,
  componentRegistry,
  handlers,
  uiConfig,
  values
}: {
  formConfig: FormConfig;
  componentRegistry?: ComponentRegistryConfig;
  handlers?: CustomEffectResultHandler[];
  uiConfig?: UIConfig;
  values?: Record<string, unknown>;
}) {
  const [form] = Form.useForm();
  useInitHandlers({
    handlers,
    options: { override: true }
  });

  return (
    <div style={previewShellStyle}>
      <DynamicForm
        componentRegistry={componentRegistry}
        form={form}
        formConfig={formConfig}
        submitButtonText="提交"
        uiConfig={{ ...baseFormProps, ...uiConfig }}
        values={values}
      />
    </div>
  );
}

function createBuiltinComponentPreview(component: string): MarketplacePreviewComponent {
  return function BuiltinComponentPreview() {
    const field = useMemo(() => {
      const baseField = {
        id: 'previewField',
        label: component,
        component,
        span: 24
      };

      if (component === 'SelectField') {
        return {
          ...baseField,
          options: [
            { label: '待处理', value: 'pending' },
            { label: '已完成', value: 'done' }
          ]
        };
      }

      if (component === 'Select') {
        return {
          ...baseField,
          componentProps: {
            options: [
              { label: '华东区域', value: 'east' },
              { label: '华北区域', value: 'north' }
            ]
          }
        };
      }

      if (component === 'CheckboxGroup') {
        return {
          ...baseField,
          componentProps: {
            options: [
              { label: '读取', value: 'read' },
              { label: '编辑', value: 'write' }
            ]
          }
        };
      }

      if (component === 'TextArea') {
        return {
          ...baseField,
          componentProps: { rows: 3, placeholder: '请输入说明' }
        };
      }

      return baseField;
    }, []);

    return (
      <DynamicFormPreview
        formConfig={{ fields: [field] } as FlatFormConfig}
        values={{ previewField: component === 'TextDisplay' ? '系统计算结果' : undefined }}
      />
    );
  };
}

function createBuiltinHandlerPreview(handlerName: string): MarketplacePreviewComponent {
  return function BuiltinHandlerPreview() {
    const formConfig = useMemo<FormConfig>(() => {
      if (handlerName === 'groupsVisible') {
        return {
          groups: [
            {
              id: 'control',
              title: '控制区',
              fields: [
                {
                  id: 'enabled',
                  label: '显示高级分组',
                  component: 'Switch',
                  dependents: ['advancedNote']
                }
              ]
            },
            {
              id: 'advanced',
              title: '高级分组',
              fields: [
                {
                  id: 'advancedNote',
                  label: '高级说明',
                  component: 'TextInput',
                  initialValue: '打开开关后显示',
                  effect: (_value: unknown, allValues: Record<string, unknown>) => ({
                    groupsVisible: { advanced: allValues.enabled === true }
                  })
                }
              ]
            }
          ]
        } as GroupedFormConfig;
      }

      const resultByHandler: Record<string, unknown> = {
        value: '已由 value handler 写入',
        visible: true,
        disabled: true,
        readonly: true,
        formItemProps: { extra: 'formItemProps handler 写入的提示' },
        componentProps: { placeholder: 'componentProps handler 写入的 placeholder' },
        formProps: { layout: 'horizontal', labelCol: { span: 6 }, wrapperCol: { span: 18 } },
        buttonProps: { type: 'dashed' },
        cardProps: { size: 'small' },
        rowProps: { gutter: 24 },
        colProps: { span: 24 },
        submitAreaProps: { style: { display: 'none' } }
      };

      return {
        fields: [
          {
            id: 'enabled',
            label: '触发内置 handler',
            component: 'Switch',
            dependents: ['target']
          },
          {
            id: 'target',
            label: '目标字段',
            component: handlerName === 'readonly' ? 'TextArea' : 'TextInput',
            initialValue: handlerName === 'visible' ? { visible: false } : '预览字段',
            effect: (_value: unknown, allValues: Record<string, unknown>) => {
              if (allValues.enabled !== true) {
                return handlerName === 'visible' ? { visible: false } : {};
              }

              return {
                [handlerName]: resultByHandler[handlerName]
              };
            }
          }
        ]
      } as FlatFormConfig;
    }, []);

    return <DynamicFormPreview formConfig={formConfig} />;
  };
}

const remoteOptions = [
  { label: '北京研发中心', value: 'beijing-rd' },
  { label: '上海交付中心', value: 'shanghai-delivery' },
  { label: '杭州产品团队', value: 'hangzhou-product' }
];

const RemoteSelectField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  field,
  form,
  ...restProps
}) => {
  const [keyword, setKeyword] = useState('');
  const options = remoteOptions.filter((option) => option.label.includes(keyword.trim()));

  return (
    <Select
      allowClear
      filterOption={false}
      onChange={onChange}
      onSearch={setKeyword}
      options={options.length > 0 ? options : remoteOptions}
      placeholder="搜索团队"
      showSearch
      value={value}
      {...restProps}
    />
  );
};

const users = [
  { label: '陈静 / 产品负责人', value: 'chenjing', avatar: '陈' },
  { label: '李雷 / 前端工程师', value: 'lilei', avatar: '李' },
  { label: '王敏 / 测试负责人', value: 'wangmin', avatar: '王' }
];

const UserPickerField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  field,
  form,
  ...restProps
}) => {
  return (
    <Select
      allowClear
      onChange={onChange}
      optionRender={(option) => (
        <Space>
          <Avatar size="small">{option.data.avatar}</Avatar>
          <span>{option.data.label}</span>
        </Space>
      )}
      options={users}
      placeholder="选择负责人"
      value={value}
      {...restProps}
    />
  );
};

interface LineItem {
  id: string;
  name?: string;
  quantity?: number;
  price?: number;
}

const editableColumns: ProColumns<LineItem>[] = [
  {
    title: '项目',
    dataIndex: 'name',
    width: 160,
    formItemProps: { rules: [{ required: true }] },
    fieldProps: { placeholder: '项目名称' }
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    valueType: 'digit',
    width: 92,
    fieldProps: { min: 1, precision: 0 }
  },
  {
    title: '单价',
    dataIndex: 'price',
    valueType: 'money',
    width: 112,
    fieldProps: { min: 0 }
  },
  { title: '操作', valueType: 'option', width: 72 }
];

const EditableTableField: React.FC<FieldComponentProps> = ({ value, onChange }) => {
  return (
    <div className={styles.editableTablePreview}>
      <EditableProTable<LineItem>
        bordered
        columns={editableColumns}
        editable={{
          type: 'multiple',
          onValuesChange: (_, rows) => onChange(rows)
        }}
        options={false}
        pagination={false}
        recordCreatorProps={{
          creatorButtonText: '添加明细',
          record: () => ({ id: String(Date.now()) })
        }}
        rowKey="id"
        search={false}
        size="small"
        tableLayout="fixed"
        value={Array.isArray(value) ? value : []}
      />
    </div>
  );
};

const toastHandler: CustomEffectResultHandler = {
  name: 'toast',
  description: '展示轻量反馈消息',
  canHandle: (key) => key === 'toast',
  handle: (_context, value) => {
    message.info(typeof value === 'string' ? value : value?.content);
  }
};

const highlightHandler: CustomEffectResultHandler = {
  name: 'highlight',
  description: '通过 componentProps 标记字段高亮状态',
  canHandle: (key) => key === 'highlight',
  handle: (context, enabled) => {
    context.updateFieldMeta({
      componentProps: {
        className: enabled ? 'field-highlight' : undefined
      },
      formItemProps: {
        extra: enabled ? '当前字段已触发高亮提示' : undefined
      }
    });
  }
};

const fieldErrorsHandler: CustomEffectResultHandler = {
  name: 'fieldErrors',
  description: '把服务端字段错误写入 Ant Design Form',
  canHandle: (key) => key === 'fieldErrors',
  handle: (context, errors) => {
    context.form.setFields(
      Object.entries(errors).map(([name, errorMessage]) => ({
        name,
        errors: [String(errorMessage)]
      }))
    );
  }
};

function ComponentSnippetPreview({ component }: { component: string }) {
  const componentRegistry = useMemo<ComponentRegistryConfig>(
    () => ({
      customComponents: {
        RemoteSelectField,
        UserPickerField,
        EditableTableField
      }
    }),
    []
  );

  const componentConfig: Record<string, FlatFormConfig> = {
    RemoteSelectField: {
      fields: [{ id: 'team', label: '团队', component: 'RemoteSelectField' }]
    },
    UserPickerField: {
      fields: [{ id: 'owner', label: '负责人', component: 'UserPickerField' }]
    },
    EditableTableField: {
      fields: [{ id: 'items', label: '明细', component: 'EditableTableField', span: 24 }]
    }
  };

  return (
    <DynamicFormPreview
      componentRegistry={componentRegistry}
      formConfig={componentConfig[component]}
      uiConfig={component === 'EditableTableField' ? { colProps: { span: 24 } } : undefined}
      values={{
        items: [{ id: '1', name: '设计评审', quantity: 1, price: 800 }]
      }}
    />
  );
}

function HandlerSnippetPreview({ handler }: { handler: string }) {
  const handlerConfig: Record<string, FlatFormConfig> = {
    toast: {
      fields: [
        {
          id: 'trigger',
          label: '触发消息',
          component: 'Switch',
          dependents: ['note']
        },
        {
          id: 'note',
          label: '消息字段',
          component: 'TextInput',
          effect: (_value, allValues) =>
            allValues.trigger === true ? { toast: 'toast handler 已触发' } : {}
        }
      ]
    },
    highlight: {
      fields: [
        {
          id: 'important',
          label: '标记重要',
          component: 'Switch',
          dependents: ['summary']
        },
        {
          id: 'summary',
          label: '摘要',
          component: 'TextInput',
          effect: (_value, allValues) => ({ highlight: allValues.important === true })
        }
      ]
    },
    fieldErrors: {
      fields: [
        {
          id: 'validate',
          label: '模拟服务端错误',
          component: 'Switch',
          dependents: ['email']
        },
        {
          id: 'email',
          label: '邮箱',
          component: 'TextInput',
          effect: (_value, allValues) =>
            allValues.validate === true ? { fieldErrors: { email: '邮箱已被占用' } } : {}
        }
      ]
    }
  };

  return (
    <DynamicFormPreview
      formConfig={handlerConfig[handler]}
      handlers={[toastHandler, highlightHandler, fieldErrorsHandler]}
    />
  );
}

function RecipePreview({ recipe }: { recipe: string }) {
  if (recipe === 'remote-search') {
    return <ComponentSnippetPreview component="RemoteSelectField" />;
  }

  if (recipe === 'approver-picker') {
    return <ComponentSnippetPreview component="UserPickerField" />;
  }

  return <ComponentSnippetPreview component="EditableTableField" />;
}

export const previewRegistry: Record<string, MarketplacePreviewComponent> = {
  ...Object.fromEntries(
    [
      'Password',
      'ConfirmPassword',
      'TextInput',
      'NumberInput',
      'SelectField',
      'DatePicker',
      'Switch',
      'Rate',
      'TextDisplay',
      'CheckboxGroup',
      'Select',
      'TextArea'
    ].map((component) => [
      `builtin-component-${component}`,
      createBuiltinComponentPreview(component)
    ])
  ),
  ...Object.fromEntries(
    [
      'value',
      'visible',
      'disabled',
      'readonly',
      'groupsVisible',
      'formItemProps',
      'componentProps',
      'formProps',
      'buttonProps',
      'cardProps',
      'rowProps',
      'colProps',
      'submitAreaProps'
    ].map((handler) => [`builtin-handler-${handler}`, createBuiltinHandlerPreview(handler)])
  ),
  'snippet-component-remote-select': () => (
    <ComponentSnippetPreview component="RemoteSelectField" />
  ),
  'snippet-component-user-picker': () => <ComponentSnippetPreview component="UserPickerField" />,
  'snippet-component-editable-table': () => (
    <ComponentSnippetPreview component="EditableTableField" />
  ),
  'snippet-handler-toast': () => <HandlerSnippetPreview handler="toast" />,
  'snippet-handler-highlight': () => <HandlerSnippetPreview handler="highlight" />,
  'snippet-handler-field-errors': () => <HandlerSnippetPreview handler="fieldErrors" />,
  'recipe-remote-search': () => <RecipePreview recipe="remote-search" />,
  'recipe-approver-picker': () => <RecipePreview recipe="approver-picker" />,
  'recipe-editable-table': () => <RecipePreview recipe="editable-table" />
};
