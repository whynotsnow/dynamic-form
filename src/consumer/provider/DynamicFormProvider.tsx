import React, { useCallback, useEffect, useMemo } from 'react';
import type { FormInstance } from 'antd';
import { useFormChainEffectEngine } from 'form-chain-effect-engine';
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

const DynamicFormProvider: React.FC<DynamicFormProviderProps> = ({
  formConfig,
  children,
  enableInitializationCheck = true,
  checkDelay = 100,
  values,
  uiConfig,
  form
}) => {
  const { state, dispatch, configProcessInfo } = useStoreInit({
    formConfig,
    form,
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

  const effectEngineForm = useMemo(
    () =>
      ({
        ...form,
        getFieldValue: (fieldId: string) => {
          const address = configProcessInfo.fieldAddressRegistry[fieldId];
          return form.getFieldValue(address?.name ?? fieldId);
        },
        getFieldsValue: () =>
          createFieldValueView(form.getFieldsValue(), configProcessInfo.fieldAddressRegistry)
      }) as FormInstance,
    [configProcessInfo.fieldAddressRegistry, form]
  );

  const { onValuesChange: onEffectValuesChange, manualTrigger } = useFormChainEffectEngine({
    form: effectEngineForm,
    config: configProcessInfo.effectMap || {},
    options: {
      enableAdvancedControl: true,
      debugLog: false
    },
    onEffectResult({ fieldName, result }) {
      const context = createRuntimeEffectResultContext({
        fieldName,
        form,
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
          onEffectValuesChange({ [fieldId]: form.getFieldValue(address.name) });
        }
      );
    },
    [configProcessInfo.fieldAddressRegistry, form, onEffectValuesChange]
  );

  return (
    <FormChainContext.Provider
      value={{
        form,
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
