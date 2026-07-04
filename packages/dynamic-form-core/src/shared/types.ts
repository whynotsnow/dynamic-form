import type {
  AnyFormValues as HookAnyFormValues,
  AnyLooseFormChainEffectMap as HookAnyLooseFormChainEffectMap,
  FieldName as HookFieldName,
  LooseEffectConfig as HookLooseEffectConfig,
  LooseEffectFn as HookLooseEffectFn,
  LooseFormChainEffectMap as HookLooseFormChainEffectMap
} from '@whynotsnow/hooks';
import type React from 'react';
import type { Dispatch } from 'react';
import type { FieldCapability } from '../runtime';

export type FieldValue = unknown;
export type AnyFormValues = HookAnyFormValues;
export type FormValues = AnyFormValues;
export type FieldName<Values extends object = FormValues> = HookFieldName<Values>;
export type EffectFn<
  Values extends object = FormValues,
  Field extends FieldName<Values> = FieldName<Values>,
  EffectResult = unknown,
  EffectActions = undefined
> = HookLooseEffectFn<Values, Field, EffectResult, EffectActions>;
export type EffectConfig<
  Values extends object = FormValues,
  Field extends FieldName<Values> = FieldName<Values>,
  EffectResult = unknown,
  EffectActions = undefined
> = HookLooseEffectConfig<Values, Field, EffectResult, EffectActions>;
export type FormChainEffectMap<
  Values extends object = FormValues,
  EffectResult = unknown,
  EffectActions = undefined
> = HookLooseFormChainEffectMap<Values, EffectResult, EffectActions>;
export type AnyLooseFormChainEffectMap<
  EffectResult = unknown,
  EffectActions = undefined
> = HookAnyLooseFormChainEffectMap<EffectResult, EffectActions>;
export type FieldComponentRuntimeProps = Record<string, unknown>;
export type FieldNamePath = string | number | Array<string | number>;
export type ValidationRule = Record<string, unknown>;
export type DynamicFormLegacyForm = unknown;

export interface DesignerMetadata {
  title?: string;
  description?: string;
  category?: string;
  icon?: string;
  order?: number;
  locked?: boolean;
  hiddenInDesigner?: boolean;
  metadata?: Record<string, unknown>;
}

export interface DynamicFormFormAdapter {
  rawForm?: DynamicFormLegacyForm;
  getFieldValue: (name: FieldNamePath) => FieldValue;
  getFieldsValue: (includeAll?: boolean) => FormValues;
  setFieldValue: (name: FieldNamePath, value: FieldValue) => void;
  setFieldsValue: (values: FormValues) => void;
  validateFields: (names?: FieldNamePath[]) => Promise<FormValues>;
}

/**
 * 字段稳定标识与 Ant Design 值路径的统一描述。
 * id 服务于 Runtime、registry 与 effect graph；name 只服务于 Form 值读写。
 */
export interface FieldAddress {
  id: string;
  name: FieldNamePath;
}

export interface FieldBehaviorMeta {
  visible?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

export interface FieldMeta {
  behavior?: FieldBehaviorMeta;

  /** @deprecated Use behavior.visible instead. Kept for backward-compatible effect results. */
  visible?: boolean;
  /** @deprecated Use behavior.disabled instead. Kept for backward-compatible effect results. */
  disabled?: boolean;
  /** @deprecated Use behavior.readonly instead. Kept for backward-compatible effect results. */
  readonly?: boolean;

  formItemProps?: Record<string, unknown>;
  componentProps?: FieldComponentRuntimeProps;
}

export interface GroupBehaviorMeta {
  visible?: boolean;
}

export interface GroupMeta {
  behavior?: GroupBehaviorMeta;
  /** @deprecated Use behavior.visible instead. */
  visible?: boolean;
  [key: string]: unknown;
}

export type NodeBehaviorMeta = GroupBehaviorMeta;

export type NodeMeta = GroupMeta;

export interface BaseFieldConfig {
  id: string;
  designer?: DesignerMetadata;
  /** 表单值路径；未提供时保持兼容，默认使用 id。 */
  name?: FieldNamePath;
  initialValue?:
    | FieldValue
    | ((allValues: FormValues) => FieldValue | { value: FieldValue; [key: string]: unknown });
  initialVisible?: boolean;
  initialDisabled?: boolean;
  preserveValueOnHide?: boolean;
  restoreValueOnShow?: boolean;

  dependents?: string[];
  effect?: EffectFn;

  formItemProps?: Record<string, unknown>;
  options?: unknown;
  label?: string;
  required?: boolean;
  style?: React.CSSProperties;
  rules?: ValidationRule[];
  span?: number; // 栅格列数（如 span: 8）
  componentProps?: FieldComponentRuntimeProps;

  component: FieldComponentType;
}

export interface GroupField {
  designer?: DesignerMetadata;
  title?: string;
  dependents?: string[];
  effect?: EffectFn;
  fields: BaseFieldConfig[];
  id: string;
  initialVisible?: boolean;
}

export type FieldNode = BaseFieldConfig & {
  nodeType: 'field';
};

export interface ContainerNode {
  nodeType: 'container';
  id: string;
  designer?: DesignerMetadata;
  title?: string;
  name?: FieldNamePath;
  children: FormNode[];
  initialVisible?: boolean;
  dependents?: string[];
  effect?: EffectFn;
  repeatable?: boolean;
}

export type FormNode = FieldNode | ContainerNode;

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

export type FieldChain = EffectConfig<FormValues> & {
  dependents: string[];
  effect: EffectFn;
};

export type GroupFieldState = Omit<GroupField, 'fields'> & {
  meta: GroupMeta;
  fields: Record<string, FieldState>;
};

export type ContainerState = Omit<ContainerNode, 'children'> & {
  meta: NodeMeta;
  children: string[];
};

export interface FormState {
  fields: Record<string, FieldState>;
  groupFields: Record<string, GroupFieldState>;
  nodes: Record<string, FieldState | ContainerState>;
  rootNodeIds: string[];
  containerFields: Record<string, Record<string, FieldState>>;
  initialized: boolean;
  configProcessInfo: ConfigProcessInfo;
  staticUIConfig: UIConfig;
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
  | { type: 'SET_GROUP_META'; payload: { groupId: string; meta: GroupMeta } }
  | { type: 'SET_CONTAINER_META'; payload: { containerId: string; meta: NodeMeta } }
  | { type: 'UPDATE_DYNAMIC_UICONFIG'; payload: { config: Partial<UIConfig> & object } };

/** 非分组模式下的表单配置 */
export interface FormConfig {
  id?: string | number;
  nodes?: FormNode[];
  fields?: BaseFieldConfig[];
  groups?: GroupField[];
}

export interface FlatFormConfig extends FormConfig {
  fields: BaseFieldConfig[];
}

/** 分组模式下的表单配置 */
export interface GroupedFormConfig extends FormConfig {
  groups: GroupField[];
}

// 自定义处理器配置
export interface CustomEffectResultHandlerConfig {
  // 是否启用自定义处理器
  enabled?: boolean;

  // 自定义处理器列表
  handlers?: unknown[];

  // 处理器配置选项
  options?: Record<string, unknown>;
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
  formProps?: Record<string, unknown>;
  // Button组件配置
  buttonProps?: Record<string, unknown>;
  // Card组件配置
  cardProps?: Record<string, unknown>;
  // Row组件配置
  rowProps?: Record<string, unknown>;
  // Col组件配置
  colProps?: Record<string, unknown>;
  // 提交按钮区域配置
  submitAreaProps?: object;
  // 字段外壳配置 - 默认 AntD renderer 会作为 Form.Item props 使用
  formItemProps?: Record<string, unknown>;
}

export interface RendererFormParams {
  form: DynamicFormLegacyForm;
  formAdapter: DynamicFormFormAdapter;
  onFinish: () => Promise<void>;
  onValuesChange: (changedValues: FormValues, allValues?: FormValues) => void;
  initialValues: FormValues;
  uiConfig: UIConfig;
  children: React.ReactNode;
}

export interface RendererFieldItemParams {
  form: DynamicFormLegacyForm;
  formAdapter: DynamicFormFormAdapter;
  formItemProps: Record<string, unknown>;
  children: React.ReactNode;
}

export interface RendererFieldLayoutParams {
  field: FieldState;
  uiConfig: UIConfig;
  children: React.ReactNode;
}

export interface RendererFieldsLayoutParams {
  uiConfig: UIConfig;
  children: React.ReactNode;
}

export interface RendererGroupParams {
  id: string;
  title?: string;
  uiConfig: UIConfig;
  children: React.ReactNode;
}

export interface RendererRepeatableParams {
  id: string;
  title?: string;
  name: FieldNamePath;
  uiConfig: UIConfig;
  renderItem: (itemName: string | number, itemKey: React.Key) => React.ReactNode;
}

export interface RendererSubmitParams {
  submitButtonText: string;
  uiConfig: UIConfig;
}

export interface DynamicFormRendererAdapter {
  renderForm: (params: RendererFormParams) => React.ReactNode;
  renderFieldItem: (params: RendererFieldItemParams) => React.ReactNode;
  renderFieldsLayout: (params: RendererFieldsLayoutParams) => React.ReactNode;
  renderFieldLayout: (params: RendererFieldLayoutParams) => React.ReactNode;
  renderGroup: (params: RendererGroupParams) => React.ReactNode;
  renderRepeatable: (params: RendererRepeatableParams) => React.ReactNode;
  renderSubmit: (params: RendererSubmitParams) => React.ReactNode;
}

export interface DynamicFormProps extends FormChainEffectProps, FormContentProps {}

export interface DynamicFormProviderProps extends FormChainEffectProps {
  children: React.ReactNode;
}
export type FormChainEffectWrapperProps = DynamicFormProviderProps;
export interface FormChainEffectProps {
  formConfig: FormConfig;
  form?: DynamicFormLegacyForm;
  formAdapter?: DynamicFormFormAdapter;
  values?: FormValues;
  uiConfig?: UIConfig;
  enableInitializationCheck?: boolean;
  checkDelay?: number;
}

// ---- Field 最小粒度：保持原样 ----
export interface RenderFieldItemParams {
  field: FieldState;
  form: DynamicFormLegacyForm;
  formAdapter: DynamicFormFormAdapter;
  fieldValue: FieldValue;
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
  form: DynamicFormLegacyForm;
  formAdapter: DynamicFormFormAdapter;
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
  form?: DynamicFormLegacyForm;
  formAdapter?: DynamicFormFormAdapter;
  renderer?: DynamicFormRendererAdapter;
  onSubmit?: (data: FormValues) => void;
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
  form: DynamicFormLegacyForm;
  formAdapter: DynamicFormFormAdapter;
  fieldValue?: FieldValue;
  name?: FieldNamePath;
  // 新增：组件注册器
  componentRegistry?: ComponentRegistryResolver | null;
  // 静态全局 UI 配置，来自 props.uiConfig 和默认值
  staticUIConfig?: UIConfig;
  // 动态全局 UI 配置，来自 effect 返回值
  dynamicUIConfig?: UIConfig;
  renderer: DynamicFormRendererAdapter;
  runtimeCapability?: FieldCapability;
}

export interface FieldComponentProps {
  field: FieldState;
  value?: FieldValue;
  onChange?: (value: FieldValue) => void;
  form: DynamicFormLegacyForm;
  formAdapter?: DynamicFormFormAdapter;
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

export interface NodeRegistryEntry {
  id: string;
  nodeType: FormNode['nodeType'];
  parentId?: string;
  config: FormNode;
  path: string[];
}

export interface ContainerRegistryEntry {
  id: string;
  parentId?: string;
  config: ContainerNode;
  path: string[];
}

export interface ConfigProcessInfo {
  effectMap: AnyLooseFormChainEffectMap;
  nodeRegistry: Record<string, NodeRegistryEntry>;
  containerRegistry: Record<string, ContainerRegistryEntry>;
  fieldRegistry: Record<string, FieldRegistry>;
  fieldAddressRegistry: Record<string, FieldAddress>;
  initialValues: FormValues;
  initializedFields: Record<string, FieldState>;
  initializedGroupFields: Record<string, GroupFieldState>;
  initializedNodes: Record<string, FieldState | ContainerState>;
  initializedContainerFields: Record<string, Record<string, FieldState>>;
  rootNodeIds: string[];
}

export interface ComponentRegistryResolver {
  getComponent: (componentType: string) => FieldComponent | undefined;
}

export interface FormChainContextType {
  form: DynamicFormLegacyForm;
  formAdapter: DynamicFormFormAdapter;
  state: FormState;
  dispatch: Dispatch<FormAction>;
  onValuesChange: (changed: FormValues) => void;
  manualTrigger: (field: string, value?: FieldValue) => void;
}
