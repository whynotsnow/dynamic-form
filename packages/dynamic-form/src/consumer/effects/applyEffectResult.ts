import type { EffectResult, EffectResultContext, CustomEffectResultHandler } from './types';
import { getEffectResultHandlerRegistry, isEffectResultDebugEnabled } from './handlerRegistry';

/**
 * 处理结果的核心函数
 *
 * 这个函数是结果处理系统的核心，负责：
 * 1. 解析 effect 或 initialValue 返回的结果对象
 * 2. 根据 key 查找对应的处理器
 * 3. 执行处理器的处理逻辑
 * 4. 支持批量更新机制以优化性能
 *
 * @param result 效果返回的结果对象
 * @param context 处理上下文，提供语义化的 API
 *
 * @example
 * ```typescript
 * // 处理单个字段的效果结果
 * applyEffectResult(
 *   { value: 'new value', visible: false },
 *   context
 * );
 *
 * // 处理自定义处理器的结果
 * applyEffectResult(
 *   { customStyle: { bg: '#ff0000', textColor: 'white' } },
 *   context
 * );
 * ```
 */
export function applyEffectResult(result: EffectResult | undefined, context: EffectResultContext) {
  if (!result || typeof result !== 'object') {
    return;
  }

  const handlers = getEffectResultHandlerRegistry();
  // 收集未处理的键值对，用于调试和日志记录
  const unhandledEntries: [string, unknown][] = [];

  Object.entries(result).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    const handler = handlers.get(key) as CustomEffectResultHandler | undefined;
    if (handler && handler.canHandle(key, value)) {
      // 执行验证（如果存在）
      if (handler.validate && !handler.validate(value)) {
        console.warn(`验证失败处理器: ${handler.name}`, {
          reason: '验证失败',
          data: value
        });
        return;
      }

      const exportContext = {
        fieldName: context.fieldName,
        form: context.form,
        formAdapter: context.formAdapter,
        setFieldValue: context.setFieldValue,
        updateFieldMeta: context.updateFieldMeta,
        updateFieldMetaById: context.updateFieldMetaById,
        setGroupVisible: context.setGroupVisible,
        updateDynamicUIConfig: context.updateDynamicUIConfig,
        getField: () => {
          const registry = context.configProcessInfo?.fieldRegistry;
          if (!registry) return undefined; // 初始化阶段可能为空
          return registry[context.fieldName]?.config;
        }
      };

      // 统一处理所有处理器
      handler.handle(exportContext, value);
    } else {
      // 记录未处理的键值对，用于调试
      unhandledEntries.push([key, value]);
    }
  });

  // 记录未处理的条目（仅在开发环境且启用调试时）
  if (unhandledEntries.length > 0 && isEffectResultDebugEnabled()) {
    const unhandledKeys = unhandledEntries.map(([key]) => key);
    console.warn(
      `发现 ${unhandledEntries.length} 个没有匹配的handle处理器属性: ${unhandledKeys.join(', ')}`,
      {
        values: unhandledEntries.reduce(
          (acc, [key, value]) => {
            acc[key] = value;
            return acc;
          },
          {} as Record<string, unknown>
        )
      }
    );
  }
}
