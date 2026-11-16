# CHANGELOG

本页说明各版本给表单使用者带来的变化，以及是否需要调整现有代码。完整发布记录见仓库根目录 `CHANGELOG.md`。

## 当前版本

当前版本是 DynamicForm 4.2.2。普通 React 表单继续使用 `@whynotsnow/dynamic-form`；只有在表单显示前需要检查或转换配置时，才需要单独使用 `@whynotsnow/dynamic-form-core`。

## 版本时间线

### 4.2.2

- 改进了表单联动相关类型和输入检查。
- 新增推荐名称 `FormChainEffectWrapper`，旧名称仍可使用；使用它的现有代码不需要立即调整。
- 保持字段值、表单实例、组件属性和 handler 回调的公开类型兼容，现有表单配置无需迁移。

相关专题：[Effect 与处理器](./effects-and-handlers.md)、[配置指南](./configuration.md)。

### 4.2.0 - 2026-07-02

- 新增可选的 `@whynotsnow/dynamic-form-core` 包，用于在显示表单前检查和转换配置。
- React 表单继续由 `@whynotsnow/dynamic-form` 提供；现有 import 保持可用，不要求迁移。

相关专题：[Core Package](./core-package.md)。

### 4.1.0 - 4.1.2 - 2026-07-01

- 增加 `formAdapter` 和 `renderer` 扩展入口，同时保留原有 Ant Design `form` 用法。
- 增加内存 form adapter 和 headless renderer，便于测试和预览；内存 adapter 不执行真实规则校验。
- 增加配置诊断和字段状态查询接口，方便配置工具在保存或预览时检查表单。

相关专题：[渲染与 UI 扩展](./rendering-and-ui.md)、[配置指南](./configuration.md)、[Runtime Layer](./runtime-layer.md)。

### 4.0.0 - 2026-07-01

- 新增 `FormConfig.nodes` 和 `ModuleFormConfig.nodes`，支持递归 `FieldNode` / `ContainerNode`。
- `ContainerNode.name` 可作为后代字段 Ant Design `NamePath` 前缀；`repeatable` container 通过 Ant Design `Form.List` 渲染已有重复项。
- Runtime 沿父级 container 可见性解析字段和 container 能力，隐藏父级会影响所有后代字段的渲染、提交和校验参与。
- `fields`、`groups`、mixed 配置和 `CompiledDynamicForm` 继续兼容。

相关专题：[配置指南](./configuration.md)、[Compiler Foundation](./compiler-foundation.md)、[Runtime Layer](./runtime-layer.md)、[Field Address](./field-address.md)。

### 3.4.0 - 2026-06-30

- 为 4.0 配置升级提供准备建议：使用稳定的字段 `id`，需要嵌套提交值时显式设置 `name`。

相关专题：[架构说明](./ARCHITECTURE.md)、[Field Address](./field-address.md)、[Runtime Layer](./runtime-layer.md)、[Effect 与处理器](./effects-and-handlers.md)、[Schema Adapters](./schema-adapters.md)。

### 3.1.0 - 2026-06-12

- 可以为字段设置独立的 `name`，让提交结果包含嵌套值；不设置时仍使用字段 `id`，原有平铺表单无需调整。

### 3.0.0 - 2026-06-16

- 新增字段模块、配置转换、schema adapter 和同步规则能力。
- 新增 `CompiledDynamicForm`，可直接显示转换后的表单配置。
- 原有 `DynamicForm` 和手写 `FormConfig` 继续可用。

### 2.0.0 - 2026-06-02

- 新增统一的字段显示、提交、禁用、只读和校验规则。
- 隐藏字段默认不参与提交；只读字段仍可参与校验。

## 维护规则

- 完整发布日志维护在仓库根目录 `CHANGELOG.md`。
- 本页只保留面向站点读者的精简摘要和专题入口。
- 修改发布记录时，同步检查 [维护指南](./maintenance.md) 中的文档维护规则。
