# DynamicForm 组件文档

## 概述

DynamicForm 是一个基于 React 和 Ant Design 的动态表单组件，支持复杂的表单联动、自定义处理器、状态管理和性能优化。

## 核心特性

- 🎯 **动态表单**: 支持字段联动和条件显示
- 🔧 **自定义处理器**: 可扩展的 Effect 结果处理器
- 📊 **状态管理**: 完整的状态管理和同步机制
- ⚡ **性能优化**: 批量更新和渲染优化
- 🎨 **样式定制**: 支持自定义样式和主题
- 📝 **类型安全**: 完整的 TypeScript 支持

## 快速开始

### 基础使用

```typescript
import DynamicForm from './component/DynamicForm';

const formConfig = {
  fields: [
    {
      id: 'name',
      label: '姓名',
      component: 'TextInput'
    },
    {
      id: 'age',
      label: '年龄',
      component: 'NumberInput'
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
      title: '基本信息',
      fields: [
        { id: 'name', label: '姓名', component: 'TextInput' },
        { id: 'email', label: '邮箱', component: 'TextInput' }
      ]
    },
    {
      title: '详细信息',
      fields: [
        { id: 'age', label: '年龄', component: 'NumberInput' },
        { id: 'address', label: '地址', component: 'TextInput' }
      ]
    }
  ]
};
```

## 文档导航

### 📚 核心文档

- [架构设计](./ARCHITECTURE.md) - 组件架构和设计理念
- [数据流](./DATA_FLOW.md) - 数据流向和处理机制
- [快速参考](./QUICK_REFERENCE.md) - 常用 API 和配置

### 🔧 功能文档

- [状态管理](./STATE_MANAGEMENT.md) - 状态结构和操作方法
- [状态操作](./STATE_OPERATIONS.md) - 具体的状态操作示例
- [批量更新](./BATCH_UPDATE.md) - 批量更新机制详解
- [自定义处理器](./CUSTOM_HANDLERS.md) - 自定义处理器开发指南

### 🎯 使用指南

- [表单配置](./FORM_CONFIG.md) - 表单配置详解
- [字段类型](./FIELD_TYPES.md) - 支持的字段类型
- [联动效果](./EFFECTS.md) - 字段联动配置
- [样式定制](./STYLING.md) - 样式和主题定制

### 🚀 高级功能

- [性能优化](./PERFORMANCE.md) - 性能优化策略
- [测试指南](./TESTING.md) - 测试和调试方法
- [扩展开发](./EXTENSION.md) - 组件扩展开发

## 组件结构

```
DynamicForm/
├── index.tsx                    # 主组件
├── formChainEffectEngineWrapper.tsx  # 包装器
├── fieldRenderer.tsx            # 字段渲染器
├── fieldRegistry.tsx            # 字段注册表
├── reducer.ts                   # 状态管理
├── effectResultHandler.ts       # 效果处理器
├── hooks/                       # 自定义 Hooks
│   ├── index.ts
│   ├── useFormState.ts
│   ├── useStateSync.ts
│   └── useFormChainContext.ts
├── types.ts                     # 类型定义
├── utils/                       # 工具函数
│   ├── logger.ts
│   └── utils.ts
├── examples/                    # 示例代码
│   ├── customHandlers.ts
│   └── customHandlersDemo.tsx
├── demos/                       # 演示组件
├── tests/                       # 测试文件
└── docs/                        # 文档
```

## 主要 API

### DynamicForm Props

```typescript
interface DynamicFormProps {
  formConfig: FormConfig; // 表单配置
  onSubmit: (data: Record<string, any>) => void; // 提交回调
  submitButtonText?: string; // 提交按钮文本
  customEffectResultHandlers?: CustomEffectResultHandlerConfig; // 自定义处理器
}
```

### 状态管理

```typescript
interface FormState {
  fields: Record<string, BaseFieldConfig>; // 字段配置
  fieldValues: Record<string, any>; // 字段值
  initialized: boolean; // 初始化状态
  configProcessInfo?: ConfigProcessInfo; // 配置信息
}
```

### 自定义处理器

```typescript
interface CustomEffectResultHandler {
  name: string; // 处理器名称
  description?: string; // 描述
  canHandle: (key: string, value: any) => boolean; // 处理条件
  validate?: (value: any) => boolean; // 验证函数
  handle: (context: EffectResultContext, value: any) => void; // 处理函数
}
```

## 开发指南

### 环境要求

- React 16.8+
- TypeScript 4.0+
- Ant Design 4.0+

### 安装依赖

```bash
npm install antd react react-dom
npm install --save-dev @types/react @types/react-dom
```

### 开发模式

```bash
npm start
```

### 构建

```bash
npm run build
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 更新日志

### v1.0.0

- 初始版本发布
- 支持基础动态表单功能
- 支持自定义处理器
- 支持状态管理
- 支持性能优化

---

更多详细信息请参考各子文档。
