import React, { useMemo } from 'react';
import { Form, Button, Card, Row, Col } from 'antd';
import type {
  FormContentProps,
  FieldState,
  GroupFieldState,
  ContainerState,
  FieldNamePath
} from '../../shared/types';
import { useFormRuntimeEvents } from '../hooks/useFormRuntimeEvents';
import { useFieldParticipation } from '../hooks/useFieldParticipation';
import { useFormChainContext } from '../../shared/context/FormChainContext';
import { ComponentRegistryManager } from './componentRegistry';
import FieldComponentRenderer from './FieldComponentRenderer';

import { useRuntimeState } from '../../runtime';
import { getFieldName, normalizeFieldName } from '../../shared/utils';
import { mergeUIConfig } from '../../shared/utils/uiConfig';
import { resolveFormAdapter, resolveFormHandle } from '../formAdapter';

type NameSegment = string | number;

function toNamePath(name: FieldNamePath | undefined): NameSegment[] {
  if (name === undefined) return [];
  return normalizeFieldName(name);
}

function stripNamePrefix(name: FieldNamePath, prefix: FieldNamePath | undefined): NameSegment[] {
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
    form,
    formAdapter: providedFormAdapter
  } = props;
  const formAdapter = useMemo(
    () => resolveFormAdapter({ form, formAdapter: providedFormAdapter }),
    [form, providedFormAdapter]
  );
  const formHandle = useMemo(() => resolveFormHandle({ form, formAdapter }), [form, formAdapter]);

  const finalSubmitButtonText = submitButtonText ?? '提交';

  const { state } = useFormChainContext();
  const runtimeState = useRuntimeState(state);
  const { handleFinish, handleValuesChange } = useFormRuntimeEvents({
    formAdapter,
    onSubmit,
    runtimeState
  });
  const {
    staticUIConfig,
    dynamicUIConfig,
    initialized,
    fields,
    groupFields,
    configProcessInfo,
    nodes,
    rootNodeIds
  } = state;

  useFieldParticipation(formAdapter, state, runtimeState);

  const effectiveUIConfig = useMemo(
    () => mergeUIConfig(staticUIConfig, dynamicUIConfig),
    [staticUIConfig, dynamicUIConfig]
  );

  const registryManager = useMemo(() => {
    if (componentRegistry) {
      return new ComponentRegistryManager(componentRegistry);
    }
    return null;
  }, [componentRegistry]);

  const renderFieldRenderer = (field: FieldState, name?: FieldNamePath) => {
    const capability = runtimeState.fields[field.id];

    if (!initialized || !capability?.rendered) {
      return null;
    }

    return (
      <FieldComponentRenderer
        key={field.id}
        field={field}
        form={formHandle}
        formAdapter={formAdapter}
        name={name}
        componentRegistry={registryManager}
        staticUIConfig={staticUIConfig}
        dynamicUIConfig={dynamicUIConfig}
        runtimeCapability={capability}
      />
    );
  };

  /** 单字段渲染（最小单元，必须兜底） */
  const internalRenderFieldItem = (field: FieldState, name?: FieldNamePath) => {
    const defaultRender = renderFieldRenderer(field, name);

    if (defaultRender === null) {
      return null;
    }

    if (renderFieldItem) {
      return renderFieldItem({
        field,
        form: formHandle,
        formAdapter,
        fieldValue: formAdapter.getFieldValue(name ?? getFieldName(field)),
        renderField: internalRenderFieldItem,
        defaultRender
      });
    }

    return defaultRender;
  };

  /** 一组字段渲染（提供 renderFieldItem 能力） */
  const internalRenderFields = (
    fieldsArr: FieldState[],
    listPrefix?: FieldNamePath,
    schemaPrefix?: FieldNamePath
  ) => {
    const defaultRender = (
      <Row {...effectiveUIConfig.rowProps}>
        {fieldsArr.map((field) => {
          const capability = runtimeState.fields[field.id];

          if (!capability?.rendered) {
            return null;
          }
          const renderedName = listPrefix
            ? [...toNamePath(listPrefix), ...stripNamePrefix(getFieldName(field), schemaPrefix)]
            : undefined;
          return (
            <Col
              key={field.id}
              {...effectiveUIConfig.colProps}
              span={field.span || effectiveUIConfig.colProps?.span}
            >
              {internalRenderFieldItem(field, renderedName)}
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
      <Card key={group.id} title={group.title ?? group.id} {...effectiveUIConfig.cardProps}>
        {internalRenderFields(Object.values(group.fields))}
      </Card>
    );

    return renderGroupItem
      ? renderGroupItem({
          group,
          dynamicUIConfig: effectiveUIConfig,
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

  const renderNodeChildren = (
    childNodeIds: string[],
    listPrefix?: FieldNamePath,
    schemaPrefix?: FieldNamePath
  ): React.ReactNode => {
    const blocks: React.ReactNode[] = [];
    let fieldNodes: FieldState[] = [];

    const flushFieldNodes = (key: React.Key) => {
      if (fieldNodes.length === 0) return;

      blocks.push(
        <React.Fragment key={`fields-${key}`}>
          {internalRenderFields(fieldNodes, listPrefix, schemaPrefix)}
        </React.Fragment>
      );
      fieldNodes = [];
    };

    childNodeIds.forEach((nodeId, index) => {
      const entry = configProcessInfo.nodeRegistry[nodeId];
      const node = nodes[nodeId];

      if (!entry || !node) {
        return;
      }

      if (entry.nodeType === 'field') {
        fieldNodes.push(node as FieldState);
        return;
      }

      flushFieldNodes(index);
      blocks.push(
        <React.Fragment key={nodeId}>{renderNode(nodeId, listPrefix, schemaPrefix)}</React.Fragment>
      );
    });

    flushFieldNodes('tail');

    return <>{blocks}</>;
  };

  const renderNode = (
    nodeId: string,
    listPrefix?: FieldNamePath,
    schemaPrefix?: FieldNamePath
  ): React.ReactNode => {
    const node = nodes[nodeId];
    const entry = configProcessInfo.nodeRegistry[nodeId];

    if (!node || !entry) {
      return null;
    }

    if (entry.nodeType === 'field') {
      return internalRenderFields([node as FieldState], listPrefix, schemaPrefix);
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

    const renderChildren = (renderPrefix?: FieldNamePath, nextSchemaPrefix?: FieldNamePath) =>
      renderNodeChildren(container.children, renderPrefix, nextSchemaPrefix);

    if (container.repeatable) {
      return (
        <Card
          key={container.id}
          title={container.title ?? container.id}
          {...effectiveUIConfig.cardProps}
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
    const defaultRender = (
      <Card
        key={container.id}
        title={container.title ?? container.id}
        {...effectiveUIConfig.cardProps}
      >
        {renderChildren(containerRenderPrefix, containerSchemaPrefix)}
      </Card>
    );

    if (group && renderGroupItem) {
      return renderGroupItem({
        group,
        dynamicUIConfig: effectiveUIConfig,
        renderFields: internalRenderFields,
        renderFieldItem: internalRenderFieldItem,
        defaultRender
      });
    }

    return defaultRender;
  };

  /** 提交区渲染 */
  const internalRenderSubmit = () => (
    <div style={{ textAlign: 'center', marginTop: 24 }} {...effectiveUIConfig.submitAreaProps}>
      <Button type="primary" htmlType="submit" {...effectiveUIConfig.buttonProps}>
        {finalSubmitButtonText}
      </Button>
    </div>
  );

  const renderRootNodes = () => {
    if (rootNodeIds.length === 0) return null;
    return renderNodeChildren(rootNodeIds);
  };

  const fieldsBlock = renderRootNodes();
  const formBlocks = {
    fieldsArea: <>{fieldsBlock}</>,
    submitArea: internalRenderSubmit()
  };

  const finalFormBody = renderFormInner ? (
    renderFormInner({
      form: formHandle,
      formAdapter,
      fields,
      groupFields,
      dynamicUIConfig: effectiveUIConfig,
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
      form={formHandle}
      onFinish={handleFinish}
      onValuesChange={handleValuesChange}
      initialValues={configProcessInfo.initialValues}
      style={{ marginTop: 24 }}
      scrollToFirstError
      {...effectiveUIConfig.formProps}
    >
      {finalFormBody}
    </Form>
  );
};

export default FormContent;
