import React, { useMemo } from 'react';
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

import { useRuntimeState } from '../../runtime/useRuntimeState';
import { getFieldName, normalizeFieldName } from '../../shared/utils';
import { mergeUIConfig } from '../../shared/utils/uiConfig';
import { resolveFormAdapter, resolveFormHandle } from '../formAdapter';
import { antdRenderer } from './antdRenderer';
import { assertRendererAdapter } from './rendererAdapter';

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
    formAdapter: providedFormAdapter,
    renderer: providedRenderer
  } = props;
  const renderer = useMemo(() => {
    const resolvedRenderer = providedRenderer ?? antdRenderer;
    assertRendererAdapter(resolvedRenderer);
    return resolvedRenderer;
  }, [providedRenderer]);
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
        renderer={renderer}
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
    const defaultRender = renderer.renderFieldsLayout({
      uiConfig: effectiveUIConfig,
      children: fieldsArr.map((field) => {
        const capability = runtimeState.fields[field.id];

        if (!capability?.rendered) {
          return null;
        }
        const renderedName = listPrefix
          ? [...toNamePath(listPrefix), ...stripNamePrefix(getFieldName(field), schemaPrefix)]
          : undefined;
        return (
          <React.Fragment key={field.id}>
            {renderer.renderFieldLayout({
              field,
              uiConfig: effectiveUIConfig,
              children: internalRenderFieldItem(field, renderedName)
            })}
          </React.Fragment>
        );
      })
    });

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

    const defaultRender = renderer.renderGroup({
      id: group.id,
      title: group.title,
      uiConfig: effectiveUIConfig,
      children: internalRenderFields(Object.values(group.fields))
    });

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
      return renderer.renderRepeatable({
        id: container.id,
        title: container.title,
        name: container.name!,
        uiConfig: effectiveUIConfig,
        renderItem: (itemName) => renderChildren([itemName], containerSchemaPrefix)
      });
    }

    const group = groupFields[container.id];
    const defaultRender = renderer.renderGroup({
      id: container.id,
      title: container.title,
      uiConfig: effectiveUIConfig,
      children: renderChildren(containerRenderPrefix, containerSchemaPrefix)
    });

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
  const internalRenderSubmit = () =>
    renderer.renderSubmit({
      submitButtonText: finalSubmitButtonText,
      uiConfig: effectiveUIConfig
    });

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
  return renderer.renderForm({
    form: formHandle,
    formAdapter,
    onFinish: handleFinish,
    onValuesChange: handleValuesChange,
    initialValues: configProcessInfo.initialValues,
    uiConfig: effectiveUIConfig,
    children: finalFormBody
  });
};

export default FormContent;
