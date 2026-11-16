# 运行要求

本文记录运行仓库维护命令所需的公开能力，不记录某位维护者当前机器或会话的检测结果。

| 能力 | 用途 | 项目依据 |
| --- | --- | --- |
| Node.js | TypeScript 检查、构建、测试、站点和仓库脚本。 | 根 `package.json`；仓库未声明 `engines.node`，不要据此推断正式支持范围。 |
| pnpm | 安装和调度 workspace 命令。 | `package.json` 声明 `packageManager: pnpm@11.7.0`，仓库提供 `pnpm-lock.yaml`。 |
| Git | 检查工作区、提交主仓库改动，并在使用 Sidecar 时关联 task。 | 根 `AGENTS.md` 与 Sidecar v3 提交关联规则。 |
| npm CLI、官方 registry 与发布权限 | 查询已发布版本、pack 和正式 package 发布。 | `scripts/publish-dynamic-form.mjs` 固定检查 npm 官方 registry 和预期账号；仅在获准发布时由 `pnpm run release:publish` 使用，凭据必须留在本地认证机制中。 |

## 可用验证命令

- `pnpm run type-check`：core、React package、根 TypeScript 和 docs-site 检查。
- `pnpm run lint:check`：源码和 demos 的 ESLint 检查，不自动修复。
- `pnpm run test`：运行 `tests/**/*.test.mjs`。
- `pnpm run build`：构建两个发布 package。
- `pnpm run site:build`：构建 docs-site。
- `pnpm run release:publish`：执行版本/账号/registry/package preflight、发布保护检查、验证、pack 和正式发布；先发布 core，再发布 React package；属于外部发布操作，须有明确发布授权。

完整列表和适用场景以根 `AGENTS.md`、`docs/maintenance.md` 与 `docs/release.md` 为准。`.github/workflows/publish.yml` 当前 job 有禁用条件，不应将其视为有效发布验证入口。
