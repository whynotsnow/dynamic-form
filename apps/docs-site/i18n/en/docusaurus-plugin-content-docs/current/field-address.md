# Field Address

DynamicForm 3.2 includes `FieldAddress` in the current capability baseline, separating a field's stable logical identity from its Ant Design Form value path:

```ts
interface FieldAddress {
  id: string;
  name: NamePath;
}
```

- `id` is the globally unique identity used by Runtime, the field registry, the effect graph, and meta updates.
- `name` is the Ant Design `NamePath` used by `Form.Item`, value access, and validation.
- When `name` is omitted, it defaults to `id`, so existing flat configurations require no migration.

Nested values can use `name: ['shipping', 'city']` while effects continue referencing the stable field `id`. Effect and functional `initialValue` values preserve the nested structure and also expose stable field-ID aliases. The package exports `resolveFieldAddress(field)` and `getFieldName(field)` for custom renderers and components.

Starting in 3.3, JsonSchema, OpenAPI, and Metadata adapters can explicitly pass `name` through metadata. The value still lands on the existing `BaseFieldConfig.name`, which is useful when external schema input needs nested values without changing the rule that effect graph nodes reference stable `id` values.

Version 3.2 establishes the addressing foundation only. It does not add container fields, a recursive node tree, nested groups, or a cross-level effect graph. Field and group IDs remain globally unique, and two fields cannot use the same `name` path.

This boundary applies to both flat fields and grouped fields. A group only affects Runtime rendering, submission, and validation capability; a field value path is still determined by the field's own `name`, and is not automatically prefixed by the group.
