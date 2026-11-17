# CHANGELOG

This page explains what changed for form users in each release and whether existing code needs an update. See the repository root `CHANGELOG.md` for the complete release record.

## Current Version

The current version is DynamicForm 4.2.3. Continue using `@whynotsnow/dynamic-form` for regular React forms. Install `@whynotsnow/dynamic-form-core` separately only when you need to validate or convert config before rendering a form.

## Release Timeline

### 4.2.3 - 2026-11-17

- Fixes source-field connections for compiled field, group, and container rules, including conditional group and container visibility.
- Clears an entire repeatable container from submitted values while hidden and restores its rows when shown again.
- Adds business context and submitted-data dialogs to demos while keeping the displayed source in sync.

Related topics: [Rule Engine](./rule-engine.md), [Runtime Layer](./runtime-layer.md), [Component Usage Guide](./development.md).

### 4.2.2 - 2026-11-16

- Moves the form-effect runtime to `@whynotsnow/hooks` and improves related types and input checks.
- Adds the recommended `FormChainEffectWrapper` name while keeping the older name available; existing code using it does not need an immediate change.
- Keeps public types for field values, form instances, component props, and handler callbacks compatible. Existing form config does not need to migrate.

Related topics: [Effects and Handlers](./effects-and-handlers.md), [Configuration Guide](./configuration.md).

### 4.2.0 - 2026-07-02

- Adds the optional `@whynotsnow/dynamic-form-core` package to validate and convert config before a form is displayed.
- React forms remain available from `@whynotsnow/dynamic-form`; existing imports still work, so migration is not required.

Related topic: [Core Package](./core-package.md).

### 4.1.0 - 4.1.2 - 2026-07-01

- Adds `formAdapter` and `renderer` extension points while keeping existing Ant Design `form` usage compatible.
- Adds an in-memory form adapter and headless renderer for tests and previews; the memory adapter does not run real validation rules.
- Adds config diagnostics and field-state queries for config tools that save or preview forms.

Related topics: [Rendering and UI](./rendering-and-ui.md), [Configuration Guide](./configuration.md), [Runtime Layer](./runtime-layer.md).

### 4.0.0 - 2026-07-01

- Adds `FormConfig.nodes` and `ModuleFormConfig.nodes` with recursive `FieldNode` / `ContainerNode` support.
- `ContainerNode.name` can prefix descendant Ant Design `NamePath` values; repeatable containers render existing repeated items through Ant Design `Form.List`.
- Runtime resolves field and container capabilities through parent container visibility, so hidden parents affect all descendant rendering, submission, and validation participation.
- `fields`, `groups`, mixed configurations, and `CompiledDynamicForm` remain compatible.

Related topics: [Configuration Guide](./configuration.md), [Compiler Foundation](./compiler-foundation.md), [Runtime Layer](./runtime-layer.md), [Field Address](./field-address.md).

### 3.4.0 - 2026-06-30

- Provides preparation guidance for the 4.0 config model: use stable field `id` values and set `name` when you need nested submitted values.

Related topics: [Architecture](./ARCHITECTURE.md), [Field Address](./field-address.md), [Runtime Layer](./runtime-layer.md), [Effects and Handlers](./effects-and-handlers.md), [Schema Adapters](./schema-adapters.md).

### 3.1.0 - 2026-06-12

- Lets you set a field `name` separately so submitted values can be nested. If omitted, it still uses the field `id`, so existing flat forms need no changes.

### 3.0.0 - 2026-06-16

- Adds field modules, config conversion, schema adapters, and synchronous rules.
- Adds `CompiledDynamicForm` to display converted form config directly.
- Existing `DynamicForm` and handwritten `FormConfig` usage remains available.

### 2.0.0 - 2026-06-02

- Adds unified rules for field visibility, submission, disabled, readonly, and validation behavior.
- Hidden fields are excluded from submission by default; readonly fields can still be validated.

## Maintenance Rules

- The complete release log is maintained in the repository root `CHANGELOG.md`.
- This page keeps only the docs-site reader summary and topic entry points.
- When release records change, also check the documentation rules in [Maintenance Guide](./maintenance.md).
