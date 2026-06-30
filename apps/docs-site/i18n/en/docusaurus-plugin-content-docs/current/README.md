---
slug: /
---

# DynamicForm Documentation

This directory is the entry point for the current DynamicForm documentation. The reading order starts with design, then configuration, then usage scenarios, and finally maintenance rules.

### Reading Path

1. 🏗️ [Architecture](./ARCHITECTURE.md): optional preprocessing and Config / State / Runtime / Consumer / Shared boundaries.
2. ⚙️ [Configuration Guide](./configuration.md): flat, grouped, and mixed config, field config, UI config, and built-in components.
3. 🧭 [Field Address](./field-address.md): stable field IDs and Ant Design `NamePath` boundaries.
4. 🧩 [Compiler Foundation](./compiler-foundation.md): field modules, module registry, structured group compilation, and compiler hooks.
5. 📐 [Rule Engine](./rule-engine.md): declarative conditions, field/group actions, and rule ownership.
6. 🔄 [Adapter Foundation](./adapter-foundation.md): adapter registry and input normalization.
7. 🧾 [Schema Adapters](./schema-adapters.md): JsonSchema, OpenAPI, and metadata mapping boundaries.
8. 🔗 [Effects and Handlers](./effects-and-handlers.md): dependency effects, default result keys, custom handlers, and initialization.
9. 🎨 [Rendering and UI Extensions](./rendering-and-ui.md): default rendering, component registry, and layered render hooks.
10. 🧠 [Runtime Layer](./runtime-layer.md): rendering, submission, disabled, readonly, and validation policies.
11. 🧭 [Component Usage Guide](./development.md): usage-oriented configuration, demo links, custom components, and custom handlers.
12. 🧾 [CHANGELOG](./changelog.md): reader-focused release summaries and related topic entry points.
13. 🛠️ [Maintenance Guide](./maintenance.md): tests, builds, verification, and documentation maintenance.

### Documentation Scope

The docs describe the current implementation in `src`, not aspirational APIs. When implementation changes, update the closest topic file first, then update the root `README.md` summary or links if needed.

### Public Surface Summary

The package exports:

- `DynamicForm`
- `CompiledDynamicForm`
- `DynamicFormProvider`
- `FormChainEffectEngineWrapper`
- `useInitHandlers`
- `useStoreInit`
- `useFormChainContext`
- `ComponentRegistryManager`
- `DefaultRegistryFieldComponents`
- `getDefaultConfig`
- `processFormConfig`
- `compileFormConfig`
- `ModuleRegistryManager`
- `defaultModuleRegistry`
- `AdapterRegistryManager`
- `defaultAdapterRegistry`
- `adaptModuleConfigs`
- `compileAdaptedFormConfig`
- `JsonSchemaAdapter`
- `OpenApiAdapter`
- `MetadataAdapter`
- `ModuleConfigPassthroughAdapter`
- `RuleEngine`
- `createRuleEngine`
- `compileRulesToEffect`
- `evaluateRule`
- `getFieldName`
- `resolveFieldAddress`
- Core public types from `packages/dynamic-form/src/shared/types.ts`.
- Runtime types: `FieldCapability`, `GroupCapability`, and `RuntimeState`.

### Design Summary

DynamicForm combines optional preprocessing capabilities with a stable runtime pipeline:

- Adapter / Compiler / Rules normalize external input and domain modules into standard `FormConfig`.
- Config processing turns user config into field/group state, initial values, dependency maps, and registry metadata.
- State stores structure and meta, not Ant Design runtime values.
- Runtime resolves final field/group capabilities from state.
- Consumer rendering turns runtime-capable state into Ant Design UI.
- Effects and handlers translate dependency results into semantic form, meta, group, or UI updates.

### 3.0 Configuration Pipeline

DynamicForm 3.0 adds an optional adapter/rule/compiler pipeline before the existing `FormConfig` runtime pipeline.

- [Compiler Foundation](./compiler-foundation.md): field modules, module registry, config compiler, and compiler hooks.
- [Rule Engine](./rule-engine.md): declarative synchronous rules, dependency inference, and field/group actions.
- [Adapter Foundation](./adapter-foundation.md): adapter registry, structured `ModuleFormConfig`, and the mixed group pipeline.
- [Schema Adapters](./schema-adapters.md): JsonSchema, OpenAPI, and metadata adapters built on Adapter Foundation.
- Existing `FormConfig` and `DynamicForm` usage remains compatible.

### 3.2 Field Address

DynamicForm 3.2 separates stable field IDs from Ant Design `NamePath` values. Omitting `name` continues to use `id`, preserving existing configurations. See [Field Address](./field-address.md).
