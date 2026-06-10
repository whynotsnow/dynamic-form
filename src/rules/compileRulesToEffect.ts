import type { EffectFn } from 'form-chain-effect-engine';
import { createRuleEngine } from './RuleEngine';
import type { CompileRulesToEffectOptions, DeclarativeRule, RuleCondition } from './types';

function collectDependencies(condition: RuleCondition, dependencies: Set<string>) {
  // Dependencies are inferred only from conditions; actions do not trigger re-evaluation.
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

  // Keep Rule Engine behind the existing effect contract used by form-chain-effect-engine.
  return (changedValue, allValues) =>
    engine.evaluate(enabledRules, {
      fieldId: options.fieldId,
      changedValue,
      values: allValues
    });
}
