import type { FormState } from '../shared/types';
import type { FieldCapability, GroupCapability } from './types';
import { getFieldBehaviorMeta, getGroupBehaviorMeta } from '../shared/utils';

import { getAllFieldIds, getFieldById, getFieldGroup, getGroupById } from './selectors';

/**
 * 计算字段最终运行时能力
 *
 * Runtime Layer 的职责：
 * - 聚合 Field Meta
 * - 聚合 Group Meta
 * - 聚合 Field Config
 * - 计算最终能力
 *
 * UI 层禁止直接依赖 Meta。
 */
export function resolveFieldCapability(fieldId: string, state: FormState): FieldCapability {
  const field = getFieldById(fieldId, state);

  if (!field) {
    return {
      rendered: false,
      submitable: false,

      editable: false,
      readonly: false,
      disabled: true,

      validatable: false
    };
  }

  const group = getFieldGroup(fieldId, state);

  /**
   * Visible
   */
  const fieldBehavior = getFieldBehaviorMeta(field.meta);
  const groupBehavior = getGroupBehaviorMeta(group?.meta);

  const fieldVisible = fieldBehavior.visible !== false;
  const groupVisible = groupBehavior.visible !== false;

  const rendered = fieldVisible && groupVisible;

  /**
   * Submit
   *
   * 当前策略：
   * 不渲染 => 不参与提交
   */
  const submitable = rendered;

  /**
   * Disabled
   *
   * 预留 Runtime 能力扩展
   */
  const disabled = fieldBehavior.disabled === true;

  /**
   * Readonly
   *
   * 预留 Runtime 能力扩展
   */
  const readonly = fieldBehavior.readonly === true;

  /**
   * Editable
   */
  const editable = rendered && !disabled && !readonly;

  /**
   * Validatable
   *
   * 当前策略：
   * 可提交字段参与校验
   */
  const validatable = rendered && !disabled;

  return {
    rendered,
    submitable,

    editable,
    readonly,
    disabled,

    validatable
  };
}

/**
 * 计算 Group 最终运行时能力
 */
export function resolveGroupCapability(groupId: string, state: FormState): GroupCapability {
  const group = getGroupById(groupId, state);

  if (!group) {
    return {
      rendered: false
    };
  }

  const groupBehavior = getGroupBehaviorMeta(group.meta);
  const groupVisible = groupBehavior.visible !== false;

  return {
    rendered: groupVisible
  };
}

/**
 * 批量计算所有字段能力
 */
export function resolveAllFieldCapabilities(state: FormState): Record<string, FieldCapability> {
  const result: Record<string, FieldCapability> = {};

  getAllFieldIds(state).forEach((fieldId) => {
    result[fieldId] = resolveFieldCapability(fieldId, state);
  });

  return result;
}
