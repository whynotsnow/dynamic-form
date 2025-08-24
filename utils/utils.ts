import { FieldMeta, FormConfig } from '../types';

// 浅比较
export function shallowEqual(objA: any, objB: any) {
  if (objA === objB) return true;

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
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

export function mergeIntoDraft(draft: any, source: any) {
  if (Array.isArray(source)) {
    source.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) {
        if (!draft[index]) draft[index] = Array.isArray(item) ? [] : {};
        mergeIntoDraft(draft[index], item);
      } else {
        draft[index] = item;
      }
    });
  } else if (typeof source === 'object' && source !== null) {
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

export function arraysEqual(a: any[], b: any[]) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

// 原生实现 get，支持类似 "projects[0].members[1].name" 路径
export function getValueByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  // 把类似 'projects[0].members[1].name' 转成 ['projects', '0', 'members', '1', 'name']
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let cur = obj;
  for (const key of keys) {
    if (cur == null) return undefined;
    cur = cur[key];
  }
  return cur;
}

// 原生实现 set，支持嵌套路径，自动创建对象/数组
export function setValueByPath(obj: any, path: string, value: any) {
  if (!obj || !path) return;
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let cur = obj;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (i === keys.length - 1) {
      cur[key] = value;
    } else {
      if (cur[key] == null) {
        // 判断下一个 key 是数字就创建数组，否则对象
        cur[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
      }
      cur = cur[key];
    }
  }
}

// 原生深度比较，简单版（只比较基础类型、数组、对象）
export function deepEqual(a: any, b: any): boolean {
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

  if (typeof a === 'object' && typeof b === 'object') {
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

export function deepMerge(target: Record<string, any>, source: Record<string, any>) {
  for (const key in source) {
    const srcVal = source[key];

    // 跳过 undefined 和 null
    if (srcVal == null) continue;

    const srcIsObj = typeof srcVal === 'object' && !Array.isArray(srcVal);
    const tgtVal = target[key];
    const tgtIsObj = typeof tgtVal === 'object' && !Array.isArray(tgtVal);

    if (srcIsObj) {
      // 如果目标不是对象，初始化为空对象
      if (!tgtIsObj) {
        target[key] = {};
      }
      // 如果引用相同，跳过
      if (target[key] !== srcVal) {
        deepMerge(target[key], srcVal);
      }
    } else {
      // 如果值没有变化，跳过赋值
      if (tgtVal !== srcVal) {
        target[key] = srcVal;
      }
    }
  }
  return target;
}

export const mockFetchFormData = (data: any): Promise<Record<string, any>> => {
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
    if (key === 'formItemProps' || key === 'componentProps') {
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
