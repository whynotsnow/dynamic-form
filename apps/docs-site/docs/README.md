---
slug: /
---

# DynamicForm 使用文档

这里的内容面向使用 DynamicForm 开发应用的开发者。第一次接入可以先完成[快速开始](./quick-start.md)，然后按需要查找字段配置、联动、校验或自定义展示方式。大多数项目直接使用 `@whynotsnow/dynamic-form` 即可。

## 先选择安装包

| 你的需求 | 建议使用 |
| --- | --- |
| 在 React 应用中显示表单 | `@whynotsnow/dynamic-form`。它提供表单组件，默认使用 Ant Design。 |
| 在不显示 React 表单的地方检查或转换配置 | `@whynotsnow/dynamic-form-core`。例如设计器保存前校验配置，或服务端把 schema 转成表单配置。 |

如果你已经在使用 `@whynotsnow/dynamic-form`，不需要为了使用 core 而改写现有 import。请先看[快速开始](./quick-start.md)，需要在表单显示前处理配置时再读 [Core Package](./core-package.md)。

## 推荐路径

1. 🚀 [快速开始](./quick-start.md)：安装、显示第一个表单并处理提交结果。
2. ⚙️ [配置指南](./configuration.md)：设置字段、分组、嵌套区块、初始值和校验。
3. 🔗 [Effect 与处理器](./effects-and-handlers.md)：根据用户输入显示、隐藏或更新其他字段。
4. 🎨 [渲染与 UI 扩展](./rendering-and-ui.md)：自定义字段控件、表单布局或接入其他 UI 外壳。
5. 🧭 [组件使用指南](./development.md)：通过常见场景和可交互 demo 学习配置方式。
6. 🧩 [Core Package](./core-package.md)：在表单显示前检查或转换配置。
7. 🧠 [深入说明](./ARCHITECTURE.md)：了解嵌套值、Runtime 和不同扩展点的工作方式。
8. 🛠️ [维护指南](./maintenance.md)：仅在参与 DynamicForm 仓库开发时阅读。

## 文档范围

文档描述当前 `src` 中已经实现的行为，不描述尚未实现的规划型 API。源码行为变化时，应先更新最接近的专题文档，再同步根目录 `README.md` 中的摘要或链接。

## 选择配置方式

- 简单表单先用 `fields`；字段较多、需要分区时用 `groups`。
- 需要嵌套提交数据或重复区块时用 `nodes`。旧配置可以继续使用，不必为了升级改写。
- 字段的 `id` 用来标识字段；`name` 用来决定提交数据中的位置。省略 `name` 时会继续使用 `id`。
- 需要 JsonSchema、OpenAPI 或自有 metadata 输入时，再使用 Adapter / Compiler 专题中的高级配置方式。

具体 API 名称和完整导出列表见站点[导出 API 页](/api/)，使用示例见[组件使用指南](./development.md)。
