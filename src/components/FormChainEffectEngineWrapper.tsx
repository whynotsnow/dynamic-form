import React, { useEffect } from 'react';
import { useFormChainEffectEngine } from 'form-chain-effect-engine';
import { FormChainEffectEngineWrapperProps } from '../types';
import { useStoreInit, useStateSync } from '../hooks';
import { handleEffectResult } from '../resultProcessor';
import { FormChainContext } from '../hooks/useFormChainContext';
import {
  checkInitializationSilent,
  getInitializationSummary
} from '../utils/initializationChecker';
import { createEffectContext } from '../resultProcessor/batchUpdate';

const FormChainEffectEngineWrapper: React.FC<FormChainEffectEngineWrapperProps> = ({
  formConfig,
  children,
  enableInitializationCheck = true,
  checkDelay = 100,
  values,
  uiConfig,
  form
}) => {
  const { state, dispatch, configProcessInfo } = useStoreInit({ formConfig, values, uiConfig });

  // 使用form store ←→ reduce store双同步机制
  const { syncFormStateToStore, batchDispatch, addToUpdateQueue, hasPendingUpdates } = useStateSync(
    {
      form,
      state,
      dispatch
    }
  );

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

  const { onValuesChange, manualTrigger } = useFormChainEffectEngine({
    form,
    config: configProcessInfo.effectMap || {},
    options: {
      enableAdvancedControl: true,
      debugLog: false
    },
    onEffectResult({ fieldName, result }) {
      const context = createEffectContext({
        fieldName,
        form,
        dispatch,
        configProcessInfo,
        batchDispatch,
        addToUpdateQueue,
        hasPendingUpdates
      });

      // 使用统一的处理器处理 effect 结果
      handleEffectResult(result, context);
    }
  });

  return (
    <FormChainContext.Provider
      value={{
        form,
        state,
        dispatch,
        onValuesChange,
        manualTrigger,
        syncFormStateToStore
      }}
    >
      {children}
    </FormChainContext.Provider>
  );
};

export default FormChainEffectEngineWrapper;
