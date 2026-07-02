import type { FieldCapability } from './types';
import type { RuntimeState } from './runtimeState';

export function getFieldRuntimeSnapshot(
  runtimeState: RuntimeState,
  fieldId: string
): FieldCapability | undefined {
  return runtimeState.fields[fieldId];
}

export function getRenderedFieldIds(runtimeState: RuntimeState): string[] {
  return Object.entries(runtimeState.fields)
    .filter(([, capability]) => capability.rendered === true)
    .map(([fieldId]) => fieldId);
}

export function getSubmitableFieldIds(runtimeState: RuntimeState): string[] {
  return Object.entries(runtimeState.fields)
    .filter(([, capability]) => capability.submitable === true)
    .map(([fieldId]) => fieldId);
}

export function getValidatableFieldIds(runtimeState: RuntimeState): string[] {
  return Object.entries(runtimeState.fields)
    .filter(([, capability]) => capability.validatable === true)
    .map(([fieldId]) => fieldId);
}
