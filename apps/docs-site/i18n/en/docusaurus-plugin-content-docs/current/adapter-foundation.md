# Adapter Foundation

Adapter Foundation sits before Compiler Foundation and normalizes external or module-like input into structured `ModuleFormConfig`.

```text
External / Module-like Input
  -> Adapter Registry
  -> Adapter Pipeline
  -> ModuleFormConfig
  -> compileFormConfig
  -> FormConfig
  -> processFormConfig
  -> DynamicForm
```

Adapters only convert input. Rule merging, dependency inference, component registration, and `FormConfig` generation remain owned by the existing compiler.

### Adapter

```ts
import type { ModuleConfigAdapter } from '@whynotsnow/dynamic-form';

const adapter: ModuleConfigAdapter<{ fields: Array<{ name: string; type: string }> }> = {
  type: 'custom-metadata',
  supports: (input): input is { fields: Array<{ name: string; type: string }> } =>
    !!input && typeof input === 'object' && Array.isArray((input as any).fields),
  adapt: (input) => ({
    fields: input.fields.map((field) => ({
      type: field.type,
      id: field.name
    }))
  })
};
```

### Registry

```ts
import { AdapterRegistryManager } from '@whynotsnow/dynamic-form';

const registry = new AdapterRegistryManager();

registry.register(adapter);
registry.has('custom-metadata');
registry.get('custom-metadata');
registry.list();
registry.unregister('custom-metadata');
```

Duplicate adapter types are rejected by default. Pass `{ override: true }` when replacement is intentional.

### Pipeline

```ts
import { adaptModuleConfigs, compileAdaptedFormConfig } from '@whynotsnow/dynamic-form';

const moduleFormConfig = adaptModuleConfigs(input, {
  registry,
  adapterType: 'custom-metadata'
});

const compiled = compileAdaptedFormConfig(input, {
  adapterRegistry: registry,
  moduleRegistry
});
```

When `adapterType` is not specified, the pipeline picks the first registered adapter whose `supports()` method matches the input.
The default order is passthrough, JsonSchema, OpenAPI, then Metadata. A single object schema therefore resolves to JsonSchema first; pass `adapterType: 'openapi'` when the OpenAPI adapter's single-schema compatibility path is required.

### Boundaries

- Adapter Foundation itself does not own concrete JsonSchema, OpenAPI, or Metadata mappings.
- Adapter Foundation does not change the responsibilities of `compileFormConfig()`, `processFormConfig()`, runtime, or renderer.
- The current release does not introduce async rules, a validation rule engine, or a monorepo split.
- Adapter output is `{ fields, groups? }`. Fields join groups through `groupId`, supporting flat, grouped, and mixed configurations.

The 3.0 release also includes `JsonSchemaAdapter`, `OpenApiAdapter`, and `MetadataAdapter`; see [Schema Adapters](./schema-adapters.md). The boundaries above describe Adapter Foundation itself.
