---
slug: /
---

# DynamicForm Documentation

This is the entry point for DynamicForm 4.1 documentation. New users should start with Quick Start to run a minimal form, then use scenario docs for configuration, effects, validation, and extensions. Architecture, Runtime, Compiler, Adapter, Renderer, and node tree topics are for deeper understanding and maintenance.

### Recommended Path

1. 🚀 [Quick Start](./quick-start.md): installation, minimal form, submit handling, and local demos.
2. ⚙️ [Configuration Guide](./configuration.md): fields, groups, node trees, UI config, and built-in components.
3. 🔗 [Effects and Handlers](./effects-and-handlers.md): field dependencies, default result keys, custom handlers, and initialization.
4. 🎨 [Rendering and UI Extensions](./rendering-and-ui.md): default rendering, component registry, and layered render hooks.
5. 🧭 [Component Usage Guide](./development.md): scenario-based demos, configuration combinations, custom components, and custom handlers.
6. 🧩 [Advanced Configuration Pipeline](./compiler-foundation.md): read Compiler, Rule, Adapter, and Schema Adapter topics when you need field modules, recursive containers, rules, or external schema inputs.
7. 🧠 [Deep Dive](./ARCHITECTURE.md): understand runtime boundaries and the 4.1 structure model through Architecture, Runtime Layer, Renderer Adapter, and Field Address.
8. 🧾 [CHANGELOG](./changelog.md): reader-focused release summaries and related topic entry points.
9. 🛠️ [Maintenance Guide](./maintenance.md): tests, builds, verification, and documentation maintenance.

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
- `assertFormAdapter`
- `createAntdFormAdapter`
- `createMemoryFormAdapter`
- `assertRendererAdapter`
- `antdRenderer`
- `headlessRenderer`
- Core public types from `packages/dynamic-form/src/shared/types.ts`.
- Runtime types: `FieldCapability`, `GroupCapability`, and `RuntimeState`.

### Design Summary

DynamicForm combines optional preprocessing capabilities with a stable runtime pipeline:

- Adapter / Compiler / Rules normalize external input and domain modules into standard `FormConfig`.
- Config processing turns user config into field/group state, initial values, dependency maps, and registry metadata.
- State stores structure and meta, not form runtime values, errors, touched state, or validating state.
- Runtime resolves final field/group capabilities from state.
- Form Adapter wraps value access and validation; the default `createAntdFormAdapter(form)` keeps AntD Form compatible.
- Consumer rendering passes runtime-capable state to a renderer; the default `antdRenderer` renders Ant Design UI.
- Effects and handlers translate dependency results into semantic form, meta, group, or UI updates.

### 4.1 Adapter Foundation

DynamicForm 4.1 adds `formAdapter` and `renderer` extension points. Existing `<DynamicForm form={form} />` usage remains compatible; when adapters are omitted, the default AntD implementation is used. 4.1.1 adds adapter runtime guards, `createMemoryFormAdapter`, and `headlessRenderer` for tests, custom renderer examples, and visual-builder preview mode. 4.1 keeps the single package shape and does not include a second built-in component-library renderer.

### 4.0 Configuration Model

DynamicForm 4.0 makes `FormConfig.nodes` and `ModuleFormConfig.nodes` part of the current capability baseline. `fields` and `groups` remain compatible, but internally they are normalized into a unified node tree:

- `FieldNode`: a field node. It still uses `id` as the stable identity for Runtime, registries, and the effect graph.
- `ContainerNode`: a container node that can nest fields or child containers. Its `name` can prefix descendant Ant Design `NamePath` values.
- Repeatable container: rendered through Ant Design `Form.List`; it must declare `name`.
- Runtime resolves final field and container rendering capabilities through parent container visibility.

Existing `fields`, `groups`, and mixed configurations do not need to migrate; they are treated as top-level fields and top-level containers.

### Configuration Pipeline

DynamicForm provides an optional adapter/rule/compiler pipeline before the `FormConfig` runtime pipeline.

- [Compiler Foundation](./compiler-foundation.md): field modules, module registry, config compiler, and compiler hooks.
- [Rule Engine](./rule-engine.md): declarative synchronous rules, dependency inference, and field/group actions.
- [Adapter Foundation](./adapter-foundation.md): adapter registry, structured `ModuleFormConfig`, and the mixed group pipeline.
- [Schema Adapters](./schema-adapters.md): JsonSchema, OpenAPI, and metadata adapters built on Adapter Foundation.
- Existing `FormConfig` and `DynamicForm` usage remains compatible.

### Field Address

DynamicForm separates stable field IDs from Ant Design `NamePath` values. Omitting `name` continues to use `id`, preserving existing configurations. Inside containers, field `name` is combined with the parent container `name` prefix. See [Field Address](./field-address.md).
