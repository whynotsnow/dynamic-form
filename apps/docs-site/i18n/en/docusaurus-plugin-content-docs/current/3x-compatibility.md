# 3.x Compatibility and 4.0 Migration Baseline

DynamicForm 3.4 is the compatibility baseline before 4.0. It records the stable 3.x boundaries users should depend on, plus configuration habits that prepare projects for the future unified node tree.

### 3.x Main Model

The 3.x main flow remains:

```text
FormConfig
  -> adapter/compiler
  -> processFormConfig
  -> Runtime
  -> renderer
```

`DynamicForm` continues to accept the existing `FormConfig`. Adapter, Compiler, Rule Engine, and Schema Adapters are optional preprocessing layers that still output the current standard `FormConfig`.

### Stable 3.x Boundaries

- `id` is the stable identity for Runtime, the field registry, the effect graph, and meta updates.
- `name` is the Ant Design `NamePath` used for values, `Form.Item`, and validation paths.
- `fields` and `groups` remain the current structure model; a group contains one level of fields.
- Runtime resolves field/group capabilities only, not containers or recursive subtrees.
- Effects and rules stay synchronous; async requests, remote options, and server validation belong in business components or containers.
- Schema adapters do not expand nested objects or object arrays, and do not infer UI from primitive types.

### Preparing for 4.0

- Always use globally unique, stable field/group `id` values.
- Use explicit `name` for nested submitted values instead of encoding nesting into `id`.
- External schema input should declare `module`, `name`, `groupId`, `rules`, and `overrides` through metadata.
- When one source field affects multiple fields, keep declaring rules on each affected field.
- Keep effect results synchronous and semantic; do not put request lifecycle or race state into handlers.

### 4.0 Preview

4.0 is planned to introduce a unified Form Node Tree, using nodes such as `field`, `group`, and `container` to describe form structure. On top of Field Address, it is expected to support nested values and a cross-level effect graph, while providing a 3.x configuration compatibility adapter.

These capabilities are not public APIs implemented in 3.4. Version 3.4 only provides the migration baseline, documentation, and compatibility guardrails.
