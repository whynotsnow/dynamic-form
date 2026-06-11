# DynamicForm 文档索引

## 中文文档

这里是 DynamicForm 当前文档体系的入口。文档按照“先理解设计，再学习配置，再按使用场景落地，最后查看维护规则”的顺序组织。

### 阅读路径

1. 🏗️ [架构说明](./ARCHITECTURE.md)：理解 Config / State / Runtime / Consumer / Shared 的职责边界。
2. ⚙️ [配置指南](./configuration.md)：学习平铺表单、分组表单、字段配置、UI 配置和内置组件。
3. 🔗 [Effect 与处理器](./effects-and-handlers.md)：学习字段联动、默认返回 key、自定义处理器和初始化约束。
4. 🎨 [渲染与 UI 扩展](./rendering-and-ui.md)：学习默认渲染结构、组件注册和分层 render hooks。
5. 🧠 [Runtime Layer](./runtime-layer.md)：理解显示、提交、禁用、只读、校验等策略如何统一计算。
6. 🧭 [组件使用指南](./development.md)：按使用场景学习配置、demo 链接、自定义组件和自定义 handlers。
7. 🛠️ [维护指南](./maintenance.md)：了解测试、构建、验证和文档维护规则。

### 文档范围

文档描述当前 `src` 中已经实现的行为，不描述尚未实现的规划型 API。源码行为变化时，应先更新最接近的专题文档，再同步根目录 `README.md` 中的摘要或链接。

### 公共导出概览

包主要导出：

- `DynamicForm`
- `DynamicFormProvider`
- `FormChainEffectEngineWrapper`
- `useInitHandlers`
- `useStoreInit`
- `useFormChainContext`
- `ComponentRegistryManager`
- `DefaultRegistryFieldComponents`
- `getDefaultConfig`
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
- `RuleEngine`
- `createRuleEngine`
- `compileRulesToEffect`
- `evaluateRule`
- 来自 `src/shared/types.ts` 的核心公共类型。

### 设计摘要

DynamicForm 按五个职责组织：

- Config processing：把用户配置转换为字段/分组状态、初始值、依赖图和 registry 元信息。
- State：保存结构和 meta，不保存 Ant Design Form 已经管理的运行时值。
- Runtime：从 state 解析字段和分组的最终运行时能力。
- Consumer rendering：把运行时能力和配置渲染成 Ant Design UI。
- Effects and handlers：把依赖联动结果转换成语义化的表单、字段 meta、分组 meta 或 UI 更新。

---

## English Documentation

This directory is the entry point for the current DynamicForm documentation. The reading order starts with design, then configuration, then usage scenarios, and finally maintenance rules.

### Reading Path

1. 🏗️ [Architecture](./ARCHITECTURE.md): Config / State / Runtime / Consumer / Shared boundaries.
2. ⚙️ [Configuration Guide](./configuration.md): flat forms, grouped forms, field config, UI config, and built-in components.
3. 🔗 [Effects and Handlers](./effects-and-handlers.md): dependency effects, default result keys, custom handlers, and initialization.
4. 🎨 [Rendering and UI Extensions](./rendering-and-ui.md): default rendering, component registry, and layered render hooks.
5. 🧠 [Runtime Layer](./runtime-layer.md): rendering, submission, disabled, readonly, and validation policies.
6. 🧭 [Component Usage Guide](./development.md): usage-oriented configuration, demo links, custom components, and custom handlers.
7. 🛠️ [Maintenance Guide](./maintenance.md): tests, builds, verification, and documentation maintenance.

### Documentation Scope

The docs describe the current implementation in `src`, not aspirational APIs. When implementation changes, update the closest topic file first, then update the root `README.md` summary or links if needed.

### Public Surface Summary

The package exports:

- `DynamicForm`
- `DynamicFormProvider`
- `FormChainEffectEngineWrapper`
- `useInitHandlers`
- `useStoreInit`
- `useFormChainContext`
- `ComponentRegistryManager`
- `DefaultRegistryFieldComponents`
- `getDefaultConfig`
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
- `RuleEngine`
- `createRuleEngine`
- `compileRulesToEffect`
- `evaluateRule`
- Core public types from `src/shared/types.ts`.

### Design Summary

DynamicForm is organized around five responsibilities:

- Config processing turns user config into field/group state, initial values, dependency maps, and registry metadata.
- State stores structure and meta, not Ant Design runtime values.
- Runtime resolves final field/group capabilities from state.
- Consumer rendering turns runtime-capable state into Ant Design UI.
- Effects and handlers translate dependency results into semantic form, meta, group, or UI updates.

### 3.0 Compiler Foundation

DynamicForm 3.0 在现有 `FormConfig` 管线前新增可选编译层。

- [Compiler Foundation](./compiler-foundation.md)：字段模块、模块注册器、配置编译器和编译 hooks。
- [Adapter Foundation](./adapter-foundation.md)：adapter 注册器、结构化 `ModuleFormConfig` 和 mixed group 管线。
- [Schema Adapters](./schema-adapters.md)：基于 Adapter Foundation 的 JsonSchema、OpenAPI 和 metadata adapters。
- 新增公共 API 包括 `compileFormConfig`、`ModuleRegistryManager`、`defaultModuleRegistry` 和 `processFormConfig`。
- 现有 `FormConfig` 和 `DynamicForm` 用法保持兼容。

DynamicForm 3.0 adds an optional compiler layer before the existing `FormConfig` pipeline.

- [Compiler Foundation](./compiler-foundation.md): field modules, module registry, config compiler, and compiler hooks.
- [Adapter Foundation](./adapter-foundation.md): adapter registry, structured `ModuleFormConfig`, and the mixed group pipeline.
- [Schema Adapters](./schema-adapters.md): JsonSchema, OpenAPI, and metadata adapters built on Adapter Foundation.
- New public APIs include `compileFormConfig`, `ModuleRegistryManager`, `defaultModuleRegistry`, and `processFormConfig`.
- Existing `FormConfig` and `DynamicForm` usage remains compatible.
