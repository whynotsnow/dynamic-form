# DynamicForm 用法和配置总览

## 📖 1. 简介

**DynamicForm** 是一个基于 **React + Ant Design** 的动态表单引擎，通过 **配置化驱动** 和 **依赖链联动** 快速构建复杂表单。  
它内置了 **依赖解析引擎 [form-chain-effect-engine](https://www.npmjs.com/package/form-chain-effect-engine)**，支持字段初始化、副作用联动、批量更新等逻辑。

**核心目标：**

- 📦 提供统一的 **表单配置入口**
- ♻️ 支持 **业务无关的复用能力**（自定义组件、自定义处理器）
- 🔄 简化 **状态管理与渲染解耦**

---

## ✨ 2. 特性

- 🎯 **动态驱动**：基于 `formConfig` 配置渲染表单，无需手写模板
- 🔗 **依赖联动**：支持 `dependents + effect` 的响应式依赖机制
- 🏗️ **组件解耦**：通过 `componentRegistry` 注册扩展自定义组件
- ⚡ **性能优化**：批量更新 + 链路优化，减少多余渲染
- 🧩 **灵活扩展**：自定义处理器、渲染扩展函数接入复杂需求
- 📝 **类型安全**：完整 TypeScript 支持

---

## 🔧 3. 搭配的 Hooks

### `useInitHandlers`

用于在表单渲染前完成 **处理器初始化**，确保 effect 链路与自定义逻辑生效。

**能力：**

1. 自动初始化（只执行一次）
2. 初始化状态与错误管理
3. 调试模式（日志输出）
4. 与 **DynamicFormProvider** 协作完成表单初始化

**示例：**

```tsx
const CustomHandlersDemo: React.FC = () => {
  const { isInitialized, error } = useInitHandlers({
    handlers: exampleHandlers,
    options: { override: false },
    debug: true
  });
  const [form] = Form.useForm();

  if (!isInitialized) return <div>正在初始化...</div>;
  if (error) return <div>初始化失败: {error}</div>;

  return <DynamicForm formConfig={formConfig} form={form} onSubmit={handleSubmit} />;
};
```

👉 [自定义 Handlers 配置](./功能配置指引文档.md)

---

## ⚙️ 4. DynamicForm Props 总览

| 属性              | 说明             | 类型                                          | 必填 | 默认值 |
| ----------------- | ---------------- | --------------------------------------------- | ---- | ------ |
| formConfig        | 表单配置入口     | `FormConfig`                                  | ✅   | -      |
| form              | Antd Form 实例   | `FormInstance`                                | ✅   | -      |
| onSubmit          | 提交回调         | `(values: Record<string, any>) => void`       | ✅   | -      |
| submitButtonText  | 提交按钮文案     | `string`                                      | ❌   | -      |
| componentRegistry | 自定义组件注册表 | `ComponentRegistry`                           | ❌   | -      |
| values            | 初始值           | `Record<string, any>`                         | ❌   | -      |
| renderFormInner   | 自定义表单结构   | `(params:RenderFormParams) => ReactNode`      | ❌   | -      |
| renderGroups      | 自定义分组容器   | `(params: RenderGroupsParams) => ReactNode`   | ❌   | -      |
| renderGroupItem   | 自定义分组项     | `(params:RenderGroupItemParams) => ReactNode` | ❌   | -      |
| renderFields      | 自定义字段集合   | `(params:RenderFieldsParams) => ReactNode`    | ❌   | -      |
| renderFieldItem   | 自定义单字段项   | `(params:RenderFieldItemParams) => ReactNode` | ❌   | -      |

---

### 4.1 `formConfig` 基础配置

支持 **平铺配置** 与 **分组配置**：

```ts
const formConfig: FlatFormConfig = {
  fields: [
    { id: 'username', label: '用户名', component: 'TextInput', rules: [{ required: true }] },
    { id: 'password', label: '密码', component: 'Password', dependents: ['confirmPassword'] },
    { id: 'confirmPassword', label: '确认密码', component: 'Password' }
  ]
};
```

👉 [更多配置详见 FORM_CONFIG.md](./FORM_CONFIG.md)

#### 核心概念：

- `component`：内置或自定义组件
- `span`：栅格布局（默认 8）
- `initialValue`：字段初始状态（可函数化）
- `effect`：字段副作用逻辑
- `dependents`：依赖声明，触发链式联动
- `formItemProps`：静态 Form.Item 参数
- `componentProps`：传递给组件的参数

---

### 4.2 `componentRegistry`

注册自定义组件：

```tsx
<DynamicForm componentRegistry={{ customComponents, allowOverride: false }} />
```

👉 [注册自定义组件](./功能配置指引文档.md)

---

### 4.3 `values` 与 `initialValue`

- **values**：表单整体赋值（编辑/详情场景）
- **initialValue**：字段级初始化逻辑（可依赖其他字段）

---

### 4.4 - 4.8 渲染扩展

支持 **插拔式渲染控制**：  
`renderFormInner`、`renderGroups`、`renderGroupItem`、`renderFields`、`renderFieldItem`

示例：自定义分组渲染为 Tabs

```tsx
const renderGroups = ({ groupFields, renderGroupItem }: RenderGroupsParams) => {
  const items = Object.values(groupFields).map((group) => ({
    key: group.id,
    label: group.title,
    children: renderGroupItem(group)
  }));
  return <Tabs defaultActiveKey={items[0]?.key} items={items} />;
};
```

---

## 📚 相关文档

- [功能配置指引](./功能配置指引文档.md)
- [表单配置 FORM_CONFIG.md](./FORM_CONFIG.md)
- [Store 层级模型与设计架构](./Store层级模型与设计架构.md)

---
