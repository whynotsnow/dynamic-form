# 独立文档站规划

## 中文文档

本文固定 DynamicForm 独立文档站的建设方案。当前仓库已经进入 monorepo 形态：库发布包位于 `packages/dynamic-form/`，文档站位于 `apps/docs-site/`，`docs/` 和 `demos/` 继续作为仓库级内容被站点复用。

### 背景

当前仓库已经具备站点化基础：

- `packages/dynamic-form/src/` 保存动态表单库源码，`packages/dynamic-form/` 是唯一 npm 发布边界。
- `demos/` 保存 Vite demo 入口和可复用 demo 组件，`demos/demoRegistry.tsx` 是当前 demo 注册中心。
- `docs/` 保存双语 Markdown 专题文档。
- `apps/docs-site/` 保存 Docusaurus 文档站，并复用根目录的 demo registry。
- 根目录 `npm run build` 委托到 `@whynotsnow/dynamic-form` workspace 构建库产物，`npm run site:build` 构建文档站。

站点建设应优先复用现有内容，不应为了官网复制 demo 业务逻辑或改写库核心管线。

### 建议架构

当前采用真实 monorepo 结构：

```text
dynamic-form/
├── apps/
│   └── docs-site/           # 独立文档站
├── packages/
│   └── dynamic-form/        # npm 发布包、源码、tsup 配置
├── docs/                    # 继续保存双语 Markdown 文档
├── demos/                   # 继续保存 demo 组件和 demoRegistry
└── package.json             # npm workspaces 统一调度
```

库迁移后仍保留 `docs/` 和 `demos/` 在仓库根目录，避免站点复制 demo 业务逻辑；发布包内的 `docs/` 是 npm tarball 兼容所需的文档副本。

### 技术选型

首选 Docusaurus：

- 适合文档站和开源库官网。
- 支持 Markdown / MDX、侧边栏、文档路由和版本化能力。
- 可以通过 MDX 或 React 页面嵌入现有 demo 组件。
- 比从零搭建 Markdown 路由、导航和搜索更省维护成本。

备选 Vite + React + MDX：

- 适合高度自定义的交互式官网或 playground。
- 需要自行维护文档路由、侧边栏、搜索和 Markdown 加载。
- 如果未来 demo/playground 比文档更重要，可以重新评估。

不优先选择 VitePress，因为项目主体和 demo 都是 React。

### 站点内容结构

建议文档站按以下信息架构组织：

```text
/
  首页：库定位、核心能力、安装方式、快速示例
/docs
  渲染 docs/README.md 和 docs/*.md 专题文档
/playground
  复用 demos/demoRegistry.tsx 展示可交互 demo
/examples
  按使用场景展示配置代码和运行结果
/api
  公共导出、核心类型和扩展点摘要
```

`demos/DemoSelector.tsx` 当前更适合本地人工验证，不建议直接作为官网页面外壳。站点应复用 demo 组件和 `demoRegistry`，但重新设计站点级布局、导航和移动端体验。

建议保持以下边界：

- `demos/` 继续保存 demo 业务组件。
- `apps/docs-site/` 保存站点页面、站点布局和 demo 展示外壳。
- `docs/` 继续作为专题文档源。
- 站点不复制 demo 逻辑，优先从 `demos/demoRegistry.tsx` 读取 demo 定义。

### 文档语言策略

第一阶段继续使用现有“中文在上、英文在下”的双语文档结构，不拆分 `/zh/` 和 `/en/`。

原因：

- 当前文档已经按这个规则维护。
- 拆分多语言站点会增加迁移和同步成本。
- 第一阶段的重点是让文档和 demo 可部署，而不是重写文档体系。

后续如果站点访问量和维护节奏稳定，再评估 Docusaurus i18n，将文档拆分为独立中文和英文版本。

### 构建命令设计

第一阶段建议在根目录增加站点命令，但保留库构建语义：

```json
{
  "scripts": {
    "build": "tsup",
    "site:start": "npm --workspace apps/docs-site run start",
    "site:build": "npm --workspace apps/docs-site run build",
    "build:all": "npm run type-check && npm run build && npm run site:build"
  },
  "workspaces": [
    "apps/*"
  ]
}
```

这些命令是规划目标，只有在 `apps/docs-site` 创建后才能加入。不要提前添加无法运行的脚本。

后续完整 monorepo 迁移后，可扩展为：

```json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "npm run build -w @whynotsnow/dynamic-form",
    "site:build": "npm run build -w @whynotsnow/dynamic-form-site",
    "build:all": "npm run build && npm run site:build"
  }
}
```

### 部署策略

GitHub Pages：

- Docusaurus 配置 `baseUrl: '/dynamic-form/'`。
- 构建命令运行 `npm ci` 和 `npm run build:all`。
- 发布目录为 `apps/docs-site/build`。

Vercel / Netlify：

- Root directory 可设为仓库根目录。
- Build command 使用 `npm run build:all`。
- Docusaurus 输出目录为 `apps/docs-site/build`。
- 如果后续改为 Vite 站点，输出目录为 `apps/docs-site/dist`。

部署流程应先验证库构建，再构建站点，避免站点引用未通过类型检查的源码。

### 阶段计划

#### 阶段 1：新增独立站点应用

目标：

- 新增 `apps/docs-site/`。
- 使用 Docusaurus 初始化站点。
- 接入现有 `docs/` 文档。
- 建立首页、文档页、playground 页的最小结构。
- 根目录加入可运行的 `site:start`、`site:build`、`build:all` 命令。

验收：

- `npm run site:start` 可以本地预览站点。
- `npm run site:build` 可以生成站点产物。
- `npm run build:all` 可以先构建库，再构建站点。
- 现有 `npm run build` 仍然只构建库。

#### 阶段 2：复用 demo 注册表建设 Playground

目标：

- 在站点中从 `demos/demoRegistry.tsx` 读取 demo 定义。
- 新建站点级 demo 展示页面，不直接复用 `DemoSelector` 页面外壳。
- 保留 demo 组件作为行为验证和站点展示的共同来源。
- 调整 demo 展示容器，支持站点导航、响应式布局和单个 demo 的深链接。

验收：

- 每个 demo 可以在站点中独立访问。
- demo 标题和描述与 `demoRegistry` 保持一致。
- 新增 demo 时只需要更新 demo 注册表和必要文档。

#### 阶段 3：站点内容完善

目标：

- 首页介绍库定位、核心能力、安装方式和最小示例。
- 文档区建立稳定侧边栏。
- Examples 区按场景组织配置代码和运行结果。
- API 区整理公共导出、核心类型和扩展点。

验收：

- 新用户可以从首页进入安装、基础用法、demo 和 API。
- 维护者可以继续在 `docs/` 中按专题维护文档。
- 站点内容不复制大段源码，必要时链接到仓库文件。

#### 阶段 4：部署自动化

目标：

- 新增 GitHub Actions 或目标平台配置。
- 自动执行 `npm ci`、`npm run build:all`。
- 发布 `apps/docs-site/build`。
- 在 README 中增加站点地址。

验收：

- 主分支更新后可自动部署站点。
- 部署失败能暴露库类型检查、库构建或站点构建错误。

#### 阶段 5：评估完整 monorepo 迁移

目标：

- 评估是否将库移动到 `packages/dynamic-form/`。
- 如果迁移，保持包名、导出路径、构建产物和发布流程兼容。
- 更新 tsconfig、tsup、测试、lint、文档链接和 demo 引用路径。

验收：

- npm 包发布产物不发生非预期变化。
- 站点继续从 workspace 包或源码别名引用库。
- 迁移不破坏已有文档链接和 demo 行为。

### 维护约束

- 不要为了站点建设改写核心渲染、Runtime 或 effect 管线。
- 不要复制 `demos/` 中的 demo 业务逻辑到站点目录。
- 不要提前添加不可运行的 npm scripts。
- 文档新增或修改仍遵守中文在上、英文在下的双语结构。
- Demo-facing 文案新增或修改也应保持双语，尤其是 demo registry、demo README 和站点展示文案。
- 站点页面可以有自己的布局和样式，但应把 demo 行为保留在 demo 组件中。

---

## English Documentation

This document records the plan for the standalone DynamicForm documentation site. The repository now uses a monorepo layout: the publishable library package lives in `packages/dynamic-form/`, the documentation site lives in `apps/docs-site/`, and root-level `docs/` and `demos/` remain shared repository content.

### Background

The repository already has the foundation for a documentation site:

- `packages/dynamic-form/src/` contains the dynamic form library source, and `packages/dynamic-form/` is the only npm publishing boundary.
- `demos/` contains the Vite demo entry and reusable demo components. `demos/demoRegistry.tsx` is the current demo registry.
- `docs/` contains bilingual Markdown topic documentation.
- `apps/docs-site/` contains the Docusaurus documentation site and reuses the root demo registry.
- Root `npm run build` delegates to the `@whynotsnow/dynamic-form` workspace, while `npm run site:build` builds the documentation site.

The site should reuse existing content first. It should not copy demo business logic or rewrite the library's core runtime pipeline.

### Recommended Architecture

The current repository uses a real monorepo layout:

```text
dynamic-form/
├── apps/
│   └── docs-site/           # Standalone docs site
├── packages/
│   └── dynamic-form/        # npm package, source, tsup config
├── docs/                    # Existing bilingual Markdown docs
├── demos/                   # Existing demo components and demoRegistry
└── package.json             # npm workspaces orchestration
```

After the library migration, `docs/` and `demos/` still remain at the repository root so the site does not duplicate demo business logic. The package-level `docs/` directory exists to preserve the npm tarball documentation contents.

### Technology Choice

Docusaurus is the preferred option:

- It fits documentation sites and open-source library websites.
- It supports Markdown / MDX, sidebars, document routing, and versioning.
- It can embed existing demo components through MDX or React pages.
- It has lower maintenance cost than building Markdown routing, navigation, and search from scratch.

Vite + React + MDX is the fallback:

- It is better for a highly customized interactive website or playground.
- It requires maintaining document routing, sidebars, search, and Markdown loading manually.
- It can be reconsidered if the playground becomes more important than the documentation.

VitePress is not the preferred choice because the project and demos are React-based.

### Site Information Architecture

The documentation site should be organized as:

```text
/
  Home: positioning, core features, installation, quick example
/docs
  Render docs/README.md and docs/*.md topic docs
/playground
  Reuse demos/demoRegistry.tsx for interactive demos
/examples
  Scenario-based configuration code and live results
/api
  Public exports, core types, and extension points
```

`demos/DemoSelector.tsx` is currently better suited for local manual verification. It should not be used directly as the website shell. The site should reuse demo components and `demoRegistry`, but provide its own layout, navigation, and responsive experience.

Keep these boundaries:

- `demos/` continues to hold demo behavior components.
- `apps/docs-site/` holds site pages, layout, and demo presentation shells.
- `docs/` remains the source of topic documentation.
- The site should not copy demo logic. Prefer reading demo definitions from `demos/demoRegistry.tsx`.

### Documentation Language Strategy

Phase 1 should keep the existing bilingual structure: Chinese first, English second. Do not split into `/zh/` and `/en/` yet.

Reasons:

- The current documentation is already maintained in this format.
- Splitting into a multilingual site would add migration and synchronization cost.
- The first phase should focus on making docs and demos deployable, not rewriting the documentation system.

After the site is stable, Docusaurus i18n can be evaluated and the docs can be split into separate Chinese and English versions.

### Build Command Design

In phase 1, add root-level site commands while preserving the meaning of the library build:

```json
{
  "scripts": {
    "build": "tsup",
    "site:start": "npm --workspace apps/docs-site run start",
    "site:build": "npm --workspace apps/docs-site run build",
    "build:all": "npm run type-check && npm run build && npm run site:build"
  },
  "workspaces": [
    "apps/*"
  ]
}
```

These commands are planning targets and should only be added after `apps/docs-site` exists. Do not add scripts that cannot run yet.

After a full monorepo migration, the commands can become:

```json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "npm run build -w @whynotsnow/dynamic-form",
    "site:build": "npm run build -w @whynotsnow/dynamic-form-site",
    "build:all": "npm run build && npm run site:build"
  }
}
```

### Deployment Strategy

GitHub Pages:

- Configure Docusaurus with `baseUrl: '/dynamic-form/'`.
- Run `npm ci` and `npm run build:all`.
- Publish `apps/docs-site/build`.

Vercel / Netlify:

- The root directory can be the repository root.
- Use `npm run build:all` as the build command.
- Use `apps/docs-site/build` as the Docusaurus output directory.
- If the site later moves to Vite, use `apps/docs-site/dist`.

Deployment should validate the library first and then build the site, so the site does not reference source that fails type checking.

### Phase Plan

#### Phase 1: Add the Standalone Site App

Goals:

- Add `apps/docs-site/`.
- Initialize the site with Docusaurus.
- Connect the existing `docs/` documentation.
- Create the minimal home, docs, and playground page structure.
- Add runnable `site:start`, `site:build`, and `build:all` scripts at the root.

Acceptance:

- `npm run site:start` previews the site locally.
- `npm run site:build` generates the site output.
- `npm run build:all` builds the library first and then the site.
- Existing `npm run build` still builds only the library.

#### Phase 2: Build the Playground from the Demo Registry

Goals:

- Read demo definitions from `demos/demoRegistry.tsx`.
- Create a site-level demo page instead of reusing the `DemoSelector` shell directly.
- Keep demo components as the shared source for behavior verification and site presentation.
- Adjust the demo presentation container for site navigation, responsive layout, and deep links.

Acceptance:

- Each demo can be visited independently on the site.
- Demo titles and descriptions stay aligned with `demoRegistry`.
- Adding a demo only requires updating the demo registry and the necessary documentation.

#### Phase 3: Complete Site Content

Goals:

- The home page explains positioning, core features, installation, and the minimal example.
- The docs area has a stable sidebar.
- The examples area organizes configuration code and live results by scenario.
- The API area summarizes public exports, core types, and extension points.

Acceptance:

- New users can move from the home page to installation, basic usage, demos, and API references.
- Maintainers can continue editing topic docs in `docs/`.
- The site does not duplicate large source snippets. Link to repository files when needed.

#### Phase 4: Deployment Automation

Goals:

- Add GitHub Actions or target platform configuration.
- Automatically run `npm ci` and `npm run build:all`.
- Publish `apps/docs-site/build`.
- Add the site URL to the root README.

Acceptance:

- The site deploys automatically after main branch updates.
- Deployment failures expose library type-check, package build, or site build errors.

#### Phase 5: Evaluate Full Monorepo Migration

Goals:

- Evaluate moving the library into `packages/dynamic-form/`.
- If migrated, preserve package name, export paths, build output, and release compatibility.
- Update tsconfig, tsup, tests, lint, docs links, and demo import paths.

Acceptance:

- npm package output does not change unexpectedly.
- The site continues to reference the library through the workspace package or source aliases.
- Migration does not break existing documentation links or demo behavior.

### Maintenance Constraints

- Do not rewrite core rendering, Runtime, or effect pipelines for the site.
- Do not copy demo business logic from `demos/` into the site directory.
- Do not add npm scripts before they are runnable.
- New or updated docs must keep the Chinese-first, English-second bilingual structure.
- New or updated demo-facing text should also remain bilingual, especially demo registry entries, demo README entries, and site presentation copy.
- Site pages can have their own layout and styling, but demo behavior should remain in demo components.
