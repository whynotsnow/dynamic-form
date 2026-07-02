# Field Address

DynamicForm includes `FieldAddress` in the current capability baseline, separating a field's stable logical identity from its Ant Design Form value path:

```ts
interface FieldAddress {
  id: string;
  name: NamePath;
}
```

- `id` is the globally unique identity used by Runtime, the field registry, the effect graph, and meta updates.
- `name` is the Ant Design `NamePath` used by `Form.Item`, value access, and validation.
- When `name` is omitted, it defaults to `id`, so existing flat configurations require no migration.
- In 4.0 `nodes`, parent container `name` values prefix descendant field names.

Nested values can use `name: ['shipping', 'city']` while effects continue referencing the stable field `id`. Effect and functional `initialValue` values preserve the nested structure and also expose stable field-ID aliases. The package exports `resolveFieldAddress(field)` and `getFieldName(field)` for custom renderers and components.

JsonSchema, OpenAPI, and Metadata adapters can explicitly pass `name` through metadata. The value still lands on the existing `BaseFieldConfig.name`, which is useful when external schema input needs nested values without changing the rule that effect graph nodes reference stable `id` values.

## Container Prefixes

In 4.0, `ContainerNode.name` becomes the Ant Design value path prefix for descendant fields:

```ts
const formConfig: FormConfig = {
  nodes: [
    {
      nodeType: 'container',
      id: 'shipping',
      name: 'shipping',
      children: [
        {
          nodeType: 'field',
          id: 'city',
          component: 'TextInput'
        }
      ]
    }
  ]
};
```

The final `NamePath` for field `city` is `['shipping', 'city']`. If the field explicitly declares `name: 'addressCity'`, the final path becomes `['shipping', 'addressCity']`.

## Stable Boundaries

Field, group, and container IDs must remain globally unique. Two fields should not use the same final `name` path, otherwise Ant Design Form value reads and writes will conflict.

Groups only affect Runtime rendering, submission, and validation capability; `groups` do not automatically prefix field value paths. Only named containers in `nodes` participate in value path composition.

For future structural upgrades, always use globally unique and stable field/group `id` values. Use explicit `name` for nested submitted values instead of encoding nesting semantics into `id`.
