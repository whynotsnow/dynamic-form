# 组件使用指南

## 中文文档

本文面向 DynamicForm 的使用者，说明常见配置如何组合使用，并给出对应 demo 链接。这里提供的是最小示例；更完整的场景请阅读对应 demo 源码。

### Demo 入口

运行本地 demo：

```bash
npm run start
```

当前 demo 入口位于 [`demos/DemoSelector.tsx`](../demos/DemoSelector.tsx)，demo 配置位于 [`demos/index.ts`](../demos/index.ts)。

| 场景 | Demo |
| --- | --- |
| 表单值同步和 effect 更新边界 | [`demos/storeBoundaryDemo.tsx`](../demos/storeBoundaryDemo.tsx) |
| 自定义 effect result handlers | [`demos/customHandlersDemo.tsx`](../demos/customHandlersDemo.tsx)、[`demos/customHandlers.ts`](../demos/customHandlers.ts) |
| 自定义组件注册 | [`demos/customComponentsDemo.tsx`](../demos/customComponentsDemo.tsx) |
| Ant Design Form 校验集成 | [`demos/formValidationDemo.tsx`](../demos/formValidationDemo.tsx) |
| 静态和动态 UI 配置 | [`demos/uiConfigDemo.tsx`](../demos/uiConfigDemo.tsx) |
| render hooks 渲染扩展 | [`demos/renderExtensionDemo.tsx`](../demos/renderExtensionDemo.tsx) |

### 最小使用

```tsx
import { Form } from 'antd';
import { DynamicForm, useInitHandlers } from '@whynotsnow/dynamic-form';
import type { FormConfig } from '@whynotsnow/dynamic-form';

const formConfig: FormConfig = {
  fields: [
    {
      id: 'name',
      label: '姓名',
      component: 'TextInput',
      rules: [{ required: true, message: '请输入姓名' }]
    }
  ]
};

export function BasicForm() {
  const [form] = Form.useForm();
  const { isInitialized } = useInitHandlers({});

  if (!isInitialized) return null;

  return (
    <DynamicForm
      form={form}
      formConfig={formConfig}
      onSubmit={(values) => console.log(values)}
    />
  );
}
```

### 平铺字段配置

平铺表单适合字段数量较少、没有明显业务分区的场景。

```ts
const formConfig: FormConfig = {
  fields: [
    {
      id: 'email',
      label: '邮箱',
      component: 'TextInput',
      componentProps: { placeholder: '请输入邮箱' },
      rules: [{ type: 'email', message: '邮箱格式不正确' }]
    },
    {
      id: 'age',
      label: '年龄',
      component: 'NumberInput',
      span: 8,
      initialValue: 18
    }
  ]
};
```

更多字段配置说明见 [`configuration.md`](./configuration.md)。

### 分组配置

分组表单适合有业务区块的表单。默认渲染中，每个 group 会使用 Ant Design `Card`。

```ts
const formConfig: FormConfig = {
  groups: [
    {
      id: 'basic',
      title: '基础信息',
      fields: [
        { id: 'name', label: '姓名', component: 'TextInput' },
        { id: 'phone', label: '手机号', component: 'TextInput' }
      ]
    }
  ]
};
```

如果要把分组改成 tabs 或其他布局，优先查看 [`demos/renderExtensionDemo.tsx`](../demos/renderExtensionDemo.tsx)。

### UI 配置

`uiConfig` 用于调整默认 Ant Design 外壳，不改变整体渲染结构。

```tsx
<DynamicForm
  form={form}
  formConfig={formConfig}
  uiConfig={{
    formProps: { layout: 'vertical' },
    rowProps: { gutter: [16, 0] },
    colProps: { span: 12 },
    buttonProps: { type: 'primary' },
    submitAreaProps: { style: { textAlign: 'right' } }
  }}
/>
```

完整示例见 [`demos/uiConfigDemo.tsx`](../demos/uiConfigDemo.tsx)。

### 字段联动 effect

字段通过 `dependents` 声明依赖，通过 `effect` 返回更新结果。默认 handler 可以处理 `value`、`visible`、`disabled`、`readonly`、`componentProps`、`formItemProps` 等 key。

```ts
const formConfig: FormConfig = {
  fields: [
    {
      id: 'hasCompany',
      label: '是否有公司',
      component: 'Switch',
      dependents: ['companyName'],
      componentProps: { checkedChildren: '是', unCheckedChildren: '否' }
    },
    {
      id: 'companyName',
      label: '公司名称',
      component: 'TextInput',
      initialVisible: false,
      effect: (_changedValue, allValues) => ({
        visible: allValues.hasCompany === true,
        formItemProps: {
          extra: allValues.hasCompany ? '请输入公司全称' : undefined
        }
      })
    }
  ]
};
```

更完整的 effect 和 handler 说明见 [`effects-and-handlers.md`](./effects-and-handlers.md)，运行时行为边界见 [`runtime-layer.md`](./runtime-layer.md)。跨字段复杂更新建议使用自定义 handler，参考 [`demos/customHandlersDemo.tsx`](../demos/customHandlersDemo.tsx)。

### 注册自定义组件

当字段输入 UI 有业务特性时，使用 `componentRegistry` 注册自定义组件。

```tsx
import { Select } from 'antd';
import type { FieldComponentProps } from '@whynotsnow/dynamic-form';

const ProjectSelect: React.FC<FieldComponentProps> = ({ value, onChange }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={[
        { label: '项目 A', value: 'a' },
        { label: '项目 B', value: 'b' }
      ]}
    />
  );
};

const componentRegistry = {
  customComponents: {
    ProjectSelect
  },
  allowOverride: false
};

const formConfig: FormConfig = {
  fields: [
    {
      id: 'project',
      label: '项目',
      component: 'ProjectSelect'
    }
  ]
};

<DynamicForm
  form={form}
  formConfig={formConfig}
  componentRegistry={componentRegistry}
/>;
```

完整示例见 [`demos/customComponentsDemo.tsx`](../demos/customComponentsDemo.tsx)。

### 自定义 Effect Handlers

当 effect 返回值需要表达业务语义时，可以注册自定义 handler。handler 应使用上下文提供的语义化 API，不要直接维护表单值副本。

```ts
import type { CustomEffectResultHandler } from '@whynotsnow/dynamic-form';

export const highlightHandler: CustomEffectResultHandler = {
  name: 'highlight',
  description: '高亮当前字段',
  canHandle: (key) => key === 'highlight',
  validate: (value) => typeof value === 'boolean',
  handle: (context, enabled) => {
    context.updateFieldMeta({
      componentProps: {
        style: enabled ? { background: '#fffbe6' } : undefined
      }
    });
  }
};
```

注册：

```tsx
const { isInitialized } = useInitHandlers({
  handlers: [highlightHandler],
  options: { override: false }
});
```

使用：

```ts
{
  id: 'riskLevel',
  component: 'Select',
  effect: (value) => ({
    highlight: value === 'high'
  })
}
```

完整示例见 [`demos/customHandlersDemo.tsx`](../demos/customHandlersDemo.tsx) 和 [`demos/customHandlers.ts`](../demos/customHandlers.ts)。

### 渲染扩展

当默认 `Form -> Row -> Col` 或 `Card -> Row -> Col` 结构不满足业务布局时，使用 render hooks。

```tsx
<DynamicForm
  form={form}
  formConfig={formConfig}
  renderFieldItem={({ field, defaultRender }) => {
    if (field.id !== 'email') return defaultRender;

    return (
      <div>
        <div style={{ marginBottom: 8 }}>邮箱将用于接收通知</div>
        {defaultRender}
      </div>
    );
  }}
/>
```

完整示例见 [`demos/renderExtensionDemo.tsx`](../demos/renderExtensionDemo.tsx)，系统说明见 [`rendering-and-ui.md`](./rendering-and-ui.md)。

### 校验配置

普通字段直接使用 Ant Design Form `rules`。

```ts
{
  id: 'email',
  label: '邮箱',
  component: 'TextInput',
  rules: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '邮箱格式不正确' }
  ]
}
```

隐藏字段、分组隐藏字段、disabled 字段是否参与校验由 Runtime Layer 统一决定。完整示例见 [`demos/formValidationDemo.tsx`](../demos/formValidationDemo.tsx)。

### 使用建议

- 只调整 Ant Design props：使用 `uiConfig`。
- 字段组件本身有业务交互：使用 `componentRegistry`。
- effect 返回业务语义：注册自定义 handler。
- 改变整体布局或局部结构：使用 render hooks。
- 判断字段是否渲染、提交、校验：遵循 Runtime Layer，不在业务组件里重复计算。

---

## English Documentation

This guide is for DynamicForm users. It explains how common configuration options are used together and links to the relevant demos. Examples here are intentionally small; complete scenarios live in the demo files.

### Demo Entry

Run local demos:

```bash
npm run start
```

The demo selector is [`demos/DemoSelector.tsx`](../demos/DemoSelector.tsx), and demo metadata is in [`demos/index.ts`](../demos/index.ts).

| Scenario | Demo |
| --- | --- |
| Form value sync and effect update boundary | [`demos/storeBoundaryDemo.tsx`](../demos/storeBoundaryDemo.tsx) |
| Custom effect result handlers | [`demos/customHandlersDemo.tsx`](../demos/customHandlersDemo.tsx), [`demos/customHandlers.ts`](../demos/customHandlers.ts) |
| Custom component registry | [`demos/customComponentsDemo.tsx`](../demos/customComponentsDemo.tsx) |
| Ant Design Form validation integration | [`demos/formValidationDemo.tsx`](../demos/formValidationDemo.tsx) |
| Static and dynamic UI config | [`demos/uiConfigDemo.tsx`](../demos/uiConfigDemo.tsx) |
| Render hook extensions | [`demos/renderExtensionDemo.tsx`](../demos/renderExtensionDemo.tsx) |

### Minimal Usage

Use `useInitHandlers` before rendering forms that rely on handlers, then render `DynamicForm` with an Ant Design `form` instance and `formConfig`.

### Flat and Grouped Config

Use flat config for small forms and grouped config for business sections. Grouped forms render each group with an Ant Design `Card` by default.

Detailed config options are documented in [`configuration.md`](./configuration.md).

### UI Config

Use `uiConfig` when the default Ant Design structure is correct and only props need to change. See [`demos/uiConfigDemo.tsx`](../demos/uiConfigDemo.tsx).

### Field Effects

Fields use `dependents` to declare dependencies and `effect` to return updates. Default handlers support keys such as `value`, `visible`, `disabled`, `readonly`, `componentProps`, and `formItemProps`.

For deeper details, see [`effects-and-handlers.md`](./effects-and-handlers.md) and [`runtime-layer.md`](./runtime-layer.md).

### Custom Components

Use `componentRegistry` when field input UI is business-specific. Custom components receive `field`, `value`, `onChange`, and `form`. See [`demos/customComponentsDemo.tsx`](../demos/customComponentsDemo.tsx).

### Custom Effect Handlers

Register custom handlers when effect result keys represent business semantics. Handlers should use the semantic APIs from context and should not maintain duplicate form values. See [`demos/customHandlersDemo.tsx`](../demos/customHandlersDemo.tsx) and [`demos/customHandlers.ts`](../demos/customHandlers.ts).

### Render Extensions

Use render hooks when the default `Form -> Row -> Col` or `Card -> Row -> Col` structure is not enough. See [`demos/renderExtensionDemo.tsx`](../demos/renderExtensionDemo.tsx) and [`rendering-and-ui.md`](./rendering-and-ui.md).

### Validation

Use Ant Design Form `rules` for normal fields. Runtime decides whether hidden, group-hidden, or disabled fields participate in validation. See [`demos/formValidationDemo.tsx`](../demos/formValidationDemo.tsx).

### Usage Guidance

- Use `uiConfig` for Ant Design prop changes.
- Use `componentRegistry` for business-specific field interactions.
- Use custom handlers for business-semantic effect result keys.
- Use render hooks for layout or structural changes.
- Follow Runtime Layer for rendering, submission, and validation policy.
