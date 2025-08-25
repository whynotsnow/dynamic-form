# DynamicForm 字段类型详解

## 📋 字段类型概述

DynamicForm 支持多种字段类型，每种类型都有其特定的用途和配置选项。

## 🏗️ 内置字段类型

### 文本输入类

#### TextInput - 文本输入框
**用途**: 单行文本输入
```typescript
{
  id: 'username',
  label: '用户名',
  component: 'TextInput',
  componentProps: {
    placeholder: '请输入用户名',
    maxLength: 20
  }
}
```

#### Password - 密码输入框
**用途**: 密码输入
```typescript
{
  id: 'password',
  label: '密码',
  component: 'Password',
  componentProps: {
    visibilityToggle: true
  }
}
```

### 数字输入类

#### NumberInput - 数字输入框
**用途**: 数字输入
```typescript
{
  id: 'age',
  label: '年龄',
  component: 'NumberInput',
  componentProps: {
    min: 0,
    max: 150,
    step: 1
  }
}
```

### 选择类

#### SelectField - 下拉选择框
**用途**: 从预定义选项中选择
```typescript
{
  id: 'city',
  label: '城市',
  component: 'SelectField',
  componentProps: {
    options: [
      { label: '北京', value: 'beijing' },
      { label: '上海', value: 'shanghai' }
    ]
  }
}
```

#### Switch - 开关组件
**用途**: 布尔值选择
```typescript
{
  id: 'enabled',
  label: '是否启用',
  component: 'Switch',
  componentProps: {
    checkedChildren: '启用',
    unCheckedChildren: '禁用'
  }
}
```

### 日期时间类

#### DatePicker - 日期选择器
**用途**: 日期选择
```typescript
{
  id: 'birthday',
  label: '生日',
  component: 'DatePicker',
  componentProps: {
    format: 'YYYY-MM-DD'
  }
}
```

### 显示类

#### TextDisplay - 文本显示
**用途**: 只读文本显示
```typescript
{
  id: 'summary',
  label: '汇总信息',
  component: 'TextDisplay'
}
```

## 🔧 自定义字段类型

### 组件注册
```typescript
const componentRegistry = {
  customComponents: {
    CustomField: CustomFieldComponent
  }
};
```

## 📚 相关文档

- [表单配置](./FORM_CONFIG.md) - 表单配置详解
- [快速参考](./QUICK_REFERENCE.md) - 常用配置示例
