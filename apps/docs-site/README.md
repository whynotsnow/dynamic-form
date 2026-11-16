# DynamicForm Docs Site

`apps/docs-site` 是 DynamicForm 的 Docusaurus 文档站。它负责站点布局、导航、主题样式、中文站点文档和 i18n 英文翻译内容。

## 内容边界

- 站点中文文档位于 `apps/docs-site/docs/`。
- 站点英文翻译位于 `apps/docs-site/i18n/en/docusaurus-plugin-content-docs/current/`。
- 库文档的权威版本位于 `packages/dynamic-form/docs/`。
- demo 业务逻辑继续保留在根目录 `demos/`，站点只复用或包装 demo 组件。

## 开发命令

```bash
pnpm run site:start  # 从仓库根目录启动站点
pnpm run site:build  # 从仓库根目录构建站点
```

也可以在 workspace 内运行：

```bash
pnpm --filter @whynotsnow/dynamic-form-site start
pnpm --filter @whynotsnow/dynamic-form-site build
```

## 生产构建与发布准备

```bash
pnpm run site:build
```

静态产物输出到 `apps/docs-site/build/`，由构建生成，不提交到仓库。docs-site 是私有 workspace（版本为 `0.0.0`），站点文档或 demo 的更新不需要同步提升 npm 发布包版本，也不应使用 `release:publish` 发布。

当前仓库没有 docs-site 的自动部署 workflow 或发布脚本；`site:build` 只生成静态文件，不会更新线上站点。部署需沿用仓库外已配置的站点发布入口。生产部署前应确认目标环境使用 `https://form.whynotsnow.com/` 与根路径 `/`，并检查构建产物。

## 维护规则

- 新增或修改站点中文内容时，同步检查并维护 `apps/docs-site/i18n/` 中对应英文翻译。
- 站点页面可以有自己的布局和样式，但不要把 `demos/` 中的 demo 业务逻辑复制到站点目录。
- 如果站点展示 package API、架构或使用方式，优先与 `packages/dynamic-form/docs/` 保持语义一致。
