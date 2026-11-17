import React, { useEffect, useRef } from 'react';
import { getFieldName } from '@/exports';
import type { FieldComponentProps } from '@/exports';
import { Button, Card, Form, Grid, Input, message, Popconfirm, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import styles from './CustomEditTable.module.css';

type EditTableRow = {
  key: React.Key;
  name: string;
  age: string;
  address: string;
  email: string;
  phone: string;
  status: string;
};

type EditableField = Exclude<keyof EditTableRow, 'key'>;
type EditErrorCode =
  | 'nameRequired'
  | 'ageRequired'
  | 'ageInvalidNumber'
  | 'ageOutOfRange'
  | 'addressRequired'
  | 'emailRequired'
  | 'emailInvalidFormat'
  | 'phoneRequired'
  | 'phoneInvalidFormat'
  | 'statusRequired';
type EditErrorTranslator = (zh: string, en: string) => string;
type EditErrors = Partial<Record<EditableField, EditErrorCode>>;

const toEditTableRows = (input: unknown): EditTableRow[] => {
  return Array.isArray(input) ? (input as EditTableRow[]) : [];
};

const validateEditTableRow = (row: EditTableRow): EditErrors => {
  const errors: EditErrors = {};
  const name = typeof row.name === 'string' ? row.name : '';
  const age = typeof row.age === 'string' ? row.age : '';
  const address = typeof row.address === 'string' ? row.address : '';
  const email = typeof row.email === 'string' ? row.email : '';
  const phone = typeof row.phone === 'string' ? row.phone : '';
  const status = typeof row.status === 'string' ? row.status : '';

  if (!name.trim()) errors.name = 'nameRequired';
  if (!age.trim()) errors.age = 'ageRequired';
  else if (!/^[0-9]+$/.test(age)) errors.age = 'ageInvalidNumber';
  else if (Number(age) > 150) errors.age = 'ageOutOfRange';
  if (!address.trim()) errors.address = 'addressRequired';
  if (!email.trim()) errors.email = 'emailRequired';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'emailInvalidFormat';
  }
  if (!phone.trim()) errors.phone = 'phoneRequired';
  else if (!/^1[3-9]\d{9}$/.test(phone)) errors.phone = 'phoneInvalidFormat';
  if (!status) errors.status = 'statusRequired';

  return errors;
};

export const validateEditTableRows = async (
  _rule: unknown,
  value: unknown,
  t: EditErrorTranslator = (zh) => zh
): Promise<void> => {
  const errors = toEditTableRows(value).flatMap((row) => Object.values(validateEditTableRow(row)));

  if (errors.length > 0) {
    const messages: Record<EditErrorCode, { message: string }> = {
      nameRequired: { message: '请输入姓名' },
      ageRequired: { message: '请输入年龄' },
      ageInvalidNumber: { message: '年龄必须是数字' },
      ageOutOfRange: { message: '年龄必须在0-150之间' },
      addressRequired: { message: '请输入地址' },
      emailRequired: { message: '请输入邮箱' },
      emailInvalidFormat: { message: '邮箱格式不正确' },
      phoneRequired: { message: '请输入电话' },
      phoneInvalidFormat: { message: '请输入有效的 11 位手机号' },
      statusRequired: { message: '请选择状态' }
    };
    void t;
    throw new Error(messages[errors[0]].message);
  }
};

const CustomEditTable: React.FC<FieldComponentProps> = ({
  field,
  value,
  onChange,
  formAdapter
}) => {
  const [dataSource, setDataSource] = React.useState<EditTableRow[]>(() => toEditTableRows(value));
  const [editableKeys, setEditableKeys] = React.useState<React.Key[]>([]);
  const [editSnapshots, setEditSnapshots] = React.useState<Record<string, EditTableRow | null>>({});
  const [editErrors, setEditErrors] = React.useState<Record<string, EditErrors>>({});
  const editErrorMessages: Record<EditErrorCode, { message: string }> = {
    nameRequired: { message: '请输入姓名' },
    ageRequired: { message: '请输入年龄' },
    ageInvalidNumber: { message: '年龄必须是数字' },
    ageOutOfRange: { message: '年龄必须在0-150之间' },
    addressRequired: { message: '请输入地址' },
    emailRequired: { message: '请输入邮箱' },
    emailInvalidFormat: { message: '邮箱格式不正确' },
    phoneRequired: { message: '请输入电话' },
    phoneInvalidFormat: { message: '请输入有效的 11 位手机号' },
    statusRequired: { message: '请选择状态' }
  };
  const statusOptions = [
    { label: '活跃', value: 'active' },
    { label: '非活跃', value: 'inactive' },
    { label: '暂停', value: 'paused' }
  ];
  const displayValue = (row: EditTableRow, fieldName: EditableField) => {
    if (fieldName !== 'status') return row[fieldName] || '—';
    return statusOptions.find((option) => option.value === row.status)?.label ?? row.status;
  };
  const screens = Grid.useBreakpoint();
  const isNarrowScreen = !screens.lg;
  const previousLayout = useRef(isNarrowScreen);

  useEffect(() => {
    if (previousLayout.current !== isNarrowScreen) {
      setEditableKeys([]);
      setEditSnapshots({});
      setEditErrors({});
      previousLayout.current = isNarrowScreen;
    }
  }, [isNarrowScreen]);

  // 监听表单值变化，保持 value/onChange 兼容性
  useEffect(() => {
    const nextRows = toEditTableRows(value);
    setDataSource(nextRows);

    if (nextRows.length === 0) {
      setEditableKeys([]);
      setEditSnapshots({});
      setEditErrors({});
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
  const handleValueChange = (newValue: readonly EditTableRow[]) => {
    const valueArray = [...newValue];
    setDataSource(valueArray);
    onChange?.(valueArray);
    if (formAdapter) {
      formAdapter.validateFields([getFieldName(field)]).catch(() => {});
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

    // 新增行立即进入编辑状态；取消时移除此行。
    setEditableKeys((prev) => [...prev, newKey]);
    setEditSnapshots((prev) => ({ ...prev, [newKey]: null }));
    setEditErrors((prev) => ({ ...prev, [newKey]: {} }));
  };

  const handleDelete = (key: React.Key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
    onChange?.(newData);
    message.success('删除成功');
  };

  const updateField = (key: React.Key, fieldName: EditableField, nextValue: string) => {
    const nextData = dataSource.map((row) =>
      row.key === key ? { ...row, [fieldName]: nextValue } : row
    );
    handleValueChange(nextData);
    setEditErrors((prev) => ({
      ...prev,
      [String(key)]: { ...prev[String(key)], [fieldName]: undefined }
    }));
  };

  const startEdit = (row: EditTableRow) => {
    setEditSnapshots((prev) => ({ ...prev, [String(row.key)]: { ...row } }));
    setEditErrors((prev) => ({ ...prev, [String(row.key)]: {} }));
    setEditableKeys((prev) => (prev.includes(row.key) ? prev : [...prev, row.key]));
  };

  const cancelEdit = (row: EditTableRow) => {
    const key = String(row.key);
    const original = editSnapshots[key];

    if (original === null) {
      const nextData = dataSource.filter((item) => item.key !== row.key);
      setDataSource(nextData);
      onChange?.(nextData);
    } else if (original) {
      const nextData = dataSource.map((item) => (item.key === row.key ? original : item));
      setDataSource(nextData);
      onChange?.(nextData);
    }

    setEditableKeys((prev) => prev.filter((itemKey) => itemKey !== row.key));
    setEditSnapshots((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setEditErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const saveEdit = (row: EditTableRow) => {
    const errors = validateEditTableRow(row);
    const key = String(row.key);

    if (Object.keys(errors).length > 0) {
      setEditErrors((prev) => ({ ...prev, [key]: errors }));
      return;
    }

    setEditableKeys((prev) => prev.filter((itemKey) => itemKey !== row.key));
    setEditSnapshots((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setEditErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    message.success('保存成功');
  };

  const renderDesktopField = (row: EditTableRow, fieldName: EditableField, placeholder: string) => {
    const errorCode = editErrors[String(row.key)]?.[fieldName];
    const error = errorCode ? editErrorMessages[errorCode].message : undefined;
    const isEditing = editableKeys.includes(row.key);

    if (!isEditing) return displayValue(row, fieldName);

    const control =
      fieldName === 'status' ? (
        <Select
          size="small"
          value={row.status}
          options={statusOptions}
          onChange={(nextValue) => updateField(row.key, 'status', nextValue)}
        />
      ) : (
        <Input
          size="small"
          type={fieldName === 'age' ? 'number' : 'text'}
          value={row[fieldName]}
          placeholder={placeholder}
          onChange={(event) => updateField(row.key, fieldName, event.target.value)}
        />
      );

    return (
      <div className={styles.desktopEditCell}>
        {control}
        {error && <span className={styles.desktopFieldError}>{error}</span>}
      </div>
    );
  };

  const columns: ColumnsType<EditTableRow> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 88,
      render: (_value, row) => renderDesktopField(row, 'name', '请输入姓名')
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 64,
      render: (_value, row) => renderDesktopField(row, 'age', '年龄')
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 130,
      render: (_value, row) => renderDesktopField(row, 'address', '请输入地址')
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 150,
      render: (_value, row) => renderDesktopField(row, 'email', '请输入邮箱')
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 116,
      render: (_value, row) => renderDesktopField(row, 'phone', '请输入电话')
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 88,
      render: (_value, row) => renderDesktopField(row, 'status', '请选择状态')
    },
    {
      title: '操作',
      key: 'actions',
      width: 144,
      render: (_value, row) =>
        editableKeys.includes(row.key) ? (
          <Space size={0} wrap>
            <Button size="small" type="link" onClick={() => saveEdit(row)}>
              保存
            </Button>
            <Button size="small" type="link" onClick={() => cancelEdit(row)}>
              取消
            </Button>
          </Space>
        ) : (
          <Space size={0} wrap>
            <Button size="small" type="link" onClick={() => startEdit(row)}>
              编辑
            </Button>
            <Popconfirm title="确认删除？" onConfirm={() => handleDelete(row.key)}>
              <Button size="small" type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
    }
  ];

  return (
    <div style={{ width: '100%', minWidth: 0, overflow: 'visible' }}>
      <Button
        type="dashed"
        onClick={handleAdd}
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
      >
        添加行
      </Button>
      {isNarrowScreen ? (
        <div className={styles.mobileList}>
          {dataSource.map((row, index) => {
            const rowKey = String(row.key);
            const isEditing = editableKeys.includes(row.key);
            const errors = editErrors[rowKey] ?? {};
            const errorMessage = (code?: EditErrorCode) =>
              code ? editErrorMessages[code].message : undefined;

            const field = (
              fieldName: EditableField,
              label: string,
              control: React.ReactNode,
              wide = false
            ) => (
              <div
                className={`${styles.mobileField} ${wide ? styles.mobileFieldWide : ''}`}
                key={fieldName}
              >
                {isEditing ? (
                  <Form.Item
                    label={label}
                    required
                    validateStatus={errors[fieldName] ? 'error' : undefined}
                    help={errorMessage(errors[fieldName])}
                  >
                    {control}
                  </Form.Item>
                ) : (
                  <div>
                    <div className={styles.mobileLabel}>{label}</div>
                    <div className={styles.mobileValue}>{displayValue(row, fieldName)}</div>
                  </div>
                )}
              </div>
            );

            return (
              <Card className={styles.mobileCard} size="small" key={row.key}>
                <div className={styles.mobileCardHeader}>
                  <strong>{row.name || `用户${index + 1}`}</strong>
                  {!isEditing && (
                    <Space size={4}>
                      <Button size="small" type="link" onClick={() => startEdit(row)}>
                        编辑
                      </Button>
                      <Popconfirm title="确认删除？" onConfirm={() => handleDelete(row.key)}>
                        <Button size="small" type="link" danger>
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  )}
                </div>

                <div className={styles.mobileFields}>
                  {field(
                    'name',
                    '姓名',
                    <Input
                      size="small"
                      value={row.name}
                      placeholder="请输入姓名"
                      onChange={(event) => updateField(row.key, 'name', event.target.value)}
                    />
                  )}
                  {field(
                    'age',
                    '年龄',
                    <Input
                      size="small"
                      type="number"
                      value={row.age}
                      placeholder="请输入年龄"
                      onChange={(event) => updateField(row.key, 'age', event.target.value)}
                    />
                  )}
                  {field(
                    'address',
                    '地址',
                    <Input
                      size="small"
                      value={row.address}
                      placeholder="请输入地址"
                      onChange={(event) => updateField(row.key, 'address', event.target.value)}
                    />,
                    true
                  )}
                  {field(
                    'email',
                    '邮箱',
                    <Input
                      size="small"
                      value={row.email}
                      placeholder="请输入邮箱"
                      onChange={(event) => updateField(row.key, 'email', event.target.value)}
                    />,
                    true
                  )}
                  {field(
                    'phone',
                    '电话',
                    <Input
                      size="small"
                      value={row.phone}
                      placeholder="请输入电话"
                      onChange={(event) => updateField(row.key, 'phone', event.target.value)}
                    />
                  )}
                  {field(
                    'status',
                    '状态',
                    <Select
                      size="small"
                      value={row.status}
                      options={statusOptions}
                      onChange={(nextValue) => updateField(row.key, 'status', nextValue)}
                    />
                  )}
                </div>

                {isEditing && (
                  <div className={styles.mobileCardActions}>
                    <Button size="small" type="primary" onClick={() => saveEdit(row)}>
                      保存
                    </Button>
                    <Button size="small" onClick={() => cancelEdit(row)}>
                      取消
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Table
          className={styles.desktopTable}
          columns={columns}
          dataSource={dataSource}
          rowKey="key"
          tableLayout="fixed"
          pagination={false}
          size="small"
          bordered
        />
      )}
    </div>
  );
};

export default CustomEditTable;
