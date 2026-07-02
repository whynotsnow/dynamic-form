import type { DynamicFormRendererAdapter } from '../../shared/types';

const RENDERER_ADAPTER_METHODS = [
  'renderForm',
  'renderFieldItem',
  'renderFieldsLayout',
  'renderFieldLayout',
  'renderGroup',
  'renderRepeatable',
  'renderSubmit'
] as const;

export function assertRendererAdapter(
  renderer: unknown
): asserts renderer is DynamicFormRendererAdapter {
  const missingMethods =
    renderer && typeof renderer === 'object'
      ? RENDERER_ADAPTER_METHODS.filter(
          (method) => typeof (renderer as Record<string, unknown>)[method] !== 'function'
        )
      : [...RENDERER_ADAPTER_METHODS];

  if (missingMethods.length > 0) {
    throw new Error(
      `DynamicForm renderer is invalid: missing methods ${missingMethods.join(', ')}.`
    );
  }
}
