import type { FieldCapability, GroupCapability, RuntimeState } from '@whynotsnow/dynamic-form';

const fieldCapability: FieldCapability = {
  rendered: true,
  submitable: true,
  editable: true,
  readonly: false,
  disabled: false,
  validatable: true
};

const groupCapability: GroupCapability = {
  rendered: true
};

export const runtimeState: RuntimeState = {
  fields: {
    name: fieldCapability
  },
  groups: {
    profile: groupCapability
  }
};
