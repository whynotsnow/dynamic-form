import type { EffectResult, EffectResultContext, CustomEffectResultHandler } from './types';
import { log, LogCategory } from '../utils/logger';
import { getHandlers } from './handlers';

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
 * handleEffectResult(
 *   { value: 'new value', visible: false },
 *   context
 * );
 *
 * // 处理自定义处理器的结果
 * handleEffectResult(
 *   { customStyle: { bg: '#ff0000', textColor: 'white' } },
 *   context
 * );
 * ```
 */
export function handleEffectResult(result: EffectResult | undefined, context: EffectResultContext) {
  log.group(LogCategory.EFFECT_RESULT, 'handleEffectResult Run', () => {
    log.info(LogCategory.EFFECT_RESULT, 'handleEffectResult执行参数:', { result, context });
  });

  if (!result || typeof result !== 'object') {
    log.info(LogCategory.EFFECT_RESULT, '无有效返回值，跳过处理');
    return;
  }

  let hasValueUpdates = false;
  const handlers = getHandlers();
  // 收集未处理的键值对，用于调试和日志记录
  const unhandledEntries: [string, any][] = [];

  Object.entries(result).forEach(([key, value]) => {
    if (value === undefined) {
      log.info(LogCategory.EFFECT_RESULT, `跳过 undefined 值: ${key}`);
      return;
    }

    const handler = handlers.get(key) as CustomEffectResultHandler | undefined;
    if (handler && handler.canHandle(key, value)) {
      log.handlerExecution(
        LogCategory.HANDLER_EXECUTION,
        handler.name,
        'start',
        context.fieldName,
        value
      );

      // 执行验证（如果存在）
      if (handler.validate && !handler.validate(value)) {
        log.handlerValidation(
          LogCategory.HANDLER_VALIDATION,
          handler.name,
          'fail',
          '验证失败',
          value
        );
        return;
      }

      const exportContext = {
        fieldName: context.fieldName,
        form: context.form,
        setFieldValue: context.setFieldValue,
        setFieldValueBatch: context.setFieldValueBatch,
        updateFieldMeta: context.updateFieldMeta,
        updateFieldMetaBatch: context.updateFieldMetaBatch,
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

      // 检查是否有批量更新需要执行
      if (context.hasPendingUpdates && context.hasPendingUpdates()) {
        hasValueUpdates = true;
      }
    } else {
      // 记录未处理的键值对，用于调试
      unhandledEntries.push([key, value]);
    }
  });

  // 记录未处理的条目（仅在开发环境且启用调试时）
  if (unhandledEntries.length > 0) {
    const unhandledKeys = unhandledEntries.map(([key]) => key);
    log.warn(
      LogCategory.EFFECT_RESULT,
      `发现 ${unhandledEntries.length} 个没有匹配的handle处理器属性: ${unhandledKeys.join(', ')}`,
      {
        values: unhandledEntries.reduce(
          (acc, [key, value]) => {
            acc[key] = value;
            return acc;
          },
          {} as Record<string, any>
        )
      }
    );
  }

  if (hasValueUpdates && context.batchDispatch) {
    log.info(LogCategory.EFFECT_RESULT, '执行 Effect 导致的批量更新');
    context.batchDispatch();
  }
}
