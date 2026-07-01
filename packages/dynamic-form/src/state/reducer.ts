import type { FormState, FormAction, FieldMeta, UIConfig } from '../shared/types';
import { mergeFieldMetaPatch, mergeGroupMetaPatch } from '../shared/utils';

function mergeDynamicUIConfig(current: UIConfig, patch: Partial<UIConfig>): UIConfig {
  const result = { ...current };

  (Object.keys(patch) as (keyof UIConfig)[]).forEach((key) => {
    const value = patch[key];

    Object.assign(result, {
      [key]:
        typeof value === 'object' && value !== null
          ? {
              ...((current[key] as object) || {}),
              ...value
            }
          : value
    });
  });

  return result;
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'INIT': {
      const { configProcessInfo } = action.payload;

      return {
        ...state,
        fields: configProcessInfo.initializedFields,
        groupFields: configProcessInfo.initializedGroupFields,
        nodes: configProcessInfo.initializedNodes,
        rootNodeIds: configProcessInfo.rootNodeIds,
        containerFields: configProcessInfo.initializedContainerFields,
        configProcessInfo,
        initialized: true
      };
    }

    case 'UPDATE_META': {
      const { fieldId, meta } = action.payload;
      if (!meta) return state;

      const registryEntry = state.configProcessInfo.fieldRegistry[fieldId];
      if (!registryEntry) {
        console.warn(`UPDATE_META: 未找到字段 ${fieldId}`);
        return state;
      }

      const { isGroupField, groupId } = registryEntry;

      if (!isGroupField) {
        const field = state.fields[fieldId];
        if (!field) {
          console.warn(`UPDATE_META: 字段状态未初始化 ${fieldId}`);
          return state;
        }

        const nextField = {
          ...field,
          meta: mergeFieldMetaPatch(field.meta || ({} as FieldMeta), meta)
        };

        return {
          ...state,
          fields: {
            ...state.fields,
            [fieldId]: nextField
          },
          nodes: {
            ...(state.nodes || {}),
            [fieldId]: nextField
          }
        };
      }

      const group = groupId ? state.groupFields[groupId] : undefined;
      const field = group?.fields[fieldId];
      if (!group || !groupId || !field) {
        console.warn(`UPDATE_META: 字段状态未初始化 ${fieldId}`);
        return state;
      }

      const nextField = {
        ...field,
        meta: mergeFieldMetaPatch(field.meta || ({} as FieldMeta), meta)
      };

      return {
        ...state,
        groupFields: {
          ...state.groupFields,
          [groupId]: {
            ...group,
            fields: {
              ...group.fields,
              [fieldId]: nextField
            }
          }
        },
        containerFields: {
          ...(state.containerFields || {}),
          [groupId]: {
            ...((state.containerFields || {})[groupId] || {}),
            [fieldId]: nextField
          }
        },
        nodes: {
          ...(state.nodes || {}),
          [fieldId]: nextField
        }
      };
    }

    case 'SET_GROUP_META': {
      const { groupId, meta } = action.payload;
      const group = state.groupFields[groupId];

      if (!group) {
        console.error(`SET_GROUP_META: 未找到分组 ${groupId}`);
        return state;
      }

      const nextMeta = mergeGroupMetaPatch(group.meta, meta);
      const node = state.nodes?.[groupId];

      return {
        ...state,
        groupFields: {
          ...state.groupFields,
          [groupId]: {
            ...group,
            meta: nextMeta
          }
        },
        nodes: node
          ? {
              ...state.nodes,
              [groupId]: {
                ...node,
                meta: nextMeta
              }
            }
          : state.nodes
      };
    }

    case 'SET_CONTAINER_META': {
      const { containerId, meta } = action.payload;
      const container = state.nodes?.[containerId];
      const group = state.groupFields[containerId];

      if (!container || !('children' in container)) {
        console.error(`SET_CONTAINER_META: 未找到容器 ${containerId}`);
        return state;
      }

      const nextMeta = mergeGroupMetaPatch(container.meta, meta);

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [containerId]: {
            ...container,
            meta: nextMeta
          }
        },
        groupFields: group
          ? {
              ...state.groupFields,
              [containerId]: {
                ...group,
                meta: nextMeta
              }
            }
          : state.groupFields
      };
    }

    case 'UPDATE_DYNAMIC_UICONFIG': {
      const { config } = action.payload;
      if (!config) return state;

      return {
        ...state,
        dynamicUIConfig: mergeDynamicUIConfig(state.dynamicUIConfig, config)
      };
    }

    default:
      return state;
  }
}

export default formReducer;
