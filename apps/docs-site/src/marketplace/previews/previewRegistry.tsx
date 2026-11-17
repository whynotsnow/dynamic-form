import React, { useMemo, useState } from 'react';
import { Avatar, Form, message, Select, Space } from 'antd';
import { translate } from '@docusaurus/Translate';
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

type ToastPayload = {
  content: string;
  type?: 'info' | 'success' | 'warning' | 'error';
};

type FormWithSetFields = {
  setFields: (fields: Array<{ name: string; errors: string[] }>) => void;
};

function isToastPayload(value: unknown): value is ToastPayload {
  if (typeof value !== 'object' || value === null || !('content' in value)) return false;
  const candidate = value as { content?: unknown; type?: unknown };
  return (
    typeof candidate.content === 'string' &&
    (candidate.type === undefined ||
      candidate.type === 'info' ||
      candidate.type === 'success' ||
      candidate.type === 'warning' ||
      candidate.type === 'error')
  );
}

function hasSetFields(value: unknown): value is FormWithSetFields {
  return (
    typeof value === 'object' &&
    value !== null &&
    'setFields' in value &&
    typeof value.setFields === 'function'
  );
}

function isFieldErrorMap(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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
        submitButtonText={translate({ id: 'marketplace.preview.submit', message: '提交' })}
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
            {
              label: translate({ id: 'marketplace.code.optionPending', message: '待处理' }),
              value: 'pending'
            },
            {
              label: translate({ id: 'marketplace.preview.optionDone', message: '已完成' }),
              value: 'done'
            }
          ]
        };
      }

      if (component === 'Select') {
        return {
          ...baseField,
          componentProps: {
            options: [
              {
                label: translate({ id: 'marketplace.preview.regionEast', message: '华东区域' }),
                value: 'east'
              },
              {
                label: translate({ id: 'marketplace.preview.regionNorth', message: '华北区域' }),
                value: 'north'
              }
            ]
          }
        };
      }

      if (component === 'CheckboxGroup') {
        return {
          ...baseField,
          componentProps: {
            options: [
              {
                label: translate({ id: 'marketplace.code.optionRead', message: '读取' }),
                value: 'read'
              },
              {
                label: translate({ id: 'marketplace.preview.optionEdit', message: '编辑' }),
                value: 'write'
              }
            ]
          }
        };
      }

      if (component === 'TextArea') {
        return {
          ...baseField,
          componentProps: {
            rows: 3,
            placeholder: translate({
              id: 'marketplace.preview.enterDescription',
              message: '请输入说明'
            })
          }
        };
      }

      return baseField;
    }, []);

    return (
      <DynamicFormPreview
        formConfig={{ fields: [field] } as FlatFormConfig}
        values={{
          previewField:
            component === 'TextDisplay'
              ? translate({ id: 'marketplace.preview.computedResult', message: '系统计算结果' })
              : undefined
        }}
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
              title: translate({ id: 'marketplace.preview.controlGroup', message: '控制区' }),
              fields: [
                {
                  id: 'enabled',
                  label: translate({
                    id: 'marketplace.preview.showAdvancedGroup',
                    message: '显示高级分组'
                  }),
                  component: 'Switch',
                  dependents: ['advancedNote']
                }
              ]
            },
            {
              id: 'advanced',
              title: translate({ id: 'marketplace.preview.advancedGroup', message: '高级分组' }),
              fields: [
                {
                  id: 'advancedNote',
                  label: translate({ id: 'marketplace.preview.advancedNote', message: '高级说明' }),
                  component: 'TextInput',
                  initialValue: translate({
                    id: 'marketplace.preview.visibleAfterToggle',
                    message: '打开开关后显示'
                  }),
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
        value: translate({
          id: 'marketplace.preview.valueWritten',
          message: '已由 value handler 写入'
        }),
        visible: true,
        disabled: true,
        readonly: true,
        formItemProps: {
          extra: translate({
            id: 'marketplace.preview.formItemHint',
            message: 'formItemProps handler 写入的提示'
          })
        },
        componentProps: {
          placeholder: translate({
            id: 'marketplace.preview.componentPlaceholder',
            message: 'componentProps handler 写入的 placeholder'
          })
        },
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
            label: translate({
              id: 'marketplace.preview.triggerBuiltinHandler',
              message: '触发内置 handler'
            }),
            component: 'Switch',
            dependents: ['target']
          },
          {
            id: 'target',
            label: translate({ id: 'marketplace.preview.targetField', message: '目标字段' }),
            component: handlerName === 'readonly' ? 'TextArea' : 'TextInput',
            initialVisible: handlerName !== 'visible',
            initialValue: translate({
              id: 'marketplace.preview.sampleFieldValue',
              message: '预览字段'
            }),
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

const sampleOptions = [
  {
    label: translate({ id: 'marketplace.snippet.search.optionBeijing', message: '北京研发中心' }),
    value: 'beijing-rd'
  },
  {
    label: translate({ id: 'marketplace.snippet.search.optionShanghai', message: '上海交付中心' }),
    value: 'shanghai-delivery'
  },
  {
    label: translate({ id: 'marketplace.snippet.search.optionHangzhou', message: '杭州产品团队' }),
    value: 'hangzhou-product'
  }
];

const SearchSelectField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  field: _field,
  form: _form,
  formAdapter: _formAdapter,
  ...restProps
}) => {
  const [keyword, setKeyword] = useState('');
  const normalizedKeyword = keyword.trim().toLocaleLowerCase();
  const options = sampleOptions.filter((option) =>
    option.label.toLocaleLowerCase().includes(normalizedKeyword)
  );

  return (
    <Select
      allowClear
      filterOption={false}
      onChange={onChange}
      onSearch={setKeyword}
      options={options}
      placeholder={translate({ id: 'marketplace.snippet.search.placeholder', message: '搜索团队' })}
      showSearch
      value={value}
      {...restProps}
    />
  );
};

const users = [
  {
    label: translate({ id: 'marketplace.snippet.user.productOwner', message: '陈静 / 产品负责人' }),
    value: 'chenjing',
    avatar: translate({ id: 'marketplace.snippet.user.avatarChen', message: '陈' })
  },
  {
    label: translate({
      id: 'marketplace.snippet.user.frontendEngineer',
      message: '李雷 / 前端工程师'
    }),
    value: 'lilei',
    avatar: translate({ id: 'marketplace.snippet.user.avatarLi', message: '李' })
  },
  {
    label: translate({ id: 'marketplace.snippet.user.qaOwner', message: '王敏 / 测试负责人' }),
    value: 'wangmin',
    avatar: translate({ id: 'marketplace.snippet.user.avatarWang', message: '王' })
  }
];

const UserPickerField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  field: _field,
  form: _form,
  formAdapter: _formAdapter,
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
      placeholder={translate({ id: 'marketplace.snippet.user.placeholder', message: '选择负责人' })}
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
    title: translate({ id: 'marketplace.snippet.table.project', message: '项目' }),
    dataIndex: 'name',
    width: 160,
    formItemProps: { rules: [{ required: true }] },
    fieldProps: {
      placeholder: translate({ id: 'marketplace.preview.projectName', message: '项目名称' })
    }
  },
  {
    title: translate({ id: 'marketplace.snippet.table.quantity', message: '数量' }),
    dataIndex: 'quantity',
    valueType: 'digit',
    width: 92,
    fieldProps: { min: 1, precision: 0 }
  },
  {
    title: translate({ id: 'marketplace.snippet.table.unitPrice', message: '单价' }),
    dataIndex: 'price',
    valueType: 'money',
    width: 112,
    fieldProps: { min: 0 }
  },
  {
    title: translate({ id: 'marketplace.snippet.table.actions', message: '操作' }),
    valueType: 'option',
    width: 72
  }
];

const EditableTableField: React.FC<FieldComponentProps> = ({ value, onChange }) => {
  return (
    <div className={styles.editableTablePreview}>
      <EditableProTable<LineItem>
        bordered
        columns={editableColumns}
        editable={{
          type: 'multiple',
          onValuesChange: (_, rows) => onChange?.(rows)
        }}
        options={false}
        pagination={false}
        recordCreatorProps={{
          creatorButtonText: translate({
            id: 'marketplace.snippet.table.addRow',
            message: '添加明细'
          }),
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
  description: translate({
    id: 'marketplace.snippet.toast.description',
    message: '展示轻量反馈消息'
  }),
  canHandle: (key) => key === 'toast',
  handle: (_context, value) => {
    if (typeof value === 'string') {
      message.info(value);
    } else if (isToastPayload(value)) {
      message[value.type ?? 'info'](value.content);
    }
  }
};

const highlightHandler: CustomEffectResultHandler = {
  name: 'highlight',
  description: translate({
    id: 'marketplace.snippet.highlight.description',
    message: '通过 componentProps 标记字段高亮状态'
  }),
  canHandle: (key) => key === 'highlight',
  handle: (context, enabled) => {
    context.updateFieldMeta({
      componentProps: {
        className: enabled ? 'field-highlight' : undefined,
        style: enabled ? { backgroundColor: '#fffbe6' } : undefined
      },
      formItemProps: {
        extra: enabled
          ? translate({
              id: 'marketplace.snippet.highlight.extra',
              message: '当前字段已触发高亮提示'
            })
          : undefined
      }
    });
  }
};

const fieldErrorsHandler: CustomEffectResultHandler = {
  name: 'fieldErrors',
  description: translate({
    id: 'marketplace.snippet.fieldErrors.description',
    message: '把服务端字段错误写入 Ant Design Form'
  }),
  canHandle: (key) => key === 'fieldErrors',
  handle: (context, errors) => {
    if (!hasSetFields(context.form) || !isFieldErrorMap(errors)) return;
    context.form.setFields(
      Object.entries(errors).map(([name, errorMessage]) => ({
        name,
        errors: Array.isArray(errorMessage) ? errorMessage.map(String) : [String(errorMessage)]
      }))
    );
  }
};

function ComponentSnippetPreview({ component }: { component: string }) {
  const componentRegistry = useMemo<ComponentRegistryConfig>(
    () => ({
      customComponents: {
        SearchSelectField,
        UserPickerField,
        EditableTableField
      }
    }),
    []
  );

  const componentConfig: Record<string, FlatFormConfig> = {
    SearchSelectField: {
      fields: [
        {
          id: 'team',
          label: translate({ id: 'marketplace.snippet.search.fieldLabel', message: '团队' }),
          component: 'SearchSelectField'
        }
      ]
    },
    UserPickerField: {
      fields: [
        {
          id: 'owner',
          label: translate({ id: 'marketplace.snippet.user.fieldLabel', message: '负责人' }),
          component: 'UserPickerField'
        }
      ]
    },
    EditableTableField: {
      fields: [
        {
          id: 'items',
          label: translate({ id: 'marketplace.snippet.table.fieldLabel', message: '明细' }),
          component: 'EditableTableField',
          span: 24
        }
      ]
    }
  };

  return (
    <DynamicFormPreview
      componentRegistry={componentRegistry}
      formConfig={componentConfig[component]}
      uiConfig={component === 'EditableTableField' ? { colProps: { span: 24 } } : undefined}
      values={{
        items: [
          {
            id: '1',
            name: translate({ id: 'marketplace.preview.sampleProject', message: '设计评审' }),
            quantity: 1,
            price: 800
          }
        ]
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
          label: translate({ id: 'marketplace.preview.triggerMessage', message: '触发消息' }),
          component: 'Switch',
          dependents: ['note']
        },
        {
          id: 'messageType',
          label: translate({ id: 'marketplace.preview.messageType', message: '消息类型' }),
          component: 'Select',
          initialValue: 'success',
          componentProps: {
            options: [
              { label: 'Info', value: 'info' },
              { label: 'Success', value: 'success' },
              { label: 'Warning', value: 'warning' },
              { label: 'Error', value: 'error' }
            ]
          },
          dependents: ['note']
        },
        {
          id: 'note',
          label: translate({ id: 'marketplace.preview.messageField', message: '消息字段' }),
          component: 'TextInput',
          effect: (_value, allValues) =>
            allValues.trigger === true
              ? {
                  toast: {
                    type: allValues.messageType ?? 'info',
                    content: translate({
                      id: 'marketplace.preview.toastTriggered',
                      message: 'toast handler 已触发'
                    })
                  }
                }
              : {}
        }
      ]
    },
    highlight: {
      fields: [
        {
          id: 'important',
          label: translate({ id: 'marketplace.preview.markImportant', message: '标记重要' }),
          component: 'Switch',
          dependents: ['summary']
        },
        {
          id: 'summary',
          label: translate({ id: 'marketplace.preview.summary', message: '摘要' }),
          component: 'TextInput',
          effect: (_value, allValues) => ({ highlight: allValues.important === true })
        }
      ]
    },
    fieldErrors: {
      fields: [
        {
          id: 'validate',
          label: translate({
            id: 'marketplace.preview.simulateServerError',
            message: '模拟服务端错误'
          }),
          component: 'Switch',
          dependents: ['email']
        },
        {
          id: 'email',
          label: translate({ id: 'marketplace.preview.email', message: '邮箱' }),
          component: 'TextInput',
          effect: (_value, allValues) =>
            allValues.validate === true
              ? {
                  fieldErrors: {
                    email: [
                      translate({
                        id: 'marketplace.snippet.fieldErrors.example',
                        message: '邮箱已被占用'
                      }),
                      translate({
                        id: 'marketplace.preview.emailDomainHint',
                        message: '请使用尚未注册的邮箱'
                      })
                    ]
                  }
                }
              : {}
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
    return <ComponentSnippetPreview component="SearchSelectField" />;
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
  'snippet-component-search-select': () => (
    <ComponentSnippetPreview component="SearchSelectField" />
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
