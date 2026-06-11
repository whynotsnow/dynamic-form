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

        return {
          ...state,
          fields: {
            ...state.fields,
            [fieldId]: {
              ...field,
              meta: mergeFieldMetaPatch(field.meta || ({} as FieldMeta), meta)
            }
          }
        };
      }

      const group = groupId ? state.groupFields[groupId] : undefined;
      const field = group?.fields[fieldId];
      if (!group || !groupId || !field) {
        console.warn(`UPDATE_META: 字段状态未初始化 ${fieldId}`);
        return state;
      }

      return {
        ...state,
        groupFields: {
          ...state.groupFields,
          [groupId]: {
            ...group,
            fields: {
              ...group.fields,
              [fieldId]: {
                ...field,
                meta: mergeFieldMetaPatch(field.meta || ({} as FieldMeta), meta)
              }
            }
          }
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

      return {
        ...state,
        groupFields: {
          ...state.groupFields,
          [groupId]: {
            ...group,
            meta: mergeGroupMetaPatch(group.meta, meta)
          }
        }
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
