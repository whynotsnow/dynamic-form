// 演示组件统一导出
export { default as SyncTest } from './SyncTest';
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
  syncTest: {
    name: 'SyncTest',
    title: '表单同步功能测试',
    description: '测试表单状态同步和依赖链效果',
    component: 'SyncTest'
  },
  customHandlers: {
    name: 'CustomHandlersDemo',
    title: '自定义处理器演示',
    description: '演示如何使用自定义的 EffectResultHandler',
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
    description: '演示如何在 DynamicForm 中为自定义组件配置 Form.Item 校验规则，支持复杂校验。',
    component: 'FormValidationDemo'
  },
  uiConfig: {
    name: 'UIConfigDemo',
    title: 'UI配置演示',
    description: '演示如何通过uiConfig来配置antd组件的各种属性',
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
