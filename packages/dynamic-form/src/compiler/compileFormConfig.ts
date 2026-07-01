import type React from 'react';
import type {
  BaseFieldConfig,
  ComponentRegistry,
  ContainerNode,
  FieldComponentProps,
  FormNode,
  FormConfig,
  GroupField
} from '../shared/types';
import { defaultModuleRegistry } from '../modules';
import {
  assertValidGroupRule,
  assertValidRule,
  compileRulesToEffect,
  inferRulesDependencies
} from '../rules';
import type {
  CompiledModuleConfig,
  CompileFormConfigOptions,
  CompileHookContext,
  CompilerHooks,
  GroupModuleConfig,
  ModuleFormConfig,
  ModuleFormNode,
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

function expandModuleNode(
  node: ModuleFormNode,
  options: CompileFormConfigOptions,
  componentRegistry: ComponentRegistry,
  allIds: Set<string>
): FormNode {
  if (!node.id) {
    throw new Error('compileFormConfig: node id is required.');
  }
  if (allIds.has(node.id)) {
    throw new Error(`compileFormConfig: duplicate node id "${node.id}".`);
  }
  allIds.add(node.id);

  if (node.nodeType === 'field') {
    const registry = options.registry || defaultModuleRegistry;
    const module = registry.get(node.type);

    if (!module) {
      throw new Error(
        `compileFormConfig: module type "${node.type}" is not registered for id "${node.id}".`
      );
    }

    const field = expandModule(node, options);
    if (module.component) {
      componentRegistry[module.type] = module.component as React.FC<FieldComponentProps>;
    }
    return {
      ...field,
      nodeType: 'field'
    };
  }

  if (!Array.isArray(node.children) || node.children.length === 0) {
    throw new Error(`compileFormConfig: container "${node.id}" must contain at least one child.`);
  }

  const groupRules = node.rules || [];
  groupRules.forEach(assertValidGroupRule);
  const ruleEffect =
    groupRules.length > 0 ? compileRulesToEffect(groupRules, { fieldId: node.id }) : undefined;
  const container: ContainerNode = {
    nodeType: 'container',
    id: node.id,
    title: node.title,
    name: node.name,
    initialVisible: node.initialVisible,
    repeatable: node.repeatable,
    dependents: mergeDependents(node.dependents, inferRulesDependencies(groupRules)),
    effect: ruleEffect,
    children: node.children.map((child) =>
      expandModuleNode(child, options, componentRegistry, allIds)
    )
  };

  return container;
}

export function compileFormConfig(
  moduleFormConfig: ModuleFormConfig,
  options: CompileFormConfigOptions = {}
): CompiledModuleConfig {
  const registry = options.registry || defaultModuleRegistry;
  const componentRegistry: ComponentRegistry = {};
  const fields: BaseFieldConfig[] = [];
  const groups: GroupField[] = [];
  const context: CompileHookContext = {
    moduleFormConfig,
    registry,
    componentRegistry,
    fields,
    groups
  };

  if (moduleFormConfig.fields !== undefined && !Array.isArray(moduleFormConfig.fields)) {
    throw new Error('compileFormConfig: fields must be an array.');
  }
  if (moduleFormConfig.nodes !== undefined && !Array.isArray(moduleFormConfig.nodes)) {
    throw new Error('compileFormConfig: nodes must be an array.');
  }

  runHook(options.hooks, 'beforeCompile', context);

  const groupConfigs = context.moduleFormConfig.groups || [];
  const groupConfigById = new Map<string, GroupModuleConfig>();
  const allIds = new Set<string>();

  groupConfigs.forEach((groupConfig) => {
    if (!groupConfig.id) {
      throw new Error('compileFormConfig: group id is required.');
    }
    if (groupConfigById.has(groupConfig.id)) {
      throw new Error(`compileFormConfig: duplicate group id "${groupConfig.id}".`);
    }
    groupConfigById.set(groupConfig.id, groupConfig);
    allIds.add(groupConfig.id);
  });

  const compiledFields = (context.moduleFormConfig.fields || []).map((moduleConfig) => {
    if (!moduleConfig.id) {
      throw new Error('compileFormConfig: field id is required.');
    }
    if (allIds.has(moduleConfig.id)) {
      throw new Error(`compileFormConfig: duplicate field or group id "${moduleConfig.id}".`);
    }
    allIds.add(moduleConfig.id);

    if (moduleConfig.groupId && !groupConfigById.has(moduleConfig.groupId)) {
      throw new Error(
        `compileFormConfig: field "${moduleConfig.id}" references unknown group "${moduleConfig.groupId}".`
      );
    }

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

    runHook(
      options.hooks,
      'afterModuleExpand',
      {
        ...moduleContext,
        field
      },
      moduleConfig
    );

    return { field, groupId: moduleConfig.groupId };
  });

  const compiledFieldsByGroup = new Map<string, BaseFieldConfig[]>();
  compiledFields.forEach(({ field, groupId }) => {
    if (!groupId) {
      fields.push(field);
      return;
    }

    const groupFields = compiledFieldsByGroup.get(groupId) || [];
    groupFields.push(field);
    compiledFieldsByGroup.set(groupId, groupFields);
  });

  groupConfigs.forEach((groupConfig) => {
    const groupFields = compiledFieldsByGroup.get(groupConfig.id) || [];

    if (groupFields.length === 0) {
      throw new Error(
        `compileFormConfig: group "${groupConfig.id}" must contain at least one field.`
      );
    }

    const groupRules = groupConfig.rules || [];
    groupRules.forEach(assertValidGroupRule);
    const ruleEffect =
      groupRules.length > 0
        ? compileRulesToEffect(groupRules, { fieldId: groupConfig.id })
        : undefined;
    const group: GroupField = {
      id: groupConfig.id,
      title: groupConfig.title,
      initialVisible: groupConfig.initialVisible,
      dependents: mergeDependents(groupConfig.dependents, inferRulesDependencies(groupRules)),
      effect:
        groupConfig.effect && ruleEffect
          ? (...args) => mergeEffectResults(groupConfig.effect!(...args), ruleEffect(...args))
          : ruleEffect || groupConfig.effect,
      fields: groupFields
    };
    const groupContext: CompileHookContext = {
      ...context,
      groupConfig,
      group
    };

    runHook(options.hooks, 'beforeGroupExpand', groupContext);
    groups.push(group);
    runHook(options.hooks, 'afterGroupExpand', groupContext);
  });

  const formConfig: FormConfig = { id: context.moduleFormConfig.id };
  const nodes =
    context.moduleFormConfig.nodes?.map((node) =>
      expandModuleNode(node, { ...options, registry }, componentRegistry, allIds)
    ) || [];

  if (nodes.length > 0) {
    formConfig.nodes = nodes;
  }
  if (fields.length > 0) {
    formConfig.fields = fields;
  }
  if (groups.length > 0) {
    formConfig.groups = groups;
  }
  if (!formConfig.nodes && !formConfig.fields && !formConfig.groups) {
    throw new Error('compileFormConfig: at least one node, field, or group is required.');
  }

  context.formConfig = formConfig;
  runHook(options.hooks, 'afterCompile', context);

  return {
    formConfig: context.formConfig || formConfig,
    componentRegistry
  };
}
