import { useReducer } from 'react';
import type { FormInstance } from 'antd';
import type { FormValues } from '../types';
import type { RuntimeState } from '../runtime';
import { log, LogCategory } from '../utils/logger';
import { useFormChainContext } from './useFormChainContext';

interface UseFormRuntimeEventsParams {
  form: FormInstance;
  onSubmit?: (data: FormValues) => void;
  runtimeState: RuntimeState;
}

export function useFormRuntimeEvents({ form, onSubmit, runtimeState }: UseFormRuntimeEventsParams) {
  const [, forceRender] = useReducer((version: number) => version + 1, 0);
  const { state, onValuesChange } = useFormChainContext();

  const getValidatableFieldIds = (fieldIds: string[]) =>
    fieldIds.filter((fieldId) => runtimeState.fields[fieldId]?.validatable === true);

  const handleFinish = async () => {
    const values = await form.validateFields(
      getValidatableFieldIds(Object.keys(runtimeState.fields))
    );
    const submitValues = form.getFieldsValue(true);

    log.info(LogCategory.FORM, '表单提交:', values, submitValues);
    onSubmit?.(submitValues);
  };

  const handleValuesChange = (changedValues: FormValues) => {
    forceRender();
    const validatableChangedFieldIds = getValidatableFieldIds(Object.keys(changedValues));

    if (validatableChangedFieldIds.length > 0) {
      form.validateFields(validatableChangedFieldIds).catch(() => undefined);
    }

    onValuesChange?.(changedValues);
  };

  return {
    state,
    handleFinish,
    handleValuesChange
  };
}
