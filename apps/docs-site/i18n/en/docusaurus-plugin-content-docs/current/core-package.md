# Core Package

Starting in 4.2.0, DynamicForm adds `@whynotsnow/dynamic-form-core` for pure core capabilities that do not depend on the React consumer, Ant Design renderer, or default field components.

`@whynotsnow/dynamic-form` remains the compatible main entry. It continues to export `DynamicForm`, `CompiledDynamicForm`, Provider, hooks, component registry, the default AntD renderer, headless renderer, and form adapters, while re-exporting core public APIs. Existing imports do not need to migrate.

### When to Use Core Directly

- Validate visual-builder configs before saving.
- Convert schema or metadata into standard `FormConfig` at build time or on a server.
- Run the Rule Engine or Compiler without rendering a React form.
- Read Runtime inspection helpers in designer previews, debug panels, or tests.
- Maintain domain field modules, schema adapters, or config diagnostics independently.

### APIs in Core

- Config processing: `processFormConfig`
- Config diagnostics: `getFormConfigDiagnostics`, `validateFormConfig`
- Compiler: `compileFormConfig`, `ModuleRegistryManager`, `defaultModuleRegistry`
- Adapters: `AdapterRegistryManager`, `adaptModuleConfigs`, `compileAdaptedFormConfig`, JsonSchema/OpenAPI/metadata adapters
- Rules: `RuleEngine`, `createRuleEngine`, `compileRulesToEffect`, `evaluateRule`
- Runtime pure logic: `resolveRuntimeState`, `resolveFieldCapability`, `resolveGroupCapability`
- Runtime inspection: `getFieldRuntimeSnapshot`, `getRenderedFieldIds`, `getSubmitableFieldIds`, `getValidatableFieldIds`
- Shared pure types: `FormConfig`, `BaseFieldConfig`, `FieldNamePath`, `DesignerMetadata`, Field Address, and Runtime types

### APIs That Stay in dynamic-form

- React components: `DynamicForm`, `CompiledDynamicForm`
- Provider / hooks: `DynamicFormProvider`, `useInitHandlers`, `useFormChainContext`, `useStoreInit`
- Form adapters: `createAntdFormAdapter`, `createMemoryFormAdapter`, `assertFormAdapter`
- Renderers: `antdRenderer`, `headlessRenderer`, `assertRendererAdapter`
- Component registry: `ComponentRegistryManager`, `DefaultRegistryFieldComponents`
- Default effect handler runtime and `getDefaultConfig`

### Imports

Existing imports remain valid:

```ts
import { FormConfig, compileFormConfig } from '@whynotsnow/dynamic-form';
```

Use core directly when only pure config capabilities are needed:

```ts
import { FormConfig, validateFormConfig } from '@whynotsnow/dynamic-form-core';
```

### Migration Boundary

4.2.0 does not remove existing public exports from `@whynotsnow/dynamic-form` and does not force users to migrate. The core package is an additional entry for designers, schema pipelines, tests, and non-React environments.
