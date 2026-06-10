import type React from 'react';
import type { EffectFn } from 'form-chain-effect-engine';
import type { BaseFieldConfig, FieldComponentProps } from '../shared/types';
import type { DeclarativeRule } from '../rules';

export interface FieldModule {
  type: string;
  component?: React.ComponentType<FieldComponentProps>;
  createConfig?: (options?: Record<string, unknown>) => BaseFieldConfig;
  dependencies?: string[];
  effect?: EffectFn;
  rules?: DeclarativeRule[];
  defaultProps?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ModuleRegistryRegisterOptions {
  override?: boolean;
}
