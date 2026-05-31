import { FormInstance } from 'antd';
import { Dispatch } from 'react';
import { ConfigProcessInfo, FieldMeta, FieldValue, FormAction, UIConfig } from '../types';
import type { EffectResultContext, InitContextParams } from './types';
import { mergeFieldMetaPatch, mergeGroupMetaPatch } from '../utils';

export function createInitialEffectContext(params: InitContextParams): EffectResultContext {
  const { fieldId, initialValues, initializedFields, initializedGroupFields, fieldRegistry } =
    params;

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
    form: {} as FormInstance,
    dispatch: (() => undefined) as Dispatch<FormAction>,
    fieldName: fieldId,
    configProcessInfo: {
      effectMap: {},
      fieldRegistry,
      initialValues,
      initializedFields,
      initializedGroupFields
    },
    setFieldValue: (value: FieldValue) => {
      initialValues[fieldId] = value;
    },
    setFieldValueBatch: (value: FieldValue) => {
      initialValues[fieldId] = value;
    },
    updateFieldMeta: (meta: Partial<FieldMeta>) => {
      const fieldState = findFieldState(fieldId);
      if (fieldState) fieldState.meta = mergeFieldMetaPatch(fieldState.meta, meta);
    },
    updateFieldMetaBatch: (meta: Partial<FieldMeta>) => {
      const fieldState = findFieldState(fieldId);
      if (fieldState) fieldState.meta = mergeFieldMetaPatch(fieldState.meta, meta);
    },
    updateFieldMetaById: (targetFieldId: string, meta: Partial<FieldMeta>) => {
      const fieldState = findFieldState(targetFieldId);
      if (fieldState) fieldState.meta = mergeFieldMetaPatch(fieldState.meta, meta);
    },
    setGroupVisible: (groupKey: string, visible: boolean) => {
      if (initializedGroupFields[groupKey]?.meta) {
        initializedGroupFields[groupKey].meta = mergeGroupMetaPatch(
          initializedGroupFields[groupKey].meta,
          { visible }
        );
      }
    },
    updateDynamicUIConfig: () => {
      // 初始化阶段不执行全局 UI 更新
    },
    getFieldState: () => findFieldState(fieldId),
    getFieldMeta: () => findFieldState(fieldId)?.meta
  };
}

export function createRuntimeEffectContext(params: {
  fieldName: string;
  form: FormInstance;
  dispatch: Dispatch<FormAction>;
  configProcessInfo: ConfigProcessInfo;
}): EffectResultContext {
  const { fieldName, form, dispatch, configProcessInfo } = params;

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

  const setFieldValue = (value: FieldValue) => {
    form.setFieldsValue({ [fieldName]: value });
  };

  const setFieldValueBatch = (value: FieldValue) => {
    form.setFieldsValue({ [fieldName]: value });
  };

  const updateFieldMeta = (meta: Partial<FieldMeta>) => {
    dispatch({ type: 'UPDATE_META', payload: { fieldId: fieldName, meta } });
  };

  const updateFieldMetaBatch = (meta: Partial<FieldMeta>) => {
    dispatch({ type: 'BATCH_META_UPDATE', payload: { meta: { [fieldName]: meta } } });
  };

  const updateFieldMetaById = (targetFieldId: string, meta: Partial<FieldMeta>) => {
    dispatch({ type: 'UPDATE_META', payload: { fieldId: targetFieldId, meta } });
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

  return {
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
    updateFieldMetaById,
    setGroupVisible,
    updateDynamicUIConfig,
    getFieldState,
    getFieldMeta
  };
}

export const createBatchUpdateContext = createInitialEffectContext;
export const createEffectContext = createRuntimeEffectContext;
