import { useMemo } from 'react';

import type { FormState } from '../shared/types';

import { resolveRuntimeState } from './runtimeState';

export function useRuntimeState(state: FormState) {
  return useMemo(() => resolveRuntimeState(state), [state]);
}
