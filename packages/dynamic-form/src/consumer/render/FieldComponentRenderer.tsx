import React, { useMemo } from 'react';
import { Form } from 'antd';
import type { FieldRendererProps } from '../../shared/types';
import { defaultRegistryManager } from './componentRegistry';
import { shallowEqual } from '../../shared/utils/utils';
import { resolveFieldRequired, resolveFieldRules } from './fieldValidation';
import { getFieldName } from '../../shared/utils';
import { resolveMergedFormItemProps } from '../../shared/utils/uiConfig';

const FieldComponentRenderer: React.FC<FieldRendererProps> = React.memo(
  function FieldRenderer({
    field,
    form,
    formAdapter,
    componentRegistry,
    staticUIConfig,
    dynamicUIConfig,
    runtimeCapability,
    name
  }) {
    const baseFormItemProps = useMemo(() => {
      const validatable = runtimeCapability?.validatable !== false;
      const rules = resolveFieldRules(field, validatable);

      return {
        label: field.label,
        name: name ?? getFieldName(field),
        rules,
        required: resolveFieldRequired(field, rules, validatable)
      };
    }, [field, name, runtimeCapability?.validatable]);
    // 解析字段级别配置
    const resolvedConfigs = useMemo(() => {
      const mergedFormItemProps = resolveMergedFormItemProps({
        baseFormItemProps,
        field,
        staticUIConfig,
        dynamicUIConfig
      });

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
      field,
      runtimeCapability?.disabled,
      runtimeCapability?.readonly,
      staticUIConfig,
      dynamicUIConfig
    ]);

    // 使用组件注册器获取组件
    const registry = componentRegistry || defaultRegistryManager;
    //OPTIMIZE  错误提示优化
    const Component = registry.getComponent(field.component);
    if (!Component) return null;

    // 默认包裹了 Form.Item
    const wrapFormItem =
      (Component as typeof Component & { wrapWithFormItem?: boolean }).wrapWithFormItem !== false;

    if (wrapFormItem) {
      return (
        <Form.Item {...resolvedConfigs.formItemProps}>
          <Component
            field={field}
            form={form}
            formAdapter={formAdapter}
            {...resolvedConfigs.componentProps}
          />
        </Form.Item>
      );
    }
    return <Component field={field} form={form} formAdapter={formAdapter} {...resolvedConfigs} />;
  },
  (prevProps, nextProps) => {
    // 字段配置比较
    const prevField = prevProps.field;
    const nextField = nextProps.field;

    // meta 属性深度比较 - 检测所有 meta 属性的变化
    if (!shallowEqual(prevField.meta, nextField.meta)) {
      return false;
    }

    if (!shallowEqual(prevField.formItemProps, nextField.formItemProps)) {
      return false;
    }

    if (!shallowEqual(prevField.componentProps, nextField.componentProps)) {
      return false;
    }

    if (!shallowEqual(prevProps.runtimeCapability, nextProps.runtimeCapability)) {
      return false;
    }

    if (
      !shallowEqual(
        prevProps.staticUIConfig?.formItemProps,
        nextProps.staticUIConfig?.formItemProps
      )
    ) {
      return false;
    }

    if (
      !shallowEqual(
        prevProps.dynamicUIConfig?.formItemProps,
        nextProps.dynamicUIConfig?.formItemProps
      )
    ) {
      return false;
    }

    // 所有检查都通过，可以跳过渲染
    return true;
  }
);

export default FieldComponentRenderer;
