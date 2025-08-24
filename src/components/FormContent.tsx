import React, { useMemo } from 'react';
import { Form, Button, Card, Row, Col } from 'antd';
import type { FormContentProps, FieldState, GroupField, GroupFieldState } from '../types';
import { useFormChainContext } from '../hooks';
import { log, LogCategory } from '../utils/logger';
import { ComponentRegistryManager } from '../fieldComponentRegistry';
import FieldComponentRenderer from '../fieldComponentRenderer';

const FormContent: React.FC<FormContentProps> = (props) => {
  const {
    onSubmit,
    submitButtonText,
    componentRegistry,
    renderFormInner,
    renderFieldItem,
    renderGroupItem,
    renderFields,
    renderGroups,
    form
  } = props;
  // 获取默认配置

  // 合并用户配置和默认配置
  const finalSubmitButtonText = submitButtonText ?? '提交';

  const { state, onValuesChange, syncFormStateToStore } = useFormChainContext();
  const { dynamicUIConfig, fieldValues, initialized, fields, groupFields } = state;

  // 创建组件注册器实例
  const registryManager = useMemo(() => {
    if (componentRegistry) {
      return new ComponentRegistryManager(componentRegistry);
    }
    return null;
  }, [componentRegistry]);

  const handleFinish = (values: Record<string, any>) => {
    log.info(LogCategory.FORM, '表单提交:', values, form.getFieldsValue());
    onSubmit?.(values);
  };

  const handleFinishValuesChange = (
    changedValues: Record<string, any>,
    allValues: Record<string, any>
  ) => {
    syncFormStateToStore(changedValues, allValues);

    form.validateFields(Object.keys(changedValues));
    // effect chain Run
    onValuesChange?.(changedValues);
  };

  /** 单字段渲染（最小单元，必须兜底） */
  const internalRenderFieldItem = (field: FieldState) => {
    if (!initialized || field.meta?.visible === false) return null;

    const defaultRender = (
      <FieldComponentRenderer
        key={field.id}
        field={field}
        form={form}
        fieldValue={fieldValues[field.id]}
        componentRegistry={registryManager}
        dynamicUIConfig={dynamicUIConfig}
      />
    );

    if (renderFieldItem) {
      return renderFieldItem({
        field,
        form,
        fieldValue: fieldValues[field.id],
        renderField: internalRenderFieldItem, // 递归给自己
        defaultRender
      });
    }

    return defaultRender;
  };

  /** 一组字段渲染（提供 renderFieldItem 能力） */
  const internalRenderFields = (fieldsArr: FieldState[]) => {
    const defaultRender = (
      <Row {...dynamicUIConfig.rowProps}>
        {fieldsArr.map((field) => {
          if (!initialized || field.meta?.visible === false) return null;
          return (
            <Col
              key={field.id}
              {...dynamicUIConfig.colProps}
              span={field.span || dynamicUIConfig.colProps?.span}
            >
              {internalRenderFieldItem(field)}
            </Col>
          );
        })}
      </Row>
    );

    return renderFields
      ? renderFields({
          fields: fieldsArr,
          renderFieldItem: internalRenderFieldItem,
          defaultRender
        })
      : defaultRender;
  };

  /** 单个分组渲染（提供 renderFields / renderFieldItem 能力） */
  const internalRenderGroupItem = (group: GroupFieldState) => {
    if (group.meta?.visible === false) return null;

    const defaultRender = (
      <Card key={group.id} title={group.title ?? group.id} {...dynamicUIConfig.cardProps}>
        {internalRenderFields(Object.values(group.fields))}
      </Card>
    );

    return renderGroupItem
      ? renderGroupItem({
          group,
          dynamicUIConfig,
          renderFields: internalRenderFields,
          renderFieldItem: internalRenderFieldItem,
          defaultRender
        })
      : defaultRender;
  };

  /** 分组集合渲染（提供 renderGroupItem / renderFields / renderFieldItem 能力） */
  const internalRenderGroups = (groups: Record<string, GroupFieldState>) => {
    const defaultRender = Object.values(groups).map(internalRenderGroupItem);

    return renderGroups
      ? renderGroups({
          groupFields: groups,
          renderGroupItem: internalRenderGroupItem,
          renderFields: internalRenderFields,
          renderFieldItem: internalRenderFieldItem,
          defaultRender
        })
      : defaultRender;
  };

  /** 提交区渲染 */
  const internalRenderSubmit = () => (
    <div style={{ textAlign: 'center', marginTop: 24 }} {...dynamicUIConfig.submitAreaProps}>
      <Button type="primary" htmlType="submit" {...dynamicUIConfig.buttonProps}>
        {finalSubmitButtonText}
      </Button>
    </div>
  );

  /** 最终组装：优先分组，否则平铺字段 */
  const formBlocks = {
    fieldsArea:
      Object.keys(groupFields).length > 0
        ? internalRenderGroups(groupFields)
        : internalRenderFields(Object.values(fields)),
    submitArea: internalRenderSubmit()
  };

  const finalFormBody = renderFormInner ? (
    renderFormInner({
      form,
      fields,
      groupFields,
      dynamicUIConfig,
      renderGroups: internalRenderGroups,
      renderGroupItem: internalRenderGroupItem,
      renderFields: internalRenderFields,
      renderFieldItem: internalRenderFieldItem,
      defaultRender: formBlocks
    })
  ) : (
    <>
      {formBlocks.fieldsArea}
      {formBlocks.submitArea}
    </>
  );
  log.info(LogCategory.RENDER, 'render FormContent', state, form.getFieldsValue(true));

  return (
    <Form
      form={form}
      onFinish={handleFinish}
      onValuesChange={handleFinishValuesChange}
      initialValues={fieldValues}
      style={{ marginTop: 24 }}
      scrollToFirstError
      {...dynamicUIConfig.formProps}
    >
      {finalFormBody}
    </Form>
  );
};

export default FormContent;
