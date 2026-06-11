# DynamicForm 3.3 Architecture Evolution

## 中文文档

版本：3.3 执行稿

作者：Snow

状态：Schema Adapter 已实现

---

### DynamicForm 3.3：Schema Adapter

DynamicForm 3.3 在 3.2 Adapter Foundation 之上新增具体 schema adapters：`JsonSchemaAdapter`、`OpenApiAdapter` 和 `MetadataAdapter`。

3.3 管线如下：

```text
JsonSchema / OpenAPI / Metadata
  -> Schema Adapter
  -> ModuleConfig[]
  -> Rule Engine / Rule Effect Adapter
  -> Config Compiler
  -> FormConfig
  -> processFormConfig
  -> FormChainEffectEngine
  -> Runtime Layer
  -> DynamicForm Renderer
```

Schema adapters 只负责把输入转换为 flat `ModuleConfig[]`。字段模块展开、规则编译、依赖推导、组件注册、runtime 和 renderer 行为保持不变。

3.3 范围：

- 新增 `JsonSchemaAdapter`，支持顶层 object schema。
- 新增 `OpenApiAdapter`，支持 OpenAPI `components.schemas` 或单个 schema object。
- 新增 `MetadataAdapter`，支持 `{ fields: [...] }` 项目元数据输入。
- 新增 schema adapter 公共类型，并通过根入口导出。

3.3 非目标：

- 不展开 nested object schema 或 object array item schema。
- 不实现 validation rule engine。
- 不实现异步/API 规则。
- 不根据 schema primitive type 猜测 UI 或 module type。
- 不修改 compiler/runtime/renderer 主流程。

### DynamicForm 3.2：Adapter Foundation

DynamicForm 3.2 在 Rule Engine 和 Config Compiler 之前新增独立 Adapter Foundation，用于把外部或类模块输入归一化为 `ModuleConfig[]`。

3.2 管线如下：

```text
External / Module-like Input
  -> Adapter Registry
  -> Adapter Pipeline
  -> ModuleConfig[]
  -> Rule Engine / Rule Effect Adapter
  -> Config Compiler
  -> FormConfig
  -> processFormConfig
  -> FormChainEffectEngine
  -> Runtime Layer
  -> DynamicForm Renderer
```

Adapter 只负责输入转换。规则合并、依赖推导、组件注册和 `FormConfig` 生成仍由现有 compiler 负责，runtime、renderer 和 Ant Design Form 状态归属不变。

3.2 范围：

- 新增 `ModuleConfigAdapter` 协议。
- 新增 `AdapterRegistryManager` 和 `defaultAdapterRegistry`。
- 新增 `adaptModuleConfigs()` 与 `compileAdaptedFormConfig()`。
- 内置 `ModuleConfigPassthroughAdapter`，支持现有 `ModuleConfig[]` 直接进入 adapter pipeline。

3.2 非目标：

- 不实现 JsonSchema、OpenAPI 或 Metadata 具体 adapter。
- 不修改 `compileFormConfig()`、`processFormConfig()`、runtime 或 renderer。
- 不引入 validation rule engine 或异步规则。
- 不拆 monorepo。

### DynamicForm 3.1：Rule Engine

DynamicForm 3.1 在 3.0 Compiler Foundation 之上新增独立 Rule Engine，用声明式规则描述同步表单联动逻辑。

3.1 管线如下：

```text
Field Modules
  -> Rule Engine / Rule Effect Adapter
  -> Config Compiler
  -> FormConfig
  -> processFormConfig
  -> FormChainEffectEngine
  -> Runtime Layer
  -> DynamicForm Renderer
```

规则会被编译成标准 `EffectFn`，并输出 `visible`、`disabled`、`readonly`、`value` 等现有 effect result。渲染层、Provider props、`processFormConfig()` 和 Ant Design Form 的状态归属保持不变。

3.1 范围：

- 支持在 field module 和 module config entry 上声明规则。
- 支持同步条件：`equals`、`notEquals`、`empty`、`notEmpty`、`all`、`any`、`not`。
- 支持同步动作：`show`、`hide`、`enable`、`disable`、`readonly`、`editable`、`setValue`、`clearValue`。
- Rule 是字段所属的 per-field 规则，不支持 `target` 配置；一个源字段影响多个字段时，应在多个被影响字段上分别声明规则。
- 从规则条件中自动推导 `dependents`。

3.1 非目标：

- 不实现 validation rule engine。
- 不实现异步/API 规则。
- 不实现可视化规则构建器。
- 不替换 `form-chain-effect-engine`。
- 不维护重复 values store。

---

## English Documentation

Version: 3.3 Execution Draft

Author: Snow

Status: Schema Adapter implemented

---

### DynamicForm 3.3: Schema Adapter

DynamicForm 3.3 adds concrete schema adapters on top of the 3.2 Adapter Foundation: `JsonSchemaAdapter`, `OpenApiAdapter`, and `MetadataAdapter`.

The 3.3 pipeline is:

```text
JsonSchema / OpenAPI / Metadata
  -> Schema Adapter
  -> ModuleConfig[]
  -> Rule Engine / Rule Effect Adapter
  -> Config Compiler
  -> FormConfig
  -> processFormConfig
  -> FormChainEffectEngine
  -> Runtime Layer
  -> DynamicForm Renderer
```

Schema adapters only convert input into flat `ModuleConfig[]`. Module expansion, rule compilation, dependency inference, component registration, runtime, and renderer behavior stay unchanged.

3.3 scope:

- Add `JsonSchemaAdapter` for top-level object schemas.
- Add `OpenApiAdapter` for OpenAPI `components.schemas` or a single schema object.
- Add `MetadataAdapter` for project metadata input shaped as `{ fields: [...] }`.
- Add schema adapter public types and export them from the package root.

3.3 non-goals:

- No nested object schema or object array item schema expansion.
- No validation rule engine.
- No async/API rules.
- No UI or module type inference from schema primitive types.
- No changes to the compiler/runtime/renderer main pipeline.

### DynamicForm 3.2: Adapter Foundation

DynamicForm 3.2 adds Adapter Foundation before the Rule Engine and Config Compiler. It normalizes external or module-like input into `ModuleConfig[]`.

The 3.2 pipeline is:

```text
External / Module-like Input
  -> Adapter Registry
  -> Adapter Pipeline
  -> ModuleConfig[]
  -> Rule Engine / Rule Effect Adapter
  -> Config Compiler
  -> FormConfig
  -> processFormConfig
  -> FormChainEffectEngine
  -> Runtime Layer
  -> DynamicForm Renderer
```

Adapters only convert input. Rule merging, dependency inference, component registration, and `FormConfig` generation remain owned by the existing compiler, while runtime, renderer, and Ant Design Form ownership stay unchanged.

3.2 scope:

- Add the `ModuleConfigAdapter` protocol.
- Add `AdapterRegistryManager` and `defaultAdapterRegistry`.
- Add `adaptModuleConfigs()` and `compileAdaptedFormConfig()`.
- Add `ModuleConfigPassthroughAdapter` so existing `ModuleConfig[]` can enter the adapter pipeline directly.

3.2 non-goals:

- No concrete JsonSchema, OpenAPI, or Metadata adapters.
- No changes to `compileFormConfig()`, `processFormConfig()`, runtime, or renderer.
- No validation rule engine or async rules.
- No monorepo split.

### DynamicForm 3.1: Rule Engine

DynamicForm 3.1 introduces an independent Rule Engine for declarative, synchronous form linkage rules on top of the 3.0 Compiler Foundation.

The 3.1 pipeline is:

```text
Field Modules
  -> Rule Engine / Rule Effect Adapter
  -> Config Compiler
  -> FormConfig
  -> processFormConfig
  -> FormChainEffectEngine
  -> Runtime Layer
  -> DynamicForm Renderer
```

Rules are compiled into standard `EffectFn` instances and standard effect results such as `visible`, `disabled`, `readonly`, and `value`. The renderer, provider props, `processFormConfig()`, and Ant Design Form ownership remain unchanged.

3.1 scope:

- Declarative rule definitions on field modules and module config entries.
- Synchronous conditions: `equals`, `notEquals`, `empty`, `notEmpty`, `all`, `any`, and `not`.
- Synchronous actions: `show`, `hide`, `enable`, `disable`, `readonly`, `editable`, `setValue`, and `clearValue`.
- Rules are field-owned per-field rules and do not support `target`; when one source field affects multiple fields, declare rules on each affected field.
- Automatic dependency inference from rule conditions.

3.1 non-goals:

- No validation rule engine.
- No async/API rules.
- No visual rule builder.
- No replacement for `form-chain-effect-engine`.
- No duplicate values store.

---

## 3.0 Compiler Foundation 中文记录

版本：3.0 执行稿

作者：Snow

状态：Compiler Foundation 已实现

---

### Vision

DynamicForm 正在从配置驱动表单库演进为领域驱动表单平台。

3.0 保留现有运行时管线：

```text
FormConfig
  -> processFormConfig
  -> FormChainEffectEngine
  -> Runtime Layer
  -> DynamicForm Renderer
```

新增能力插入到现有管线之前：

```text
Field Modules
  -> Config Compiler
  -> FormConfig
  -> processFormConfig
  -> FormChainEffectEngine
  -> Runtime Layer
  -> DynamicForm Renderer
```

现有 `FormConfig` 用法继续有效。模块化配置是新增入口，不强制迁移。

### DynamicForm 3.0: Compiler Foundation

目标是在不改变当前表单渲染行为的前提下，引入字段模块协议、模块注册器、配置编译器和编译 hooks。

#### Public API Additions

包根入口新增导出：

```ts
compileFormConfig;
ModuleRegistryManager;
defaultModuleRegistry;
processFormConfig;
```

新增公共类型：

```ts
FieldModule;
ModuleConfig;
CompiledModuleConfig;
CompileFormConfigOptions;
CompileHookContext;
CompilerHooks;
ModuleRegistryRegisterOptions;
```

#### Field Module Protocol

`FieldModule` 用来封装可复用业务字段能力：

```ts
export interface FieldModule {
  type: string;
  component?: React.ComponentType<FieldComponentProps>;
  createConfig?: (options?: Record<string, unknown>) => BaseFieldConfig;
  dependencies?: string[];
  effect?: EffectFn;
  defaultProps?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
```

模块层描述业务字段；`ComponentRegistryManager` 仍只负责渲染组件解析。

#### Module Registry

`ModuleRegistryManager` 提供模块管理能力：

```ts
register(module, { override?: boolean });
unregister(type);
get(type);
has(type);
list();
```

重复模块类型默认报错。只有明确传入 `override: true` 时才允许覆盖。

#### Config Compiler

`compileFormConfig(moduleConfigs, options)` 把 `ModuleConfig[]` 编译为：

```ts
{
  formConfig: FormConfig;
  componentRegistry: ComponentRegistry;
}
```

编译顺序固定为：

```text
Read Module
  -> createConfig(options)
  -> inject component
  -> inject defaultProps
  -> inject effect
  -> inject dependencies
  -> merge overrides
  -> generate FormConfig
```

返回的 `formConfig` 是标准 flat `FormConfig`，可以继续传给 `processFormConfig()` 或 `DynamicForm`。

如果模块提供 React 组件，编译器会把它暴露到 `componentRegistry`，用户可以通过现有 `DynamicForm` 的 `componentRegistry` prop 接入，不需要修改渲染层。

#### Compiler Hooks

编译器支持：

```ts
beforeCompile;
beforeModuleExpand;
afterModuleExpand;
afterCompile;
```

hooks 只操作编译上下文，不应直接修改 React runtime 或 Ant Design Form 实例。

### Compatibility Rules

- 现有 `FormConfig` 仍是运行时主契约。
- 现有 `DynamicForm` props 不变。
- 现有 `processFormConfig()` 行为不变。
- Ant Design Form 继续拥有 values、validation、touched state 和 submit state。
- DynamicForm 继续拥有 field meta、group meta、runtime capability resolution 和 dependency metadata。

### Non-Goals for 3.0

- 不拆包。
- 不引入 Rule Engine。
- 不实现可视化表单构建器。
- 不实现 AI 表单生成器。
- 不实现自定义 validation engine。
- 不维护重复 values store。
- 不替换 Ant Design Form。

Rule Engine 已在 3.1 进入实现；其余内容留给 3.2+ 或 4.0。

### Migration Path

当前用户不需要迁移。

现有用法：

```ts
const formConfig: FormConfig = {
  fields: [{ id: 'name', component: 'TextInput' }]
};
```

新增模块化用法：

```tsx
const compiled = compileFormConfig([
  { type: 'UserSelector', id: 'ownerId', options: { label: 'Owner' } }
]);

<DynamicForm
  form={form}
  formConfig={compiled.formConfig}
  componentRegistry={{ customComponents: compiled.componentRegistry }}
/>;
```

这种方式把模块编译保持在 runtime renderer 之外，维持现有架构边界。

### Future Roadmap

3.1 已实现方向：引入独立 Rule Engine，支持声明式同步联动规则，并把规则编译为标准 effects。

3.2 已实现方向：新增 Adapter Foundation，把外部或类模块输入归一化为 `ModuleConfig[]`，再复用现有 compiler。

3.3 已实现方向：新增 JsonSchema/OpenAPI/Metadata adapters，基于 Adapter Foundation 输出 flat `ModuleConfig[]`。

4.0 方向：在 Schema Adapter、Adapter Foundation、Rule Engine 和 compiler foundation 稳定后，再考虑 validation rules、异步规则、拆包、领域模块包、visual builder 和 AI generator。

---

## 3.0 Compiler Foundation English Record

Version: 3.0 Execution Draft

Author: Snow

Status: Compiler Foundation implemented

---

### Vision

DynamicForm is evolving from a config-driven form library into a domain-driven form platform.

The 3.0 architecture keeps the existing runtime pipeline intact:

```text
FormConfig
  -> processFormConfig
  -> FormChainEffectEngine
  -> Runtime Layer
  -> DynamicForm Renderer
```

The new capability is inserted before that pipeline:

```text
Field Modules
  -> Config Compiler
  -> FormConfig
  -> processFormConfig
  -> FormChainEffectEngine
  -> Runtime Layer
  -> DynamicForm Renderer
```

Existing `FormConfig` usage remains valid. Module-based configuration is an additive entry point.

### DynamicForm 3.0: Compiler Foundation

The goal is to introduce a field module protocol, module registry, config compiler, and compiler hooks while preserving current form-rendering behavior.

#### Public API Additions

The package root exports:

```ts
compileFormConfig;
ModuleRegistryManager;
defaultModuleRegistry;
processFormConfig;
```

It also exports these public types:

```ts
FieldModule;
ModuleConfig;
CompiledModuleConfig;
CompileFormConfigOptions;
CompileHookContext;
CompilerHooks;
ModuleRegistryRegisterOptions;
```

#### Field Module Protocol

`FieldModule` packages reusable business field behavior:

```ts
export interface FieldModule {
  type: string;
  component?: React.ComponentType<FieldComponentProps>;
  createConfig?: (options?: Record<string, unknown>) => BaseFieldConfig;
  dependencies?: string[];
  effect?: EffectFn;
  defaultProps?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
```

The module layer describes domain fields. `ComponentRegistryManager` still only resolves render components.

#### Module Registry

`ModuleRegistryManager` owns module registration:

```ts
register(module, { override?: boolean });
unregister(type);
get(type);
has(type);
list();
```

Duplicate module types are rejected by default. Explicit override is required for replacement.

#### Config Compiler

`compileFormConfig(moduleConfigs, options)` compiles `ModuleConfig[]` into:

```ts
{
  formConfig: FormConfig;
  componentRegistry: ComponentRegistry;
}
```

The compile order is:

```text
Read Module
  -> createConfig(options)
  -> inject component
  -> inject defaultProps
  -> inject effect
  -> inject dependencies
  -> merge overrides
  -> generate FormConfig
```

The returned `formConfig` is a standard flat `FormConfig` and can be passed to `processFormConfig()` or `DynamicForm`.

If a module provides a React component, the compiler exposes it through `componentRegistry` so consumers can pass it into the existing `DynamicForm` `componentRegistry` prop without changing the renderer.

#### Compiler Hooks

Compiler extension points:

```ts
beforeCompile;
beforeModuleExpand;
afterModuleExpand;
afterCompile;
```

Hooks operate on compile context only. They should not mutate React runtime state or Ant Design Form instances.

### Compatibility Rules

- Existing `FormConfig` remains the primary runtime contract.
- Existing `DynamicForm` props are unchanged.
- Existing `processFormConfig()` behavior is unchanged.
- Ant Design Form remains the source of truth for values, validation, touched state, and submit state.
- DynamicForm continues to own field meta, group meta, runtime capability resolution, and dependency metadata.

### Non-Goals for 3.0

- No package split.
- No Rule Engine.
- No visual form builder.
- No AI form generator.
- No custom validation engine.
- No duplicated values store.
- No replacement for Ant Design Form.

Rule Engine has moved into the 3.1 implementation. The remaining topics stay future 3.2+ or 4.0 work.

### Migration Path

Current users do not need to migrate.

Existing usage:

```ts
const formConfig: FormConfig = {
  fields: [{ id: 'name', component: 'TextInput' }]
};
```

New module-based usage:

```tsx
const compiled = compileFormConfig([
  { type: 'UserSelector', id: 'ownerId', options: { label: 'Owner' } }
]);

<DynamicForm
  form={form}
  formConfig={compiled.formConfig}
  componentRegistry={{ customComponents: compiled.componentRegistry }}
/>;
```

This keeps module compilation outside the runtime renderer and preserves the current architecture boundary.

### Future Roadmap

3.1 implemented direction: introduce an independent Rule Engine for declarative synchronous linkage rules and compile rules into standard effects.

3.2 implemented direction: add Adapter Foundation to normalize external or module-like input into `ModuleConfig[]` before reusing the existing compiler.

3.3 implemented direction: add JsonSchema/OpenAPI/Metadata adapters that output flat `ModuleConfig[]` through Adapter Foundation.

4.0 direction: consider validation rules, async rules, package split, domain module packages, visual builder, and AI generator after Schema Adapter, Adapter Foundation, Rule Engine, and compiler foundation are stable.
