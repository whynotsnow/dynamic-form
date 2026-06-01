/**
 * 结果处理器系统
 *
 * 统一处理 effect 和 initialValue 函数的返回值
 * 提供语义化的 effect 结果处理 API
 */

// 核心处理函数
export { handleEffectResult } from './core';

// 处理器管理
export {
  registerCustomEffectResultHandler,
  registerCustomEffectResultHandlers,
  unregisterEffectResultHandler,
  getAllEffectResultHandlers,
  getEffectResultHandlerInfo,
  hasEffectResultHandler
} from './handlers';

// 初始化系统
export { init } from './init';

// Effect context
export {
  createInitialEffectContext,
  createRuntimeEffectContext,
  createBatchUpdateContext,
  createEffectContext
} from './effectContext';

// 类型定义
export type {
  EffectResult,
  EffectResultContext,
  EffectResultHandler,
  CustomEffectResultHandler,
  HandlerRegistrationOptions,
  InitConfig,
  InitResult
} from './types';
