import React, { useState } from 'react';
import { FieldComponentProps, ComponentRegistry } from '@/exports';
import { Input, Slider, Upload, Button, message, InputNumber, Select, Switch } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import CustomProjectList from '../../demos/customComponents/CustomProjectList';
import CustomEditTable from '../../demos/customComponents/CustomEditTable';

// 自定义受控组件用于测试

// 1. 滑块组件
const CustomSlider: React.FC<FieldComponentProps> = ({ field, value, onChange }) => {
  return (
    <Slider
      min={field.componentProps?.min || 0}
      max={field.componentProps?.max || 100}
      value={value}
      onChange={onChange}
    />
  );
};

// 2. 文件上传组件
const CustomUpload: React.FC<FieldComponentProps> = ({ field, value, onChange }) => {
  const handleUpload = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上传成功`);
      onChange?.(info.file.response?.url || info.file.name);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`);
    }
  };

  return (
    <Upload name="file" action="/api/upload" onChange={handleUpload}>
      <Button icon={<UploadOutlined />}>点击上传</Button>
    </Upload>
  );
};

// 3. 颜色选择器组件
const CustomColorPicker: React.FC<FieldComponentProps> = ({ field, value, onChange }) => {
  return (
    <Input
      type="color"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      style={{ width: '100%', height: 40 }}
    />
  );
};

// 4. 自定义文本域组件
const CustomTextArea: React.FC<FieldComponentProps> = ({ field, value, onChange }) => {
  return (
    <Input.TextArea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      rows={field.componentProps?.rows || 4}
      placeholder={field.componentProps?.placeholder || '请输入内容'}
    />
  );
};

// 高级自定义组件示例

// 1. 增强的文本输入组件（覆盖默认的TextInput）
const EnhancedTextInput: React.FC<FieldComponentProps> = ({ field, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        disabled={field.componentProps?.disabled}
        placeholder={field.componentProps?.placeholder || '请输入内容'}
        style={{ flex: 1 }}
      />
      <Switch
        checked={showPassword}
        onChange={setShowPassword}
        size="small"
        checkedChildren="显示"
        unCheckedChildren="隐藏"
      />
    </div>
  );
};

// 2. 带验证的邮箱输入组件
const EmailInput: React.FC<FieldComponentProps> = ({ field, value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);
  };

  return (
    <Input
      type="email"
      value={value}
      onChange={handleChange}
      disabled={field.componentProps?.disabled}
      placeholder="请输入邮箱地址"
    />
  );
};

// 3. 动态选项的选择器组件
const DynamicSelect: React.FC<FieldComponentProps> = ({ field, value, onChange }) => {
  const [options, setOptions] = useState(field.componentProps?.options || []);

  const handleAddOption = () => {
    const newOption = {
      value: `option_${options.length + 1}`,
      label: `选项 ${options.length + 1}`
    };
    setOptions([...options, newOption]);
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Select
        style={{ flex: 1 }}
        value={value}
        onChange={onChange}
        disabled={field.componentProps?.disabled}
        options={options}
        placeholder="请选择选项"
      />
      <Button size="small" onClick={handleAddOption}>
        添加选项
      </Button>
    </div>
  );
};

// 4. 带单位的数字输入组件
const UnitNumberInput: React.FC<FieldComponentProps> = ({ field, value, onChange }) => {
  const unit = field.componentProps?.unit || '个';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <InputNumber
        value={value}
        onChange={onChange}
        disabled={field.componentProps?.disabled}
        min={field.componentProps?.min || 0}
        max={field.componentProps?.max || 999}
        style={{ flex: 1 }}
      />
      <span style={{ color: '#666' }}>{unit}</span>
    </div>
  );
};

export const customComponents: ComponentRegistry = {
  CustomSlider,
  CustomUpload,
  CustomColorPicker,
  CustomTextArea,
  CustomProjectList,
  CustomEditTable,
  EnhancedTextInput,
  EmailInput,
  DynamicSelect,
  UnitNumberInput
};
