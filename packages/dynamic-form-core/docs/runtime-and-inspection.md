# Runtime 与 inspection

core 包提供纯 Runtime resolver 和只读 inspection helpers，用于从处理后的表单状态解析字段、group 和 container 的运行时能力。

Runtime 是 UI participation decisions 的事实来源。React/AntD 包会在 `FormContent` 中为同一个 state snapshot 计算一次 Runtime，并将结果传给渲染、提交、校验和隐藏字段参与策略。

### Runtime 能力

字段能力包括：

- `rendered`：是否渲染。
- `submitable`：是否参与提交数据。
- `disabled`：是否禁用。
- `readonly`：是否只读。
- `editable`：是否可编辑。
- `validatable`：是否参与校验。

group 和 container 可见性会影响所有后代字段。隐藏父级会让后代字段不渲染、不提交且不参与校验。

### API

核心导出包括：

- `resolveRuntimeState`
- `resolveFieldCapability`
- `resolveGroupCapability`
- `getFieldRuntimeSnapshot`
- `getRenderedFieldIds`
- `getSubmitableFieldIds`
- `getValidatableFieldIds`

inspection helpers 是只读工具，适合设计器预览、调试面板和测试断言。

### 使用边界

core Runtime resolver 不依赖 React，也不依赖 Ant Design Form。它只根据 DynamicForm reducer 状态结构和配置处理信息解析能力。

在直接使用 core 的非 React 场景中，调用方需要自己提供符合类型结构的状态快照。需要完整 React state 初始化、form adapter 和 renderer 时，应使用 `@whynotsnow/dynamic-form`。

### 与校验的关系

Runtime 只决定一个字段是否应该参与校验，不执行具体校验。默认 React/AntD 实现会把 `validatable` 字段转换为对应 `NamePath` 后调用底层 form adapter 的 `validateFields`。

自定义 renderer 或 form adapter 也应遵守同一 Runtime 结果，避免隐藏或禁用字段被错误校验。
