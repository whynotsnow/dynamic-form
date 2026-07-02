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

### 统一版本策略

本仓库采用 lockstep version。根 workspace、`@whynotsnow/dynamic-form-core` 和 `@whynotsnow/dynamic-form` 必须使用同一个版本号；`@whynotsnow/dynamic-form` 对 core 的依赖版本必须精确等于该版本号。

调整版本时使用：

```bash
pnpm run version:sync -- 4.2.1
```

该脚本会同步根 `package.json`、两个发布包的 `package.json`、`@whynotsnow/dynamic-form` 对 core 的依赖版本和 `pnpm-lock.yaml` 中对应 specifier。

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

脚本会读取根 workspace 和两个 package 的包名与版本，强制校验三者版本号一致；同时校验 `@whynotsnow/dynamic-form` 依赖的 core 版本与本次发布的 `@whynotsnow/dynamic-form-core` 版本一致，并拒绝发布包含 `workspace:` 协议依赖的 package。

发布前脚本会查询 npm 上是否已存在本次版本：

- 两个包都不存在：正常发布，先发布 `@whynotsnow/dynamic-form-core`，等待 npm registry 能查询到 core 版本后，再发布 `@whynotsnow/dynamic-form`。
- core 已存在但 `@whynotsnow/dynamic-form` 不存在：进入恢复模式，跳过 core，只发布 `@whynotsnow/dynamic-form`。这用于处理 core 发布成功但 React/AntD 包发布失败的意外情况。
- `@whynotsnow/dynamic-form` 已存在但 core 不存在：停止发布，因为这会形成依赖缺失的不一致状态。
- 两个包都已存在：停止发布，因为 npm 不允许重复发布同一版本。

确认发布前，脚本会在仓库根运行验证命令，并按当前发布计划执行 `npm pack --dry-run` 与 `npm publish --access public`。

### Tag

版本 tag 采用 `v` 前缀，例如 `v3.2.0`。
