# Compiler 与模块

core 包提供 `compileFormConfig`、`ModuleRegistryManager` 和 `defaultModuleRegistry`，用于把领域化的 `ModuleFormConfig` 展开为标准 `FormConfig`。

Compiler 是可选预处理层。手写 `FormConfig` 可以直接进入 `processFormConfig`；只有在业务希望复用字段模块、封装领域字段或从 adapter 输出继续展开时，才需要 compiler。

## 模块协议

`FieldModule` 描述一个可复用字段模块。模块可以提供：

- `type`：模块类型。
- `component`：默认字段组件名。
- `defaultProps`：默认组件 props。
- `createConfig`：把模块实例展开为字段配置。
- `rules`、`dependents`、`effect`：模块默认联动配置。

`ModuleRegistryManager` 负责注册和解析模块，默认拒绝重复注册同名模块；确实需要覆盖时应显式传入 override 选项。

## `compileFormConfig`

`compileFormConfig(moduleFormConfig, options?)` 将 `ModuleFormConfig` 编译为：

- 标准 `FormConfig`。
- 编译过程中生成的 `componentRegistry`。

它支持 flat、grouped、mixed 和 `nodes` 结构。字段模块实例通过 `groupId`、container children 或 root nodes 进入最终结构。

## Hooks

Compiler hooks 用于观察或调整编译过程：

- `beforeCompile`
- `beforeGroupExpand`
- `afterGroupExpand`
- `beforeModuleExpand`
- `afterModuleExpand`
- `afterCompile`

hooks 应保持在配置编译边界内，不应维护 React state、表单值 store 或 renderer 状态。

## 与 dynamic-form 的关系

`@whynotsnow/dynamic-form` 的 `CompiledDynamicForm` 会消费 compiler 输出并接入 React/AntD 渲染。core 只负责编译，不提供 React 组件。

旧代码可以继续从 `@whynotsnow/dynamic-form` import compiler API；只需要纯编译能力的新场景可以直接依赖 core。
