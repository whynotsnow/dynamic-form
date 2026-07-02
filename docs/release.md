# 发布流程

本文记录 monorepo 中 `@whynotsnow/dynamic-form-core` 和 `@whynotsnow/dynamic-form` 的发布边界和验证流程。

### 发布边界

当前 npm 发布包有两个。根目录 `package.json` 是 private workspace root，不执行 npm 发布。

core 包：

- 包名：`@whynotsnow/dynamic-form-core`
- 目录：`packages/dynamic-form-core/`
- 入口：`./dist/index.js`
- ESM：`./dist/index.mjs`
- 类型：`./dist/index.d.ts`
- `exports["."]` 的 `types`、`import`、`require` 路径不变

React/AntD 兼容包：

- 包名：`@whynotsnow/dynamic-form`
- 目录：`packages/dynamic-form/`
- 入口：`./dist/index.js`
- ESM：`./dist/index.mjs`
- 类型：`./dist/index.d.ts`
- `exports["."]` 的 `types`、`import`、`require` 路径不变
- 依赖 `@whynotsnow/dynamic-form-core`，并继续 re-export core 公共 API

### 发布前验证

```bash
pnpm run type-check
pnpm run test
pnpm run build
pnpm run site:build
pnpm --filter @whynotsnow/dynamic-form-core exec npm pack --dry-run
pnpm --filter @whynotsnow/dynamic-form exec npm pack --dry-run
```

`npm pack --dry-run` 应包含 `dist/`、`docs/`、`README.md`、`LICENSE` 和 package manifest。

### 发布脚本

使用：

```bash
pnpm run release:publish
```

脚本会读取两个 package 的包名和版本，在仓库根运行验证命令，并按顺序执行 `npm pack --dry-run` 与 `npm publish --access public`：先发布 `@whynotsnow/dynamic-form-core`，再发布 `@whynotsnow/dynamic-form`。

### Tag

版本 tag 采用 `v` 前缀，例如 `v3.2.0`。
