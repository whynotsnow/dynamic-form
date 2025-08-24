import type { CustomEffectResultHandler, HandlerRegistrationOptions } from './types';
import { getDefaultConfig } from '../../config/defaultConfig';

/**
 * 处理器注册表
 *
 * 使用 Map 结构存储所有已注册的处理器，支持快速查找
 */
const handlers = new Map<string, CustomEffectResultHandler>();

/**
 * 初始化状态跟踪
 */
let isInitialized = false;
let initializationCheckPerformed = false;
const initializationWarnings = new Set<string>();

/**
 * 获取处理器注册表
 * @returns 处理器注册表
 */
export function getHandlers(): Map<string, CustomEffectResultHandler> {
  return handlers;
}

/**
 * 标记处理器已初始化
 */
export function markHandlersInitialized() {
  isInitialized = true;
}

/**
 * 检查处理器是否已初始化
 */
export function isHandlersInitialized(): boolean {
  return isInitialized;
}

/**
 * 早期检测初始化状态
 * 在组件渲染前就检测，避免运行时才发现问题
 */
export function checkInitializationStatus() {
  if (initializationCheckPerformed) {
    return;
  }

  initializationCheckPerformed = true;

  if (!isInitialized) {
    const warningKey = 'initialization_warning';
    if (!initializationWarnings.has(warningKey)) {
      initializationWarnings.add(warningKey);
      console.warn(
        '⚠️ DynamicForm 警告: 检测到可能缺少 useInitHandlers 调用。\n' +
          '建议在组件顶层添加: const { isInitialized } = useInitHandlers(config);\n' +
          '这将确保默认处理器正确初始化。'
      );
    }
  }
}

/**
 * 获取未注册的保留关键字
 * 用于检测哪些默认处理器没有注册
 */
export function getUnregisteredReservedKeys(): string[] {
  const { reservedKeys } = getDefaultConfig();
  const registeredKeys = Array.from(handlers.keys());

  return Array.from(reservedKeys as Set<string>).filter((key) => !registeredKeys.includes(key));
}

/**
 * 注册单个自定义结果处理器
 *
 * @param handler 要注册的处理器
 * @param options 注册选项
 *
 * @throws {Error} 当处理器缺少必要属性时
 * @throws {Error} 当处理器已存在且未设置覆盖选项时
 *
 * @example
 * ```typescript
 * registerCustomEffectResultHandler({
 *   name: 'customStyle',
 *   description: '处理自定义样式',
 *   canHandle: (key) => key === 'customStyle',
 *   handle: (context, value) => {
 *     context.updateFieldMeta({ style: value });
 *   }
 * });
 * ```
 */
export function registerCustomEffectResultHandler(
  handler: CustomEffectResultHandler,
  options?: HandlerRegistrationOptions
) {
  const { override = false } = options || {};

  // 验证处理器
  if (!handler.name || !handler.canHandle || !handler.handle) {
    throw new Error('Invalid handler: missing required properties');
  }

  // 检查是否已存在
  if (handlers.has(handler.name) && !override) {
    throw new Error(`Handler '${handler.name}' already exists. Use override option to replace.`);
  }

  // 注册处理器
  handlers.set(handler.name, handler);

  // log.handlerRegistration(LogCategory.HANDLER_REGISTRATION, handler.name, handler.description);
}

/**
 * 批量注册自定义结果处理器
 *
 * @param handlers 要注册的处理器数组
 * @param options 注册选项
 *
 * @example
 * ```typescript
 * registerCustomEffectResultHandlers([
 *   customStyleHandler,
 *   dataTransformHandler,
 *   conditionalDisplayHandler
 * ], { override: false });
 * ```
 */
export function registerCustomEffectResultHandlers(
  handlerList: CustomEffectResultHandler[],
  options?: HandlerRegistrationOptions
) {
  const errors: string[] = [];

  for (const handler of handlerList) {
    try {
      registerCustomEffectResultHandler(handler, options);
    } catch (error) {
      // 如果是重复注册错误，根据选项决定是否忽略
      if (error instanceof Error && error.message.includes('already exists')) {
        if (options?.override) {
          // 如果允许覆盖，重新注册
          try {
            registerCustomEffectResultHandler(handler, { override: true });
          } catch (retryError) {
            errors.push(retryError instanceof Error ? retryError.message : '未知错误');
          }
        } else {
          // 如果不允许覆盖，记录错误但不抛出异常
          console.warn(`处理器 ${handler.name} 已存在，跳过注册`);
        }
      } else {
        errors.push(error instanceof Error ? error.message : '未知错误');
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`注册失败: ${errors.join(', ')}`);
  }
}

/**
 * 移除指定的结果处理器
 *
 * @param name 要移除的处理器名称
 *
 * @example
 * ```typescript
 * unregisterEffectResultHandler('customStyle');
 * ```
 */
export function unregisterEffectResultHandler(name: string) {
  handlers.delete(name);
}

/**
 * 获取所有已注册的结果处理器
 *
 * @returns 所有处理器的数组
 *
 * @example
 * ```typescript
 * const allHandlers = getAllEffectResultHandlers();
 * console.log('已注册的处理器:', allHandlers.map(h => h.name));
 * ```
 */
export function getAllEffectResultHandlers(): CustomEffectResultHandler[] {
  return Array.from(handlers.values()) as CustomEffectResultHandler[];
}

/**
 * 获取指定处理器的详细信息
 *
 * @param name 处理器名称
 * @returns 处理器信息，如果不存在则返回 undefined
 *
 * @example
 * ```typescript
 * const handler = getEffectResultHandlerInfo('customStyle');
 * if (handler) {
 *   console.log('处理器描述:', handler.description);
 * }
 * ```
 */
export function getEffectResultHandlerInfo(name: string): CustomEffectResultHandler | undefined {
  return handlers.get(name) as CustomEffectResultHandler | undefined;
}

/**
 * 检查指定处理器是否存在
 *
 * @param name 处理器名称
 * @returns 是否存在
 *
 * @example
 * ```typescript
 * if (hasEffectResultHandler('customStyle')) {
 *   console.log('customStyle 处理器已注册');
 * }
 * ```
 */
export function hasEffectResultHandler(name: string): boolean {
  return handlers.has(name);
}
