import type {
  DeclarativeRule,
  RuleAction,
  RuleCondition,
  RuleEngineOptions,
  RuleEvaluationContext,
  RuleEvaluationResult
} from './types';

function isEmptyValue(value: unknown) {
  return value === undefined || value === null || value === '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isUnsupportedTargetError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('target is not supported');
}

function assertCondition(condition: RuleCondition, ruleLabel: string): void {
  if (!isRecord(condition)) {
    throw new Error(`${ruleLabel}: rule condition must be an object.`);
  }

  if ('all' in condition) {
    if (!Array.isArray(condition.all)) {
      throw new Error(`${ruleLabel}: "all" condition must be an array.`);
    }
    condition.all.forEach((item) => assertCondition(item, ruleLabel));
    return;
  }

  if ('any' in condition) {
    if (!Array.isArray(condition.any)) {
      throw new Error(`${ruleLabel}: "any" condition must be an array.`);
    }
    condition.any.forEach((item) => assertCondition(item, ruleLabel));
    return;
  }

  if ('not' in condition) {
    assertCondition(condition.not, ruleLabel);
    return;
  }

  if (typeof condition.field !== 'string' || condition.field.length === 0) {
    throw new Error(`${ruleLabel}: field condition requires a non-empty field.`);
  }

  const operators = ['equals', 'notEquals', 'empty', 'notEmpty'].filter((key) => key in condition);

  if (operators.length !== 1) {
    throw new Error(`${ruleLabel}: field condition requires exactly one operator.`);
  }
}

function assertAction(action: RuleAction, ruleLabel: string): void {
  const knownActions = new Set([
    'show',
    'hide',
    'enable',
    'disable',
    'readonly',
    'editable',
    'setValue',
    'clearValue'
  ]);

  if (!isRecord(action) || typeof action.action !== 'string' || !knownActions.has(action.action)) {
    throw new Error(`${ruleLabel}: unknown rule action.`);
  }

  if ('target' in action) {
    throw new Error(
      `${ruleLabel}: rule action target is not supported; declare the rule on the affected field instead.`
    );
  }

  if (action.action === 'setValue' && !('value' in action)) {
    throw new Error(`${ruleLabel}: setValue action requires a value.`);
  }
}

export function assertValidRule(rule: DeclarativeRule): void {
  const ruleLabel = rule.id ? `Rule "${rule.id}"` : 'Rule';

  if (!isRecord(rule)) {
    throw new Error(`${ruleLabel}: rule must be an object.`);
  }

  if ('target' in rule) {
    throw new Error(
      `${ruleLabel}: rule target is not supported; declare the rule on the affected field instead.`
    );
  }

  assertCondition(rule.when, ruleLabel);

  const actions = Array.isArray(rule.then) ? rule.then : [rule.then];

  if (actions.length === 0) {
    throw new Error(`${ruleLabel}: rule must declare at least one action.`);
  }

  actions.forEach((action) => assertAction(action, ruleLabel));
}

export function evaluateCondition(
  condition: RuleCondition,
  values: Record<string, unknown>
): boolean {
  // Composite conditions are resolved recursively so the public DSL stays small.
  if ('all' in condition) {
    return condition.all.every((item) => evaluateCondition(item, values));
  }

  if ('any' in condition) {
    return condition.any.some((item) => evaluateCondition(item, values));
  }

  if ('not' in condition) {
    return !evaluateCondition(condition.not, values);
  }

  const value = values[condition.field];

  if ('equals' in condition) {
    return value === condition.equals;
  }

  if ('notEquals' in condition) {
    return value !== condition.notEquals;
  }

  if ('empty' in condition) {
    return isEmptyValue(value);
  }

  return !isEmptyValue(value);
}

function applyAction(result: RuleEvaluationResult, action: RuleAction) {
  // Rule 只描述所属字段的状态补丁；跨字段影响由多个字段依赖同一 source field 表达。
  switch (action.action) {
    case 'show':
      result.visible = true;
      break;
    case 'hide':
      result.visible = false;
      break;
    case 'enable':
      result.disabled = false;
      break;
    case 'disable':
      result.disabled = true;
      break;
    case 'readonly':
      result.readonly = true;
      break;
    case 'editable':
      result.readonly = false;
      break;
    case 'setValue':
      result.value = action.value;
      break;
    case 'clearValue':
      result.value = undefined;
      break;
  }
}

export function evaluateRule(
  rule: DeclarativeRule,
  context: RuleEvaluationContext
): RuleEvaluationResult | undefined {
  assertValidRule(rule);

  if (rule.enabled === false || !evaluateCondition(rule.when, context.values)) {
    return undefined;
  }

  const result: RuleEvaluationResult = {};
  const actions = Array.isArray(rule.then) ? rule.then : [rule.then];

  actions.forEach((action) => applyAction(result, action));

  return Object.keys(result).length > 0 ? result : undefined;
}

export class RuleEngine {
  private readonly options: RuleEngineOptions;

  constructor(options: RuleEngineOptions = {}) {
    this.options = options;
  }

  evaluate(
    rules: DeclarativeRule[],
    context: RuleEvaluationContext
  ): RuleEvaluationResult | undefined {
    const result: RuleEvaluationResult = {};

    rules.forEach((rule) => {
      if (rule.enabled === false) {
        return;
      }

      try {
        // Later matching rules intentionally override earlier result keys.
        const ruleResult = evaluateRule(rule, context);

        if (ruleResult) {
          Object.assign(result, ruleResult);
        }
      } catch (error) {
        if (isUnsupportedTargetError(error)) {
          throw error;
        }

        if (this.options.debug) {
          console.warn('RuleEngine.evaluate skipped failed rule.', { rule, error });
        }
      }
    });

    return Object.keys(result).length > 0 ? result : undefined;
  }
}

export function createRuleEngine(options?: RuleEngineOptions) {
  return new RuleEngine(options);
}
