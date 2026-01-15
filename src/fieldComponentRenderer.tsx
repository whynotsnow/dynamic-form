import React, { useMemo } from 'react';
import { Form } from 'antd';
import type { FieldRendererProps } from './types';
import { defaultRegistryManager } from './fieldComponentRegistry';
import { shallowEqual } from './utils/utils';
import { log, LogCategory } from './utils/logger';

const FieldComponentRenderer: React.FC<FieldRendererProps> = React.memo(
  function FieldRenderer({ field, form, componentRegistry, dynamicUIConfig }) {
    const baseFormItemProps = useMemo(
      () => ({
        label: field.label,
        name: field.id,
        rules: field.rules ?? [],
        required: (field?.rules || [])?.some((r) => 'required' in r && r.required === true) ?? false
      }),
      [field.label, field.id, field.rules]
    );
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
        ...(field.meta?.componentProps || {})
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
      dynamicUIConfig?.formItemProps
    ]);

    // 使用组件注册器获取组件
    const registry = componentRegistry || defaultRegistryManager;
    //OPTIMIZE  错误提示优化
    const Component = registry.getComponent(field.component);
    // 默认包裹了 Form.Item
    const wrapFormItem = Component?.wrapWithFormItem !== false;

    log.fieldRender(LogCategory.RENDER, field.id, field.component);

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
      log.info(LogCategory.PERFORMANCE_MONITOR, `字段 ${fieldId}: meta 属性变化，需要渲染`);
      return false;
    }

    // 字段值比较
    if (!shallowEqual(prevProps.fieldValue, nextProps.fieldValue)) {
      log.info(LogCategory.PERFORMANCE_MONITOR, `字段 ${fieldId}: 字段值变化，需要渲染`);
      return false;
    }

    // 所有检查都通过，可以跳过渲染
    log.info(LogCategory.PERFORMANCE_MONITOR, `字段 ${fieldId}: 跳过渲染`);
    return true;
  }
);

export default FieldComponentRenderer;
