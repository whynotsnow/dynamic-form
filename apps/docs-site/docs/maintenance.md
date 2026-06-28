# 维护指南

本文记录 DynamicForm 的本地开发、验证、构建和文档维护方式。它面向项目维护者，不是组件使用指南。

### 常用命令

```bash
npm run start       # 启动 Vite demo server
npm run build       # 使用 tsup 构建库产物
npm run type-check  # TypeScript 类型检查
npm run lint:check  # ESLint 检查，不自动修复
npm run lint        # ESLint 自动修复
npm run format      # Prettier 格式化 src 和 demos
npm run test        # Node test runner
```

当前仓库存在 `package-lock.json`，默认使用 npm。

### Demo 与验证

Vite demos 位于 `demos/`，用于人工验证组件行为。当前 `DemoSelector` 暴露：

- `storeBoundary`
- `customHandlers`
- `customComponents`
- `formValidation`
- `uiConfig`
- `renderExtension`
- `compilerFoundation`

运行 demos：

```bash
npm run start
```

### 测试

测试命令：

```bash
npm run test
```

当前测试包含 store boundary 检查，用来记录所有权规则：reducer / effect store 不应保存 Ant Design Form 运行时 values、errors、touched、warnings 或 validating 状态。

源码变更后建议按以下顺序验证：

1. `npm run type-check`
2. `npm run lint:check`
3. `npm run test`
4. `npm run build`

如果涉及 UI 行为，还应在浏览器中检查对应 demo。

### 文档维护

源码行为变化时：

- 更新最接近的 `docs/` 专题文档。
- 如果公共 API、高层能力摘要或文档入口变化，同步更新根目录 `README.md`。
- 如果变化会帮助后续 agent 理解项目，更新 `AGENTS.md`。
- 文档采用中文在上、英文翻译在下的双语结构。

不要重新引入旧的重复文档体系。

### 实现约束

- 保持 Config -> State -> Runtime -> Consumer 架构。
- 不要新增 reducer 侧 values store。
- 字段可能是平铺或分组字段，定位字段时使用 `fieldRegistry`。
- 通过共享工具归一化 behavior meta。
- 校验必须通过 runtime capabilities 过滤。
- 业务差异优先放到自定义组件、handler 或 render hooks 中，不要硬编码进核心渲染。

### 构建产物

`dist/` 由 `npm run build` 生成，是可重建产物，不应作为源码文档维护。
