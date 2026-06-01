# 架构说明

## 中文文档

DynamicForm 按 Config、State、Runtime、Consumer、Shared 五层组织。核心目标是让配置解析、状态维护、运行时策略和 UI 渲染各自保持清晰边界，同时保留 Ant Design Form 对真实表单值和校验运行时状态的所有权。

### 模块关系

```text
src/index.tsx
  -> DynamicFormProvider
      -> useStoreInit
      -> form-chain-effect-engine
      -> FormChainContext
  -> FormContent
      -> useRuntimeState
      -> useFormRuntimeEvents
      -> useFieldParticipation
      -> FieldComponentRenderer
```

### 关键文件

- `src/index.tsx`：拆分 `DynamicFormProps`，把引擎层 props 交给 Provider，把 UI 层 props 交给 FormContent。
- `src/consumer/provider/DynamicFormProvider.tsx`：初始化 store、effect engine 和 React context。
- `src/state/useStoreInit.ts`：处理配置、创建 reducer state、合并初始值并同步到 Ant Design Form。
- `src/config/processor/configParser.ts`：生成 `effectMap`、`fieldRegistry`、`initialValues`、`initializedFields`、`initializedGroupFields`。
- `src/state/reducer.ts`：用 Immer 处理字段 meta、分组 meta 和动态 UI 配置更新。
- `src/runtime/resolver.ts`：解析字段和分组运行时能力。
- `src/consumer/render/FormContent.tsx`：渲染表单并连接提交、变更事件。
- `src/consumer/effects/`：通过 handler 系统应用 effect 返回值。
- `src/consumer/render/componentRegistry.tsx`：提供内置组件和自定义组件注册能力。

### 数据流

1. 用户渲染 `DynamicForm`，传入 `formConfig`、Ant Design `form` 实例和可选 UI props。
2. `DynamicForm` 把引擎层参数传给 `DynamicFormProvider`，把 UI 参数传给 `FormContent`。
3. `useStoreInit` 调用 `processFormConfig(formConfig)`。
4. 配置处理生成依赖图、字段 registry、初始值和初始化后的字段/分组状态。
5. reducer 接收 `INIT`，保存结构、meta、配置处理信息和动态 UI 配置。
6. `DynamicFormProvider` 用 `effectMap` 初始化 `form-chain-effect-engine`。
7. `FormContent` 基于 reducer state 计算一次 `runtimeState`。
8. 渲染、提交校验、字段变更校验和隐藏字段参与策略共同使用这份 `runtimeState`。
9. 用户输入触发 Ant Design `onValuesChange`。
10. 本地先执行 runtime 过滤后的校验，再把变更值交给 effect engine。
11. effect 返回值进入 `applyEffectResult`。
12. handler 更新 Ant Design Form 值、字段 meta、分组 meta 或动态 UI 配置。

### 状态归属

Ant Design Form 负责：

- 字段值
- 校验 errors 和 warnings
- touched 和 validating 状态
- 提交时的数据读取

DynamicForm reducer 负责：

- 平铺字段状态
- 分组字段状态
- 字段行为 meta 和渲染 meta
- 分组行为 meta
- 配置处理信息
- 动态 UI 配置
- initialized 标记

reducer 不维护重复的 values store。更新值的 effect handler 应调用 `form.setFieldsValue`。

### 分层职责

- Config Layer：把平铺/分组配置转换成标准化运行时输入。
- State Layer：保存初始化后的字段/分组结构和 meta，并兼容旧的 flat meta key。
- Runtime Layer：统一解析 rendered、submitable、editable、readonly、disabled、validatable 等策略。
- Consumer Layer：连接 Provider、渲染、hooks、effect 结果处理和组件注册。
- Shared Layer：存放公共类型、上下文、日志、工具函数和 meta 归一化逻辑。

### 维护约束

- 字段查找应使用 `configProcessInfo.fieldRegistry`，因为字段可能是平铺字段，也可能在分组内。
- `FormContent` 应对每个 state snapshot 只计算一次 Runtime。
- 校验必须通过 `runtimeState.fields[fieldId].validatable` 过滤。
- 隐藏字段默认不参与提交，除非字段配置显式保留值。
- render hooks 可以绕过默认渲染，因此修改扩展行为时要谨慎。

---

## English Documentation

DynamicForm is split into Config, State, Runtime, Consumer, and Shared layers. The goal is to keep configuration processing, state management, runtime policy, and UI rendering clearly separated while preserving Ant Design Form as the owner of actual form values and validation runtime state.

### Module Map

```text
src/index.tsx
  -> DynamicFormProvider
      -> useStoreInit
      -> form-chain-effect-engine
      -> FormChainContext
  -> FormContent
      -> useRuntimeState
      -> useFormRuntimeEvents
      -> useFieldParticipation
      -> FieldComponentRenderer
```

### Important Files

- `src/index.tsx`: splits `DynamicFormProps` into engine props and UI props.
- `src/consumer/provider/DynamicFormProvider.tsx`: initializes store, effect engine, and React context.
- `src/state/useStoreInit.ts`: processes config, creates reducer state, merges initial values, and syncs Ant Design Form.
- `src/config/processor/configParser.ts`: creates `effectMap`, `fieldRegistry`, `initialValues`, `initializedFields`, and `initializedGroupFields`.
- `src/state/reducer.ts`: handles field meta, group meta, and dynamic UI config updates with Immer.
- `src/runtime/resolver.ts`: resolves field and group runtime capabilities.
- `src/consumer/render/FormContent.tsx`: renders the form and wires submit/change events.
- `src/consumer/effects/`: applies effect results through handlers.
- `src/consumer/render/componentRegistry.tsx`: provides built-in components and custom registration.

### Data Flow

1. The user renders `DynamicForm` with `formConfig`, an Ant Design `form` instance, and optional UI props.
2. `DynamicForm` passes engine props to `DynamicFormProvider` and UI props to `FormContent`.
3. `useStoreInit` calls `processFormConfig(formConfig)`.
4. Config processing creates dependency maps, field registry, initial values, and initialized field/group state.
5. The reducer receives `INIT` and stores structure, meta, config process info, and dynamic UI config.
6. `DynamicFormProvider` initializes `form-chain-effect-engine` with `effectMap`.
7. `FormContent` computes one `runtimeState` from reducer state.
8. Rendering, submit validation, changed-field validation, and hidden-field participation all consume that same `runtimeState`.
9. User input triggers Ant Design `onValuesChange`.
10. Runtime-filtered local validation runs first, then changed values go to the effect engine.
11. Effect results are routed through `applyEffectResult`.
12. Handlers update Ant Design Form values, field meta, group meta, or dynamic UI config.

### State Ownership

Ant Design Form owns values, validation errors and warnings, touched and validating state, and submitted value retrieval.

DynamicForm reducer owns flat field state, grouped field state, field behavior/render meta, group behavior meta, config processing info, dynamic UI config, and initialized state.

The reducer intentionally does not maintain a duplicate value store. Effect handlers that update values should call `form.setFieldsValue`.

### Layer Responsibilities

- Config Layer: normalizes flat/grouped config into runtime inputs.
- State Layer: stores initialized field/group structure and meta while normalizing legacy flat meta keys.
- Runtime Layer: resolves rendered, submitable, editable, readonly, disabled, and validatable policy.
- Consumer Layer: connects provider, rendering, hooks, effect results, and component registry.
- Shared Layer: contains types, context, logging, utilities, and meta normalization helpers.

### Maintenance Constraints

- Field lookup should use `configProcessInfo.fieldRegistry` because fields can be flat or grouped.
- Runtime should be computed once per state snapshot in `FormContent`.
- Validation must be filtered through `runtimeState.fields[fieldId].validatable`.
- Hidden fields are excluded from submit participation unless explicitly preserved.
- Render hooks can bypass default rendering, so extension behavior changes should be deliberate.
