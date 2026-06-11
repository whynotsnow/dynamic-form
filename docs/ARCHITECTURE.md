# 架构说明

## 中文文档

DynamicForm 3.0 由可选的 Adapter / Module / Rule / Compiler 预处理能力，以及稳定的 Config / State / Runtime / Consumer / Shared 运行时主线组成。核心目标是让外部输入归一化、领域模块展开、配置解析、状态维护、运行时策略和 UI 渲染各自保持清晰边界，同时保留 Ant Design Form 对真实表单值和校验运行时状态的所有权。

### 模块关系

```text
External input / ModuleFormConfig
  -> Adapter Registry (optional)
  -> Rule + Config Compiler (optional)
  -> FormConfig

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

- `src/adapters/`：把 module-like、JsonSchema、OpenAPI 和 metadata 输入归一化为 `ModuleFormConfig`。
- `src/modules/`：定义 `FieldModule` 协议和模块注册器。
- `src/rules/`：校验、求值声明式规则，并把规则编译为标准 effects。
- `src/compiler/compileFormConfig.ts`：把 `ModuleFormConfig` 编译为标准 `FormConfig` 和组件注册表。
- `src/CompiledDynamicForm.tsx`：把 compiler 产物及其组件注册表接入 `DynamicForm`。
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

1. 可选 Adapter 把外部输入归一化为 `ModuleFormConfig`。
2. 可选 Compiler 展开字段模块、编译字段/group rules，并生成标准 `FormConfig` 与组件注册表。
3. 用户通过 `DynamicForm` 传入手写 `FormConfig`，或通过 `CompiledDynamicForm` 传入 compiler 产物。
4. `DynamicForm` 把引擎层参数传给 `DynamicFormProvider`，把 UI 参数传给 `FormContent`。
5. `useStoreInit` 调用 `processFormConfig(formConfig)`。
6. 配置处理生成依赖图、字段 registry、初始值和初始化后的字段/分组状态。
7. reducer 接收 `INIT`，保存结构、meta、配置处理信息和动态 UI 配置。
8. `DynamicFormProvider` 用 `effectMap` 初始化 `form-chain-effect-engine`。
9. `FormContent` 基于 reducer state 计算一次 `runtimeState`。
10. 渲染、提交校验、字段变更校验和隐藏字段参与策略共同使用这份 `runtimeState`。
11. 用户输入触发 runtime 过滤后的校验，再把变更值交给 effect engine。
12. effect 返回值进入 `applyEffectResult`，handler 更新 Ant Design Form 值、字段 meta、分组 meta 或动态 UI 配置。

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

- Adapter Layer：只负责把外部输入转换为 `ModuleFormConfig`，不决定 Runtime 或 renderer 行为。
- Module / Compiler Layer：展开领域字段模块、装配 flat/grouped/mixed 结构，并输出标准 `FormConfig`。
- Rule Layer：把同步声明式规则编译为标准 effects，不替代 effect engine 或 Ant Design validation。
- Config Layer：把 flat/grouped/mixed `FormConfig` 转换成标准化运行时输入。
- State Layer：保存初始化后的字段/分组结构和 meta，并兼容旧的 flat meta key。
- Runtime Layer：统一解析 rendered、submitable、editable、readonly、disabled、validatable 等策略。
- Consumer Layer：连接 Provider、渲染、hooks、effect 结果处理和组件注册。
- Shared Layer：存放公共类型、上下文、工具函数和 meta 归一化逻辑。

### 维护约束

- 字段查找应使用 `configProcessInfo.fieldRegistry`，因为字段可能是平铺字段，也可能在分组内。
- `FormContent` 应对每个 state snapshot 只计算一次 Runtime。
- 校验必须通过 `runtimeState.fields[fieldId].validatable` 过滤。
- 隐藏字段默认不参与提交，除非字段配置显式保留值。
- render hooks 可以绕过默认渲染，因此修改扩展行为时要谨慎。
- Adapter、Compiler 和 Rule Engine 应保持在 React runtime 之外，不直接维护 Form 实例或 reducer state。

---

## English Documentation

DynamicForm 3.0 combines optional Adapter / Module / Rule / Compiler preprocessing with a stable Config / State / Runtime / Consumer / Shared runtime pipeline. The goal is to separate external-input normalization, domain-module expansion, configuration processing, state management, runtime policy, and UI rendering while preserving Ant Design Form as the owner of actual values and validation runtime state.

### Module Map

```text
External input / ModuleFormConfig
  -> Adapter Registry (optional)
  -> Rule + Config Compiler (optional)
  -> FormConfig

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

- `src/adapters/`: normalizes module-like, JsonSchema, OpenAPI, and metadata input into `ModuleFormConfig`.
- `src/modules/`: defines the `FieldModule` protocol and module registry.
- `src/rules/`: validates and evaluates declarative rules and compiles them into standard effects.
- `src/compiler/compileFormConfig.ts`: compiles `ModuleFormConfig` into standard `FormConfig` and a component registry.
- `src/CompiledDynamicForm.tsx`: wires compiler output and its component registry into `DynamicForm`.
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

1. An optional adapter normalizes external input into `ModuleFormConfig`.
2. The optional compiler expands field modules, compiles field/group rules, and creates standard `FormConfig` plus a component registry.
3. The user supplies handwritten `FormConfig` to `DynamicForm`, or compiler output to `CompiledDynamicForm`.
4. `DynamicForm` passes engine props to `DynamicFormProvider` and UI props to `FormContent`.
5. `useStoreInit` calls `processFormConfig(formConfig)`.
6. Config processing creates dependency maps, field registry, initial values, and initialized field/group state.
7. The reducer receives `INIT` and stores structure, meta, config process info, and dynamic UI config.
8. `DynamicFormProvider` initializes `form-chain-effect-engine` with `effectMap`.
9. `FormContent` computes one `runtimeState` from reducer state.
10. Rendering, validation, and hidden-field participation consume that same `runtimeState`.
11. User input triggers runtime-filtered validation and then the effect engine.
12. Effect results pass through `applyEffectResult`, and handlers update Ant Design Form values, field meta, group meta, or dynamic UI config.

### State Ownership

Ant Design Form owns values, validation errors and warnings, touched and validating state, and submitted value retrieval.

DynamicForm reducer owns flat field state, grouped field state, field behavior/render meta, group behavior meta, config processing info, dynamic UI config, and initialized state.

The reducer intentionally does not maintain a duplicate value store. Effect handlers that update values should call `form.setFieldsValue`.

### Layer Responsibilities

- Adapter Layer: converts external input into `ModuleFormConfig` without deciding Runtime or renderer behavior.
- Module / Compiler Layer: expands domain field modules, assembles flat/grouped/mixed structure, and outputs standard `FormConfig`.
- Rule Layer: compiles synchronous declarative rules into standard effects without replacing the effect engine or Ant Design validation.
- Config Layer: normalizes flat/grouped/mixed `FormConfig` into runtime inputs.
- State Layer: stores initialized field/group structure and meta while normalizing legacy flat meta keys.
- Runtime Layer: resolves rendered, submitable, editable, readonly, disabled, and validatable policy.
- Consumer Layer: connects provider, rendering, hooks, effect results, and component registry.
- Shared Layer: contains types, context, utilities, and meta normalization helpers.

### Maintenance Constraints

- Field lookup should use `configProcessInfo.fieldRegistry` because fields can be flat or grouped.
- Runtime should be computed once per state snapshot in `FormContent`.
- Validation must be filtered through `runtimeState.fields[fieldId].validatable`.
- Hidden fields are excluded from submit participation unless explicitly preserved.
- Render hooks can bypass default rendering, so extension behavior changes should be deliberate.
- Adapters, the compiler, and the Rule Engine should remain outside React runtime and must not directly own Form instances or reducer state.
