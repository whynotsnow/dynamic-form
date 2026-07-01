export const remoteSelectFieldSource = `import React, { useMemo, useState } from 'react';
import { Select } from 'antd';
import type { FieldComponentProps } from '@whynotsnow/dynamic-form';

interface RemoteOption {
  label: string;
  value: string;
}

const MOCK_OPTIONS: RemoteOption[] = [
  { label: '北京研发中心', value: 'beijing-rd' },
  { label: '上海交付中心', value: 'shanghai-delivery' },
  { label: '杭州产品团队', value: 'hangzhou-product' }
];

export const RemoteSelectField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  field,
  form,
  ...restProps
}) => {
  const [keyword, setKeyword] = useState('');

  const options = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return MOCK_OPTIONS;
    return MOCK_OPTIONS.filter((option) =>
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
      placeholder="搜索团队"
      {...restProps}
    />
  );
};`;

export const userPickerFieldSource = `import React from 'react';
import { Avatar, Select, Space } from 'antd';
import type { FieldComponentProps } from '@whynotsnow/dynamic-form';

const users = [
  { label: '陈静 / 产品负责人', value: 'chenjing', avatar: '陈' },
  { label: '李雷 / 前端工程师', value: 'lilei', avatar: '李' },
  { label: '王敏 / 测试负责人', value: 'wangmin', avatar: '王' }
];

export const UserPickerField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  field,
  form,
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
      placeholder="选择负责人"
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
  { title: '项目', dataIndex: 'name', formItemProps: { rules: [{ required: true }] } },
  { title: '数量', dataIndex: 'quantity', valueType: 'digit' },
  { title: '单价', dataIndex: 'price', valueType: 'money' },
  { title: '操作', valueType: 'option' }
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
        record: () => ({ id: String(Date.now()) })
      }}
      editable={{
        type: 'multiple',
        onValuesChange: (_, rows) => onChange(rows)
      }}
    />
  );
};`;

export const toastHandlerSource = `import type { CustomEffectResultHandler } from '@whynotsnow/dynamic-form';
import { message } from 'antd';

export const toastHandler: CustomEffectResultHandler = {
  name: 'toast',
  description: '展示轻量反馈消息',
  canHandle: (key) => key === 'toast',
  validate: (value) => typeof value === 'string' || typeof value?.content === 'string',
  handle: (_context, value) => {
    if (typeof value === 'string') {
      message.info(value);
      return;
    }

    const type = value.type ?? 'info';
    message[type](value.content);
  }
};`;

export const highlightHandlerSource = `import type { CustomEffectResultHandler } from '@whynotsnow/dynamic-form';

export const highlightHandler: CustomEffectResultHandler = {
  name: 'highlight',
  description: '通过 componentProps 标记字段高亮状态',
  canHandle: (key) => key === 'highlight',
  validate: (value) => typeof value === 'boolean',
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
};`;

export const fieldErrorsHandlerSource = `import type { CustomEffectResultHandler } from '@whynotsnow/dynamic-form';

export const fieldErrorsHandler: CustomEffectResultHandler = {
  name: 'fieldErrors',
  description: '把服务端字段错误写入 Ant Design Form',
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

export const registerComponentSource = `const componentRegistry = {
  customComponents: {
    RemoteSelectField,
    UserPickerField,
    EditableTableField
  }
};

<DynamicForm
  form={form}
  formConfig={formConfig}
  componentRegistry={componentRegistry}
/>`;

export const registerHandlerSource = `useInitHandlers({
  handlers: [toastHandler, highlightHandler, fieldErrorsHandler],
  options: { override: true }
});`;
