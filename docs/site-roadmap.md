# 文档站规划

本文记录当前 Docusaurus 文档站的维护边界。历史阶段计划已经完成：仓库现在是 monorepo，库发布包位于 `packages/dynamic-form/`，站点位于 `apps/docs-site/`。

## 当前结构

```text
apps/docs-site/
  docs/       中文站点文档
  i18n/en/   英文站点文档
  src/        首页、示例页、API 页和 demos 页面
demos/        站点 demos 页面复用的 demo 组件和 demoRegistry
```

## 内容边界

- 站点可以有自己的页面结构、导航、布局和展示文案。
- 站点文档不要求逐字等同于 `packages/dynamic-form/docs/`，但公共 API、示例入口和行为描述必须保持一致。
- 站点 demos 页面从 `demos/demoRegistry.tsx` 读取 demo 定义，不复制 demo 业务逻辑。
- `demos/DemoSelector.tsx` 保留给本地 Vite demo；站点使用自己的展示外壳。

## 维护规则

- 新增或修改站点展示文案时，同步维护 `apps/docs-site/docs/` 和 `apps/docs-site/i18n/en/`。
- 新增 demo 时，先更新 `demos/demoRegistry.tsx`，再更新站点 demos 页面文案和相关说明。
- 站点构建验证使用 `pnpm run site:build`。
- 站点生成物 `apps/docs-site/build` 和 `.docusaurus` 不提交。
