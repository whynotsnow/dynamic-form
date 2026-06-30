# Schema Adapters

DynamicForm 3.0 provides concrete schema adapters on top of Adapter Foundation:

```text
JsonSchema / OpenAPI / Metadata
  -> Schema Adapter
  -> ModuleFormConfig
  -> compileFormConfig
  -> FormConfig
  -> processFormConfig
  -> DynamicForm
```

Schema adapters convert input into structured `ModuleFormConfig`. Module expansion, group assembly, rule compilation, dependency inference, component registration, and runtime behavior remain owned by the compiler/runtime pipeline.

Schema `required` is mapped to field-level `required` semantics. Adapters do not generate Ant Design `rules` directly; the default Ant Design renderer merges `required` into final validation rules.

### JsonSchemaAdapter

Supports top-level object schemas:

```ts
import { adaptModuleConfigs } from '@whynotsnow/dynamic-form';

const moduleConfigs = adaptModuleConfigs(
  {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        title: 'Name',
        metadata: {
          module: 'TextInputModule',
          name: ['profile', 'name'],
          options: { placeholder: 'Enter name' }
        }
      }
    }
  },
  { adapterType: 'json-schema' }
);
```

Fields must explicitly declare module type through `metadata.module` or `x-dynamic-form.module`. The adapter does not infer UI components from schema types such as `string`, `number`, or `boolean`.

Starting in 3.3, field metadata can explicitly pass a Field Address `name`. The adapter writes it to module config `overrides.name`. This only passes through the existing `BaseFieldConfig.name` capability and does not expand nested object schemas:

```ts
{
  metadata: {
    module: 'TextInputModule',
    name: ['profile', 'name']
  }
}
```

Top-level `x-dynamic-form.groups` declares groups, while property-level `x-dynamic-form.groupId` declares membership. Schema data may configure `initialVisible` and group-owned show/hide rules, but cannot carry function effects. Inject functions through `groupOverrides` after adaptation and before compilation:

```ts
compileAdaptedFormConfig(schema, {
  adapterType: 'json-schema',
  moduleRegistry,
  groupOverrides: {
    companyInfo: {
      effect: (changedValue, values) => ({ visible: values.enabled === true })
    }
  }
});
```

`groupOverrides` deduplicates merged `dependents`, appends override rules after schema rules, and replaces the adapter effect. Unknown group IDs fail immediately.

### OpenApiAdapter

Supports OpenAPI `components.schemas`:

```ts
const moduleConfigs = adaptModuleConfigs(openApiDocument, {
  adapterType: 'openapi',
  context: {
    metadata: { schemaName: 'User' }
  }
});
```

If the OpenAPI document contains only one schema, `schemaName` may be omitted. If multiple schemas exist, `schemaName` is required.

### MetadataAdapter

Supports project-specific metadata:

```ts
const moduleConfigs = adaptModuleConfigs(
  {
    fields: [
      {
        id: 'name',
        type: 'TextInputModule',
        name: ['profile', 'name'],
        options: { label: 'Name' },
        overrides: { required: true }
      }
    ]
  },
  { adapterType: 'metadata' }
);
```

Each field must provide `id` and `type`, with optional `name`, `options`, `rules`, and `overrides`. `name` is merged into `overrides.name` for nested values.

External schema input should declare `module`, `name`, `groupId`, `rules`, and `overrides` explicitly through metadata. Adapters normalize input only; they do not infer UI from primitive types and do not expand nested structures.

### Boundaries

- No nested object schema expansion.
- No object array item schema expansion.
- No validation rule engine.
- Except for field-level `required` semantics, `minLength`, `maxLength`, `pattern`, `minimum`, and `maximum` are not implicitly translated into Ant Design rules. Declare them explicitly through metadata or module rules so adapters do not silently choose messages, triggers, or component value semantics.
- No async/API rules and no commitment to async validation compilation. Remote validation and remote options should be owned by custom components or application containers.
- No automatic UI or module type inference from schema types.
- Single-level groups and mixed fields are supported. Nested groups and multi-group field membership are not supported.
