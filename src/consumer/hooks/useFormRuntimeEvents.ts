import { useReducer } from 'react';
import type { FormInstance } from 'antd';
import type { FormValues } from '../../shared/types';
import type { RuntimeState } from '../../runtime';
import { useFormChainContext } from '../../shared/context/FormChainContext';
import { getChangedFieldIds } from '../../shared/utils';

interface UseFormRuntimeEventsParams {
  form: FormInstance;
  onSubmit?: (data: FormValues) => void;
  runtimeState: RuntimeState;
}

export function useFormRuntimeEvents({ form, onSubmit, runtimeState }: UseFormRuntimeEventsParams) {
  const [, forceRender] = useReducer((version: number) => version + 1, 0);
  const { state, onValuesChange } = useFormChainContext();

  const getFieldNames = (fieldIds: string[]) =>
    fieldIds.map(
      (fieldId) => state.configProcessInfo.fieldAddressRegistry[fieldId]?.name ?? fieldId
    );

  const getValidatableFieldIds = (fieldIds: string[]) =>
    fieldIds.filter((fieldId) => runtimeState.fields[fieldId]?.validatable === true);

  const handleFinish = async () => {
    await form.validateFields(
      getFieldNames(getValidatableFieldIds(Object.keys(runtimeState.fields)))
    );
    const submitValues = form.getFieldsValue(true);

    onSubmit?.(submitValues);
  };

  const handleValuesChange = (changedValues: FormValues) => {
    forceRender();
    const changedFieldIds = getChangedFieldIds(
      changedValues,
      state.configProcessInfo.fieldAddressRegistry
    );
    const validatableChangedFieldIds = getValidatableFieldIds(changedFieldIds);

    if (validatableChangedFieldIds.length > 0) {
      form.validateFields(getFieldNames(validatableChangedFieldIds)).catch(() => undefined);
    }

    onValuesChange?.(changedValues);
  };

  return {
    state,
    handleFinish,
    handleValuesChange
  };
}
