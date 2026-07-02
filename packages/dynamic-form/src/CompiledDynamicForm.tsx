import React from 'react';
import DynamicForm from './index';
import type { CompiledModuleConfig } from '@whynotsnow/dynamic-form-core';
import type { DynamicFormProps } from './shared/types';

export interface CompiledDynamicFormProps
  extends Omit<DynamicFormProps, 'formConfig' | 'componentRegistry'> {
  compiled: CompiledModuleConfig;
  componentRegistry?: DynamicFormProps['componentRegistry'];
}

/** 将 compiler 产物完整接入 DynamicForm，避免遗漏模块组件注册表。 */
const CompiledDynamicForm: React.FC<CompiledDynamicFormProps> = ({
  compiled,
  componentRegistry,
  ...props
}) => {
  const customComponents = {
    ...compiled.componentRegistry,
    ...(componentRegistry?.customComponents || {})
  };

  return (
    <DynamicForm
      {...props}
      formConfig={compiled.formConfig}
      componentRegistry={{
        ...componentRegistry,
        customComponents
      }}
    />
  );
};

export default CompiledDynamicForm;
