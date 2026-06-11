import React, { useMemo } from 'react';
import { Form } from 'antd';
import type { FieldRendererProps } from '../../shared/types';
import { defaultRegistryManager } from './componentRegistry';
import { shallowEqual } from '../../shared/utils/utils';
import { resolveFieldRequired, resolveFieldRules } from './fieldValidation';

const FieldComponentRenderer: React.FC<FieldRendererProps> = React.memo(
  function FieldRenderer({ field, form, componentRegistry, dynamicUIConfig, runtimeCapability }) {
    const baseFormItemProps = useMemo(() => {
      const validatable = runtimeCapability?.validatable !== false;
      const rules = resolveFieldRules(field, validatable);

      return {
        label: field.label,
        name: field.id,
        rules,
        required: resolveFieldRequired(field, rules, validatable)
      };
    }, [field, runtimeCapability?.validatable]);
    // 解析字段级别配置
    const resolvedConfigs = useMemo(() => {
      // 合并 formItemProps（外层）
      const mergedFormItemProps = {
        ...baseFormItemProps,
        ...(field.formItemProps || {}),
        ...(dynamicUIConfig?.formItemProps || {}),
        ...(field.meta?.formItemProps || {})
      };

      // 合并 componentProps（内层）
      const mergedComponentProps = {
        ...(field.componentProps || {}),
        ...(field.meta?.componentProps || {}),
        ...(runtimeCapability?.disabled ? { disabled: true } : {}),
        ...(runtimeCapability?.readonly ? { readOnly: true } : {})
      };

      return {
        formItemProps: mergedFormItemProps,
        componentProps: mergedComponentProps
      };
    }, [
      baseFormItemProps,
      field.formItemProps,
      field.meta?.formItemProps,
      field.meta?.componentProps,
      field.componentProps,
      runtimeCapability?.disabled,
      runtimeCapability?.readonly,
      dynamicUIConfig?.formItemProps
    ]);

    // 使用组件注册器获取组件
    const registry = componentRegistry || defaultRegistryManager;
    //OPTIMIZE  错误提示优化
    const Component = registry.getComponent(field.component);
    if (!Component) return null;

    // 默认包裹了 Form.Item
    const wrapFormItem =
      (Component as typeof Component & { wrapWithFormItem?: boolean }).wrapWithFormItem !== false;

    console.log(`渲染字段 ${field.id} - 组件类型: ${field.component}`);

    if (wrapFormItem) {
      return (
        <Form.Item {...resolvedConfigs.formItemProps}>
          <Component field={field} form={form} {...resolvedConfigs.componentProps} />
        </Form.Item>
      );
    }
    return <Component field={field} form={form} {...resolvedConfigs} />;
  },
  (prevProps, nextProps) => {
    const fieldId = prevProps.field.id;
    // 字段配置比较
    const prevField = prevProps.field;
    const nextField = nextProps.field;

    // meta 属性深度比较 - 检测所有 meta 属性的变化
    if (!shallowEqual(prevField.meta, nextField.meta)) {
      console.log(`字段 ${fieldId}: meta 属性变化，需要渲染`);
      return false;
    }

    if (!shallowEqual(prevProps.runtimeCapability, nextProps.runtimeCapability)) {
      console.log(`字段 ${fieldId}: runtime 能力变化，需要渲染`);
      return false;
    }

    // 所有检查都通过，可以跳过渲染
    console.log(`字段 ${fieldId}: 跳过渲染`);
    return true;
  }
);

export default FieldComponentRenderer;
