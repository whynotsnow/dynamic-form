import { produce, current, castDraft } from 'immer';
import type { FormState, FormAction, FieldMeta, UIConfig, FieldState } from '../shared/types';
import { mergeFieldMetaPatch, mergeGroupMetaPatch } from '../shared/utils';

const formReducer = produce<FormState, [FormAction]>((draft, action) => {
  console.log(`Reducer 收到 action: ${action.type}`, {
    action
  });

  switch (action.type) {
    case 'INIT': {
      const { configProcessInfo } = action.payload;

      draft.fields = castDraft(configProcessInfo.initializedFields);
      draft.groupFields = castDraft(configProcessInfo.initializedGroupFields);
      draft.configProcessInfo = castDraft(configProcessInfo);
      draft.initialized = true;

      break;
    }

    case 'UPDATE_META': {
      const { fieldId, meta } = action.payload;
      if (!meta) return;

      const registryEntry = draft.configProcessInfo.fieldRegistry[fieldId];
      if (!registryEntry) {
        console.warn(`UPDATE_META: 未找到字段 ${fieldId}`);
        return;
      }

      const { isGroupField, groupId } = registryEntry;
      let target: FieldState | undefined;

      if (isGroupField) {
        target = draft.groupFields[groupId!]?.fields[fieldId];
      } else {
        target = draft.fields[fieldId];
      }

      if (!target) {
        console.warn(`UPDATE_META: 字段状态未初始化 ${fieldId}`);
        return;
      }

      target.meta = mergeFieldMetaPatch(target.meta || ({} as FieldMeta), meta);
      break;
    }
    case 'SET_GROUP_META': {
      const { groupId, meta } = action.payload;
      const oldSnapshot = current(draft.groupFields[groupId]?.meta);
      const group = draft.groupFields[groupId];

      if (!group) {
        console.error(`SET_GROUP_META: 未找到分组 ${groupId}`);
        return;
      }

      draft.groupFields[groupId].meta = mergeGroupMetaPatch(draft.groupFields[groupId].meta, meta);

      console.log('SET_GROUP_META action 结果:', {
        groupId,
        meta,
        oldMeta: oldSnapshot
        // newMeta: current(draft.groupFields[groupKey].meta)
      });
      break;
    }

    case 'UPDATE_DYNAMIC_UICONFIG': {
      const { config } = action.payload;
      if (!config) return;

      (Object.keys(config) as (keyof UIConfig)[]).forEach((key) => {
        const value = config[key];

        if (typeof value === 'object' && value !== null) {
          // 赋对象时确保类型正确断言
          draft.dynamicUIConfig[key] = castDraft({
            ...((draft.dynamicUIConfig[key] as object) || {}),
            ...value
          });
        } else {
          draft.dynamicUIConfig[key] = value;
        }
      });
      break;
    }

    default:
      break;
  }
});

export default formReducer;
