import type { AdapterContext, ModuleConfigAdapter } from '../types';
import type { JsonSchemaAdapterInput } from './types';
import { isObjectJsonSchema, jsonSchemaToModuleConfigs } from './utils';

export const JsonSchemaAdapter: ModuleConfigAdapter<JsonSchemaAdapterInput> = {
  type: 'json-schema',
  supports(input: unknown, _context: AdapterContext): input is JsonSchemaAdapterInput {
    return isObjectJsonSchema(input);
  },
  adapt(input: JsonSchemaAdapterInput) {
    return jsonSchemaToModuleConfigs(input);
  }
};
