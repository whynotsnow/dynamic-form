# Effects and Handlers

DynamicForm delegates dependency execution to `form-chain-effect-engine`, while DynamicForm owns how effect results are applied through its handler system.

### Async Boundary

DynamicForm core does not support library-level async effects. It also does not provide async validation compilation, cancellation, race handling, debounce, loading, error, or cache lifecycle management. The current roadmap does not commit to supporting those capabilities later.

Remote requests, remote option loading, search suggestions, server-side validation, and other async interactions should be encapsulated in custom field components or application containers. Those components may own `AbortController`, request sequencing, cache, loading, and error state, then connect to the form through Ant Design Form `onChange`, `form.setFieldValue`, or `rules.validator`.

DynamicForm only routes and applies synchronous effect results. Custom `EffectResultHandler` implementations should stay synchronous and should not host async task scheduling, request lifecycle, or race handling.

### Initialization Contract

Forms that rely on default or custom effect result handlers should call `useInitHandlers` before rendering.

```tsx
const { isInitialized, error } = useInitHandlers({
  handlers: customHandlers,
  options: { override: false },
  debug: false
});

if (!isInitialized) return null;
if (error) return <div>{error.message}</div>;

return <DynamicForm form={form} formConfig={formConfig} />;
```

`DynamicFormProvider` can warn when handler initialization appears to be missing. This is controlled by `enableInitializationCheck` and `checkDelay`.

`useInitHandlers({ debug: true })` enables handler-initialization diagnostics and reports unmatched effect result keys. With the default `debug: false`, normal rendering, reducer updates, submission, and effect execution do not emit process logs. Invalid configuration, missing components, and initialization-contract problems still use `warn` or `error`.

### Effect Config

Fields and groups can declare `dependents` and `effect`. Config processing creates an `effectMap` and passes it to `form-chain-effect-engine`.

In 3.2, effect graph nodes still reference stable `id` values, not Ant Design `NamePath` values. Field Address can make values nested, but it does not introduce container nodes, nested groups, or a cross-level effect graph; those structural capabilities are left for the 4.0 unified node tree.

### Default Result Keys

Default handlers are defined in `packages/dynamic-form/src/config/defaultConfig.ts`. Supported keys include `value`, `visible`, `disabled`, `readonly`, `groupsVisible`, `formItemProps`, `componentProps`, `formProps`, `buttonProps`, `cardProps`, `rowProps`, `colProps`, and `submitAreaProps`.

Unknown keys are not applied and are only reported through warning logs.

### Meta Boundaries

Behavior meta belongs to Runtime and should be stored under `meta.behavior`. Render-only meta belongs to the render layer under `formItemProps` or `componentProps`. Legacy flat keys such as `visible`, `disabled`, and `readonly` remain compatible, but new code should prefer `meta.behavior`.

### Custom Handlers

Custom handlers implement `CustomEffectResultHandler`. Handlers receive semantic APIs such as `setFieldValue`, `updateFieldMeta`, `updateFieldMetaById`, `setGroupVisible`, and `updateDynamicUIConfig`.

Use those APIs instead of maintaining duplicate value, error, touched, or validating state.

### Value Updates

The reducer does not store values, errors, warnings, touched state, or validating state. The `value` handler updates Ant Design Form directly. Submit validation is runtime-filtered, then values are read with `form.getFieldsValue(true)`.

### Initial Value Results

Function-style `initialValue` can return effect result objects. The same handler routing is used during initialization, so initial values can also configure field meta or UI props.
