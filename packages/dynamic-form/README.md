# DynamicForm

`@whynotsnow/dynamic-form` 是一个基于 React 和 TypeScript 的配置驱动动态表单引擎，默认提供 Ant Design renderer。它用配置描述表单结构，用 `form-chain-effect-engine` 执行字段联动，并通过 Runtime Layer 统一处理字段是否渲染、是否提交、是否可编辑、是否校验等运行时策略。4.1 开始提供 Form Adapter 和 Renderer Adapter 扩展基础，可作为可视化表单设计器或低代码系统的运行时内核。

### 项目能力

- 🚀 通过 `formConfig` 配置化渲染表单，默认使用 Ant Design renderer。
- 🗂️ 支持平铺表单、分组表单和 4.0 统一节点树 `nodes`。
- 🧱 支持递归 container、container `name` 前缀和 repeatable container。
- 🔗 支持字段、分组和 container 级 `dependents` + `effect` 联动。
- 🧩 支持静态初始值和函数式初始值。
- 🛠️ 内置 effect 结果处理器，可处理字段值、字段行为、分组可见性、字段渲染 props 和全局 UI 配置。
- 🎨 支持通过 `componentRegistry` 注册自定义字段组件。
- 🧱 支持通过 Field Module、Compiler 和 Adapter 管线复用领域字段配置。
- 📐 支持声明式同步 Rule Engine，并将规则编译为标准 effects。
- 🔄 支持 JsonSchema、OpenAPI 和 metadata 输入适配。
- 🧩 `CompiledDynamicForm` 可直接渲染 compiler/adapter 产物并自动接入模块组件。
- 🪝 支持从字段项到整个表单体的分层 render hooks。
- 🔌 4.1 支持 `formAdapter` 和 `renderer` 扩展入口，旧的 AntD `form` 用法保持兼容。
- 🧠 使用 Runtime Layer 统一解析 `rendered`、`submitable`、`editable`、`readonly`、`disabled`、`validatable` 等能力。
- 🧱 Ant Design Form 仍然是真实表单值和校验运行时状态的唯一来源。
- 🧭 支持通过 `name: NamePath` 分离稳定字段 `id` 与嵌套值路径，旧配置默认继续使用 `id`。

### 安装

```bash
pnpm add @whynotsnow/dynamic-form antd react react-dom
```

Peer dependencies（对等依赖）：

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

主要导出定义在 `packages/dynamic-form/src/exports.ts`：

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
- `assertFormAdapter`
- `createAntdFormAdapter`
- `createMemoryFormAdapter`
- `assertRendererAdapter`
- `antdRenderer`
- `headlessRenderer`
- `DynamicFormProps`、`FormConfig`、compiler、adapter、rule、render hook 和组件注册相关公共类型。

### Rule Engine

DynamicForm 包含声明式 Rule Engine，用于模块化表单的同步联动规则。规则会被编译成标准 effects，因此渲染层和 runtime provider 不需要变化。

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

当前规则支持同步联动动作：`show`、`hide`、`enable`、`disable`、`readonly`、`editable`、`setValue` 和 `clearValue`。Group/container rules 仅支持 `show` 和 `hide`。

Rule 是字段所属的 per-field 规则，不支持 `target` 配置。一个源字段影响多个字段时，应在每个被影响字段上分别声明 rule；compiler 会从 `when` 条件推导相同的 `dependents`，再由 `form-chain-effect-engine` 触发这些字段各自的 effect。

`DynamicForm` props 分为两类：

- 引擎层 props：`formConfig`、`form`、可选 `formAdapter`、`values`、`uiConfig`、`enableInitializationCheck`、`checkDelay`。
- UI 层 props：可选 `renderer`、`onSubmit`、`submitButtonText`、`componentRegistry`、`renderFormInner`、`renderGroups`、`renderGroupItem`、`renderFields`、`renderFieldItem`。

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
- 🧭 [Field Address](./docs/field-address.md)
- 🧭 [组件使用指南](./docs/development.md)
- 🛠️ [维护指南](./docs/maintenance.md)

### 设计理念

- 配置优先：业务表单通过字段、分组、依赖和 UI 配置描述。
- 值归 Ant Design Form：reducer 不维护重复的 values、errors、touched 或 validating 状态。
- Runtime 是策略边界：渲染、提交、编辑和校验能力从同一份状态快照统一解析。
- 扩展优先于分叉：通过自定义组件、effect 结果处理器和 render hooks 覆盖业务差异。
- 默认渲染保持简单：默认使用 `antdRenderer`，其他组件库可通过 Renderer Adapter 接入；4.1 不内置第二套组件库 renderer。

### 4.1 Adapter 边界

4.1 保持单包发布和旧 API 兼容。未传 `formAdapter` 或 `renderer` 时，`DynamicForm` 会把旧的 AntD `form` 实例转换为 `createAntdFormAdapter(form)`，并使用默认 `antdRenderer`。

- Form Adapter 负责值读写、批量赋值和校验：`getFieldValue`、`getFieldsValue`、`setFieldValue`、`setFieldsValue`、`validateFields`。
- Renderer Adapter 负责默认 UI 外壳：form、字段项、字段布局、分组容器、repeatable container 和提交按钮。
- Adapter / Compiler / Rule / Runtime 仍保持 UI-library agnostic；AntD 相关实现集中在默认 form adapter 和 renderer 中。
- `assertFormAdapter` 和 `assertRendererAdapter` 会提前校验自定义 adapter 的必需方法。
- `createMemoryFormAdapter` 提供无 UI 组件库依赖的内存 values runtime，适合测试、自定义 renderer 示例和可视化预览态。
- `headlessRenderer` 提供基于原生元素的最小 reference renderer，不定位为生产级 UI。
- 4.1 不承诺内置 Arco、Semi 或其他组件库适配器；业务侧可以基于新增接口自定义 renderer。

### 4.0 配置管线

当前版本在现有运行时主流程之前提供可选的 Adapter、Rule 和 Compiler 管线。JsonSchema、OpenAPI 和 metadata 输入会先归一化为结构化 `ModuleFormConfig`，再编译成标准 `FormConfig`。字段可以通过 `groupId` 加入 legacy group，也可以通过 `nodes` 声明递归 `FieldNode` / `ContainerNode` 树；Schema 无法携带的函数 effect 可通过 `groupOverrides` 在编译前注入。

`FormConfig.nodes` 是 4.0 的结构性入口。`ContainerNode.name` 会成为后代字段 Ant Design `NamePath` 前缀；`repeatable: true` 的 container 通过 Ant Design `Form.List` 渲染已有重复项。旧的 `fields`、`groups` 和 mixed 配置继续兼容。

### 项目结构

```text
packages/dynamic-form/   npm 发布包、源码和构建配置
  src/                   库源码
  docs/                  库文档
  dist/                  构建产物
apps/docs-site/          Docusaurus 文档站
demos/                   Vite demos 和可复用 demo 组件
tests/                   Node test 文件和 demo 测试数据
docs/                    monorepo 级文档
```

### 开发命令

```bash
pnpm run start       # 启动 Vite demos
pnpm run type-check  # TypeScript 检查
pnpm run lint:check  # ESLint 检查，不自动修复
pnpm run test        # Node test runner
pnpm run build       # 构建库产物
```

当前仓库存在 `pnpm-lock.yaml`，默认使用 pnpm。

### 当前说明

项目当前面向基于 Ant Design 的 React 应用。内置字段组件包括 `TextInput`、`Password`、`NumberInput`、`Select`、`SelectField`、`DatePicker`、`Switch`、`Rate`、`TextDisplay`、`CheckboxGroup` 和 `TextArea`。

### Schema Adapters

DynamicForm 提供 `JsonSchemaAdapter`、`OpenApiAdapter` 和 `MetadataAdapter`。

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
