import type { CustomEffectResultHandler } from '@/consumer/effects';
import type { CSSProperties } from 'react';

type ChainedEffectItem = {
  type: string;
  value: CSSProperties | string | number | boolean | null | undefined;
};

type ConditionalDisplayValue = {
  condition: boolean | (() => boolean);
  fieldId?: string;
};

function isConditionalDisplayValue(value: unknown): value is ConditionalDisplayValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'condition' in value &&
    (typeof value.condition === 'boolean' || typeof value.condition === 'function')
  );
}

// 示例2: 条件显示处理器
export const conditionalDisplayHandler: CustomEffectResultHandler = {
  name: 'conditionalDisplay',
  description: '根据条件控制字段显示',
  canHandle: (key) => key === 'conditionalDisplay',
  validate: isConditionalDisplayValue,
  handle: (context, value) => {
    if (!isConditionalDisplayValue(value)) return;
    const { condition, fieldId } = value;
    const shouldShow = typeof condition === 'function' ? condition() : condition;

    const meta = { visible: shouldShow };

    if (fieldId) {
      context.updateFieldMetaById(fieldId, meta);
      return;
    }

    context.updateFieldMeta(meta);
  }
};

// 示例3: 数据转换处理器
export const dataTransformHandler: CustomEffectResultHandler = {
  name: 'dataTransform',
  description: '转换数据格式，将用户输入的年龄自动乘以2',
  canHandle: (key) => key === 'dataTransform',
  validate: (value) => value !== null && value !== undefined,
  handle: (context, value) => {
    // 数据转换逻辑：将用户输入的年龄乘以2
    let transformedValue = value;

    if (typeof value === 'number') {
      // 如果是数字，乘以2
      transformedValue = value * 2;
    } else if (typeof value === 'string') {
      // 如果是字符串，尝试转换为数字并乘以2
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        transformedValue = numValue * 2;
      } else {
        // 如果无法转换为数字，保持原值
        transformedValue = value;
      }
    }

    // 使用新的批量更新 API，确保更新立即生效
    context.setFieldValue(transformedValue);

    // console.log(`数据转换完成: ${context.fieldName}`, {
    //   original: value,
    //   transformed: transformedValue,
    //   operation: 'multiply by 2'
    // });
  }
};

// 示例4: 链式处理器
export const chainedHandler: CustomEffectResultHandler = {
  name: 'chained',
  description: '链式处理多个效果',
  canHandle: (key) => key === 'chained',
  validate: (value) => Array.isArray(value) && value.length > 0,
  handle: (context, value) => {
    // 执行多个处理器
    (value as ChainedEffectItem[]).forEach((item) => {
      // 根据 item 的类型执行不同的处理逻辑逻辑
      if (item.type === 'style') {
        context.updateFieldMeta({
          formItemProps: {
            style: item.value,
            className: 'chained-styled-field'
          }
        });
      } else if (item.type === 'transform') {
        context.setFieldValue(item.value);
      }
    });
  }
};

// 导出所有示例处理器
export const exampleHandlers = [conditionalDisplayHandler, dataTransformHandler, chainedHandler];
