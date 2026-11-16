# Core Package：在显示表单前处理配置

`@whynotsnow/dynamic-form-core` 用来在表单显示前处理表单配置。你可以用它检查配置是否有效、把 schema 转成 DynamicForm 能使用的配置，或根据当前配置判断哪些字段会显示和参与提交。

如果你的应用要显示表单，请继续使用 `@whynotsnow/dynamic-form`。它提供 React 表单组件和默认的 Ant Design 展示方式，也包含本文介绍的大部分配置能力。只使用普通表单时，不需要额外安装 core，也不用更改已有 import。

## 什么时候需要单独安装 core

| 你要做的事 | core 能提供的帮助 |
| --- | --- |
| 在配置保存到设计器前检查它 | 运行 `validateFormConfig`，或读取具体诊断信息。 |
| 在服务端或构建阶段转换配置 | 用 Schema Adapter 和 Compiler 把外部数据转成标准 `FormConfig`。 |
| 在不显示表单时计算规则或字段状态 | 使用 Rule Engine 和 Runtime 查询接口。 |
| 查看哪些字段会显示、提交或校验 | 从配置和状态中读取对应字段集合，供预览、调试或测试使用。 |

安装：

```bash
pnpm add @whynotsnow/dynamic-form-core
```

## core 提供哪些能力

| 能力 | 常用入口 | 用途 |
| --- | --- | --- |
| 配置检查 | `validateFormConfig`、`getFormConfigDiagnostics` | 保存前检查配置，并查看问题位置和原因。 |
| 配置处理 | `processFormConfig` | 准备 DynamicForm 运行时需要的字段和依赖信息。 |
| 字段模块编译 | `compileFormConfig`、`ModuleRegistryManager` | 把可复用的业务字段模块转成标准表单配置。 |
| 外部数据转换 | `adaptModuleConfigs`、`compileAdaptedFormConfig`、各类 schema adapter | 把 JsonSchema、OpenAPI 或 metadata 转成表单配置。 |
| 联动规则 | `RuleEngine`、`compileRulesToEffect` | 定义字段之间的同步显示、禁用或赋值规则。 |
| 字段状态查询 | `resolveRuntimeState`、`getRenderedFieldIds` 等 | 查询字段显示、提交和校验状态。 |

## 显示表单仍使用 dynamic-form

core 不提供 React 表单组件、Provider、Ant Design renderer、字段组件或默认 effect handler。显示和交互表单仍由 `@whynotsnow/dynamic-form` 负责。

如果你已经从主包导入配置能力，原有代码仍可继续使用：

```ts
import { FormConfig, compileFormConfig } from '@whynotsnow/dynamic-form';
```

在设计器、服务端或构建脚本中只需要配置处理时，可以直接从 core 导入：

```ts
import { FormConfig, validateFormConfig } from '@whynotsnow/dynamic-form-core';
```

## 是否需要迁移

不需要迁移现有代码。core 是一个可选的新入口：当你需要在显示表单之外处理配置时再安装和使用它；普通的 React 表单仍可只依赖 `@whynotsnow/dynamic-form`。
