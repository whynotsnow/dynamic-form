# DynamicForm 项目地图

## 项目概览

DynamicForm 是基于配置的表单引擎 monorepo。根目录负责 pnpm workspace 调度；npm 包、文档站和 demos 有各自的 workspace 与文档 owner。详细仓库架构见[monorepo 架构](../ARCHITECTURE.md)。

## 目录和 owner

| 路径 | 职责 |
| --- | --- |
| `packages/dynamic-form-core/` | 纯 core package、源码、构建和随包发布的 core 文档。 |
| `packages/dynamic-form/` | React/Ant Design package、源码、构建和随包发布的库文档。 |
| `apps/docs-site/` | Docusaurus 配置、中文站点内容和英文 i18n。 |
| `demos/` | Vite 与 docs-site 共用的 demo 业务逻辑。 |
| `tests/` | 仓库级 Node 测试与共享测试数据。 |
| `docs/` | monorepo 架构、维护、发布、Agent 和开发者文档。 |
| `scripts/` | 版本同步及 package 发布等仓库维护脚本。 |

子目录约束见 [React package 指引](../../packages/dynamic-form/AGENTS.md)、[docs-site 指引](../../apps/docs-site/AGENTS.md) 和 [demos 指引](../../demos/AGENTS.md)；core 当前遵循根约定及 package 文档 owner。

## 发布边界

根目录是 private workspace root，不是 npm 发布包。两个发布 package 是 `@whynotsnow/dynamic-form-core` 与 `@whynotsnow/dynamic-form`，并使用 lockstep 版本策略。具体 package 入口、版本同步和发布保护流程以[发布流程](../release.md)及各 package manifest 为准。

## 架构和数据流

core package 在 `src/exports.ts` 公开配置处理和 diagnostics、compiler 与 module registry、passthrough/JSON Schema/OpenAPI/metadata adapters、Rule Engine、Runtime selectors/resolvers，以及 field address/value helpers。该 package 不依赖 React 或 Ant Design。

React package 复用 core，并在 `src/exports.ts` 公开 `DynamicForm`、`CompiledDynamicForm`、provider/compatibility exports、React hooks、effect result handlers、form adapters 和 renderer adapters。默认 renderer 是 Ant Design；同时提供 `headlessRenderer`。Form adapter 抽象让运行时通过 Ant Design form 或 memory adapter 读写 values 并调用 `validateFields`；memory adapter 是最小内存实现，不提供 UI 规则校验。React package 的 peer dependencies 当前要求 React/React DOM `>=17` 和 Ant Design `>=5`。

主要数据流如下：

1. `processFormConfig()` 将 flat fields、groups 和 nested nodes 规范化为 node tree，并生成 field/node/container registries、field address registry、effect map 和 initial values。
2. `useStoreInit()` 建立 reducer state；外部 form state 由 `DynamicFormFormAdapter` 接口访问。
3. Provider 将表单变更转换为 effect 输入；`applyEffectResult()` 将结果路由到已注册的内置或自定义 handlers。
4. React Runtime hook 对每份 state snapshot 调用 core `resolveRuntimeState()`；渲染、提交参与、disabled/readonly 和校验参与都消费这份 Runtime snapshot。
5. renderer adapter 负责 form、field、group、repeatable container 和 submit 的输出，默认 Ant Design renderer 与 headless renderer 共用上层状态和 Runtime。

站点与根 Vite demo 复用 `demos/`，不复制 demo 业务逻辑。详细目录边界见[架构文档](../ARCHITECTURE.md)；库级实现约束见 [React package 指引](../../packages/dynamic-form/AGENTS.md)。

## 公共 API 与兼容边界

- 两个 package 的 `exports`、`main`、`module`、`types` 都指向各自构建产物；公共导出源分别是 `packages/dynamic-form-core/src/exports.ts` 与 `packages/dynamic-form/src/exports.ts`。
- React package 会 re-export 多数 core API，同时提供 React/Ant Design 与 headless 集成。调整 core API 时要检查 React re-export、package 类型和构建产物。
- React package 的共享 public types 当前有意保留宽松的 `any` 值类型以兼容既有消费者；类型收紧属于公共兼容性决策，需单独评估迁移影响。
- container/repeatable name path、field stable id/name path 映射、隐藏字段的提交/校验策略、effect handler 路由会影响跨层行为，修改时同时检查 core、React 实现和对应测试。

详细 public API、数据流和行为约束以 [React package 文档](../../packages/dynamic-form/docs/README.md)、[core package 文档](../../packages/dynamic-form-core/docs/README.md) 和对应源码为准。

## 文档 owner

- 根 `docs/` 只拥有 monorepo 级说明和本 Agent 文档。
- package 使用文档分别归属各 package 的 README 与 `docs/`。
- 站点中文内容归属 `apps/docs-site/docs/`；对应英文翻译归属 `apps/docs-site/i18n/`。
- 面向维护者的开发与运维文档从[开发者文档索引](../developers/README.md)进入。
