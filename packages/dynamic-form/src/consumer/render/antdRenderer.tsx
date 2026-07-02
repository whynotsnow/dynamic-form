import React from 'react';
import { Button, Card, Col, Form, Row } from 'antd';
import type { ButtonProps, CardProps, ColProps, FormInstance, FormProps, RowProps } from 'antd';
import type { DynamicFormRendererAdapter } from '../../shared/types';

export const antdRenderer: DynamicFormRendererAdapter = {
  renderForm({ form, onFinish, onValuesChange, initialValues, uiConfig, children }) {
    return (
      <Form
        form={form as FormInstance | undefined}
        onFinish={onFinish}
        onValuesChange={onValuesChange}
        initialValues={initialValues}
        style={{ marginTop: 24 }}
        scrollToFirstError
        {...(uiConfig.formProps as FormProps | undefined)}
      >
        {children}
      </Form>
    );
  },

  renderFieldItem({ formItemProps, children }) {
    return <Form.Item {...formItemProps}>{children}</Form.Item>;
  },

  renderFieldsLayout({ uiConfig, children }) {
    return <Row {...(uiConfig.rowProps as RowProps | undefined)}>{children}</Row>;
  },

  renderFieldLayout({ field, uiConfig, children }) {
    const colProps = uiConfig.colProps as ColProps | undefined;
    return (
      <Col key={field.id} {...colProps} span={field.span || colProps?.span}>
        {children}
      </Col>
    );
  },

  renderGroup({ id, title, uiConfig, children }) {
    return (
      <Card key={id} title={title ?? id} {...(uiConfig.cardProps as CardProps | undefined)}>
        {children}
      </Card>
    );
  },

  renderRepeatable({ id, title, name, uiConfig, renderItem }) {
    return (
      <Card key={id} title={title ?? id} {...(uiConfig.cardProps as CardProps | undefined)}>
        <Form.List name={name}>
          {(items) => (
            <>
              {items.map((item) => (
                <div key={item.key}>{renderItem(item.name, item.key)}</div>
              ))}
            </>
          )}
        </Form.List>
      </Card>
    );
  },

  renderSubmit({ submitButtonText, uiConfig }) {
    return (
      <div style={{ textAlign: 'center', marginTop: 24 }} {...uiConfig.submitAreaProps}>
        <Button
          type="primary"
          htmlType="submit"
          {...(uiConfig.buttonProps as ButtonProps | undefined)}
        >
          {submitButtonText}
        </Button>
      </div>
    );
  }
};
