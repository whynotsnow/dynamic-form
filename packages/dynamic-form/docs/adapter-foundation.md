# Adapter Foundation

## 中文文档

Adapter Foundation 位于 Compiler Foundation 之前，用于把外部或类模块输入归一化为结构化 `ModuleFormConfig`。

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

Adapter 只负责输入转换。规则合并、依赖推导、组件注册和 `FormConfig` 生成仍由现有 compiler 负责。

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

重复 adapter type 默认会报错。只有显式传入 `{ override: true }` 时才允许覆盖。

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

未指定 `adapterType` 时，pipeline 会按注册顺序选择第一个 `supports()` 成功的 adapter。
默认顺序是 passthrough、JsonSchema、OpenAPI、Metadata。因此单个 object schema 会优先由 JsonSchema adapter 处理；需要强制 OpenAPI 的单 schema 兼容路径时，应显式传入 `adapterType: 'openapi'`。

### Boundaries

- Adapter Foundation 本身不负责 JsonSchema、OpenAPI 或 Metadata 的具体映射。
- Adapter Foundation 不修改 `compileFormConfig()`、`processFormConfig()`、runtime 或 renderer 的职责。
- 当前版本不引入异步规则、validation rule engine 或 monorepo 拆包。
- Adapter 输出统一为 `{ fields, groups? }`，字段通过 `groupId` 加入 group，可表达 flat、grouped 和 mixed 配置。

当前 3.0 发布同时包含 `JsonSchemaAdapter`、`OpenApiAdapter` 和 `MetadataAdapter`，详见 [Schema Adapters](./schema-adapters.md)。以上边界仅描述 Adapter Foundation 本身的职责范围。

---

## English Documentation

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
