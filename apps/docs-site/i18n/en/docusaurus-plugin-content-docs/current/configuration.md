# Configuration Guide

DynamicForm is driven by `FormConfig`. Version 4.0 supports three entry points: `fields`, `groups`, and the unified node tree `nodes`. Configuration describes fields, containers, components, initial values, validation, dependencies, and UI behavior.

## Flat Config

```ts
import type { FormConfig } from '@whynotsnow/dynamic-form';

const formConfig: FormConfig = {
  fields: [
    {
      id: 'username',
      label: 'Username',
      component: 'TextInput',
      rules: [{ required: true, message: 'Username is required' }]
    }
  ]
};
```

## Grouped Config

```ts
const formConfig: FormConfig = {
  groups: [
    {
      id: 'profile',
      title: 'Profile',
      initialVisible: true,
      fields: [{ id: 'name', label: 'Name', component: 'TextInput' }]
    }
  ]
};
```

## Mixed Config

`FormConfig` may contain top-level `fields`, `groups`, and `nodes` at the same time. The default renderer renders normalized root nodes in order: `nodes` first, then `fields`, then `groups` converted into containers.

```ts
const formConfig: FormConfig = {
  fields: [{ id: 'accountType', component: 'Select' }],
  groups: [
    {
      id: 'companyInfo',
      title: 'Company Information',
      fields: [{ id: 'companyName', component: 'TextInput' }]
    }
  ]
};
```

Field IDs and group IDs must be globally unique. Groups affect UI and behavior scope. A field may declare an independent Ant Design `NamePath` through `name`; see [Field Address](./field-address.md).

## Node Tree

Use `nodes` when you need nested sections, recursive layout, or repeated items. A node tree is composed of `FieldNode` and `ContainerNode`:

```ts
const formConfig: FormConfig = {
  nodes: [
    {
      nodeType: 'container',
      id: 'shipping',
      title: 'Shipping',
      name: 'shipping',
      children: [
        {
          nodeType: 'field',
          id: 'shippingCity',
          label: 'City',
          component: 'TextInput'
        },
        {
          nodeType: 'container',
          id: 'shippingContact',
          title: 'Contact',
          name: 'contact',
          children: [
            {
              nodeType: 'field',
              id: 'shippingContactName',
              label: 'Name',
              component: 'TextInput'
            }
          ]
        }
      ]
    }
  ]
};
```

This writes values as `{ shipping: { shippingCity, contact: { shippingContactName } } }`. Field `id` remains the stable identity used by effects, Runtime, and meta updates; container `name` only affects the Ant Design value path.

For repeated items, set `repeatable: true` on a container. Repeatable containers must declare `name`. Repeatable containers use Ant Design `Form.List`. The current default renderer reads existing list items; add, remove, and reorder controls should be supplied by business UI, render hooks, or a custom container wrapper.

## Field Config

Common options include `id`, optional `name`, `component`, `label`, `rules`, `required`, `span`, `style`, `initialValue`, `initialVisible`, `initialDisabled`, `preserveValueOnHide`, `restoreValueOnShow`, `dependents`, `effect`, `formItemProps`, `componentProps`, and `designer`. `id` remains the stable runtime/effect identity, while `name` is the Ant Design value path.

`required` is a field declaration. The default Ant Design renderer merges `required: true` into real `Form.Item.rules` and shows the required marker. If `rules` already declares a required rule, the explicit rule wins and no duplicate rule is generated.

`initialValue` may be static or a function. Function initial values can return a raw value or an effect result object, which is routed through the same handler system used by runtime effects.

## Group Config

`groups` is the pre-4.0 single-level grouping entry point and remains compatible. Config processing converts each group into a top-level container.

Groups support `id`, `title`, `fields`, `initialVisible`, `dependents`, `effect`, and `designer`. Group visibility affects child field rendering and submit participation.

## Container Config

Containers support `nodeType: 'container'`, globally unique `id`, optional `title`, optional Ant Design `NamePath` prefix `name`, recursive `children`, `initialVisible`, `dependents`, `effect`, `repeatable`, and `designer`. Repeatable containers must declare `name` and render through Ant Design `Form.List`.

Container visibility recursively affects rendering, submission, and validation participation for all descendant fields and containers.

## Designer Metadata

Starting in 4.1.2, fields, legacy groups, and containers may carry `designer` metadata. It is intended only for visual builders, such as designer title, description, category, icon, order, locked state, designer-only visibility, or custom metadata.

```ts
const formConfig: FormConfig = {
  fields: [
    {
      id: 'customerName',
      label: 'Customer Name',
      component: 'TextInput',
      designer: {
        title: 'Customer Name',
        category: 'Basic Info',
        icon: 'text',
        order: 10,
        locked: false,
        metadata: { source: 'designer' }
      }
    }
  ]
};
```

`designer` is preserved with the config but ignored by Runtime, effects, submission, validation, field participation cleanup, and the default renderer. If a visual builder needs to hide or lock canvas nodes, it should consume this metadata in the builder layer.

## Config Diagnostics

4.1.2 adds `getFormConfigDiagnostics(config, options?)` and `validateFormConfig(config, options?)`. They are intended for visual-builder save checks, imported config checks, and tests. They do not replace `processFormConfig()`, which keeps its existing runtime error behavior.

```ts
import { validateFormConfig } from '@whynotsnow/dynamic-form';

const result = validateFormConfig(formConfig, {
  knownComponents: ['TextInput', 'Select']
});

if (!result.valid) {
  console.log(result.diagnostics);
}
```

Diagnostics cover duplicate field/container/group ids, duplicate name paths, repeatable containers without `name`, empty children, unknown components, invalid group field structures, and unknown dependents. Structural problems are returned as `error`; unknown components or dependents are returned as `warning` by default.

## UI Config

`uiConfig` customizes the default Ant Design shell, including `formProps`, `buttonProps`, `cardProps`, `rowProps`, `colProps`, `submitAreaProps`, and `formItemProps`.

## Built-In Components

Built-in components include `Password`, `ConfirmPassword`, `TextInput`, `NumberInput`, `SelectField`, `DatePicker`, `Switch`, `Rate`, `TextDisplay`, `CheckboxGroup`, `Select`, and `TextArea`.

## Initial Values From `values`

The optional `values` prop is intended for edit/detail scenarios. It is merged during store initialization and synchronized into the Ant Design Form instance. Ant Design Form remains the runtime source of truth afterward.
