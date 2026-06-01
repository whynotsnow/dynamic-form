// 演示组件统一导出
export { default as StoreBoundaryDemo } from './storeBoundaryDemo';
export { default as DemoSelector } from './DemoSelector';
export { default as CustomHandlersDemo } from './customHandlersDemo';
export { default as CustomComponentsDemo } from './customComponentsDemo';
export { default as FormValidationDemo } from './formValidationDemo';
export { default as UIConfigDemo } from './uiConfigDemo';
export { default as RenderExtensionDemo } from './renderExtensionDemo';

// 演示组件类型定义
export interface DemoComponentProps {
  title?: string;
  description?: string;
}

// 演示组件配置
export const DEMO_COMPONENTS = {
  storeBoundary: {
    name: 'StoreBoundaryDemo',
    title: 'Store 边界验证',
    description: '验证字段值由 Ant Design Form 管理，effect 只更新字段值或 DynamicForm meta。',
    component: 'StoreBoundaryDemo'
  },
  customHandlers: {
    name: 'CustomHandlersDemo',
    title: '自定义处理器演示',
    description: '演示自定义 EffectResultHandler 如何更新 value、field meta 和动态样式。',
    component: 'CustomHandlersDemo'
  },
  customComponents: {
    name: 'CustomComponentsDemo',
    title: '自定义组件注册演示',
    description: '演示如何注册使用自定义组件和表单的详情页显示模式',
    component: 'CustomComponentsDemo'
  },
  formValidation: {
    name: 'FormValidationDemo',
    title: 'Form.Item 校验集成演示',
    description: '演示标准字段和 Form.List 复杂组件如何统一接入 Ant Design Form 校验。',
    component: 'FormValidationDemo'
  },
  uiConfig: {
    name: 'UIConfigDemo',
    title: 'UI配置演示',
    description: '演示静态 uiConfig 与 effect 返回的动态 UI 配置如何合并。',
    component: 'UIConfigDemo'
  },
  renderExtension: {
    name: 'RenderExtensionDemo',
    title: '渲染扩展能力演示',
    description: '演示自定义渲染参数和自定义组件注册的强大扩展能力',
    component: 'RenderExtensionDemo'
  }
} as const;

export type DemoType = keyof typeof DEMO_COMPONENTS;
