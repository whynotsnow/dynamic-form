# Rule Engine

core 包提供声明式同步 Rule Engine，用于把字段、group 或 container 上的规则编译为标准 effect。

Rule Engine 不替代 effect engine，也不替代表单校验。它只把同步声明式规则转换为 DynamicForm 已有的 effect 结果。

### API

核心导出包括：

- `RuleEngine`
- `createRuleEngine`
- `evaluateRule`
- `compileRulesToEffect`

### 条件

规则条件支持：

- `equals`
- `notEquals`
- `empty`
- `notEmpty`
- `all`
- `any`
- `not`

条件读取的是当前 values snapshot。规则求值是同步的，不调度异步请求。

### 动作

字段规则动作支持：

- `show`
- `hide`
- `enable`
- `disable`
- `readonly`
- `editable`
- `setValue`
- `clearValue`

group/container 规则动作限定为显示和隐藏。

### 编译边界

`compileRulesToEffect` 会把规则转换为标准 effect，并从 `when` 条件推导依赖字段。已有手写 effect 和规则 effect 会在 compiler 阶段合并。

规则由被影响的字段、group 或 container 持有，不使用独立 `target`。一个 source 字段影响多个目标时，应在多个受影响节点上分别声明规则。

### 不支持的能力

Rule Engine 当前不支持：

- 异步/API 规则。
- 远程规则加载。
- 请求取消或竞态控制。
- 独立 validation rule engine。
- 跨库的副作用调度。

远程选项、搜索联想、服务端校验和异步保存检查应由自定义字段组件、业务容器或底层表单库 validator 处理。
