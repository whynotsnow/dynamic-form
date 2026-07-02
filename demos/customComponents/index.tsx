import React, { useState } from 'react';
import { FieldComponentProps, ComponentRegistry } from '@/exports';
import { Input, Slider, Upload, Button, message, InputNumber, Select, Switch } from 'antd';
import type {
  InputNumberProps,
  InputProps,
  SelectProps,
  SliderSingleProps,
  UploadProps
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import CustomProjectList from '../../demos/customComponents/CustomProjectList';
import CustomEditTable from '../../demos/customComponents/CustomEditTable';
import OperatingAreaField from './OperatingAreaField';

type DemoComponentProps = {
  min?: number;
  max?: number;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  options?: SelectProps['options'];
  unit?: React.ReactNode;
};

const getDemoComponentProps = (field: FieldComponentProps['field']): DemoComponentProps => {
  return field.componentProps as DemoComponentProps;
};

// 自定义受控组件用于测试

// 1. 滑块组件
const CustomSlider: React.FC<FieldComponentProps> = ({ field, value, onChange }) => {
  const componentProps = getDemoComponentProps(field);
  return (
    <Slider
      min={componentProps.min || 0}
      max={componentProps.max || 100}
      value={value as SliderSingleProps['value']}
      onChange={onChange}
    />
  );
};

// 2. 文件上传组件
const CustomUpload: React.FC<FieldComponentProps> = ({ onChange }) => {
  const handleUpload: UploadProps['onChange'] = (info) => {
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
const CustomColorPicker: React.FC<FieldComponentProps> = ({ value, onChange }) => {
  return (
    <Input
      type="color"
      value={value as InputProps['value']}
      onChange={(e) => onChange?.(e.target.value)}
      style={{ width: '100%', height: 40 }}
    />
  );
};

// 4. 自定义文本域组件
const CustomTextArea: React.FC<FieldComponentProps> = ({ field, value, onChange }) => {
  const componentProps = getDemoComponentProps(field);
  return (
    <Input.TextArea
      value={value as InputProps['value']}
      onChange={(e) => onChange?.(e.target.value)}
      rows={componentProps.rows || 4}
      placeholder={componentProps.placeholder || '请输入内容'}
    />
  );
};

// 高级自定义组件示例

// 1. 增强的文本输入组件（覆盖默认的TextInput）
const EnhancedTextInput: React.FC<FieldComponentProps> = ({ field, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const componentProps = getDemoComponentProps(field);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Input
        type={showPassword ? 'text' : 'password'}
        value={value as InputProps['value']}
        onChange={onChange}
        disabled={componentProps.disabled}
        placeholder={componentProps.placeholder || '请输入内容'}
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
  const componentProps = getDemoComponentProps(field);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);
  };

  return (
    <Input
      type="email"
      value={value as InputProps['value']}
      onChange={handleChange}
      disabled={componentProps.disabled}
      placeholder="请输入邮箱地址"
    />
  );
};

// 3. 动态选项的选择器组件
const DynamicSelect: React.FC<FieldComponentProps> = ({ field, value, onChange }) => {
  const componentProps = getDemoComponentProps(field);
  const [options, setOptions] = useState<NonNullable<SelectProps['options']>>(
    componentProps.options || []
  );

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
        value={value as SelectProps['value']}
        onChange={onChange}
        disabled={componentProps.disabled}
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
  const componentProps = getDemoComponentProps(field);
  const unit = componentProps.unit || '个';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <InputNumber
        value={value as InputNumberProps['value']}
        onChange={onChange}
        disabled={componentProps.disabled}
        min={componentProps.min || 0}
        max={componentProps.max || 999}
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
  OperatingAreaField,
  EnhancedTextInput,
  EmailInput,
  DynamicSelect,
  UnitNumberInput
};
