import type { CustomEffectResultHandler } from '../resultProcessor';

// 示例2: 条件显示处理器
export const conditionalDisplayHandler: CustomEffectResultHandler = {
  name: 'conditionalDisplay',
  description: '根据条件控制字段显示',
  canHandle: (key) => key === 'conditionalDisplay',
  validate: (value) => typeof value === 'object' && 'condition' in value,
  handle: (context, value) => {
    const { condition } = value;
    const shouldShow = typeof condition === 'function' ? condition() : condition;

    // 使用批量更新 API
    context.updateFieldMetaBatch({
      visible: shouldShow
    });
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

    // 使用语义化的 API 应用数据转换
    // log.info(
    //   LogCategory.EFFECT_RESULT,
    //   `准备设置字段值: ${context.fieldName} = ${transformedValue}`
    // );

    // 使用新的批量更新 API，确保更新立即生效
    context.setFieldValueBatch(transformedValue);

    // log.info(LogCategory.EFFECT_RESULT, `数据转换完成: ${context.fieldName}`, {
    //   original: value,
    //   transformed: transformedValue,
    //   operation: 'multiply by 2'
    // });
  }
};

// 示例4: 异步处理器（简化版本，避免在同步上下文中使用异步）
export const asyncHandler: CustomEffectResultHandler = {
  name: 'async',
  description: '异步处理数据（简化版本）',
  canHandle: (key) => key === 'async',
  validate: (value) => typeof value === 'object' && 'url' in value,
  handle: (context, value) => {
    // 简化版本：直接处理数据而不是真正的异步请求
    const { url, method = 'GET', body } = value;

    // 模拟异步处理结果
    const mockResult = {
      status: 'success',
      data: body || 'mock-data',
      url,
      method
    };

    // 使用语义化的 API 更新字段值
    context.setFieldValueBatch(mockResult);

    // log.info(LogCategory.EFFECT_RESULT, `异步处理完成: ${context.fieldName}`, mockResult);
  }
};

// 示例5: 链式处理器
export const chainedHandler: CustomEffectResultHandler = {
  name: 'chained',
  description: '链式处理多个效果',
  canHandle: (key) => key === 'chained',
  validate: (value) => Array.isArray(value) && value.length > 0,
  handle: (context, value) => {
    // 执行多个处理器
    value.forEach((item: { type: string; value: any }, index: number) => {
      // 根据 item 的类型执行不同的处理逻辑逻辑
      if (item.type === 'style') {
        context.updateFieldMeta({
          formItemProps: {
            style: item.value,
            className: 'chained-styled-field'
          }
        });
      } else if (item.type === 'transform') {
        context.setFieldValueBatch(item.value);
      }
    });
  }
};

// 导出所有示例处理器
export const exampleHandlers = [
  conditionalDisplayHandler,
  dataTransformHandler,
  asyncHandler,
  chainedHandler
];
