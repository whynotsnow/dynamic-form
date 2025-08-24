import type { FormInstance } from 'antd';
import type { Dispatch } from 'react';
import type {
  FormAction,
  ConfigProcessInfo,
  FieldMeta,
  FieldState,
  GroupFieldState,
  BaseFieldConfig,
  GroupField,
  UIConfig,
  FieldRegistry
} from '../types';

/**
 * 效果结果接口
 *
 * 定义 effect 和 initialValue 函数可以返回的结果格式
 */
export interface EffectResult {
  value?: any;
  visible?: boolean;
  disabled?: boolean;
  [key: string]: any;
}

/**
 * 结果处理上下文
 *
 * 提供语义化的 API 来处理字段和分组的更新操作
 * 支持运行时 effect 和初始值 initialValue 的统一处理
 *
 * ## 批量更新机制说明
 *
 * ### 为什么需要批量更新？
 * 1. **性能优化**: 避免多次 dispatch 调用，减少 React 重渲染
 * 2. **原子性**: 确保多个字段更新在同一批次中完成
 * 3. **一致性**: 避免中间状态导致的不一致问题
 *
 * ### 批量更新机制的工作原理：
 * 1. `addToUpdateQueue`: 将字段更新添加到待更新队列
 * 2. `batchDispatch`: 批量执行所有待更新的字段
 * 3. 优先使用批量更新，如果没有则回退到单个更新
 *
 * ### 没有批量更新的情况：
 * 1. **直接调用处理器**: 当处理器被直接调用时，可能没有 `addToUpdateQueue` 函数
 * 2. **外部调用**: 当从外部直接调用 `handleEffectResult` 时
 * 3. **测试环境**: 在单元测试中可能没有完整的上下文
 * 4. **自定义处理器**: 用户自定义的处理器可能没有批量更新支持
 *
 * ### 使用建议：
 * - 优先使用语义化的 API（`setFieldValue`, `updateFieldMeta`, `setGroupVisible`）
 * - 避免直接使用 `dispatch` 和 `addToUpdateQueue`
 * - 在自定义处理器中，系统会自动处理批量更新的回退逻辑
 */
export interface EffectResultContext {
  form: FormInstance;
  dispatch: Dispatch<FormAction>;
  fieldName: string;
  configProcessInfo?: ConfigProcessInfo;

  // 字段运行时信息
  isGroupField?: boolean;
  groupId?: string;

  // 语义化 API
  setFieldValue: (value: any, options?: { immediate?: boolean }) => void;
  setFieldValueBatch: (value: any) => void;
  updateFieldMeta: (meta: Partial<FieldMeta>) => void;
  updateFieldMetaBatch: (meta: Partial<FieldMeta>) => void;
  setGroupVisible: (groupKey: string, visible: boolean) => void;
  updateDynamicUIConfig: (dynamicUIConfig: UIConfig) => void;

  // 内部 API（可选暴露）
  batchDispatch?: () => void;
  addToUpdateQueue?: (type: 'values' | 'meta', payload: Record<string, any>) => void;
  hasPendingUpdates?: () => boolean;

  // 获取运行时字段状态
  getFieldState?: () => FieldState | GroupFieldState | undefined;
  getFieldMeta?: () => FieldMeta | undefined;
}

export interface ExportEffectContext {
  /** 当前字段名 */
  fieldName: string;

  /** 表单实例 */
  form: FormInstance;

  /** 安全获取完整字段配置（可能为 undefined，初始化阶段） */
  getField: () => BaseFieldConfig | GroupField | undefined;

  /** 设置字段值（立即更新或批量更新） */
  setFieldValue: (value: any, options?: { immediate?: boolean }) => void;

  /** 批量设置字段值 */
  setFieldValueBatch: (value: any) => void;

  /** 更新字段元数据 */
  updateFieldMeta: (meta: FieldMeta) => void;

  /** 批量更新字段元数据 */
  updateFieldMetaBatch: (meta: FieldMeta) => void;

  /** 设置分组可见性 */
  setGroupVisible: (groupKey: string, visible: boolean) => void;

  updateDynamicUIConfig: (dynamicUIConfig: UIConfig) => void;
}

/**
 * 基础结果处理器接口
 *
 * 定义了处理器的基本结构，包括名称、匹配逻辑和处理逻辑
 * 支持处理 effect 和 initialValue 的返回值
 */
export interface EffectResultHandler {
  /** 处理器名称，用于标识和调试 */
  name: string;

  /**
   * 判断是否能够处理指定的 key 和 value
   * @param key 要处理的键名
   * @param value 要处理的值
   * @returns 是否能够处理
   */
  canHandle: (key: string, value: any) => boolean;

  /**
   * 处理具体的逻辑
   * @param context 处理上下文，提供语义化的 API
   * @param value 要处理的值
   */
  handle: (context: ExportEffectContext, value: any) => void;
}

/**
 * 扩展的自定义结果处理器接口
 *
 * 在基础接口基础上增加了描述和验证功能，用于用户自定义处理器
 */
export interface CustomEffectResultHandler extends EffectResultHandler {
  /** 处理器描述，用于文档和调试 */
  description?: string;

  /**
   * 验证函数，用于验证输入值的有效性
   * @param value 要验证的值
   * @returns 是否有效
   */
  validate?: (value: any) => boolean;
}

/**
 * 处理器注册选项
 */
export interface HandlerRegistrationOptions {
  /** 同名时是否覆盖现有处理器，默认为 false */
  override?: boolean;
}

/**
 * 初始化配置接口
 */
export interface InitConfig {
  /** 是否启用处理器，默认为 true */
  enabled?: boolean;
  /** 要注册的处理器数组 */
  handlers?: CustomEffectResultHandler[];
  /** 注册选项 */
  options?: HandlerRegistrationOptions;
  /** 是否在控制台输出调试信息 */
  debug?: boolean;
  isInitialized?: boolean;
}

/**
 * 初始化结果接口
 */
export interface InitResult {
  isInitialized?: boolean;
  /** 是否成功 */
  success: boolean;
  /** 结果消息 */
  message: string;
  /** 注册的处理器数量 */
  registeredCount?: number;
  /** 错误详情（如果失败） */
  error?: Error;
  /** 已注册的处理器名称列表 */
  registeredHandlers?: string[];
}

export interface InitContextParams {
  fieldId: string;
  initialValues: Record<string, any>;
  initializedFields: Record<string, FieldState>;
  initializedGroupFields: Record<string, GroupFieldState>;
  fieldRegistry: Record<string, FieldRegistry>;
}
