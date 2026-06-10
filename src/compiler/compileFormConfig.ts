import type React from 'react';
import type { BaseFieldConfig, ComponentRegistry, FieldComponentProps } from '../shared/types';
import { defaultModuleRegistry } from '../modules';
import type {
  CompiledModuleConfig,
  CompileFormConfigOptions,
  CompileHookContext,
  CompilerHooks,
  ModuleConfig
} from './types';

function createHookError(
  hookName: keyof CompilerHooks,
  error: unknown,
  moduleConfig?: ModuleConfig
) {
  const target = moduleConfig
    ? ` for module "${moduleConfig.type}" with id "${moduleConfig.id}"`
    : '';
  const message = error instanceof Error ? error.message : String(error);

  return new Error(`compileFormConfig.${hookName}${target} failed: ${message}`);
}

function runHook(
  hooks: CompilerHooks | undefined,
  hookName: keyof CompilerHooks,
  context: CompileHookContext,
  moduleConfig?: ModuleConfig
) {
  const hook = hooks?.[hookName];

  if (!hook) {
    return;
  }

  try {
    hook(context);
  } catch (error) {
    throw createHookError(hookName, error, moduleConfig);
  }
}

function mergeDependents(moduleDependents?: string[], fieldDependents?: string[]) {
  return Array.from(new Set([...(moduleDependents || []), ...(fieldDependents || [])]));
}

function expandModule(
  moduleConfig: ModuleConfig,
  options: CompileFormConfigOptions
): BaseFieldConfig {
  const registry = options.registry || defaultModuleRegistry;
  const module = registry.get(moduleConfig.type);

  if (!module) {
    throw new Error(
      `compileFormConfig: module type "${moduleConfig.type}" is not registered for id "${moduleConfig.id}".`
    );
  }

  const baseConfig = module.createConfig?.(moduleConfig.options) || {
    id: moduleConfig.id,
    component: moduleConfig.type
  };

  const field: BaseFieldConfig = {
    ...baseConfig,
    id: moduleConfig.id,
    component: module.component ? module.type : baseConfig.component,
    componentProps: {
      ...(module.defaultProps || {}),
      ...(baseConfig.componentProps || {})
    },
    dependents: mergeDependents(module.dependencies, baseConfig.dependents),
    effect: baseConfig.effect || module.effect
  };

  const overrides = moduleConfig.overrides;

  if (!overrides) {
    return field;
  }

  return {
    ...field,
    ...overrides,
    componentProps: {
      ...(field.componentProps || {}),
      ...(overrides.componentProps || {})
    }
  };
}

export function compileFormConfig(
  moduleConfigs: ModuleConfig[],
  options: CompileFormConfigOptions = {}
): CompiledModuleConfig {
  const registry = options.registry || defaultModuleRegistry;
  const componentRegistry: ComponentRegistry = {};
  const fields: BaseFieldConfig[] = [];
  const context: CompileHookContext = {
    moduleConfigs,
    registry,
    componentRegistry,
    fields
  };

  runHook(options.hooks, 'beforeCompile', context);

  context.moduleConfigs.forEach((moduleConfig) => {
    const module = registry.get(moduleConfig.type);

    if (!module) {
      throw new Error(
        `compileFormConfig: module type "${moduleConfig.type}" is not registered for id "${moduleConfig.id}".`
      );
    }

    const moduleContext: CompileHookContext = {
      ...context,
      moduleConfig,
      module
    };

    runHook(options.hooks, 'beforeModuleExpand', moduleContext, moduleConfig);

    const field = expandModule(moduleConfig, { ...options, registry });

    if (module.component) {
      componentRegistry[module.type] = module.component as React.FC<FieldComponentProps>;
    }

    fields.push(field);

    runHook(
      options.hooks,
      'afterModuleExpand',
      {
        ...moduleContext,
        field
      },
      moduleConfig
    );
  });

  context.formConfig = { fields };
  runHook(options.hooks, 'afterCompile', context);

  return {
    formConfig: context.formConfig || { fields },
    componentRegistry
  };
}
