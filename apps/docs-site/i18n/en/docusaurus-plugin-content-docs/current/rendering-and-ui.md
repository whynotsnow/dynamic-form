# Rendering and UI Extensions

`FormContent` provides the default Ant Design rendering pipeline and exposes layered extension points. The default UI is intentionally simple and can be replaced incrementally.

### Default Rendering

Flat forms:

```mermaid
flowchart TD
  form["Form"] --> row["Row"]
  row --> col["Col"]
  col --> renderer["FieldComponentRenderer"]
  form --> submit["Submit Button"]
```

Grouped forms:

```mermaid
flowchart TD
  form["Form"] --> card["Card per group"]
  card --> row["Row"]
  row --> col["Col"]
  col --> renderer["FieldComponentRenderer"]
  form --> submit["Submit Button"]
```

Default rendering uses `Form`, `Row`, `Col`, `Card`, and `Button`.

`FieldComponentRenderer` resolves the component, applies `Form.Item` props, maps runtime disabled/readonly state, and suppresses rules when a field is not runtime-validatable. Field-level `required: true` is automatically merged into a required rule by the default Ant Design renderer, while explicit required rules take precedence.

### Nodes and Container Rendering Contract

The 4.0 `nodes` entry renders root nodes in order as continuous field segments and container blocks:

- Continuous field segments are rendered through `renderFields`. The default structure remains `Row -> Col -> FieldComponentRenderer`.
- A container is a block boundary and splits adjacent field segments. By default, a container renders as a `Card`, and its children are segmented recursively with the same rule.
- When a normal container uses `renderGroupItem`, `defaultRender` includes the complete children rendering, including nested containers.
- A repeatable container uses `Form.List`. Each list item also renders its children as continuous field segments and rewrites field names to list-item-relative paths.

As a result, `renderFields` applies not only to legacy flat fields or fields inside groups, but also to top-level continuous fields, field segments split by containers in mixed root nodes, nested container field segments, and repeatable item field segments.

### Component Registry

Use `componentRegistry` to register business-specific field components. Custom components receive `field`, `value`, `onChange`, and `form`.

By default, custom components do not replace built-ins. Set `allowOverride: true` only when replacement is intentional.

### Render Hooks

Render hooks are layered from smallest to largest scope:

- `renderFieldItem`: customize one field item.
- `renderFields`: customize a field list.
- `renderGroupItem`: customize one group.
- `renderGroups`: customize all groups.
- `renderFormInner`: customize the full form body and submit area.

Each hook receives lower-level render functions and `defaultRender`, so callers can wrap or replace only the part they need.

### Choosing an Extension Point

Use `uiConfig` when the default structure is still correct and only Ant Design props need to change. Use `componentRegistry` when the field input itself is business-specific. Use render hooks when the layout structure needs to change.

Default rendering respects Runtime. Custom render hooks can bypass those defaults if they ignore the provided render helpers, so full replacement should be intentional.
