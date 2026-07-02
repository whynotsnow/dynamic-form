export type {
  BaseFieldConfig,
  ConfigProcessInfo,
  ContainerNode,
  ContainerRegistryEntry,
  DesignerMetadata,
  DynamicFormFormAdapter,
  FieldAddress,
  FieldNamePath,
  FieldNode,
  FieldState,
  FlatFormConfig,
  FormConfig,
  FormNode,
  FormValues,
  GroupField,
  GroupFieldState,
  GroupedFormConfig,
  NodeRegistryEntry,
  ValidationRule
} from './shared/types';

export { getFieldName, resolveFieldAddress } from './shared/utils';

export { compileFormConfig } from './compiler';
export type {
  CompiledModuleConfig,
  CompileFormConfigOptions,
  CompileHookContext,
  CompilerHooks,
  GroupModuleConfig,
  ModuleConfig,
  ModuleContainerNode,
  ModuleFieldNode,
  ModuleFormConfig,
  ModuleFormNode
} from './compiler';

export { ModuleRegistryManager, defaultModuleRegistry } from './modules';
export type { FieldModule, ModuleRegistryRegisterOptions } from './modules';

export {
  AdapterRegistryManager,
  JsonSchemaAdapter,
  MetadataAdapter,
  ModuleConfigPassthroughAdapter,
  OpenApiAdapter,
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
  JsonSchemaAdapterInput,
  JsonSchemaProperty,
  MetadataAdapterField,
  MetadataAdapterInput,
  ModuleConfigAdapter,
  OpenApiAdapterInput,
  SchemaAdapterFieldMetadata,
  SchemaAdapterOptions,
  SchemaFormMetadata,
  SchemaGroupConfig,
  SchemaModuleFormConfig
} from './adapters';

export { RuleEngine, compileRulesToEffect, createRuleEngine, evaluateRule } from './rules';
export type {
  DeclarativeRule,
  GroupDeclarativeRule,
  GroupRuleAction,
  RuleAction,
  RuleCondition,
  RuleEngineOptions,
  RuleEvaluationContext,
  RuleEvaluationResult
} from './rules';

export type { FieldCapability, GroupCapability, NodeCapability, RuntimeState } from './runtime';
export {
  getFieldRuntimeSnapshot,
  getRenderedFieldIds,
  getSubmitableFieldIds,
  getValidatableFieldIds,
  resolveFieldCapability,
  resolveGroupCapability,
  resolveRuntimeState
} from './runtime';

export { getFormConfigDiagnostics, processFormConfig, validateFormConfig } from './config';
export type {
  ApplyInitialEffectResultParams,
  FormConfigDiagnostic,
  FormConfigDiagnosticsOptions,
  FormConfigDiagnosticSeverity,
  FormConfigValidationResult,
  ProcessFormConfigOptions
} from './config';
