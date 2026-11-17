# DynamicForm Docs Site

`apps/docs-site` 是 DynamicForm 的 Docusaurus 文档站。它负责站点布局、导航、主题样式、中文站点文档和 i18n 英文翻译内容。

## 内容边界

- 站点中文文档位于 `apps/docs-site/docs/`。
- 站点英文翻译位于 `apps/docs-site/i18n/en/docusaurus-plugin-content-docs/current/`。
- 库文档的权威版本位于 `packages/dynamic-form/docs/`。
- demo 业务逻辑继续保留在根目录 `demos/`，站点只复用或包装 demo 组件。

## 开发命令

```bash
pnpm run site:start:zh-CN   # 简体中文站点，端口 3001
pnpm run site:start:en      # 英文站点，端口 3002
pnpm run site:start:locales # 同时启动中英文站点，分别使用端口 3001 / 3002
pnpm run site:build  # 从仓库根目录构建站点
```

也可以在 workspace 内运行：

```bash
pnpm --filter @whynotsnow/dynamic-form-site start
pnpm --filter @whynotsnow/dynamic-form-site build
```

## 生产部署（Cloudflare Pages）

### 当前部署入口

生产站点由 Cloudflare Pages 的 Git 集成部署，不由仓库中的 GitHub Actions workflow 或本地 `site:build` 命令直接发布。

- Pages 项目：`dynamic-form`。
- GitHub 仓库：`whynotsnow/dynamic-form`。
- Production 分支：`main`；当前已启用 Git 自动部署。推送新的 `main` 提交后，Pages 会为该提交启动生产部署。
- 生产域名：`https://form.whynotsnow.com/`；Pages 默认域名为 `dynamic-form-brd.pages.dev`。
- 仓库内没有 docs-site 专用 deploy workflow、发布脚本或 Wrangler 配置。`release:publish` 发布的是 npm 包，不用于文档站。

### 构建配置

Cloudflare Pages 的构建设置保存在 Cloudflare 项目配置中，不在仓库内。当前仓库使用 pnpm workspace，推荐 Pages 设置与下表一致；若在 Dashboard 调整设置，以实际配置为准，并确认它仍与仓库脚本和锁文件兼容。

| 设置 | 值 |
| --- | --- |
| Root directory | 仓库根目录 `/` |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm run site:build` |
| Build output directory | `apps/docs-site/build` |
| Package manager | 使用根 `package.json` 声明的 pnpm 版本 |

`site:build` 会构建 Docusaurus 默认中文站点和英文 locale。`SITE_URL` 与 `SITE_BASE_URL` 未设置时，配置默认使用 `https://form.whynotsnow.com` 和 `/`。静态产物由构建生成，不提交到仓库。

### 发布步骤

同一批改动若同时更新 npm 包行为和站点版本说明，应先按 [发布流程](../../docs/release.md) 发布 core 与 React/AntD 包，再推送 `main` 触发站点部署。站点构建直接引用本仓库的 package source，因此本地构建通过不代表对应 npm 版本已经可安装。

1. 在本地完成改动，并从仓库根目录运行 `pnpm run site:build` 确认站点构建通过。
2. 将已审核的提交推送到 `main`。这一步会触发 Cloudflare Pages 的 Production 自动部署；仅在本地构建成功不会更新线上站点。
3. 打开 Cloudflare Dashboard → **Workers 和 Pages** → **dynamic-form** → **Deployments**，等待本次 `main` 提交的 Production 部署成功。核对页面显示的 commit SHA 与预期提交一致。
4. 先打开该部署对应的 `*.dynamic-form-brd.pages.dev` 预览地址，再检查 `https://form.whynotsnow.com/`。至少确认首页、文档页、Demo 页和中英文路由能正常加载。
5. 在部署详情中检查构建日志和部署状态；若失败，按日志修复后提交新的 `main` commit 并等待新部署。

若 Production 部署后发现问题，在 Pages 的 **Deployments** 中选择上一个已知可用的 Production 部署并通过其操作菜单回退；回退后仍需检查自定义域名上的页面。不要通过本地手动上传构建目录代替 Git 部署，以免生产记录与 Git commit 脱节。

### 本地构建

```bash
pnpm run site:build
```

静态产物输出到 `apps/docs-site/build/`。docs-site 是私有 workspace（版本为 `0.0.0`），站点文档或 demo 的更新不需要同步提升 npm 发布包版本。

## 维护规则

- 新增或修改站点中文内容时，同步检查并维护 `apps/docs-site/i18n/` 中对应英文翻译。
- 站点页面可以有自己的布局和样式，但不要把 `demos/` 中的 demo 业务逻辑复制到站点目录。
- 如果站点展示 package API、架构或使用方式，优先与 `packages/dynamic-form/docs/` 保持语义一致。
