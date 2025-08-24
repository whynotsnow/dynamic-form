# DynamicForm 技术架构图

## 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    DynamicForm 组件架构                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Ant Design    │    │   React State   │    │  Effect     │ │
│  │     Form        │◄──►│   (useReducer)  │◄──►│  Engine     │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│           │                       │                   │         │
│           │                       │                   │         │
│           ▼                       ▼                   ▼         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │  FieldRegistry  │    │  useStateSync    │    │EffectResult │ │
│  │   Components    │    │   (Sync Hook)   │    │  Handler    │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 数据流图

### 用户输入流程

```
用户输入
    ↓
Ant Design Form.onValuesChange
    ↓
DynamicForm.handleFinishValuesChange
    ↓
useStateSync.syncFormStateToStore
    ↓
dispatch(SET_FIELD_VALUE)
    ↓
React State 更新
    ↓
Effect Engine 检测依赖
    ↓
执行 Effect 函数
    ↓
EffectResultHandler 处理结果
    ↓
dispatch(更新相关字段)
    ↓
useStateSync useEffect
    ↓
form.setFieldsValue
    ↓
组件重新渲染
```

### 双向同步机制

```
┌─────────────────┐              ┌─────────────────┐
│   Form Values   │              │  State Values   │
└─────────────────┘              └─────────────────┘
         │                                │
         │ Form → State                   │ State → Form
         ▼                                ▼
┌─────────────────┐              ┌─────────────────┐
│  handleForm     │              │  useEffect      │
│ ValuesChange    │              │  (State → Form) │
└─────────────────┘              └─────────────────┘
         │                                │
         │ 比较值并更新                    │ 比较值并更新
         ▼                                ▼
┌─────────────────┐              ┌─────────────────┐
│  dispatch       │              │ setFieldsValue  │
│ (SET_FIELD_VALUE)│              │                 │
└─────────────────┘              └─────────────────┘
```

## 核心组件职责

| 组件                         | 文件                               | 职责                         |
| ---------------------------- | ---------------------------------- | ---------------------------- |
| FormChainEffectEngineWrapper | `formChainEffectEngineWrapper.tsx` | 状态管理、Effect Engine 集成 |
| useStateSync                 | `useStateSync.ts`                  | 双向数据同步                 |
| EffectResultHandler          | `effectResultHandler.ts`           | Effect 结果处理              |
| FieldComponentRenderer       | `FieldComponentRenderer.tsx`       | 字段渲染                     |
| FieldComponentRegistry       | `FieldComponentRegistry.tsx`       | 字段组件注册                 |

## 状态管理

### FormState 结构

```typescript
interface FormState {
  fields: Record<string, BaseFieldConfig>; // 字段配置
  fieldValues: Record<string, any>; // 字段值
  initialized: boolean; // 初始化状态
}
```

### Reducer Actions

```typescript
type FormAction =
  | { type: 'INIT'; payload: { fields: Record<string, BaseFieldConfig> } }
  | { type: 'SET_FIELD_VALUE'; payload: { fieldId: string; value: any } }
  | { type: 'SET_FIELD_VALUES'; payload: Record<string, any> }
  | { type: 'UPDATE_META'; payload: { fieldId: string; meta: Partial<FieldMeta> } }
  | { type: 'SET_GROUP_META'; payload: { groupKey: string; meta: Partial<GroupMeta> } };
```

## 同步机制

### 防循环策略

1. **精确比较**: 只比较真正不同的值
2. **依赖控制**: 移除不必要的依赖
3. **延迟更新**: 使用 `requestAnimationFrame`

### 性能优化

1. **批量更新**: 收集变化后一次性更新
2. **渲染优化**: 使用 `React.memo` 和 `shouldUpdate`
3. **按需触发**: 只在依赖变化时触发 Effect

## 扩展点

### 字段类型扩展

```typescript
// 注册新字段类型
const FieldRegistry = {
  CustomField: ({ field, value, onChange, ...props }) => {
    return <CustomComponent value={value} onChange={onChange} {...props} />;
  }
};
```

### Effect 处理器扩展

```typescript
// 注册新处理器
registerEffectResultHandler({
  name: 'customHandler',
  canHandle: (key) => key === 'custom',
  handle: (context, value) => {
    /* 处理逻辑 */
  }
});
```

## 错误处理

### 常见问题

1. **循环引用警告**: 优化同步逻辑和依赖
2. **数据丢失**: 确保 reducer 正确使用展开运算符
3. **性能问题**: 启用渲染优化和精确更新

### 调试机制

1. **详细日志**: 关键节点添加日志
2. **数据追踪**: 完整的数据流追踪
3. **性能监控**: 渲染和同步性能监控
