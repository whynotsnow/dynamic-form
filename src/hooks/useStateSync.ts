import { useEffect, useRef, useCallback } from 'react';
import type { FormInstance } from 'antd';
import type { FormState, FormAction } from '../types';
import { log, LogCategory } from '../utils/logger';
import { getValueByPath, deepEqual, setValueByPath, deepMerge } from '../utils';

export interface UseFormSyncProps {
  form: FormInstance;
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
}

export interface SyncStoreStateToFormOptions {
  stateValues: Record<string, any>;
  initialized: boolean;
  form: FormInstance;
}

export function useStateSync({ form, state, dispatch }: UseFormSyncProps) {
  const pendingUpdatesRef = useRef<Record<string, any>>({});

  // 批量更新函数
  const batchDispatch = useCallback(() => {
    const updates = pendingUpdatesRef.current;
    if (Object.keys(updates).length === 0) return;

    log.info(LogCategory.EFFECT_RESULT, 'batchDispatch Run ', updates);

    // 分离值更新和元数据更新
    const valueUpdates = updates.values || {};
    const metaUpdates = updates.meta || {};

    // 调试：详细记录更新内容
    log.info(LogCategory.BATCH_UPDATE, '执行批量更新，详细数据:', {
      updates,
      valueUpdates,
      metaUpdates,
      currentState: state.fieldValues
    });

    dispatch({
      type: 'BATCH_UPDATE',
      payload: {
        values: valueUpdates,
        meta: metaUpdates
      }
    });

    // 清空待更新队列
    clearUpdateQueue();
  }, [dispatch]);

  // 清空队列函数（供外部调用）
  const clearUpdateQueue = useCallback(() => {
    pendingUpdatesRef.current = {};
  }, []);

  // OPTIMIZE  需要检查性能
  // 添加更新到队列
  const addToUpdateQueue = useCallback((key: string, value: any) => {
    if (key === 'values' || key === 'meta') {
      // 新的结构化方式
      if (!pendingUpdatesRef.current[key]) {
        pendingUpdatesRef.current[key] = {};
      }
      // 使用深合并代替浅合并
      deepMerge(pendingUpdatesRef.current[key], value);

      // 调试：记录添加到队列的内容
      log.info(LogCategory.BATCH_UPDATE, '添加到队列:', {
        key,
        value,
        currentQueue: pendingUpdatesRef.current
      });
    } else {
      // 向后兼容：直接设置值
      pendingUpdatesRef.current[key] = value;
    }
  }, []);

  // 检查是否有待更新的内容
  const hasPendingUpdates = useCallback(() => {
    return Object.keys(pendingUpdatesRef.current).length > 0;
  }, []);

  // 同步 React State 到 Form
  useEffect(() => {
    syncStoreStateToForm({
      stateValues: state.fieldValues,
      initialized: state.initialized,
      form
    });
  }, [state.fieldValues, state.initialized, form]);

  // OPTIMIZE  性能优化
  function syncStoreStateToForm({ stateValues, initialized, form }: SyncStoreStateToFormOptions) {
    if (!initialized) {
      log.debug(LogCategory.SYNC, '跳过同步：state 未初始化');
      return;
    }

    const formValues = form.getFieldsValue(true); // 获取表单的当前所有字段值
    const valuesToUpdate: Record<string, any> = {};
    let hasChanges = false;

    Object.entries(stateValues).forEach(([fieldPath, stateValue]) => {
      const formValue = getValueByPath(formValues, fieldPath);
      // 主要处理值类型的数据比较，对象类型默认需要同步
      if (!deepEqual(formValue, stateValue)) {
        setValueByPath(valuesToUpdate, fieldPath, stateValue);
        hasChanges = true;
        log.dataFlow(
          LogCategory.SYNC,
          `State(${JSON.stringify(stateValue)})`,
          `Form(${JSON.stringify(formValue)})`,
          fieldPath
        );
      }
    });

    if (hasChanges) {
      log.sync(LogCategory.SYNC, 'State→Form', valuesToUpdate);
      form.setFieldsValue(valuesToUpdate);
    } else {
      log.info(LogCategory.SYNC, '无需同步：所有值已一致');
    }
  }

  // 将表单值变化，同步到 React State
  const syncFormStateToStore = (
    changedValues: Record<string, any>,
    allValues: Record<string, any>
  ) => {
    // 收集所有需要更新的字段
    const updatedFields: string[] = [];
    Object.entries(changedValues).forEach(([fieldId, value]) => {
      const currentStateValue = state.fieldValues[fieldId];

      // 如果值发生了变化，则添加到更新队列,默认需要同步
      if (currentStateValue !== value) {
        log.dataFlow(LogCategory.SYNC, `Form(${value})`, `State(${currentStateValue})`, fieldId);

        const updatedFieldsValue = { [fieldId]: value };
        // 对象类型从allValue中获取所有值更新
        if (typeof value === 'object') {
          updatedFieldsValue[fieldId] = allValues[fieldId];
        }
        addToUpdateQueue('values', updatedFieldsValue);
        updatedFields.push(fieldId);
      }
    });

    if (updatedFields.length > 0) {
      log.info(LogCategory.BATCH_UPDATE, '执行表单值变化 导致的批量更新，字段:', updatedFields);
      // 执行批量更新
      batchDispatch();
    }
  };

  return {
    syncFormStateToStore,
    syncStoreStateToForm,
    batchDispatch,
    addToUpdateQueue,
    hasPendingUpdates,
    clearUpdateQueue
  };
}
