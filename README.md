# DynamicForm Monorepo

这是 `@whynotsnow/dynamic-form` 的 monorepo。仓库根目录只作为 private workspace root，真正的 npm 发布包位于 `packages/dynamic-form/`，Docusaurus 文档站位于 `apps/docs-site/`，可复用 demo 业务逻辑保留在根目录 `demos/`。

### 工作区结构

```text
packages/dynamic-form/   npm 发布包、源码、构建配置和库文档
apps/docs-site/          Docusaurus 文档站
demos/                   Vite demos 和 docs-site 复用的 demo 组件
tests/                   Node test 文件和 demo 测试数据
docs/                    monorepo 级架构、维护、发布和站点规划文档
```

### 主要入口

- 📦 [库 README](./packages/dynamic-form/README.md)
- 📚 [库文档索引](./packages/dynamic-form/docs/README.md)
- 🧱 [Monorepo 文档索引](./docs/README.md)
- 🌐 [文档站说明](./apps/docs-site/README.md)
- 🧪 [Demo 说明](./demos/README.md)

### 常用命令

```bash
npm run start       # 启动 Vite demos
npm run site:start  # 启动 Docusaurus 文档站
npm run type-check  # TypeScript 检查
npm run lint:check  # ESLint 检查，不自动修复
npm run test        # Node test runner
npm run build       # 构建 @whynotsnow/dynamic-form
npm run site:build  # 构建文档站
```

当前仓库存在 `package-lock.json`，默认使用 npm。

### 维护边界

- 根目录不作为 npm 发布包；`packages/dynamic-form/` 是唯一发布边界。
- `packages/dynamic-form/docs/` 是库文档的权威位置，并随 npm 包发布。
- 根 `docs/` 只维护 monorepo 级文档，例如仓库结构、发布流程、站点规划和维护策略。
- `apps/docs-site/` 维护站点布局、Docusaurus 配置和站点内容，不复制 `demos/` 的业务逻辑。
- `demos/` 继续作为 repo-level demo 来源，同时被 Vite demo 和 docs-site 复用。

