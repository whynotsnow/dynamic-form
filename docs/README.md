# Monorepo 文档索引

本文档目录只维护仓库级说明。DynamicForm 库的使用、配置、Runtime、effects、compiler、adapter、rule、schema 等专题文档由 `packages/dynamic-form/docs/` 维护；站点展示文档由 `apps/docs-site/` 维护。

### 阅读顺序

1. [Monorepo 架构](./ARCHITECTURE.md)：workspace、发布包、站点、demo 和测试的边界。
2. [维护指南](./maintenance.md)：本地命令、验证顺序、文档 ownership 和生成物规则。
3. [发布流程](./release.md)：npm 包构建、`npm pack`、tag 和发布脚本。
4. [站点规划](./site-roadmap.md)：Docusaurus 站点、demo 复用和站点内容边界。

### 文档 Ownership

- `packages/dynamic-form/docs/`：库文档，随 `@whynotsnow/dynamic-form` 包维护并进入 npm tarball。
- `apps/docs-site/docs/`：中文站点文档，服务 Docusaurus 路由和站点展示。
- `apps/docs-site/i18n/en/`：docs-site 英文 i18n 翻译，是项目文档中唯一保留英文翻译的目录。
- `docs/`：monorepo 文档，只描述仓库结构、发布、站点建设和维护流程。
