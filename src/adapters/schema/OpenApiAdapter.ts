import type { AdapterContext, ModuleConfigAdapter } from '../types';
import type { JsonSchemaAdapterInput, OpenApiAdapterInput } from './types';
import {
  getSchemaAdapterOptions,
  isObjectJsonSchema,
  isRecord,
  jsonSchemaToModuleConfigs
} from './utils';

function isOpenApiDocument(input: unknown): input is OpenApiAdapterInput {
  return isRecord(input) && typeof input.openapi === 'string' && isRecord(input.components);
}

function resolveOpenApiSchema(
  input: OpenApiAdapterInput | JsonSchemaAdapterInput,
  context: AdapterContext
): JsonSchemaAdapterInput {
  // 允许 OpenApiAdapter 直接复用单个 JsonSchema，便于强制 adapterType 时使用。
  if (isObjectJsonSchema(input)) {
    return input;
  }

  const schemas = input.components?.schemas;

  if (!schemas || Object.keys(schemas).length === 0) {
    throw new Error('OpenApiAdapter: OpenAPI document must declare components.schemas.');
  }

  const { schemaName } = getSchemaAdapterOptions(context);

  // 多 schema 文档必须显式选择，避免隐式编译错误业务模型。
  if (schemaName) {
    const schema = schemas[schemaName];

    if (!schema) {
      throw new Error(`OpenApiAdapter: schema "${schemaName}" was not found.`);
    }

    return schema;
  }

  const schemaEntries = Object.entries(schemas);

  if (schemaEntries.length !== 1) {
    throw new Error('OpenApiAdapter: schemaName is required when multiple schemas are declared.');
  }

  return schemaEntries[0][1];
}

export const OpenApiAdapter: ModuleConfigAdapter<OpenApiAdapterInput | JsonSchemaAdapterInput> = {
  type: 'openapi',
  supports(
    input: unknown,
    _context: AdapterContext
  ): input is OpenApiAdapterInput | JsonSchemaAdapterInput {
    return isOpenApiDocument(input) || isObjectJsonSchema(input);
  },
  adapt(input: OpenApiAdapterInput | JsonSchemaAdapterInput, context: AdapterContext) {
    return jsonSchemaToModuleConfigs(resolveOpenApiSchema(input, context));
  }
};
