import type { CompileFormConfigOptions, GroupModuleConfig, ModuleFormConfig } from '../compiler';
import type { ModuleRegistryManager } from '../modules';
import type { AdapterRegistryManager } from './AdapterRegistryManager';

export interface AdapterContext {
  metadata?: Record<string, unknown>;
}

export interface ModuleConfigAdapter<TInput = unknown> {
  type: string;
  supports(input: unknown, context: AdapterContext): input is TInput;
  adapt(input: TInput, context: AdapterContext): ModuleFormConfig;
}

export interface AdapterRegistryRegisterOptions {
  override?: boolean;
}

export interface AdapterResolveOptions {
  adapterType?: string;
  context?: AdapterContext;
}

export interface AdaptModuleConfigsOptions extends AdapterResolveOptions {
  registry?: AdapterRegistryManager;
}

export interface CompileAdaptedFormConfigOptions
  extends Omit<CompileFormConfigOptions, 'registry'>,
    AdapterResolveOptions {
  adapterRegistry?: AdapterRegistryManager;
  moduleRegistry?: ModuleRegistryManager;
  groupOverrides?: Record<string, Partial<GroupModuleConfig>>;
}
