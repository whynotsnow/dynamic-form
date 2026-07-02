import type {
  DynamicFormFormAdapter,
  DynamicFormLegacyForm,
  FieldNamePath,
  FormValues
} from '../shared/types';
import { getValueAtNamePath, setValueAtNamePath } from '../shared/utils';

const FORM_ADAPTER_METHODS = [
  'getFieldValue',
  'getFieldsValue',
  'setFieldValue',
  'setFieldsValue',
  'validateFields'
] as const;

export interface MemoryFormAdapter extends DynamicFormFormAdapter {
  values: FormValues;
}

function describeMissingMethods(target: unknown, methods: readonly string[]): string[] {
  if (!target || typeof target !== 'object') {
    return [...methods];
  }

  return methods.filter(
    (method) => typeof (target as Record<string, unknown>)[method] !== 'function'
  );
}

export function assertFormAdapter(adapter: unknown): asserts adapter is DynamicFormFormAdapter {
  const missingMethods = describeMissingMethods(adapter, FORM_ADAPTER_METHODS);

  if (missingMethods.length > 0) {
    throw new Error(
      `DynamicForm formAdapter is invalid: missing methods ${missingMethods.join(', ')}.`
    );
  }
}

export function createAntdFormAdapter(form: DynamicFormLegacyForm): DynamicFormFormAdapter {
  if (!form) {
    throw new Error('createAntdFormAdapter: form is required when formAdapter is not provided.');
  }

  const adapter: DynamicFormFormAdapter = {
    rawForm: form,
    getFieldValue: (name) => form.getFieldValue(name),
    getFieldsValue: (includeAll) => form.getFieldsValue(includeAll),
    setFieldValue: (name, value) => {
      if (typeof form.setFieldValue === 'function') {
        form.setFieldValue(name, value);
        return;
      }

      form.setFieldsValue({ [Array.isArray(name) ? name.join('.') : name]: value });
    },
    setFieldsValue: (values: FormValues) => form.setFieldsValue(values),
    validateFields: (names) => form.validateFields(names)
  };

  assertFormAdapter(adapter);
  return adapter;
}

export function createMemoryFormAdapter(initialValues: FormValues = {}): MemoryFormAdapter {
  const values: FormValues = { ...initialValues };
  const adapter: MemoryFormAdapter = {
    values,
    rawForm: { values },
    getFieldValue: (name: FieldNamePath) => getValueAtNamePath(values, name),
    getFieldsValue: () => values,
    setFieldValue: (name: FieldNamePath, value) => {
      setValueAtNamePath(values, name, value);
    },
    setFieldsValue: (nextValues) => {
      Object.assign(values, nextValues);
    },
    validateFields: async () => values
  };

  assertFormAdapter(adapter);
  return adapter;
}

export function resolveFormAdapter(params: {
  form?: DynamicFormLegacyForm;
  formAdapter?: DynamicFormFormAdapter;
}): DynamicFormFormAdapter {
  const adapter = params.formAdapter ?? createAntdFormAdapter(params.form);
  assertFormAdapter(adapter);
  return adapter;
}

export function resolveFormHandle(params: {
  form?: DynamicFormLegacyForm;
  formAdapter: DynamicFormFormAdapter;
}): DynamicFormLegacyForm {
  return params.form ?? params.formAdapter.rawForm ?? params.formAdapter;
}
