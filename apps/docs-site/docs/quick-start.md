# 快速开始

本页用于把第一个 DynamicForm 跑起来。先完成安装、最小配置和提交处理；需要更多字段、联动或扩展时，再进入对应专题文档。

### 安装

```bash
pnpm add @whynotsnow/dynamic-form antd react react-dom
```

如果在本仓库内调试文档站或 demos，依赖已经由 workspace 管理，可以直接运行：

```bash
pnpm run start
```

本地 demo server 默认运行在 `http://localhost:3000`。

### 渲染第一个表单

```tsx
import { Form } from 'antd';
import { DynamicForm, useInitHandlers } from '@whynotsnow/dynamic-form';
import type { FormConfig } from '@whynotsnow/dynamic-form';

const formConfig: FormConfig = {
  fields: [
    {
      id: 'name',
      label: '姓名',
      component: 'TextInput',
      rules: [{ required: true, message: '请输入姓名' }]
    },
    {
      id: 'email',
      label: '邮箱',
      component: 'TextInput',
      componentProps: { placeholder: 'name@example.com' },
      rules: [{ type: 'email', message: '邮箱格式不正确' }]
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

这里已经包含三个最常用的入口：

- `FormConfig`：描述字段、组件、初始值、校验和 UI 配置。
- `useInitHandlers`：初始化默认 effect handlers。
- `DynamicForm`：接收 Ant Design `form` 实例和 `formConfig`，并负责渲染与提交。

### 增加分组

字段较多时，可以用 `groups` 表达业务区块。默认渲染会把每个 group 放进 Ant Design `Card`。

```ts
const formConfig: FormConfig = {
  groups: [
    {
      id: 'profile',
      title: '基础信息',
      fields: [
        { id: 'name', label: '姓名', component: 'TextInput' },
        { id: 'phone', label: '手机号', component: 'TextInput' }
      ]
    }
  ]
};
```

字段和 group 的详细配置见 [配置指南](./configuration.md)。

### 加一个简单联动

通过 `dependents` 声明依赖字段，通过 `effect` 返回字段状态或 UI 更新。

```ts
const formConfig: FormConfig = {
  fields: [
    {
      id: 'hasCompany',
      label: '是否有公司',
      component: 'Switch',
      dependents: ['companyName'],
      componentProps: { checkedChildren: '是', unCheckedChildren: '否' }
    },
    {
      id: 'companyName',
      label: '公司名称',
      component: 'TextInput',
      initialVisible: false,
      effect: (_changedValue, allValues) => ({
        visible: allValues.hasCompany === true
      })
    }
  ]
};
```

默认 handlers 支持 `value`、`visible`、`disabled`、`readonly`、`componentProps`、`formItemProps` 等返回 key。更完整的说明见 [Effect 与处理器](./effects-and-handlers.md)。

### 下一步

- 继续配置字段、分组、内置组件和 UI 外壳：阅读 [配置指南](./configuration.md)。
- 查找按场景组织的配置示例：阅读 [组件使用指南](./development.md) 或打开 [配置示例](/examples/)。
- 直接观察交互行为：打开 [demo演示](/playground/)。
- 接入自定义组件、render hooks 或业务 handler：阅读 [渲染与 UI 扩展](./rendering-and-ui.md) 和 [Effect 与处理器](./effects-and-handlers.md)。
- 需要领域模块、JsonSchema、OpenAPI 或 metadata 输入时，再进入 [Compiler Foundation](./compiler-foundation.md)、[Adapter Foundation](./adapter-foundation.md) 和 [Schema Adapters](./schema-adapters.md)。
