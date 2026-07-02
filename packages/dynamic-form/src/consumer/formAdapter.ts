import type { DynamicFormFormAdapter, DynamicFormLegacyForm, FormValues } from '../shared/types';

export function createAntdFormAdapter(form: DynamicFormLegacyForm): DynamicFormFormAdapter {
  if (!form) {
    throw new Error('createAntdFormAdapter: form is required when formAdapter is not provided.');
  }

  return {
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
}

export function resolveFormAdapter(params: {
  form?: DynamicFormLegacyForm;
  formAdapter?: DynamicFormFormAdapter;
}): DynamicFormFormAdapter {
  return params.formAdapter ?? createAntdFormAdapter(params.form);
}

export function resolveFormHandle(params: {
  form?: DynamicFormLegacyForm;
  formAdapter: DynamicFormFormAdapter;
}): DynamicFormLegacyForm {
  return params.form ?? params.formAdapter.rawForm ?? params.formAdapter;
}
