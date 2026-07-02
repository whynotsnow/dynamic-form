# 配置处理与诊断

core 包提供 `processFormConfig`、`getFormConfigDiagnostics` 和 `validateFormConfig`，用于把用户配置归一化为 Runtime 输入，并在保存、导入或测试阶段提前发现配置问题。

## `processFormConfig`

`processFormConfig(config)` 是运行时配置处理入口。它接受 `FormConfig`，并输出 effect graph、字段和 container registry、field address registry、initial values、初始化后的字段状态和 container/group 状态。

支持的配置入口包括：

- `fields`：平铺字段。
- `groups`：4.0 之前的单层分组入口，处理阶段会转换为 container。
- `nodes`：4.0 起推荐的统一节点树，支持递归 `FieldNode` / `ContainerNode`。

处理阶段会保持字段 `id` 作为 Runtime、effect 和 meta 更新的稳定标识；字段或 container 的 `name` 只影响表单值路径。

## 诊断 API

`getFormConfigDiagnostics(config, options?)` 返回诊断列表，适合可视化配置系统保存前检查、导入检查和测试断言。

`validateFormConfig(config, options?)` 在诊断列表外额外返回 `valid`，便于业务侧直接阻止保存。

```ts
import { validateFormConfig } from '@whynotsnow/dynamic-form-core';

const result = validateFormConfig(formConfig, {
  knownComponents: ['TextInput', 'Select']
});

if (!result.valid) {
  console.log(result.diagnostics);
}
```

## 诊断边界

诊断 API 不替代 `processFormConfig()`。运行时配置处理遇到结构性错误仍会抛错；诊断 API 用于在运行前给设计器或导入流程提供更友好的错误列表。

当前诊断覆盖：

- 重复 field、group 或 container id。
- 重复字段 `name` 路径。
- repeatable container 缺少 `name`。
- 空 container children。
- 无效 group field 结构。
- 未知 component。
- 未知 dependent。

重复标识和无效结构属于 `error`。未知 component 或 dependent 更适合作为设计器提示，默认属于 `warning`。

## 不包含的职责

core 配置处理不负责：

- 创建 React state。
- 初始化 Ant Design Form。
- 应用 effect result handler。
- 渲染字段、分组或 container。
- 调度异步请求、远程校验或 loading/cache 状态。
