import type { BaseFieldConfig, ComponentRegistry, FormConfig } from '../shared/types';
import type { FieldModule, ModuleRegistryManager } from '../modules';

export interface ModuleConfig {
  type: string;
  id: string;
  options?: Record<string, unknown>;
  overrides?: Partial<BaseFieldConfig>;
}

export interface CompiledModuleConfig {
  formConfig: FormConfig;
  componentRegistry: ComponentRegistry;
}

export interface CompileHookContext {
  moduleConfigs: ModuleConfig[];
  registry: ModuleRegistryManager;
  componentRegistry: ComponentRegistry;
  fields: BaseFieldConfig[];
  formConfig?: FormConfig;
  moduleConfig?: ModuleConfig;
  module?: FieldModule;
  field?: BaseFieldConfig;
}

export interface CompilerHooks {
  beforeCompile?: (context: CompileHookContext) => void;
  afterCompile?: (context: CompileHookContext) => void;
  beforeModuleExpand?: (context: CompileHookContext) => void;
  afterModuleExpand?: (context: CompileHookContext) => void;
}

export interface CompileFormConfigOptions {
  registry?: ModuleRegistryManager;
  hooks?: CompilerHooks;
}
