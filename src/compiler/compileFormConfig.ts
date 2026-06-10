import type React from 'react';
import type { BaseFieldConfig, ComponentRegistry, FieldComponentProps } from '../shared/types';
import { defaultModuleRegistry } from '../modules';
import { assertValidRule, compileRulesToEffect, inferRulesDependencies } from '../rules';
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

function mergeEffectResults(baseResult: unknown, ruleResult: unknown) {
  if (!baseResult || typeof baseResult !== 'object') {
    return ruleResult;
  }

  if (!ruleResult || typeof ruleResult !== 'object') {
    return baseResult;
  }

  return {
    ...baseResult,
    ...ruleResult
  };
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
  const rules = [...(module.rules || []), ...(moduleConfig.rules || [])];
  const rulesDependents = inferRulesDependencies(rules);
  const baseEffect = baseConfig.effect || module.effect;
  const ruleEffect =
    rules.length > 0 ? compileRulesToEffect(rules, { fieldId: moduleConfig.id }) : undefined;

  // Validate during compilation so broken rule definitions fail before rendering.
  rules.forEach(assertValidRule);

  const field: BaseFieldConfig = {
    ...baseConfig,
    id: moduleConfig.id,
    component: module.component ? module.type : baseConfig.component,
    componentProps: {
      ...(module.defaultProps || {}),
      ...(baseConfig.componentProps || {})
    },
    dependents: mergeDependents(
      mergeDependents(module.dependencies, baseConfig.dependents),
      rulesDependents
    ),
    // Existing effects still run first; rule results are merged last by design.
    effect:
      baseEffect && ruleEffect
        ? (...args) => mergeEffectResults(baseEffect(...args), ruleEffect(...args))
        : ruleEffect || baseEffect
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
