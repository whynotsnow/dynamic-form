import React from 'react';
import { Input, InputNumber, Select, DatePicker, Switch, Rate, Typography, Checkbox } from 'antd';
import type { FieldComponentProps, ComponentRegistry, ComponentRegistryConfig } from './types';

const { Text } = Typography;

type RegisteredFieldComponent<P = string> = React.ComponentType<FieldComponentProps & P>;

// 测试组件：直接使用 Ant Design 组件
const TestInput: React.FC<FieldComponentProps> = (props) => {
  const { field, value, onChange, form, ...restProps } = props;
  return <Input value={value} onChange={onChange} {...restProps} />;
};

// 组件渲染
export const RenderRate: React.FC<FieldComponentProps> = ({ value, onChange }) => {
  return <Rate value={value} onChange={onChange} />;
};

const TextDisplay: React.FC<FieldComponentProps> = ({ value }) => {
  return <span>{value}</span>;
};

// 默认组件注册表
export const DefaultRegistryFieldComponents = {
  Password: (props) => {
    const { field, value, onChange, form, ...restProps } = props;
    return <Input.Password value={value} onChange={onChange} {...restProps} />;
  },
  ConfirmPassword: (props) => {
    const { field, value, onChange, form, ...restProps } = props;
    return <Input.Password value={value} onChange={onChange} {...restProps} />;
  },
  TextInput: (props) => {
    const { field, value, onChange, form, ...restProps } = props;
    return <Input value={value} onChange={onChange} {...restProps} />;
  },
  NumberInput: (props) => {
    const { field, value, onChange, form, ...restProps } = props;
    return (
      <InputNumber style={{ width: '100%' }} value={value} onChange={onChange} {...restProps} />
    );
  },
  SelectField: (props) => {
    const { field, value, onChange, form, ...restProps } = props;
    return (
      <Select options={(field as any).options} value={value} onChange={onChange} {...restProps} />
    );
  },
  DatePicker: (props) => {
    const { field, value, onChange, form, ...restProps } = props;
    return (
      <DatePicker style={{ width: '100%' }} value={value} onChange={onChange} {...restProps} />
    );
  },
  Switch: (props) => {
    const { field, value, onChange, form, ...restProps } = props;
    return <Switch checked={!!value} onChange={onChange} {...restProps} />;
  },
  Rate: (props) => {
    const { field, value, onChange, form, ...restProps } = props;
    return <Rate value={value} onChange={onChange} {...restProps} />;
  },
  TextDisplay,
  CheckboxGroup: (props) => {
    const { field, value, onChange, form, ...restProps } = props;
    return <Checkbox.Group value={value} onChange={onChange} {...restProps} />;
  },
  Select: (props) => {
    const { field, value, onChange, form, ...restProps } = props;
    return <Select value={value} onChange={onChange} {...restProps} />;
  },
  TextArea: (props) => {
    const { field, value, onChange, form, ...restProps } = props;
    return <Input.TextArea value={value} onChange={onChange} {...restProps} />;
  }
} as const satisfies Record<string, React.FC<FieldComponentProps>>;

// 组件注册器类
export class ComponentRegistryManager {
  private registry: ComponentRegistry = { ...DefaultRegistryFieldComponents };

  constructor(config?: ComponentRegistryConfig) {
    if (config) {
      this.mergeRegistry(config);
    }
  }

  // 合并注册表
  private mergeRegistry(config: ComponentRegistryConfig) {
    const { customComponents, allowOverride = false } = config;
    // 合并自定义组件
    if (customComponents) {
      if (allowOverride) {
        // 允许覆盖默认组件
        this.registry = { ...this.registry, ...customComponents };
      } else {
        // 不允许覆盖，只添加新的组件
        Object.keys(customComponents).forEach((key) => {
          if (!this.registry[key]) {
            this.registry[key] = customComponents[key];
          }
        });
      }
    }
  }

  // 注册单个组件
  registerComponent(componentType: string, component: React.FC<FieldComponentProps>) {
    this.registry[componentType] = component;
  }

  // 批量注册组件
  registerComponents(components: ComponentRegistry) {
    this.registry = { ...this.registry, ...components };
  }

  // 获取组件
  getComponent<P>(componentType: string): RegisteredFieldComponent<P> | undefined {
    if (this.registry[componentType]) {
      return this.registry[componentType] as RegisteredFieldComponent<P> | undefined;
    } else {
      console.error(`获取不到的组件类型→【${componentType}】`);
    }
  }

  // 检查组件是否存在
  hasComponent(componentType: string): boolean {
    return !!this.registry[componentType];
  }

  // 获取所有已注册的组件类型
  getRegisteredTypes(): string[] {
    return Object.keys(this.registry);
  }

  // 获取完整的注册表
  getRegistry(): ComponentRegistry {
    return { ...this.registry };
  }
}

// 创建默认的注册器实例
export const defaultRegistryManager = new ComponentRegistryManager();

// 添加测试组件到注册表
export const TestFieldRegistry: Record<string, React.FC<FieldComponentProps>> = {
  ...DefaultRegistryFieldComponents,
  TestInput
};
