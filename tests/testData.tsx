import { Chain } from 'form-chain-effect-engine';
import { GroupedFormConfig, FlatFormConfig } from '@/types';
export const supplierFormConfig: GroupedFormConfig = {
  groups: [
    {
      title: '企业信息',
      id: 'enterpriseInformation',
      fields: [
        {
          id: 'businessType',
          label: '业务类型',
          component: 'SelectField',
          span: 8,
          componentProps: {
            options: [
              { value: 'manufacturer', label: '生产制造商' },
              { value: 'distributor', label: '分销商' },
              { value: 'wholesaler', label: '批发商' }
            ]
          },
          initialValue: 'manufacturer',
          dependents: ['industryType'],
          effect: (_changedValue: any, allValues: Record<string, any>, _chain: Chain) => {
            const businessType = allValues.businessType;
            const result = {
              groupsVisible: {
                businessInformation: businessType === 'manufacturer'
              }
            };
            return result;
          }
        },
        {
          id: 'employeeCount',
          label: '员工数量',
          component: 'NumberInput',
          span: 8,
          initialValue: 50,
          dependents: ['companySize'],
          effect: (val: any, all: Record<string, any>, chain: Chain) => {
            return {
              value: val * 2
            };
          }
        },
        {
          id: 'companySize',
          label: '企业规模',
          component: 'TextDisplay',
          span: 8,
          initialValue: (allValues: Record<string, any>) => {
            const employeeCount = allValues.employeeCount;
            if (employeeCount <= 50) {
              return '小型企业';
            } else if (employeeCount < 200) {
              return '中型企业';
            } else {
              return '大型企业';
            }
          },
          effect: (_changedValue: any, allValues: Record<string, any>, _chain: Chain) => {
            const employeeCount = allValues.employeeCount;
            let companySizeText = '';

            if (employeeCount <= 50) {
              companySizeText = '小型企业';
            } else if (employeeCount < 200) {
              companySizeText = '中型企业';
            } else {
              companySizeText = '大型企业';
            }

            return {
              value: companySizeText
            };
          }
        },
        {
          id: 'industryType',
          label: '行业类型',
          component: 'SelectField',
          span: 24,
          componentProps: {
            options: [
              { value: 'textileAndClothing', label: '纺织服装' },
              { value: 'grainAndOilProcessing', label: '粮油加工' },
              { value: 'dailyChemicals', label: '日用化学品' },
              { value: 'householdAppliances', label: '家用电器' }
            ]
          },

          initialValue: (allValues: Record<string, any>) => {
            const businessType = allValues.businessType;
            return {
              value: 'textileAndClothing',
              visible: businessType === 'manufacturer',
              disabled: businessType === 'distributor'
            };
          },
          effect: (_changedValue: any, allValues: Record<string, any>, _chain: Chain) => {
            const businessType = allValues.businessType;
            return { visible: businessType === 'manufacturer' };
          }
        }
      ]
    },
    {
      title: '经营信息',
      id: 'businessInformation',
      effect: (_changedValue: any, allValues: Record<string, any>, _chain: Chain) => {
        const businessType = allValues.businessType;
        return { visible: businessType === 'manufacturer' };
      },
      fields: [
        {
          id: 'operatingIncome',
          label: '企业营收',
          span: 12,
          component: 'NumberInput',
          initialValue: () => {
            return {
              disabled: true,
              value: 3000
            };
          },
          effect: (_changedValue: any, allValues: Record<string, any>, _chain: Chain) => {
            const { profitRate } = allValues;
            return {
              value: (profitRate * 3000) / 100
            };
          }
        },
        {
          id: 'profitRate',
          label: '营收利润率',
          span: 12,
          component: 'NumberInput',
          initialValue: 100,
          dependents: ['operatingIncome']
        },
        {
          id: 'categories',
          label: '主营品类',
          component: 'SelectField',
          span: 12,
          dependents: ['operatingArea'],
          componentProps: {
            options: [
              { value: 'fruitsAndVegetables', label: '水果生鲜' },
              { value: 'aquatic', label: '水产' },
              { value: 'cookedFood', label: '熟食' },
              { value: 'Icecream/frozenProducts', label: '冰淇淋/冻品' }
            ]
          },

          initialValue: 'fruitsAndVegetables'
        },
        {
          id: 'operatingArea',
          label: '经营地区',
          component: 'SelectField',
          span: 12,
          componentProps: {
            options: [
              { value: 'guagnzhou', label: '广州' },
              { value: 'shenzhen', label: '深圳' },
              { value: 'shanghai', label: '上海' },
              { value: 'beijing', label: '北京' }
            ]
          },

          initialValue: (allValues: { categories: string }) => {
            const { categories } = allValues;
            let value = undefined;
            if (categories === 'fruitsAndVegetables') {
              value = 'guagnzhou';
            }
            return {
              value
            };
          }
        }
      ]
    }
  ]
};

export const testFields: FlatFormConfig = {
  fields: [
    {
      id: 'username',
      label: '用户名',
      component: 'TextInput',
      span: 24,
      initialValue: undefined,
      rules: [
        { required: true, message: '请输入用户名' },
        { min: 3, message: '用户名至少3个字符' }
      ]
    },
    {
      id: 'password',
      label: '密码',
      component: 'Password',
      span: 24,
      initialValue: undefined,
      dependents: ['confirmPassword'],
      rules: [{ required: true, message: '请输入密码' }]
    },
    {
      id: 'confirmPassword',
      label: '确认密码',
      component: 'ConfirmPassword',
      span: 24,
      initialValue: undefined
    },
    {
      id: 'email',
      label: '邮箱',
      component: 'TextInput',
      span: 24,
      initialValue: undefined,
      rules: [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '邮箱格式不正确' }
      ]
    },
    {
      id: 'age',
      label: '年龄',
      component: 'NumberInput',
      span: 24,
      initialValue: undefined,
      rules: [
        { required: true, message: '请输入年龄' },
        {
          type: 'number',
          min: 18,
          max: 100,
          message: '年龄必须在18~100之间'
        }
      ]
    },
    {
      id: 'rate',
      label: '评分组件',
      component: 'Rate',
      span: 24
    }
  ]
};

// 1. 三节点环，A->C->B->A
const cyclicTestConfig1: GroupedFormConfig = {
  groups: [
    {
      title: '循环依赖测试1',
      id: 'cyclic1',
      fields: [
        { id: 'fieldA', label: '字段 A', component: 'TextInput', dependents: ['fieldC'] },
        { id: 'fieldB', label: '字段 B', component: 'TextInput', dependents: ['fieldA'] },
        { id: 'fieldC', label: '字段 C', component: 'TextInput', dependents: ['fieldB'] }
      ]
    }
  ]
};

// 2. 简单二节点环，X->Y->X
const cyclicTestConfig2: GroupedFormConfig = {
  groups: [
    {
      id: 'group1',
      title: '循环依赖测试2',
      fields: [
        { id: 'fieldX', label: '字段 X', component: 'TextInput', dependents: ['fieldY'] },
        { id: 'fieldY', label: '字段 Y', component: 'TextInput', dependents: ['fieldX'] }
      ]
    }
  ]
};

// 3. 自依赖，Z依赖自身
const cyclicTestConfig3: GroupedFormConfig = {
  groups: [
    {
      id: 'group1',
      title: '循环依赖测试3',
      fields: [{ id: 'fieldZ', label: '字段 Z', component: 'TextInput', dependents: ['fieldZ'] }]
    }
  ]
};

// 4. 多组字段，跨组循环 A1->B1->A1
const cyclicTestConfig4: GroupedFormConfig = {
  groups: [
    {
      id: 'group1',
      title: '组A',
      fields: [{ id: 'fieldA1', label: '字段 A1', component: 'TextInput', dependents: ['fieldB1'] }]
    },
    {
      id: 'group2',
      title: '组B',
      fields: [{ id: 'fieldB1', label: '字段 B1', component: 'TextInput', dependents: ['fieldA1'] }]
    }
  ]
};

// 5. 无循环依赖（作为对比）
const nonCyclicConfig: GroupedFormConfig = {
  groups: [
    {
      id: 'group1',
      title: '无循环依赖测试',
      fields: [
        { id: 'fieldM', label: '字段 M', component: 'TextInput' },
        { id: 'fieldN', label: '字段 N', component: 'TextInput', dependents: ['fieldM'] },
        { id: 'fieldO', label: '字段 O', component: 'TextInput', dependents: ['fieldN'] }
      ]
    }
  ]
};

const flatTestConfig1: FlatFormConfig = {
  fields: [
    {
      id: 'username',
      label: '用户名',
      span: 24,
      component: 'TextInput',
      dependents: ['confirmPassword'],
      rules: [{ required: true, message: '请输入用户名' }],
      initialValue: ''
    },
    {
      id: 'password',
      label: '密码',
      span: 24,
      component: 'Password',
      dependents: ['username'],
      rules: [{ required: true, message: '请输入密码' }],
      initialValue: ''
    },
    {
      id: 'confirmPassword',
      label: '确认密码',
      span: 24,
      component: 'Password'
    }
  ]
};

// 恢复 circularDependencyConfig 的定义
const circularDependencyConfig: GroupedFormConfig = {
  groups: [
    {
      id: 'group1',
      title: '循环依赖测试组',
      fields: [
        {
          id: 'fieldA',
          label: '字段 A',
          component: 'TextInput',
          dependents: ['fieldC'] // 依赖字段 C
        },
        {
          id: 'fieldB',
          label: '字段 B',
          component: 'TextInput',
          dependents: ['fieldA'] // 依赖字段 A
        },
        {
          id: 'fieldC',
          label: '字段 C',
          component: 'TextInput',
          dependents: ['fieldB'] // 依赖字段 B，形成环：A -> C -> B -> A
        },
        {
          id: 'fieldD',
          label: '字段 D',
          component: 'TextInput',
          dependents: ['fieldF']
        }
      ]
    }
  ]
};

// 基于 useFormChainEffectEngine 示例的表单配置
export const simpleChainTestConfig: FlatFormConfig = {
  fields: [
    {
      id: 'A',
      label: '字段 A',
      component: 'TextInput',
      initialValue: '',
      dependents: ['B'],
      effect: (val, all, chain) => {
        console.log('A changed:', val);
      }
    },
    {
      id: 'B',
      label: '字段 B',
      component: 'TextInput',
      initialValue: '',
      dependents: ['C'],
      effect: (val, all, chain) => {
        console.log('B changed:', val);
      }
    },
    {
      id: 'C',
      label: '字段 C',
      component: 'TextInput',
      initialValue: '',
      effect: (val, all, chain) => {
        console.log('C changed:', val);
      }
    }
  ]
};

// 基于 useFormChainEffectEngine 示例的分组表单配置
export const simpleChainGroupedTestConfig: GroupedFormConfig = {
  groups: [
    {
      id: '1',
      title: '第一组',
      fields: [
        {
          id: 'A',
          label: '字段 A',
          component: 'TextInput',
          initialValue: '',
          dependents: ['B'],
          effect: (val, all, chain) => {
            console.log('A changed:', val);
          }
        },
        {
          id: 'B',
          label: '字段 B',
          component: 'TextInput',
          initialValue: '',
          dependents: ['C'],
          effect: (val, all, chain) => {
            console.log('B changed:', val);
          }
        }
      ]
    },
    {
      id: '2',
      title: '第二组',
      fields: [
        {
          id: 'C',
          label: '字段 C',
          component: 'TextInput',
          initialValue: '',
          effect: (val, all, chain) => {
            console.log('C changed:', val);
          }
        }
      ]
    }
  ]
};

export {
  cyclicTestConfig1,
  cyclicTestConfig2,
  cyclicTestConfig3,
  cyclicTestConfig4,
  nonCyclicConfig,
  flatTestConfig1,
  circularDependencyConfig
};

// 测试分组逻辑的简单配置
export const groupTestConfig: GroupedFormConfig = {
  groups: [
    {
      id: 'testGroup',
      title: '测试分组',
      dependents: ['triggerField'],
      effect: (_changedValue: any, allValues: Record<string, any>, _chain: Chain) => {
        return { visible: allValues.triggerField === 'show' };
      },
      fields: [
        {
          id: 'testField',
          label: '测试字段',
          component: 'TextInput',
          initialValue: ''
        }
      ]
    }
  ]
};

// 简单的数据同步测试配置
export const syncTestConfig: FlatFormConfig = {
  fields: [
    {
      id: 'fieldA',
      label: '字段 A',
      component: 'TextInput',
      span: 24,
      initialValue: '',
      dependents: ['fieldB'],
      effect: (value: any, allValues: any) => {
        console.log('[syncTestConfig] fieldA effect triggered:', value);
        return { value: `由 A 触发的值: ${value}` };
      }
    },
    {
      id: 'fieldB',
      label: '字段 B',
      component: 'TextInput',
      span: 24,
      initialValue: '',
      dependents: ['fieldC'],
      effect: (value: any, allValues: any) => {
        console.log('[syncTestConfig] fieldB effect triggered:', value);
        return { value: `由 B 触发的值: ${value}` };
      }
    },
    {
      id: 'fieldC',
      label: '字段 C',
      component: 'TextInput',
      span: 24,
      initialValue: '',
      effect: (value: any, allValues: any) => {
        console.log('[syncTestConfig] fieldC effect triggered:', value);
        return { value: `由 C 触发的值: ${value}` };
      }
    }
  ]
};
