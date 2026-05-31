import { useEffect, useRef } from 'react';
import type { FormInstance } from 'antd';
import type { FieldState, FieldValue, FormState } from '../types';

function collectFields(state: FormState): FieldState[] {
  return [
    ...Object.values(state.fields),
    ...Object.values(state.groupFields).flatMap((group) => Object.values(group.fields))
  ];
}

export function useHiddenFieldValues(form: FormInstance, state: FormState) {
  const previousVisibleRef = useRef<Record<string, boolean>>({});
  const hiddenValueCacheRef = useRef<Record<string, FieldValue>>({});

  useEffect(() => {
    if (!state.initialized) return;

    collectFields(state).forEach((field) => {
      const isVisible = field.meta?.visible !== false;
      const wasVisible = previousVisibleRef.current[field.id];
      const shouldPreserve = field.preserveValueOnHide === true;
      const shouldRestore = field.restoreValueOnShow !== false;

      if (!isVisible && wasVisible !== false && !shouldPreserve) {
        if (shouldRestore) {
          hiddenValueCacheRef.current[field.id] = form.getFieldValue(field.id);
        }

        form.setFieldsValue({ [field.id]: undefined });
      }

      if (
        isVisible &&
        wasVisible === false &&
        shouldRestore &&
        Object.hasOwn(hiddenValueCacheRef.current, field.id)
      ) {
        form.setFieldsValue({ [field.id]: hiddenValueCacheRef.current[field.id] });
        delete hiddenValueCacheRef.current[field.id];
      }

      previousVisibleRef.current[field.id] = isVisible;
    });
  }, [form, state]);
}
