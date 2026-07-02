# DynamicForm Package 后续 Agent 说明

最近审阅：2026-06-30

## 作用范围

本文适用于 `packages/dynamic-form/`。这里是 monorepo 中的 React/AntD npm 发布包，包名为 `@whynotsnow/dynamic-form`。

DynamicForm 是 React + TypeScript 动态表单库，基于 Ant Design 渲染表单，并通过 `form-chain-effect-engine` 执行字段依赖和 effect chain。

## Package 边界

- 保持 `name: "@whynotsnow/dynamic-form"`。
- 版本号必须与根 workspace 和 `@whynotsnow/dynamic-form-core` 保持一致。
- 对 `@whynotsnow/dynamic-form-core` 的依赖版本必须精确等于本包版本号，不使用 `workspace:` 协议发布。
- 保持消费者 import 方式不变：

```ts
import { DynamicForm } from '@whynotsnow/dynamic-form';
```

- 未经明确 release 决策，不改变 `main`、`module`、`types` 或 `exports` 兼容性。
- `src/exports.ts` 是 public export surface，也是 tsup entry。
- `dist/index.js`、`dist/index.mjs`、`dist/index.d.ts` 是预期 package artifacts。
- `docs/` 是库权威文档，并随 npm tarball 发布。

## 文档语言规则

- 从 2026-06-30 起，package 文档默认只使用中文。
- `README.md`、`docs/`、`AGENTS.md` 不再维护完整英文翻译结构。
- 可以保留 API name、package name、file path、npm scripts、TypeScript 类型名、Runtime、Adapter、Compiler、Rule Engine 等英文关键词。
- docs-site 的英文翻译只在 `apps/docs-site/i18n/` 中维护；不要把 i18n 英文内容复制回 package docs。

## 重要命令

从仓库根目录运行：

- `pnpm --filter @whynotsnow/dynamic-form type-check`
- `pnpm --filter @whynotsnow/dynamic-form build`
- `pnpm --filter @whynotsnow/dynamic-form exec npm pack --dry-run`

package 变更通常还需要关注：

- `pnpm run type-check`
- `pnpm run lint:check`
- `pnpm run test`
- `pnpm run build`

不要声称自动化检查通过，除非实际运行过对应命令。

## 目录地图

- `src/exports.ts`：package public export surface；tsup entry point。
- `src/index.tsx`：`DynamicForm` 组件，组合 engine layer 和 UI layer。
- `src/shared/types.ts`：React/AntD/effect handler 相关 public/internal types；纯 core 类型从 `@whynotsnow/dynamic-form-core` 复用。
- `src/consumer/provider/DynamicFormProvider.tsx`：provider layer，初始化 store、effect engine、context、初始化告警和 effect result handling。
- `src/consumer/render/FormContent.tsx`：rendering layer，拥有 Ant Design `Form`、value change、submit、default rendering 和 render extension hooks。
- `src/runtime/useRuntimeState.ts`：React hook，复用 core `resolveRuntimeState()`。
- `src/state/reducer.ts`：Immer reducer，维护 field/group meta、batched updates 和 dynamic UI config。
- `src/state/useStoreInit.ts`：调用 core `processFormConfig` 初始化 reducer state，并把 initial values 同步到 AntD Form。
- `src/config/defaultConfig.ts`：导出的默认配置 helper。
- `src/consumer/effects/`：通过已注册 handlers 应用 effect/initialValue 返回对象。
- `src/consumer/hooks/`：submit/change events、field participation 和 handler initialization hooks。
- `src/consumer/render/componentRegistry.tsx`：内置 Ant Design field components 和 registry manager。
- `src/consumer/render/FieldComponentRenderer.tsx`：通过 registry 渲染配置字段。
- `src/shared/context/`：form chain React context access。
- `src/shared/utils/`：path/deep utilities 和 initialization checks。
- `docs/`：随 package 发布的库文档。
- `dist/`：生成的 build output。

## Public API 形状

公共导出定义在 `src/exports.ts`：

- `DynamicForm`
- `CompiledDynamicForm`
- `DynamicFormProvider`
- `FormChainEffectEngineWrapper`
- key types：`DynamicFormProps`、`FormConfig`、`BaseFieldConfig`、`FieldComponentProps`、`ComponentRegistry`、`ComponentRegistryConfig`
- `ComponentRegistryManager`、`DefaultRegistryFieldComponents`
- hooks：`useFormChainContext`、`useStoreInit`、`useInitHandlers`
- `getDefaultConfig`
- compiler APIs：`compileFormConfig`、`ModuleConfig`、`CompiledModuleConfig`
- module registry APIs：`ModuleRegistryManager`、`defaultModuleRegistry`、`FieldModule`
- adapter APIs：`AdapterRegistryManager`、`defaultAdapterRegistry`、`adaptModuleConfigs`、`compileAdaptedFormConfig`、`ModuleConfigPassthroughAdapter`、`JsonSchemaAdapter`、`OpenApiAdapter`、`MetadataAdapter`
- rule APIs：`RuleEngine`、`createRuleEngine`、`compileRulesToEffect`、`evaluateRule`
- field address APIs：`getFieldName`、`resolveFieldAddress`

`DynamicFormProps` 分为：

- engine props：`formConfig`、`form`、可选 `values`、`uiConfig`、`enableInitializationCheck`、`checkDelay`
- UI props：可选 `onSubmit`、`submitButtonText`、`componentRegistry` 和 render extension callbacks

## Core Data Flow 数据流

1. 可选 adapters 通过 `adaptModuleConfigs` 或 `compileAdaptedFormConfig` 把外部输入归一化为 `ModuleConfig[]`。
2. 可选 compiler APIs 通过 `compileFormConfig` 把 `ModuleConfig[]` 展开为现有 `FormConfig`。
3. `DynamicForm` 把 props 拆分为 engine props 和 UI props。
4. `DynamicFormProvider` 调用 `useStoreInit`。
5. `useStoreInit` 使用 `processFormConfig` 处理 `formConfig`，合并 initial values 与 `values`，创建 reducer state，并 dispatch `INIT`。
6. `FormContent` 从 reducer state 渲染 Ant Design `Form`。
7. 用户输入触发 Ant Design `onValuesChange`。
8. `FormContent` 通过 `useRuntimeState(state)` 为同一个 state snapshot 计算一次 `runtimeState`。
9. `useFormRuntimeEvents` 使用同一份 Runtime snapshot 处理 submit/change events。
10. `useFieldParticipation` 消费同一份 `runtimeState`，并根据 `submitable` 清理或恢复 values。
11. `form-chain-effect-engine` 从 `effectMap` 执行 dependent field effects。
12. `applyEffectResult` 通过内置或自定义 handlers 应用 value/meta/UI updates。

## Runtime Layer 运行时层

Runtime Layer 是 UI participation decisions 的 source of truth：

- `rendered`：field/group 是否渲染；field rendering 也受 group visibility 影响。
- `submitable`：field 是否参与 submitted form data；当前策略跟随 `rendered`。
- `disabled`：来自 field behavior meta。
- `readonly`：来自 field behavior meta。
- `editable`：`rendered && !disabled && !readonly`。
- `validatable`：当前策略为 `rendered && !disabled`；readonly fields 仍参与校验。

实现约束：

- 在 `FormContent` 中用 `useRuntimeState(state)` 对每个 state snapshot 只计算一次 Runtime。
- 把同一份 `runtimeState` 传给 consumers，不要重复调用 `resolveFieldCapability()`。
- `useFieldParticipation` 必须消费 Runtime，不要独立解析 capability。
- Runtime resolvers 应通过 `getFieldBehaviorMeta`、`getGroupBehaviorMeta` 等 helpers 读取 behavior。
- 校验不能直接调用 `form.validateFields(Object.keys(changedValues))`，因为这会绕过 Runtime capability。
- 默认字段渲染会把 `runtimeCapability` 传入 `FieldComponentRenderer`；当 `validatable` 为 false 时抑制 `Form.Item` rules，并把 runtime `disabled`/`readonly` 映射到组件 props。
- `BaseFieldConfig.required` 是字段声明；默认 Ant Design renderer 会把它合并为真正的 required `Form.Item` rule，除非已存在显式 required rule。

## Meta 边界

`FieldMeta` 按职责拆分：

- `meta.behavior`：Runtime 消费的 behavior state，目前包含 `visible`、`disabled`、`readonly`。
- `meta.formItemProps`：Ant Design `Form.Item` 的 render-layer dynamic props。
- `meta.componentProps`：内部 field component 的 render-layer dynamic props。

为了兼容旧写法，仍接受 flat keys：

```ts
{ visible: false, disabled: true, readonly: true }
```

Reducers 和初始化 helpers 会归一化为：

```ts
{ behavior: { visible: false, disabled: true, readonly: true } }
```

默认 effect handlers 应把 behavior updates 写入 `meta.behavior`。不要把 render-only configuration 放进 Runtime；`formItemProps` 和 `componentProps` 仍属于 render-layer metadata。

## Compiler、Adapter、Schema 和 Rule Layers

- `ModuleRegistryManager` 保存可复用 field modules；默认拒绝重复 module type，除非明确 override。
- `compileFormConfig()` 在 `processFormConfig()` 前把 `ModuleConfig[]` 展开为现有 `FormConfig`。
- Compiler hooks 可以观察或调整 module compilation，但不应改变 runtime renderer。
- `AdapterRegistryManager`、`adaptModuleConfigs()`、`compileAdaptedFormConfig()` 在 compiler 前归一化外部输入。
- 内置 adapters 包括 passthrough `ModuleConfig[]`、JsonSchema、OpenAPI 和 project metadata。
- Schema adapters 要求显式 module metadata，不根据 schema primitive types 推断 UI 或 module type。
- `RuleEngine` 和 `compileRulesToEffect()` 支持 `show`、`hide`、`enable`、`disable`、`readonly`、`editable`、`setValue`、`clearValue` 等同步声明式 actions。
- Rules 由受影响 field 持有，不支持 `target`；一个 source field 影响多个 fields 时，应由多个受影响 fields 分别声明 rule。
- 当前实现明确不支持库级异步 effect 或 async validation compile，也不承诺未来支持。远程请求、远程选项、搜索联想、服务端校验、取消和竞态策略应由自定义字段组件或业务容器负责；必要时直接使用 Ant Design `rules.validator`。

这些 layers 内的改动必须保持 store boundary：Ant Design Form 拥有 values 和 validation runtime state；DynamicForm 拥有 field meta、group meta、dynamic UI config 和 dependency metadata。

## Effect Result Handling 处理

Effects 和函数式 `initialValue` 可以返回对象。`applyEffectResult` 会把每个返回 key 路由到 `src/consumer/effects/handlerRegistry.ts` 中注册的 handlers。

Effect result handling 保持同步边界；不要把异步任务调度、请求生命周期、loading/error/cache 或竞态控制放进 handler 系统。

已知 update categories 包括：

- field values
- field behavior meta，例如 visibility/disabled/readonly
- field render meta，例如 component/form item props
- group behavior/meta
- dynamic UI config
- custom handler-specific result keys

effect 相关变更应一起检查 `src/consumer/effects/types.ts`、`handlerRegistry.ts`、`applyEffectResult.ts` 和 `effectResultContext.ts`。如果逻辑属于 effect result handling，不要在 components 中添加一次性处理。

## Rendering Model 渲染模型

`FormContent` 提供默认渲染，并暴露分层 render extension hooks：

- `renderFieldItem`
- `renderFields`
- `renderGroupItem`
- `renderGroups`
- `renderFormInner`

默认布局使用 Ant Design `Form`、`Row`、`Col`、`Card` 和 `Button`。

## 实现风险和约束

- 保持改动小且贴合现有架构。
- 不要为了窄行为修复重写整个 form pipeline。
- 字段可能是 flat field，也可能在 group 内；定位字段必须尊重 `configProcessInfo.fieldRegistry`。
- `UPDATE_META` 需要根据 registry metadata 更新 `fields` 或 `groupFields[groupId].fields`，并使用 `mergeFieldMetaPatch` 归一化 legacy flat behavior keys。
- `SET_GROUP_META` 应使用 `mergeGroupMetaPatch`。
- Runtime validation 当前位于 `useFormRuntimeEvents`，必须继续按 Runtime capability 过滤。
- `FieldComponentRenderer` 是默认 component-level runtime props 应用位置。Custom render hooks 可能绕过它，因此 render extension 行为变更要谨慎。
- `enableInitializationCheck` 用来在 `useInitHandlers` 未调用时告警；除非初始化契约变化，不要移除。

## 代码注释语言

- 关键且不明显的实现点使用简短中文注释，尤其是 adapters、compiler boundaries、schema mappings、runtime policies 和 compatibility decisions。
- 注释解释意图或边界，不要复述显而易见的代码。
