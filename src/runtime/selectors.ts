import type { FormState, FieldState, GroupFieldState } from '../types';

/**
 * 根据 fieldId 获取字段
 */
export function getFieldById(fieldId: string, state: FormState): FieldState | undefined {
  const registry = state.configProcessInfo.fieldRegistry[fieldId];

  if (!registry) {
    return undefined;
  }

  if (registry.groupId) {
    return state.groupFields[registry.groupId]?.fields[fieldId];
  }

  return state.fields[fieldId];
}

/**
 * 根据 fieldId 获取所属分组
 */
export function getFieldGroup(fieldId: string, state: FormState): GroupFieldState | undefined {
  const registry = state.configProcessInfo.fieldRegistry[fieldId];

  if (!registry?.groupId) {
    return undefined;
  }

  return state.groupFields[registry.groupId];
}

/**
 * 根据 groupId 获取分组
 */
export function getGroupById(groupId: string, state: FormState): GroupFieldState | undefined {
  return state.groupFields[groupId];
}

/**
 * 判断字段是否属于分组
 */
export function isGroupedField(fieldId: string, state: FormState): boolean {
  const registry = state.configProcessInfo.fieldRegistry[fieldId];

  return !!registry?.groupId;
}

/**
 * 获取所有字段 id
 *
 * 不包含 Group id
 */
export function getAllFieldIds(state: FormState): string[] {
  const result: string[] = [];

  Object.entries(state.configProcessInfo.fieldRegistry).forEach(([id, registry]) => {
    const config = registry.config;

    const isGroup = config && typeof config === 'object' && 'fields' in config;

    if (!isGroup) {
      result.push(id);
    }
  });

  return result;
}

/**
 * 获取所有 Group id
 */
export function getAllGroupIds(state: FormState): string[] {
  return Object.keys(state.groupFields);
}

/**
 * 获取所有字段
 */
export function getAllFields(state: FormState): FieldState[] {
  return [
    ...Object.values(state.fields),
    ...Object.values(state.groupFields).flatMap((group) => Object.values(group.fields))
  ];
}

/**
 * 获取所有分组
 */
export function getAllGroups(state: FormState): GroupFieldState[] {
  return Object.values(state.groupFields);
}
