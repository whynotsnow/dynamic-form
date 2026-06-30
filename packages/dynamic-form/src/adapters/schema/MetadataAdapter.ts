import type { AdapterContext, ModuleConfigAdapter } from '../types';
import type { MetadataAdapterInput } from './types';
import { isRecord } from './utils';

function isMetadataAdapterInput(input: unknown): input is MetadataAdapterInput {
  return (
    isRecord(input) &&
    Array.isArray(input.fields) &&
    input.fields.every(
      (field) =>
        isRecord(field) &&
        typeof field.id === 'string' &&
        field.id.trim().length > 0 &&
        typeof field.type === 'string' &&
        field.type.trim().length > 0
    )
  );
}

export const MetadataAdapter: ModuleConfigAdapter<MetadataAdapterInput> = {
  type: 'metadata',
  supports(input: unknown, _context: AdapterContext): input is MetadataAdapterInput {
    return isMetadataAdapterInput(input);
  },
  adapt(input: MetadataAdapterInput) {
    return {
      ...(input.id !== undefined ? { id: input.id } : {}),
      fields: input.fields.map((field) => ({
        type: field.type,
        id: field.id,
        ...(field.groupId ? { groupId: field.groupId } : {}),
        options: field.options,
        rules: field.rules,
        overrides:
          field.name !== undefined
            ? {
                name: field.name,
                ...(field.overrides || {})
              }
            : field.overrides
      })),
      ...(input.groups ? { groups: input.groups } : {})
    };
  }
};
