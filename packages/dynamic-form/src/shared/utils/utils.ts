import type {
  FieldBehaviorMeta,
  FieldMeta,
  FormConfig,
  GroupBehaviorMeta,
  GroupMeta
} from '../types';
import { isRecord, type UnknownRecord } from './is';

// 浅比较
export function shallowEqual(objA: unknown, objB: unknown) {
  if (objA === objB) return true;

  if (!isRecord(objA) || !isRecord(objB)) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    if (objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}

export function isGroupedConfig(config: FormConfig) {
  return config && typeof config === 'object' && 'groups' in config;
}

/**
 * mergeIntoDraft 设计约定：
 * - object：deep merge
 * - array：整体 replace（不做 index merge）
 *
 * 如需支持结构级数组 diff，必须使用 keyed array
 */
export function mergeIntoDraft(draft: unknown, source: unknown) {
  if (Array.isArray(source)) {
    if (!Array.isArray(draft)) return;
    draft.length = 0;
    source.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        const next = Array.isArray(item) ? [] : {};
        mergeIntoDraft(next, item);
        draft.push(next);
      } else {
        draft.push(item);
      }
    });
    return;
  }
  if (isRecord(source) && isRecord(draft)) {
    Object.entries(source).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        if (!draft[key]) draft[key] = Array.isArray(value) ? [] : {};
        mergeIntoDraft(draft[key], value);
      } else {
        draft[key] = value;
      }
    });
  }
}

export function arraysEqual<T>(a: T[], b: T[]) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

// 原生实现 get，支持类似 "projects[0].members[1].name" 路径
export function getValueByPath<T = unknown>(obj: unknown, path: string): T | undefined {
  if (!obj || !path) return undefined;
  // 把类似 'projects[0].members[1].name' 转成 ['projects', '0', 'members', '1', 'name']
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let cur = obj;
  for (const key of keys) {
    if (cur == null) return undefined;
    if (!isRecord(cur) && !Array.isArray(cur)) return undefined;
    cur = Array.isArray(cur) ? cur[Number(key)] : cur[key];
  }
  return cur as T;
}

// 原生实现 set，支持嵌套路径，自动创建对象/数组
export function setValueByPath(obj: unknown, path: string, value: unknown) {
  if (!isRecord(obj) || !path) return;
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let cur: UnknownRecord | unknown[] = obj;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (i === keys.length - 1) {
      if (Array.isArray(cur)) {
        cur[Number(key)] = value;
      } else {
        cur[key] = value;
      }
    } else {
      const next = Array.isArray(cur) ? cur[Number(key)] : cur[key];
      if (next == null) {
        // 判断下一个 key 是数字就创建数组，否则对象
        const container = /^\d+$/.test(keys[i + 1]) ? [] : {};
        if (Array.isArray(cur)) {
          cur[Number(key)] = container;
        } else {
          cur[key] = container;
        }
      }
      const updated: unknown = Array.isArray(cur) ? cur[Number(key)] : cur[key];
      if (!isRecord(updated) && !Array.isArray(updated)) return;
      cur = updated;
    }
  }
}

// 原生深度比较，简单版（只比较基础类型、数组、对象）
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (typeof a !== typeof b) return false;
  if (a == null || b == null) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (isRecord(a) && isRecord(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
}

export function deepMerge<T extends UnknownRecord>(target: T, source: UnknownRecord): T {
  const writableTarget: UnknownRecord = target;
  for (const key in source) {
    const srcVal = source[key];

    // 跳过 undefined 和 null
    if (srcVal == null) continue;

    const srcIsObj = isRecord(srcVal);
    const tgtVal = writableTarget[key];
    const tgtIsObj = isRecord(tgtVal);

    if (srcIsObj) {
      // 如果目标不是对象，初始化为空对象
      if (!tgtIsObj) {
        writableTarget[key] = {};
      }
      // 如果引用相同，跳过
      if (writableTarget[key] !== srcVal) {
        deepMerge(writableTarget[key] as UnknownRecord, srcVal);
      }
    } else {
      // 如果值没有变化，跳过赋值
      if (tgtVal !== srcVal) {
        writableTarget[key] = srcVal;
      }
    }
  }
  return target;
}

export const mockFetchFormData = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), 800));
};

export function mergeFieldMetaPatch(
  targetMeta: FieldMeta | undefined,
  patch: Partial<FieldMeta>
): FieldMeta {
  const result: FieldMeta = {
    ...(targetMeta || {}) // 如果 base 是 undefined，默认空对象
  };

  (Object.keys(patch) as (keyof FieldMeta)[]).forEach((key) => {
    if (key === 'visible' || key === 'disabled' || key === 'readonly') {
      result.behavior = {
        ...(result.behavior || {}),
        [key]: patch[key]
      };
      delete result[key];
    } else if (key === 'behavior') {
      result.behavior = {
        ...(result.behavior || {}),
        ...(patch.behavior || {})
      };
    } else if (key === 'formItemProps' || key === 'componentProps') {
      result[key] = {
        ...(result[key] || {}),
        ...(patch[key] || {})
      };
    } else {
      result[key] = patch[key]!;
    }
  });

  return result;
}

export function mergeGroupMetaPatch(
  targetMeta: GroupMeta | undefined,
  patch: Partial<GroupMeta>
): GroupMeta {
  const result: GroupMeta = {
    ...(targetMeta || {})
  };

  (Object.keys(patch) as (keyof GroupMeta)[]).forEach((key) => {
    if (key === 'visible') {
      result.behavior = {
        ...(result.behavior || {}),
        visible: patch.visible
      };
      delete result.visible;
    } else if (key === 'behavior') {
      result.behavior = {
        ...(result.behavior || {}),
        ...(patch.behavior || {})
      };
    } else {
      result[key] = patch[key]!;
    }
  });

  return result;
}

export function getFieldBehaviorMeta(meta?: FieldMeta): FieldBehaviorMeta {
  return {
    visible: meta?.behavior?.visible ?? meta?.visible,
    disabled: meta?.behavior?.disabled ?? meta?.disabled,
    readonly: meta?.behavior?.readonly ?? meta?.readonly
  };
}

export function getGroupBehaviorMeta(meta?: GroupMeta): GroupBehaviorMeta {
  return {
    visible: meta?.behavior?.visible ?? meta?.visible
  };
}
