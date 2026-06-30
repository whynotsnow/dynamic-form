# Component Usage Guide

This guide is for DynamicForm users. It explains how common configuration options are used together and links to the relevant demos. Examples here are intentionally small; complete scenarios live in the demo files.

### Demo Entry

Run local demos:

```bash
pnpm run start
```

The demo selector is [`demos/DemoSelector.tsx`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/DemoSelector.tsx), and the demo registry is [`demos/demoRegistry.tsx`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/demoRegistry.tsx).

| Scenario                                   | Demo                                                                                                                                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Form value sync and effect update boundary | [`demos/storeBoundaryDemo.tsx`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/storeBoundaryDemo.tsx)                                                                                                              |
| Custom effect result handlers              | [`demos/customHandlersDemo.tsx`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/customHandlersDemo.tsx), [`demos/customHandlers.ts`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/customHandlers.ts) |
| Custom component registry                  | [`demos/customComponentsDemo.tsx`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/customComponentsDemo.tsx)                                                                                                        |
| Ant Design Form validation integration     | [`demos/formValidationDemo.tsx`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/formValidationDemo.tsx)                                                                                                            |
| Static and dynamic UI config               | [`demos/uiConfigDemo.tsx`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/uiConfigDemo.tsx)                                                                                                                        |
| Render hook extensions                     | [`demos/renderExtensionDemo.tsx`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/renderExtensionDemo.tsx)                                                                                                          |

### Minimal Usage

Use `useInitHandlers` before rendering forms that rely on handlers, then render `DynamicForm` with an Ant Design `form` instance and `formConfig`.

### Flat and Grouped Config

Use flat config for small forms and grouped config for business sections. Grouped forms render each group with an Ant Design `Card` by default.

Detailed config options are documented in [`configuration.md`](./configuration.md).

### UI Config

Use `uiConfig` when the default Ant Design structure is correct and only props need to change. See [`demos/uiConfigDemo.tsx`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/uiConfigDemo.tsx).

### Field Effects

Fields use `dependents` to declare dependencies and `effect` to return updates. Default handlers support keys such as `value`, `visible`, `disabled`, `readonly`, `componentProps`, and `formItemProps`.

For deeper details, see [`effects-and-handlers.md`](./effects-and-handlers.md) and [`runtime-layer.md`](./runtime-layer.md).

### Custom Components

Use `componentRegistry` when field input UI is business-specific. Custom components receive `field`, `value`, `onChange`, and `form`. See [`demos/customComponentsDemo.tsx`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/customComponentsDemo.tsx).

### Custom Effect Handlers

Register custom handlers when effect result keys represent business semantics. Handlers should use the semantic APIs from context and should not maintain duplicate form values. See [`demos/customHandlersDemo.tsx`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/customHandlersDemo.tsx) and [`demos/customHandlers.ts`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/customHandlers.ts).

### Render Extensions

Use render hooks when the default `Form -> Row -> Col` or `Card -> Row -> Col` structure is not enough. See [`demos/renderExtensionDemo.tsx`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/renderExtensionDemo.tsx) and [`rendering-and-ui.md`](./rendering-and-ui.md).

### Validation

Use Ant Design Form `rules` for normal fields. Runtime decides whether hidden, group-hidden, or disabled fields participate in validation. See [`demos/formValidationDemo.tsx`](https://github.com/whynotsnow/dynamic-form/blob/main/demos/formValidationDemo.tsx).

### Usage Guidance

- Use `uiConfig` for Ant Design prop changes.
- Use `componentRegistry` for business-specific field interactions.
- Use custom handlers for business-semantic effect result keys.
- Use render hooks for layout or structural changes.
- Follow Runtime Layer for rendering, submission, and validation policy.
