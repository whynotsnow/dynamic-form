# Demo 后续 Agent 说明

最近审阅：2026-06-30

## 作用范围

本文适用于根目录 `demos/`。

`demos/` 维护 Vite demo app 和 Docusaurus docs-site 共同复用的 demo 业务逻辑。demo 行为应保留在这里，不要复制到 `apps/docs-site/`。

## 当前 Demo 覆盖

`demos/DemoSelector.tsx` 当前暴露：

- `storeBoundary`
- `customHandlers`
- `customComponents`
- `formValidation`
- `uiConfig`
- `renderExtension`
- `compilerFoundation`

不要依赖陈旧文档中的旧 demo 名称，除非文件真实存在。

## 文案和文档

- 项目文档默认只写中文。
- demo registry 的 title、description 和 `demos/README.md` 默认使用中文。
- 可以保留 API name、component name、file path、demo key 等英文关键词。
- 如果 demo-facing 文案被 docs-site 的英文 i18n 页面展示，应同步维护对应英文翻译。
- 新增、重命名或删除 demo 时，同步更新 registry、demo README 和站点引用。

## 实现边界

- demos 可以展示 public package APIs 和 extension hooks。
- 不要为了 demo 重写核心 rendering、Runtime、reducer、compiler、adapter、rule 或 effect pipelines。
- 不要把 demo 业务逻辑复制到 docs-site。docs-site 可以为展示目的包装 demo 组件。

## 验证

demo 变更优先验证：

1. `npm run type-check`
2. `npm run lint:check`
3. `npm run start` 后检查 `http://localhost:3000`
4. 如果 docs-site 引用或展示了相关 demo，再运行 `npm run site:build`
