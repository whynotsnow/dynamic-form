import type { ComponentType } from 'react';
import StoreBoundaryDemo from './storeBoundaryDemo';
import CustomHandlersDemo from './customHandlersDemo';
import CustomComponentsDemo from './customComponentsDemo';
import FormValidationDemo from './formValidationDemo';
import UIConfigDemo from './uiConfigDemo';
import RenderExtensionDemo from './renderExtensionDemo';
import CompilerFoundationDemo from './compilerFoundationDemo';

export interface DemoDefinition {
  name: string;
  title: string;
  description: string;
  component: ComponentType;
}

export const DEMO_COMPONENTS = {
  storeBoundary: {
    name: 'StoreBoundaryDemo',
    title: 'Store 边界验证',
    description: '验证字段值由 Ant Design Form 管理，effect 只更新字段值或 DynamicForm meta。',
    component: StoreBoundaryDemo
  },
  customHandlers: {
    name: 'CustomHandlersDemo',
    title: '自定义处理器演示',
    description: '演示自定义 EffectResultHandler 如何更新 value、field meta 和动态样式。',
    component: CustomHandlersDemo
  },
  customComponents: {
    name: 'CustomComponentsDemo',
    title: '自定义组件注册演示',
    description: '演示如何注册自定义组件，并展示表单的详情页显示模式。',
    component: CustomComponentsDemo
  },
  formValidation: {
    name: 'FormValidationDemo',
    title: 'Form.Item 校验集成演示',
    description: '演示标准字段和 Form.List 复杂组件如何统一接入 Ant Design Form 校验。',
    component: FormValidationDemo
  },
  uiConfig: {
    name: 'UIConfigDemo',
    title: 'UI 配置演示',
    description: '演示静态 uiConfig 与 effect 返回的动态 UI 配置如何合并。',
    component: UIConfigDemo
  },
  renderExtension: {
    name: 'RenderExtensionDemo',
    title: '渲染扩展能力演示',
    description: '演示自定义渲染参数和自定义组件注册的扩展能力。',
    component: RenderExtensionDemo
  },
  compilerFoundation: {
    name: 'CompilerFoundationDemo',
    title: 'Compiler Foundation 编译器基础演示 / Compiler Foundation Demo',
    description:
      '演示如何把字段模块编译为标准 FormConfig，再交给 DynamicForm 渲染。 / Compiles field modules into standard FormConfig before rendering with DynamicForm.',
    component: CompilerFoundationDemo
  }
} satisfies Record<string, DemoDefinition>;

export type DemoType = keyof typeof DEMO_COMPONENTS;
