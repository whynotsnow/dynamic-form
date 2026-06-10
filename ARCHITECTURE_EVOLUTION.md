# DynamicForm 3.0 Architecture Evolution

## 中文文档

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

这些内容留给 3.1+ 或 4.0。

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

3.1 方向：引入声明式规则定义，并把规则编译为标准 effects。

4.0 方向：在 3.0 compiler foundation 稳定后，再考虑拆包、领域模块包、schema adapter、visual builder 和 AI generator。

---

## English Documentation

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

These remain future 3.1+ or 4.0 topics.

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

3.1 direction: introduce declarative rule definitions and compile them into standard effects.

4.0 direction: consider package split, domain module packages, schema adapters, visual builder, and AI generator after the 3.0 compiler foundation is stable.
