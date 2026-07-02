import { getAllFieldIds } from './selectors';
import type { FormState } from '../shared/types';
import type { FieldCapability, GroupCapability, NodeCapability } from './types';
import { resolveFieldCapability, resolveGroupCapability } from './resolver';

export interface RuntimeState {
  fields: Record<string, FieldCapability>;

  groups: Record<string, GroupCapability>;

  containers: Record<string, GroupCapability>;

  nodes: Record<string, NodeCapability>;
}

export function resolveRuntimeState(state: FormState): RuntimeState {
  const fields: Record<string, FieldCapability> = {};

  getAllFieldIds(state).forEach((fieldId) => {
    fields[fieldId] = resolveFieldCapability(fieldId, state);
  });

  const groups: Record<string, GroupCapability> = {};

  Object.keys(state.configProcessInfo.containerRegistry).forEach((groupId) => {
    groups[groupId] = resolveGroupCapability(groupId, state);
  });

  const nodes: Record<string, NodeCapability> = {};
  Object.entries(fields).forEach(([id, capability]) => {
    nodes[id] = capability;
  });
  Object.entries(groups).forEach(([id, capability]) => {
    nodes[id] = capability;
  });

  return {
    fields,
    groups,
    containers: groups,
    nodes
  };
}
