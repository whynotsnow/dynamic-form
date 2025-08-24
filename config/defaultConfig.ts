import { CustomEffectResultHandler } from '@/resultProcessor';
import { log, LogCategory } from '../src/utils/logger';

/**
 * DynamicForm 默认配置接口
 */
export interface DynamicFormDefaultConfig {
  /** 默认处理器列表 */
  baseHandlers?: CustomEffectResultHandler[];
  // 定义保留关键字列表
  reservedKeys: Set<string>;

  /** 是否启用默认处理器，默认为 true */
  enableDefaultHandlers?: boolean;

  /** 默认处理器注册选项 */
  defaultHandlersOptions?: {
    override?: boolean;
  };

  /** 是否启用调试模式，默认为 false */
  debug?: boolean;
}

/**
 * 基础处理器定义
 */
const baseHandlers: CustomEffectResultHandler[] = [
  {
    name: 'value',
    description: '处理字段值的更新，支持批量更新机制',
    canHandle: (key) => key === 'value',
    handle: (context, value) => {
      log.effect(LogCategory.EFFECT_RESULT, 'valueHandle', context.fieldName, value);

      // 使用批量更新 API，不立即执行，让 handleEffectResult 统一处理
      context.setFieldValueBatch(value);
    }
  },
  {
    name: 'visible',
    description: '处理字段可见性状态',
    canHandle: (key) => key === 'visible',
    handle: (context, visible) => {
      // 使用语义化的 API
      context.updateFieldMeta({ visible });
    }
  },
  {
    name: 'disabled',
    description: '处理字段禁用状态',
    canHandle: (key) => key === 'disabled',
    handle: (context, disabled) => {
      // 使用语义化的 API
      context.updateFieldMeta({ componentProps: { disabled } });
    }
  },
  {
    name: 'groupsVisible',
    description: '处理分组可见性状态',
    canHandle: (key) => key === 'groupsVisible',
    handle: (context, groupsVisible) => {
      Object.entries(groupsVisible).forEach(([groupId, visible]) => {
        context.setGroupVisible(groupId, visible as boolean);
      });
    }
  },

  // 字段级别配置处理器
  {
    name: 'formItemProps',
    description: '处理Form.Item组件配置，存储到字段meta.formItemProps',
    canHandle: (key) => key === 'formItemProps',
    handle: (context, value) => {
      log.effect(LogCategory.EFFECT_RESULT, 'formItemPropsHandle ', context.fieldName, value);

      context.updateFieldMetaBatch({ formItemProps: value });
    }
  },
  // componentProps 承载内部组件属性，存储到 meta.componentProps
  {
    name: 'componentProps',
    description: '处理组件属性配置，合并存储到 meta.componentProps',
    canHandle: (key) => key === 'componentProps',
    handle: (context, value) => {
      log.effect(LogCategory.EFFECT_RESULT, 'componentProps', context.fieldName, value);
      context.updateFieldMetaBatch({
        componentProps: value
      });
    }
  },

  // 全局UIConfig配置处理器
  {
    name: 'formProps',
    description: '处理Form组件配置，存储到全局dynamicUIConfig',
    canHandle: (key) => key === 'formProps',
    handle: (context, value) => {
      log.effect(LogCategory.EFFECT_RESULT, 'formProps handle Run ', context.fieldName, value);
      // 直接dispatch到store，更新全局配置
      context.updateDynamicUIConfig({ formProps: value });
    }
  },
  {
    name: 'buttonProps',
    description: '处理Button组件配置，存储到全局dynamicUIConfig',
    canHandle: (key) => key === 'buttonProps',
    handle: (context, value) => {
      log.effect(LogCategory.EFFECT_RESULT, 'buttonProps handle Run ', context.fieldName, value);
      context.updateDynamicUIConfig({ buttonProps: value });
    }
  },
  {
    name: 'cardProps',
    description: '处理Card组件配置，存储到全局dynamicUIConfig',
    canHandle: (key) => key === 'cardProps',
    handle: (context, value) => {
      log.effect(LogCategory.EFFECT_RESULT, 'cardProps handle Run ', context.fieldName, value);
      context.updateDynamicUIConfig({ cardProps: value });
    }
  },
  {
    name: 'rowProps',
    description: '处理Row组件配置，存储到全局dynamicUIConfig',
    canHandle: (key) => key === 'rowProps',
    handle: (context, value) => {
      log.effect(LogCategory.EFFECT_RESULT, 'rowProps handle Run ', context.fieldName, value);
      context.updateDynamicUIConfig({ rowProps: value });
    }
  },
  {
    name: 'colProps',
    description: '处理Col组件配置，存储到全局dynamicUIConfig',
    canHandle: (key) => key === 'colProps',
    handle: (context, value) => {
      log.effect(LogCategory.EFFECT_RESULT, 'colProps handle Run ', context.fieldName, value);
      context.updateDynamicUIConfig({ colProps: value });
    }
  },
  {
    name: 'submitAreaProps',
    description: '处理提交区域配置，存储到全局dynamicUIConfig',
    canHandle: (key) => key === 'submitAreaProps',
    handle: (context, value) => {
      log.effect(
        LogCategory.EFFECT_RESULT,
        'submitAreaProps handle Run ',
        context.fieldName,
        value
      );
      context.updateDynamicUIConfig({ submitAreaProps: value });
    }
  }
];
/**
 * 默认配置
 */
export const defaultConfig: DynamicFormDefaultConfig = {
  baseHandlers,
  reservedKeys: new Set(baseHandlers.map((i) => i.name)),
  enableDefaultHandlers: true,
  defaultHandlersOptions: {
    override: false
  },
  debug: false
};

/**
 * 配置管理器
 */
class ConfigManager {
  private config: DynamicFormDefaultConfig = { ...defaultConfig };

  /**
   * 设置配置
   */
  setConfig(newConfig: Partial<DynamicFormDefaultConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取配置
   */
  getConfig(): DynamicFormDefaultConfig {
    return { ...this.config };
  }

  /**
   * 获取特定配置项
   */
  get<K extends keyof DynamicFormDefaultConfig>(key: K): DynamicFormDefaultConfig[K] {
    return this.config[key];
  }

  /**
   * 重置为默认配置
   */
  reset() {
    this.config = { ...defaultConfig };
  }

  /**
   * 合并配置
   */
  mergeConfig(userConfig: Partial<DynamicFormDefaultConfig>) {
    this.config = { ...this.config, ...userConfig };
  }
}

// 创建全局配置管理器实例
export const configManager = new ConfigManager();

/**
 * 设置全局默认配置
 */
export function setDefaultConfig(config: Partial<DynamicFormDefaultConfig>) {
  configManager.setConfig(config);
}

/**
 * 获取全局默认配置
 */
export function getDefaultConfig(): DynamicFormDefaultConfig {
  return configManager.getConfig();
}

/**
 * 重置为默认配置
 */
export function resetDefaultConfig() {
  configManager.reset();
}
