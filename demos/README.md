# DynamicForm 演示

`demos/` 目录包含 DynamicForm 的 Vite 人工验证页面。演示入口是 `DemoSelector`，可用演示统一注册在 `demoRegistry.tsx` 中。

## 演示列表

| Key | 文件 | 职责 |
| --- | --- | --- |
| `storeBoundary` | `storeBoundaryDemo.tsx` | 验证字段值由 Ant Design Form 管理，字段 meta 和动态 UI 状态由 DynamicForm Store 管理。 |
| `customHandlers` | `customHandlersDemo.tsx` | 演示自定义 `EffectResultHandler` 的行为，包括 value 转换、字段 meta 更新、条件显示和链式处理器。 |
| `customComponents` | `customComponentsDemo.tsx` | 演示自定义组件注册，以及只读/自定义渲染模式。 |
| `formValidation` | `formValidationDemo.tsx` | 演示标准字段和复杂自定义组件如何接入 Ant Design `Form.Item` 校验。 |
| `uiConfig` | `uiConfigDemo.tsx` | 演示静态 `uiConfig` 与 effect 返回的动态 UI 配置。 |
| `renderExtension` | `renderExtensionDemo.tsx` | 演示 `renderFieldItem`、`renderFields`、`renderGroupItem`、`renderGroups`、`renderFormInner` 等渲染扩展点。 |

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
├── storeBoundaryDemo.tsx
├── customHandlers.ts
├── customHandlersDemo.tsx
├── customComponents/
├── customComponentsDemo.tsx
├── formValidationDemo.tsx
├── renderExtensionDemo.tsx
├── uiConfigDemo.tsx
├── useDemoInitHandlers.ts
├── index.ts
└── README.md
```

## 维护规则

- 新增 demo 时，优先添加到 `demoRegistry.tsx`；`DemoSelector` 会从该注册表渲染演示。
- demo 级 effect handler 初始化统一使用 `useDemoInitHandlers`，保持默认配置一致。
- 页面级 demo 文件名应与主要职责一致，并使用 `*Demo.tsx` 后缀。
- 本 README 需要与 `DemoSelector` 实际暴露的文件和 key 保持同步。

---

# DynamicForm Demos

`demos/` contains the Vite manual verification pages for DynamicForm. The demo entry is `DemoSelector`, and the available demos are registered in `demoRegistry.tsx`.

## Demo List

| Key | File | Purpose |
| --- | --- | --- |
| `storeBoundary` | `storeBoundaryDemo.tsx` | Verifies that field values are owned by Ant Design Form while field meta and dynamic UI state are owned by DynamicForm Store. |
| `customHandlers` | `customHandlersDemo.tsx` | Demonstrates custom `EffectResultHandler` behavior, including value transforms, field meta updates, conditional display, and chained handlers. |
| `customComponents` | `customComponentsDemo.tsx` | Demonstrates custom component registration and read-only/custom render modes. |
| `formValidation` | `formValidationDemo.tsx` | Demonstrates Ant Design `Form.Item` validation integration for standard fields and complex custom components. |
| `uiConfig` | `uiConfigDemo.tsx` | Demonstrates static `uiConfig` and dynamic UI configuration returned from effects. |
| `renderExtension` | `renderExtensionDemo.tsx` | Demonstrates render extension points such as `renderFieldItem`, `renderFields`, `renderGroupItem`, `renderGroups`, and `renderFormInner`. |

## Entry Points

```tsx
import { DemoSelector } from './demos';

const App = () => {
  return <DemoSelector defaultDemo="storeBoundary" />;
};
```

You can also import an individual demo:

```tsx
import { CustomHandlersDemo } from './demos';

const App = () => {
  return <CustomHandlersDemo />;
};
```

## Structure

```text
demos/
├── App.tsx
├── DemoSelector.tsx
├── demoRegistry.tsx
├── storeBoundaryDemo.tsx
├── customHandlers.ts
├── customHandlersDemo.tsx
├── customComponents/
├── customComponentsDemo.tsx
├── formValidationDemo.tsx
├── renderExtensionDemo.tsx
├── uiConfigDemo.tsx
├── useDemoInitHandlers.ts
├── index.ts
└── README.md
```

## Maintenance Notes

- Add new demos to `demoRegistry.tsx`; `DemoSelector` renders from that registry.
- Use `useDemoInitHandlers` for demo-level effect handler initialization so defaults stay consistent.
- Keep demo file names aligned with their primary responsibility and use the `*Demo.tsx` suffix for page-level demos.
- Keep this README in sync with the actual files exposed by `DemoSelector`.
