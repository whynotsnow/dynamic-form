import type React from 'react';
import type { BaseFieldConfig, EffectFn, FieldComponentProps } from '../shared/types';
import type { DeclarativeRule } from '../rules';

export interface FieldModule<TOptions extends Record<string, unknown> = Record<string, unknown>> {
  type: string;
  component?: React.ComponentType<FieldComponentProps>;
  createConfig?: (options?: TOptions) => BaseFieldConfig;
  dependencies?: string[];
  effect?: EffectFn;
  rules?: DeclarativeRule[];
  defaultProps?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ModuleRegistryRegisterOptions {
  override?: boolean;
}
