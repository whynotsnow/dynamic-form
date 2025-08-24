import type { InitConfig, InitResult } from './types';
import { registerCustomEffectResultHandlers, getAllEffectResultHandlers } from './handlers';
import { getDefaultConfig } from '../config/defaultConfig';
import { log, LogCategory } from '../utils/logger';
import { markHandlersInitialized } from './handlers';

/**
 * 初始化结果处理器系统
 *
 * 这个函数负责：
 * 1. 配置校验和验证
 * 2. 注册默认处理器
 * 3. 注册用户自定义处理器
 * 4. 验证处理器配置
 * 5. 返回初始化结果
 *
 * @param config 初始化配置
 * @returns 初始化结果
 *
 * @example
 * ```typescript
 * const result = init({
 *   handlers: customHandlers,
 *   options: { override: false },
 *   debug: true
 * });
 *
 * if (result.success) {
 *   console.log(`成功注册 ${result.registeredCount} 个处理器`);
 * } else {
 *   console.error('初始化失败:', result.error);
 * }
 * ```
 */
export function init(config: InitConfig): InitResult {
  try {
    log.group(LogCategory.HANDLER_REGISTRATION, '初始化结果处理器系统', () => {
      log.info(LogCategory.HANDLER_REGISTRATION, '初始化配置:', config);
    });

    const defaultConfig = getDefaultConfig();
    const { handlers: customHandlers = [], options = {}, debug = false, enabled = true } = config;

    // 配置校验：检查是否启用
    if (!enabled) {
      log.info(LogCategory.HANDLER_REGISTRATION, '处理器系统已禁用');
      return {
        success: true,
        registeredCount: 0,
        registeredHandlers: [],
        message: '处理器系统已禁用'
      };
    }

    // 配置校验：验证自定义处理器配置
    if (customHandlers.length > 0) {
      const invalidHandlers = customHandlers.filter(
        (handler) => !handler.name || !handler.canHandle || !handler.handle
      );

      if (invalidHandlers.length > 0) {
        const errorMessage = `发现 ${invalidHandlers.length} 个无效的处理器配置: ${invalidHandlers
          .map((h) => h.name || 'unnamed')
          .join(', ')}`;

        log.error(LogCategory.HANDLER_REGISTRATION, '处理器配置验证失败:', errorMessage);

        return {
          success: false,
          error: new Error(errorMessage),
          registeredCount: 0,
          registeredHandlers: [],
          message: `初始化失败: ${errorMessage}`
        };
      }

      log.info(
        LogCategory.HANDLER_REGISTRATION,
        `验证通过 ${customHandlers.length} 个自定义处理器`
      );
    }

    // 注册默认处理器
    if (defaultConfig.enableDefaultHandlers && defaultConfig.baseHandlers) {
      log.group(LogCategory.HANDLER_REGISTRATION, '注册默认处理器', () => {
        defaultConfig.baseHandlers!.forEach((handler) => {
          log.info(LogCategory.HANDLER_REGISTRATION, `注册处理器: ${handler.name}`, {
            description: handler.description
          });
        });
      });

      registerCustomEffectResultHandlers(defaultConfig.baseHandlers, {
        ...defaultConfig.defaultHandlersOptions,
        ...options
      });
    }

    // 注册自定义处理器
    if (customHandlers.length > 0) {
      log.group(LogCategory.HANDLER_REGISTRATION, '注册自定义处理器', () => {
        customHandlers.forEach((handler) => {
          log.info(LogCategory.HANDLER_REGISTRATION, `注册处理器: ${handler.name}`, {
            description: handler.description
          });
        });
      });

      registerCustomEffectResultHandlers(customHandlers, options);
    }

    // 获取注册统计
    const allHandlers = getAllEffectResultHandlers();
    const registeredCount = allHandlers.length;

    // 标记初始化完成
    markHandlersInitialized();

    const result: InitResult = {
      success: true,
      registeredCount,
      registeredHandlers: allHandlers.map((h: any) => h.name),
      message: `成功注册 ${registeredCount} 个处理器`
    };

    log.group(LogCategory.HANDLER_REGISTRATION, '处理器初始化完成', () => {
      log.info(LogCategory.HANDLER_REGISTRATION, '初始化结果:', result);
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';

    log.error(LogCategory.HANDLER_REGISTRATION, '初始化失败:', errorMessage);

    return {
      success: false,
      error: new Error(errorMessage),
      registeredCount: 0,
      registeredHandlers: [],
      message: `初始化失败: ${errorMessage}`
    };
  }
}
