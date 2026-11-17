import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Form, Space, message } from 'antd';
import type { FormInstance } from 'antd';
import { translate } from '@docusaurus/Translate';
import type { DemoFormControls } from '../../../../demos/demoRegistry';
import {
  DemoSubmitResultHandlerContext,
  useDemoSubmitResult
} from '../../../../demos/useDemoSubmitResult';
import styles from './DemoFormControlPanel.module.css';

interface DemoFormControlPanelProps {
  form: FormInstance;
  controls: DemoFormControls;
  locale: 'zh-CN' | 'en';
  children: React.ReactNode;
}

const cloneValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (value && typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneValue(nestedValue)])
    );
  }
  return value;
};

const DemoFormControlPanel: React.FC<DemoFormControlPanelProps> = ({
  form,
  controls,
  locale,
  children
}) => {
  const { showSubmitResult, submitResultModal } = useDemoSubmitResult();
  const watchedValues = Form.useWatch([], { form, preserve: true });
  const [revision, setRevision] = useState(0);
  const [formReady, setFormReady] = useState(false);
  const initialValuesRef = useRef<Record<string, unknown> | undefined>(undefined);
  const values = useMemo(
    () => (controls.adapter === 'antd' ? form.getFieldsValue(true) : undefined),
    [controls.adapter, form, revision, watchedValues]
  );

  useEffect(() => {
    if (controls.adapter !== 'antd') return;
    const fields = form.getFieldsError();
    if (fields.length === 0) return;
    setFormReady(true);
    if (initialValuesRef.current) return;
    const currentValues = form.getFieldsValue(true);
    initialValuesRef.current = cloneValue(currentValues) as Record<string, unknown>;
  }, [controls.adapter, form, watchedValues]);

  const refreshValues = () => setRevision((current) => current + 1);
  const actionLabels = {
    fill: translate({ id: 'demos.controlPanel.fill', message: '填充样例数据' }),
    validate: translate({ id: 'demos.controlPanel.validate', message: '校验表单' }),
    restore: translate({ id: 'demos.controlPanel.restore', message: '恢复初始值' }),
    reset: translate({ id: 'demos.controlPanel.reset', message: '重置表单' }),
    submit: translate({ id: 'demos.controlPanel.submit', message: '提交表单' })
  };

  const runAction = async (action: DemoFormControls['actions'][number]) => {
    if (controls.adapter !== 'antd' || !formReady) return;
    switch (action) {
      case 'fill':
        {
          const fillValues = controls.fillValues?.[locale];
          if (fillValues) form.setFieldsValue(fillValues);
        }
        break;
      case 'validate':
        try {
          await form.validateFields();
          message.success(
            translate({ id: 'demos.controlPanel.validationSuccess', message: '校验通过' })
          );
        } catch {
          message.error(
            translate({ id: 'demos.controlPanel.validationFailure', message: '请检查表单错误' })
          );
        }
        break;
      case 'restore':
        if (initialValuesRef.current) {
          form.setFieldsValue(cloneValue(initialValuesRef.current) as Record<string, unknown>);
        }
        break;
      case 'reset':
        {
          const values = form.getFieldsValue(true);
          const emptyFields = Object.keys(values).map((name) => ({
            name,
            value: undefined,
            errors: [],
            warnings: []
          }));
          const registeredFields = form.getFieldsError().map(({ name }) => ({
            name,
            errors: [],
            warnings: [],
            touched: false
          }));
          form.setFields([...emptyFields, ...registeredFields]);
        }
        break;
      case 'submit':
        form.submit();
        break;
    }
    refreshValues();
  };

  return (
    <DemoSubmitResultHandlerContext.Provider value={showSubmitResult}>
      <>
        <div className={styles.session}>
          <Card
            className={styles.actionsPanel}
            title={translate({ id: 'demos.controlPanel.title', message: '表单控制台' })}
          >
            {controls.adapter === 'antd' ? (
              <>
                {controls.actions.length > 0 ? (
                  <Space wrap>
                    {controls.actions.map((action) => (
                      <Button
                        key={action}
                        onClick={() => void runAction(action)}
                        disabled={!formReady}
                        type={action === 'submit' ? 'primary' : 'default'}
                      >
                        {actionLabels[action]}
                      </Button>
                    ))}
                  </Space>
                ) : null}
              </>
            ) : (
              <p className={styles.headlessHint}>
                {translate({
                  id: 'demos.controlPanel.headlessHint',
                  message: '此示例使用 Memory Adapter，请使用表单自身的提交按钮查看提交结果。'
                })}
              </p>
            )}
          </Card>
          <div className={styles.demo}>{children}</div>
          {controls.adapter === 'antd' ? (
            <Card
              className={styles.valuesPanel}
              title={translate({
                id: 'demos.controlPanel.values',
                message: '当前 AntD Form values'
              })}
            >
              <pre className={styles.values}>{JSON.stringify(values ?? {}, null, 2)}</pre>
            </Card>
          ) : null}
        </div>
        {submitResultModal}
      </>
    </DemoSubmitResultHandlerContext.Provider>
  );
};

export default DemoFormControlPanel;
