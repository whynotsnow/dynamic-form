import type { FieldValue, FormValues } from '../shared/types';

export type RuleFieldCondition =
  | {
      field: string;
      equals: FieldValue;
    }
  | {
      field: string;
      notEquals: FieldValue;
    }
  | {
      field: string;
      empty: true;
    }
  | {
      field: string;
      notEmpty: true;
    };

export type RuleCondition =
  | RuleFieldCondition
  | {
      all: RuleCondition[];
    }
  | {
      any: RuleCondition[];
    }
  | {
      not: RuleCondition;
    };

export type RuleAction =
  | {
      action: 'show' | 'hide' | 'enable' | 'disable' | 'readonly' | 'editable' | 'clearValue';
    }
  | {
      action: 'setValue';
      value: FieldValue;
    };

export interface DeclarativeRule {
  id?: string;
  when: RuleCondition;
  then: RuleAction | RuleAction[];
  dependencies?: string[];
  enabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface RuleEvaluationContext {
  fieldId: string;
  changedValue?: FieldValue;
  values: FormValues;
}

export interface RuleEvaluationResult {
  visible?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  value?: FieldValue;
}

export interface RuleEngineOptions {
  debug?: boolean;
}

export interface CompileRulesToEffectOptions extends RuleEngineOptions {
  fieldId: string;
}
