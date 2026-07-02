# CHANGELOG

本页是面向文档站读者的版本记录摘要，用来快速判断版本能力、迁移影响和相关专题入口。完整发布明细仍以仓库根目录 `CHANGELOG.md` 为准。

### 当前版本

当前文档基线是 DynamicForm 4.2。它在 4.0 统一节点树和 4.1 Form/Renderer Adapter 基础上，新增 `@whynotsnow/dynamic-form-core` 纯核心包；`@whynotsnow/dynamic-form` 继续作为 React/AntD 兼容主入口并 re-export core 公共 API。

当前主流程仍是 `FormConfig -> adapter/compiler -> processFormConfig -> Runtime -> renderer`。其中配置处理、Compiler、Adapters、Rules 和纯 Runtime resolver 归属 core；React Provider、hooks、form adapters、renderers、component registry 和 effect handler runtime 归属 `@whynotsnow/dynamic-form`。

### 版本时间线

#### 4.2.0 - 2026-07-02

- 新增 `@whynotsnow/dynamic-form-core` 包，承载配置处理、配置诊断、Compiler、Adapters、Rule Engine、纯 Runtime resolver 和 Runtime inspection helpers。
- `@whynotsnow/dynamic-form` 保持旧 import 兼容，继续导出 React/AntD 运行时能力，并 re-export core 公共 API。
- 发布流程调整为 core 先发布、React/AntD 包后发布，并采用统一版本号策略。

相关专题：[Core Package](./core-package.md)。

#### 4.1.0 - 4.1.2 - 2026-07-01

- 4.1 新增 `formAdapter` 和 `renderer` 扩展入口，旧的 AntD `form` 用法继续兼容。
- 4.1.1 增加 `createMemoryFormAdapter`、`headlessRenderer` 和 adapter runtime guard，便于测试、自定义 renderer 示例和可视化预览。
- 4.1.2 增加配置诊断、designer metadata 和 Runtime inspection helpers，并明确自定义 form adapter / renderer 的最低契约。

相关专题：[渲染与 UI 扩展](./rendering-and-ui.md)、[配置指南](./configuration.md)、[Runtime Layer](./runtime-layer.md)。

#### 4.0.0 - 2026-07-01

- 新增 `FormConfig.nodes` 和 `ModuleFormConfig.nodes`，支持递归 `FieldNode` / `ContainerNode`。
- `ContainerNode.name` 可作为后代字段 Ant Design `NamePath` 前缀；`repeatable` container 通过 Ant Design `Form.List` 渲染已有重复项。
- Runtime 沿父级 container 可见性解析字段和 container 能力，隐藏父级会影响所有后代字段的渲染、提交和校验参与。
- `fields`、`groups`、mixed 配置和 `CompiledDynamicForm` 继续兼容。

相关专题：[配置指南](./configuration.md)、[Compiler Foundation](./compiler-foundation.md)、[Runtime Layer](./runtime-layer.md)、[Field Address](./field-address.md)。

#### 3.4.0 - 2026-06-30

- 明确 3.x 兼容边界和 4.0 迁移准备方向。
- 补充兼容护栏测试，继续拒绝 nested object schema、object array schema、重复 field/group id 和重复 `name` path。
- 建议 3.x 项目提前使用稳定 `id`、显式 `name`、schema metadata 和同步 rules/effects 边界。

相关专题：[架构说明](./ARCHITECTURE.md)、[Field Address](./field-address.md)、[Runtime Layer](./runtime-layer.md)、[Effect 与处理器](./effects-and-handlers.md)、[Schema Adapters](./schema-adapters.md)。

#### 3.3.0 - 2026-06-30

- Schema / metadata adapter 支持显式透传 Field Address `name`。
- 包根入口导出 `FieldCapability`、`GroupCapability` 和 `RuntimeState` 类型。
- 继续保持 `FormConfig`、Runtime 和 renderer 行为兼容。

#### 3.2.1 - 2026-06-30

- 补强 Field Address、Runtime 能力和隐藏字段参与策略的测试覆盖。
- 稳定 3.2 行为边界，不新增 public API。

#### 3.2.0 - 2026-06-30

- 将仓库调整为 private pnpm workspace root，当时 npm 发布包为 `packages/dynamic-form/`。
- 新增 Docusaurus docs-site workspace，中文站点文档和英文 i18n 文档独立维护。
- 明确 DynamicForm 核心不支持库级异步 effect 或 async validation compile。

#### 3.1.0 - 2026-06-12

- 新增 Field Address 基础能力，分离稳定字段 `id` 与 Ant Design `NamePath`。
- 支持嵌套 values，同时保持 Runtime、effect graph 和 meta 更新继续使用稳定 `id`。
- 未声明 `name` 时默认继续使用 `id`，原有单层配置无需迁移。

#### 3.0.0 - 2026-06-16

- 在 2.0 Runtime / State 分层基础上新增 Compiler、Module Registry、Adapter、Schema Adapter 和声明式 Rule Engine。
- 新增 `CompiledDynamicForm`，可直接渲染 compiler / adapter 产物并合并组件注册表。
- 保留现有 `DynamicForm` 与手写 `FormConfig` 用法兼容。

#### 2.0.0 - 2026-06-02

- 重组 Config、State、Runtime、Consumer 和 Shared 分层。
- 明确 Ant Design Form 是 values、validation、touched 和 validating runtime state 的所有者。
- 新增 Runtime Layer，用于统一解析字段和分组的显示、提交、禁用、只读和校验能力。

### 维护规则

- 完整发布日志维护在仓库根目录 `CHANGELOG.md`。
- 本页只保留面向站点读者的精简摘要和专题入口。
- 修改发布记录时，同步检查 [维护指南](./maintenance.md) 中的文档维护规则。
