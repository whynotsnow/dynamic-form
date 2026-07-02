# Adapters 与 schema 输入

core 包提供 adapter registry 和内置 schema adapters，用于把外部输入归一化为 `ModuleFormConfig`，再交给 compiler。

## Adapter 职责

Adapter 只负责输入归一化，不负责：

- 推断业务 UI。
- 渲染字段。
- 维护表单值。
- 执行 Runtime。
- 应用 effect result。

典型流程是：

```ts
import { compileAdaptedFormConfig } from '@whynotsnow/dynamic-form-core';

const compiled = compileAdaptedFormConfig(input, {
  adapterType: 'json-schema'
});
```

## 内置 adapter

core 当前提供：

- `ModuleConfigPassthroughAdapter`：直接接收结构化模块配置。
- `JsonSchemaAdapter`：从 JsonSchema 输入读取 dynamic-form metadata。
- `OpenApiAdapter`：从 OpenAPI schema 输入读取 dynamic-form metadata。
- `MetadataAdapter`：从项目自定义 metadata 输入生成模块配置。

`AdapterRegistryManager` 和 `defaultAdapterRegistry` 用于注册和解析 adapter。

## Schema metadata 策略

JsonSchema 和 OpenAPI adapter 不根据 primitive type 自动猜测 UI，也不根据字段名推断组件。字段必须显式声明 dynamic-form module metadata。

这样做的目的有两个：

- 避免 schema 数据结构和具体 UI 组件强绑定。
- 让同一个 schema 可以被不同业务设计器、组件库和字段模块复用。

Schema `required` 会映射为字段级 `required` 语义，不直接生成 Ant Design `rules`。最终校验规则由 React/AntD 包的默认 renderer 合并，或由业务自定义 renderer 自行处理。

## Group 与 container

Schema 顶层 metadata 可以声明 groups，属性级 metadata 可以声明 `groupId`。4.0 起，更复杂的嵌套结构建议使用 `nodes` 或通过 adapter 输出 container 节点。

Adapter 输出仍应保持为标准 `ModuleFormConfig`，由 compiler 继续展开为 `FormConfig`。

## 错误边界

Adapter 应在输入缺少必要 dynamic-form metadata、group 引用无效或 adapter type 不匹配时抛出清晰错误。业务侧如果需要面向用户的批量提示，可以在 adapter 前后结合配置诊断 API。
