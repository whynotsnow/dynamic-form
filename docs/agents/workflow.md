# Agent 工作流

## 执行步骤

1. 阅读根 `AGENTS.md`，再按修改路径读取最近的 `AGENTS.md`、`docs/README.md` 和相关 owner 文档。
2. 查看当前分支和工作区，保留用户已有改动；确认实际 package、文档或 demo owner 后再编辑。
3. 对简单、边界清楚的工作直接处理。复杂需求优先检查相邻 `../dynamic-form.sidecar/` 是否已有 RM/task；如有，先读取 Sidecar 的 `AGENTS.md`、`sidecar.config.json`、`index.json` 和目标记录/plan。仅执行 `execution/ready` 或 `execution/running` 的 task。
4. 做最小一致改动；文档只更新实际拥有该行为的文件，并通过链接复用已有内容。
5. 运行与变更匹配的检查。不要声称未运行的检查通过；报告跳过项及失败。
6. 如果 task 受 Sidecar 管理，把验证和交接记录写入 Sidecar；将可复用的长期知识提炼到其唯一主仓库 owner。

## 文档路由

- core 或 React/Ant Design 库行为、公共 API 和使用方式：对应 package README 与 `docs/`。
- 站点内容、站点配置或导航：`apps/docs-site/`；中文站点文档变更还要检查对应英文 i18n。
- 共享 demo 行为：`demos/`；不要复制业务逻辑到 docs-site。
- monorepo、发布和维护规则：根 `docs/`。
- 新增 Agent/开发者知识：遵守本文目录与[文档 contract](./README.md)，不要扩张根 `AGENTS.md` 或复制专题文档。

## 验证与发布

按变更范围选取 `type-check`、`lint:check`、`test`、`build`、`site:build` 和 package `npm pack --dry-run`。正式发布必须完整通过仓库发布检查，按 core 后 React 的顺序执行，并在启动外部发布前获得明确授权。发布流程的权威说明见[发布文档](../release.md)。

## 提交关联

主仓库提交直接执行 Sidecar task 时使用 `Plan-Item: <taskId>`；仅与 task 相关但不执行该 task 时使用 `Related-Plan: <id>`。提交作者和其他 Git 安全要求以根 `AGENTS.md` 为准。

## 信息边界

遵守[信息披露策略](./disclosure-policy.md)。不要把本机路径、个人身份、凭据、原始日志或未确认观察写进跟踪文档或 Sidecar。
