# DynamicForm 表单配置详解

## 📋 配置概述

DynamicForm 的表单配置是一个结构化的对象，支持两种主要模式：

- **简单模式**: 直接配置字段数组
- **分组模式**: 按逻辑分组组织字段

## 🏗️ 配置结构

### 类型定义

```typescript
interface FormConfig {
  // 字段配置（简单模式）
  fields?: BaseFieldConfig[];

  // 分组配置（分组模式）
  groups?: GroupField[];

  // 全局配置
  uiConfig?: UIConfig;

  // 验证配置
  validation?: ValidationConfig;
}

interface GroupField {
  id: string; // 分组唯一标识
  title?: string; // 分组标题
  fields: BaseFieldConfig[]; // 分组内字段

  // 分组级联动
  dependents?: string[]; // 依赖字段
  effect?: EffectFn; // 联动效果函数
  initialVisible?: boolean; // 初始可见性
}

interface BaseFieldConfig {
  // 基础属性
  id: string; // 字段唯一标识
  component: FieldComponentType; // 组件类型
  label?: string; // 显示标签

  // 布局配置
  span?: number; // 栅格列数
  style?: React.CSSProperties; // 自定义样式

  // 状态配置
  required?: boolean; // 是否必填
  initialVisible?: boolean; // 初始可见性
  initialDisabled?: boolean; // 初始禁用状态

  // 值配置
  initialValue?: any | InitialValueFunction; // 初始值

  // 联动配置
  dependents?: string[]; // 依赖字段
  effect?: EffectFn; // 联动效果函数

  // 验证配置
  rules?: Rule[]; // 验证规则

  // 组件属性
  formItemProps?: FormItemProps; // Form.Item 属性
  componentProps?: Record<string, any>; // 组件属性
}
```

### 字段配置结构

## 🔗 联动配置详解

### 基础联动

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
        { label: '深圳', value: 'shenzhen' }
      ],
      zhejiang: [
        { label: '杭州', value: 'hangzhou' },
        { label: '宁波', value: 'ningbo' }
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
}
```

### 复杂联动

```typescript
{
  id: 'employeeCount',
  label: '员工数量',
  component: 'NumberInput',
  dependents: ['businessType', 'region'],
  effect: ({ businessType, region }) => {
    // 基础配置
    const baseConfig = {
      min: 1,
      max: 10000
    };

    // 根据企业类型调整范围
    if (businessType === 'startup') {
      baseConfig.max = 100;
    } else if (businessType === 'enterprise') {
      baseConfig.min = 100;
    }

    // 根据地区调整步长
    const step = region === 'tier1' ? 10 : 1;

    return {
      componentProps: {
        ...baseConfig,
        step,
        formatter: (value) => `${value}人`,
        parser: (value) => value.replace('人', '')
      }
    };
  }
}
```

### 批量联动

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
    visible: masterField === 'A',
    value: masterField === 'A' ? 'A相关值' : undefined
  })
},
{
  id: 'fieldB',
  label: '字段B',
  component: 'TextInput',
  dependents: ['masterField'],
  effect: ({ masterField }) => ({
    visible: masterField === 'B',
    value: masterField === 'B' ? 'B相关值' : undefined
  })
}
```

## 🎨 UI 配置详解

### 全局UI配置

```typescript
const uiConfig = {
  // 布局配置
  rowProps: {
    gutter: [16, 16], // 栅格间距
    justify: 'start', // 水平对齐
    align: 'top' // 垂直对齐
  },

  colProps: {
    span: 12, // 默认列宽
    xs: 24, // 超小屏幕
    sm: 12, // 小屏幕
    md: 8, // 中屏幕
    lg: 6 // 大屏幕
  },

  // 表单配置
  formProps: {
    layout: 'vertical', // 布局方式
    size: 'middle', // 尺寸
    colon: false // 是否显示冒号
  },

  // 卡片配置
  cardProps: {
    title: '表单标题',
    bordered: true,
    size: 'default'
  },

  // 提交按钮配置
  submitButtonProps: {
    type: 'primary',
    size: 'large',
    loading: false
  }
};
```

### 字段级UI配置

```typescript
{
  id: 'description',
  label: '详细描述',
  component: 'TextInput',
  span: 24,                                 // 占满整行

  // Form.Item 属性
  formItemProps: {
    labelCol: { span: 4 },                  // 标签列宽
    wrapperCol: { span: 20 },               // 内容列宽
    extra: '请详细描述相关信息',              // 额外说明
    tooltip: '点击查看帮助信息'              // 提示信息
  },

  // 组件属性
  componentProps: {
    type: 'textarea',                        // 文本域
    rows: 4,                                 // 行数
    placeholder: '请输入详细描述',
    maxLength: 500,                          // 最大长度
    showCount: true,                         // 显示字数统计
    autoSize: { minRows: 2, maxRows: 6 }    // 自适应高度
  }
}
```

## ✅ 验证配置详解

### 基础验证规则

```typescript
{
  id: 'email',
  label: '邮箱',
  component: 'TextInput',
  required: true,
  rules: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' },
    { max: 100, message: '邮箱长度不能超过100个字符' }
  ]
}
```

### 自定义验证规则

```typescript
{
  id: 'password',
  label: '密码',
  component: 'Password',
  required: true,
  rules: [
    { required: true, message: '请输入密码' },
    { min: 8, message: '密码长度至少8位' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: '密码必须包含大小写字母、数字和特殊字符'
    },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (value && value.length < 8) {
          return Promise.reject(new Error('密码长度至少8位'));
        }
        return Promise.resolve();
      }
    })
  ]
}
```

### 异步验证

```typescript
{
  id: 'username',
  label: '用户名',
  component: 'TextInput',
  required: true,
  rules: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度3-20位' },
    {
      validator: async (_, value) => {
        if (!value) return;

        try {
          const response = await checkUsernameAvailability(value);
          if (!response.available) {
            throw new Error('用户名已被使用');
          }
        } catch (error) {
          throw new Error('验证失败，请重试');
        }
      }
    }
  ]
}
```

## 🔧 高级配置

### 条件渲染

```typescript
{
  id: 'conditionalField',
  label: '条件字段',
  component: 'TextInput',
  dependents: ['showField', 'fieldType'],
  effect: ({ showField, fieldType }) => {
    if (!showField) {
      return { visible: false };
    }

    return {
      visible: true,
      label: fieldType === 'A' ? '字段A' : '字段B',
      componentProps: {
        placeholder: fieldType === 'A' ? '请输入A' : '请输入B'
      }
    };
  }
}
```

### 动态验证

```typescript
{
  id: 'dynamicField',
  label: '动态字段',
  component: 'NumberInput',
  dependents: ['fieldType'],
  effect: ({ fieldType }) => {
    const rules = [
      { required: true, message: '请输入值' }
    ];

    if (fieldType === 'positive') {
      rules.push({ type: 'number', min: 0, message: '请输入正数' });
    } else if (fieldType === 'range') {
      rules.push(
        { type: 'number', min: 1, max: 100, message: '请输入1-100之间的数' }
      );
    }

    return { rules };
  }
}
```

### 批量字段生成

```typescript
const generateFields = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `field${index + 1}`,
    label: `字段${index + 1}`,
    component: 'TextInput',
    span: 8,
    componentProps: {
      placeholder: `请输入字段${index + 1}`
    }
  }));
};

const formConfig = {
  fields: [
    {
      id: 'fieldCount',
      label: '字段数量',
      component: 'NumberInput',
      componentProps: { min: 1, max: 10 }
    },
    ...generateFields(5) // 生成5个字段
  ]
};
```

## 📝 配置最佳实践

### 1. 字段ID命名规范

```typescript
// 推荐：使用有意义的ID
{
  id: 'userEmail',           // 用户邮箱
  id: 'orderAmount',         // 订单金额
  id: 'productCategory'      // 产品分类
}

// 避免：使用无意义的ID
{
  id: 'field1',              // 字段1
  id: 'input',               // 输入框
  id: 'data'                 // 数据
}
```

### 2. 联动配置优化

```typescript
// 推荐：明确依赖关系
{
  id: 'city',
  dependents: ['province'],  // 明确依赖省份
  effect: ({ province }) => ({ ... })
}

// 避免：隐式依赖
{
  id: 'city',
  effect: (allValues) => ({  // 依赖所有字段，性能差
    value: allValues.province ? 'default' : undefined
  })
}
```

### 3. 性能优化

```typescript
// 推荐：批量更新
{
  id: 'master',
  effect: ({ value }) => ({
    'field1': { value: value * 2 },
    'field2': { value: value * 3 },
    'field3': { visible: value > 100 }
  })
}

// 避免：多次更新
{
  id: 'master',
  effect: ({ value }) => {
    // 这样会导致多次状态更新
    dispatch({ type: 'SET_FIELD_VALUE', payload: { fieldId: 'field1', value: value * 2 } });
    dispatch({ type: 'SET_FIELD_VALUE', payload: { fieldId: 'field2', value: value * 3 } });
  }
}
```

## 🚨 常见问题

### Q: 字段联动不生效？

A: 检查以下几点：

- `dependents` 数组中的字段ID是否正确
- `effect` 函数是否正确返回对象
- 依赖字段是否存在于表单配置中

### Q: 验证规则不生效？

A: 检查以下几点：

- `rules` 数组格式是否正确
- 自定义验证函数是否正确实现
- 异步验证是否正确处理Promise

### Q: 自定义组件不显示？

A: 检查以下几点：

- 组件是否正确注册到 `componentRegistry`
- 组件类型名称是否与注册名称一致
- 组件是否正确导出和导入

## 📚 相关文档

- [快速参考](./QUICK_REFERENCE.md) - 常用配置示例
- [字段类型](./FIELD_TYPES.md) - 支持的字段类型详解
- [联动效果](./EFFECTS.md) - 字段联动配置详解
- [自定义处理器](./CUSTOM_HANDLERS.md) - 自定义处理器开发
- [性能优化](./PERFORMANCE.md) - 配置性能优化指南
