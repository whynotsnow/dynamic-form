# DynamicForm 演示组件

本目录包含了 DynamicForm 组件的各种演示和示例，通过 `DemoSelector` 组件可以方便地切换查看不同的演示。

## 演示组件列表

### 1. 使用示例演示 (UsageExamplesDemo)

- **文件**: `UsageExamplesDemo.tsx`
- **描述**: 展示 DynamicForm 组件的不同使用方式和场景
- **包含示例**:
  - 基础使用（无UI封装）
  - 带UI封装的使用
  - 分组表单使用
  - 联动表单使用
  - 高级封装使用（FormRendererWrap）

### 2. 自定义处理器使用示例 (CustomHandlersUsageDemo)

- **文件**: `CustomHandlersUsageDemo.tsx`
- **描述**: 展示如何正确使用 useInitHandlers 来注册自定义处理器
- **包含示例**:
  - 使用默认处理器
  - 使用自定义处理器
  - 不使用自定义处理器
  - 条件性使用处理器
  - 使用内置示例处理器

### 3. 表单同步功能测试 (SyncTest)

- **文件**: `SyncTest.tsx`
- **描述**: 测试表单状态同步和依赖链效果

### 4. 渲染优化配置演示 (RenderOptimizationDemo)

- **文件**: `RenderOptimizationDemo.tsx`
- **描述**: 演示渲染优化的配置和效果

### 5. 性能对比演示 (PerformanceComparisonDemo)

- **文件**: `PerformanceComparisonDemo.tsx`
- **描述**: 对比不同配置下的性能表现

### 6. 日志样式测试 (TestLoggerStyle)

- **文件**: `testLoggerStyle.tsx`
- **描述**: 测试优化后的日志样式

### 7. 自定义处理器演示 (CustomHandlersDemo)

- **文件**: `customHandlersDemo.tsx`
- **描述**: 演示如何使用自定义的 EffectResultHandler

### 8. 配置管理演示 (ConfigManagementDemo)

- **文件**: `configManagementDemo.tsx`
- **描述**: 演示如何使用配置管理系统管理默认配置项

## 新增：RenderExtensionDemo - 渲染扩展能力演示

### 功能概述

`RenderExtensionDemo` 展示了 DynamicForm 组件的三种强大的渲染扩展能力，让开发者能够完全自定义表单的渲染逻辑和外观。

### 三种扩展能力

#### 1. 自定义组件注册 - 字段级自定义渲染

通过组件注册器注册自定义组件，实现字段级的完全自定义渲染。

```typescript
// 创建自定义组件
const CustomUsernameField: React.FC<FieldComponentProps> = ({ field, form, value }) => (
  <div>
    <Text strong>{field.label}</Text>
    <Tag color="blue">推荐</Tag>
    <Form.Item name={field.id}>
      <Input placeholder="请输入用户名" />
    </Form.Item>
  </div>
);

// 注册到组件注册器
const componentRegistry = {
  customComponents: {
    CustomUsername: CustomUsernameField
  }
};

// 在字段配置中使用
{
  id: 'username',
  component: 'CustomUsername', // 使用自定义组件
  label: '用户名'
}
```

**特点：**

- 通过组件注册器注册自定义组件
- 完全自定义字段的渲染逻辑
- 可以访问 field、form 和 value 对象
- 适合需要特殊样式的字段
- 符合组件化设计理念

#### 2. renderFieldItem - 字段项扩展渲染

在字段级别添加前置/后置内容，扩展单个字段而不改变其核心渲染逻辑。

```typescript
renderFieldItem={({ field, defaultRender }) => {
  if (field.id === 'username') {
    return (
      <div>
        {/* 前置扩展：添加说明 */}
        <div style={{ background: '#f0f9ff', padding: '8px' }}>
          💡 用户名将用于系统登录，建议使用英文和数字组合
        </div>

        {/* 原始字段渲染 */}
        {defaultRender}

        {/* 后置扩展：添加提示 */}
        <div style={{ fontSize: '12px', color: '#666' }}>
          长度建议：3-20个字符
        </div>
      </div>
    );
  }
  return defaultRender;
}}
```

**特点：**

- 在字段周围添加额外内容
- 保持原始字段的渲染逻辑
- 可以添加说明、提示、验证信息等
- 适合需要增强用户体验的字段

#### 3. renderFormInner - 表单级完全自定义

完全自定义整个表单的内容结构和布局，包括字段分组、自定义头部、自定义提交区域等。

```typescript
renderFormInner={({
  form,
  fields,
  renderFields,
  defaultSubmitArea
}) => {
  return (
    <div>
      {/* 自定义表单头部 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '16px',
        borderRadius: '12px'
      }}>
        <Title level={3}>🚀 高级表单渲染演示</Title>
      </div>

      {/* 自定义字段分组 */}
      <Card title="👤 基本信息">
        {renderFields([fields.username, fields.email])}
      </Card>

      {/* 自定义提交区域 */}
      <div style={{ background: '#f6f8fa', padding: '20px' }}>
        {defaultSubmitArea}
      </div>
    </div>
  );
}}
```

**特点：**

- 完全控制表单的整体布局
- 可以自定义字段分组方式
- 可以添加自定义头部、说明等
- 可以重新设计提交区域
- 适合需要特殊布局的表单

### 使用场景

#### 自定义组件注册适用于：

- 需要特殊样式的字段（如带图标的输入框）
- 需要自定义交互逻辑的字段
- 需要特殊验证提示的字段
- 需要复用复杂字段组件的场景

#### renderFieldItem 适用于：

- 为字段添加说明文字
- 为字段添加验证提示
- 为字段添加图标或标签
- 保持字段原有功能的同时增强用户体验

#### renderFormInner 适用于：

- 需要特殊布局的表单
- 需要字段分组的表单
- 需要自定义头部或说明的表单
- 需要重新设计提交区域的表单

### 组合使用

这三种扩展能力可以组合使用，实现更复杂的自定义需求：

1. 使用自定义组件注册实现字段级自定义渲染
2. 使用 `renderFieldItem` 为字段添加额外的说明和提示
3. 使用 `renderFormInner` 控制整体的布局和结构

### 注意事项

- 自定义组件注册是推荐的方式，符合组件化设计理念
- `renderFieldItem` 适合在字段周围添加内容，不会影响字段的核心功能
- `renderFormInner` 提供了最大的灵活性，但也需要更多的开发工作
- 三种方式可以同时使用，但要注意避免冲突

### 示例效果

运行此 demo 后，你将看到：

1. **用户名字段**：使用自定义组件注册，带有推荐标签和提示图标
2. **邮箱字段**：使用自定义组件注册，带有必填标签
3. **所有字段**：通过 `renderFieldItem` 添加了说明文字和提示信息
4. **整体布局**：通过 `renderFormInner` 实现了分组布局、自定义头部和提交区域

这个 demo 展示了 DynamicForm 组件的强大扩展能力，让开发者能够创建出完全符合业务需求的表单界面。

## 使用方法

### 通过 DemoSelector 使用

```tsx
import { DemoSelector } from './DynamicForm/demos';

const App = () => {
  return <DemoSelector defaultDemo="usageExamples" />;
};
```

### 直接使用特定演示组件

```tsx
import { UsageExamplesDemo, CustomHandlersUsageDemo } from './DynamicForm/demos';

const App = () => {
  return <UsageExamplesDemo />;
};
```

## 演示组件选择器

`DemoSelector` 组件提供了一个统一的选择界面，可以方便地切换不同的演示组件：

- 下拉菜单选择演示组件
- 显示当前演示组件的标题和描述
- 支持设置默认显示的演示组件

## 文件结构

```
demos/
├── DemoSelector.tsx              # 演示组件选择器
├── UsageExamplesDemo.tsx         # 使用示例演示
├── CustomHandlersUsageDemo.tsx   # 自定义处理器使用示例
├── SyncTest.tsx                  # 表单同步功能测试
├── RenderOptimizationDemo.tsx    # 渲染优化配置演示
├── PerformanceComparisonDemo.tsx # 性能对比演示
├── testLoggerStyle.tsx           # 日志样式测试
├── customHandlersDemo.tsx        # 自定义处理器演示
├── configManagementDemo.tsx      # 配置管理演示
├── index.ts                      # 统一导出
└── README.md                     # 说明文档
```

## 注意事项

1. **自定义处理器**: 使用自定义处理器时，需要在组件外部显式调用 `useInitHandlers`
2. **组件依赖**: 所有演示组件都依赖于 DynamicForm 的核心功能
3. **测试数据**: 演示组件使用了 `tests/testData.ts` 中的测试配置
4. **样式依赖**: 演示组件使用了 Ant Design 的组件和样式
