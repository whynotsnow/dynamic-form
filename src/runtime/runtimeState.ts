import { getAllFieldIds } from '@/runtime/selectors';
import type { FormState } from '../types';
import type { FieldCapability, GroupCapability } from './types';
import { resolveFieldCapability, resolveGroupCapability } from '@/runtime/resolver';

export interface RuntimeState {
  fields: Record<string, FieldCapability>;

  groups: Record<string, GroupCapability>;
}

export function resolveRuntimeState(state: FormState): RuntimeState {
  const fields: Record<string, FieldCapability> = {};

  getAllFieldIds(state).forEach((fieldId) => {
    fields[fieldId] = resolveFieldCapability(fieldId, state);
  });

  const groups: Record<string, GroupCapability> = {};

  Object.keys(state.groupFields).forEach((groupId) => {
    groups[groupId] = resolveGroupCapability(groupId, state);
  });

  return {
    fields,
    groups
  };
}
