/**
 * 结果处理器系统
 *
 * 统一处理 effect 和 initialValue 函数的返回值
 * 提供语义化的 effect 结果处理 API
 */

export { applyEffectResult } from './applyEffectResult';

export {
  getEffectResultHandlerRegistry,
  registerCustomEffectResultHandler,
  registerCustomEffectResultHandlers,
  unregisterEffectResultHandler,
  getAllEffectResultHandlers,
  getEffectResultHandlerInfo,
  hasEffectResultHandler
} from './handlerRegistry';

export { initializeEffectResultHandlers } from './initializeEffectResultHandlers';

export {
  createInitialEffectResultContext,
  createRuntimeEffectResultContext
} from './effectResultContext';

export type {
  EffectResult,
  EffectResultContext,
  EffectResultHandler,
  CustomEffectResultHandler,
  HandlerRegistrationOptions,
  InitConfig,
  InitResult
} from './types';
