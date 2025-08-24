import type {
  FormConfig,
  BaseFieldConfig,
  GroupField,
  FieldState,
  GroupFieldState,
  Fieldchain,
  FieldRegistry,
  GroupedFormConfig,
  FlatFormConfig
} from '../types';
import type { ConfigAnalysisResult, ConfigProcessInfo, HydratedConfigResult } from './types';
import { isGroupedConfig } from '../utils/utils';
import { log, LogCategory } from '../utils/logger';
import { handleEffectResult } from '../resultProcessor';
import { createBatchUpdateContext } from '../resultProcessor/batchUpdate';

/**
 * 分析表单配置，生成 effectMap 和 fieldRegistry
 *
 * @param config 原始表单配置
 * @returns 分析结果，只包含 effectMap 和 fieldRegistry
 */
export function analyzeFormConfig(config: FormConfig): ConfigAnalysisResult {
  const effectMap: Record<string, Fieldchain> = {};
  const fieldRegistry: Record<string, FieldRegistry> = {};

  if (isGroupedConfig(config)) {
    (config as GroupedFormConfig).groups.forEach((group) => {
      const groupKey = group.id;

      // 注册分组
      fieldRegistry[groupKey] = { id: groupKey, isGroupField: true, config: group };

      // 分组 effectMap 条目
      if (group.effect || group.dependents) {
        effectMap[groupKey] = {
          effect: group.effect || (() => undefined),
          dependents: group.dependents || []
        };
      }

      // 注册分组下字段
      group.fields.forEach((field) => {
        fieldRegistry[field.id] = {
          id: field.id,
          isGroupField: true,
          groupId: groupKey,
          config: field
        };
        effectMap[field.id] = {
          effect: field.effect || (() => undefined),
          dependents: field.dependents || []
        };
      });
    });
  } else {
    ((config as FlatFormConfig).fields || []).forEach((field) => {
      fieldRegistry[field.id] = { id: field.id, isGroupField: false, config: field };
      effectMap[field.id] = {
        effect: field.effect || (() => undefined),
        dependents: field.dependents || []
      };
    });
  }

  return { effectMap, fieldRegistry };
}

/**
 * 根据分析结果和原始配置计算初始值和字段状态
 *
 * 负责：
 * 1. 构建 initialValues
 * 2. 初始化字段状态 initializedFields / initializedGroupFields
 * 3. 支持静态与函数形式初始值
 *
 * @param analysisConfig analyzeFormConfig 的返回结果
 * @returns 带初始值和状态的完整配置
 */
export function hydrateFormConfig(analysisConfig: ConfigAnalysisResult): HydratedConfigResult {
  const { fieldRegistry } = analysisConfig;
  const initialValues: Record<string, any> = {};
  const initializedFields: Record<string, FieldState> = {};
  const initializedGroupFields: Record<string, GroupFieldState> = {};

  const processInitialValueResult = (field: BaseFieldConfig, result: any, groupId?: string) => {
    if (!result || typeof result !== 'object') {
      initialValues[field.id] = result;
      log.initialValue(LogCategory.INITIAL_VALUE, field.id, result, 'function');
      return;
    }

    const context = createBatchUpdateContext({
      fieldId: field.id,
      initialValues,
      initializedFields,
      initializedGroupFields,
      fieldRegistry
    });

    handleEffectResult(result, context);
  };

  const processField = (field: BaseFieldConfig, groupId?: string) => {
    // 初始化字段状态
    const fieldState: FieldState = {
      ...field,
      meta: { visible: field.initialVisible !== false }
    };

    if (groupId) {
      // 分组字段
      if (!initializedGroupFields[groupId]) {
        log.error(LogCategory.INITIAL_VALUE, `hydrateFormConfig: 找不到分组 ${groupId}`);
        return;
      }
      initializedGroupFields[groupId].fields = initializedGroupFields[groupId].fields || {};
      initializedGroupFields[groupId].fields[field.id] = fieldState;
    } else {
      initializedFields[field.id] = fieldState;
    }

    // 处理静态初始值
    if (field.initialValue !== undefined && typeof field.initialValue !== 'function') {
      initialValues[field.id] = field.initialValue;
      log.initialValue(LogCategory.INITIAL_VALUE, field.id, field.initialValue, 'static');
    }

    // 处理函数初始值
    if (typeof field.initialValue === 'function') {
      try {
        log.initialValueProcess(LogCategory.INITIAL_VALUE, field.id, initialValues);
        const result = field.initialValue(initialValues);
        processInitialValueResult(field, result, groupId);
      } catch (error) {
        log.error(LogCategory.INITIAL_VALUE, `计算字段 ${field.id} 的函数初始值时出错:`, error);
      }
    }
  };

  // 遍历 fieldRegistry 初始化字段状态与初始值
  Object.values(fieldRegistry).forEach(({ config: fieldConfig, isGroupField }) => {
    if (!isGroupField) {
      processField(fieldConfig as BaseFieldConfig);
    } else if ((fieldConfig as GroupField).fields) {
      const group = fieldConfig as GroupField;
      initializedGroupFields[group.id] = {
        ...group,
        meta: { visible: group.initialVisible !== false },
        fields: {}
      };
      group.fields.forEach((f) => processField(f, group.id));
    }
  });

  log.group(LogCategory.INITIAL_VALUE, '初始值计算完成', () => {
    log.info(LogCategory.INITIAL_VALUE, 'initialValues:', initialValues);
  });

  return {
    initialValues,
    initializedFields,
    initializedGroupFields
  };
}

/**
 * 外部统一调用函数
 *
 * @param config 原始表单配置
 * @returns 完整的预计算表单信息（含 effectMap、fieldRegistry、初始值等）
 */
export function processFormConfig(config: FormConfig): ConfigProcessInfo {
  const analysis = analyzeFormConfig(config);
  const hydrated = hydrateFormConfig(analysis);

  return {
    ...analysis,
    ...hydrated
  };
}
