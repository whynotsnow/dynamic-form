# DynamicForm

## 中文文档

`@whynotsnow/dynamic-form` 是一个基于 React、TypeScript 和 Ant Design 的动态表单库。它用配置描述表单结构，用 `form-chain-effect-engine` 执行字段联动，并通过 Runtime Layer 统一处理字段是否渲染、是否提交、是否可编辑、是否校验等运行时策略。

### 项目能力

- 🚀 通过 `formConfig` 配置化渲染 Ant Design 表单。
- 🗂️ 支持平铺表单和分组表单。
- 🔗 支持字段和分组级 `dependents` + `effect` 联动。
- 🧩 支持静态初始值和函数式初始值。
- 🛠️ 内置 effect 结果处理器，可处理字段值、字段行为、分组可见性、字段渲染 props 和全局 UI 配置。
- 🎨 支持通过 `componentRegistry` 注册自定义字段组件。
- 🧱 支持通过 Field Module、Compiler 和 Adapter 管线复用领域字段配置。
- 📐 支持声明式同步 Rule Engine，并将规则编译为标准 effects。
- 🔄 支持 JsonSchema、OpenAPI 和 metadata 输入适配。
- 🧩 `CompiledDynamicForm` 可直接渲染 compiler/adapter 产物并自动接入模块组件。
- 🪝 支持从字段项到整个表单体的分层 render hooks。
- 🧠 使用 Runtime Layer 统一解析 `rendered`、`submitable`、`editable`、`readonly`、`disabled`、`validatable` 等能力。
- 🧱 Ant Design Form 仍然是真实表单值和校验运行时状态的唯一来源。

### 安装

```bash
npm install @whynotsnow/dynamic-form antd react react-dom
```

Peer dependencies:

- `react >= 17`
- `react-dom >= 17`
- `antd >= 5`

### 基础用法

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
      rules: [{ required: true, message: 'Please enter a name' }]
    },
    {
      id: 'employeeCount',
      label: 'Employee Count',
      component: 'NumberInput',
      dependents: ['companySize'],
      effect: (value) => ({
        value,
        componentProps: { min: 0 }
      })
    },
    {
      id: 'companySize',
      label: 'Company Size',
      component: 'Select',
      componentProps: {
        options: [
          { label: 'Small', value: 'small' },
          { label: 'Large', value: 'large' }
        ]
      }
    }
  ]
};

export function Example() {
  const [form] = Form.useForm();
  const { isInitialized, error } = useInitHandlers({});

  if (!isInitialized) return null;
  if (error) return <div>{error.message}</div>;

  return (
    <DynamicForm
      form={form}
      formConfig={formConfig}
      submitButtonText="Submit"
      onSubmit={(values) => console.log(values)}
    />
  );
}
```

### 核心 API

主要导出定义在 `src/exports.ts`：

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
- `RuleEngine`
- `createRuleEngine`
- `compileRulesToEffect`
- `evaluateRule`
- `DynamicFormProps`、`FormConfig`、compiler、adapter、rule、render hook 和组件注册相关公共类型。

### Rule Engine

DynamicForm 3.0 包含声明式 Rule Engine，用于模块化表单的同步联动规则。规则会被编译成标准 effects，因此渲染层和 runtime provider 不需要变化。

```tsx
import { compileFormConfig, ModuleRegistryManager } from '@whynotsnow/dynamic-form';

const registry = new ModuleRegistryManager();

registry.register({
  type: 'CompanyName',
  createConfig: () => ({
    id: 'companyName',
    label: 'Company Name',
    component: 'TextInput'
  })
});

const compiled = compileFormConfig(
  {
    fields: [
      {
        type: 'CompanyName',
        id: 'companyName',
        rules: [
          {
            when: { field: 'customerType', equals: 'company' },
            then: { action: 'show' }
          },
          {
            when: { field: 'customerType', notEquals: 'company' },
            then: { action: 'hide' }
          }
        ]
      }
    ]
  },
  { registry }
);
```

当前规则支持同步联动动作：`show`、`hide`、`enable`、`disable`、`readonly`、`editable`、`setValue` 和 `clearValue`。Group rules 仅支持 `show` 和 `hide`。

Rule 是字段所属的 per-field 规则，不支持 `target` 配置。一个源字段影响多个字段时，应在每个被影响字段上分别声明 rule；compiler 会从 `when` 条件推导相同的 `dependents`，再由 `form-chain-effect-engine` 触发这些字段各自的 effect。

`DynamicForm` props 分为两类：

- 引擎层 props：`formConfig`、`form`、可选 `values`、`uiConfig`、`enableInitializationCheck`、`checkDelay`。
- UI 层 props：可选 `onSubmit`、`submitButtonText`、`componentRegistry`、`renderFormInner`、`renderGroups`、`renderGroupItem`、`renderFields`、`renderFieldItem`。

### 文档入口

- 📚 [文档索引](./docs/README.md)
- 🏗️ [架构说明](./docs/ARCHITECTURE.md)
- ⚙️ [配置指南](./docs/configuration.md)
- 🧩 [Compiler Foundation](./docs/compiler-foundation.md)
- 📐 [Rule Engine](./docs/rule-engine.md)
- 🔄 [Adapter Foundation](./docs/adapter-foundation.md)
- 🧾 [Schema Adapters](./docs/schema-adapters.md)
- 🔗 [Effect 与处理器](./docs/effects-and-handlers.md)
- 🎨 [渲染与 UI 扩展](./docs/rendering-and-ui.md)
- 🧠 [Runtime Layer](./docs/runtime-layer.md)
- 🧭 [组件使用指南](./docs/development.md)
- 🛠️ [维护指南](./docs/maintenance.md)

### 设计理念

- 配置优先：业务表单通过字段、分组、依赖和 UI 配置描述。
- 值归 Ant Design Form：reducer 不维护重复的 values、errors、touched 或 validating 状态。
- Runtime 是策略边界：渲染、提交、编辑和校验能力从同一份状态快照统一解析。
- 扩展优先于分叉：通过自定义组件、effect 结果处理器和 render hooks 覆盖业务差异。
- 默认渲染保持简单：默认使用 Ant Design `Form`、`Row`、`Col`、`Card` 和 `Button`。

### 3.0 可选配置管线

3.0 在现有运行时主流程之前提供可选的 Adapter、Rule 和 Compiler 管线。JsonSchema、OpenAPI 和 metadata 输入会先归一化为结构化 `ModuleFormConfig`，再编译成标准 `FormConfig`。字段通过 `groupId` 加入 group，支持未分组字段与分组字段共存；Schema 无法携带的函数 effect 可通过 `groupOverrides` 在编译前注入。

### 项目结构

```text
src/
  adapters/    外部输入与 schema 适配
  compiler/    ModuleFormConfig 编译
  config/      默认配置和配置处理
  consumer/    provider、渲染、hooks、effects、组件注册表
  modules/     字段模块协议和注册器
  rules/       声明式规则求值和 effect 编译
  runtime/     运行时能力解析和 runtime selectors
  shared/      公共类型、上下文和工具函数
  state/       reducer 和 store 初始化
demos/         Vite demos
tests/         Node test 文件和 demo 测试数据
docs/          当前文档系统
dist/          构建产物
```

### 开发命令

```bash
npm run start       # 启动 Vite demos
npm run type-check  # TypeScript 检查
npm run lint:check  # ESLint 检查，不自动修复
npm run test        # Node test runner
npm run build       # 构建库产物
```

当前仓库存在 `package-lock.json`，默认使用 npm。

### 当前说明

项目当前面向基于 Ant Design 的 React 应用。内置字段组件包括 `TextInput`、`Password`、`NumberInput`、`Select`、`SelectField`、`DatePicker`、`Switch`、`Rate`、`TextDisplay`、`CheckboxGroup` 和 `TextArea`。

### Schema Adapters

DynamicForm 3.0 提供 `JsonSchemaAdapter`、`OpenApiAdapter` 和 `MetadataAdapter`。

```tsx
import { adaptModuleConfigs } from '@whynotsnow/dynamic-form';

const moduleFormConfig = adaptModuleConfigs(
  {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        metadata: { module: 'TextInputModule' }
      }
    }
  },
  { adapterType: 'json-schema' }
);
```

Schema adapters 要求字段显式声明 module metadata，不会根据 schema primitive type 自动猜测 UI。输出为 `{ fields, groups? }`；顶层 `x-dynamic-form.groups` 与属性级 `groupId` 控制分组，函数 effect 通过 `groupOverrides` 合并。Schema `required` 映射为字段 `required` 语义，最终 AntD 校验规则由默认 renderer 统一合并。

---

## English Documentation

`@whynotsnow/dynamic-form` is a React + TypeScript dynamic form library built on Ant Design. It renders forms from configuration, delegates dependency chains to `form-chain-effect-engine`, and uses a Runtime Layer to keep rendering, submission, editing, and validation policies consistent.

### What It Provides

- 🚀 Configuration-driven Ant Design forms through `formConfig`.
- 🗂️ Flat and grouped form configuration.
- 🔗 Field and group dependency effects through `dependents` and `effect`.
- 🧩 Static and function-based initial values.
- 🛠️ Built-in effect result handlers for values, field behavior, group visibility, field render props, and global UI config.
- 🎨 Custom field components through `componentRegistry`.
- 🧱 Reusable domain field config through Field Modules, Compiler, and Adapter pipelines.
- 📐 Declarative synchronous rules compiled into standard effects.
- 🔄 JsonSchema, OpenAPI, and metadata input adapters.
- 🧩 `CompiledDynamicForm` renders compiler/adapter output with module components wired automatically.
- 🪝 Layered render hooks from field item to full form body.
- 🧠 Runtime capability resolution for `rendered`, `submitable`, `editable`, `readonly`, `disabled`, and `validatable`.
- 🧱 Ant Design Form remains the source of truth for form values and validation runtime state.

### Installation

```bash
npm install @whynotsnow/dynamic-form antd react react-dom
```

Peer dependencies:

- `react >= 17`
- `react-dom >= 17`
- `antd >= 5`

### Basic Usage

See the Chinese section above for the full code example. The same API is used in both languages.

### Core API

Primary exports are defined in `src/exports.ts`:

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
- `RuleEngine`
- `createRuleEngine`
- `compileRulesToEffect`
- `evaluateRule`
- Public types for `DynamicFormProps`, `FormConfig`, compiler, adapters, rules, render hooks, and component registration.

### Rule Engine

DynamicForm 3.0 includes a declarative Rule Engine for module-based form linkage. Rules are compiled into standard effects, so the renderer and runtime provider stay unchanged.

```tsx
import { compileFormConfig, ModuleRegistryManager } from '@whynotsnow/dynamic-form';

const registry = new ModuleRegistryManager();

registry.register({
  type: 'CompanyName',
  createConfig: () => ({
    id: 'companyName',
    label: 'Company Name',
    component: 'TextInput'
  })
});

const compiled = compileFormConfig(
  {
    fields: [
      {
        type: 'CompanyName',
        id: 'companyName',
        rules: [
          {
            when: { field: 'customerType', equals: 'company' },
            then: { action: 'show' }
          },
          {
            when: { field: 'customerType', notEquals: 'company' },
            then: { action: 'hide' }
          }
        ]
      }
    ]
  },
  { registry }
);
```

Current field rules support `show`, `hide`, `enable`, `disable`, `readonly`, `editable`, `setValue`, and `clearValue`. Group rules support only `show` and `hide`.

Rules are field-owned per-field rules and do not support `target` configuration. When one source field affects multiple fields, declare a rule on each affected field; the compiler infers the same `dependents` from `when`, and `form-chain-effect-engine` triggers each field's own effect.

### Adapter Foundation

Adapter Foundation normalizes external or module-like input into structured `ModuleFormConfig` before handing it to `compileFormConfig()`.

```tsx
import { compileAdaptedFormConfig } from '@whynotsnow/dynamic-form';

const compiled = compileAdaptedFormConfig({
  fields: [{ type: 'UserSelector', id: 'ownerId', options: { label: 'Owner' } }]
});
```

The adapter layer only converts input. Rule merging, dependency inference, component registration, runtime, and rendering behavior remain owned by the compiler/runtime pipeline.

### Schema Adapters

DynamicForm 3.0 provides `JsonSchemaAdapter`, `OpenApiAdapter`, and `MetadataAdapter` on top of Adapter Foundation.

```tsx
import { adaptModuleConfigs } from '@whynotsnow/dynamic-form';

const moduleFormConfig = adaptModuleConfigs(
  {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        metadata: { module: 'TextInputModule' }
      }
    }
  },
  { adapterType: 'json-schema' }
);
```

Schema adapters require explicit module metadata and do not infer UI from schema primitive types. Output is `{ fields, groups? }`; top-level `x-dynamic-form.groups` and property-level `groupId` control grouping, while function effects are merged through `groupOverrides`. Schema `required` maps to field-level `required` semantics, and the default renderer merges final AntD validation rules.

`DynamicForm` props combine:

- Engine props: `formConfig`, `form`, optional `values`, `uiConfig`, `enableInitializationCheck`, `checkDelay`.
- UI props: optional `onSubmit`, `submitButtonText`, `componentRegistry`, `renderFormInner`, `renderGroups`, `renderGroupItem`, `renderFields`, `renderFieldItem`.

### Documentation

- 📚 [Documentation Index](./docs/README.md)
- 🏗️ [Architecture](./docs/ARCHITECTURE.md)
- ⚙️ [Configuration Guide](./docs/configuration.md)
- 🧩 [Compiler Foundation](./docs/compiler-foundation.md)
- 📐 [Rule Engine](./docs/rule-engine.md)
- 🔄 [Adapter Foundation](./docs/adapter-foundation.md)
- 🧾 [Schema Adapters](./docs/schema-adapters.md)
- 🔗 [Effects and Handlers](./docs/effects-and-handlers.md)
- 🎨 [Rendering and UI Extensions](./docs/rendering-and-ui.md)
- 🧠 [Runtime Layer](./docs/runtime-layer.md)
- 🧭 [Component Usage Guide](./docs/development.md)
- 🛠️ [Maintenance Guide](./docs/maintenance.md)

### Design Principles

- Keep business forms declarative.
- Keep values in Ant Design Form instead of duplicating them in the reducer.
- Make Runtime the policy boundary for rendering, submission, editing, and validation.
- Prefer extension points over forks.
- Keep default rendering simple with Ant Design `Form`, `Row`, `Col`, `Card`, and `Button`.

### Optional 3.0 Configuration Pipeline

Before the existing runtime pipeline, 3.0 provides optional Adapter, Rule, and Compiler stages.
JsonSchema, OpenAPI, and metadata input is normalized into structured `ModuleFormConfig` and then
compiled into standard `FormConfig`. Fields join groups through `groupId`, mixed grouped and
ungrouped fields are supported, and function effects that cannot live in schema data are injected
through `groupOverrides` before compilation.

### Development

```bash
npm run start
npm run type-check
npm run lint:check
npm run test
npm run build
```
