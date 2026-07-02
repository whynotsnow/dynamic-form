# Core Package

4.2.0 起，DynamicForm 新增 `@whynotsnow/dynamic-form-core` 包，用于承载不依赖 React consumer、Ant Design renderer 或默认字段组件的纯核心能力。

`@whynotsnow/dynamic-form` 仍是兼容主入口：它继续导出 `DynamicForm`、`CompiledDynamicForm`、Provider、hooks、component registry、默认 AntD renderer、headless renderer 和 form adapters，同时 re-export core 公共 API。旧代码不需要迁移 import。

### 适合直接使用 core 的场景

- 可视化配置系统保存前校验配置。
- 后端或构建阶段把 schema/metadata 转换为标准 `FormConfig`。
- 在不渲染 React 表单的环境中运行 Rule Engine 或 Compiler。
- 设计器预览、调试面板或测试中读取 Runtime inspection helpers。
- 独立维护领域字段 module registry、schema adapter 或配置诊断。

### core 包包含的 API

- 配置处理：`processFormConfig`
- 配置诊断：`getFormConfigDiagnostics`、`validateFormConfig`
- Compiler：`compileFormConfig`、`ModuleRegistryManager`、`defaultModuleRegistry`
- Adapters：`AdapterRegistryManager`、`adaptModuleConfigs`、`compileAdaptedFormConfig`、JsonSchema/OpenAPI/metadata adapters
- Rules：`RuleEngine`、`createRuleEngine`、`compileRulesToEffect`、`evaluateRule`
- Runtime pure logic：`resolveRuntimeState`、`resolveFieldCapability`、`resolveGroupCapability`
- Runtime inspection：`getFieldRuntimeSnapshot`、`getRenderedFieldIds`、`getSubmitableFieldIds`、`getValidatableFieldIds`
- 共享纯类型：`FormConfig`、`BaseFieldConfig`、`FieldNamePath`、`DesignerMetadata`、Field Address 和 Runtime 类型

### 仍属于 dynamic-form 的 API

- React 组件：`DynamicForm`、`CompiledDynamicForm`
- Provider / hooks：`DynamicFormProvider`、`useInitHandlers`、`useFormChainContext`、`useStoreInit`
- Form adapters：`createAntdFormAdapter`、`createMemoryFormAdapter`、`assertFormAdapter`
- Renderers：`antdRenderer`、`headlessRenderer`、`assertRendererAdapter`
- Component registry：`ComponentRegistryManager`、`DefaultRegistryFieldComponents`
- 默认 effect handler runtime 和 `getDefaultConfig`

### Import 方式

旧 import 保持可用：

```ts
import { FormConfig, compileFormConfig } from '@whynotsnow/dynamic-form';
```

只需要纯配置能力时，可以直接依赖 core：

```ts
import { FormConfig, validateFormConfig } from '@whynotsnow/dynamic-form-core';
```

### 迁移边界

4.2.0 不删除 `@whynotsnow/dynamic-form` 的现有 public exports，也不强制用户迁移。core 包是新增入口，主要用于设计器、schema 管线、测试和非 React 环境。

### 4.2 过渡源码边界

4.2 拆包后，`packages/dynamic-form/src` 中仍保留了一批 core 能力的旧源码副本。这是过渡遗留，不是长期设计。public exports 多数已经从 `@whynotsnow/dynamic-form-core` 转导，但 React 包内部仍有少量边界不能直接删除：

- `src/config/processor/`：React 包版本在初始化函数式 `initialValue` 时会调用本包 effect result handlers，用于处理 `formItemProps`、`componentProps`、group visibility 等 UI/effect handler 集成结果；core 版本只保留纯配置处理。
- `src/runtime/useRuntimeState.ts`：这是 React hook，属于 `dynamic-form`；纯 runtime resolver 应从 core 复用。
- `src/shared/types.ts` 和部分 `src/shared/utils/`：仍混有 React/AntD renderer、form adapter、effect handler 等包侧类型和工具。
- `src/config/defaultConfig.ts`：负责 React 包默认配置和 effect handler 集成，属于 `dynamic-form`。

后续删除本地旧副本前，需要先满足三个条件：纯 core 行为测试已经迁到 `packages/dynamic-form-core`；React 包内部能稳定复用 core 的 import 已经切换；剩余测试只覆盖 React 集成行为，而不是继续直接 bundle 本地 core 副本。
