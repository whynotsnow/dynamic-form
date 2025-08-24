import React from 'react';
import type { DynamicFormProps, EngineProps, FormContentProps } from './types';
import FormContent from './components/FormContent';
import FormChainEffectEngineWrapper from './components/FormChainEffectEngineWrapper';

// EngineProps
function pickEngineProps(props: DynamicFormProps): EngineProps {
  const { formConfig, form, values, enableInitializationCheck, checkDelay } = props;
  return {
    formConfig,
    form,
    values,
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
    form
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
    form
  };
}

const DynamicForm: React.FC<DynamicFormProps> = (props) => {
  const engineProps = pickEngineProps(props);
  const uiProps = pickUIProps(props);
  return (
    <FormChainEffectEngineWrapper {...engineProps}>
      <FormContent {...uiProps} />
    </FormChainEffectEngineWrapper>
  );
};

export default DynamicForm;
