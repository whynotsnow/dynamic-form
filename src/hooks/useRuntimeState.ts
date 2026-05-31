import { useMemo } from 'react';

import type { FormState } from '../types';

import { resolveRuntimeState } from '../runtime';

export function useRuntimeState(state: FormState) {
  return useMemo(() => resolveRuntimeState(state), [state]);
}
