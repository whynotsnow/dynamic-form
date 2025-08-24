import React, { useEffect, useRef } from 'react';
import { FieldComponentProps } from './DynamicForm/types';
import { Button, message, Input, Select, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { EditableProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';

// EditTable 组件 - 使用 Ant Design Pro 的 EditableProTable
const CustomEditTable: React.FC<FieldComponentProps> = ({ field, value, onChange, form }) => {
  const [dataSource, setDataSource] = React.useState<any[]>(() => value || []);
  const [editableKeys, setEditableKeys] = React.useState<React.Key[]>([]);

  // 监听表单值变化，保持 value/onChange 兼容性
  useEffect(() => {
    if (value !== undefined) {
      setDataSource(value || []);
    }
  }, [value]);

  // 处理 ResizeObserver 错误
  useEffect(() => {
    const handleResizeObserverError = (e: ErrorEvent) => {
      if (e.message.includes('ResizeObserver loop completed with undelivered notifications')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('error', handleResizeObserverError);
    return () => {
      window.removeEventListener('error', handleResizeObserverError);
    };
  }, []);

  // 受控 onChange
  const handleValueChange = (newValue: any) => {
    const valueArray = Array.isArray(newValue) ? newValue : [];
    setDataSource(valueArray);
    onChange?.(valueArray);
    if (form) {
      form.validateFields([field.id]).catch(() => {});
    }
  };

  // 添加行并立即进入编辑模式
  const handleAdd = () => {
    const newKey = Date.now().toString();
    const newData = {
      key: newKey,
      name: '',
      age: '',
      address: '',
      email: '',
      phone: '',
      status: 'active'
    };
    const newDataSource = [...dataSource, newData];
    setDataSource(newDataSource);
    onChange?.(newDataSource);

    // 新增行立即进入编辑状态
    setEditableKeys((prev) => [...prev, newKey]);
  };

  const handleDelete = (key: string) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
    onChange?.(newData);
    message.success('删除成功');
  };

  const columns: ProColumns<any>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      formItemProps: {
        rules: [{ required: true, message: '请输入姓名' }]
      },
      renderFormItem: () => <Input placeholder="请输入姓名" />
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      formItemProps: {
        rules: [
          { required: true, message: '请输入年龄' },
          { pattern: /^[0-9]+$/, message: '年龄必须是数字' },
          {
            validator: (_, value) => {
              if (value && (Number(value) < 0 || Number(value) > 150)) {
                return Promise.reject(new Error('年龄必须在0-150之间'));
              }
              return Promise.resolve();
            }
          }
        ]
      },
      renderFormItem: () => <Input type="number" placeholder="请输入年龄" />
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      formItemProps: {
        rules: [{ required: true, message: '请输入地址' }]
      },
      renderFormItem: () => <Input placeholder="请输入地址" />
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      formItemProps: {
        rules: [
          { required: true, message: '请输入邮箱' },
          { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }
        ]
      },
      renderFormItem: () => <Input placeholder="请输入邮箱" />
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      formItemProps: {
        rules: [
          { required: true, message: '请输入电话' },
          { pattern: /^1[3-9]\d{9}$/, message: '电话格式不正确（11位手机号）' }
        ]
      },
      renderFormItem: () => <Input placeholder="请输入电话" />
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        active: { text: '活跃', status: 'Success' },
        inactive: { text: '非活跃', status: 'Error' },
        paused: { text: '暂停', status: 'Warning' }
      },
      formItemProps: {
        rules: [{ required: true, message: '请选择状态' }]
      },
      renderFormItem: () => (
        <Select
          options={[
            { label: '活跃', value: 'active' },
            { label: '非活跃', value: 'inactive' },
            { label: '暂停', value: 'paused' }
          ]}
        />
      )
    },
    {
      title: '操作',
      valueType: 'option',
      render: (text, record, _, action: any) => {
        const isEditing = editableKeys.includes(record.key);
        return isEditing
          ? [
              <a key="save" onClick={() => action?.save?.(record.key)}>
                保存
              </a>,
              <a key="cancel" onClick={() => action?.cancel?.(record.key)}>
                取消
              </a>
            ]
          : [
              <a key="edit" onClick={() => action?.startEditable?.(record.key)}>
                编辑
              </a>,
              <Popconfirm
                key="delete"
                title="确认删除？"
                onConfirm={() => handleDelete(record.key)}
              >
                <a>删除</a>
              </Popconfirm>
            ];
      }
    }
  ];

  return (
    <div>
      <Button
        type="dashed"
        onClick={handleAdd}
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
      >
        添加行
      </Button>
      <EditableProTable<any>
        columns={columns}
        value={dataSource}
        onChange={handleValueChange}
        rowKey="key"
        editable={{
          editableKeys,
          onChange: setEditableKeys,
          onDelete: async () => {
            message.success('删除成功');
            return true;
          }
        }}
        search={false}
        options={false}
        pagination={false}
        size="small"
        bordered
        recordCreatorProps={false} // 禁用内置添加按钮
      />
    </div>
  );
};

export default CustomEditTable;
