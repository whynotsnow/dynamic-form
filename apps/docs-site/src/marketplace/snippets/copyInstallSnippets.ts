import { translate } from '@docusaurus/Translate';

export const searchSelectFieldSource = `import React, { useMemo, useState } from 'react';
import { Select } from 'antd';
import type { FieldComponentProps } from '@whynotsnow/dynamic-form';

interface SearchOption {
  label: string;
  value: string;
}

const SAMPLE_OPTIONS: SearchOption[] = [
  { label: '${translate({ id: 'marketplace.snippet.search.optionBeijing', message: '北京研发中心' })}', value: 'beijing-rd' },
  { label: '${translate({ id: 'marketplace.snippet.search.optionShanghai', message: '上海交付中心' })}', value: 'shanghai-delivery' },
  { label: '${translate({ id: 'marketplace.snippet.search.optionHangzhou', message: '杭州产品团队' })}', value: 'hangzhou-product' }
];

export const SearchSelectField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  field: _field,
  form: _form,
  formAdapter: _formAdapter,
  ...restProps
}) => {
  const [keyword, setKeyword] = useState('');

  const options = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return SAMPLE_OPTIONS;
    return SAMPLE_OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(normalizedKeyword)
    );
  }, [keyword]);

  return (
    <Select
      showSearch
      allowClear
      value={value}
      options={options}
      filterOption={false}
      onSearch={setKeyword}
      onChange={onChange}
      placeholder="${translate({ id: 'marketplace.snippet.search.placeholder', message: '搜索团队' })}"
      {...restProps}
    />
  );
};`;

export const userPickerFieldSource = `import React from 'react';
import { Avatar, Select, Space } from 'antd';
import type { FieldComponentProps } from '@whynotsnow/dynamic-form';

const users = [
  { label: '${translate({ id: 'marketplace.snippet.user.productOwner', message: '陈静 / 产品负责人' })}', value: 'chenjing', avatar: '${translate({ id: 'marketplace.snippet.user.avatarChen', message: '陈' })}' },
  { label: '${translate({ id: 'marketplace.snippet.user.frontendEngineer', message: '李雷 / 前端工程师' })}', value: 'lilei', avatar: '${translate({ id: 'marketplace.snippet.user.avatarLi', message: '李' })}' },
  { label: '${translate({ id: 'marketplace.snippet.user.qaOwner', message: '王敏 / 测试负责人' })}', value: 'wangmin', avatar: '${translate({ id: 'marketplace.snippet.user.avatarWang', message: '王' })}' }
];

export const UserPickerField: React.FC<FieldComponentProps> = ({
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
      value={value}
      options={users}
      optionRender={(option) => (
        <Space>
          <Avatar size="small">{option.data.avatar}</Avatar>
          <span>{option.data.label}</span>
        </Space>
      )}
      onChange={onChange}
      placeholder="${translate({ id: 'marketplace.snippet.user.placeholder', message: '选择负责人' })}"
      {...restProps}
    />
  );
};`;

export const editableTableFieldSource = `import React from 'react';
import { EditableProTable, type ProColumns } from '@ant-design/pro-components';
import type { FieldComponentProps } from '@whynotsnow/dynamic-form';

interface LineItem {
  id: string;
  name?: string;
  quantity?: number;
  price?: number;
}

const columns: ProColumns<LineItem>[] = [
  { title: '${translate({ id: 'marketplace.snippet.table.project', message: '项目' })}', dataIndex: 'name', formItemProps: { rules: [{ required: true }] } },
  { title: '${translate({ id: 'marketplace.snippet.table.quantity', message: '数量' })}', dataIndex: 'quantity', valueType: 'digit' },
  { title: '${translate({ id: 'marketplace.snippet.table.unitPrice', message: '单价' })}', dataIndex: 'price', valueType: 'money' },
  { title: '${translate({ id: 'marketplace.snippet.table.actions', message: '操作' })}', valueType: 'option' }
];

export const EditableTableField: React.FC<FieldComponentProps> = ({
  value,
  onChange
}) => {
  return (
    <EditableProTable<LineItem>
      rowKey="id"
      value={Array.isArray(value) ? value : []}
      columns={columns}
      recordCreatorProps={{
      creatorButtonText: '${translate({ id: 'marketplace.snippet.table.addRow', message: '添加明细' })}',
      record: () => ({ id: String(Date.now()) })
      }}
      editable={{
        type: 'multiple',
        onValuesChange: (_, rows) => onChange?.(rows)
      }}
    />
  );
};`;

export const toastHandlerSource = `import type { CustomEffectResultHandler } from '@whynotsnow/dynamic-form';
import { message } from 'antd';

export const toastHandler: CustomEffectResultHandler = {
  name: 'toast',
  description: '${translate({ id: 'marketplace.snippet.toast.description', message: '展示轻量反馈消息' })}',
  canHandle: (key) => key === 'toast',
  validate: (value) =>
    typeof value === 'string' ||
    (typeof value?.content === 'string' &&
      (value.type === undefined || ['info', 'success', 'warning', 'error'].includes(value.type))),
  handle: (_context, value) => {
    if (typeof value === 'string') {
      message.info(value);
      return;
    }

    const type = ['info', 'success', 'warning', 'error'].includes(value.type) ? value.type : 'info';
    message[type](value.content);
  }
};`;

export const highlightHandlerSource = `import type { CustomEffectResultHandler } from '@whynotsnow/dynamic-form';

export const highlightHandler: CustomEffectResultHandler = {
  name: 'highlight',
  description: '${translate({ id: 'marketplace.snippet.highlight.description', message: '通过 componentProps 标记字段高亮状态' })}',
  canHandle: (key) => key === 'highlight',
  validate: (value) => typeof value === 'boolean',
  handle: (context, enabled) => {
    context.updateFieldMeta({
      componentProps: {
        className: enabled ? 'field-highlight' : undefined,
        style: enabled ? { backgroundColor: '#fffbe6' } : undefined
      },
      formItemProps: {
          extra: enabled ? '${translate({ id: 'marketplace.snippet.highlight.extra', message: '当前字段已触发高亮提示' })}' : undefined
      }
    });
  }
};`;

export const fieldErrorsHandlerSource = `import type { CustomEffectResultHandler } from '@whynotsnow/dynamic-form';

export const fieldErrorsHandler: CustomEffectResultHandler = {
  name: 'fieldErrors',
  description: '${translate({ id: 'marketplace.snippet.fieldErrors.description', message: '把服务端字段错误写入 Ant Design Form' })}',
  canHandle: (key) => key === 'fieldErrors',
  validate: (value) => value != null && typeof value === 'object',
  handle: (context, errors) => {
    context.form.setFields(
      Object.entries(errors).map(([name, message]) => ({
        name,
        errors: Array.isArray(message) ? message : [String(message)]
      }))
    );
  }
};`;

export function getRegisterComponentSource(componentName: string) {
  return `import { DynamicForm } from '@whynotsnow/dynamic-form';
import { ${componentName} } from './${componentName}';

const componentRegistry = {
  customComponents: {
    ${componentName}
  }
};

export function FormPage() {
  return (
    <DynamicForm
      formConfig={formConfig}
      componentRegistry={componentRegistry}
    />
  );
}`;
}

export function getRegisterHandlerSource(handlerName: string) {
  return `import { DynamicForm, useInitHandlers } from '@whynotsnow/dynamic-form';
import { ${handlerName} } from './${handlerName}';

export function FormPage() {
  useInitHandlers({ handlers: [${handlerName}] });

  return <DynamicForm formConfig={formConfig} />;
}`;
}
