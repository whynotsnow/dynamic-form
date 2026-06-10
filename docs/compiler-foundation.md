# Compiler Foundation

## 中文文档

DynamicForm 3.0 在现有 `FormConfig` 管线之前新增字段模块和配置编译层。

```text
Field Modules
  -> compileFormConfig
  -> FormConfig
  -> processFormConfig
  -> DynamicForm
```

这是增量能力。现有 `FormConfig` 用法不需要迁移。

### Field Modules

字段模块用于封装可复用的业务字段能力：

```ts
import type { FieldModule } from '@whynotsnow/dynamic-form';

export const UserSelectorModule: FieldModule = {
  type: 'UserSelector',
  defaultProps: {
    allowClear: true,
    showSearch: true
  },
  dependencies: ['departmentId'],
  createConfig: (options) => ({
    id: 'userId',
    label: options?.label ?? 'User',
    component: 'Select',
    componentProps: {
      options: options?.options ?? []
    }
  })
};
```

模块描述业务字段；渲染组件仍由现有组件注册体系解析。

### Registry

使用 `ModuleRegistryManager` 创建隔离注册器，或使用 `defaultModuleRegistry` 做共享注册。

```ts
import { ModuleRegistryManager } from '@whynotsnow/dynamic-form';

const registry = new ModuleRegistryManager();

registry.register(UserSelectorModule);
registry.has('UserSelector');
registry.get('UserSelector');
registry.list();
registry.unregister('UserSelector');
```

重复模块类型默认会被拒绝。只有明确传入 `{ override: true }` 时才允许覆盖。

### Compiler

把模块配置编译成标准 `FormConfig`：

```tsx
import { Form } from 'antd';
import { DynamicForm, compileFormConfig } from '@whynotsnow/dynamic-form';

const compiled = compileFormConfig(
  [
    {
      type: 'UserSelector',
      id: 'ownerId',
      options: { label: 'Owner' },
      overrides: {
        required: true
      }
    }
  ],
  { registry }
);

export function Example() {
  const [form] = Form.useForm();

  return (
    <DynamicForm
      form={form}
      formConfig={compiled.formConfig}
      componentRegistry={{ customComponents: compiled.componentRegistry }}
    />
  );
}
```

编译器返回：

```ts
{
  formConfig: FormConfig;
  componentRegistry: ComponentRegistry;
}
```

`formConfig` 可以继续传给 `processFormConfig()` 或 `DynamicForm`。

### Hooks

编译器支持编译期扩展点：

```ts
compileFormConfig(moduleConfigs, {
  registry,
  hooks: {
    beforeCompile(context) {},
    beforeModuleExpand(context) {},
    afterModuleExpand(context) {},
    afterCompile(context) {}
  }
});
```

hooks 只操作编译上下文，不应该修改 Ant Design Form 实例或 React 运行时状态。

### Boundaries

- `compileFormConfig()` 负责生成 `FormConfig`。
- `processFormConfig()` 继续负责准备运行时数据。
- `DynamicForm` props 不变。
- Ant Design Form 仍然是 values 和 validation state 的唯一真实来源。

---

## English Documentation

DynamicForm 3.0 adds a field module and compiler layer before the existing `FormConfig` pipeline.

```text
Field Modules
  -> compileFormConfig
  -> FormConfig
  -> processFormConfig
  -> DynamicForm
```

This is additive. Existing `FormConfig` usage does not need to change.

### Field Modules

A field module packages reusable business-field behavior:

```ts
import type { FieldModule } from '@whynotsnow/dynamic-form';

export const UserSelectorModule: FieldModule = {
  type: 'UserSelector',
  defaultProps: {
    allowClear: true,
    showSearch: true
  },
  dependencies: ['departmentId'],
  createConfig: (options) => ({
    id: 'userId',
    label: options?.label ?? 'User',
    component: 'Select',
    componentProps: {
      options: options?.options ?? []
    }
  })
};
```

Modules describe domain fields. Render components are still resolved by the existing component registry.

### Registry

Use `ModuleRegistryManager` for isolated registries or `defaultModuleRegistry` for shared registration.

```ts
import { ModuleRegistryManager } from '@whynotsnow/dynamic-form';

const registry = new ModuleRegistryManager();

registry.register(UserSelectorModule);
registry.has('UserSelector');
registry.get('UserSelector');
registry.list();
registry.unregister('UserSelector');
```

Duplicate module types are rejected by default. Pass `{ override: true }` when replacement is intentional.

### Compiler

Compile module config into standard `FormConfig`:

```tsx
import { Form } from 'antd';
import { DynamicForm, compileFormConfig } from '@whynotsnow/dynamic-form';

const compiled = compileFormConfig(
  [
    {
      type: 'UserSelector',
      id: 'ownerId',
      options: { label: 'Owner' },
      overrides: {
        required: true
      }
    }
  ],
  { registry }
);

export function Example() {
  const [form] = Form.useForm();

  return (
    <DynamicForm
      form={form}
      formConfig={compiled.formConfig}
      componentRegistry={{ customComponents: compiled.componentRegistry }}
    />
  );
}
```

The compiler returns:

```ts
{
  formConfig: FormConfig;
  componentRegistry: ComponentRegistry;
}
```

`formConfig` can be passed to `processFormConfig()` or `DynamicForm`.

### Hooks

Compiler hooks allow compile-time extension:

```ts
compileFormConfig(moduleConfigs, {
  registry,
  hooks: {
    beforeCompile(context) {},
    beforeModuleExpand(context) {},
    afterModuleExpand(context) {},
    afterCompile(context) {}
  }
});
```

Hooks operate on compiler context only. They should not mutate Ant Design Form instances or React runtime state.

### Boundaries

- `compileFormConfig()` creates `FormConfig`.
- `processFormConfig()` keeps preparing runtime data.
- `DynamicForm` props are unchanged.
- Ant Design Form remains the source of truth for values and validation state.
