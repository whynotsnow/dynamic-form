# Changelog

## 3.0.0 - 2026.06.16

### 版本概览

- 在 2.0 Runtime/State 分层基础上新增模块编译、声明式规则、输入适配和 Schema Adapter 能力，使 DynamicForm 从直接配置驱动扩展为可选的领域模块编译管线。
- 保留现有 `FormConfig -> processFormConfig -> Runtime -> Renderer` 主流程；已有 `DynamicForm` 与手写 `FormConfig` 用法无需迁移。
- 新增 `CompiledDynamicForm`，可直接渲染 compiler/adapter 产物并自动合并编译生成的组件注册表。

### Compiler 与字段模块

- 新增 `FieldModule` 协议、`ModuleRegistryManager` 和 `defaultModuleRegistry`，支持注册可复用字段模块，并默认拒绝重复模块类型。
- 新增 `compileFormConfig()`，将结构化 `ModuleFormConfig` 编译为标准 `FormConfig` 与 `componentRegistry`。
- 支持模块级 `createConfig`、组件、默认 props、依赖、effect、规则，以及实例级 `options`、`rules` 和 `overrides` 合并。
- 新增 `beforeCompile`、`beforeGroupExpand`、`afterGroupExpand`、`beforeModuleExpand`、`afterModuleExpand` 和 `afterCompile` hooks。
- 编译器支持 flat、grouped 和 mixed 输出；字段通过 `groupId` 加入 group，未分组字段保留在顶层。
- 新增全局字段/group ID 唯一性、group 引用有效性、非空 group 和未注册模块检查。

### 声明式 Rule Engine

- 新增声明式 Rule Engine，用于同步表单联动规则。
- 新增 `RuleEngine`、`createRuleEngine`、`compileRulesToEffect`、`evaluateRule` 和规则相关公共类型导出。
- 支持 `equals`、`notEquals`、`empty`、`notEmpty`、`all`、`any` 和 `not` 同步条件。
- 支持 `show`、`hide`、`enable`、`disable`、`readonly`、`editable`、`setValue` 和 `clearValue` 字段动作。
- 将规则编译为标准 effect，并从 `when` 条件自动推导 `dependents`；已有手写 effect 先执行，规则结果后合并。
- 支持 group-owned rules，group 动作限定为 `show` 和 `hide`。
- Rule 由被影响字段或 group 持有，不支持 `target`；一个源字段影响多个字段时，应在多个被影响字段上分别声明 rule。

### Adapter 与 Schema 输入

- 新增 `ModuleConfigAdapter` 协议、`AdapterRegistryManager`、`defaultAdapterRegistry`、`adaptModuleConfigs()` 和 `compileAdaptedFormConfig()`。
- 新增 `ModuleConfigPassthroughAdapter`，支持结构化模块配置直接进入 adapter/compiler 管线。
- 新增 `JsonSchemaAdapter`、`OpenApiAdapter` 和 `MetadataAdapter`。
- JsonSchema/OpenAPI 字段必须显式声明 dynamic-form module metadata，不根据 schema primitive type 猜测 UI 或模块类型。
- 支持从 JsonSchema/OpenAPI 顶层 metadata 声明 groups，并通过属性级 `groupId` 建立成员关系。
- 新增 `groupOverrides`，可在 schema 适配后、编译前注入函数 effect，并合并 group 依赖和规则。
- Schema `required` 统一映射到字段声明语义，由默认 Ant Design renderer 生成最终 required rule。

### 配置、渲染与校验

- `FormConfig` 现在可同时包含顶层 `fields` 和 `groups`，默认渲染顺序为未分组字段在前、分组字段在后。
- 配置处理器支持 mixed config，并对重复字段/group ID 和空配置提前报错。
- 默认字段渲染器会将 `BaseFieldConfig.required` 合并为 Ant Design required rule；已有显式 required rule 时不会重复添加。
- 不可校验字段继续移除 rules 和 required 标记，保持 Runtime `validatable` 策略一致。
- 移除 reducer、render、submit、初始值和 effect 执行主路径中的无条件过程日志；`useInitHandlers({ debug: true })` 可按需启用处理器诊断，配置错误和初始化契约问题仍保留告警。

### 公共 API、测试与文档

- 从包根入口导出 compiler、module registry、adapter、schema adapter、rule engine、`CompiledDynamicForm` 及相关公共类型。
- 新增 compiler、adapter、schema adapter、rule engine 和字段校验测试，覆盖 mixed/grouped 编译、规则依赖推导、adapter 解析和错误边界。
- 新增 Compiler Foundation、Adapter Foundation 和 Schema Adapters 中文文档，并更新 README、配置、渲染和维护文档及 compiler demo。

### 兼容性与限制

- 现有 `DynamicForm` props、手写 `FormConfig`、`processFormConfig()`、Runtime Layer 和 effect handler 管线保持兼容。
- Ant Design Form 仍负责 values、validation、touched 和 submit runtime state；DynamicForm 不引入重复 values store。
- Rule Engine 仅支持同步规则，不包含异步/API 规则或独立 validation rule engine。
- Schema Adapter 当前不展开 nested object、object array item 或 nested group，也不允许一个字段属于多个 group。

### Package

- 包版本升级到 `3.0.0`。
- 移除仅用于 reducer 便利写法的 `immer` 运行时依赖，改用显式不可变状态更新。


## 2.0.0 - 2026-06-02

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

