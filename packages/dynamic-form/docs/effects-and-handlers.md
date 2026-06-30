# Effect 与处理器

DynamicForm 使用 `form-chain-effect-engine` 执行依赖链，但 effect 返回值如何作用到表单由 DynamicForm 的 handler 系统负责。

### 异步边界

DynamicForm 核心不支持库级异步 effect，也不提供 async validation compile、取消、竞态、debounce、loading、error 或 cache 等异步流程管理能力。当前路线不承诺后续支持这些能力。

涉及远程请求、远程选项加载、搜索联想、服务端校验或其他异步交互时，应在自定义字段组件或业务容器中封装。组件可以自行使用 `AbortController`、请求序号、缓存、loading 和错误状态，并通过 Ant Design Form 的 `onChange`、`form.setFieldValue` 或 `rules.validator` 接入表单。

DynamicForm 只负责同步 effect result 的路由和应用。自定义 `EffectResultHandler` 应保持同步，不应把异步任务调度、请求生命周期或竞态处理放进 handler 系统。

### 初始化约束

依赖默认或自定义 effect result handler 的表单，应在渲染前调用 `useInitHandlers`。

```tsx
const { isInitialized, error } = useInitHandlers({
  handlers: customHandlers,
  options: { override: false },
  debug: false
});

if (!isInitialized) return null;
if (error) return <div>{error.message}</div>;

return <DynamicForm form={form} formConfig={formConfig} />;
```

`DynamicFormProvider` 可以在检测到 handler 可能未初始化时发出 warning。该行为由 `enableInitializationCheck` 和 `checkDelay` 控制。

`useInitHandlers({ debug: true })` 会输出处理器初始化诊断和未匹配 effect result key。默认 `debug: false`，正常渲染、reducer 更新、字段提交和 effect 执行不会向控制台输出过程日志。无效配置、缺失组件和初始化契约问题仍会使用 `warn` 或 `error` 报告。

### 联动配置

字段和分组都可以声明 `dependents` 和 `effect`。

```ts
{
  id: 'employeeCount',
  component: 'NumberInput',
  dependents: ['companySize'],
  effect: (value, values) => {
    return {
      value,
      componentProps: { min: 0 },
      visible: value !== undefined
    };
  }
}
```

配置处理阶段会生成 `effectMap`，并传给 `form-chain-effect-engine`。

3.2 的 effect graph 节点仍然引用稳定 `id`，不引用 Ant Design `NamePath`。Field Address 可以让 values 呈现嵌套结构，但不会引入 container 节点、nested group 或跨层级 effect graph；这些结构性能力留到 4.0 统一节点树处理。

声明式 rules 和手写 effects 都保持同步边界。一个 source field 影响多个 fields 时，继续在多个受影响字段上分别声明 rules；不要把远程请求生命周期、loading/error/cache 或竞态状态塞进 effect result handler。

### 默认返回 key

默认 handler 定义在 `packages/dynamic-form/src/config/defaultConfig.ts`。

| 返回 key | 作用 |
| --- | --- |
| `value` | 调用 `form.setFieldsValue` 更新当前字段值。 |
| `visible` | 更新当前字段 `meta.behavior.visible`。 |
| `disabled` | 更新当前字段 `meta.behavior.disabled`。 |
| `readonly` | 更新当前字段 `meta.behavior.readonly`。 |
| `groupsVisible` | 按 group id 更新分组可见性。 |
| `formItemProps` | 更新当前字段 `meta.formItemProps`。 |
| `componentProps` | 更新当前字段 `meta.componentProps`。 |
| `formProps` | 合并到全局动态 Form props。 |
| `buttonProps` | 合并到全局动态 Button props。 |
| `cardProps` | 合并到全局动态 Card props。 |
| `rowProps` | 合并到全局动态 Row props。 |
| `colProps` | 合并到全局动态 Col props。 |
| `submitAreaProps` | 合并到动态提交区域 props。 |

未匹配到 handler 的 key 不会被应用，只会进入 warning 日志。

### Meta 边界

行为 meta 属于 Runtime：

```ts
{
  behavior: {
    visible: true,
    disabled: false,
    readonly: false
  }
}
```

渲染专用 meta 属于渲染层：

```ts
{
  formItemProps: { help: 'Shown below the field' },
  componentProps: { placeholder: 'Enter value' }
}
```

旧的 flat key 仍然兼容：

```ts
{ visible: false, disabled: true, readonly: true }
```

新代码应优先写入 `meta.behavior`。

### 自定义处理器

自定义 handler 实现 `CustomEffectResultHandler`。

```ts
import type { CustomEffectResultHandler } from '@whynotsnow/dynamic-form';

export const customHandlers: CustomEffectResultHandler[] = [
  {
    name: 'highlight',
    description: 'Apply highlight style to the current field',
    canHandle: (key) => key === 'highlight',
    validate: (value) => typeof value === 'boolean',
    handle: (context, enabled) => {
      context.updateFieldMeta({
        componentProps: {
          style: enabled ? { background: '#fffbe6' } : undefined
        }
      });
    }
  }
];
```

handler context 提供语义化 API：

- `fieldName`
- `form`
- `getField`
- `setFieldValue`
- `updateFieldMeta`
- `updateFieldMetaById`
- `setGroupVisible`
- `updateDynamicUIConfig`

优先使用这些 API，不要在 handler 中直接维护 value、error、touched 或 validating 副本。

### 值更新原则

reducer 不存储 values、errors、warnings、touched、validating。`value` handler 直接更新 Ant Design Form。提交时先做 runtime 过滤后的校验，再用 `form.getFieldsValue(true)` 读取数据。

### 初始值结果

函数式 `initialValue` 可以返回 effect result 对象。初始化阶段也会使用同一套 handler 路由，因此初始值也能配置字段 meta 或 UI props。
