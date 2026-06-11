# Adapter Foundation

## 中文文档

DynamicForm 3.2 在 Compiler Foundation 之前新增 Adapter Foundation，用于把外部或类模块输入归一化为 `ModuleConfig[]`。

```text
External / Module-like Input
  -> Adapter Registry
  -> Adapter Pipeline
  -> ModuleConfig[]
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
  adapt: (input) =>
    input.fields.map((field) => ({
      type: field.type,
      id: field.name
    }))
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

const moduleConfigs = adaptModuleConfigs(input, {
  registry,
  adapterType: 'custom-metadata'
});

const compiled = compileAdaptedFormConfig(input, {
  adapterRegistry: registry,
  moduleRegistry
});
```

未指定 `adapterType` 时，pipeline 会按注册顺序选择第一个 `supports()` 成功的 adapter。

### Boundaries

- 3.2 不实现 JsonSchema、OpenAPI 或 Metadata 具体 adapter。
- 3.2 不修改 `compileFormConfig()`、`processFormConfig()`、runtime 或 renderer。
- 3.2 不引入异步规则、validation rule engine 或 monorepo 拆包。
- Adapter 输出保持为 flat `ModuleConfig[]`；分组和 schema 映射策略留给 3.3。

当前仓库已经包含 3.3 `JsonSchemaAdapter`、`OpenApiAdapter` 和 `MetadataAdapter`，详见 [Schema Adapters](./schema-adapters.md)。以上边界仅描述 3.2 Adapter Foundation 本身的职责范围。

---

## English Documentation

DynamicForm 3.2 adds Adapter Foundation before Compiler Foundation. It normalizes external or module-like input into `ModuleConfig[]`.

```text
External / Module-like Input
  -> Adapter Registry
  -> Adapter Pipeline
  -> ModuleConfig[]
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
  adapt: (input) =>
    input.fields.map((field) => ({
      type: field.type,
      id: field.name
    }))
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

const moduleConfigs = adaptModuleConfigs(input, {
  registry,
  adapterType: 'custom-metadata'
});

const compiled = compileAdaptedFormConfig(input, {
  adapterRegistry: registry,
  moduleRegistry
});
```

When `adapterType` is not specified, the pipeline picks the first registered adapter whose `supports()` method matches the input.

### Boundaries

- 3.2 does not implement concrete JsonSchema, OpenAPI, or Metadata adapters.
- 3.2 does not change `compileFormConfig()`, `processFormConfig()`, runtime, or renderer.
- 3.2 does not introduce async rules, a validation rule engine, or a monorepo split.
- Adapter output stays flat `ModuleConfig[]`; grouped output and schema mapping strategy are 3.3 work.

The current repository also includes the 3.3 `JsonSchemaAdapter`, `OpenApiAdapter`, and `MetadataAdapter`; see [Schema Adapters](./schema-adapters.md). The boundaries above describe only the 3.2 Adapter Foundation scope.
