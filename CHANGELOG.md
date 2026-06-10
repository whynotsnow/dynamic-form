# Changelog

## 3.1.0 - Unreleased

## 中文

### Rule Engine

- 新增声明式 Rule Engine，用于同步表单联动规则。
- 新增 `RuleEngine`、`createRuleEngine`、`compileRulesToEffect`、`evaluateRule` 和规则相关公共类型导出。
- 在 field module 和 module config entry 上新增 `rules` 支持。
- 将规则编译为标准 effects，保持现有 `DynamicForm`、`processFormConfig` 和 renderer 行为不变。
- 支持从规则条件自动推导字段 `dependents`。

## English

### Rule Engine

- Added a declarative Rule Engine for synchronous form linkage rules.
- Added public exports for `RuleEngine`, `createRuleEngine`, `compileRulesToEffect`, `evaluateRule`, and rule-related public types.
- Added `rules` support to field modules and module config entries.
- Compiled rules into standard effects so existing `DynamicForm`, `processFormConfig`, and renderer behavior remain unchanged.
- Added automatic dependency inference from rule conditions into field `dependents`.

## 2.0.0 - 2026-06-02

## 中文

### 破坏性变更 / 架构调整

- 将项目重组为更清晰的分层结构：`config`、`state`、`runtime`、`consumer` 和 `shared`。
- 将默认配置和配置处理器移动到 `src/config`。
- 将渲染、Provider、hooks 和 effect 处理逻辑移动到 `src/consumer`。
- 将公共类型、上下文和工具函数移动到 `src/shared`。
- 移除 reducer 中重复维护的表单值状态，运行时表单值和校验状态以 Ant Design Form 为唯一真实来源。
- 移除旧的 logger 工具，以及旧的 batch update / result processor 结构。

### Runtime 与 State

- 新增 runtime layer，用于统一解析字段和分组的渲染、提交、编辑、只读、禁用和校验能力。
- 新增 runtime selectors、resolver 工具和 runtime state helpers。
- 将结构化状态与运行时表单值拆分，明确 store 边界。
- 新增 runtime events 和 field participation 相关 hooks。
- 收紧表单边界类型，并调整 effect result handling 语义。

### Effects 与 Handlers

- 拆分行为类 field meta 与其他字段元信息。
- 新增运行时校验层。
- 新增 effect result context 和语义化 effect result 应用工具。
- 围绕新的 consumer effect 结构重构初始化和自定义 handler 注册逻辑。

### 渲染与扩展点

- 将默认渲染逻辑重组到 consumer render 模块。
- 保留自定义组件注册作为明确的扩展点。
- 新增从 field item 到完整 form body 的分层 render hooks 支持。
- 新增 Priority 和 Operating Area 业务自定义组件示例。

### Demos

- 重构 demo registry 和 demo selector。
- 重命名 store boundary demo，并稳定 demo 行为。
- 新增 custom handlers、custom components、UI config、render extension、validation 和 store boundary 示例。
- 新增共享 demo 初始化 handler 接入。

### 测试

- 新增 store boundary Node test runner。
- 更新 demo 测试数据和 store boundary 示例。
- 移除不再匹配新架构的旧 batch update 测试。

### 文档

- 围绕当前实现重建文档体系，替换之前分散的主题文档。
- 新增或刷新架构、配置、effects and handlers、rendering and UI extension、runtime layer、development 和 maintenance 文档。
- 更新根目录 README，说明当前包行为、公共导出、设计原则、开发命令和未来 field module 方向。
- 新增 agent note 文件，记录 field module 升级方向。

### Package

- 包版本从 `1.0.2` 升级到 `2.0.0`。

## English

### Breaking / Architecture Changes

- Reorganized the project into clearer layers: `config`, `state`, `runtime`, `consumer`, and `shared`.
- Moved default config and config processor code under `src/config`.
- Moved rendering, provider, hooks, and effect handling code under `src/consumer`.
- Moved shared types, context, and utilities under `src/shared`.
- Replaced duplicated form value storage in the reducer with Ant Design Form as the runtime source of truth for values and validation state.
- Removed the old logger utility and the previous batch update/result processor structure.

### Runtime And State

- Added a runtime layer for resolving field and group capabilities such as rendering, submission, editing, readonly, disabled, and validation behavior.
- Added runtime selectors, resolver utilities, and runtime state helpers.
- Split structural state from runtime form values to make store boundaries clearer.
- Added hooks for runtime events and field participation.
- Tightened form boundary types and effect result handling semantics.

### Effects And Handlers

- Split behavior field meta handling from other field metadata.
- Added a runtime validation layer.
- Added effect result context and semantic effect result application helpers.
- Reworked initialization and custom handler registration around the new consumer effect structure.

### Rendering And Extension Points

- Reorganized default rendering into consumer render modules.
- Kept custom component registration as an explicit extension point.
- Added layered render hook support from field item rendering through full form body rendering.
- Added custom business component examples for priority and operating area fields.

### Demos

- Reworked the demo registry and demo selector.
- Renamed the store boundary demo and stabilized demo behavior.
- Added examples for custom handlers, custom components, UI config, render extension, validation, and store boundaries.
- Added shared demo initialization handler wiring.

### Tests

- Added a store boundary Node test runner.
- Updated demo test data and store boundary examples.
- Removed old batch update tests that no longer match the new architecture.

### Documentation

- Rebuilt the documentation set around the current implementation instead of the previous scattered topic files.
- Added or refreshed documentation for architecture, configuration, effects and handlers, rendering and UI extension, runtime layer, development, and maintenance.
- Updated the root README with current package behavior, public exports, design principles, development commands, and future field module direction.
- Added an agent note file that records field module upgrade direction.

### Package

- Bumped package version from `1.0.2` to `2.0.0`.
