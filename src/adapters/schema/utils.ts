import type { AdapterContext } from '../types';
import type { ModuleConfig } from '../../compiler';
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

function assertSupportedTopLevelProperty(id: string, property: JsonSchemaProperty) {
  // 3.3 只处理顶层字段，嵌套对象留给后续结构化表单能力。
  if (property.type === 'object' && property.properties) {
    throw new Error(`JsonSchemaAdapter: nested object property "${id}" is not supported in 3.3.`);
  }

  if (property.type === 'array' && property.items && property.items.type === 'object') {
    throw new Error(`JsonSchemaAdapter: object array property "${id}" is not supported in 3.3.`);
  }
}

export function jsonSchemaToModuleConfigs(schema: JsonSchemaAdapterInput): ModuleConfig[] {
  if (!isObjectJsonSchema(schema)) {
    throw new Error('JsonSchemaAdapter: schema must be an object schema with properties.');
  }

  const required = new Set(schema.required || []);

  return Object.entries(schema.properties).map(([id, property]) => {
    assertSupportedTopLevelProperty(id, property);

    const metadata = getFieldMetadata(property);
    const moduleType = metadata.module;

    // 必须由 schema 显式声明模块类型，避免根据 primitive type 猜测 UI。
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
      ...(property.default !== undefined ? { initialValue: property.default } : {}),
      ...(metadata.overrides || {})
    };

    return {
      type: moduleType,
      id,
      options,
      rules: metadata.rules,
      overrides
    };
  });
}
