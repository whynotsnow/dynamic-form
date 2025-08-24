import { FormInstance } from 'antd';
import { Dispatch } from 'react';
import { ConfigProcessInfo, FieldMeta, FormAction, UIConfig } from '../types';
import type { EffectResultContext, InitContextParams } from './types';

/**
 * 创建批量更新上下文
 *
 * 为初始值处理提供专门的上下文，避免副作用
 *
 * @param fieldId 字段ID
 * @param initialValues 初始值对象
 * @param initializedFields 初始化字段对象
 * @param initializedGroupFields 初始化分组元数据对象
 * @param fieldRegistry 统一字段注册表，用于快速定位字段信息
 * @returns 批量更新上下文
 */
export function createBatchUpdateContext(params: InitContextParams): EffectResultContext {
  const { fieldId, initialValues, initializedFields, initializedGroupFields, fieldRegistry } =
    params;
  // 根据 fieldRegistry 定位字段状态
  const findFieldState = (fid: string) => {
    const entry = fieldRegistry[fid];
    if (!entry) return undefined;

    if (!entry.isGroupField) {
      return initializedFields[fid];
    } else if (entry.groupId) {
      return initializedGroupFields[entry.groupId]?.fields[fid];
    }
    return undefined;
  };

  return {
    form: {} as any, // 初始化阶段无需 form API
    dispatch: (() => {}) as any, // 初始化阶段无需 dispatch
    fieldName: fieldId,
    configProcessInfo: {
      effectMap: {},
      fieldRegistry,
      initialValues,
      initializedFields,
      initializedGroupFields
    },
    setFieldValue: (value: any) => {
      initialValues[fieldId] = value;
    },
    setFieldValueBatch: (value: any) => {
      initialValues[fieldId] = value;
    },
    updateFieldMeta: (meta: Partial<FieldMeta>) => {
      const fieldState = findFieldState(fieldId);
      if (fieldState) Object.assign(fieldState.meta, meta);
    },
    updateFieldMetaBatch: (meta: Partial<FieldMeta>) => {
      const fieldState = findFieldState(fieldId);
      if (fieldState) Object.assign(fieldState.meta, meta);
    },
    setGroupVisible: (groupKey: string, visible: boolean) => {
      if (initializedGroupFields[groupKey]?.meta) {
        initializedGroupFields[groupKey].meta.visible = visible;
      }
    },
    updateDynamicUIConfig: () => {
      // 初始化阶段不执行全局 UI 更新
    },
    getFieldState: () => findFieldState(fieldId),
    getFieldMeta: () => findFieldState(fieldId)?.meta
  };
}
/**
 * 运行时 context 工厂
 * @param params 运行时必需参数
 */
export function createEffectContext(params: {
  fieldName: string;
  form: FormInstance;
  dispatch: Dispatch<FormAction>;
  configProcessInfo: ConfigProcessInfo;
  batchDispatch?: () => void;
  addToUpdateQueue?: (type: 'values' | 'meta', payload: Record<string, any>) => void;
  hasPendingUpdates?: () => boolean;
}): EffectResultContext {
  const {
    fieldName,
    form,
    dispatch,
    configProcessInfo,
    batchDispatch,
    addToUpdateQueue,
    hasPendingUpdates
  } = params;

  const registryEntry = configProcessInfo.fieldRegistry[fieldName];

  const isGroupField = registryEntry?.isGroupField || false;
  const groupId = registryEntry?.groupId;

  const getFieldState = () => {
    if (isGroupField && groupId) {
      return configProcessInfo.initializedGroupFields[groupId]?.fields?.[fieldName];
    } else {
      return configProcessInfo.initializedFields[fieldName];
    }
  };

  const getFieldMeta = () => getFieldState()?.meta;

  // 语义化 API 函数定义
  const setFieldValue = (value: any, options?: { immediate?: boolean }) => {
    if (addToUpdateQueue) {
      addToUpdateQueue('values', { [fieldName]: value });
      if (options?.immediate !== false && batchDispatch) {
        batchDispatch();
      }
    } else {
      dispatch({ type: 'SET_FIELD_VALUE', payload: { fieldId: fieldName, value } });
    }
  };

  const setFieldValueBatch = (value: any) => {
    if (addToUpdateQueue) {
      addToUpdateQueue('values', { [fieldName]: value });
    } else {
      dispatch({ type: 'SET_FIELD_VALUE', payload: { fieldId: fieldName, value } });
    }
  };

  const updateFieldMeta = (meta: Partial<FieldMeta>) => {
    dispatch({ type: 'UPDATE_META', payload: { fieldId: fieldName, meta } });
  };

  const updateFieldMetaBatch = (meta: Partial<FieldMeta>) => {
    if (addToUpdateQueue) {
      addToUpdateQueue('meta', { [fieldName]: meta });
    } else {
      dispatch({ type: 'UPDATE_META', payload: { fieldId: fieldName, meta } });
    }
  };

  const setGroupVisible = (targetGroupId: string, visible: boolean) => {
    if (targetGroupId) {
      dispatch({
        type: 'SET_GROUP_META',
        payload: { groupId: targetGroupId, meta: { visible } }
      });
    }
  };

  const updateDynamicUIConfig = (dynamicUIConfig: UIConfig) => {
    dispatch({ type: 'UPDATE_DYNAMIC_UICONFIG', payload: { config: dynamicUIConfig } });
  };

  // 构建 context 对象
  const context: EffectResultContext = {
    form,
    dispatch,
    fieldName,
    configProcessInfo,
    isGroupField,
    groupId,
    setFieldValue,
    setFieldValueBatch,
    updateFieldMeta,
    updateFieldMetaBatch,
    setGroupVisible,
    updateDynamicUIConfig,
    batchDispatch,
    addToUpdateQueue,
    hasPendingUpdates,
    getFieldState,
    getFieldMeta
  };

  return context;
}
