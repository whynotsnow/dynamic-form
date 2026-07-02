import type { AdapterContext } from '../types';
import type { GroupModuleConfig, ModuleFormConfig, ModuleFormNode } from '../../compiler';
import { assertValidGroupRule } from '../../rules';
import type {
  JsonSchemaAdapterInput,
  JsonSchemaProperty,
  SchemaAdapterFieldMetadata,
  SchemaAdapterOptions
} from './types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function getSchemaAdapterOptions(context: AdapterContext): SchemaAdapterOptions {
  const options = context.metadata?.schemaAdapterOptions;

  if (isRecord(options)) {
    return options as SchemaAdapterOptions;
  }

  return {
    schemaName:
      typeof context.metadata?.schemaName === 'string' ? context.metadata.schemaName : undefined
  };
}

export function isObjectJsonSchema(input: unknown): input is JsonSchemaAdapterInput {
  return (
    isRecord(input) &&
    input.type === 'object' &&
    isRecord(input.properties) &&
    (input.required === undefined || isStringArray(input.required))
  );
}

function getFieldMetadata(property: JsonSchemaProperty): SchemaAdapterFieldMetadata {
  return property['x-dynamic-form'] || property.metadata || {};
}

function getSchemaGroups(schema: JsonSchemaAdapterInput): GroupModuleConfig[] {
  const groups = schema['x-dynamic-form']?.groups || [];

  return groups.map((group) => {
    if ('effect' in group && group.effect !== undefined) {
      throw new Error(
        `JsonSchemaAdapter: group "${group.id}" cannot declare a function effect in schema data.`
      );
    }

    (group.rules || []).forEach(assertValidGroupRule);

    return {
      id: group.id,
      title: group.title,
      initialVisible: group.initialVisible,
      dependents: group.dependents,
      rules: group.rules
    };
  });
}

export function jsonSchemaToModuleFormConfig(schema: JsonSchemaAdapterInput): ModuleFormConfig {
  if (!isObjectJsonSchema(schema)) {
    throw new Error('JsonSchemaAdapter: schema must be an object schema with properties.');
  }

  const createLeafNode = (
    id: string,
    property: JsonSchemaProperty,
    required: Set<string>,
    path: string[]
  ): ModuleFormNode => {
    const metadata = getFieldMetadata(property);
    const moduleType = metadata.module;

    if (!moduleType) {
      throw new Error(
        `JsonSchemaAdapter: property "${id}" must declare dynamic form module metadata.`
      );
    }

    const isRequired = required.has(id);
    const label = property.title || id;
    const options = {
      label,
      required: isRequired,
      enum: property.enum,
      default: property.default,
      format: property.format,
      description: property.description,
      schemaType: property.type,
      ...(metadata.options || {})
    };
    const overrides = {
      label,
      required: isRequired,
      name: metadata.name ?? id,
      ...(property.default !== undefined ? { initialValue: property.default } : {}),
      ...(metadata.overrides || {})
    };

    return {
      nodeType: 'field',
      type: moduleType,
      id: path.join('.'),
      ...(metadata.groupId ? { groupId: metadata.groupId } : {}),
      options,
      rules: metadata.rules,
      overrides
    };
  };

  const createPropertyNode = (
    id: string,
    property: JsonSchemaProperty,
    required: Set<string>,
    path: string[]
  ): ModuleFormNode => {
    if (property.type === 'object' && property.properties) {
      const childRequired = new Set(property.required || []);

      return {
        nodeType: 'container',
        id: path.join('.'),
        title: property.title || id,
        name: id,
        children: Object.entries(property.properties).map(([childId, childProperty]) =>
          createPropertyNode(childId, childProperty, childRequired, [...path, childId])
        )
      };
    }

    if (
      property.type === 'array' &&
      property.items?.type === 'object' &&
      property.items.properties
    ) {
      const childRequired = new Set(property.items.required || []);

      return {
        nodeType: 'container',
        id: path.join('.'),
        title: property.title || id,
        name: id,
        repeatable: true,
        children: Object.entries(property.items.properties).map(([childId, childProperty]) =>
          createPropertyNode(childId, childProperty, childRequired, [...path, childId])
        )
      };
    }

    return createLeafNode(id, property, required, path);
  };

  const required = new Set(schema.required || []);
  const nodes = Object.entries(schema.properties).map(([id, property]) =>
    createPropertyNode(id, property, required, [id])
  );

  const groups = getSchemaGroups(schema);

  return {
    nodes,
    ...(groups.length > 0 ? { groups } : {})
  };
}
