import type { BaseFieldConfig, ComponentRegistry, FormConfig, GroupField } from '../shared/types';
import type { FieldModule, ModuleRegistryManager } from '../modules';
import type { DeclarativeRule, GroupDeclarativeRule } from '../rules';

export interface ModuleConfig<TOptions extends Record<string, unknown> = Record<string, unknown>> {
  type: string;
  id: string;
  groupId?: string;
  options?: TOptions;
  rules?: DeclarativeRule[];
  overrides?: Partial<BaseFieldConfig>;
}

export interface GroupModuleConfig extends Omit<GroupField, 'fields'> {
  rules?: GroupDeclarativeRule[];
}

export interface ModuleFormConfig {
  id?: string | number;
  fields: ModuleConfig[];
  groups?: GroupModuleConfig[];
}

export interface CompiledModuleConfig {
  formConfig: FormConfig;
  componentRegistry: ComponentRegistry;
}

export interface CompileHookContext {
  moduleFormConfig: ModuleFormConfig;
  registry: ModuleRegistryManager;
  componentRegistry: ComponentRegistry;
  fields: BaseFieldConfig[];
  groups: GroupField[];
  formConfig?: FormConfig;
  moduleConfig?: ModuleConfig;
  module?: FieldModule;
  field?: BaseFieldConfig;
  groupConfig?: GroupModuleConfig;
  group?: GroupField;
}

export interface CompilerHooks {
  beforeCompile?: (context: CompileHookContext) => void;
  afterCompile?: (context: CompileHookContext) => void;
  beforeGroupExpand?: (context: CompileHookContext) => void;
  afterGroupExpand?: (context: CompileHookContext) => void;
  beforeModuleExpand?: (context: CompileHookContext) => void;
  afterModuleExpand?: (context: CompileHookContext) => void;
}

export interface CompileFormConfigOptions {
  registry?: ModuleRegistryManager;
  hooks?: CompilerHooks;
}
