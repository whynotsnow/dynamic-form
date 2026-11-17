# DynamicForm 演示

`demos/` 目录包含 DynamicForm 的 Vite 人工验证页面。演示入口是 `DemoSelector`，可用演示统一注册在 `demoRegistry.tsx` 中。

## 演示列表

| Key                  | 文件                         | 职责                                                                                                        |
| -------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `storeBoundary`      | `storeBoundaryDemo.tsx`      | 验证字段值由 Ant Design Form 管理，字段 meta 和动态 UI 状态由 DynamicForm Store 管理。                      |
| `customHandlers`     | `customHandlersDemo.tsx`     | 演示自定义 `EffectResultHandler` 的行为，包括 value 转换、字段 meta 更新、条件显示和链式处理器。            |
| `customComponents`   | `customComponentsDemo.tsx`   | 演示自定义组件注册，以及只读/自定义渲染模式。                                                               |
| `formValidation`     | `formValidationDemo.tsx`     | 演示标准字段校验，以及项目交付平台、技术栈、成员和任务等复杂自定义组件的 `Form.Item` 校验。                |
| `uiConfig`           | `uiConfigDemo.tsx`           | 演示静态 `uiConfig` 与 effect 返回的动态 UI 配置。                                                          |
| `renderExtension`    | `renderExtensionDemo.tsx`    | 演示 `renderFieldItem`、`renderFields`、`renderGroupItem`、`renderGroups`、`renderFormInner` 等渲染扩展点。 |
| `compilerFoundation` | `compilerFoundationDemo.tsx` | 演示字段模块如何编译为标准 `FormConfig` 后再交给 `DynamicForm` 渲染。                                       |
| `nodeModel4`         | `nodeModel4Demo.tsx`         | 演示 4.0 `nodes`、普通 container、嵌套 container、repeatable container、级联字段联动和跨层级 effect graph。 |
| `headlessRenderer`   | `headlessRendererDemo.tsx`   | 演示 Memory Adapter、Headless Renderer、嵌套字段路径和隐藏字段。                                           |

## 入口用法

```tsx
import { DemoSelector } from './demos';

const App = () => {
  return <DemoSelector defaultDemo="storeBoundary" />;
};
```

也可以直接导入单个演示组件：

```tsx
import { CustomHandlersDemo } from './demos';

const App = () => {
  return <CustomHandlersDemo />;
};
```

## docs-site 文案语言

- docs-site 编译时会将启用的 Demo 展示文案匹配到 `demoI18n/` 下的分组文案表，并注入 `useDemoT` 翻译调用；Vite 人工验证页面不经过这段转换。
- 只为用户可见的标签、提示、按钮、选项和说明添加映射。字段 ID、提交 key、代码枚举值保持原样；明确列入样例数据映射的预填内容会按 locale 显示并参与对应语言的提交示例。
- `demoI18n/shared.json` 维护跨 Demo 共用文案，`demoI18n/demos/` 按 Demo 维护页面文案，`demoI18n/data/` 维护会显示在表单中的样例数据。动态联动文案仍应加入对应 Demo 的文案表。
- 转换配置位于 `apps/docs-site/docusaurus.config.ts`；AST loader 入口位于 `apps/docs-site/loaders/demoI18n.cjs`，AST 工具和各类转换器位于同名子目录。源码展示按 Demo 清单引用独立的逐文件快照，并提供中英文版本，不会显示编译器注入的 import 或翻译调用。
- 英文站会将 catalog 明确列出的预填样例值转换为英文，因此 Demo 表单当前展示值和提交示例数据会随站点 locale 一致；选项展示 label 和中文存储值会配套转换，代码枚举值保持稳定。

## 文件结构

```text
demos/
├── App.tsx
├── DemoLoading.tsx
├── DemoSelector.tsx
├── demoRegistry.tsx
├── demoSources/
│   ├── index.json
│   ├── index.ts
│   ├── raw-source.d.ts
│   └── files/
│       ├── zh-CN/
│       └── en/
├── storeBoundaryDemo.tsx
├── customHandlers.ts
├── customHandlersDemo.tsx
├── customComponents/
├── customComponentsDemo.tsx
├── formValidationDemo.tsx
├── headlessRendererDemo.tsx
├── compilerFoundationDemo.tsx
├── nodeModel4Demo.tsx
├── nodeModel4DemoConfig.ts
├── renderExtensionDemo.tsx
├── uiConfigDemo.tsx
├── useDemoInitHandlers.ts
├── useDemoSubmitResult.tsx
├── index.ts
└── README.md
```

## 维护规则

- 新增 demo 时，优先添加到 `demoRegistry.tsx`；`DemoSelector` 会从该注册表渲染演示。
- docs-site 的 Demo 源码展示由 `demoSources/index.json` 维护 Demo 文件清单和 GitHub 链接；源码快照以可直接编辑的纯文本保存在 `demoSources/files/<locale>/<文件名>.tsx.txt`，`index.ts` 将对应语言文件装配到 Demo 清单中。相同共享文件可以被多个 Demo 引用。JSON 只保存索引和展示元数据，不存转义后的代码正文。
- 源码快照是展示用静态副本，不会在站点构建时自动读取组件文件；修改 Demo 后应同步更新对应文件快照的两种语言，并检查对应 Demo 清单。
- demo 级 effect handler 初始化统一使用 `useDemoInitHandlers`，保持默认配置一致。
- 页面级 demo 文件名应与主要职责一致，并使用 `*Demo.tsx` 后缀。
- 本 README 需要与 `DemoSelector` 实际暴露的文件和 key 保持同步。

### 3.0 Compiler Demo

`compilerFoundation` / `compilerFoundationDemo.tsx` 演示结构化 adapter/compiler 管线：

- 定义 `FieldModule`；
- 使用 `ModuleRegistryManager` 注册模块；
- 使用 Metadata Adapter 将申请字段配置归一化为带分组的 `ModuleFormConfig`；
- 使用 `groupOverrides` 注入外部 metadata 无法序列化的 group effect；
- 将编译得到的 `FormConfig` 交给现有 `DynamicForm` runtime 渲染。
