import type { FormInstance, Rule } from 'antd/es/form';
import type { EffectFn } from 'form-chain-effect-engine';
import type { Dispatch, ReactNode } from 'react';
import type { CustomEffectResultHandler, HandlerRegistrationOptions } from './resultProcessor';
import { DefaultRegistryFieldComponents } from './fieldComponentRegistry';
import { ButtonProps, CardProps, ColProps, FormItemProps, FormProps, RowProps } from 'antd/lib';

export interface FieldMeta {
  visible?: boolean;
  formItemProps?: FormItemProps;
  componentProps?: Record<string, any>;
}

export interface GroupMeta {
  visible?: boolean;
  [key: string]: any;
}

export interface BaseFieldConfig {
  id: string;
  initialValue?:
    | any
    | ((allValues: Record<string, any>) => any | { value: any; [key: string]: any });
  initialVisible?: boolean;
  initialDisabled?: boolean;

  dependents?: string[];
  effect?: EffectFn;

  formItemProps?: FormItemProps;
  label?: string;
  required?: boolean;
  style?: React.CSSProperties;
  rules?: Rule[];
  span?: number; // 栅格列数（如 span: 8）
  componentProps?: Record<string, any>;

  component: FieldComponentType;
}

export interface GroupField {
  title?: string;
  dependents?: string[];
  effect?: EffectFn;
  fields: BaseFieldConfig[];
  id: string;
  initialVisible?: boolean;
}

// export type FieldComponentType = keyof typeof DefaultRegistryFieldComponents;
export type FieldComponentType =
  | 'Password'
  | 'ConfirmPassword'
  | 'TextInput'
  | 'NumberInput'
  | 'SelectField'
  | 'DatePicker'
  | 'Switch'
  | 'Rate'
  | 'TextDisplay'
  | string; // 允许任意字符串作为自定义组件类型

// ---------------------- reduce ----------------------

export type FieldState = BaseFieldConfig & {
  meta: FieldMeta;
};

export type Fieldchain = { dependents: string[]; effect: EffectFn };

export type GroupFieldState = Omit<GroupField, 'fields'> & {
  meta: GroupMeta;
  fields: Record<string, FieldState>;
};
export interface FormState {
  fields: Record<string, FieldState>;
  fieldValues: Record<string, any>;
  groupFields: Record<string, GroupFieldState>;
  initialized: boolean;
  configProcessInfo: ConfigProcessInfo;
  dynamicUIConfig: UIConfig;
}

export type FormAction =
  | {
      type: 'INIT';
      payload: {
        configProcessInfo: ConfigProcessInfo;
      };
    }
  | {
      type: 'UPDATE_META';
      payload: { fieldId: string; meta: FieldMeta };
    }
  | { type: 'SET_GROUP_META'; payload: { groupId: string; meta: FieldMeta } }
  | { type: 'SET_FIELD_VALUE'; payload: { fieldId: string; value: any } }
  | { type: 'SET_FIELD_VALUES'; payload: { values: Record<string, any> } }
  | { type: 'BATCH_UPDATE'; payload: { values: Record<string, any>; meta: FieldMeta } }
  | { type: 'UPDATE_DYNAMIC_UICONFIG'; payload: { config: Partial<UIConfig> & object } };

/** 非分组模式下的表单配置 */
export interface FlatFormConfig {
  fields: BaseFieldConfig[];
}

/** 分组模式下的表单配置 */
export interface GroupedFormConfig {
  groups: GroupField[];
  id?: string | number;
}

export type FormConfig = FlatFormConfig | GroupedFormConfig;

// 自定义处理器配置
export interface CustomEffectResultHandlerConfig {
  // 是否启用自定义处理器
  enabled?: boolean;

  // 自定义处理器列表
  handlers?: CustomEffectResultHandler[];

  // 处理器配置选项
  options?: HandlerRegistrationOptions;
}

// 组件注册器接口
export interface ComponentRegistry {
  [componentType: string]: React.FC<FieldComponentProps>;
}

//组件注册器配置
export interface ComponentRegistryConfig {
  // 自定义组件注册表
  customComponents?: ComponentRegistry;
  // 是否允许覆盖默认组件
  allowOverride?: boolean;
}

//UI组件配置项
export interface UIConfig {
  // Form组件配置
  formProps?: FormProps;
  // Button组件配置
  buttonProps?: ButtonProps;
  // Card组件配置
  cardProps?: CardProps;
  // Row组件配置
  rowProps?: RowProps;
  // Col组件配置
  colProps?: ColProps;
  // 提交按钮区域配置
  submitAreaProps?: object;
  // Form.Item组件配置 - 支持函数化值
  formItemProps?: FormItemProps;
}

export interface DynamicFormProps extends EngineProps, FormContentProps {}

export interface FormChainEffectEngineWrapperProps extends EngineProps {
  children: React.ReactNode;
}
// 引擎层（逻辑层） Props
export interface EngineProps {
  formConfig: FormConfig;
  form: FormInstance;
  values?: Record<string, any>;
  uiConfig?: UIConfig;
  enableInitializationCheck?: boolean;
  checkDelay?: number;
}

// ---- Field 最小粒度：保持原样 ----
export interface RenderFieldItemParams {
  field: FieldState;
  form: FormInstance;
  fieldValue: any;
  renderField: (targetField: FieldState) => React.ReactNode;
  defaultRender: React.ReactNode;
}

// ---- 一组字段：提供下层能力 renderFieldItem ----
export interface RenderFieldsParams {
  fields: FieldState[];
  renderFieldItem: (field: FieldState) => React.ReactNode;
  defaultRender: React.ReactNode;
}

// ---- 单个分组：提供下层能力 renderFields / renderFieldItem ----
export interface RenderGroupItemParams {
  group: GroupFieldState;
  dynamicUIConfig: UIConfig;
  renderFields: (fields: FieldState[]) => React.ReactNode;
  renderFieldItem: (field: FieldState) => React.ReactNode;
  defaultRender: React.ReactNode;
}

// ---- 分组集合：提供下层能力 renderGroupItem / renderFields / renderFieldItem ----
export interface RenderGroupsParams {
  groupFields: Record<string, GroupFieldState>;
  renderGroupItem: (group: GroupFieldState) => React.ReactNode;
  renderFields: (fields: FieldState[]) => React.ReactNode;
  renderFieldItem: (field: FieldState) => React.ReactNode;
  defaultRender: React.ReactNode;
}

// ---- 顶层 Form：提供整条链路（含 renderGroups） ----
export interface RenderFormParams {
  form: FormInstance;
  fields: Record<string, FieldState>;
  groupFields: Record<string, GroupFieldState>;
  dynamicUIConfig: UIConfig;

  renderGroups: (groupFields: Record<string, GroupFieldState>) => React.ReactNode;
  renderGroupItem: (group: GroupFieldState) => React.ReactNode;
  renderFields: (fields: FieldState[]) => React.ReactNode;
  renderFieldItem: (field: FieldState) => React.ReactNode;

  defaultRender: {
    fieldsArea: React.ReactNode;
    submitArea: React.ReactNode;
  };
}

// UI 层（渲染层） Props
// ---- 组件 Props：保持 renderFormInner 名称 ----
export interface FormContentProps {
  form: FormInstance;
  onSubmit?: (data: Record<string, any>) => void;
  submitButtonText?: string;
  componentRegistry?: ComponentRegistryConfig;
  // uiConfig?: UIConfig;

  renderFormInner?: (params: RenderFormParams) => React.ReactNode;
  renderGroups?: (params: RenderGroupsParams) => React.ReactNode;
  renderFieldItem?: (params: RenderFieldItemParams) => React.ReactNode;
  renderGroupItem?: (params: RenderGroupItemParams) => React.ReactNode;
  renderFields?: (params: RenderFieldsParams) => React.ReactNode;
}

/** 字段渲染器 props */
export interface FieldRendererProps {
  field: FieldState;
  form: FormInstance;
  fieldValue?: any;
  // 新增：组件注册器
  componentRegistry?: any;
  // 新增：Form.Item组件配置 - 支持函数化值
  dynamicUIConfig?: UIConfig;
}

export interface FieldComponentProps {
  field: FieldState;
  value?: any;
  onChange?: (value: any) => void;
  form: FormInstance;
}

export type FieldComponent = React.ComponentType<FieldComponentProps> & {
  wrapWithFormItem?: boolean; // 是否自动包裹在 Form.Item 中
};

export interface FieldRegistry {
  id: string;
  isGroupField: boolean;
  groupId?: string;
  config: BaseFieldConfig | GroupField;
}

export interface ConfigProcessInfo {
  effectMap: Record<string, Fieldchain>;
  fieldRegistry: Record<string, FieldRegistry>;
  initialValues: Record<string, any>;
  initializedFields: Record<string, FieldState>;
  initializedGroupFields: Record<string, GroupFieldState>;
}

export interface FormChainContextType {
  form: FormInstance;
  state: FormState;
  dispatch: Dispatch<FormAction>;
  onValuesChange: (changed: Record<string, any>) => void;
  manualTrigger: (field: string, value?: any) => void;
  syncFormStateToStore: (
    changedValues: Record<string, any>,
    allValues: Record<string, any>
  ) => void;
}
