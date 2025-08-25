# DynamicForm 联动效果详解

## 🔗 联动效果概述

DynamicForm 的联动效果系统允许字段之间建立依赖关系，当一个字段的值发生变化时，可以自动影响其他字段的状态、值、可见性等属性。

## 🏗️ 联动机制

### 核心概念

- **依赖字段 (dependents)**: 指定当前字段依赖的其他字段ID
- **效果函数 (effect)**: 当依赖字段变化时执行的函数
- **返回值**: effect 函数返回的对象，用于更新字段属性

### 基本语法

```typescript
{
  id: 'targetField',
  label: '目标字段',
  component: 'TextInput',
  dependents: ['sourceField1', 'sourceField2'], // 依赖字段
  effect: ({ sourceField1, sourceField2 }) => {
    // 联动逻辑
    return {
      value: '新值',
      visible: true,
      disabled: false
    };
  }
}
```

## 🎯 联动类型

### 1. 值联动

**用途**: 根据依赖字段的值，自动设置当前字段的值。

```typescript
{
  id: 'businessType',
  label: '企业类型',
  component: 'SelectField',
  componentProps: {
    options: [
      { label: '小型企业', value: 'small' },
      { label: '中型企业', value: 'medium' },
      { label: '大型企业', value: 'large' }
    ]
  }
},
{
  id: 'employeeCount',
  label: '员工数量',
  component: 'NumberInput',
  dependents: ['businessType'],
  effect: ({ businessType }) => {
    const defaultCounts = {
      small: 50,
      medium: 200,
      large: 1000
    };
    
    return {
      value: defaultCounts[businessType] || undefined
    };
  }
}
```

### 2. 可见性联动

**用途**: 根据依赖字段的值，控制当前字段的显示/隐藏。

```typescript
{
  id: 'showAdvanced',
  label: '显示高级选项',
  component: 'Switch'
},
{
  id: 'advancedField1',
  label: '高级字段1',
  component: 'TextInput',
  dependents: ['showAdvanced'],
  effect: ({ showAdvanced }) => ({
    visible: showAdvanced === true
  })
},
{
  id: 'advancedField2',
  label: '高级字段2',
  component: 'NumberInput',
  dependents: ['showAdvanced'],
  effect: ({ showAdvanced }) => ({
    visible: showAdvanced === true
  })
}
```

### 3. 禁用状态联动

**用途**: 根据依赖字段的值，控制当前字段的启用/禁用状态。

```typescript
{
  id: 'userType',
  label: '用户类型',
  component: 'SelectField',
  componentProps: {
    options: [
      { label: '普通用户', value: 'normal' },
      { label: 'VIP用户', value: 'vip' }
    ]
  }
},
{
  id: 'vipCode',
  label: 'VIP邀请码',
  component: 'TextInput',
  dependents: ['userType'],
  effect: ({ userType }) => ({
    disabled: userType !== 'vip',
    visible: userType === 'vip'
  })
}
```

### 4. 属性联动

**用途**: 根据依赖字段的值，动态调整当前字段的组件属性。

```typescript
{
  id: 'fieldType',
  label: '字段类型',
  component: 'SelectField',
  componentProps: {
    options: [
      { label: '文本', value: 'text' },
      { label: '数字', value: 'number' },
      { label: '邮箱', value: 'email' }
    ]
  }
},
{
  id: 'dynamicField',
  label: '动态字段',
  component: 'TextInput',
  dependents: ['fieldType'],
  effect: ({ fieldType }) => {
    const configs = {
      text: {
        type: 'text',
        placeholder: '请输入文本',
        maxLength: 100
      },
      number: {
        type: 'number',
        placeholder: '请输入数字',
        min: 0,
        max: 999999
      },
      email: {
        type: 'email',
        placeholder: '请输入邮箱地址',
        maxLength: 200
      }
    };
    
    return {
      componentProps: configs[fieldType] || {}
    };
  }
}
```

### 5. 验证规则联动

**用途**: 根据依赖字段的值，动态调整当前字段的验证规则。

```typescript
{
  id: 'age',
  label: '年龄',
  component: 'NumberInput',
  dependents: ['userType'],
  effect: ({ userType }) => {
    const baseRules = [{ required: true, message: '请输入年龄' }];
    
    if (userType === 'student') {
      baseRules.push(
        { type: 'number', min: 6, max: 25, message: '学生年龄范围6-25岁' }
      );
    } else if (userType === 'adult') {
      baseRules.push(
        { type: 'number', min: 18, max: 100, message: '成人年龄范围18-100岁' }
      );
    }
    
    return { rules: baseRules };
  }
}
```

## 🔄 复杂联动场景

### 1. 级联联动

**场景**: 省份 → 城市 → 区县的三级联动。

```typescript
{
  id: 'province',
  label: '省份',
  component: 'SelectField',
  componentProps: {
    options: [
      { label: '广东省', value: 'guangdong' },
      { label: '浙江省', value: 'zhejiang' }
    ]
  }
},
{
  id: 'city',
  label: '城市',
  component: 'SelectField',
  dependents: ['province'],
  effect: ({ province }) => {
    const cityOptions = {
      guangdong: [
        { label: '广州', value: 'guangzhou' },
        { label: '深圳', value: 'shenzhen' },
        { label: '珠海', value: 'zhuhai' }
      ],
      zhejiang: [
        { label: '杭州', value: 'hangzhou' },
        { label: '宁波', value: 'ningbo' },
        { label: '温州', value: 'wenzhou' }
      ]
    };
    
    return {
      value: undefined, // 清空城市选择
      componentProps: {
        options: cityOptions[province] || [],
        disabled: !province
      },
      visible: !!province
    };
  }
},
{
  id: 'district',
  label: '区县',
  component: 'SelectField',
  dependents: ['province', 'city'],
  effect: ({ province, city }) => {
    const districtOptions = {
      guangdong: {
        guangzhou: [
          { label: '天河区', value: 'tianhe' },
          { label: '越秀区', value: 'yuexiu' }
        ],
        shenzhen: [
          { label: '南山区', value: 'nanshan' },
          { label: '福田区', value: 'futian' }
        ]
      },
      zhejiang: {
        hangzhou: [
          { label: '西湖区', value: 'xihu' },
          { label: '上城区', value: 'shangcheng' }
        ]
      }
    };
    
    return {
      value: undefined, // 清空区县选择
      componentProps: {
        options: districtOptions[province]?.[city] || [],
        disabled: !city
      },
      visible: !!city
    };
  }
}
```

### 2. 条件联动

**场景**: 根据多个条件字段的值，决定目标字段的状态。

```typescript
{
  id: 'userRole',
  label: '用户角色',
  component: 'SelectField',
  componentProps: {
    options: [
      { label: '普通用户', value: 'user' },
      { label: '管理员', value: 'admin' },
      { label: '超级管理员', value: 'superadmin' }
    ]
  }
},
{
  id: 'department',
  label: '部门',
  component: 'SelectField',
  componentProps: {
    options: [
      { label: '技术部', value: 'tech' },
      { label: '市场部', value: 'marketing' },
      { label: '人事部', value: 'hr' }
    ]
  }
},
{
  id: 'permissionLevel',
  label: '权限级别',
  component: 'SelectField',
  dependents: ['userRole', 'department'],
  effect: ({ userRole, department }) => {
    // 超级管理员拥有所有权限
    if (userRole === 'superadmin') {
      return {
        value: 'full',
        componentProps: {
          options: [
            { label: '完全权限', value: 'full' }
          ]
        }
      };
    }
    
    // 管理员根据部门分配权限
    if (userRole === 'admin') {
      const permissions = {
        tech: 'tech_admin',
        marketing: 'marketing_admin',
        hr: 'hr_admin'
      };
      
      return {
        value: permissions[department],
        componentProps: {
          options: [
            { label: '技术部管理', value: 'tech_admin' },
            { label: '市场部管理', value: 'marketing_admin' },
            { label: '人事部管理', value: 'hr_admin' }
          ]
        }
      };
    }
    
    // 普通用户只有基础权限
    return {
      value: 'basic',
      componentProps: {
        options: [
          { label: '基础权限', value: 'basic' }
        ]
      }
    };
  }
}
```

### 3. 计算联动

**场景**: 根据多个字段的值，计算并显示计算结果。

```typescript
{
  id: 'quantity',
  label: '数量',
  component: 'NumberInput',
  componentProps: {
    min: 1,
    step: 1
  }
},
{
  id: 'unitPrice',
  label: '单价',
  component: 'NumberInput',
  componentProps: {
    min: 0,
    precision: 2
  }
},
{
  id: 'discount',
  label: '折扣',
  component: 'NumberInput',
  componentProps: {
    min: 0,
    max: 1,
    step: 0.1,
    precision: 2
  }
},
{
  id: 'totalAmount',
  label: '总金额',
  component: 'TextDisplay',
  dependents: ['quantity', 'unitPrice', 'discount'],
  effect: ({ quantity, unitPrice, discount }) => {
    if (!quantity || !unitPrice) {
      return { value: '请先输入数量和单价' };
    }
    
    const subtotal = quantity * unitPrice;
    const finalDiscount = discount || 1;
    const total = subtotal * finalDiscount;
    
    return {
      value: `¥${total.toFixed(2)}`,
      componentProps: {
        style: {
          color: total > 1000 ? 'red' : 'black',
          fontWeight: 'bold'
        }
      }
    };
  }
}
```

## ⚡ 性能优化

### 1. 批量更新

**推荐**: 在 effect 中返回多个字段的更新。

```typescript
{
  id: 'masterField',
  label: '主字段',
  component: 'SelectField',
  componentProps: {
    options: [
      { label: '选项A', value: 'A' },
      { label: '选项B', value: 'B' }
    ]
  }
},
{
  id: 'fieldA',
  label: '字段A',
  component: 'TextInput',
  dependents: ['masterField'],
  effect: ({ masterField }) => ({
    'fieldA': { 
      visible: masterField === 'A',
      value: masterField === 'A' ? 'A相关值' : undefined
    },
    'fieldB': { 
      visible: masterField === 'B',
      value: masterField === 'B' ? 'B相关值' : undefined
    }
  })
}
```

### 2. 避免循环依赖

**不推荐**: 字段之间形成循环依赖。

```typescript
// ❌ 错误示例：循环依赖
{
  id: 'field1',
  dependents: ['field2'],
  effect: ({ field2 }) => ({ value: field2 * 2 })
},
{
  id: 'field2',
  dependents: ['field1'],
  effect: ({ field1 }) => ({ value: field1 / 2 })
}
```

**推荐**: 明确依赖关系，避免循环。

```typescript
// ✅ 正确示例：单向依赖
{
  id: 'field1',
  label: '主字段',
  component: 'NumberInput'
},
{
  id: 'field2',
  label: '计算字段',
  component: 'NumberInput',
  dependents: ['field1'],
  effect: ({ field1 }) => ({ value: field1 ? field1 * 2 : undefined })
}
```

### 3. 条件执行

**推荐**: 在 effect 中添加条件判断，避免不必要的计算。

```typescript
{
  id: 'targetField',
  label: '目标字段',
  component: 'TextInput',
  dependents: ['sourceField'],
  effect: ({ sourceField }) => {
    // 添加条件判断
    if (!sourceField || sourceField < 0) {
      return { visible: false };
    }
    
    // 只在有效值时执行计算
    return {
      visible: true,
      value: sourceField * 2
    };
  }
}
```

## 🚨 常见问题

### Q: 联动不生效？
A: 检查以下几点：
- `dependents` 数组中的字段ID是否正确
- `effect` 函数是否正确返回对象
- 依赖字段是否存在于表单配置中
- 是否有循环依赖

### Q: 性能问题？
A: 优化建议：
- 使用批量更新，避免多次状态更新
- 避免在 effect 中执行复杂计算
- 添加条件判断，避免不必要的执行
- 检查是否有循环依赖

### Q: 联动顺序问题？
A: 解决方案：
- 确保依赖字段的配置顺序正确
- 使用 `useEffect` 处理复杂的联动逻辑
- 考虑使用 `useMemo` 优化计算

## 📚 相关文档

- [表单配置](./FORM_CONFIG.md) - 表单配置详解
- [字段类型](./FIELD_TYPES.md) - 支持的字段类型
- [快速参考](./QUICK_REFERENCE.md) - 常用配置示例
- [自定义处理器](./CUSTOM_HANDLERS.md) - 自定义处理器开发
- [性能优化](./PERFORMANCE.md) - 性能调优指南
