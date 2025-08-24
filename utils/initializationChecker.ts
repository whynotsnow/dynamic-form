import { isHandlersInitialized, getUnregisteredReservedKeys } from '../resultProcessor/handlers';
import { getDefaultConfig } from '../config/defaultConfig';
import { log, LogCategory } from './logger';
/**
 * 初始化检测器
 * 用于在组件渲染前检测初始化状态和潜在问题
 */
export class InitializationChecker {
  private static instance: InitializationChecker;
  private hasWarned = false;
  private constructor() {
    // 私有构造函数，防止外部实例化
  }
  static getInstance(): InitializationChecker {
    if (!InitializationChecker.instance) {
      InitializationChecker.instance = new InitializationChecker();
    }
    return InitializationChecker.instance;
  }
  /**
   * 执行完整的初始化状态检测
   */
  checkInitializationStatus(): {
    isInitialized: boolean;
    missingHandlers: string[];
    warnings: string[];
    recommendations: string[];
  } {
    // 移除缓存机制，每次都重新检测
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // 检查基本初始化状态
    const isInitialized = isHandlersInitialized();
    if (!isInitialized && !this.hasWarned) {
      warnings.push('检测到处理器系统未初始化');
      recommendations.push('在组件顶层添加 useInitHandlers 调用');
      this.hasWarned = true;
    }

    // 检查缺失的默认处理器
    const missingHandlers = getUnregisteredReservedKeys();
    if (missingHandlers.length > 0) {
      warnings.push(
        `发现 ${missingHandlers.length} 个未注册的默认处理器: ${missingHandlers.join(', ')}`
      );
      recommendations.push('确保在 useInitHandlers 中正确配置了默认处理器');
    }

    // 检查配置状态
    const defaultConfig = getDefaultConfig();
    if (!defaultConfig.enableDefaultHandlers) {
      warnings.push('默认处理器已被禁用，这可能导致某些功能不可用');
      recommendations.push('考虑启用默认处理器或确保自定义处理器覆盖了所有必要功能');
    }

    const result = {
      isInitialized,
      missingHandlers,
      warnings,
      recommendations
    };

    // 记录检测结果
    log.group(LogCategory.HANDLER_REGISTRATION, '初始化状态检测', () => {
      log.info(LogCategory.HANDLER_REGISTRATION, '检测结果:', result);

      if (warnings.length > 0) {
        log.warn(LogCategory.HANDLER_REGISTRATION, '发现的问题:', warnings);
        log.info(LogCategory.HANDLER_REGISTRATION, '建议:', recommendations);
      }
    });

    return result;
  }

  /**
   * 重置检测状态（主要用于测试）
   */
  reset() {
    this.hasWarned = false;
  }

  /**
   * 获取初始化状态摘要
   */
  getStatusSummary(): string {
    const result = this.checkInitializationStatusSilent();

    if (result.isInitialized && result.warnings.length === 0) {
      return '✅ 处理器系统初始化正常';
    }

    const issues = result.warnings.length;
    const missing = result.missingHandlers.length;

    return `⚠️ 发现 ${issues} 个问题，${missing} 个缺失处理器`;
  }

  /**
   * 静默检查初始化状态（不输出日志）
   */
  checkInitializationStatusSilent(): {
    isInitialized: boolean;
    missingHandlers: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // 检查基本初始化状态
    const isInitialized = isHandlersInitialized();
    if (!isInitialized && !this.hasWarned) {
      warnings.push('检测到处理器系统未初始化');
      recommendations.push('在组件顶层添加 useInitHandlers 调用');
      this.hasWarned = true;
    }

    // 检查缺失的默认处理器
    const missingHandlers = getUnregisteredReservedKeys();
    if (missingHandlers.length > 0) {
      warnings.push(
        `发现 ${missingHandlers.length} 个未注册的默认处理器: ${missingHandlers.join(', ')}`
      );
      recommendations.push('确保在 useInitHandlers 中正确配置了默认处理器');
    }

    // 检查配置状态
    const defaultConfig = getDefaultConfig();
    if (!defaultConfig.enableDefaultHandlers) {
      warnings.push('默认处理器已被禁用，这可能导致某些功能不可用');
      recommendations.push('考虑启用默认处理器或确保自定义处理器覆盖了所有必要功能');
    }

    return {
      isInitialized,
      missingHandlers,
      warnings,
      recommendations
    };
  }
}

/**
 * 便捷函数：检查初始化状态
 */
export function checkInitialization(): ReturnType<
  InitializationChecker['checkInitializationStatus']
> {
  return InitializationChecker.getInstance().checkInitializationStatus();
}

/**
 * 便捷函数：获取状态摘要
 */
export function getInitializationSummary(): string {
  return InitializationChecker.getInstance().getStatusSummary();
}

/**
 * 静默检查初始化状态（不输出日志）
 */
export function checkInitializationSilent(): ReturnType<
  InitializationChecker['checkInitializationStatusSilent']
> {
  return InitializationChecker.getInstance().checkInitializationStatusSilent();
}
