---
slug: /
---

# DynamicForm 文档索引

这里是 DynamicForm 4.1 的文档入口。首次使用建议先从快速开始跑通最小表单，再按业务场景查找配置、联动、校验和扩展方式；架构、Runtime、Compiler、Adapter、Renderer 和节点树等专题用于深入理解和维护。

### 推荐路径

1. 🚀 [快速开始](./quick-start.md)：安装、最小表单、提交处理和本地 demo。
2. ⚙️ [配置指南](./configuration.md)：学习字段、分组、节点树、UI 配置和内置组件。
3. 🔗 [Effect 与处理器](./effects-and-handlers.md)：学习字段联动、默认返回 key、自定义处理器和初始化约束。
4. 🎨 [渲染与 UI 扩展](./rendering-and-ui.md)：学习默认渲染结构、组件注册和分层 render hooks。
5. 🧭 [组件使用指南](./development.md)：按使用场景查找 demo、配置组合、自定义组件和自定义 handlers。
6. 🧩 [高级配置管线](./compiler-foundation.md)：需要字段模块、递归 container、规则或外部 schema 输入时，再阅读 Compiler、Rule、Adapter 和 Schema Adapters 专题。
7. 🧠 [深入理解](./ARCHITECTURE.md)：通过架构、Runtime Layer、Renderer Adapter 和 Field Address 理解运行时边界与 4.1 结构模型。
8. 🛠️ [维护指南](./maintenance.md)：了解测试、构建、验证和文档维护规则。

### 文档范围

文档描述当前 `src` 中已经实现的行为，不描述尚未实现的规划型 API。源码行为变化时，应先更新最接近的专题文档，再同步根目录 `README.md` 中的摘要或链接。

### 公共导出概览

包主要导出：

- `DynamicForm`
- `CompiledDynamicForm`
- `DynamicFormProvider`
- `FormChainEffectEngineWrapper`
- `useInitHandlers`
- `useStoreInit`
- `useFormChainContext`
- `ComponentRegistryManager`
- `DefaultRegistryFieldComponents`
- `getDefaultConfig`
- `processFormConfig`
- `compileFormConfig`
- `ModuleRegistryManager`
- `defaultModuleRegistry`
- `AdapterRegistryManager`
- `defaultAdapterRegistry`
- `adaptModuleConfigs`
- `compileAdaptedFormConfig`
- `JsonSchemaAdapter`
- `OpenApiAdapter`
- `MetadataAdapter`
- `ModuleConfigPassthroughAdapter`
- `RuleEngine`
- `createRuleEngine`
- `compileRulesToEffect`
- `evaluateRule`
- `getFieldName`
- `resolveFieldAddress`
- `createAntdFormAdapter`
- `antdRenderer`
- 来自 `packages/dynamic-form/src/shared/types.ts` 的核心公共类型。
- Runtime 类型：`FieldCapability`、`GroupCapability`、`RuntimeState`。

### 设计摘要

DynamicForm 由可选预处理能力和稳定运行时主线组成：

- Adapter / Compiler / Rules：把外部输入和领域模块归一化、编译为标准 `FormConfig`。
- Config processing：把用户配置转换为字段/分组状态、初始值、依赖图和 registry 元信息。
- State：保存结构和 meta，不保存表单运行时 values、errors、touched 或 validating 状态。
- Runtime：从 state 解析字段和分组的最终运行时能力。
- Form Adapter：封装值读写和校验；默认通过 `createAntdFormAdapter(form)` 兼容 AntD Form。
- Consumer rendering：把运行时能力和配置交给 renderer；默认 `antdRenderer` 渲染 Ant Design UI。
- Effects and handlers：把依赖联动结果转换成语义化的表单、字段 meta、分组 meta 或 UI 更新。

### 4.1 Adapter 基础

DynamicForm 4.1 新增 `formAdapter` 和 `renderer` 扩展入口。旧的 `<DynamicForm form={form} />` 用法保持兼容；未传 adapter 时使用 AntD 默认实现。4.1 不拆包，也不内置第二套组件库 renderer。

### 4.0 配置模型

DynamicForm 4.0 将 `FormConfig.nodes` 和 `ModuleFormConfig.nodes` 纳入当前能力基线。`fields` 与 `groups` 仍保持兼容，但内部会归一化为统一节点树：

- `FieldNode`：字段节点，继续使用 `id` 作为 Runtime、registry 和 effect graph 的稳定标识。
- `ContainerNode`：容器节点，可嵌套字段或子容器，可通过 `name` 为子字段追加 Ant Design `NamePath` 前缀。
- `repeatable` container：基于 Ant Design `Form.List` 渲染重复项，必须声明 `name`。
- Runtime 会沿父级 container 可见性解析字段、container 的最终渲染能力。

旧的 `fields`、`groups` 和 mixed 配置不需要迁移；它们会被当作顶层字段和顶层 container 处理。

### 配置管线

DynamicForm 在 `FormConfig` 运行时管线前提供可选 Adapter / Rule / Compiler 管线。

- [Compiler Foundation](./compiler-foundation.md)：字段模块、模块注册器、配置编译器和编译 hooks。
- [Rule Engine](./rule-engine.md)：声明式同步规则、依赖推导和字段/group 动作。
- [Adapter Foundation](./adapter-foundation.md)：adapter 注册器、结构化 `ModuleFormConfig` 和 mixed group 管线。
- [Schema Adapters](./schema-adapters.md)：基于 Adapter Foundation 的 JsonSchema、OpenAPI 和 metadata adapters。
- 现有 `FormConfig` 和 `DynamicForm` 用法保持兼容。

### Field Address

DynamicForm 将稳定字段 `id` 与 Ant Design `NamePath` 分离。未声明 `name` 时继续使用 `id`，因此原有配置保持兼容；在 container 内，字段 `name` 会与父级 container `name` 前缀组合。详见 [Field Address](./field-address.md)。
