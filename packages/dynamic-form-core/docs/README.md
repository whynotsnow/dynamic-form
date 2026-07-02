# DynamicForm Core Package

`@whynotsnow/dynamic-form-core` 承载 DynamicForm 的 UI-library agnostic 能力：配置处理、配置诊断、Compiler、Adapters、Rule Engine、纯 Runtime resolver 和 inspection helpers。

core 包不发布 React consumer、Provider、hooks、AntD renderer、默认字段组件和 effect result handler runtime。需要完整 React 表单运行时和默认 Ant Design UI 时，使用 `@whynotsnow/dynamic-form`。

### 文档范围

core 文档面向直接依赖 `@whynotsnow/dynamic-form-core` 的配置平台、可视化设计器、schema 管线、测试和非 React 环境。它只说明纯核心能力，不复制 React/AntD 包的渲染、Provider、hooks 和 effect handler 文档。

- [配置处理与诊断](./config-and-diagnostics.md)
- [Compiler 与模块](./compiler-and-modules.md)
- [Adapters 与 schema 输入](./adapters-and-schema.md)
- [Rule Engine](./rule-engine.md)
- [Runtime 与 inspection](./runtime-and-inspection.md)

### 包关系

4.2 起，DynamicForm 分为两个 npm 包：

- `@whynotsnow/dynamic-form-core`：纯核心能力，不依赖 React runtime 或 Ant Design renderer。
- `@whynotsnow/dynamic-form`：React/AntD 兼容主入口，依赖 core，提供 `DynamicForm`、Provider、hooks、form adapters、renderers、component registry、effect handler runtime，并继续 re-export core 公共 API。

两个包采用统一版本号发布。`@whynotsnow/dynamic-form` 依赖与自身版本完全一致的 core 版本。
