import type {
  BaseFieldConfig,
  ContainerNode,
  ContainerRegistryEntry,
  ContainerState,
  FieldNode,
  FieldRegistry,
  FieldState,
  Fieldchain,
  FormConfig,
  FormNode,
  GroupField,
  GroupFieldState,
  NodeRegistryEntry
} from '../../shared/types';
import type { ConfigAnalysisResult, ConfigProcessInfo, HydratedConfigResult } from './types';
import { applyEffectResult, createInitialEffectResultContext } from '../../consumer/effects';
import {
  createFieldAddressRegistry,
  createFieldValueView,
  getFieldName,
  setValueAtNamePath
} from '../../shared/utils';

type NameSegment = string | number;

function toNameSegments(name: BaseFieldConfig['name']): NameSegment[] {
  if (name === undefined) return [];
  return Array.isArray(name) ? [...name] : [name];
}

function isFieldConfig(config: unknown): config is BaseFieldConfig {
  return !!config && typeof config === 'object' && !('fields' in config);
}

function createFieldNode(field: BaseFieldConfig): FieldNode {
  return {
    ...field,
    nodeType: 'field'
  };
}

function createContainerNode(group: GroupField): ContainerNode {
  return {
    nodeType: 'container',
    id: group.id,
    title: group.title,
    initialVisible: group.initialVisible,
    dependents: group.dependents,
    effect: group.effect,
    children: group.fields.map(createFieldNode)
  };
}

function normalizeFormNodes(config: FormConfig): FormNode[] {
  return [
    ...(config.nodes || []),
    ...(config.fields || []).map(createFieldNode),
    ...(config.groups || []).map(createContainerNode)
  ];
}

function withResolvedFieldName(field: FieldNode, containerNamePath: NameSegment[]): FieldNode {
  if (field.name === undefined && containerNamePath.length === 0) {
    return {
      ...field,
      name: undefined
    };
  }

  const ownName = field.name === undefined ? [field.id] : toNameSegments(field.name);

  return {
    ...field,
    name: [...containerNamePath, ...ownName]
  };
}

function assertContainerNode(node: ContainerNode) {
  if (!Array.isArray(node.children) || node.children.length === 0) {
    throw new Error(`analyzeFormConfig: container "${node.id}" must contain at least one child.`);
  }

  if (node.repeatable && toNameSegments(node.name).length === 0) {
    throw new Error(`analyzeFormConfig: repeatable container "${node.id}" must declare name.`);
  }
}

/**
 * 分析表单配置，生成 normalized node tree、effectMap 和 registry。
 */
export function analyzeFormConfig(config: FormConfig): ConfigAnalysisResult {
  const effectMap: Record<string, Fieldchain> = {};
  const nodeRegistry: Record<string, NodeRegistryEntry> = {};
  const containerRegistry: Record<string, ContainerRegistryEntry> = {};
  const fieldRegistry: Record<string, FieldRegistry> = {};
  const rootNodeIds: string[] = [];

  const registerId = (id: string) => {
    if (nodeRegistry[id]) {
      throw new Error(`analyzeFormConfig: duplicate node id "${id}".`);
    }
  };

  const visitNode = (
    node: FormNode,
    parentId: string | undefined,
    path: string[],
    containerNamePath: NameSegment[]
  ) => {
    registerId(node.id);

    if (node.nodeType === 'field') {
      const field = withResolvedFieldName(node, containerNamePath);
      nodeRegistry[field.id] = {
        id: field.id,
        nodeType: 'field',
        parentId,
        config: field,
        path
      };
      fieldRegistry[field.id] = {
        id: field.id,
        isGroupField: !!parentId,
        groupId: parentId,
        config: field
      };
      effectMap[field.id] = {
        effect: field.effect || (() => undefined),
        dependents: field.dependents || []
      };
      return;
    }

    assertContainerNode(node);
    nodeRegistry[node.id] = {
      id: node.id,
      nodeType: 'container',
      parentId,
      config: node,
      path
    };
    containerRegistry[node.id] = {
      id: node.id,
      parentId,
      config: node,
      path
    };
    fieldRegistry[node.id] = {
      id: node.id,
      isGroupField: true,
      groupId: parentId,
      config: {
        id: node.id,
        title: node.title,
        initialVisible: node.initialVisible,
        dependents: node.dependents,
        effect: node.effect,
        fields: []
      }
    };

    if (node.effect || node.dependents) {
      effectMap[node.id] = {
        effect: node.effect || (() => undefined),
        dependents: node.dependents || []
      };
    }

    const nextContainerNamePath = node.name
      ? [...containerNamePath, ...toNameSegments(node.name)]
      : containerNamePath;

    node.children.forEach((child, index) => {
      visitNode(child, node.id, [...path, String(index)], nextContainerNamePath);
    });
  };

  const rootNodes = normalizeFormNodes(config);
  if (rootNodes.length === 0) {
    throw new Error('analyzeFormConfig: at least one node, field, or group is required.');
  }

  rootNodes.forEach((node, index) => {
    rootNodeIds.push(node.id);
    visitNode(node, undefined, [String(index)], []);
  });

  if (config.nodes?.length) {
    Object.entries(effectMap).forEach(([id, chain]) => {
      chain.dependents.forEach((dependentId) => {
        if (!nodeRegistry[dependentId]) {
          throw new Error(
            `analyzeFormConfig: node "${id}" references unknown dependent "${dependentId}".`
          );
        }
      });
    });
  }

  return {
    effectMap,
    nodeRegistry,
    containerRegistry,
    fieldRegistry,
    fieldAddressRegistry: createFieldAddressRegistry(fieldRegistry),
    rootNodeIds
  };
}

function createFieldState(field: BaseFieldConfig): FieldState {
  return {
    ...field,
    meta: { behavior: { visible: field.initialVisible !== false } }
  };
}

function createContainerState(container: ContainerNode): ContainerState {
  return {
    ...container,
    meta: { behavior: { visible: container.initialVisible !== false } },
    children: container.children.map((child) => child.id)
  };
}

function collectDirectContainerFields(
  container: ContainerNode,
  nodeRegistry: Record<string, NodeRegistryEntry>
): Record<string, FieldState> {
  return container.children.reduce<Record<string, FieldState>>((result, child) => {
    const entry = nodeRegistry[child.id];
    if (entry?.nodeType === 'field' && isFieldConfig(entry.config)) {
      result[child.id] = createFieldState(entry.config);
    }
    return result;
  }, {});
}

function createContainerGroupState(
  container: ContainerNode,
  fields: Record<string, FieldState>
): GroupFieldState {
  return {
    id: container.id,
    title: container.title,
    initialVisible: container.initialVisible,
    dependents: container.dependents,
    effect: container.effect,
    meta: { behavior: { visible: container.initialVisible !== false } },
    fields
  };
}

/**
 * 根据分析结果和原始配置计算初始值和字段状态。
 */
export function hydrateFormConfig(analysisConfig: ConfigAnalysisResult): HydratedConfigResult {
  const { fieldRegistry, nodeRegistry, containerRegistry } = analysisConfig;
  const initialValues: Record<string, any> = {};
  const initializedFields: Record<string, FieldState> = {};
  const initializedGroupFields: Record<string, GroupFieldState> = {};
  const initializedNodes: Record<string, FieldState | ContainerState> = {};
  const initializedContainerFields: Record<string, Record<string, FieldState>> = {};

  Object.values(containerRegistry).forEach(({ config: container }) => {
    const fields = collectDirectContainerFields(container, nodeRegistry);
    initializedContainerFields[container.id] = fields;
    initializedGroupFields[container.id] = createContainerGroupState(container, fields);
    initializedNodes[container.id] = createContainerState(container);
  });

  const findFieldState = (fieldId: string) => {
    const entry = fieldRegistry[fieldId];
    if (!entry || !isFieldConfig(entry.config)) return undefined;
    if (!entry.groupId) return initializedFields[fieldId];
    return initializedContainerFields[entry.groupId]?.[fieldId];
  };

  const processInitialValueResult = (field: BaseFieldConfig, result: any) => {
    if (!result || typeof result !== 'object') {
      setValueAtNamePath(initialValues, getFieldName(field), result);
      return;
    }

    const context = createInitialEffectResultContext({
      fieldId: field.id,
      initialValues,
      initializedFields,
      initializedGroupFields,
      fieldRegistry
    });

    applyEffectResult(result, context);
  };

  Object.values(nodeRegistry).forEach((entry) => {
    if (entry.nodeType !== 'field' || !isFieldConfig(entry.config)) {
      return;
    }

    const field = entry.config;
    const fieldState = createFieldState(field);
    initializedNodes[field.id] = fieldState;

    const registryEntry = fieldRegistry[field.id];
    if (!registryEntry.groupId) {
      initializedFields[field.id] = fieldState;
    } else {
      initializedContainerFields[registryEntry.groupId] ||= {};
      initializedContainerFields[registryEntry.groupId][field.id] = fieldState;
      initializedGroupFields[registryEntry.groupId].fields[field.id] = fieldState;
    }

    if (field.initialValue !== undefined && typeof field.initialValue !== 'function') {
      setValueAtNamePath(initialValues, getFieldName(field), field.initialValue);
    }

    if (typeof field.initialValue === 'function') {
      try {
        const result = field.initialValue(
          createFieldValueView(initialValues, analysisConfig.fieldAddressRegistry)
        );
        processInitialValueResult(field, result);
      } catch (error) {
        console.error(`计算字段 ${field.id} 的函数初始值时出错:`, error);
      }
    }

    const hydratedField = findFieldState(field.id);
    if (hydratedField) {
      initializedNodes[field.id] = hydratedField;
    }
  });

  return {
    initialValues,
    initializedFields,
    initializedGroupFields,
    initializedNodes,
    initializedContainerFields
  };
}

/**
 * 外部统一调用函数
 */
export function processFormConfig(config: FormConfig): ConfigProcessInfo {
  const analysis = analyzeFormConfig(config);
  const hydrated = hydrateFormConfig(analysis);

  return {
    ...analysis,
    ...hydrated
  };
}
