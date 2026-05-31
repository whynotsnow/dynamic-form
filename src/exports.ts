// 主要组件导出
export { default as DynamicForm } from './index';

// 内部组件（供高级用户使用）
export { default as FormChainEffectEngineWrapper } from './consumer/effect/FormChainEffectEngineWrapper';

// 类型导出
export type {
  DynamicFormProps,
  FormConfig,
  FlatFormConfig,
  GroupedFormConfig,
  BaseFieldConfig,
  FieldState,
  GroupFieldState,
  FieldComponentProps,
  ComponentRegistry,
  ComponentRegistryConfig,
  UIConfig,
  RenderFieldItemParams,
  RenderFieldsParams,
  RenderGroupItemParams,
  RenderGroupsParams,
  RenderFormParams
} from './shared/types';

// 组件注册器导出
export {
  ComponentRegistryManager,
  DefaultRegistryFieldComponents
} from './consumer/render/fieldComponentRegistry';

// Hook导出
export { useFormChainContext } from './shared/context/FormChainContext';
export { useStoreInit } from './state';
export { useInitHandlers } from './consumer/effect/useInitHandlers';

// 配置导出
export { getDefaultConfig } from './config/defaultConfig';
