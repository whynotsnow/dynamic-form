import { compileFormConfig } from '../compiler';
import type { CompiledModuleConfig, ModuleConfig } from '../compiler';
import type { CompileFormConfigOptions } from '../compiler';
import { defaultAdapterRegistry, adaptWithRegistry } from './AdapterRegistryManager';
import type { AdaptModuleConfigsOptions, CompileAdaptedFormConfigOptions } from './types';

export function adaptModuleConfigs(
  input: unknown,
  options: AdaptModuleConfigsOptions = {}
): ModuleConfig[] {
  return adaptWithRegistry(input, options.registry || defaultAdapterRegistry, {
    adapterType: options.adapterType,
    context: options.context
  });
}

export function compileAdaptedFormConfig(
  input: unknown,
  options: CompileAdaptedFormConfigOptions = {}
): CompiledModuleConfig {
  const moduleConfigs = adaptWithRegistry(
    input,
    options.adapterRegistry || defaultAdapterRegistry,
    {
      adapterType: options.adapterType,
      context: options.context
    }
  );
  const compileOptions: CompileFormConfigOptions = {
    registry: options.moduleRegistry,
    hooks: options.hooks
  };

  return compileFormConfig(moduleConfigs, compileOptions);
}
