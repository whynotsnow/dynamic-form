import type { FieldMeta } from '../src/types';

export interface RuntimeFormStoreSnapshot {
  values: Record<string, unknown>;
  errors?: Record<string, string[]>;
  touched?: Record<string, boolean>;
  validating?: Record<string, boolean>;
}

export interface EffectStoreSnapshot {
  fieldMeta: Record<string, FieldMeta>;
  groupMeta: Record<string, FieldMeta>;
}

export function validateStoreBoundary({
  formStore,
  effectStore
}: {
  formStore: RuntimeFormStoreSnapshot;
  effectStore: EffectStoreSnapshot;
}) {
  const forbiddenEffectStoreKeys = ['values', 'errors', 'touched', 'validating'];
  const effectStoreRecord = effectStore as unknown as Record<string, unknown>;

  return forbiddenEffectStoreKeys.every((key) => effectStoreRecord[key] === undefined);
}

export function testStoreBoundaryLogic() {
  console.log('[Test] 开始验证 Form Store / Effect Store 边界');

  const formStore: RuntimeFormStoreSnapshot = {
    values: {
      employeeCount: 300,
      companySize: '大型企业'
    },
    errors: {},
    touched: {
      employeeCount: true
    },
    validating: {}
  };

  const effectStore: EffectStoreSnapshot = {
    fieldMeta: {
      employeeCount: {
        componentProps: { disabled: false }
      },
      companySize: {
        visible: true
      }
    },
    groupMeta: {
      companyInfo: {
        visible: true
      }
    }
  };

  const isValid = validateStoreBoundary({ formStore, effectStore });

  console.log('[Test] Form Store 保存 values/errors/touched/validating:', formStore);
  console.log('[Test] Effect Store 只保存 meta/groupMeta:', effectStore);
  console.log(`[Test] Store 边界正确: ${isValid ? '✅' : '❌'}`);

  return isValid;
}
