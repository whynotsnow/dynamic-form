# CHANGELOG

This page is a reader-focused release summary for the docs site. Use it to quickly identify version capabilities, migration impact, and related topic docs. The complete release log remains in the repository root `CHANGELOG.md`.

## Current Version

The current documentation baseline is DynamicForm 4.2. It builds on the 4.0 unified node tree and the 4.1 Form/Renderer Adapter foundation by adding the pure `@whynotsnow/dynamic-form-core` package. `@whynotsnow/dynamic-form` remains the React/AntD-compatible main entry and re-exports core public APIs.

The main flow remains `FormConfig -> adapter/compiler -> processFormConfig -> Runtime -> renderer`. Config processing, Compiler, Adapters, Rules, and pure Runtime resolvers belong to core; React Provider, hooks, form adapters, renderers, component registry, and effect handler runtime belong to `@whynotsnow/dynamic-form`.

## Release Timeline

### 4.2.0 - 2026-07-02

- Adds `@whynotsnow/dynamic-form-core` for config processing, config diagnostics, Compiler, Adapters, Rule Engine, pure Runtime resolvers, and Runtime inspection helpers.
- Keeps `@whynotsnow/dynamic-form` compatible for existing imports while it continues to export React/AntD runtime APIs and re-export core public APIs.
- Changes the release flow so core publishes before the React/AntD package, with a unified version strategy.

Related topic: [Core Package](./core-package.md).

### 4.1.0 - 4.1.2 - 2026-07-01

- 4.1 adds `formAdapter` and `renderer` extension points while keeping the existing AntD `form` usage compatible.
- 4.1.1 adds `createMemoryFormAdapter`, `headlessRenderer`, and adapter runtime guards for tests, custom renderer examples, and visual-builder previews.
- 4.1.2 adds config diagnostics, designer metadata, and Runtime inspection helpers, and clarifies the minimum contract for custom form adapters and renderers.

Related topics: [Rendering and UI](./rendering-and-ui.md), [Configuration Guide](./configuration.md), [Runtime Layer](./runtime-layer.md).

### 4.0.0 - 2026-07-01

- Adds `FormConfig.nodes` and `ModuleFormConfig.nodes` with recursive `FieldNode` / `ContainerNode` support.
- `ContainerNode.name` can prefix descendant Ant Design `NamePath` values; repeatable containers render existing repeated items through Ant Design `Form.List`.
- Runtime resolves field and container capabilities through parent container visibility, so hidden parents affect all descendant rendering, submission, and validation participation.
- `fields`, `groups`, mixed configurations, and `CompiledDynamicForm` remain compatible.

Related topics: [Configuration Guide](./configuration.md), [Compiler Foundation](./compiler-foundation.md), [Runtime Layer](./runtime-layer.md), [Field Address](./field-address.md).

### 3.4.0 - 2026-06-30

- Clarifies 3.x compatibility boundaries and 4.0 migration preparation.
- Adds compatibility guardrail tests that continue rejecting nested object schemas, object array schemas, duplicate field/group ids, and duplicate `name` paths.
- Recommends stable `id` values, explicit `name`, schema metadata, and synchronous rules/effects boundaries for 3.x projects.

Related topics: [Architecture](./ARCHITECTURE.md), [Field Address](./field-address.md), [Runtime Layer](./runtime-layer.md), [Effects and Handlers](./effects-and-handlers.md), [Schema Adapters](./schema-adapters.md).

### 3.3.0 - 2026-06-30

- Schema and metadata adapters can explicitly pass through Field Address `name`.
- The package root exports `FieldCapability`, `GroupCapability`, and `RuntimeState` types.
- `FormConfig`, Runtime, and renderer behavior remain compatible.

### 3.2.1 - 2026-06-30

- Expands test coverage for Field Address, Runtime capabilities, and hidden-field participation.
- Stabilizes the 3.2 behavior boundary without adding public APIs.

### 3.2.0 - 2026-06-30

- Converts the repository into a private pnpm workspace root while `packages/dynamic-form/` was the npm package at that time.
- Adds the Docusaurus docs-site workspace with separate zh-CN docs and English i18n content.
- Clarifies that DynamicForm core does not support library-level async effects or async validation compilation.

### 3.1.0 - 2026-06-12

- Adds the Field Address foundation, separating stable field `id` from Ant Design `NamePath`.
- Supports nested values while Runtime, the effect graph, and meta updates keep using stable `id`.
- Omitting `name` continues to use `id`, so existing single-level configurations require no migration.

### 3.0.0 - 2026-06-16

- Adds Compiler, Module Registry, Adapter, Schema Adapter, and declarative Rule Engine capabilities on top of the 2.0 Runtime / State layering.
- Adds `CompiledDynamicForm` for rendering compiler / adapter output with the generated component registry.
- Existing `DynamicForm` and handwritten `FormConfig` usage remains compatible.

### 2.0.0 - 2026-06-02

- Reorganizes Config, State, Runtime, Consumer, and Shared layers.
- Clarifies that Ant Design Form owns values, validation, touched, and validating runtime state.
- Adds the Runtime Layer for resolving field and group rendering, submission, disabled, readonly, and validation capabilities.

## Maintenance Rules

- The complete release log is maintained in the repository root `CHANGELOG.md`.
- This page keeps only the docs-site reader summary and topic entry points.
- When release records change, also check the documentation rules in [Maintenance Guide](./maintenance.md).
