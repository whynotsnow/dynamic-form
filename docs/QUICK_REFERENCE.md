# DynamicForm 快速参考指南

## 🚀 快速开始

### 基础使用

```typescript
import DynamicForm from 'dynamic-form';

const formConfig = {
  fields: [
    {
      id: 'username',
      label: '用户名',
      component: 'TextInput',
      required: true
    },
    {
      id: 'age',
      label: '年龄',
      component: 'NumberInput',
      span: 8
    }
  ]
};

const App = () => (
  <DynamicForm
    formConfig={formConfig}
    onSubmit={(values) => console.log('提交:', values)}
  />
);
```

### 分组表单

```typescript
const groupedConfig = {
  groups: [
    {
      id: 'basic',
      title: '基本信息',
      fields: [
        { id: 'name', label: '姓名', component: 'TextInput' },
        { id: 'email', label: '邮箱', component: 'TextInput' }
      ]
    },
    {
      id: 'detail',
      title: '详细信息',
      fields: [
        { id: 'age', label: '年龄', component: 'NumberInput' },
        { id: 'address', label: '地址', component: 'TextInput' }
      ]
    }
  ]
};
```

## 📋 核心 API

### DynamicForm Props

```typescript
interface DynamicFormProps {
  // 必需属性
  formConfig: FormConfig;                    // 表单配置
  form: FormInstance;                       // Ant Design Form实例
  onSubmit: (data: Record<string, any>) => void; // 提交回调
  
  // 可选属性
  submitButtonText?: string;                 // 提交按钮文本
  componentRegistry?: ComponentRegistry;      // 自定义组件注册
  uiConfig?: UIConfig;                       // UI配置
  values?: Record<string, any>;              // 初始值
  
  // 渲染扩展
  renderFormInner?: (params: RenderFormParams) => ReactNode;
  renderGroups?: (params: RenderGroupsParams) => ReactNode;
  renderGroupItem?: (params: RenderGroupItemParams) => ReactNode;
  renderFields?: (params: RenderFieldsParams) => ReactNode;
  renderFieldItem?: (params: RenderFieldItemParams) => ReactNode;
  
  // 配置检查
  enableInitializationCheck?: boolean;       // 启用初始化检查
  checkDelay?: number;                       // 检查延迟时间
}
```

### 字段配置

```typescript
interface BaseFieldConfig {
  id: string;                                // 字段ID（必需）
  component: FieldComponentType;             // 组件类型（必需）
  label?: string;                            // 标签文本
  required?: boolean;                        // 是否必填
  span?: number;                             // 栅格列数
  
  // 初始值配置
  initialValue?: any | ((allValues: Record<string, any>) => any);
  initialVisible?: boolean;                  // 初始可见性
  initialDisabled?: boolean;                 // 初始禁用状态
  
  // 联动配置
  dependents?: string[];                     // 依赖字段
  effect?: EffectFn;                         // 联动效果函数
  
  // 样式和验证
  style?: React.CSSProperties;               // 样式
  rules?: Rule[];                            // 验证规则
  
  // 组件属性
  formItemProps?: FormItemProps;             // Form.Item属性
  componentProps?: Record<string, any>;      // 组件属性
}
```

## 🎯 支持的字段类型

### 内置组件

| 组件类型 | 描述 | 示例 |
|---------|------|------|
| `TextInput` | 文本输入框 | 用户名、邮箱等 |
| `NumberInput` | 数字输入框 | 年龄、数量等 |
| `Password` | 密码输入框 | 密码、确认密码 |
| `SelectField` | 下拉选择框 | 性别、城市等 |
| `DatePicker` | 日期选择器 | 生日、入职日期等 |
| `Switch` | 开关组件 | 是否启用等 |
| `Rate` | 评分组件 | 满意度评分等 |
| `TextDisplay` | 文本显示 | 只读信息显示 |

### 自定义组件

```typescript
// 注册自定义组件
const componentRegistry = {
  customComponents: {
    CustomField: CustomFieldComponent
  }
};

// 在字段配置中使用
{
  id: 'custom',
  component: 'CustomField',
  label: '自定义字段'
}
```

## 🔗 字段联动

### 基础联动

```typescript
{
  id: 'businessType',
  label: '企业类型',
  component: 'SelectField',
  componentProps: {
    options: [
      { label: '小型企业', value: 'small' },
      { label: '中型企业', value: 'medium' },
      { label: '大型企业', value: 'large' }
    ]
  }
},
{
  id: 'employeeCount',
  label: '员工数量',
  component: 'NumberInput',
  dependents: ['businessType'],
  effect: ({ businessType }) => {
    if (businessType === 'small') return { value: 50 };
    if (businessType === 'medium') return { value: 200 };
    if (businessType === 'large') return { value: 1000 };
    return { value: undefined };
  }
}
```

### 复杂联动

```typescript
{
  id: 'companySize',
  label: '企业规模',
  component: 'TextDisplay',
  dependents: ['employeeCount'],
  effect: ({ employeeCount }) => {
    if (!employeeCount) return { visible: false };
    
    let size = '';
    if (employeeCount < 100) size = '小型企业';
    else if (employeeCount < 500) size = '中型企业';
    else size = '大型企业';
    
    return {
      value: size,
      visible: true,
      componentProps: {
        style: { color: size === '大型企业' ? 'red' : 'black' }
      }
    };
  }
}
```

## 🎨 UI 配置

### 全局UI配置

```typescript
const uiConfig = {
  rowProps: { gutter: 16 },                 // Row组件属性
  colProps: { span: 12 },                   // Col组件属性
  formProps: { layout: 'vertical' },        // Form组件属性
  cardProps: { title: '表单标题' },         // Card组件属性
  submitButtonProps: { type: 'primary' }    // 提交按钮属性
};
```

### 字段级UI配置

```typescript
{
  id: 'description',
  label: '描述',
  component: 'TextInput',
  span: 24,                                 // 占满整行
  formItemProps: {                          // Form.Item属性
    labelCol: { span: 6 },
    wrapperCol: { span: 18 }
  },
  componentProps: {                          // 组件属性
    type: 'textarea',
    rows: 4,
    placeholder: '请输入详细描述'
  }
}
```

## ⚡ 性能优化

### 批量更新

```typescript
// 在 effect 中返回多个字段更新
effect: ({ value }) => {
  return {
    'field1': { value: value * 2 },
    'field2': { value: value * 3 },
    'field3': { visible: value > 100 }
  };
}
```

### 初始化检查

```typescript
import { useInitHandlers } from 'dynamic-form';

const App = () => {
  const { isInitialized } = useInitHandlers(formConfig);
  
  if (!isInitialized) return <div>初始化中...</div>;
  
  return <DynamicForm formConfig={formConfig} />;
};
```

## 🔧 自定义处理器

### 注册自定义处理器

```typescript
import { useInitHandlers } from 'dynamic-form';

const customHandlers = {
  customHandler: {
    name: 'customHandler',
    canHandle: (key: string) => key === 'custom',
    handle: (context, value) => {
      // 自定义处理逻辑
      context.dispatch({
        type: 'SET_FIELD_VALUE',
        payload: { fieldId: 'target', value: value * 2 }
      });
    }
  }
};

const App = () => {
  useInitHandlers(formConfig, { customHandlers });
  
  return <DynamicForm formConfig={formConfig} />;
};
```

## 📝 常用配置模式

### 表单验证

```typescript
{
  id: 'email',
  label: '邮箱',
  component: 'TextInput',
  required: true,
  rules: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' }
  ]
}
```

### 条件显示

```typescript
{
  id: 'optionalField',
  label: '可选字段',
  component: 'TextInput',
  dependents: ['showOptional'],
  effect: ({ showOptional }) => ({
    visible: showOptional === true
  })
}
```

### 动态标签

```typescript
{
  id: 'dynamicLabel',
  component: 'TextInput',
  dependents: ['labelType'],
  effect: ({ labelType }) => ({
    label: labelType === 'A' ? '类型A' : '类型B'
  })
}
```

## 🚨 常见问题

### Q: 字段联动不生效？
A: 检查 `dependents` 和 `effect` 配置是否正确，确保依赖字段存在。

### Q: 自定义组件不显示？
A: 检查组件注册是否正确，确保 `componentRegistry` 配置正确。

### Q: 性能问题？
A: 使用批量更新，避免在 effect 中频繁更新状态。

### Q: 初始化警告？
A: 在组件顶层使用 `useInitHandlers` 钩子。

## 📚 相关文档

- [完整API文档](./index.md) - 查看所有可用选项
- [架构设计](./ARCHITECTURE.md) - 了解组件架构
- [数据流](./DATA_FLOW.md) - 理解数据流向
- [自定义处理器](./CUSTOM_HANDLERS.md) - 开发自定义处理器
- [性能优化](./PERFORMANCE.md) - 性能调优指南
