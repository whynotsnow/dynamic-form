# Core Package: Process Config Before Rendering

`@whynotsnow/dynamic-form-core` lets you work with form config before displaying a form. Use it to validate a config, convert a schema into DynamicForm config, or determine which fields will render and participate in submission.

If your application displays forms, continue using `@whynotsnow/dynamic-form`. It provides the React form component and the default Ant Design presentation, along with most config capabilities described here. You do not need to install core or change existing imports for a regular form.

## When to Install Core Separately

| What you want to do | How core helps |
| --- | --- |
| Check config before saving it in a visual builder | Run `validateFormConfig` or read detailed diagnostics. |
| Convert config on a server or during a build | Use a Schema Adapter and Compiler to create standard `FormConfig`. |
| Evaluate rules or field state without displaying a form | Use the Rule Engine and Runtime query APIs. |
| See which fields render, submit, or validate | Read the corresponding field sets for previews, debugging, or tests. |

Install it with:

```bash
pnpm add @whynotsnow/dynamic-form-core
```

## What Core Provides

| Capability | Common APIs | Use |
| --- | --- | --- |
| Config checks | `validateFormConfig`, `getFormConfigDiagnostics` | Check config before saving and find the cause of a problem. |
| Config processing | `processFormConfig` | Prepare field and dependency information needed by DynamicForm. |
| Field-module compilation | `compileFormConfig`, `ModuleRegistryManager` | Turn reusable domain field modules into standard form config. |
| External data conversion | `adaptModuleConfigs`, `compileAdaptedFormConfig`, schema adapters | Convert JsonSchema, OpenAPI, or metadata into form config. |
| Field rules | `RuleEngine`, `compileRulesToEffect` | Define synchronous visibility, disabled, or value updates between fields. |
| Field-state queries | `resolveRuntimeState`, `getRenderedFieldIds`, and others | Query render, submit, and validation participation. |

## Use dynamic-form to Display a Form

Core does not provide React form components, a Provider, an Ant Design renderer, field components, or default effect handlers. `@whynotsnow/dynamic-form` remains responsible for rendering and interactive forms.

If you already import config APIs from the main package, your existing code can stay as it is:

```ts
import { FormConfig, compileFormConfig } from '@whynotsnow/dynamic-form';
```

In a visual builder, server, or build script that only needs config processing, import directly from core:

```ts
import { FormConfig, validateFormConfig } from '@whynotsnow/dynamic-form-core';
```

## Do You Need to Migrate?

No migration is required. Core is an optional entry point: install and use it when you need to process config outside a rendered form. A regular React form can continue to depend only on `@whynotsnow/dynamic-form`.
