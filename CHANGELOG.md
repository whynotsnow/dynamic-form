# Changelog

## 4.2.0 - 2026-07-02

### 版本概览

- 新增 `@whynotsnow/dynamic-form-core` npm 包，承载配置处理、配置诊断、Compiler、Adapters、Rule Engine、纯 Runtime resolver、Runtime inspection helpers 和共享纯类型。
- `@whynotsnow/dynamic-form` 继续作为 React/AntD 兼容主入口，保留 `DynamicForm`、`CompiledDynamicForm`、Provider、hooks、默认 renderer、form adapters、component registry 和 effect handler runtime，并 re-export core 公共 API。
- 发布策略调整为 core 先发布、React/AntD 包后发布，并采用 lockstep version。

### 发布边界

- 当前 npm 发布包为 `@whynotsnow/dynamic-form-core` 和 `@whynotsnow/dynamic-form`。
- 根 workspace、core 包和 React/AntD 包版本号必须一致。
- `@whynotsnow/dynamic-form` 对 core 的依赖使用精确版本号，不使用 `workspace:` 协议进入 npm tarball。
- 新增 `pnpm run version:sync -- <version>` 用于同步根 package、两个发布包和 lockfile 中的版本声明。

## 4.1.2 - 2026-07-01

### 版本概览

- 补充面向可视化配置系统的配置诊断、designer metadata 和 Runtime inspection helpers。
- 收紧 Form Adapter 与 Renderer Adapter 的最低契约，明确自定义 adapter 在初始化阶段应被提前校验。
- 保持 4.1 的 Form/Renderer Adapter 兼容模型不变。

### 配置诊断与设计器元数据

- 新增 `getFormConfigDiagnostics(config, options?)` 和 `validateFormConfig(config, options?)`。
- 诊断覆盖重复 field/container/group id、重复 name path、repeatable container 缺少 `name`、空 children、未知 component、无效 group field 结构和未知 dependent。
- 字段、legacy group 和 container 支持 `designer` 元数据，用于可视化设计器保存标题、说明、分类、图标、排序、锁定状态、设计器内隐藏状态或业务自定义 metadata。
- `designer` 元数据只透传和保留，不进入 Runtime、effect、提交、校验或默认 renderer 行为。

### Runtime 与 Adapter 契约

- 新增只读 Runtime inspection helpers，用于设计器预览、调试面板和测试断言。
- 明确 `formAdapter.validateFields(names)` 应接受 `FieldNamePath[]` 并只校验传入字段。
- 明确 `formAdapter.getFieldsValue(true)` 应返回包含嵌套路径的完整 values。
- 明确 `renderer.renderForm()` 和 `renderer.renderFieldItem()` 的必需行为。
- 自定义 adapter 可通过 `assertFormAdapter` / `assertRendererAdapter` 在初始化阶段提前校验。

### Package

- 根 workspace 和 `@whynotsnow/dynamic-form` package 版本升级到 `4.1.2`。

## 4.1.1 - 2026-07-01

### 版本概览

- 在 4.1 Form/Renderer Adapter 基础上补充无组件库依赖的 reference 实现和 runtime guard。
- 提供适合测试、自定义 renderer 示例和可视化预览态的内存表单运行时。

### Form / Renderer Adapter

- 新增 `createMemoryFormAdapter(initialValues)`，维护内存 values store，并提供 no-op `validateFields`。
- 新增 `headlessRenderer`，使用原生 HTML 元素渲染最小表单外壳。
- 新增 `assertFormAdapter` 和 `assertRendererAdapter`，用于校验自定义 adapter 的必需方法。
- `headlessRenderer` 仅作为 reference implementation，不定位为生产级组件库 renderer。

### Package

- 根 workspace 和 `@whynotsnow/dynamic-form` package 版本升级到 `4.1.1`。

## 4.1.0 - 2026-07-01

### 版本概览

- 新增 Form Adapter 和 Renderer Adapter 扩展入口，让 DynamicForm 的值读写、校验和默认 UI 外壳从 Ant Design 默认实现中抽象出来。
- 旧的 `<DynamicForm form={form} />` AntD 用法保持兼容；未传 adapter 时默认转换为 `createAntdFormAdapter(form)`，未传 renderer 时使用 `antdRenderer`。
- 4.1 不内置 Arco、Semi 或其他组件库 renderer，只提供 AntD 默认实现和扩展接口。

### Form Adapter

- 新增中立表单运行时接口，封装 `getFieldValue`、`getFieldsValue`、`setFieldValue`、`setFieldsValue` 和 `validateFields`。
- 新增 `createAntdFormAdapter(form)`，将 Ant Design Form 实例转换为中立 adapter。
- effect result handlers、提交、隐藏字段参与策略和运行时校验改为通过 form adapter 读写 values 和执行校验。

### Renderer Adapter

- 新增 `renderer` 扩展入口，负责默认 form、字段项、字段集合布局、字段布局、分组容器、repeatable container 和提交按钮外壳。
- 默认 `antdRenderer` 继续使用 Ant Design `Form`、`Form.Item`、`Form.List`、`Row`、`Col`、`Card` 和 `Button`。
- render hooks 保持更靠近业务侧的覆盖层；renderer 生成 `defaultRender` 后，仍可被 `renderFieldItem`、`renderFields`、`renderGroupItem`、`renderGroups` 或 `renderFormInner` 包装或替换。

### Package

- 根 workspace 和 `@whynotsnow/dynamic-form` package 版本升级到 `4.1.0`。

## 4.0.0 - 2026-07-01

### 版本概览

- 新增统一节点树 `FormConfig.nodes` 和 `ModuleFormConfig.nodes`，支持递归 `FieldNode` / `ContainerNode`。
- 引入 container 作为通用结构边界，覆盖嵌套布局、父级可见性传递和 repeatable container 场景。
- `fields`、`groups`、mixed 配置和 `CompiledDynamicForm` 继续兼容，原有单层表单用法不需要立即迁移。

### 统一节点树

- `FormConfig` 可以同时包含 `nodes`、`fields` 和 `groups`。
- 配置处理阶段会把三种入口归一化为同一棵节点树，并生成 node registry、container registry、field registry 和 field address registry。
- legacy `groups` 会转换为顶层 container。
- 字段 `id` 继续作为 Runtime、effect graph 和 meta 更新使用的稳定标识。
- 字段和 container 的 `name` 用于组成 Ant Design `NamePath`，不替代稳定 `id`。

### Container 与 Repeatable

- 新增 `ContainerNode`，支持 `children` 递归嵌套字段和子 container。
- `ContainerNode.name` 可作为后代字段值路径前缀。
- `repeatable: true` 的 container 必须声明 `name`，默认 renderer 通过 Ant Design `Form.List` 渲染已有重复项。
- 新增、删除、排序等 repeatable 操作不由默认 renderer 内置，应由业务 UI、render hooks 或自定义容器封装提供。

### Runtime 与渲染

- Runtime 沿父级 container 可见性解析字段、group 和 container 能力。
- 隐藏父级会影响所有后代字段的渲染、提交和校验参与。
- 默认 renderer 会按归一化 root nodes 顺序渲染节点树，并在 container 边界内递归渲染字段段。
- Field Address、effect graph 和运行时 meta 更新继续使用稳定字段 `id`，提交值继续保留 Ant Design `NamePath` 对应的嵌套结构。

### Compiler、Adapter 与 Rules

- Compiler 支持输出 `nodes` 结构。
- Rule Engine 支持字段、group 和 container 上的规则，并在 compiler 阶段转换为标准 effect。
- Schema / metadata adapter 可以继续输出 flat/grouped 配置，也可以通过模块配置进入节点树编译路径。

### Package

- 根 workspace 和 `@whynotsnow/dynamic-form` package 版本升级到 `4.0.0`。

## 3.4.0 - 2026-06-30

### 版本概览

- 发布 4.0 前置兼容版本，明确 3.x 主模型和 4.0 结构性重构边界。
- 3.4 不引入统一节点树、container、nested group 或跨层级 effect graph 主流程。

### 迁移基线

- 新增 3.x 兼容与 4.0 迁移基线文档，说明当前主流程仍是 `FormConfig -> adapter/compiler -> processFormConfig -> Runtime -> renderer`。
- 明确 4.0 才会引入统一 Form Node Tree、container、跨层级 effect graph 和完整嵌套结构模型。
- 建议 3.x 用户提前使用稳定 `id`、显式 `name`、schema metadata 和同步 rules/effects 边界，为 4.0 兼容适配层做准备。

### 测试与文档

- 补充 3.x 兼容护栏测试，确保 nested object schema、object array schema、重复 field/group id 和重复 `name` path 继续被拒绝。
- 同步新增 package docs、docs-site 中文文档和英文 i18n 文档的 4.0 preview 说明。

### Package

- 根 workspace 和 `@whynotsnow/dynamic-form` package 版本升级到 `3.4.0`。

## 3.3.0 - 2026-06-30

### 版本概览

- 发布兼容性小增强，继续保持现有 `FormConfig`、Runtime 和 renderer 行为不变。
- Schema / metadata adapter 增加显式 Field Address `name` passthrough 能力，方便外部 schema 输入生成嵌套 values。

### Adapter 与 Runtime 类型

- `SchemaAdapterFieldMetadata` 支持声明 `name`，适配结果会写入 module config 的 `overrides.name`。
- `MetadataAdapterField` 支持声明 `name`，同样转入 `overrides.name`。
- 包根入口新增 `FieldCapability`、`GroupCapability` 和 `RuntimeState` 类型导出。
- Schema adapters 仍要求显式 module metadata，不根据 schema primitive type 推断 UI，也不展开 nested object 或 object array。

### 测试与文档

- 补充 JsonSchema、OpenAPI 和 Metadata adapter 的显式 `name` 映射测试。
- 补充包根 Runtime 类型导出的 TypeScript 检查。
- 同步更新 package docs、docs-site 中文文档和英文 i18n 文档。

### Package

- 根 workspace 和 `@whynotsnow/dynamic-form` package 版本升级到 `3.3.0`。

## 3.2.1 - 2026-06-30

### 版本概览

- 发布 3.2 稳定性补丁，继续保持 `FormConfig`、Field Address、Runtime Layer 和同步 effect 边界兼容。
- 不新增 public API，不引入 container、递归节点树、nested group 或跨层级 effect graph。

### 测试与文档

- 补充 grouped field 的嵌套 `name` 路径、flat/group 重复 `name` 路径和函数式 `initialValue` 的 Field Address 测试。
- 补充 Runtime 对 group 隐藏、disabled 字段校验能力和 hidden field preserve/restore 策略的护栏测试。
- 同步补强 package docs、docs-site 中文文档和英文 i18n 文档中的 3.2 能力边界。

### Package

- 根 workspace 和 `@whynotsnow/dynamic-form` package 版本升级到 `3.2.1`。

## 3.2.0 - 2026-06-30

### 版本概览

- 将当前实现基线校正为 `3.2.0`，用于归档 monorepo 化、docs-site、demo 复用边界和当前文档体系。
- 保持 `@whynotsnow/dynamic-form` 的 public export surface 与 3.1 配置兼容；根目录继续作为 private workspace root，不作为 npm 发布包。
- 明确库级同步边界：DynamicForm 核心不支持库级异步 effect 或 async validation compile。异步请求、远程选项、搜索联想和服务端校验等场景应由自定义字段组件或业务容器封装。

### Monorepo 与发布边界

- 仓库已调整为 private pnpm workspace root，当时 npm 发布包为 `packages/dynamic-form/`。
- 新增 Docusaurus docs-site workspace：`apps/docs-site/`，站点中文文档与英文 i18n 文档独立维护。
- 根 `demos/` 作为 Vite demo 和 docs-site 的 demos 页面复用的业务 demo 来源，避免在站点复制 demo 逻辑。
- 根 `docs/` 只维护 monorepo 级架构、维护、发布和站点规划文档；库权威文档保留在 `packages/dynamic-form/docs/`。

### 文档与能力基线

- 保留并整理 Compiler、Module Registry、Adapter Registry、Schema Adapters、同步 Rule Engine、Runtime Layer、Field Address 和 `CompiledDynamicForm` 的公共 API 与文档。
- 将当前文档中的 Field Address 基线统一到 `3.2`，与 package 版本保持一致。
- Schema adapters 继续保持显式 module metadata 策略，不根据 schema primitive type 自动推断 UI 或 module type。
- JsonSchemaAdapter 的 nested object / object array 不支持错误信息同步更新为当前 `3.2` 版本。

### 异步边界

- Effect result handling 保持同步边界；自定义 `EffectResultHandler` 不承载异步任务调度、请求生命周期、loading/error/cache 或竞态控制。
- Rule Engine 仅支持同步求值，不实现异步/API 规则、远程规则、请求取消或竞态策略。
- Schema / Adapter 管线不提供 async validation compile。
- Demo 中移除容易误导的异步 handler 示例。

### Package

- 根 workspace 和 `@whynotsnow/dynamic-form` package 版本升级到 `3.2.0`。

## 3.1.0 - 2026-06-12

### 版本概览

- 新增 Field Address 基础能力，将字段稳定逻辑标识 `id` 与 Ant Design Form 值路径 `name` 分离。
- 支持通过 Ant Design `NamePath` 表达嵌套 values，同时保持 effect graph、Runtime、field registry 和 meta 更新继续使用稳定字段 `id`。
- 未声明 `name` 时默认继续使用 `id`，原有单层字段配置无需迁移。

### Field Address 与嵌套值

- 新增 `FieldAddress` 描述字段 `id` 与 `name` 的对应关系。
- 新增 `resolveFieldAddress()` 和 `getFieldName()` 公共工具，便于自定义渲染、`Form.Item`、`Form.List` 和手工校验调用复用同一值路径解析策略。
- `processFormConfig()` 会生成 `fieldAddressRegistry`，并在初始化阶段按 `NamePath` 写入嵌套 initial values。
- 函数式 `initialValue` 和 effect values 快照同时保留嵌套值结构，并提供按稳定字段 `id` 读取的别名。
- `onValuesChange` 会把 Ant Design 嵌套 changed values 映射回稳定字段 `id`，再触发 effect chain。

### Runtime、校验和提交

- 默认字段渲染器使用 `getFieldName(field)` 作为 Ant Design `Form.Item.name`。
- Runtime 校验流程会把 validatable field ids 转换为对应 `NamePath` 后再调用 `form.validateFields()`。
- 提交值继续从 Ant Design Form 读取，因此嵌套值结构会保留在提交结果中。
- 隐藏字段参与策略继续按 Runtime `submitable` 能力清理或恢复对应 `NamePath` 下的值。

### 边界与兼容性

- Field Address 只提供字段寻址和嵌套值路径基础，不引入 container 字段、递归节点树或 nested group。
- 字段和 group 的 `id` 仍须全局唯一；两个字段不能使用相同 `name` 路径。
- `dependents`、rule dependencies 和 effect graph 节点仍引用稳定字段 `id`，不引用 Ant Design `NamePath`。

### Package

- 根 workspace 和 `@whynotsnow/dynamic-form` package 版本升级到 `3.1.0`。

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
