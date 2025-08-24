import { produce, current, castDraft } from 'immer';
import type { FormState, FormAction, FieldMeta, UIConfig, FieldState } from './types';
import { mergeFieldMetaPatch, mergeIntoDraft } from './utils';
import { log, LogCategory } from './utils/logger';

const formReducer = produce<FormState, [FormAction]>((draft, action) => {
  log.info(LogCategory.BATCH_UPDATE, `Reducer 收到 action: ${action.type}`, {
    action,
    currentState: current(draft.fieldValues) // 快照
  });

  switch (action.type) {
    case 'INIT': {
      const { configProcessInfo } = action.payload;

      draft.fieldValues = {
        ...configProcessInfo.initialValues,
        ...draft.fieldValues
      };
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
        log.warn(LogCategory.BATCH_UPDATE, `UPDATE_META: 未找到字段 ${fieldId}`);
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
        log.warn(LogCategory.BATCH_UPDATE, `UPDATE_META: 字段状态未初始化 ${fieldId}`);
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
        log.error(LogCategory.BATCH_UPDATE, `SET_GROUP_META: 未找到分组 ${groupId}`);
        return;
      }

      draft.groupFields[groupId].meta = {
        ...draft.groupFields[groupId].meta,
        ...meta
      };

      log.info(LogCategory.BATCH_UPDATE, 'SET_GROUP_META action 结果:', {
        groupId,
        meta,
        oldMeta: oldSnapshot
        // newMeta: current(draft.groupFields[groupKey].meta)
      });
      break;
    }

    case 'SET_FIELD_VALUE': {
      const { fieldId, value } = action.payload;
      const oldSnapshot = current(draft.fieldValues);

      draft.fieldValues[fieldId] = value;

      log.info(LogCategory.BATCH_UPDATE, 'SET_FIELD_VALUE action 结果:', {
        fieldId,
        value,
        oldFieldValues: oldSnapshot
        // newFieldValues: current(draft.fieldValues)
      });
      break;
    }

    case 'SET_FIELD_VALUES': {
      const { values } = action.payload;
      const oldSnapshot = current(draft.fieldValues);

      Object.assign(draft.fieldValues, values);

      log.info(LogCategory.BATCH_UPDATE, 'SET_FIELD_VALUES action 结果:', {
        values,
        oldFieldValues: oldSnapshot
        // newFieldValues: current(draft.fieldValues)
      });
      break;
    }

    case 'BATCH_UPDATE': {
      const { values, meta } = action.payload;
      const oldSnapshot = current(draft.fieldValues);

      // 更新字段值
      mergeIntoDraft(draft.fieldValues, values);

      // 更新 meta
      Object.entries(meta).forEach(([fieldId, metaPatch]) => {
        const registryEntry = draft.configProcessInfo.fieldRegistry[fieldId];
        if (!registryEntry) return;

        const { isGroupField, groupId } = registryEntry;
        let target: FieldState | undefined;

        if (isGroupField) {
          target = draft.groupFields[groupId!]?.fields[fieldId];
        } else {
          target = draft.fields[fieldId];
        }

        if (!target) {
          log.warn(LogCategory.BATCH_UPDATE, `BATCH_UPDATE: 字段状态未初始化 ${fieldId}`);
          return;
        }

        target.meta = mergeFieldMetaPatch(target.meta || ({} as FieldMeta), metaPatch);
      });
      log.info(LogCategory.BATCH_UPDATE, 'BATCH_UPDATE action 结果:', {
        values,
        meta,
        // updatedFields: current(draft.fields),
        oldFieldValues: oldSnapshot
        // newFieldValues: current(draft.fieldValues)
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
