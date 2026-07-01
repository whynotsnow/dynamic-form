import type { FormItemProps } from 'antd';
import type { FieldState, UIConfig } from '../types';

export function mergeUIConfig(baseConfig: UIConfig, patchConfig: UIConfig): UIConfig {
  const result = { ...baseConfig };

  (Object.keys(patchConfig) as (keyof UIConfig)[]).forEach((key) => {
    const value = patchConfig[key];
    Object.assign(result, {
      [key]:
        typeof value === 'object' && value !== null
          ? {
              ...((baseConfig[key] as object) || {}),
              ...value
            }
          : value
    });
  });

  return result;
}

export function resolveMergedFormItemProps({
  baseFormItemProps,
  field,
  staticUIConfig,
  dynamicUIConfig
}: {
  baseFormItemProps: FormItemProps;
  field: FieldState;
  staticUIConfig?: UIConfig;
  dynamicUIConfig?: UIConfig;
}): FormItemProps {
  return {
    ...baseFormItemProps,
    ...(staticUIConfig?.formItemProps || {}),
    ...(field.formItemProps || {}),
    ...(dynamicUIConfig?.formItemProps || {}),
    ...(field.meta?.formItemProps || {})
  };
}
