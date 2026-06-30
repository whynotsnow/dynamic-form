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

Version 3.2 establishes the addressing foundation only. It does not add container fields or a recursive node tree. Field and group IDs remain globally unique, and two fields cannot use the same `name` path.
