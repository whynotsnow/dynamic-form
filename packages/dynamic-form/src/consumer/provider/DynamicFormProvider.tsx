import React, { useCallback, useEffect, useMemo } from 'react';
import { defineLooseFormChainEffectConfig, useFormChainEffect } from '@whynotsnow/hooks';
import type { LooseFormLike } from '@whynotsnow/hooks';
import type { DynamicFormProviderProps, FormValues } from '../../shared/types';
import { useStoreInit } from '../../state';
import { applyEffectResult } from '../effects';
import { FormChainContext } from '../../shared/context/FormChainContext';
import {
  checkInitializationSilent,
  getInitializationSummary
} from '../../shared/utils/initializationChecker';
import { createRuntimeEffectResultContext } from '../effects';
import { createFieldValueView, getChangedFieldIds } from '../../shared/utils';
import { resolveFormAdapter, resolveFormHandle } from '../formAdapter';

const DynamicFormProvider: React.FC<DynamicFormProviderProps> = ({
  formConfig,
  children,
  enableInitializationCheck = true,
  checkDelay = 100,
  values,
  uiConfig,
  form,
  formAdapter: providedFormAdapter
}) => {
  const formAdapter = useMemo(
    () => resolveFormAdapter({ form, formAdapter: providedFormAdapter }),
    [form, providedFormAdapter]
  );
  const formHandle = useMemo(() => resolveFormHandle({ form, formAdapter }), [form, formAdapter]);
  const { state, dispatch, configProcessInfo } = useStoreInit({
    formConfig,
    formAdapter,
    values,
    uiConfig
  });

  // 初始化检测逻辑
  useEffect(() => {
    if (!enableInitializationCheck) return;

    const performCheck = () => {
      const status = checkInitializationSilent();
      if (!status.isInitialized) {
        const warning = `⚠️ DynamicForm 初始化警告: ${getInitializationSummary()}\n\n建议在组件顶层添加:\nconst { isInitialized } = useInitHandlers(config);`;

        console.warn(warning);
      }
    };

    // 延迟检测，给 useInitHandlers 时间执行
    const timer = setTimeout(performCheck, checkDelay);

    return () => clearTimeout(timer);
  }, [enableInitializationCheck, checkDelay]);

  const effectEngineForm = useMemo<LooseFormLike>(
    () => ({
      getFieldValue: (fieldId: string) => {
        const address = configProcessInfo.fieldAddressRegistry[fieldId];
        return formAdapter.getFieldValue(address?.name ?? fieldId);
      },
      getFieldsValue: () =>
        createFieldValueView(formAdapter.getFieldsValue(), configProcessInfo.fieldAddressRegistry)
    }),
    [configProcessInfo.fieldAddressRegistry, formAdapter]
  );

  const effectConfig = useMemo(
    () => defineLooseFormChainEffectConfig(configProcessInfo.effectMap),
    [configProcessInfo.effectMap]
  );

  const { onValuesChange: onEffectValuesChange, manualTrigger } = useFormChainEffect({
    form: effectEngineForm,
    config: effectConfig,
    options: {
      enableAdvancedControl: true,
      debugLog: false
    },
    onEffectResult({ fieldName, result }) {
      const context = createRuntimeEffectResultContext({
        fieldName,
        form: formHandle,
        formAdapter,
        dispatch,
        configProcessInfo
      });

      // 使用统一的处理器处理 effect 结果
      applyEffectResult(result, context);
    }
  });

  const onValuesChange = useCallback(
    (changedValues: FormValues) => {
      getChangedFieldIds(changedValues, configProcessInfo.fieldAddressRegistry).forEach(
        (fieldId) => {
          const address = configProcessInfo.fieldAddressRegistry[fieldId];
          onEffectValuesChange({ [fieldId]: formAdapter.getFieldValue(address.name) });
        }
      );
    },
    [configProcessInfo.fieldAddressRegistry, formAdapter, onEffectValuesChange]
  );

  return (
    <FormChainContext.Provider
      value={{
        form: formHandle,
        formAdapter,
        state,
        dispatch,
        onValuesChange,
        manualTrigger
      }}
    >
      {children}
    </FormChainContext.Provider>
  );
};

export default DynamicFormProvider;
