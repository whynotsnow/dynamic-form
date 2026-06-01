// 统一的日志管理工具

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export enum LogCategory {
  // 核心流程
  INIT = 'INIT',
  RENDER = 'RENDER',
  SYNC = 'SYNC',
  UPDATE = 'UPDATE',

  // 表单相关
  FORM = 'FORM',
  FIELD = 'FIELD',
  VALIDATION = 'VALIDATION',

  // 初始值计算相关
  INITIAL_VALUE = 'INITIAL_VALUE',

  // Effect 相关
  EFFECT = 'EFFECT',
  EFFECT_CHAIN = 'EFFECT_CHAIN',
  EFFECT_RESULT = 'EFFECT_RESULT',

  // 处理器生命周期相关
  HANDLER_LIFECYCLE = 'HANDLER_LIFECYCLE',
  HANDLER_REGISTRATION = 'HANDLER_REGISTRATION',
  HANDLER_EXECUTION = 'HANDLER_EXECUTION',
  HANDLER_VALIDATION = 'HANDLER_VALIDATION',

  // 性能相关
  PERFORMANCE = 'PERFORMANCE',
  STORE_UPDATE = 'STORE_UPDATE',
  PERFORMANCE_MONITOR = 'PERFORMANCE_MONITOR',

  // 调试相关
  DEBUG = 'DEBUG',
  STATE = 'STATE',
  DATA_FLOW = 'DATA_FLOW'
}

interface LoggerConfig {
  level: LogLevel;
  enabledCategories: Set<LogCategory>;
  showTimestamp: boolean;
  showCategory: boolean;
  showLevel: boolean;
}

class Logger {
  private config: LoggerConfig = {
    level: LogLevel.INFO,
    enabledCategories: new Set([
      // LogCategory.RENDER,
      // LogCategory.HANDLER_LIFECYCLE,
      // LogCategory.HANDLER_REGISTRATION,
      // LogCategory.HANDLER_EXECUTION,
      // LogCategory.HANDLER_VALIDATION
    ]),
    showTimestamp: true,
    showCategory: true,
    showLevel: false
  };
  private configShown = false;

  // 设置日志级别
  setLevel(level: LogLevel) {
    this.config.level = level;
  }

  // 启用/禁用特定分类
  enableCategory(category: LogCategory) {
    this.config.enabledCategories.add(category);
  }

  disableCategory(category: LogCategory) {
    this.config.enabledCategories.delete(category);
  }

  // 启用/禁用多个分类
  enableCategories(categories: LogCategory[]) {
    categories.forEach((cat) => this.config.enabledCategories.add(cat));
  }

  disableCategories(categories: LogCategory[]) {
    categories.forEach((cat) => this.config.enabledCategories.delete(cat));
  }

  // 设置显示选项
  setDisplayOptions(options: Partial<LoggerConfig>) {
    Object.assign(this.config, options);
  }

  // 获取当前启用的分类
  getEnabledCategories(): LogCategory[] {
    return Array.from(this.config.enabledCategories);
  }

  // 显示当前日志配置
  showCurrentConfig() {
    const enabledCategories = this.getEnabledCategories().join(', ');
    const configInfo = [
      `级别: ${LogLevel[this.config.level]}`,
      `分类: [${enabledCategories}]`,
      `时间戳: ${this.config.showTimestamp ? '✓' : '✗'}`,
      `分类标签: ${this.config.showCategory ? '✓' : '✗'}`,
      `级别标签: ${this.config.showLevel ? '✓' : '✗'}`
    ].join(' | ');

    console.log(`🔧 日志配置: ${configInfo}`);
  }

  // 重置配置显示状态，下次输出日志时会重新显示配置
  resetConfigDisplay() {
    this.configShown = false;
  }

  // 主动显示当前配置（用于应用启动时）
  showConfigOnStartup() {
    if (this.config.enabledCategories.size > 0) {
      this.showCurrentConfig();
      this.configShown = true;
    }
  }

  // 格式化日志前缀
  private formatPrefix(level: LogLevel, category: LogCategory): string {
    const parts: string[] = [];

    if (this.config.showTimestamp) {
      parts.push(new Date().toLocaleTimeString());
    }

    if (this.config.showLevel) {
      parts.push(`[${LogLevel[level]}]`);
    }

    if (this.config.showCategory) {
      // 为不同分类添加不同的图标
      const categoryIcon = this.getCategoryIcon(category);
      parts.push(`${categoryIcon} [${category}]`);
    }

    return parts.join(' ');
  }

  // 获取分类图标
  private getCategoryIcon(category: LogCategory): string {
    const iconMap: Record<LogCategory, string> = {
      [LogCategory.INIT]: '🚀',
      [LogCategory.RENDER]: '🎨',
      [LogCategory.SYNC]: '🔄',
      [LogCategory.UPDATE]: '📝',
      [LogCategory.FORM]: '📋',
      [LogCategory.FIELD]: '🏷️',
      [LogCategory.VALIDATION]: '✅',
      [LogCategory.INITIAL_VALUE]: '💡',
      [LogCategory.EFFECT]: '⚡',
      [LogCategory.EFFECT_CHAIN]: '🔗',
      [LogCategory.EFFECT_RESULT]: '🎯',
      [LogCategory.HANDLER_LIFECYCLE]: '🔧',
      [LogCategory.HANDLER_REGISTRATION]: '📝',
      [LogCategory.HANDLER_EXECUTION]: '⚙️',
      [LogCategory.HANDLER_VALIDATION]: '🔍',
      [LogCategory.PERFORMANCE]: '⚡',
      [LogCategory.STORE_UPDATE]: '🧭',
      [LogCategory.PERFORMANCE_MONITOR]: '📊',
      [LogCategory.DEBUG]: '🐛',
      [LogCategory.STATE]: '💾',
      [LogCategory.DATA_FLOW]: '🌊'
    };
    return iconMap[category] || '📄';
  }

  // 检查是否应该输出日志
  private shouldLog(level: LogLevel, category: LogCategory): boolean {
    return level >= this.config.level && this.config.enabledCategories.has(category);
  }

  // 日志输出方法
  private log(level: LogLevel, category: LogCategory, message: string, ...args: any[]) {
    if (!this.shouldLog(level, category)) return;

    // 在第一次输出日志之前显示配置
    if (!this.configShown && this.config.enabledCategories.size > 0) {
      this.showCurrentConfig();
      this.configShown = true;
      // 在配置信息后添加一个空行，让日志更清晰
      console.log('');
    }

    const prefix = this.formatPrefix(level, category);
    const fullMessage = `${prefix} ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(fullMessage, ...args);
        break;
      case LogLevel.INFO:
        console.info(fullMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(fullMessage, ...args);
        break;
      case LogLevel.ERROR:
        console.error(fullMessage, ...args);
        break;
    }
  }

  // 便捷方法
  debug(category: LogCategory, message: string, ...args: any[]) {
    this.log(LogLevel.DEBUG, category, message, ...args);
  }

  info(category: LogCategory, message: string, ...args: any[]) {
    this.log(LogLevel.INFO, category, message, ...args);
  }

  warn(category: LogCategory, message: string, ...args: any[]) {
    this.log(LogLevel.WARN, category, message, ...args);
  }

  error(category: LogCategory, message: string, ...args: any[]) {
    this.log(LogLevel.ERROR, category, message, ...args);
  }

  // 分组日志
  group(category: LogCategory, title: string, fn: () => void) {
    if (!this.shouldLog(LogLevel.INFO, category)) return;

    const prefix = this.formatPrefix(LogLevel.INFO, category);
    console.group(`${prefix} ${title}`);
    fn();
    console.groupEnd();
  }

  // 表格日志
  table(category: LogCategory, data: any, title?: string) {
    if (!this.shouldLog(LogLevel.INFO, category)) return;

    const prefix = this.formatPrefix(LogLevel.INFO, category);
    if (title) {
      console.log(`${prefix} ${title}`);
    }
    console.table(data);
  }

  // 状态日志
  state(category: LogCategory, stateName: string, state: any) {
    this.info(category, `${stateName}:`, state);
  }

  // 数据流日志
  dataFlow(category: LogCategory, from: string, to: string, data: any) {
    this.info(category, `${from} → ${to}:`, data);
  }

  // 性能日志
  performance(category: LogCategory, operation: string, duration: number) {
    this.info(category, `⚡ ${operation}: ${duration.toFixed(2)}ms`);
  }

  // Effect 日志
  effect(category: LogCategory, fieldName: string, value: any, result?: any) {
    if (result) {
      this.info(category, `Effect 【${fieldName}】字段：【${value}】 → ${JSON.stringify(result)}`);
    } else {
      this.info(category, `Effect 【${fieldName}】字段: 【${value}】`);
    }
  }

  // 字段渲染日志
  fieldRender(category: LogCategory, fieldId: string, componentType: string) {
    this.info(category, `🎨 渲染字段 ${fieldId} - 组件类型: ${componentType}`);
  }

  // 初始值计算日志
  initialValue(
    category: LogCategory,
    fieldId: string,
    value: any,
    type:
      | 'static'
      | 'function'
      | 'effect'
      | 'function-value'
      | 'function-visible'
      | 'function-disabled'
      | 'function-groupVisible'
      | 'function-other'
      | 'function-simple'
  ) {
    const typeText: Record<string, string> = {
      static: '静态初始值',
      function: '函数计算初始值',
      effect: 'Effect计算初始值',
      'function-value': '函数计算-值',
      'function-visible': '函数计算-可见性',
      'function-disabled': '函数计算-禁用状态',
      'function-groupVisible': '函数计算-分组可见性',
      'function-other': '函数计算-其他属性',
      'function-simple': '函数计算-简单值'
    };
    this.info(category, `字段 ${fieldId} ${typeText[type]}: ${value}`);
  }

  // 初始值计算过程日志
  initialValueProcess(category: LogCategory, fieldId: string, allValues: Record<string, any>) {
    this.info(category, `计算字段 ${fieldId} 的初始值`);
  }

  // 初始值最终结果日志
  initialValueResult(category: LogCategory, finalValues: Record<string, any>) {
    this.info(category, `最终初始值结果:`, finalValues);
  }

  // 同步日志
  sync(category: LogCategory, direction: 'Form→State' | 'State→Form', changes: any) {
    const directionIcon = direction === 'Form→State' ? '📤' : '📥';
    this.info(category, `${directionIcon} ${direction} 同步:`, changes);
  }

  // 性能监控日志
  performanceMonitor(
    category: LogCategory,
    operation: 'enable' | 'disable' | 'start' | 'end' | 'skip' | 'report' | 'compare',
    fieldId?: string,
    data?: any
  ) {
    const operationIcon: Record<string, string> = {
      enable: '🟢',
      disable: '🔴',
      start: '▶️',
      end: '⏹️',
      skip: '⏭️',
      report: '📊',
      compare: '⚖️'
    };

    const operationText: Record<string, string> = {
      enable: '启用性能监控',
      disable: '禁用性能监控',
      start: '开始渲染',
      end: '渲染完成',
      skip: '跳过渲染',
      report: '性能报告',
      compare: '性能对比'
    };

    const icon = operationIcon[operation];
    const text = operationText[operation];

    if (fieldId) {
      this.info(category, `${icon} ${text} - 字段: ${fieldId}`, data);
    } else {
      this.info(category, `${icon} ${text}`, data);
    }
  }

  // 渲染性能日志
  renderPerformance(
    category: LogCategory,
    fieldId: string,
    operation: 'start' | 'end' | 'skip',
    duration?: number
  ) {
    const operationIcon: Record<string, string> = {
      start: '▶️',
      end: '⏹️',
      skip: '⏭️'
    };

    const operationText: Record<string, string> = {
      start: '开始渲染',
      end: '渲染完成',
      skip: '跳过渲染'
    };

    const icon = operationIcon[operation];
    const text = operationText[operation];

    if (duration !== undefined) {
      this.info(category, `${icon} 字段 ${fieldId} ${text}，耗时: ${duration.toFixed(2)}ms`);
    } else {
      this.info(category, `${icon} 字段 ${fieldId} ${text}`);
    }
  }

  // 性能报告日志
  performanceReport(
    category: LogCategory,
    metrics: {
      renderCount: number;
      skippedRenders: number;
      renderTime: number;
      optimizationRate: number;
      avgRenderTime: number;
      totalFields: number;
      duration: number;
    }
  ) {
    this.group(category, '🚀 渲染性能监控报告', () => {
      this.info(category, `⏱️  监控时长: ${metrics.duration}ms`);
      this.info(category, `📈 总渲染次数: ${metrics.renderCount}`);
      this.info(category, `⏭️  跳过渲染次数: ${metrics.skippedRenders}`);
      this.info(category, `📊 优化率: ${metrics.optimizationRate.toFixed(2)}%`);
      this.info(category, `⚡ 平均渲染时间: ${metrics.avgRenderTime.toFixed(2)}ms`);
      this.info(category, `📋 总字段数: ${metrics.totalFields}`);
    });
  }

  // 字段性能详情日志
  fieldPerformanceDetails(
    category: LogCategory,
    fieldMetrics: Record<string, { renderCount: number; skippedCount: number }>
  ) {
    this.group(category, '📊 字段详情', () => {
      Object.entries(fieldMetrics).forEach(([fieldId, metrics]) => {
        const renderIcon = metrics.renderCount > 0 ? '🎨' : '⚪';
        const skipIcon = metrics.skippedCount > 0 ? '⏭️' : '⚪';
        this.info(
          category,
          `${fieldId}: ${renderIcon}渲染${metrics.renderCount}次 ${skipIcon}跳过${metrics.skippedCount}次`
        );
      });
    });
  }

  // 处理器生命周期相关日志方法
  handlerRegistration(
    category: LogCategory,
    handlerName: string,
    description?: string,
    metadata?: Record<string, any>
  ) {
    this.info(category, `注册处理器: ${handlerName}`, {
      description,
      ...metadata
    });
  }

  handlerExecution(
    category: LogCategory,
    handlerName: string,
    operation: 'start' | 'end' | 'skip' | 'error',
    fieldName?: string,
    data?: any
  ) {
    const operationText = {
      start: '开始执行',
      end: '执行完成',
      skip: '跳过执行',
      error: '执行错误'
    }[operation];

    this.info(category, `${operationText}处理器: ${handlerName}`, {
      fieldName,
      data
    });
  }

  handlerValidation(
    category: LogCategory,
    handlerName: string,
    validation: 'pass' | 'fail' | 'skip',
    reason?: string,
    data?: any
  ) {
    const validationText = {
      pass: '验证通过',
      fail: '验证失败',
      skip: '跳过验证'
    }[validation];

    this.info(category, `${validationText}处理器: ${handlerName}`, {
      reason,
      data
    });
  }

  handlerLifecycle(
    category: LogCategory,
    handlerName: string,
    lifecycle: 'register' | 'unregister' | 'update' | 'init' | 'cleanup',
    metadata?: Record<string, any>
  ) {
    const lifecycleText = {
      register: '注册',
      unregister: '注销',
      update: '更新',
      init: '初始化',
      cleanup: '清理'
    }[lifecycle];

    this.info(category, `${lifecycleText}处理器: ${handlerName}`, metadata);
  }
}

// 创建全局日志实例
export const logger = new Logger();

// 预设的日志配置
export const LogPresets = {
  // 只显示核心流程
  CORE_ONLY: () => {
    logger.enableCategories([
      LogCategory.INIT,
      LogCategory.RENDER,
      LogCategory.SYNC,
      LogCategory.UPDATE
    ]);
  },

  // 显示初始值计算
  INITIAL_VALUE_FOCUS: () => {
    logger.enableCategories([LogCategory.INIT, LogCategory.INITIAL_VALUE]);
  },

  // 显示表单相关
  FORM_FOCUS: () => {
    logger.enableCategories([
      LogCategory.FORM,
      LogCategory.FIELD,
      LogCategory.VALIDATION,
      LogCategory.SYNC
    ]);
  },

  // 显示 Effect 相关
  EFFECT_FOCUS: () => {
    logger.enableCategories([
      LogCategory.EFFECT,
      LogCategory.EFFECT_CHAIN,
      LogCategory.EFFECT_RESULT
    ]);
  },

  // 显示处理器生命周期相关
  HANDLER_FOCUS: () => {
    logger.enableCategories([
      LogCategory.HANDLER_LIFECYCLE,
      LogCategory.HANDLER_REGISTRATION,
      LogCategory.HANDLER_EXECUTION,
      LogCategory.HANDLER_VALIDATION
    ]);
  },

  // 显示性能相关
  PERFORMANCE_FOCUS: () => {
    logger.enableCategories([
      LogCategory.PERFORMANCE,
      LogCategory.STORE_UPDATE,
      LogCategory.PERFORMANCE_MONITOR
    ]);
  },

  // 显示性能监控相关
  PERFORMANCE_MONITOR_FOCUS: () => {
    logger.enableCategories([LogCategory.PERFORMANCE_MONITOR, LogCategory.PERFORMANCE]);
  },

  // 显示所有日志
  ALL: () => {
    logger.enableCategories(Object.values(LogCategory));
  },

  // 静默模式
  SILENT: () => {
    logger.disableCategories(Object.values(LogCategory));
  }
};

// 便捷的日志方法
export const log = {
  debug: (category: LogCategory, message: string, ...args: any[]) =>
    logger.debug(category, message, ...args),

  info: (category: LogCategory, message: string, ...args: any[]) =>
    logger.info(category, message, ...args),

  warn: (category: LogCategory, message: string, ...args: any[]) =>
    logger.warn(category, message, ...args),

  error: (category: LogCategory, message: string, ...args: any[]) =>
    logger.error(category, message, ...args),

  group: (category: LogCategory, title: string, fn: () => void) =>
    logger.group(category, title, fn),

  table: (category: LogCategory, data: any, title?: string) => logger.table(category, data, title),

  state: (category: LogCategory, stateName: string, state: any) =>
    logger.state(category, stateName, state),

  dataFlow: (category: LogCategory, from: string, to: string, data: any) =>
    logger.dataFlow(category, from, to, data),

  performance: (category: LogCategory, operation: string, duration: number) =>
    logger.performance(category, operation, duration),

  effect: (category: LogCategory, fieldName: string, value: any, result?: any) =>
    logger.effect(category, fieldName, value, result),

  fieldRender: (category: LogCategory, fieldId: string, componentType: string) =>
    logger.fieldRender(category, fieldId, componentType),

  initialValue: (
    category: LogCategory,
    fieldId: string,
    value: any,
    type: 'static' | 'function' | 'effect'
  ) => logger.initialValue(category, fieldId, value, type),

  initialValueProcess: (category: LogCategory, fieldId: string, allValues: Record<string, any>) =>
    logger.initialValueProcess(category, fieldId, allValues),

  initialValueResult: (category: LogCategory, finalValues: Record<string, any>) =>
    logger.initialValueResult(category, finalValues),

  sync: (category: LogCategory, direction: 'Form→State' | 'State→Form', changes: any) =>
    logger.sync(category, direction, changes),

  // 性能监控相关
  performanceMonitor: (
    category: LogCategory,
    operation: 'enable' | 'disable' | 'start' | 'end' | 'skip' | 'report' | 'compare',
    fieldId?: string,
    data?: any
  ) => logger.performanceMonitor(category, operation, fieldId, data),

  renderPerformance: (
    category: LogCategory,
    fieldId: string,
    operation: 'start' | 'end' | 'skip',
    duration?: number
  ) => logger.renderPerformance(category, fieldId, operation, duration),

  performanceReport: (
    category: LogCategory,
    metrics: {
      renderCount: number;
      skippedRenders: number;
      renderTime: number;
      optimizationRate: number;
      avgRenderTime: number;
      totalFields: number;
      duration: number;
    }
  ) => logger.performanceReport(category, metrics),

  fieldPerformanceDetails: (
    category: LogCategory,
    fieldMetrics: Record<string, { renderCount: number; skippedCount: number }>
  ) => logger.fieldPerformanceDetails(category, fieldMetrics),

  // 处理器生命周期相关便捷方法
  handlerRegistration: (
    category: LogCategory,
    handlerName: string,
    description?: string,
    metadata?: Record<string, any>
  ) => logger.handlerRegistration(category, handlerName, description, metadata),

  handlerExecution: (
    category: LogCategory,
    handlerName: string,
    operation: 'start' | 'end' | 'skip' | 'error',
    fieldName?: string,
    data?: any
  ) => logger.handlerExecution(category, handlerName, operation, fieldName, data),

  handlerValidation: (
    category: LogCategory,
    handlerName: string,
    validation: 'pass' | 'fail' | 'skip',
    reason?: string,
    data?: any
  ) => logger.handlerValidation(category, handlerName, validation, reason, data),

  handlerLifecycle: (
    category: LogCategory,
    handlerName: string,
    lifecycle: 'register' | 'unregister' | 'update' | 'init' | 'cleanup',
    metadata?: Record<string, any>
  ) => logger.handlerLifecycle(category, handlerName, lifecycle, metadata),

  // 配置相关
  getEnabledCategories: () => logger.getEnabledCategories(),
  showCurrentConfig: () => logger.showCurrentConfig(),
  resetConfigDisplay: () => logger.resetConfigDisplay(),
  showConfigOnStartup: () => logger.showConfigOnStartup()
};
