export { default as DynamicForm } from './index';

export { default as DynamicFormProvider } from './consumer/provider/DynamicFormProvider';
export { default as FormChainEffectEngineWrapper } from './consumer/provider/DynamicFormProvider';

export type {
  DynamicFormProps,
  FormValues,
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

export {
  ComponentRegistryManager,
  DefaultRegistryFieldComponents
} from './consumer/render/componentRegistry';

export { compileFormConfig } from './compiler';
export type {
  CompiledModuleConfig,
  CompileFormConfigOptions,
  CompileHookContext,
  CompilerHooks,
  ModuleConfig
} from './compiler';

export { ModuleRegistryManager, defaultModuleRegistry } from './modules';
export type { FieldModule, ModuleRegistryRegisterOptions } from './modules';

export {
  AdapterRegistryManager,
  ModuleConfigPassthroughAdapter,
  adaptModuleConfigs,
  compileAdaptedFormConfig,
  defaultAdapterRegistry
} from './adapters';
export type {
  AdaptModuleConfigsOptions,
  AdapterContext,
  AdapterRegistryRegisterOptions,
  AdapterResolveOptions,
  CompileAdaptedFormConfigOptions,
  ModuleConfigAdapter
} from './adapters';

export { RuleEngine, createRuleEngine, compileRulesToEffect, evaluateRule } from './rules';
export type {
  DeclarativeRule,
  RuleAction,
  RuleCondition,
  RuleEngineOptions,
  RuleEvaluationContext,
  RuleEvaluationResult
} from './rules';

export { useFormChainContext } from './shared/context/FormChainContext';
export { useStoreInit } from './state';
export { useInitHandlers } from './consumer/hooks/useInitHandlers';

export { getDefaultConfig } from './config/defaultConfig';
export { processFormConfig } from './config';
