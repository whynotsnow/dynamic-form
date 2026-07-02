import { useReducer } from 'react';
import type { RuntimeState } from '@whynotsnow/dynamic-form-core';
import type { DynamicFormFormAdapter, FormValues } from '../../shared/types';
import { useFormChainContext } from '../../shared/context/FormChainContext';
import { getChangedFieldIds } from '../../shared/utils';

interface UseFormRuntimeEventsParams {
  formAdapter: DynamicFormFormAdapter;
  onSubmit?: (data: FormValues) => void;
  runtimeState: RuntimeState;
}

export function useFormRuntimeEvents({
  formAdapter,
  onSubmit,
  runtimeState
}: UseFormRuntimeEventsParams) {
  const [, forceRender] = useReducer((version: number) => version + 1, 0);
  const { state, onValuesChange } = useFormChainContext();

  const getFieldNames = (fieldIds: string[]) =>
    fieldIds.map(
      (fieldId) => state.configProcessInfo.fieldAddressRegistry[fieldId]?.name ?? fieldId
    );

  const getValidatableFieldIds = (fieldIds: string[]) =>
    fieldIds.filter((fieldId) => runtimeState.fields[fieldId]?.validatable === true);

  const handleFinish = async () => {
    await formAdapter.validateFields(
      getFieldNames(getValidatableFieldIds(Object.keys(runtimeState.fields)))
    );
    const submitValues = formAdapter.getFieldsValue(true);

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
      formAdapter.validateFields(getFieldNames(validatableChangedFieldIds)).catch(() => undefined);
    }

    onValuesChange?.(changedValues);
  };

  return {
    state,
    handleFinish,
    handleValuesChange
  };
}
