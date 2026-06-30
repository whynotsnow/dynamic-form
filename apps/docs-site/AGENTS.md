# Docs Site 后续 Agent 说明

最近审阅：2026-06-30

## 作用范围

本文适用于 `apps/docs-site/`。

docs-site 是名为 `@whynotsnow/dynamic-form-site` 的 Docusaurus workspace。它负责站点配置、布局、主题样式、中文站点文档和英文 i18n 翻译文档。它不拥有可复用 demo 业务逻辑。

## 命令

从仓库根目录运行：

- `npm run site:start`：在端口 3001 启动 Docusaurus。
- `npm run site:build`：构建 Docusaurus 站点。

workspace 命令：

- `npm --workspace apps/docs-site run start`
- `npm --workspace apps/docs-site run build`
- `npm --workspace apps/docs-site run serve`
- `npm --workspace apps/docs-site run clear`

## 文档布局

- 中文站点文档：`apps/docs-site/docs/`。
- 英文 i18n 文档：`apps/docs-site/i18n/en/docusaurus-plugin-content-docs/current/`。
- 站点页面和共享站点组件：`apps/docs-site/src/`。
- 库权威文档：`packages/dynamic-form/docs/`。
- monorepo 文档：根 `docs/`。

项目文档默认只写中文；本目录的例外是 `apps/docs-site/i18n/`，该目录继续维护英文翻译。修改 `apps/docs-site/docs/` 的中文内容时，需要同步检查并更新对应 i18n 英文内容。

## Demo 集成

- 从根 `demos/` 复用 demo 组件和 registry 数据。
- 不要把 demo 业务逻辑复制到 `apps/docs-site/`。
- 站点专用 wrappers、layout、navigation 和 presentation components 可以放在 `apps/docs-site/`。
- 站点展示的 demo-facing 文案默认中文；如果对应页面存在英文 i18n 内容，应同步维护英文翻译。

## 源码引用

- 站点可以通过 workspace resolution 引用 package，也可以在本地开发时 alias 到 package source。
- 如果 alias 路径变化，验证 `npm run site:build`。
- 不要为了站点工作改动核心库的 rendering、Runtime、reducer、compiler、adapter、rule 或 effect pipelines。

## 验证

站点变更优先验证：

1. `npm run site:build`
2. TypeScript 或共享 import 变化时运行 `npm run type-check`
3. 布局或交互 demo 变化时，用 `npm run site:start` 本地检查
