import type { Rule } from 'antd/es/form';
import type { FieldState } from '../../shared/types';

function hasRequiredRule(rules: Rule[] = []): boolean {
  return rules.some((rule) => {
    if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
      return false;
    }

    return 'required' in rule && rule.required === true;
  });
}

export function resolveFieldRules(field: FieldState, validatable = true): Rule[] {
  if (!validatable) {
    return [];
  }

  const rules = field.rules ?? [];

  if (!field.required || hasRequiredRule(rules)) {
    return rules;
  }

  // required 是字段声明属性；默认 AntD renderer 在这里补齐实际校验规则。
  return [{ required: true, message: `${field.label ?? field.id}不能为空` }, ...rules];
}

export function resolveFieldRequired(
  field: FieldState,
  rules: Rule[],
  validatable = true
): boolean {
  if (!validatable) {
    return false;
  }

  return field.required === true || hasRequiredRule(rules);
}
