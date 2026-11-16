import type React from 'react';
import type { SelectProps } from 'antd';
import type { FieldComponentProps } from '@/exports';

export type DemoComponentProps = {
  min?: number;
  max?: number;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  options?: SelectProps['options'];
  unit?: React.ReactNode;
};

export const getDemoComponentProps = (field: FieldComponentProps['field']): DemoComponentProps => {
  return (field.componentProps ?? {}) as DemoComponentProps;
};
