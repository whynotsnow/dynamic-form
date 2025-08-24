# DynamicForm 数据流时序图

## 完整数据流时序

### 1. 用户输入触发流程

```
时间轴: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8

T1: 用户输入 "300" 到 employeeCount 字段
    ↓
T2: Ant Design Form 触发 onValuesChange
    - changedValues: { employeeCount: 300 }
    - allValues: { businessType: undefined, employeeCount: 300, ... }
    ↓
T3: DynamicForm.handleFinishValuesChange
    - 调用 syncFormStateToStore
    - 调用 onValuesChange (Effect Engine)
    ↓
T4: useStateSync.syncFormStateToStore
    - 比较: State(undefined) !== Form(300)
    - 执行: dispatch(SET_FIELD_VALUE)
    ↓
T5: React State 更新
    - state.fieldValues: { employeeCount: 300 }
    ↓
T6: Effect Engine 检测到依赖变化
    - 执行 employeeCount effect
    - 返回: { value: 600 }
    ↓
T7: EffectResultHandler 处理结果
    - 调用 value 处理器
    - 执行: dispatch(SET_FIELD_VALUE, { fieldId: 'employeeCount', value: 600 })
    ↓
T8: State 再次更新
    - state.fieldValues: { employeeCount: 600 }
    ↓
T9: useStateSync useEffect 触发
    - 比较: Form(300) !== State(600)
    - 执行: form.setFieldsValue({ employeeCount: 600 })
    ↓
T10: 组件重新渲染
    - FieldRegistry 组件接收到新值
    - 页面显示 "600"
```

### 2. 关联字段更新流程

```
时间轴: T8 → T9 → T10 → T11 → T12

T8: State 更新后，Effect Engine 继续执行
    - 检测到 companySize 依赖 employeeCount
    - 执行 companySize effect
    - 返回: { value: '大型企业' }
    ↓
T9: EffectResultHandler 处理 companySize 结果
    - 调用 value 处理器
    - 执行: dispatch(SET_FIELD_VALUE, { fieldId: 'companySize', value: '大型企业' })
    ↓
T10: State 再次更新
    - state.fieldValues: { employeeCount: 600, companySize: '大型企业' }
    ↓
T11: useStateSync useEffect 再次触发
    - 比较: Form(undefined) !== State('大型企业')
    - 执行: form.setFieldsValue({ companySize: '大型企业' })
    ↓
T12: 组件重新渲染
    - companySize 字段显示 "大型企业"
```

## 同步机制详解

### Form → State 同步

```typescript
// 触发时机: 用户输入
const syncFormStateToStore = (changedValues, allValues) => {
  Object.entries(changedValues).forEach(([fieldId, value]) => {
    const currentStateValue = state.fieldValues[fieldId];

    // 关键: 精确比较避免循环
    if (currentStateValue !== value) {
      dispatch({
        type: 'SET_FIELD_VALUE',
        payload: { fieldId, value }
      });
    }
  });
};
```

### State → Form 同步

```typescript
// 触发时机: state.fieldValues 变化
useEffect(() => {
  const formValues = form.getFieldsValue();
  const stateValues = state.fieldValues;

  const valuesToUpdate = {};
  Object.entries(stateValues).forEach(([fieldId, value]) => {
    const formValue = formValues[fieldId];

    // 关键: 精确比较避免循环
    if (formValue !== value) {
      valuesToUpdate[fieldId] = value;
    }
  });

  if (Object.keys(valuesToUpdate).length > 0) {
    form.setFieldsValue(valuesToUpdate);
  }
}, [state.fieldValues]); // 关键: 只依赖 fieldValues
```

## 防循环机制

### 1. 值比较策略

```typescript
// 使用严格相等比较
if (currentStateValue !== value) {
  // 只有真正不同时才更新
}
```

### 2. 依赖控制

```typescript
// 只依赖必要的状态
useEffect(() => {
  // 同步逻辑
}, [state.fieldValues]); // 不依赖 form 实例
```

### 3. 批量更新

```typescript
// 收集所有变化后一次性更新
const valuesToUpdate = {};
// ... 收集变化
if (hasChanges) {
  form.setFieldsValue(valuesToUpdate);
}
```

## 性能优化策略

### 1. 渲染优化

```typescript
// FieldComponentRenderer 使用 React.memo
const FieldComponentRenderer = React.memo(
  ({ field, form }) => {
    // 渲染逻辑
  },
  (prevProps, nextProps) => {
    // 精确的 shouldUpdate 逻辑
    return (
      prevProps.field.id !== nextProps.field.id ||
      prevProps.field.meta?.visible !== nextProps.field.meta?.visible
    );
  }
);
```

### 2. 同步优化

```typescript
// 只同步真正变化的字段
Object.entries(changedValues).forEach(([fieldId, value]) => {
  const currentStateValue = state.fieldValues[fieldId];
  if (currentStateValue !== value) {
    // 只有不同时才更新
  }
});
```

### 3. Effect 优化

```typescript
// 按需触发 Effect
const { onValuesChange } = useFormChainEffectEngine({
  form,
  config: effectMap,
  options: {
    enableAdvancedControl: true,
    debugLog: false
  }
});
```

## 错误处理流程

### 1. Effect 执行错误

```typescript
onEffectResult({ fieldName, result, chain }) {
  try {
    handleEffectResult(result, context);
  } catch (error) {
    console.error(`Effect 执行错误: ${fieldName}`, error);
    // 优雅降级处理
  }
}
```

### 2. 同步错误

```typescript
const syncFormStateToStore = (changedValues, allValues) => {
  try {
    // 同步逻辑
  } catch (error) {
    console.error('Form → State 同步错误:', error);
    // 错误恢复机制
  }
};
```

### 3. 渲染错误

```typescript
// 使用错误边界
<ErrorBoundary>
  <FieldComponentRenderer field={field} form={form} />
</ErrorBoundary>
```

## 调试信息

### 关键日志点

1. **用户输入**: `[DynamicForm] 表单值变化`
2. **Form → State**: `[useStateSync] Form → State 同步`
3. **State → Form**: `[useStateSync] 字段 ${fieldId}: Form(${formValue}) → State(${value})`
4. **Effect 执行**: `[formChainEffectEngineWrapper] effect 执行完成`
5. **结果处理**: `[effectResultHandler] 处理 effect 返回值`
6. **组件渲染**: `[FieldRegistry] ${componentType} 组件渲染`

### 性能监控

```typescript
// 渲染性能监控
console.log(`[FieldRenderer] 字段 ${field.id}: ${shouldRender ? '渲染' : '跳过渲染'}`);

// 同步性能监控
console.log(`[useStateSync] 已更新字段:`, updatedFields);
```

## 总结

DynamicForm 的数据流设计遵循以下原则：

1. **单向数据流**: 用户输入 → Form → State → Effect → State → Form → UI
2. **精确同步**: 只更新真正变化的字段
3. **防循环**: 通过值比较和依赖控制避免无限循环
4. **性能优化**: 批量更新、渲染优化、按需触发
5. **错误处理**: 完善的错误边界和恢复机制

这种设计确保了复杂表单的高效运行和良好的用户体验。
