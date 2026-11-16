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

## 文件结构

```text
demos/
├── App.tsx
├── DemoSelector.tsx
├── demoRegistry.tsx
├── demoSources.json
├── storeBoundaryDemo.tsx
├── customHandlers.ts
├── customHandlersDemo.tsx
├── customComponents/
├── customComponentsDemo.tsx
├── formValidationDemo.tsx
├── compilerFoundationDemo.tsx
├── nodeModel4Demo.tsx
├── nodeModel4DemoConfig.ts
├── renderExtensionDemo.tsx
├── uiConfigDemo.tsx
├── useDemoInitHandlers.ts
├── index.ts
└── README.md
```

## 维护规则

- 新增 demo 时，优先添加到 `demoRegistry.tsx`；`DemoSelector` 会从该注册表渲染演示。
- docs-site 的 Demo 源码展示由 `demoSources.json` 手动维护。`sourceFiles` 包含 demo 主入口和业务逻辑源码，用文件 tabs 切换；`githubDemoPath` 和 `relatedComponents` 提供当前 demo 与其自定义子组件的 GitHub 源码链接，不作为源码 tab。
- `demoSources.json` 是展示用静态快照，不会在构建时自动读取组件文件；修改 demo 后应主动同步源码快照和 GitHub 路径信息，避免展示的代码与运行效果不一致。
- demo 级 effect handler 初始化统一使用 `useDemoInitHandlers`，保持默认配置一致。
- 页面级 demo 文件名应与主要职责一致，并使用 `*Demo.tsx` 后缀。
- 本 README 需要与 `DemoSelector` 实际暴露的文件和 key 保持同步。

### 3.0 Compiler Demo

`compilerFoundation` / `compilerFoundationDemo.tsx` 演示结构化 adapter/compiler 管线：

- 定义 `FieldModule`；
- 使用 `ModuleRegistryManager` 注册模块；
- 将 JsonSchema 转换为 mixed `ModuleFormConfig`；
- 使用 `groupOverrides` 注入 Schema 无法序列化的 group effect；
- 将编译得到的 `FormConfig` 交给现有 `DynamicForm` runtime 渲染。
