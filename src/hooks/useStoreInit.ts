import { useReducer, useMemo, useLayoutEffect } from 'react';
import type { FormConfig, UIConfig } from '../types';
import { processFormConfig } from '../configProcessor';
import formReducer from '../reducer';

interface useStoreInitParams {
  formConfig: FormConfig;
  values?: unknown;
  uiConfig?: UIConfig;
}

/**
 * 表单初始化 Hook
 * 负责配置的预处理和表单状态的初始化
 *
 * 处理器注册现在由 useInitHandlers 负责
 */
export const useStoreInit = ({ formConfig, values, uiConfig }: useStoreInitParams) => {
  // 1. 预计算配置
  const configProcessInfo = useMemo(() => processFormConfig(formConfig), [formConfig]);

  // 合并 initialValues + values
  const mergedInitialValues = useMemo(() => {
    if (values) {
      return {
        ...(configProcessInfo.initialValues || {}),
        ...(values || {})
      };
    }
    return configProcessInfo.initialValues || {};
  }, [configProcessInfo.initialValues, values]);

  const defaultUIConfig: UIConfig = {
    formProps: {},
    buttonProps: {},
    cardProps: {},
    rowProps: { gutter: [16, 0] },
    colProps: { span: 8 },
    submitAreaProps: {},
    formItemProps: {}
  };

  const initDynamicUIConfig = (uiConfig?: UIConfig): UIConfig => {
    return {
      ...defaultUIConfig,
      ...(uiConfig || {}) // 外部传入的字段覆盖默认值
    };
  };

  // 2. 静态数据初始化 reducer 状态 ，动态数据初始化 reducer 交给 INIT 处理
  const [state, dispatch] = useReducer(formReducer, {
    fields: configProcessInfo.initializedFields,
    fieldValues: mergedInitialValues,
    groupFields: configProcessInfo.initializedGroupFields,
    configProcessInfo,
    initialized: false,
    dynamicUIConfig: initDynamicUIConfig(uiConfig)
  });

  // 3. 执行表单初始化 - 只在组件挂载时执行一次
  useLayoutEffect(() => {
    if (!state.initialized) {
      dispatch({
        type: 'INIT',
        payload: { configProcessInfo }
      });
    }
  }, [configProcessInfo, state.initialized]);

  return {
    state, // reducer 管理的状态
    dispatch, // 状态更新方法
    configProcessInfo // 预计算信息
  };
};
