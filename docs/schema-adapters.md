# Schema Adapters

## 中文文档

DynamicForm 3.3 在 3.2 Adapter Foundation 之上新增具体 schema adapters：

```text
JsonSchema / OpenAPI / Metadata
  -> Schema Adapter
  -> ModuleFormConfig
  -> compileFormConfig
  -> FormConfig
  -> processFormConfig
  -> DynamicForm
```

Schema adapters 把输入转换成结构化 `ModuleFormConfig`。字段模块展开、group 装配、规则编译、依赖推导、组件注册和 runtime 行为继续由现有 compiler/runtime 管线负责。

Schema `required` 会映射为字段 `required` 语义，不会在 adapter 层直接生成 Ant Design `rules`。默认 Ant Design renderer 会统一把 `required` 合并成最终校验规则。

### JsonSchemaAdapter

支持顶层 object schema：

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
          options: { placeholder: 'Enter name' }
        }
      }
    }
  },
  { adapterType: 'json-schema' }
);
```

字段必须通过 `metadata.module` 或 `x-dynamic-form.module` 显式声明 module type。Adapter 不根据 `string`、`number`、`boolean` 等 schema type 猜测 UI 组件。

顶层 `x-dynamic-form.groups` 声明 groups，属性级 `x-dynamic-form.groupId` 声明成员关系。Schema 可配置 `initialVisible` 和 group-owned show/hide rules，但不能携带函数 effect。函数通过 `groupOverrides` 在 adapter 后、compiler 前注入：

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

`groupOverrides` 会去重合并 `dependents`、将 override rules 追加到 schema rules 后，并用 override effect 替换 adapter effect。未知 group ID 会直接报错。

### OpenApiAdapter

支持 OpenAPI document 的 `components.schemas`：

```ts
const moduleConfigs = adaptModuleConfigs(openApiDocument, {
  adapterType: 'openapi',
  context: {
    metadata: { schemaName: 'User' }
  }
});
```

如果 OpenAPI document 只包含一个 schema，可以省略 `schemaName`。如果包含多个 schema，必须显式传入 `schemaName`。

### MetadataAdapter

支持项目自定义 metadata：

```ts
const moduleConfigs = adaptModuleConfigs(
  {
    fields: [
      {
        id: 'name',
        type: 'TextInputModule',
        options: { label: 'Name' },
        overrides: { required: true }
      }
    ]
  },
  { adapterType: 'metadata' }
);
```

每个 field 必须提供 `id` 和 `type`，可选透传 `options`、`rules`、`overrides`。

### Boundaries

- 不展开 nested object schema。
- 不展开 object array item schema。
- 不实现 validation rule engine。
- 除 `required` 外，不自动把 `minLength`、`maxLength`、`pattern`、`minimum`、`maximum` 转成 Ant Design rules；这些约束需要通过 metadata/module 的显式 `rules` 声明。这样可避免 adapter 隐式决定提示文案、触发时机和组件值语义。
- 不实现异步/API 规则。
- 不根据 schema type 自动猜测 UI 或 module type。
- 支持单层 groups 和 mixed fields；不支持 group 嵌套或一个字段属于多个 group。

---

## English Documentation

DynamicForm 3.3 adds concrete schema adapters on top of the 3.2 Adapter Foundation:

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
          options: { placeholder: 'Enter name' }
        }
      }
    }
  },
  { adapterType: 'json-schema' }
);
```

Fields must explicitly declare module type through `metadata.module` or `x-dynamic-form.module`. The adapter does not infer UI components from schema types such as `string`, `number`, or `boolean`.

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
        options: { label: 'Name' },
        overrides: { required: true }
      }
    ]
  },
  { adapterType: 'metadata' }
);
```

Each field must provide `id` and `type`, with optional `options`, `rules`, and `overrides`.

### Boundaries

- No nested object schema expansion.
- No object array item schema expansion.
- No validation rule engine.
- Except for field-level `required` semantics, `minLength`, `maxLength`, `pattern`, `minimum`, and `maximum` are not implicitly translated into Ant Design rules. Declare them explicitly through metadata or module rules so adapters do not silently choose messages, triggers, or component value semantics.
- No async/API rules.
- No automatic UI or module type inference from schema types.
- Single-level groups and mixed fields are supported. Nested groups and multi-group field membership are not supported.
