import type {
  BaseFieldConfig,
  FieldNamePath,
  FormConfig,
  FormNode,
  GroupField
} from '../shared/types';
import { serializeFieldName } from '../shared/utils';

export type FormConfigDiagnosticSeverity = 'error' | 'warning';

export interface FormConfigDiagnostic {
  severity: FormConfigDiagnosticSeverity;
  code:
    | 'EMPTY_CONFIG'
    | 'DUPLICATE_ID'
    | 'DUPLICATE_NAME'
    | 'EMPTY_CONTAINER'
    | 'REPEATABLE_NAME_REQUIRED'
    | 'INVALID_GROUP_FIELDS'
    | 'UNKNOWN_COMPONENT'
    | 'UNKNOWN_DEPENDENT';
  message: string;
  path: string[];
  id?: string;
}

export interface FormConfigDiagnosticsOptions {
  knownComponents?: string[];
  validateComponents?: boolean;
  validateDependents?: boolean;
}

export interface FormConfigValidationResult {
  valid: boolean;
  diagnostics: FormConfigDiagnostic[];
}

const DEFAULT_KNOWN_COMPONENTS = new Set([
  'Password',
  'ConfirmPassword',
  'TextInput',
  'NumberInput',
  'SelectField',
  'DatePicker',
  'Switch',
  'Rate',
  'TextDisplay',
  'CheckboxGroup',
  'Select',
  'TextArea',
  'TestInput'
]);

type FieldCandidate = BaseFieldConfig & { nodeType?: 'field' };

function getNameSegments(
  name: FieldNamePath | undefined,
  fallbackId: string
): Array<string | number> {
  if (name === undefined) return [fallbackId];
  return Array.isArray(name) ? [...name] : [name];
}

function createFieldNode(field: BaseFieldConfig): FormNode {
  return {
    ...field,
    nodeType: 'field'
  };
}

function createContainerNode(group: GroupField): FormNode {
  return {
    nodeType: 'container',
    id: group.id,
    designer: group.designer,
    title: group.title,
    initialVisible: group.initialVisible,
    dependents: group.dependents,
    effect: group.effect,
    children: Array.isArray(group.fields) ? group.fields.map(createFieldNode) : []
  };
}

function normalizeNodes(config: FormConfig): FormNode[] {
  return [
    ...(config.nodes || []),
    ...(config.fields || []).map(createFieldNode),
    ...(config.groups || []).map(createContainerNode)
  ];
}

function pushDiagnostic(
  diagnostics: FormConfigDiagnostic[],
  diagnostic: FormConfigDiagnostic
): void {
  diagnostics.push(diagnostic);
}

export function getFormConfigDiagnostics(
  config: FormConfig,
  options: FormConfigDiagnosticsOptions = {}
): FormConfigDiagnostic[] {
  const diagnostics: FormConfigDiagnostic[] = [];
  const ids = new Map<string, string[]>();
  const names = new Map<string, { id: string; path: string[] }>();
  const allIds = new Set<string>();
  const knownComponents = new Set([
    ...(options.knownComponents || []),
    ...DEFAULT_KNOWN_COMPONENTS
  ]);
  const validateComponents = options.validateComponents !== false;
  const validateDependents = options.validateDependents !== false;

  if (!config || normalizeNodes(config).length === 0) {
    pushDiagnostic(diagnostics, {
      severity: 'error',
      code: 'EMPTY_CONFIG',
      message: 'FormConfig must declare at least one node, field, or group.',
      path: []
    });
    return diagnostics;
  }

  (config.groups || []).forEach((group, index) => {
    if (!Array.isArray(group.fields)) {
      pushDiagnostic(diagnostics, {
        severity: 'error',
        code: 'INVALID_GROUP_FIELDS',
        message: `Group "${group.id}" must declare fields as an array.`,
        id: group.id,
        path: ['groups', String(index), 'fields']
      });
    }
  });

  const registerId = (id: string, path: string[]) => {
    allIds.add(id);
    const existingPath = ids.get(id);
    if (existingPath) {
      pushDiagnostic(diagnostics, {
        severity: 'error',
        code: 'DUPLICATE_ID',
        message: `Duplicate node id "${id}".`,
        id,
        path
      });
      return;
    }
    ids.set(id, path);
  };

  const visitField = (
    field: FieldCandidate,
    path: string[],
    containerNamePath: Array<string | number>
  ) => {
    registerId(field.id, path);

    const finalName = [...containerNamePath, ...getNameSegments(field.name, field.id)];
    const serializedName = serializeFieldName(finalName);
    const existingName = names.get(serializedName);
    if (existingName) {
      pushDiagnostic(diagnostics, {
        severity: 'error',
        code: 'DUPLICATE_NAME',
        message: `Fields "${existingName.id}" and "${field.id}" use the same name path ${serializedName}.`,
        id: field.id,
        path
      });
    } else {
      names.set(serializedName, { id: field.id, path });
    }

    if (validateComponents && field.component && !knownComponents.has(field.component)) {
      pushDiagnostic(diagnostics, {
        severity: 'warning',
        code: 'UNKNOWN_COMPONENT',
        message: `Field "${field.id}" uses unknown component "${field.component}".`,
        id: field.id,
        path: [...path, 'component']
      });
    }
  };

  const visitNode = (node: FormNode, path: string[], containerNamePath: Array<string | number>) => {
    if (node.nodeType === 'field') {
      visitField(node, path, containerNamePath);
      return;
    }

    registerId(node.id, path);

    if (!Array.isArray(node.children) || node.children.length === 0) {
      pushDiagnostic(diagnostics, {
        severity: 'error',
        code: 'EMPTY_CONTAINER',
        message: `Container "${node.id}" must contain at least one child.`,
        id: node.id,
        path: [...path, 'children']
      });
    }

    if (node.repeatable && getNameSegments(node.name, '').filter(Boolean).length === 0) {
      pushDiagnostic(diagnostics, {
        severity: 'error',
        code: 'REPEATABLE_NAME_REQUIRED',
        message: `Repeatable container "${node.id}" must declare name.`,
        id: node.id,
        path: [...path, 'name']
      });
    }

    const nextContainerNamePath = node.name
      ? [...containerNamePath, ...getNameSegments(node.name, node.id)]
      : containerNamePath;

    (node.children || []).forEach((child, index) =>
      visitNode(child, [...path, 'children', String(index)], nextContainerNamePath)
    );
  };

  normalizeNodes(config).forEach((node, index) => visitNode(node, [String(index)], []));

  if (validateDependents) {
    Object.entries(ids).forEach(() => undefined);
    const visitDependents = (node: FormNode, path: string[]) => {
      (node.dependents || []).forEach((dependentId, index) => {
        if (!allIds.has(dependentId)) {
          pushDiagnostic(diagnostics, {
            severity: 'error',
            code: 'UNKNOWN_DEPENDENT',
            message: `Node "${node.id}" references unknown dependent "${dependentId}".`,
            id: node.id,
            path: [...path, 'dependents', String(index)]
          });
        }
      });

      if (node.nodeType === 'container') {
        node.children.forEach((child, index) =>
          visitDependents(child, [...path, 'children', String(index)])
        );
      }
    };

    normalizeNodes(config).forEach((node, index) => visitDependents(node, [String(index)]));
  }

  return diagnostics;
}

export function validateFormConfig(
  config: FormConfig,
  options?: FormConfigDiagnosticsOptions
): FormConfigValidationResult {
  const diagnostics = getFormConfigDiagnostics(config, options);
  return {
    valid: diagnostics.every((diagnostic) => diagnostic.severity !== 'error'),
    diagnostics
  };
}
