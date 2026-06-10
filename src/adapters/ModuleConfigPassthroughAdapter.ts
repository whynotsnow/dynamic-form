import type { ModuleConfig } from '../compiler';
import type { AdapterContext, ModuleConfigAdapter } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function assertModuleConfigList(input: unknown): asserts input is ModuleConfig[] {
  if (!Array.isArray(input)) {
    throw new Error('ModuleConfigPassthroughAdapter: input must be a ModuleConfig array.');
  }

  input.forEach((item, index) => {
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
}

export const ModuleConfigPassthroughAdapter: ModuleConfigAdapter<ModuleConfig[]> = {
  type: 'module-config',
  supports(input: unknown, _context: AdapterContext): input is ModuleConfig[] {
    return (
      Array.isArray(input) &&
      input.every(
        (item) => isRecord(item) && isNonEmptyString(item.type) && isNonEmptyString(item.id)
      )
    );
  },
  adapt(input: ModuleConfig[]) {
    assertModuleConfigList(input);
    return input;
  }
};
