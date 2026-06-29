import { compileFormConfig } from '../compiler';
import type { CompiledModuleConfig, GroupModuleConfig, ModuleFormConfig } from '../compiler';
import type { CompileFormConfigOptions } from '../compiler';
import { defaultAdapterRegistry, adaptWithRegistry } from './AdapterRegistryManager';
import type { AdaptModuleConfigsOptions, CompileAdaptedFormConfigOptions } from './types';

export function adaptModuleConfigs(
  input: unknown,
  options: AdaptModuleConfigsOptions = {}
): ModuleFormConfig {
  return adaptWithRegistry(input, options.registry || defaultAdapterRegistry, {
    adapterType: options.adapterType,
    context: options.context
  });
}

function mergeStringLists(base?: string[], override?: string[]) {
  return Array.from(new Set([...(base || []), ...(override || [])]));
}

function applyGroupOverrides(
  moduleFormConfig: ModuleFormConfig,
  overrides: Record<string, Partial<GroupModuleConfig>> = {}
): ModuleFormConfig {
  const overrideEntries = Object.entries(overrides);

  if (overrideEntries.length === 0) {
    return moduleFormConfig;
  }

  const groups = moduleFormConfig.groups || [];
  const groupIds = new Set(groups.map((group) => group.id));

  overrideEntries.forEach(([groupId]) => {
    if (!groupIds.has(groupId)) {
      throw new Error(`compileAdaptedFormConfig: group override "${groupId}" was not found.`);
    }
  });

  return {
    ...moduleFormConfig,
    groups: groups.map((group) => {
      const override = overrides[group.id];

      if (!override) {
        return group;
      }

      return {
        ...group,
        ...override,
        id: group.id,
        dependents: mergeStringLists(group.dependents, override.dependents),
        rules: [...(group.rules || []), ...(override.rules || [])]
      };
    })
  };
}

export function compileAdaptedFormConfig(
  input: unknown,
  options: CompileAdaptedFormConfigOptions = {}
): CompiledModuleConfig {
  const moduleFormConfig = adaptWithRegistry(
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

  return compileFormConfig(
    applyGroupOverrides(moduleFormConfig, options.groupOverrides),
    compileOptions
  );
}
