import type { FieldState } from '../../shared/types';

export function resolveFieldParticipationPolicy(
  field: Pick<FieldState, 'preserveValueOnHide' | 'restoreValueOnShow'>
) {
  return {
    preserveValueOnHide: field.preserveValueOnHide === true,
    restoreValueOnShow: field.restoreValueOnShow !== false
  };
}
