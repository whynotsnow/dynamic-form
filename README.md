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
- `DynamicFormProvider`
- `FormChainEffectEngineWrapper`
- `useInitHandlers`
- `useStoreInit`
- `useFormChainContext`
- `ComponentRegistryManager`
- `DefaultRegistryFieldComponents`
- `getDefaultConfig`
- `RuleEngine`
- `createRuleEngine`
- `compileRulesToEffect`
- `evaluateRule`
- `DynamicFormProps`、`FormConfig`、`BaseFieldConfig`、`UIConfig`、render hook 参数、组件注册类型等公共类型。

### Rule Engine

DynamicForm 3.1 新增声明式 Rule Engine，用于模块化表单的同步联动规则。规则会被编译成标准 effects，因此渲染层和 runtime provider 不需要变化。

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
  [
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
  ],
  { registry }
);
```

3.1 首版规则支持同步联动动作：`show`、`hide`、`enable`、`disable`、`readonly`、`editable`、`setValue` 和 `clearValue`。

`DynamicForm` props 分为两类：

- 引擎层 props：`formConfig`、`form`、可选 `values`、`uiConfig`、`enableInitializationCheck`、`checkDelay`。
- UI 层 props：可选 `onSubmit`、`submitButtonText`、`componentRegistry`、`renderFormInner`、`renderGroups`、`renderGroupItem`、`renderFields`、`renderFieldItem`。

### 文档入口

- 📚 [文档索引](./docs/README.md)
- 🏗️ [架构说明](./docs/ARCHITECTURE.md)
- ⚙️ [配置指南](./docs/configuration.md)
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

### 当前升级方向

当前 3.1 升级方向是在字段模块模型之上引入 Rule Engine。可复用业务字段可以把 component、默认配置、依赖声明、effect 逻辑和声明式规则打包在一起，再由配置编译层在现有 `processFormConfig()` 之前展开为当前 `FormConfig` 结构。Ant Design Form 仍然负责 values 和校验运行时状态；DynamicForm 继续负责字段 meta、分组 meta、动态 UI 配置和依赖元数据。

### 项目结构

```text
src/
  config/      默认配置和配置处理
  consumer/    provider、渲染、hooks、effects、组件注册表
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
- `DynamicFormProvider`
- `FormChainEffectEngineWrapper`
- `useInitHandlers`
- `useStoreInit`
- `useFormChainContext`
- `ComponentRegistryManager`
- `DefaultRegistryFieldComponents`
- `getDefaultConfig`
- `RuleEngine`
- `createRuleEngine`
- `compileRulesToEffect`
- `evaluateRule`
- Public types such as `DynamicFormProps`, `FormConfig`, `BaseFieldConfig`, `UIConfig`, render hook params, and component registry types.

### Rule Engine

DynamicForm 3.1 adds a declarative Rule Engine for module-based form linkage. Rules are compiled into standard effects, so the renderer and runtime provider stay unchanged.

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
  [
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
  ],
  { registry }
);
```

The first 3.1 rule set supports synchronous linkage actions: `show`, `hide`, `enable`, `disable`, `readonly`, `editable`, `setValue`, and `clearValue`.

### Adapter Foundation

DynamicForm 3.2 adds Adapter Foundation to normalize external or module-like input into `ModuleConfig[]` before handing it to the existing `compileFormConfig()`.

```tsx
import { compileAdaptedFormConfig } from '@whynotsnow/dynamic-form';

const compiled = compileAdaptedFormConfig([
  { type: 'UserSelector', id: 'ownerId', options: { label: 'Owner' } }
]);
```

The adapter layer only converts input. Rule merging, dependency inference, component registration, runtime, and rendering behavior remain owned by the existing compiler/runtime pipeline. 3.2 does not include concrete JsonSchema, OpenAPI, or Metadata adapters; those belong to 3.3.

`DynamicForm` props combine:

- Engine props: `formConfig`, `form`, optional `values`, `uiConfig`, `enableInitializationCheck`, `checkDelay`.
- UI props: optional `onSubmit`, `submitButtonText`, `componentRegistry`, `renderFormInner`, `renderGroups`, `renderGroupItem`, `renderFields`, `renderFieldItem`.

### Documentation

- 📚 [Documentation Index](./docs/README.md)
- 🏗️ [Architecture](./docs/ARCHITECTURE.md)
- ⚙️ [Configuration Guide](./docs/configuration.md)
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

### Current Direction

The current 3.2 direction adds Adapter Foundation before the Rule Engine and compiler foundation.
External input is normalized into `ModuleConfig[]`, while the config compiler continues to inject
module capabilities into `FormConfig` before the existing processor runs.
Ant Design Form remains the owner of values and validation runtime state; DynamicForm continues to
own field meta, group meta, dynamic UI config, and dependency metadata.

### Development

```bash
npm run start
npm run type-check
npm run lint:check
npm run test
npm run build
```
