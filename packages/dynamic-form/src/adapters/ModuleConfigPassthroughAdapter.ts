import type { ModuleFormConfig } from '../compiler';
import type { AdapterContext, ModuleConfigAdapter } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function assertModuleFormConfig(input: unknown): asserts input is ModuleFormConfig {
  if (!isRecord(input) || !Array.isArray(input.fields)) {
    throw new Error('ModuleConfigPassthroughAdapter: input must declare a fields array.');
  }

  input.fields.forEach((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`ModuleConfigPassthroughAdapter: item at index ${index} must be an object.`);
    }

    if (!isNonEmptyString(item.type)) {
      throw new Error(
        `ModuleConfigPassthroughAdapter: item at index ${index} must declare a non-empty type.`
      );
    }

    if (!isNonEmptyString(item.id)) {
      throw new Error(
        `ModuleConfigPassthroughAdapter: item at index ${index} must declare a non-empty id.`
      );
    }
  });

  if (input.groups !== undefined && !Array.isArray(input.groups)) {
    throw new Error('ModuleConfigPassthroughAdapter: groups must be an array.');
  }
}

export const ModuleConfigPassthroughAdapter: ModuleConfigAdapter<ModuleFormConfig> = {
  type: 'module-config',
  supports(input: unknown, _context: AdapterContext): input is ModuleFormConfig {
    return (
      isRecord(input) &&
      Array.isArray(input.fields) &&
      input.fields.every(
        (item) => isRecord(item) && isNonEmptyString(item.type) && isNonEmptyString(item.id)
      )
    );
  },
  adapt(input: ModuleFormConfig) {
    assertModuleFormConfig(input);
    return input;
  }
};
