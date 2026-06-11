import type { EffectFn } from 'form-chain-effect-engine';
import { createRuleEngine } from './RuleEngine';
import type { CompileRulesToEffectOptions, DeclarativeRule, RuleCondition } from './types';

function collectDependencies(condition: RuleCondition, dependencies: Set<string>) {
  // 只从 when 条件收集 source fields；then 只影响规则所属字段，不参与依赖触发。
  if ('all' in condition) {
    condition.all.forEach((item) => collectDependencies(item, dependencies));
    return;
  }

  if ('any' in condition) {
    condition.any.forEach((item) => collectDependencies(item, dependencies));
    return;
  }

  if ('not' in condition) {
    collectDependencies(condition.not, dependencies);
    return;
  }

  dependencies.add(condition.field);
}

export function inferRuleDependencies(rule: DeclarativeRule): string[] {
  if (rule.dependencies) {
    return rule.dependencies;
  }

  const dependencies = new Set<string>();
  collectDependencies(rule.when, dependencies);

  return Array.from(dependencies);
}

export function inferRulesDependencies(rules: DeclarativeRule[] = []): string[] {
  return Array.from(new Set(rules.flatMap((rule) => inferRuleDependencies(rule))));
}

export function compileRulesToEffect(
  rules: DeclarativeRule[],
  options: CompileRulesToEffectOptions
): EffectFn {
  const enabledRules = rules.filter((rule) => rule.enabled !== false);
  const engine = createRuleEngine({ debug: options.debug });

  // 保持 per-field effect contract：Rule Engine 只返回当前字段的 EffectResult。
  return (changedValue, allValues) =>
    engine.evaluate(enabledRules, {
      fieldId: options.fieldId,
      changedValue,
      values: allValues
    });
}
