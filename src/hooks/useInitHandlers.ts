import { useState, useRef } from 'react';
import { init, InitConfig, InitResult } from '../resultProcessor';

/**
 * 处理器初始化 Hook
 *
 * 这个 Hook 用于在组件中管理处理器的初始化，提供：
 * 1. 自动初始化（仅执行一次）
 * 2. 初始化状态管理
 * 3. 错误处理
 * 4. 调试支持
 *
 * @param config 初始化配置
 * @returns 初始化状态和结果
 *
 * @example
 * ```typescript
 * const CustomHandlersDemo: React.FC = () => {
 *   const { isInitialized, initResult, error } = useInitHandlers({
 *     handlers: exampleHandlers,
 *     options: { override: false },
 *     debug: true
 *   });
 *
 *   if (!isInitialized) {
 *     return <div>正在初始化...</div>;
 *   }
 *
 *   if (error) {
 *     return <div>初始化失败: {error}</div>;
 *   }
 *
 *   return (
 *     <FormChainEffectEngineWrapper formConfig={formConfig}>
 *       <DynamicForm formConfig={formConfig} onSubmit={handleSubmit} />
 *     </FormChainEffectEngineWrapper>
 *   );
 * };
 * ```
 */
export function useInitHandlers(config: InitConfig) {
  const initResultRef = useRef<InitResult | null>(null);
  const isInitializingRef = useRef(false); // 跟踪初始化状态
  const [, triggerRender] = useState({}); // 用于强制重渲染

  // 同步初始化（仅在第一次渲染时执行）
  if (!initResultRef.current && !isInitializingRef.current) {
    isInitializingRef.current = true;
    try {
      initResultRef.current = init(config);
    } finally {
      isInitializingRef.current = false;
    }
  }

  // 检测错误的重复初始化尝试
  const initializationState = initResultRef.current
    ? 'initialized'
    : isInitializingRef.current
      ? 'initializing'
      : 'uninitialized';

  const reinitialize = () => {
    const result = init(config);
    initResultRef.current = result;
    triggerRender({});
    return result;
  };

  return {
    // 保持向后兼容
    isInitialized: initializationState === 'initialized',
    // 提供详细状态
    status: initializationState,
    initResult: initResultRef.current,
    success: initResultRef.current?.success ?? false,
    error: initResultRef.current?.error,
    message: initResultRef.current?.message,
    registeredCount: initResultRef.current?.registeredCount,
    registeredHandlers: initResultRef.current?.registeredHandlers,
    // 提供手动初始化方法
    reinitialize
  };
}
