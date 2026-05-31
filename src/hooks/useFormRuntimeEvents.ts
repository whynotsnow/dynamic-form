import { useReducer } from 'react';
import type { FormInstance } from 'antd';
import type { FormValues } from '../types';
import { log, LogCategory } from '../utils/logger';
import { useFormChainContext } from './useFormChainContext';

interface UseFormRuntimeEventsParams {
  form: FormInstance;
  onSubmit?: (data: FormValues) => void;
}

export function useFormRuntimeEvents({ form, onSubmit }: UseFormRuntimeEventsParams) {
  const [, forceRender] = useReducer((version: number) => version + 1, 0);
  const { state, onValuesChange } = useFormChainContext();

  const handleFinish = async () => {
    const values = await form.validateFields();
    const submitValues = form.getFieldsValue(true);

    log.info(LogCategory.FORM, '表单提交:', values, submitValues);
    onSubmit?.(submitValues);
  };

  const handleValuesChange = (changedValues: FormValues) => {
    forceRender();
    onValuesChange?.(changedValues);
  };

  return {
    state,
    handleFinish,
    handleValuesChange
  };
}
