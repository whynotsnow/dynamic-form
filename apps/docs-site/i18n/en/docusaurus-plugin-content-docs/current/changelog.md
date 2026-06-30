# CHANGELOG

This page is a reader-focused release summary for the docs site. Use it to quickly identify version capabilities, migration impact, and related topic docs. The complete release log remains in the repository root `CHANGELOG.md`.

### Current Version

The current documentation baseline is DynamicForm 3.4. It is the compatibility release before 4.0 and clarifies the boundary between the 3.x main model and the planned 4.0 structural redesign.

Version 3.4 does not introduce a unified node tree, containers, nested groups, or a cross-level effect graph. The current main flow remains `FormConfig -> adapter/compiler -> processFormConfig -> Runtime -> renderer`.

### Release Timeline

#### 3.4.0 - 2026-06-30

- Clarifies 3.x compatibility boundaries and 4.0 migration preparation.
- Adds compatibility guardrail tests that continue rejecting nested object schemas, object array schemas, duplicate field/group ids, and duplicate `name` paths.
- Recommends stable `id` values, explicit `name`, schema metadata, and synchronous rules/effects boundaries for 3.x projects.

Related topics: [Architecture](./ARCHITECTURE.md), [Field Address](./field-address.md), [Runtime Layer](./runtime-layer.md), [Effects and Handlers](./effects-and-handlers.md), [Schema Adapters](./schema-adapters.md).

#### 3.3.0 - 2026-06-30

- Schema and metadata adapters can explicitly pass through Field Address `name`.
- The package root exports `FieldCapability`, `GroupCapability`, and `RuntimeState` types.
- `FormConfig`, Runtime, and renderer behavior remain compatible.

#### 3.2.1 - 2026-06-30

- Expands test coverage for Field Address, Runtime capabilities, and hidden-field participation.
- Stabilizes the 3.2 behavior boundary without adding public APIs.

#### 3.2.0 - 2026-06-30

- Converts the repository into a private pnpm workspace root while keeping `packages/dynamic-form/` as the only npm package.
- Adds the Docusaurus docs-site workspace with separate zh-CN docs and English i18n content.
- Clarifies that DynamicForm core does not support library-level async effects or async validation compilation.

#### 3.1.0 - 2026-06-12

- Adds the Field Address foundation, separating stable field `id` from Ant Design `NamePath`.
- Supports nested values while Runtime, the effect graph, and meta updates keep using stable `id`.
- Omitting `name` continues to use `id`, so existing single-level configurations require no migration.

#### 3.0.0 - 2026-06-16

- Adds Compiler, Module Registry, Adapter, Schema Adapter, and declarative Rule Engine capabilities on top of the 2.0 Runtime / State layering.
- Adds `CompiledDynamicForm` for rendering compiler / adapter output with the generated component registry.
- Existing `DynamicForm` and handwritten `FormConfig` usage remains compatible.

#### 2.0.0 - 2026-06-02

- Reorganizes Config, State, Runtime, Consumer, and Shared layers.
- Clarifies that Ant Design Form owns values, validation, touched, and validating runtime state.
- Adds the Runtime Layer for resolving field and group rendering, submission, disabled, readonly, and validation capabilities.

### Maintenance Rules

- The complete release log is maintained in the repository root `CHANGELOG.md`.
- This page keeps only the docs-site reader summary and topic entry points.
- When release records change, also check the documentation rules in [Maintenance Guide](./maintenance.md).
