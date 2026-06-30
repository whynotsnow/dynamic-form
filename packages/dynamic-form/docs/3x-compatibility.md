# 3.x 兼容与 4.0 迁移基线

DynamicForm 3.4 是 4.0 前的兼容性基线版本。它记录 3.x 用户应依赖的稳定边界，以及为 4.0 统一节点树做准备时可以提前采用的配置习惯。

### 3.x 主模型

3.x 的主流程仍然是：

```text
FormConfig
  -> adapter/compiler
  -> processFormConfig
  -> Runtime
  -> renderer
```

`DynamicForm` 继续接收现有 `FormConfig`。Adapter、Compiler、Rule Engine 和 Schema Adapters 只是可选预处理层，最终仍输出当前标准 `FormConfig`。

### 3.x 稳定边界

- `id` 是 Runtime、field registry、effect graph 和 meta 更新的稳定标识。
- `name` 是 Ant Design `NamePath`，用于 values、`Form.Item` 和校验路径。
- `fields` 与 `groups` 仍是当前结构模型；group 只包含一层 fields。
- Runtime 只解析 field/group 能力，不解析 container 或递归子树。
- Effect 和 rules 保持同步边界，异步请求、远程选项和服务端校验由业务组件或容器负责。
- Schema adapters 不展开 nested object 或 object array，也不根据 primitive type 推断 UI。

### 面向 4.0 的配置建议

- 始终使用全局唯一、稳定的 field/group `id`。
- 需要嵌套提交值时显式配置 `name`，不要把嵌套语义编码进 `id`。
- 外部 schema 输入应通过 metadata 显式声明 `module`、`name`、`groupId`、`rules` 和 `overrides`。
- 一个 source field 影响多个 fields 时，继续在多个受影响字段上分别声明 rules。
- 保持 effect result 同步、语义化，避免把请求生命周期或竞态状态塞进 handler。

### 4.0 Preview

4.0 计划引入统一 Form Node Tree，以 `field` / `group` / `container` 等节点表达表单结构；在 Field Address 基础上支持嵌套 values 与跨层级 effect graph，同时提供 3.x 配置兼容适配层。

这些能力不是 3.4 已实现的 public API。3.4 只提供迁移基线、文档说明和兼容性护栏。
