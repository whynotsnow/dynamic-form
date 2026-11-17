import { normalizeFieldName } from '@whynotsnow/dynamic-form-core';
import type { RuntimeState } from '@whynotsnow/dynamic-form-core';
import type { DynamicFormFormAdapter, FieldValue, FormState } from '../../shared/types';

function getContainerNamePath(
  containerId: string,
  state: FormState
): (string | number)[] | undefined {
  const containerIds: string[] = [];
  let currentId: string | undefined = containerId;

  while (currentId) {
    const entry: FormState['configProcessInfo']['containerRegistry'][string] | undefined =
      state.configProcessInfo.containerRegistry[currentId];
    if (!entry) return undefined;
    containerIds.unshift(currentId);
    currentId = entry.parentId;
  }

  const namePath = containerIds.flatMap((id) => {
    const name = state.configProcessInfo.containerRegistry[id].config.name;
    return name === undefined ? [] : normalizeFieldName(name);
  });

  return namePath.length > 0 ? namePath : undefined;
}

function hasRepeatableAncestor(containerId: string, state: FormState): boolean {
  let parentId = state.configProcessInfo.containerRegistry[containerId]?.parentId;

  while (parentId) {
    const parent = state.configProcessInfo.containerRegistry[parentId];
    if (!parent) return false;
    if (parent.config.repeatable) return true;
    parentId = parent.parentId;
  }

  return false;
}

/**
 * Form.List 使用运行时行索引，逐个清理子字段的 name path 无法移除列表值。
 * 应在 container 路径整体清空和恢复列表。
 */
export function synchronizeRepeatableContainerParticipation(
  formAdapter: DynamicFormFormAdapter,
  state: FormState,
  runtimeState: RuntimeState,
  previousRendered: Record<string, boolean>,
  hiddenValueCache: Record<string, FieldValue>
) {
  Object.entries(state.configProcessInfo.containerRegistry).forEach(([containerId, entry]) => {
    if (!entry.config.repeatable || hasRepeatableAncestor(containerId, state)) return;

    const namePath = getContainerNamePath(containerId, state);
    if (!namePath) return;

    const isRendered = runtimeState.groups[containerId]?.rendered === true;
    const wasRendered = previousRendered[containerId];

    if (!isRendered && wasRendered !== false) {
      const currentValue = formAdapter.getFieldValue(namePath);
      if (currentValue !== undefined) hiddenValueCache[containerId] = currentValue;
      formAdapter.setFieldValue(namePath, undefined);
    }

    if (isRendered && wasRendered === false && Object.hasOwn(hiddenValueCache, containerId)) {
      formAdapter.setFieldValue(namePath, hiddenValueCache[containerId]);
      delete hiddenValueCache[containerId];
    }

    previousRendered[containerId] = isRendered;
  });
}

export function isInsideRepeatableContainer(fieldId: string, state: FormState): boolean {
  let parentId = state.configProcessInfo.nodeRegistry[fieldId]?.parentId;

  while (parentId) {
    const parent = state.configProcessInfo.containerRegistry[parentId];
    if (!parent) return false;
    if (parent.config.repeatable) return true;
    parentId = parent.parentId;
  }

  return false;
}
