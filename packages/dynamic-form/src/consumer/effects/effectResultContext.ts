import { FormInstance } from 'antd';
import { Dispatch } from 'react';
import { ConfigProcessInfo, FieldMeta, FieldValue, FormAction, UIConfig } from '../../shared/types';
import type { EffectResultContext, InitContextParams } from './types';
import {
  createFieldAddressRegistry,
  getFieldName,
  mergeFieldMetaPatch,
  mergeGroupMetaPatch,
  setValueAtNamePath
} from '../../shared/utils';

export function createInitialEffectResultContext(params: InitContextParams): EffectResultContext {
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
      nodeRegistry: {},
      containerRegistry: {},
      fieldRegistry,
      fieldAddressRegistry: createFieldAddressRegistry(fieldRegistry),
      initialValues,
      initializedFields,
      initializedGroupFields,
      initializedNodes: {},
      initializedContainerFields: {},
      rootNodeIds: []
    },
    setFieldValue: (value: FieldValue) => {
      const entry = fieldRegistry[fieldId];
      if (entry && !('fields' in entry.config)) {
        setValueAtNamePath(initialValues, getFieldName(entry.config), value);
      }
    },
    updateFieldMeta: (meta: Partial<FieldMeta>) => {
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

export function createRuntimeEffectResultContext(params: {
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
    const address = configProcessInfo.fieldAddressRegistry[fieldName];
    form.setFieldValue(address?.name ?? fieldName, value);
  };

  const updateFieldMeta = (meta: Partial<FieldMeta>) => {
    dispatch({ type: 'UPDATE_META', payload: { fieldId: fieldName, meta } });
  };

  const updateFieldMetaById = (targetFieldId: string, meta: Partial<FieldMeta>) => {
    dispatch({ type: 'UPDATE_META', payload: { fieldId: targetFieldId, meta } });
  };

  const setGroupVisible = (targetGroupId: string, visible: boolean) => {
    if (targetGroupId) {
      dispatch({
        type: 'SET_CONTAINER_META',
        payload: { containerId: targetGroupId, meta: { visible } }
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
    updateFieldMeta,
    updateFieldMetaById,
    setGroupVisible,
    updateDynamicUIConfig,
    getFieldState,
    getFieldMeta
  };
}
