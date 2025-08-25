# DynamicForm 组件文档

## 概述

**DynamicForm** 是一个基于 **React** 和 **Ant Design** 的动态表单组件，支持复杂的表单联动、自定义组件、自定义处理器、状态管理和性能优化。  
它旨在帮助开发者快速构建 **可配置化、可扩展** 的动态表单。

## 核心特性

- 🎯 **动态表单**：支持字段联动和条件渲染
- 🔧 **自定义处理器**：可扩展的 Effect 结果处理器
- 📊 **状态管理**：内置状态管理和数据同步机制
- ⚡ **性能优化**：批量更新与渲染优化
- 🎨 **样式定制**：支持自定义样式与主题
- 📝 **类型安全**：完整的 TypeScript 类型定义

---

## 快速开始

### 基础使用

```tsx
import { DynamicForm } from 'dynamic-form';

const formConfig = {
  fields: [
    { id: 'name', label: '姓名', component: 'TextInput' },
    { id: 'age', label: '年龄', component: 'NumberInput' }
  ]
};

export default function App() {
  return (
    <DynamicForm formConfig={formConfig} onSubmit={(values) => console.log('提交:', values)} />
  );
}
```

### 分组表单

```tsx
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

---

## 文档导航

> 📖 更详细的功能文档请查阅 [docs/](./docs)

### 📚 核心文档

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - 组件架构与设计理念
- [DATA_FLOW.md](./docs/DATA_FLOW.md) - 数据流与处理机制
- [Store层级模型与设计架构.md](./docs/Store层级模型与设计架构.md) - Store 层次结构
- [UI解耦.md](./docs/UI解耦.md) - UI 渲染与逻辑分离

### 🔧 功能文档

- [BATCH_UPDATE.md](./docs/BATCH_UPDATE.md) - 批量更新机制
- [EFFECTS.md](./docs/EFFECTS.md) - 字段联动效果
- [FIELD_TYPES.md](./docs/FIELD_TYPES.md) - 内置字段类型
- [FORM_CONFIG.md](./docs/FORM_CONFIG.md) - 表单配置
- [QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md) - 快速参考手册

---

## 项目结构

```
dynamic-form/
├── docs/                         # 文档
│   ├── ARCHITECTURE.md
│   ├── BATCH_UPDATE.md
│   ├── DATA_FLOW.md
│   ├── EFFECTS.md
│   ├── FIELD_TYPES.md
│   ├── FORM_CONFIG.md
│   ├── QUICK_REFERENCE.md
│   ├── Store层级模型与设计架构.md
│   └── UI解耦.md
├── src/
│   ├── components/               # 组件
│   │   ├── FormChainEffectEngineWrapper.tsx
│   │   ├── FormContent.tsx
│   │   ├── fieldComponentRegistry.tsx
│   │   ├── fieldComponentRenderer.tsx
│   │   └── index.tsx             # DynamicForm 主组件
│   ├── configProcessor/          # 配置处理器
│   │   ├── configParser.ts
│   │   ├── index.ts
│   │   └── types.ts
│   ├── hooks/                    # 自定义 hooks
│   │   ├── useFormChainContext.ts
│   │   ├── useInitHandlers.ts
│   │   ├── useStateSync.ts
│   │   ├── useStoreInit.ts
│   │   └── index.ts
│   ├── resultProcessor/          # 结果处理器
│   │   ├── batchUpdate.ts
│   │   ├── core.ts
│   │   ├── handlers.ts
│   │   ├── init.ts
│   │   ├── index.ts
│   │   └── types.ts
│   ├── utils/                    # 工具函数
│   ├── reducer.ts                # reducer
│   ├── exports.ts                # 对外导出
│   └── types.ts                  # 类型定义
├── demos/                        # 演示示例
└── package.json
```

---

## API 概览

### DynamicForm Props

```ts
interface DynamicFormProps {
  formConfig: FormConfig;
  onSubmit: (data: Record<string, any>) => void;
  submitButtonText?: string;
  customEffectResultHandlers?: CustomEffectResultHandlerConfig;
}
```

更多细节请参考 [FORM_CONFIG.md](./docs/FORM_CONFIG.md) 与 [EFFECTS.md](./docs/EFFECTS.md)。

---

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

### 开发

```bash
npm start
```

### 构建

```bash
npm run build
```

---

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送分支
5. 创建 Pull Request

---

## 许可证

MIT License

---

## 更新日志

### v1.0.0

- 初始版本
- 支持基础动态表单
- 支持分组表单
- 支持自定义处理器
- 支持状态管理与性能优化
