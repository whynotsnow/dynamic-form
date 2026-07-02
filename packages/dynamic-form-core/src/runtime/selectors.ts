import type { ContainerState, FieldState, FormState, GroupFieldState } from '../shared/types';

/**
 * 根据 fieldId 获取字段
 */
export function getFieldById(fieldId: string, state: FormState): FieldState | undefined {
  const registry = state.configProcessInfo.fieldRegistry[fieldId];

  if (!registry) {
    return undefined;
  }

  if (registry.groupId) {
    return (
      state.containerFields[registry.groupId]?.[fieldId] ||
      state.groupFields[registry.groupId]?.fields[fieldId]
    );
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

export function getContainerById(
  containerId: string,
  state: FormState
): ContainerState | undefined {
  const node = state.nodes[containerId];

  if (node && 'children' in node) {
    return node as ContainerState;
  }

  return undefined;
}

export function getParentContainerId(nodeId: string, state: FormState): string | undefined {
  return state.configProcessInfo.nodeRegistry[nodeId]?.parentId;
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

  Object.entries(state.configProcessInfo.nodeRegistry).forEach(([id, registry]) => {
    if (registry.nodeType === 'field') {
      result.push(id);
    }
  });

  return result;
}

/**
 * 获取所有 Group id
 */
export function getAllGroupIds(state: FormState): string[] {
  return Object.keys(state.configProcessInfo.containerRegistry);
}

/**
 * 获取所有字段
 */
export function getAllFields(state: FormState): FieldState[] {
  return getAllFieldIds(state)
    .map((fieldId) => getFieldById(fieldId, state))
    .filter((field): field is FieldState => !!field);
}

/**
 * 获取所有分组
 */
export function getAllGroups(state: FormState): GroupFieldState[] {
  return Object.values(state.groupFields);
}
