# 后续 Agent 项目说明

最近审阅：2026-06-30

## 作用范围

本文适用于仓库根目录和 monorepo 级工作。更具体的规则放在各 workspace 附近：

- `packages/dynamic-form/AGENTS.md`：库源码、package 文档、构建和发布边界。
- `apps/docs-site/AGENTS.md`：Docusaurus 文档站。
- `demos/AGENTS.md`：可复用 demo 组件和 demo-facing 文案。

处理子目录文件时，应同时遵守最近的 `AGENTS.md` 与本文规则。

## 仓库概览

本仓库是 `@whynotsnow/dynamic-form` 的 private pnpm workspace root。

- `packages/dynamic-form/`：唯一 npm 发布包。
- `apps/docs-site/`：Docusaurus 文档站。
- `demos/`：repo-level Vite demos，以及 docs-site 复用的 demo 组件。
- `tests/`：Node test runner 文件和共享 demo 测试数据。
- `docs/`：monorepo 级架构、维护、发布和站点规划文档。

根目录不能作为 npm 发布包处理。

## 工具规则

- 默认使用 pnpm；仓库包含 `pnpm-lock.yaml`。
- 不要在未说明原因的情况下安装依赖或全局工具。
- 不要提前添加当前仓库状态下不可运行的 npm scripts。
- 搜索优先使用 `rg` / `rg --files`。
- 手工编辑文件时使用 `apply_patch`。

## 常用命令

- `pnpm run start`：启动 Vite demo server，端口 3000。
- `pnpm run site:start`：启动 Docusaurus docs site，端口 3001。
- `pnpm run type-check`：执行 package 与 repo TypeScript 检查。
- `pnpm run lint:check`：执行 ESLint 检查，不自动修复。
- `pnpm run test`：执行 `tests/**/*.test.mjs`。
- `pnpm run build`：构建 `@whynotsnow/dynamic-form`。
- `pnpm run site:build`：构建 docs site。
- `pnpm run release:publish`：执行 package 发布保护脚本。

不要声称某个命令通过，除非实际运行过。

## 文档语言规则

- 从 2026-06-30 起，项目文档默认只使用中文编写。
- 文档、README、CHANGELOG、AGENTS 等说明性文件不再维护完整英文翻译结构。
- 可以保留 API name、package name、file path、npm scripts、TypeScript 类型名、Docusaurus、Runtime、Adapter、Compiler 等英文关键词。
- 唯一例外是 `apps/docs-site/i18n/`：该目录继续维护 docs-site 的英文翻译内容。
- 修改 `apps/docs-site/docs/` 的中文站点内容时，应同步维护 `apps/docs-site/i18n/` 中对应英文翻译。

## 文档归属

- 根 `README.md` 是 monorepo 入口，保持简短并链接到各 workspace 文档。
- 根 `docs/` 只维护 monorepo 级文档。
- 库文档归属 `packages/dynamic-form/docs/`。
- docs-site 中文内容归属 `apps/docs-site/docs/`，英文 i18n 内容归属 `apps/docs-site/i18n/`。
- demo 文档归属 `demos/README.md`。

## Demo 边界

- 不要把 `demos/` 中的 demo 业务逻辑复制到 `apps/docs-site/`。
- docs-site 可以包装和样式化 demos，但 demo 行为应保留在 demo 组件中。
- 新增或修改 demo-facing 文案时，默认使用中文；如果该文案也展示在 docs-site 英文 i18n 页面中，再同步维护对应英文翻译。

## 发布边界

- 可发布 package 是 `packages/dynamic-form/`。
- package name、public exports、`main`、`module`、`types` 和 `exports` 兼容性很重要。
- `npm publish --access public` 必须通过发布脚本在 package workspace 内执行。
- 根文档和站点文档不是 package 发布输入，除非明确复制到 package 边界。

## Git 安全

- 工作区可能包含用户未提交修改。不要回滚你没有创建的改动，除非用户明确要求。
- 避免执行 `git reset --hard`、`git checkout --` 等破坏性命令，除非用户明确要求。
- 保持改动范围聚焦，不做无关重构。
