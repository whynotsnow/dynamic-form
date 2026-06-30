# 发布流程

本文记录 monorepo 中 `@whynotsnow/dynamic-form` 的发布边界和验证流程。

### 发布边界

唯一 npm 发布包是 `packages/dynamic-form/`。根目录 `package.json` 是 private workspace root，不执行 npm 发布。

发布包必须保持：

- 包名：`@whynotsnow/dynamic-form`
- 入口：`./dist/index.js`
- ESM：`./dist/index.mjs`
- 类型：`./dist/index.d.ts`
- `exports["."]` 的 `types`、`import`、`require` 路径不变

### 发布前验证

```bash
npm run type-check
npm run test
npm run build
npm run site:build
npm pack --dry-run --workspace @whynotsnow/dynamic-form
```

`npm pack --dry-run` 应包含 `dist/`、`docs/`、`README.md`、`LICENSE` 和 package manifest。

### 发布脚本

使用：

```bash
npm run release:publish
```

脚本会从 `packages/dynamic-form/package.json` 读取包名和版本，在仓库根运行验证命令，并在 `packages/dynamic-form/` 内执行 `npm pack --dry-run` 和 `npm publish --access public`。

### Tag

版本 tag 采用 `v` 前缀，例如 `v3.0.0`。

