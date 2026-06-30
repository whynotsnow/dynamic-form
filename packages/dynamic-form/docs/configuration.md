# 配置指南

DynamicForm 通过 `FormConfig` 驱动表单。配置描述字段、分组、组件、初始值、校验、联动关系和 UI 行为。

### 平铺表单

```ts
import type { FormConfig } from '@whynotsnow/dynamic-form';

const formConfig: FormConfig = {
  fields: [
    {
      id: 'username',
      label: 'Username',
      component: 'TextInput',
      rules: [{ required: true, message: 'Username is required' }]
    }
  ]
};
```

### 分组表单

```ts
const formConfig: FormConfig = {
  groups: [
    {
      id: 'profile',
      title: 'Profile',
      initialVisible: true,
      fields: [
        {
          id: 'name',
          label: 'Name',
          component: 'TextInput'
        }
      ]
    }
  ]
};
```

### 混合表单

`FormConfig` 可以同时包含顶层 `fields` 和 `groups`。默认 renderer 先渲染未分组字段，再按声明顺序渲染 groups：

```ts
const formConfig: FormConfig = {
  fields: [{ id: 'accountType', component: 'Select' }],
  groups: [
    {
      id: 'companyInfo',
      title: '企业信息',
      fields: [{ id: 'companyName', component: 'TextInput' }]
    }
  ]
};
```

字段 ID 与 group ID 在整个表单内必须唯一。Group 只影响 UI 和行为作用域。字段可以通过 `name` 声明独立的 Ant Design `NamePath`，详见 [Field Address](./field-address.md)。

### 字段配置

| 配置项 | 说明 |
| --- | --- |
| `id` | Runtime、registry 和 effect graph 使用的全局唯一字段 key。 |
| `name` | 可选 Ant Design `NamePath`；默认使用 `id`。 |
| `component` | 内置组件名或自定义注册组件名。 |
| `label` | `Form.Item` label。 |
| `rules` | Ant Design Form 校验规则。 |
| `required` | 字段级 required 标记。 |
| `span` | 默认 `Col` 渲染使用的栅格宽度。 |
| `style` | 字段样式。 |
| `initialValue` | 静态值，或基于已计算初始值的函数。 |
| `initialVisible` | 初始是否可见，默认可见。 |
| `initialDisabled` | 初始禁用意图。 |
| `preserveValueOnHide` | 字段隐藏后是否保留当前值。 |
| `restoreValueOnShow` | 字段重新显示后是否恢复隐藏前缓存值，默认恢复。 |
| `dependents` | 交给 effect engine 的依赖声明。 |
| `effect` | 依赖触发后的 effect 函数。 |
| `formItemProps` | 静态 `Form.Item` props。 |
| `componentProps` | 传给字段组件的静态 props。 |

`required` 是字段声明属性。默认 Ant Design renderer 会把 `required: true` 合并成真实 `Form.Item.rules`，并显示 required 标记；如果 `rules` 中已经显式声明 required rule，则以显式 rule 为准，不重复生成。

### 函数式初始值

`initialValue` 可以是函数。函数接收已计算的初始值，可以返回原始值，也可以返回 effect result 对象。

```ts
{
  id: 'fullName',
  label: 'Full Name',
  component: 'TextInput',
  initialValue: (values) => `${values.firstName ?? ''} ${values.lastName ?? ''}`.trim()
}
```

```ts
{
  id: 'country',
  component: 'Select',
  initialValue: () => ({
    value: 'CN',
    componentProps: {
      options: [{ label: 'China', value: 'CN' }]
    }
  })
}
```

函数式初始值返回的对象会进入和运行时 effect 相同的 handler 系统。

### 分组配置

| 配置项 | 说明 |
| --- | --- |
| `id` | 分组 key。 |
| `title` | 默认 `Card` 渲染使用的标题。 |
| `fields` | 分组内字段。 |
| `initialVisible` | 初始是否可见，默认可见。 |
| `dependents` | 分组级依赖声明。 |
| `effect` | 分组级 effect。 |

分组可见性会影响子字段的渲染和提交参与。

### UI 配置

`uiConfig` 用于调整默认 Ant Design 外壳：

```tsx
<DynamicForm
  form={form}
  formConfig={formConfig}
  uiConfig={{
    rowProps: { gutter: [16, 0] },
    colProps: { span: 12 },
    formProps: { layout: 'vertical' },
    buttonProps: { type: 'primary' },
    cardProps: { size: 'small' },
    submitAreaProps: { style: { textAlign: 'right' } },
    formItemProps: { colon: false }
  }}
/>
```

默认 UI 配置包括：

- `rowProps: { gutter: [16, 0] }`
- `colProps: { span: 8 }`
- 空的 form、button、card、submit area、form item props

### 内置组件

内置组件注册在 `DefaultRegistryFieldComponents`：

- `Password`
- `ConfirmPassword`
- `TextInput`
- `NumberInput`
- `SelectField`
- `DatePicker`
- `Switch`
- `Rate`
- `TextDisplay`
- `CheckboxGroup`
- `Select`
- `TextArea`

`SelectField` 从字段配置读取 `options`。`Select` 通常通过 `componentProps` 接收 options。

### `values` 初始数据

`values` prop 适用于编辑或详情回显场景。它会在 store 初始化时合并并同步到 Ant Design Form。初始化后，Ant Design Form 仍然是运行时值来源。

