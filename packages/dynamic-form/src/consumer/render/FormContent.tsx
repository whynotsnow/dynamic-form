import React, { useMemo } from 'react';
import { Form, Button, Card, Row, Col } from 'antd';
import type {
  FormContentProps,
  FieldState,
  GroupFieldState,
  ContainerState
} from '../../shared/types';
import type { NamePath } from 'antd/es/form/interface';
import { useFormRuntimeEvents } from '../hooks/useFormRuntimeEvents';
import { useFieldParticipation } from '../hooks/useFieldParticipation';
import { useFormChainContext } from '../../shared/context/FormChainContext';
import { ComponentRegistryManager } from './componentRegistry';
import FieldComponentRenderer from './FieldComponentRenderer';

import { useRuntimeState } from '../../runtime';
import { getFieldName, normalizeFieldName } from '../../shared/utils';

type NameSegment = string | number;

function toNamePath(name: NamePath | undefined): NameSegment[] {
  if (name === undefined) return [];
  return normalizeFieldName(name);
}

function stripNamePrefix(name: NamePath, prefix: NamePath | undefined): NameSegment[] {
  const namePath = toNamePath(name);
  const prefixPath = toNamePath(prefix);

  return namePath.slice(prefixPath.length);
}

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

  const finalSubmitButtonText = submitButtonText ?? '提交';

  const { state } = useFormChainContext();
  const runtimeState = useRuntimeState(state);
  const { handleFinish, handleValuesChange } = useFormRuntimeEvents({
    form,
    onSubmit,
    runtimeState
  });
  const {
    dynamicUIConfig,
    initialized,
    fields,
    groupFields,
    configProcessInfo,
    nodes,
    rootNodeIds
  } = state;

  useFieldParticipation(form, state, runtimeState);

  const registryManager = useMemo(() => {
    if (componentRegistry) {
      return new ComponentRegistryManager(componentRegistry);
    }
    return null;
  }, [componentRegistry]);

  const renderFieldRenderer = (field: FieldState, name?: NamePath) => {
    const capability = runtimeState.fields[field.id];

    if (!initialized || !capability?.rendered) {
      return null;
    }

    return (
      <FieldComponentRenderer
        key={field.id}
        field={field}
        form={form}
        name={name}
        componentRegistry={registryManager}
        dynamicUIConfig={dynamicUIConfig}
        runtimeCapability={capability}
      />
    );
  };

  /** 单字段渲染（最小单元，必须兜底） */
  const internalRenderFieldItem = (field: FieldState) => {
    const defaultRender = renderFieldRenderer(field);

    if (defaultRender === null) {
      return null;
    }

    if (renderFieldItem) {
      return renderFieldItem({
        field,
        form,
        fieldValue: form.getFieldValue(getFieldName(field)),
        renderField: internalRenderFieldItem,
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
          const capability = runtimeState.fields[field.id];

          if (!capability?.rendered) {
            return null;
          }
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
    const capability = runtimeState.groups[group.id];
    if (!capability?.rendered) {
      return null;
    }

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

  const renderNode = (
    nodeId: string,
    listPrefix?: NamePath,
    schemaPrefix?: NamePath
  ): React.ReactNode => {
    const node = nodes[nodeId];
    const entry = configProcessInfo.nodeRegistry[nodeId];

    if (!node || !entry) {
      return null;
    }

    if (entry.nodeType === 'field') {
      const field = node as FieldState;
      const renderedName = listPrefix
        ? [...toNamePath(listPrefix), ...stripNamePrefix(getFieldName(field), schemaPrefix)]
        : undefined;

      return (
        <Col
          key={field.id}
          {...dynamicUIConfig.colProps}
          span={field.span || dynamicUIConfig.colProps?.span}
        >
          {renderedName ? renderFieldRenderer(field, renderedName) : internalRenderFieldItem(field)}
        </Col>
      );
    }

    const container = node as ContainerState;
    const capability = runtimeState.containers[container.id];
    if (!capability?.rendered) {
      return null;
    }

    const containerSchemaPrefix = container.name
      ? [...toNamePath(schemaPrefix), ...toNamePath(container.name)]
      : schemaPrefix;
    const containerRenderPrefix =
      listPrefix && container.name
        ? [...toNamePath(listPrefix), ...toNamePath(container.name)]
        : listPrefix;

    const renderChildren = (renderPrefix?: NamePath, nextSchemaPrefix?: NamePath) => (
      <Row {...dynamicUIConfig.rowProps}>
        {container.children.map((childId) => renderNode(childId, renderPrefix, nextSchemaPrefix))}
      </Row>
    );

    if (container.repeatable) {
      return (
        <Card
          key={container.id}
          title={container.title ?? container.id}
          {...dynamicUIConfig.cardProps}
        >
          <Form.List name={container.name!}>
            {(items) => (
              <>
                {items.map((item) => (
                  <div key={item.key}>{renderChildren([item.name], containerSchemaPrefix)}</div>
                ))}
              </>
            )}
          </Form.List>
        </Card>
      );
    }

    const group = groupFields[container.id];
    if (group && renderGroupItem) {
      return internalRenderGroupItem(group);
    }

    return (
      <Card
        key={container.id}
        title={container.title ?? container.id}
        {...dynamicUIConfig.cardProps}
      >
        {renderChildren(containerRenderPrefix, containerSchemaPrefix)}
      </Card>
    );
  };

  /** 提交区渲染 */
  const internalRenderSubmit = () => (
    <div style={{ textAlign: 'center', marginTop: 24 }} {...dynamicUIConfig.submitAreaProps}>
      <Button type="primary" htmlType="submit" {...dynamicUIConfig.buttonProps}>
        {finalSubmitButtonText}
      </Button>
    </div>
  );

  const fieldsBlock =
    rootNodeIds.length > 0 ? rootNodeIds.map((nodeId) => renderNode(nodeId)) : null;
  const formBlocks = {
    fieldsArea: <>{fieldsBlock}</>,
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
  return (
    <Form
      form={form}
      onFinish={handleFinish}
      onValuesChange={handleValuesChange}
      initialValues={configProcessInfo.initialValues}
      style={{ marginTop: 24 }}
      scrollToFirstError
      {...dynamicUIConfig.formProps}
    >
      {finalFormBody}
    </Form>
  );
};

export default FormContent;
