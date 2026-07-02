# Monorepo 架构

当前仓库采用 pnpm workspaces 组织，根目录只负责统一调度，不再作为 npm 发布包。

## 目录边界

```text
packages/dynamic-form-core/ @whynotsnow/dynamic-form-core 发布包
  src/                      配置、compiler、adapters、rules 和纯 runtime 源码
  docs/                     core package 文档，随包维护和发布
  tsup.config.ts            core 构建配置
packages/dynamic-form/      @whynotsnow/dynamic-form 发布包
  src/                      React consumer、Provider、hooks、renderers、component registry、effect handlers 和兼容导出
  docs/                     库文档，随包维护和发布
  tsup.config.ts            库构建配置
apps/docs-site/          Docusaurus 文档站
  docs/                  站点默认语言文档
  i18n/en/               英文站点文档
demos/                   Vite demo 与可复用 demo 组件
tests/                   仓库级 Node 测试
docs/                    monorepo 级文档
scripts/                 发布和维护脚本
```

## Workspace 职责

- 根 `package.json`：声明 `packages/*` 和 `apps/*` workspaces，提供统一的 build、type-check、test、site build 和 release 命令。
- `packages/dynamic-form-core/package.json`：保留 core npm 包名、`exports`、`main`、`module`、`types` 和发布文件清单。
- `packages/dynamic-form/package.json`：保留 React/AntD npm 包名、`exports`、`main`、`module`、`types`、peer dependencies、对 core 的精确版本依赖和发布文件清单。
- `apps/docs-site/package.json`：只负责 Docusaurus 站点构建与本地预览。

## 文档职责

- 库行为文档在 `packages/dynamic-form/docs/` 中维护，包括架构、配置、effects、Runtime、compiler、adapter、schema、rule、core package 和开发指南。
- 站点文档在 `apps/docs-site/` 中维护，可以为站点体验拆分语言和页面结构。
- 根 `docs/` 只记录 monorepo 结构、维护规则、发布流程和站点规划。

## Demo 职责

`demos/` 是 demo 业务逻辑和 `demoRegistry` 的唯一来源。Vite demo 和 docs-site 的 demos 页面都应复用这里的组件，不应把 demo 业务逻辑复制到站点目录。
