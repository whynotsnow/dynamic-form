# Quick Start

Use this page to get your first DynamicForm running. Start with installation, minimal config, and submit handling; then move to the topic docs when you need more fields, effects, or extension points.

## Install

```bash
pnpm add @whynotsnow/dynamic-form antd react react-dom
```

When working inside this repository, dependencies are managed by the workspace and you can run:

```bash
pnpm run start
```

The local demo server runs at `http://localhost:3000` by default.

## Render Your First Form

```tsx
import { Form } from 'antd';
import { DynamicForm, useInitHandlers } from '@whynotsnow/dynamic-form';
import type { FormConfig } from '@whynotsnow/dynamic-form';

const formConfig: FormConfig = {
  fields: [
    {
      id: 'name',
      label: 'Name',
      component: 'TextInput',
      rules: [{ required: true, message: 'Name is required' }]
    },
    {
      id: 'email',
      label: 'Email',
      component: 'TextInput',
      componentProps: { placeholder: 'name@example.com' },
      rules: [{ type: 'email', message: 'Invalid email address' }]
    }
  ]
};

export function BasicForm() {
  const [form] = Form.useForm();
  const { isInitialized } = useInitHandlers({});

  if (!isInitialized) return null;

  return (
    <DynamicForm
      form={form}
      formConfig={formConfig}
      onSubmit={(values) => {
        console.log(values);
      }}
    />
  );
}
```

This introduces the three common entry points:

- `FormConfig`: describes fields, components, initial values, validation, and UI config.
- `useInitHandlers`: initializes the default effect handlers.
- `DynamicForm`: receives the Ant Design `form` instance and `formConfig`, then handles rendering and submit.

## Add Groups

Use `groups` when a form has clear business sections. The default renderer wraps each group in an Ant Design `Card`.

```ts
const formConfig: FormConfig = {
  groups: [
    {
      id: 'profile',
      title: 'Profile',
      fields: [
        { id: 'name', label: 'Name', component: 'TextInput' },
        { id: 'phone', label: 'Phone', component: 'TextInput' }
      ]
    }
  ]
};
```

See the [Configuration Guide](./configuration.md) for all field and group options.

## Use the 4.0 Node Tree

Use `nodes` when you need nested sections, nested submitted values, or repeated items. A container in `nodes` renders as the default `Card`, and its `name` prefixes descendant Ant Design value paths:

```ts
const formConfig: FormConfig = {
  nodes: [
    {
      nodeType: 'container',
      id: 'profile',
      title: 'Profile',
      name: 'profile',
      children: [
        {
          nodeType: 'field',
          id: 'profileName',
          label: 'Name',
          component: 'TextInput'
        }
      ]
    }
  ]
};
```

The submitted value shape is `{ profile: { profileName: string } }`. The `profileName` id is still used by Runtime, the effect graph, and meta updates.

## Add a Simple Effect

Use `dependents` to declare dependent fields and `effect` to return field state or UI updates.

```ts
const formConfig: FormConfig = {
  fields: [
    {
      id: 'hasCompany',
      label: 'Has company',
      component: 'Switch',
      dependents: ['companyName'],
      componentProps: { checkedChildren: 'Yes', unCheckedChildren: 'No' }
    },
    {
      id: 'companyName',
      label: 'Company name',
      component: 'TextInput',
      initialVisible: false,
      effect: (_changedValue, allValues) => ({
        visible: allValues.hasCompany === true
      })
    }
  ]
};
```

Default handlers support result keys such as `value`, `visible`, `disabled`, `readonly`, `componentProps`, and `formItemProps`. See [Effects and Handlers](./effects-and-handlers.md) for details.

## Next Steps

- Configure fields, groups, built-in components, and the UI shell: read the [Configuration Guide](./configuration.md).
- Find scenario-based config examples: read the [Component Usage Guide](./development.md) or open [Config Examples](/examples/).
- Inspect interactive behavior directly: open the [Demo Showcase](/demos/).
- Add custom components, render hooks, or business handlers: read [Rendering and UI Extensions](./rendering-and-ui.md) and [Effects and Handlers](./effects-and-handlers.md).
- For domain modules, recursive containers, JsonSchema, OpenAPI, or metadata inputs, move on to [Compiler Foundation](./compiler-foundation.md), [Adapter Foundation](./adapter-foundation.md), and [Schema Adapters](./schema-adapters.md).
