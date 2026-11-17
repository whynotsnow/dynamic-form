# 运行与工具故障手册

这里只记录已确认且能跨任务复用的故障模式。每项应说明可识别症状、安全诊断方式、已知处理和验证边界；完整私有日志留在本地，不得复制到本文档。

## Demo 结构操作在外层重渲染后被回滚

### 可识别症状

- `Form.List`、自定义列表或表格的增删操作短暂生效后恢复原数量，或从用户视角看完全没有变化。
- 普通 Input、Checkbox 和现有行编辑仍能工作；改变页面高度的操作更容易复现。
- 问题只在 docs-site wrapper 中出现时，不应直接把 `ResizeObserver` 当作数据层根因。

### 诊断

1. 分别记录点击前、组件内部更新后和外层渲染后的数组长度，确认是事件未触发还是结果被覆盖。
2. 检查 Demo 是否持续传入 `values` 快照，同时在函数组件内重新创建 `formConfig` 或 component registry。
3. 沿 `useStoreInit` 检查配置 identity 变化是否重新计算 merged initial values，并再次调用 `setFieldsValue()`。
4. 把页面高度变化、父组件 state、locale 切换等视为触发器；真正的修复点是消除无关重渲染时的初始数据回放。

### 处理

- 对会在页面内持续编辑结构数据的 Demo，稳定 `formConfig` 和 component registry 的引用。
- 异步初始数据、错误预设和重置使用明确的 `form.setFieldsValue()` 写入；不要把初始快照作为长期 `values` prop 反复传入。
- 可以另行减少 wrapper 的高度缓存 state 更新，但该优化不能代替数据所有权修复。

### 验证

- 在真实浏览器中覆盖列表添加、删除、成员/任务添加、表格新增、错误预设、重置和提交数据。
- 数量断言后继续检查提交 payload，避免只验证 DOM 暂时出现了新节点。

## Prop 或 render hook 已传入但运行期不生效

### 可识别症状

- 调用方能确认 `uiConfig`、`renderGroups` 等参数已经传入，但模式切换后 UI 不更新，或只有相邻层级的 render hook 生效。

### 诊断与处理

- 先检查 prop 是否只在 reducer 初始化时保存；运行期可变 prop 必须显式同步到 state，或直接从当前 prop 派生。
- 再从真实顶层渲染入口追踪 hook，而不是只确认 helper 已定义。统一 node render path 容易绕过旧的 grouped-config collection hook。
- 接入 `renderGroups` 时只让适合按分组集合渲染的顶层容器走该路径；混合 root nodes、nested containers 和 repeatable containers 继续保持 node 顺序与专用渲染语义。

### 验证

- 对 `uiConfig.formProps.disabled` 同时验证切入禁用和恢复可编辑，覆盖 Input、Select、Switch、Upload 及自定义组件。
- 对 `renderGroups` 验证集合容器、分组项、字段项和自定义提交入口共同生效，并保留 mixed、nested、repeatable 路径的自动化回归。

## 内部运行时属性被透传到 DOM

### 可识别症状

- React 控制台报告 `formAdapter` 等内部属性被传到原生 DOM，通常来自默认组件的 `...restProps`。

### 诊断与处理

- 从 `FieldComponentRenderer` 传给 registry component 的完整 props 开始检查。
- 所有会把 `restProps` 继续传给 Ant Design 或原生元素的默认组件，都必须先统一解构并剔除 `form`、`formAdapter`、`field` 等仅供 DynamicForm runtime 使用的属性。
- 为默认 registry component 增加静态渲染断言，确认输出 HTML 不含内部属性；浏览器验收时再检查控制台。
