import React from 'react';
import type { DynamicFormRendererAdapter } from '../../shared/types';

export const headlessRenderer: DynamicFormRendererAdapter = {
  renderForm({ onFinish, children }) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onFinish();
        }}
      >
        {children}
      </form>
    );
  },

  renderFieldItem({ formItemProps, children }) {
    return (
      <label data-field-name={JSON.stringify(formItemProps.name)}>
        {formItemProps.label ? <span>{formItemProps.label as React.ReactNode}</span> : null}
        {children}
      </label>
    );
  },

  renderFieldsLayout({ children }) {
    return <div>{children}</div>;
  },

  renderFieldLayout({ field, children }) {
    return <div data-field-layout={field.id}>{children}</div>;
  },

  renderGroup({ id, title, children }) {
    return (
      <fieldset data-group={id}>
        <legend>{title ?? id}</legend>
        {children}
      </fieldset>
    );
  },

  renderRepeatable({ id, title }) {
    return (
      <fieldset data-repeatable={id}>
        <legend>{title ?? id}</legend>
      </fieldset>
    );
  },

  renderSubmit({ submitButtonText }) {
    return <button type="submit">{submitButtonText}</button>;
  }
};
