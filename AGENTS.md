# 后续 Agent 项目说明

最近审阅：2026-11-16

## 作用范围

本文适用于仓库根目录和 monorepo 级工作。更具体的规则放在各 workspace 附近：

- `packages/dynamic-form/AGENTS.md`：库源码、package 文档、构建和发布边界。
- `apps/docs-site/AGENTS.md`：Docusaurus 文档站。
- `demos/AGENTS.md`：可复用 demo 组件和 demo-facing 文案。

处理子目录文件时，应同时遵守最近的 `AGENTS.md` 与本文规则。

## 仓库概览

本仓库是 DynamicForm 的 private pnpm workspace root。

- `packages/dynamic-form-core/`：纯 core npm 发布包，包名为 `@whynotsnow/dynamic-form-core`。
- `packages/dynamic-form/`：React/AntD npm 发布包，包名为 `@whynotsnow/dynamic-form`。
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
- `pnpm run site:start` 或 `pnpm run site:start:zh-CN`：启动简体中文 Docusaurus docs site，端口 3001。
- `pnpm run site:start:en`：启动英文 Docusaurus docs site，端口 3002。
- `pnpm run site:start:locales`：同时启动简体中文和英文 docs site，分别使用端口 3001 和 3002。
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
- Agent 长期项目知识归属 `docs/agents/`；开发者文档从 `docs/developers/README.md` 路由。不要在 `AGENTS.md` 复制这些文档的细节。

## Sidecar 工作流

- 相邻 `../dynamic-form.sidecar/` 用于复杂需求的 RM、开发 task、Agent plan、decision、run、validation note 和 handoff；产品源码与长期项目文档仍留在本仓库。
- 简单且边界明确的工作可以直接执行。涉及 Sidecar task 时，先读取 Sidecar 的 `AGENTS.md`、`sidecar.config.json`、`index.json` 和目标 task/plan；只执行 `execution/ready` 或 `execution/running` 的 task。
- 主仓库提交直接执行 task 时使用 `Plan-Item: <taskId>`；仅相关时使用 `Related-Plan: <id>`。完整流程见 [Agent 工作流](docs/agents/workflow.md)。
- 执行记录、验证摘要和 handoff 写入 Sidecar；只有可复用的长期知识才提炼到 `docs/agents/`。
- Sidecar 与主仓库都不得跟踪凭据、个人身份、原始日志或机器专属路径；具体边界见 [信息披露策略](docs/agents/disclosure-policy.md)。

## Demo 边界

- 不要把 `demos/` 中的 demo 业务逻辑复制到 `apps/docs-site/`。
- docs-site 可以包装和样式化 demos，但 demo 行为应保留在 demo 组件中。
- 新增或修改 demo-facing 文案时，默认使用中文；如果该文案也展示在 docs-site 英文 i18n 页面中，再同步维护对应英文翻译。

## 发布边界

- 可发布 package 是 `packages/dynamic-form-core/` 和 `packages/dynamic-form/`。
- package name、public exports、`main`、`module`、`types` 和 `exports` 兼容性很重要。
- 根 workspace、`@whynotsnow/dynamic-form-core` 和 `@whynotsnow/dynamic-form` 采用统一版本号策略，三者 `version` 必须一致。
- `@whynotsnow/dynamic-form` 对 `@whynotsnow/dynamic-form-core` 的依赖版本必须精确等于本次统一版本号，不使用 `workspace:` 协议发布。
- 调整版本号时使用 `pnpm run version:sync -- <version>` 同步根 package、两个发布包和 lockfile。
- `npm publish --access public` 必须通过发布脚本在 package workspace 内执行，先发布 core，再发布 React/AntD 包。
- 根文档和站点文档不是 package 发布输入，除非明确复制到 package 边界。

## Git 安全

- 工作区可能包含用户未提交修改。不要回滚你没有创建的改动，除非用户明确要求。
- 避免执行 `git reset --hard`、`git checkout --` 等破坏性命令，除非用户明确要求。
- 保持改动范围聚焦，不做无关重构。
- 提交代码时必须使用本文档记录的本机 Git 作者信息：`whynotsnow <whynotsnow@163.com>`。
- 不要伪造提交身份，不要使用 `Codex <codex@openai.com>` 或其他 Agent 身份提交。
- 提交时直接使用上述作者信息；不要每次重新查询本机 Git 作者和邮箱，除非用户明确要求刷新本文档记录。
