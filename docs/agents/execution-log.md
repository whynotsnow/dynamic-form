# 可复用执行记录

这里只记录已完成工作中经确认、能帮助未来维护者避免错误或重复调查的结论。普通实现历史、状态汇报、完整对话和逐任务验证记录不属于本文档。

如果任务使用 Sidecar，计划绑定的验证和交接记录归入 Sidecar 的 `runs/` 与 `handoffs/`。只有提炼出稳定项目知识后才在此添加简短条目，并链接唯一 owner。

## 2026-11-17：Demo 交互回归诊断

- Sidecar task：`DFORM-TASK-0012`。
- 可复用结论：页面高度变化或父级 state 更新可能只是回滚的触发器；应先区分“交互未执行”和“结果被后续初始化覆盖”，再检查配置 identity、初始化值写入、prop state 同步和实际 render path。
- 处理与回归要点已归入[运行手册](./runtime-playbook.md#demo-结构操作在外层重渲染后被回滚)，逐项验证结果仍由 Sidecar run/handoff 持有。
