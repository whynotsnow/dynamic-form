# @whynotsnow/dynamic-form-core

`@whynotsnow/dynamic-form-core` 是 DynamicForm 4.2 新增的纯核心包，面向配置编译、配置诊断、schema adapter、Rule Engine 和 Runtime inspection 场景。

它不包含 `DynamicForm` React 组件、Provider、hooks、Ant Design renderer、默认字段组件或 effect result handler runtime。需要直接渲染表单时继续使用 `@whynotsnow/dynamic-form`。

### 安装

```bash
pnpm add @whynotsnow/dynamic-form-core
```

### API 范围

- 配置处理：`processFormConfig`
- 配置诊断：`getFormConfigDiagnostics`、`validateFormConfig`
- Compiler：`compileFormConfig` 和 module registry
- Adapters：passthrough、JsonSchema、OpenAPI、metadata adapters
- Rules：`RuleEngine`、`createRuleEngine`、`compileRulesToEffect`、`evaluateRule`
- Runtime pure logic：`resolveRuntimeState` 和 inspection helpers
- 共享纯类型：`FormConfig`、`BaseFieldConfig`、`FieldNamePath`、field address、designer metadata

### 文档

core 包的技术文档位于 [`docs/`](./docs/README.md)，覆盖配置处理与诊断、Compiler、Adapters、Rule Engine、Runtime 和 inspection helpers。

### 兼容入口

`@whynotsnow/dynamic-form` 会继续 re-export core 公共 API，旧 import 不需要迁移：

```ts
import { FormConfig, compileFormConfig } from '@whynotsnow/dynamic-form';
```

新项目如果只需要配置管线和纯 Runtime helper，可以直接依赖 core：

```ts
import { FormConfig, validateFormConfig } from '@whynotsnow/dynamic-form-core';
```
