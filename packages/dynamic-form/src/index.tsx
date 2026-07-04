import React from 'react';
import type { DynamicFormProps, FormChainEffectProps, FormContentProps } from './shared/types';
import FormContent from './consumer/render/FormContent';
import DynamicFormProvider from './consumer/provider/DynamicFormProvider';

function pickFormChainEffectProps(props: DynamicFormProps): FormChainEffectProps {
  const { formConfig, form, formAdapter, values, enableInitializationCheck, checkDelay, uiConfig } =
    props;
  return {
    formConfig,
    form,
    formAdapter,
    values,
    uiConfig,
    enableInitializationCheck,
    checkDelay
  };
}

// FormContentProps
function pickUIProps(props: DynamicFormProps): FormContentProps {
  const {
    onSubmit,
    submitButtonText,
    componentRegistry,
    renderFieldItem,
    renderFormInner,
    renderFields,
    renderGroupItem,
    renderGroups,
    form,
    formAdapter,
    renderer
  } = props;
  return {
    onSubmit,
    submitButtonText,
    componentRegistry,
    renderFormInner,
    renderFieldItem,
    renderFields,
    renderGroupItem,
    renderGroups,
    form,
    formAdapter,
    renderer
  };
}

const DynamicForm: React.FC<DynamicFormProps> = (props) => {
  const formChainEffectProps = pickFormChainEffectProps(props);
  const uiProps = pickUIProps(props);
  return (
    <DynamicFormProvider {...formChainEffectProps}>
      <FormContent {...uiProps} />
    </DynamicFormProvider>
  );
};

export default DynamicForm;
