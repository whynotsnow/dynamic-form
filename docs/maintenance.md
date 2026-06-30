# Monorepo 维护指南

本文记录仓库级维护方式。库行为和 API 维护请优先查看 `packages/dynamic-form/docs/maintenance.md`。

### 常用命令

```bash
pnpm run start       # 启动根 Vite demos
pnpm run type-check  # 检查库 package 与 demos/tests
pnpm run test        # 运行仓库级 Node tests
pnpm run build       # 构建 @whynotsnow/dynamic-form
pnpm run site:build  # 构建 Docusaurus 站点
```

当前仓库存在 `pnpm-lock.yaml`，默认使用 pnpm。

### 文档维护

- 修改库行为、公共 API 或库使用方式：更新 `packages/dynamic-form/docs/`。
- 修改站点页面、站点导航或站点展示文案：更新 `apps/docs-site/`。
- 修改 workspace、发布、CI、站点规划或仓库治理：更新根 `docs/`。
- 根 `README.md` 面向仓库和包的总览；只有公共摘要、入口链接或结构变化时才同步更新。
- 项目文档默认使用中文编写，保留必要的 API name、package name、file path 和技术关键词。
- `apps/docs-site/i18n/` 是唯一继续维护英文翻译的文档目录；修改站点中文内容时，同步检查对应 i18n 英文内容。

不要在根 `docs/` 复制库专题文档。不要在站点目录复制 demo 业务逻辑。

### 生成物

- `packages/*/dist` 是构建产物，不提交。
- `apps/docs-site/build` 和 `.docusaurus` 是站点生成物，不提交。
- `packages/dynamic-form/docs` 是源码文档，需要提交；它不是生成物。
