# Configuration Guide

DynamicForm is driven by `FormConfig`. Configuration describes fields, groups, components, initial values, validation, dependencies, and UI behavior.

### Flat Config

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

### Grouped Config

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

### Mixed Config

`FormConfig` may contain both top-level `fields` and `groups`. The default renderer shows ungrouped fields first, followed by groups in declaration order:

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

### Field Config

Common options include `id`, optional `name`, `component`, `label`, `rules`, `required`, `span`, `style`, `initialValue`, `initialVisible`, `initialDisabled`, `preserveValueOnHide`, `restoreValueOnShow`, `dependents`, `effect`, `formItemProps`, and `componentProps`. `id` remains the stable runtime/effect identity, while `name` is the Ant Design value path.

`required` is a field declaration. The default Ant Design renderer merges `required: true` into real `Form.Item.rules` and shows the required marker. If `rules` already declares a required rule, the explicit rule wins and no duplicate rule is generated.

`initialValue` may be static or a function. Function initial values can return a raw value or an effect result object, which is routed through the same handler system used by runtime effects.

### Group Config

Groups support `id`, `title`, `fields`, `initialVisible`, `dependents`, and `effect`. Group visibility affects child field rendering and submit participation.

### UI Config

`uiConfig` customizes the default Ant Design shell, including `formProps`, `buttonProps`, `cardProps`, `rowProps`, `colProps`, `submitAreaProps`, and `formItemProps`.

### Built-In Components

Built-in components include `Password`, `ConfirmPassword`, `TextInput`, `NumberInput`, `SelectField`, `DatePicker`, `Switch`, `Rate`, `TextDisplay`, `CheckboxGroup`, `Select`, and `TextArea`.

### Initial Values From `values`

The optional `values` prop is intended for edit/detail scenarios. It is merged during store initialization and synchronized into the Ant Design Form instance. Ant Design Form remains the runtime source of truth afterward.
