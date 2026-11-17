import type { ComponentType } from 'react';
import { demoSourceEntries } from './demoSources/index';
import StoreBoundaryDemo from './storeBoundaryDemo';
import CustomHandlersDemo from './customHandlersDemo';
import CustomComponentsDemo from './customComponentsDemo';
import FormValidationDemo from './formValidationDemo';
import UIConfigDemo from './uiConfigDemo';
import RenderExtensionDemo from './renderExtensionDemo';
import CompilerFoundationDemo from './compilerFoundationDemo';
import NodeModel4Demo from './nodeModel4Demo';
import HeadlessRendererDemo from './headlessRendererDemo';

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
    description:
      '用生鲜供应商资料验证字段值由 Ant Design Form 管理，effect 只更新字段值或 DynamicForm meta。',
    component: StoreBoundaryDemo
  },
  customHandlers: {
    name: 'CustomHandlersDemo',
    title: '自定义处理器演示',
    description:
      '以独立字段练习场演示自定义 EffectResultHandler 如何更新 value、field meta 和动态样式；示例不对应单一业务流程。',
    component: CustomHandlersDemo
  },
  customComponents: {
    name: 'CustomComponentsDemo',
    title: '自定义组件注册演示',
    description:
      '通过自定义组件示例演示组件注册和表单详情页显示模式；字段用于展示组件能力，不对应单一业务流程。',
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
    description: '以工单处理表单演示静态 uiConfig 与 effect 返回的动态 UI 配置如何合并。',
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
    title: '编译器基础演示',
    description:
      '演示 metadata adapter 如何把申请字段模块转换为标准 FormConfig，再由 DynamicForm 渲染。',
    component: CompilerFoundationDemo
  },
  nodeModel4: {
    name: 'NodeModel4Demo',
    title: '4.0 Node Model / Container 演示',
    description:
      '演示 4.0 nodes、普通 container、嵌套 container、repeatable container、级联字段联动和跨层级 effect graph；企业客户开关控制企业资料与联系人。',
    component: NodeModel4Demo
  },
  headlessRenderer: {
    name: 'HeadlessRendererDemo',
    title: 'Headless Renderer / Memory Adapter 演示',
    description:
      '演示 createMemoryFormAdapter、headlessRenderer、嵌套 name、隐藏字段和 render hooks 覆盖 defaultRender。',
    component: HeadlessRendererDemo
  }
} satisfies Record<string, DemoDefinition>;

export type DemoType = keyof typeof DEMO_COMPONENTS;

export interface DemoSourceFile {
  path: string;
  content: string;
}

export interface LocalizedDemoSourceFile {
  path: string;
  content: Record<'zh-CN' | 'en', string>;
}

export interface DemoSourceEntry {
  sourceFiles: LocalizedDemoSourceFile[];
  githubDemoPath: string;
  relatedComponents: string[];
  presentationDescription?: Record<'zh-CN' | 'en', string>;
}

const typedDemoSourceEntries = demoSourceEntries as Record<DemoType, DemoSourceEntry>;

export const DEMO_SOURCE_FILES = Object.fromEntries(
  Object.entries(typedDemoSourceEntries).map(([demoType, entry]) => [
    demoType,
    {
      'zh-CN': entry.sourceFiles.map(({ path, content }) => ({ path, content: content['zh-CN'] })),
      en: entry.sourceFiles.map(({ path, content }) => ({ path, content: content.en }))
    }
  ])
) as Record<DemoType, Record<'zh-CN' | 'en', DemoSourceFile[]>>;

export const DEMO_RELATED_COMPONENTS = Object.fromEntries(
  Object.entries(typedDemoSourceEntries).map(([demoType, entry]) => [
    demoType,
    entry.relatedComponents
  ])
) as Record<DemoType, string[]>;

export const DEMO_GITHUB_SOURCE = Object.fromEntries(
  Object.entries(typedDemoSourceEntries).map(([demoType, entry]) => [
    demoType,
    entry.githubDemoPath
  ])
) as Record<DemoType, string>;

export const DEMO_PRESENTATION_DESCRIPTIONS = Object.fromEntries(
  Object.entries(typedDemoSourceEntries)
    .filter(([, entry]) => entry.presentationDescription)
    .map(([demoType, entry]) => [demoType, entry.presentationDescription])
) as Partial<Record<DemoType, Record<'zh-CN' | 'en', string>>>;
