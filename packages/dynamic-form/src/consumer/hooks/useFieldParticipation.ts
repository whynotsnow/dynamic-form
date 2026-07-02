import { useEffect, useRef } from 'react';
import type { DynamicFormFormAdapter, FieldValue, FormState } from '../../shared/types';
import type { RuntimeState } from '../../runtime';
import { getAllFields } from '../../runtime/selectors';
import { getFieldName } from '../../shared/utils';
import { resolveFieldParticipationPolicy } from './fieldParticipationPolicy';

export function useFieldParticipation(
  formAdapter: DynamicFormFormAdapter,
  state: FormState,
  runtimeState: RuntimeState
) {
  const previousSubmitableRef = useRef<Record<string, boolean>>({});

  const hiddenValueCacheRef = useRef<Record<string, FieldValue>>({});

  useEffect(() => {
    if (!state.initialized) return;

    getAllFields(state).forEach((field) => {
      const fieldName = getFieldName(field);
      const capability = runtimeState.fields[field.id];

      const isSubmitable = capability?.submitable === true;

      const wasSubmitable = previousSubmitableRef.current[field.id];

      const { preserveValueOnHide: shouldPreserve, restoreValueOnShow: shouldRestore } =
        resolveFieldParticipationPolicy(field);

      if (!isSubmitable && wasSubmitable !== false && !shouldPreserve) {
        if (shouldRestore) {
          hiddenValueCacheRef.current[field.id] = formAdapter.getFieldValue(fieldName);
        }

        formAdapter.setFieldValue(fieldName, undefined);
      }

      if (
        isSubmitable &&
        wasSubmitable === false &&
        shouldRestore &&
        Object.hasOwn(hiddenValueCacheRef.current, field.id)
      ) {
        formAdapter.setFieldValue(fieldName, hiddenValueCacheRef.current[field.id]);

        delete hiddenValueCacheRef.current[field.id];
      }

      previousSubmitableRef.current[field.id] = isSubmitable;
    });
  }, [formAdapter, state, runtimeState]);
}
