import { CustomEffectResultHandler } from '../consumer/effects';
import { isBoolean, isRecord } from '../shared/utils';

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
      context.setFieldValue(value);
    }
  },
  {
    name: 'visible',
    description: '处理字段可见性状态',
    canHandle: (key, value) => key === 'visible' && isBoolean(value),
    handle: (context, visible) => {
      if (!isBoolean(visible)) return;
      // 使用语义化的 API
      context.updateFieldMeta({ behavior: { visible } });
    }
  },
  {
    name: 'disabled',
    description: '处理字段禁用状态',
    canHandle: (key, value) => key === 'disabled' && isBoolean(value),
    handle: (context, disabled) => {
      if (!isBoolean(disabled)) return;
      // 使用语义化的 API
      context.updateFieldMeta({ behavior: { disabled } });
    }
  },
  {
    name: 'readonly',
    description: '处理字段只读状态',
    canHandle: (key, value) => key === 'readonly' && isBoolean(value),
    handle: (context, readonly) => {
      if (!isBoolean(readonly)) return;
      context.updateFieldMeta({ behavior: { readonly } });
    }
  },
  {
    name: 'groupsVisible',
    description: '处理分组可见性状态',
    canHandle: (key, value) => key === 'groupsVisible' && isRecord(value),
    handle: (context, groupsVisible) => {
      if (!isRecord(groupsVisible)) return;
      Object.entries(groupsVisible).forEach(([groupId, visible]) => {
        if (isBoolean(visible)) {
          context.setGroupVisible(groupId, visible);
        }
      });
    }
  },

  // 字段级别配置处理器
  {
    name: 'formItemProps',
    description: '处理Form.Item组件配置，存储到字段meta.formItemProps',
    canHandle: (key, value) => key === 'formItemProps' && isRecord(value),
    handle: (context, value) => {
      if (!isRecord(value)) return;
      context.updateFieldMeta({ formItemProps: value });
    }
  },
  // componentProps 承载内部组件属性，存储到 meta.componentProps
  {
    name: 'componentProps',
    description: '处理组件属性配置，合并存储到 meta.componentProps',
    canHandle: (key, value) => key === 'componentProps' && isRecord(value),
    handle: (context, value) => {
      if (!isRecord(value)) return;
      context.updateFieldMeta({
        componentProps: value
      });
    }
  },

  // 全局UIConfig配置处理器
  {
    name: 'formProps',
    description: '处理Form组件配置，存储到全局dynamicUIConfig',
    canHandle: (key, value) => key === 'formProps' && isRecord(value),
    handle: (context, value) => {
      if (!isRecord(value)) return;
      // 直接dispatch到store，更新全局配置
      context.updateDynamicUIConfig({ formProps: value });
    }
  },
  {
    name: 'buttonProps',
    description: '处理Button组件配置，存储到全局dynamicUIConfig',
    canHandle: (key, value) => key === 'buttonProps' && isRecord(value),
    handle: (context, value) => {
      if (!isRecord(value)) return;
      context.updateDynamicUIConfig({ buttonProps: value });
    }
  },
  {
    name: 'cardProps',
    description: '处理Card组件配置，存储到全局dynamicUIConfig',
    canHandle: (key, value) => key === 'cardProps' && isRecord(value),
    handle: (context, value) => {
      if (!isRecord(value)) return;
      context.updateDynamicUIConfig({ cardProps: value });
    }
  },
  {
    name: 'rowProps',
    description: '处理Row组件配置，存储到全局dynamicUIConfig',
    canHandle: (key, value) => key === 'rowProps' && isRecord(value),
    handle: (context, value) => {
      if (!isRecord(value)) return;
      context.updateDynamicUIConfig({ rowProps: value });
    }
  },
  {
    name: 'colProps',
    description: '处理Col组件配置，存储到全局dynamicUIConfig',
    canHandle: (key, value) => key === 'colProps' && isRecord(value),
    handle: (context, value) => {
      if (!isRecord(value)) return;
      context.updateDynamicUIConfig({ colProps: value });
    }
  },
  {
    name: 'submitAreaProps',
    description: '处理提交区域配置，存储到全局dynamicUIConfig',
    canHandle: (key, value) => key === 'submitAreaProps' && isRecord(value),
    handle: (context, value) => {
      if (!isRecord(value)) return;
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
