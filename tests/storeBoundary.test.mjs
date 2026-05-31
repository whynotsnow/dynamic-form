import assert from 'node:assert/strict';
import test from 'node:test';

const forbiddenEffectStoreKeys = ['values', 'errors', 'warnings', 'touched', 'validating'];

test('effect store does not hold Antd Form runtime state', () => {
  const effectStore = {
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
    },
    dependencyGraph: {
      employeeCount: ['companySize']
    }
  };

  for (const key of forbiddenEffectStoreKeys) {
    assert.equal(Object.hasOwn(effectStore, key), false);
  }
});

test('submit values are read from form runtime store', async () => {
  const submittedValues = {
    employeeCount: 300,
    companySize: '大型企业'
  };

  const form = {
    async validateFields() {
      return submittedValues;
    },
    getFieldsValue(includeAll) {
      assert.equal(includeAll, true);
      return submittedValues;
    }
  };

  await form.validateFields();
  const values = form.getFieldsValue(true);

  assert.deepEqual(values, submittedValues);
});
