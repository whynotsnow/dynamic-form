# Core Package

4.2.0 起，DynamicForm 新增 `@whynotsnow/dynamic-form-core` 包，用于承载不依赖 React consumer、Ant Design renderer 或默认字段组件的纯核心能力。

`@whynotsnow/dynamic-form` 仍是兼容主入口：它继续导出 `DynamicForm`、`CompiledDynamicForm`、Provider、hooks、component registry、默认 AntD renderer、headless renderer 和 form adapters，同时 re-export core 公共 API。旧代码不需要迁移 import。

## 适合直接使用 core 的场景

- 可视化配置系统保存前校验配置。
- 后端或构建阶段把 schema/metadata 转换为标准 `FormConfig`。
- 在不渲染 React 表单的环境中运行 Rule Engine 或 Compiler。
- 设计器预览、调试面板或测试中读取 Runtime inspection helpers。
- 独立维护领域字段 module registry、schema adapter 或配置诊断。

## core 包包含的 API

- 配置处理：`processFormConfig`
- 配置诊断：`getFormConfigDiagnostics`、`validateFormConfig`
- Compiler：`compileFormConfig`、`ModuleRegistryManager`、`defaultModuleRegistry`
- Adapters：`AdapterRegistryManager`、`adaptModuleConfigs`、`compileAdaptedFormConfig`、JsonSchema/OpenAPI/metadata adapters
- Rules：`RuleEngine`、`createRuleEngine`、`compileRulesToEffect`、`evaluateRule`
- Runtime pure logic：`resolveRuntimeState`、`resolveFieldCapability`、`resolveGroupCapability`
- Runtime inspection：`getFieldRuntimeSnapshot`、`getRenderedFieldIds`、`getSubmitableFieldIds`、`getValidatableFieldIds`
- 共享纯类型：`FormConfig`、`BaseFieldConfig`、`FieldNamePath`、`DesignerMetadata`、Field Address 和 Runtime 类型

## 仍属于 dynamic-form 的 API

- React 组件：`DynamicForm`、`CompiledDynamicForm`
- Provider / hooks：`DynamicFormProvider`、`useInitHandlers`、`useFormChainContext`、`useStoreInit`
- Form adapters：`createAntdFormAdapter`、`createMemoryFormAdapter`、`assertFormAdapter`
- Renderers：`antdRenderer`、`headlessRenderer`、`assertRendererAdapter`
- Component registry：`ComponentRegistryManager`、`DefaultRegistryFieldComponents`
- 默认 effect handler runtime 和 `getDefaultConfig`

## Import 方式

旧 import 保持可用：

```ts
import { FormConfig, compileFormConfig } from '@whynotsnow/dynamic-form';
```

只需要纯配置能力时，可以直接依赖 core：

```ts
import { FormConfig, validateFormConfig } from '@whynotsnow/dynamic-form-core';
```

## 包边界

4.2.x 不删除 `@whynotsnow/dynamic-form` 的现有 public exports，也不强制用户迁移。core 包是纯能力的单一实现源，主要用于设计器、schema 管线、测试和非 React 环境。

## Core 单一实现源

`packages/dynamic-form/src` 不再维护 compiler、adapters、modules、rules、config processor、config diagnostics、field address 或纯 Runtime 的本地实现副本。这些能力统一由 `@whynotsnow/dynamic-form-core` 提供，React 包只负责消费 core 并提供 UI runtime：

- `src/state/useStoreInit.ts` 调用 core `processFormConfig`，并通过 `applyInitialEffectResult` 注入本包 effect result handler。
- `src/runtime/useRuntimeState.ts` 是 React hook，内部复用 core `resolveRuntimeState`。
- `src/shared/types.ts` 继续承载 React/AntD renderer、form adapter、effect handler 等包侧类型。
- `src/config/defaultConfig.ts` 继续负责 React 包默认配置和 effect handler 集成。

如果需要调整纯配置、编译、adapter、rule、field address 或 Runtime 规则，应优先修改 `packages/dynamic-form-core`，再通过 `@whynotsnow/dynamic-form` 的兼容 re-export 暴露给旧消费者。
