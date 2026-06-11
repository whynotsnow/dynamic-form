# DynamicForm 文档索引

## 中文文档

这里是 DynamicForm 当前文档体系的入口。文档按照“先理解设计，再学习配置，再按使用场景落地，最后查看维护规则”的顺序组织。

### 阅读路径

1. 🏗️ [架构说明](./ARCHITECTURE.md)：理解可选预处理管线和 Config / State / Runtime / Consumer / Shared 的职责边界。
2. ⚙️ [配置指南](./configuration.md)：学习 flat、grouped、mixed 配置、字段配置、UI 配置和内置组件。
3. 🧩 [Compiler Foundation](./compiler-foundation.md)：学习字段模块、模块注册器、结构化分组编译和 compiler hooks。
4. 📐 [Rule Engine](./rule-engine.md)：学习声明式同步条件、字段/group 动作和规则所有权。
5. 🔄 [Adapter Foundation](./adapter-foundation.md)：学习 adapter 注册器和输入归一化管线。
6. 🧾 [Schema Adapters](./schema-adapters.md)：学习 JsonSchema、OpenAPI 和 metadata 映射边界。
7. 🔗 [Effect 与处理器](./effects-and-handlers.md)：学习字段联动、默认返回 key、自定义处理器和初始化约束。
8. 🎨 [渲染与 UI 扩展](./rendering-and-ui.md)：学习默认渲染结构、组件注册和分层 render hooks。
9. 🧠 [Runtime Layer](./runtime-layer.md)：理解显示、提交、禁用、只读、校验等策略如何统一计算。
10. 🧭 [组件使用指南](./development.md)：按使用场景学习配置、demo 链接、自定义组件和自定义 handlers。
11. 🛠️ [维护指南](./maintenance.md)：了解测试、构建、验证和文档维护规则。

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
- 来自 `src/shared/types.ts` 的核心公共类型。

### 设计摘要

DynamicForm 由可选预处理能力和稳定运行时主线组成：

- Adapter / Compiler / Rules：把外部输入和领域模块归一化、编译为标准 `FormConfig`。
- Config processing：把用户配置转换为字段/分组状态、初始值、依赖图和 registry 元信息。
- State：保存结构和 meta，不保存 Ant Design Form 已经管理的运行时值。
- Runtime：从 state 解析字段和分组的最终运行时能力。
- Consumer rendering：把运行时能力和配置渲染成 Ant Design UI。
- Effects and handlers：把依赖联动结果转换成语义化的表单、字段 meta、分组 meta 或 UI 更新。

### 3.0 配置管线

DynamicForm 3.0 在现有 `FormConfig` 运行时管线前新增可选 Adapter / Rule / Compiler 管线。

- [Compiler Foundation](./compiler-foundation.md)：字段模块、模块注册器、配置编译器和编译 hooks。
- [Rule Engine](./rule-engine.md)：声明式同步规则、依赖推导和字段/group 动作。
- [Adapter Foundation](./adapter-foundation.md)：adapter 注册器、结构化 `ModuleFormConfig` 和 mixed group 管线。
- [Schema Adapters](./schema-adapters.md)：基于 Adapter Foundation 的 JsonSchema、OpenAPI 和 metadata adapters。
- 现有 `FormConfig` 和 `DynamicForm` 用法保持兼容。

---

## English Documentation

This directory is the entry point for the current DynamicForm documentation. The reading order starts with design, then configuration, then usage scenarios, and finally maintenance rules.

### Reading Path

1. 🏗️ [Architecture](./ARCHITECTURE.md): optional preprocessing and Config / State / Runtime / Consumer / Shared boundaries.
2. ⚙️ [Configuration Guide](./configuration.md): flat, grouped, and mixed config, field config, UI config, and built-in components.
3. 🧩 [Compiler Foundation](./compiler-foundation.md): field modules, module registry, structured group compilation, and compiler hooks.
4. 📐 [Rule Engine](./rule-engine.md): declarative conditions, field/group actions, and rule ownership.
5. 🔄 [Adapter Foundation](./adapter-foundation.md): adapter registry and input normalization.
6. 🧾 [Schema Adapters](./schema-adapters.md): JsonSchema, OpenAPI, and metadata mapping boundaries.
7. 🔗 [Effects and Handlers](./effects-and-handlers.md): dependency effects, default result keys, custom handlers, and initialization.
8. 🎨 [Rendering and UI Extensions](./rendering-and-ui.md): default rendering, component registry, and layered render hooks.
9. 🧠 [Runtime Layer](./runtime-layer.md): rendering, submission, disabled, readonly, and validation policies.
10. 🧭 [Component Usage Guide](./development.md): usage-oriented configuration, demo links, custom components, and custom handlers.
11. 🛠️ [Maintenance Guide](./maintenance.md): tests, builds, verification, and documentation maintenance.

### Documentation Scope

The docs describe the current implementation in `src`, not aspirational APIs. When implementation changes, update the closest topic file first, then update the root `README.md` summary or links if needed.

### Public Surface Summary

The package exports:

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
- Core public types from `src/shared/types.ts`.

### Design Summary

DynamicForm combines optional preprocessing capabilities with a stable runtime pipeline:

- Adapter / Compiler / Rules normalize external input and domain modules into standard `FormConfig`.
- Config processing turns user config into field/group state, initial values, dependency maps, and registry metadata.
- State stores structure and meta, not Ant Design runtime values.
- Runtime resolves final field/group capabilities from state.
- Consumer rendering turns runtime-capable state into Ant Design UI.
- Effects and handlers translate dependency results into semantic form, meta, group, or UI updates.

### 3.0 Configuration Pipeline

DynamicForm 3.0 adds an optional adapter/rule/compiler pipeline before the existing `FormConfig` runtime pipeline.

- [Compiler Foundation](./compiler-foundation.md): field modules, module registry, config compiler, and compiler hooks.
- [Rule Engine](./rule-engine.md): declarative synchronous rules, dependency inference, and field/group actions.
- [Adapter Foundation](./adapter-foundation.md): adapter registry, structured `ModuleFormConfig`, and the mixed group pipeline.
- [Schema Adapters](./schema-adapters.md): JsonSchema, OpenAPI, and metadata adapters built on Adapter Foundation.
- Existing `FormConfig` and `DynamicForm` usage remains compatible.
