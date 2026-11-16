---
slug: /
---

# DynamicForm User Guide

This guide is for developers using DynamicForm in an application. Start with [Quick Start](./quick-start.md), then find the guidance you need for fields, effects, validation, or custom UI. Most applications can use `@whynotsnow/dynamic-form` directly.

## Choose a Package

| Your goal | Recommended package |
| --- | --- |
| Render forms in a React application | `@whynotsnow/dynamic-form`. It provides the form component and uses Ant Design by default. |
| Check or transform form config without rendering a React form | `@whynotsnow/dynamic-form-core`. For example, validate config before saving it in a visual builder or convert a schema on a server. |

If you already use `@whynotsnow/dynamic-form`, you do not need to rewrite existing imports to use core. Start with [Quick Start](./quick-start.md); read [Core Package](./core-package.md) only when you need to process config before showing a form.

## Recommended Path

1. 🚀 [Quick Start](./quick-start.md): install the package, render your first form, and handle submitted values.
2. ⚙️ [Configuration Guide](./configuration.md): set up fields, groups, nested sections, initial values, and validation.
3. 🔗 [Effects and Handlers](./effects-and-handlers.md): show, hide, or update other fields in response to user input.
4. 🎨 [Rendering and UI Extensions](./rendering-and-ui.md): customize field controls and form layout, or connect another UI shell.
5. 🧭 [Component Usage Guide](./development.md): learn common configurations through examples and interactive demos.
6. 🧩 [Core Package](./core-package.md): check or transform config before rendering a form.
7. 🧠 [Deep Dive](./ARCHITECTURE.md): understand nested values, Runtime, and extension points.
8. 🧾 [CHANGELOG](./changelog.md): review release summaries and related topics.
9. 🛠️ [Maintenance Guide](./maintenance.md): read this only when working on the DynamicForm repository.

## Documentation Scope

These guides describe the released package behavior. When an implementation changes, update the closest topic first, then update the package README or links when needed.

## Choose a Configuration Style

- Start with `fields` for a straightforward form, and use `groups` to divide a larger form into sections.
- Use `nodes` for nested submitted data or repeated sections. Existing configs do not need to be rewritten to use it.
- A field's `id` identifies the field; `name` sets where its value appears in submitted data. If omitted, `name` continues to default to `id`.
- Use the Adapter and Compiler guides when your input comes from JsonSchema, OpenAPI, or your own metadata format.

For exact exported names, use the [API reference](/api/). For working examples, see the [Component Usage Guide](./development.md).
