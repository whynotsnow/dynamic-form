import type { ComponentType } from 'react';
import type { FormInstance } from 'antd';
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
  component: ComponentType<DemoComponentProps>;
  formControls: DemoFormControls;
}

export interface DemoComponentProps {
  form?: FormInstance;
  hideSubmitButton?: boolean;
}

export interface DemoFormControls {
  adapter: 'antd' | 'headless';
  actions: Array<'fill' | 'validate' | 'restore' | 'reset' | 'submit'>;
  fillValues?: Partial<Record<'zh-CN' | 'en', Record<string, unknown>>>;
}

const antdFormControls = (
  fillValues: Record<string, unknown>,
  fillValuesEn: Record<string, unknown> = fillValues,
  actions: DemoFormControls['actions'] = ['fill', 'validate', 'restore', 'reset', 'submit']
): DemoFormControls => ({
  adapter: 'antd',
  actions,
  fillValues: { 'zh-CN': fillValues, en: fillValuesEn }
});

export const DEMO_COMPONENTS = {
  storeBoundary: {
    name: 'StoreBoundaryDemo',
    title: 'Store 边界验证',
    description:
      '用生鲜供应商资料验证字段值由 Ant Design Form 管理，effect 只更新字段值或 DynamicForm meta。',
    component: StoreBoundaryDemo,
    formControls: antdFormControls({ businessType: 'manufacturer', employeeCount: 86 })
  },
  customHandlers: {
    name: 'CustomHandlersDemo',
    title: '自定义处理器演示',
    description:
      '以独立字段练习场演示自定义 EffectResultHandler 如何更新 value、field meta 和动态样式；示例不对应单一业务流程。',
    component: CustomHandlersDemo,
    formControls: antdFormControls(
      { name: '演示用户', age: 28, email: 'demo@example.com' },
      { name: 'Demo User', age: 28, email: 'demo@example.com' }
    )
  },
  customComponents: {
    name: 'CustomComponentsDemo',
    title: '自定义组件注册演示',
    description:
      '通过自定义组件示例演示组件注册和表单详情页显示模式；字段用于展示组件能力，不对应单一业务流程。',
    component: CustomComponentsDemo,
    formControls: antdFormControls(
      { name: '林晓', age: 29, category: 'fruit', quantity: 12 },
      { name: 'Lin Xiao', age: 29, category: 'fruit', quantity: 12 }
    )
  },
  formValidation: {
    name: 'FormValidationDemo',
    title: 'Form.Item 校验集成演示',
    description: '演示标准字段和 Form.List 复杂组件如何统一接入 Ant Design Form 校验。',
    component: FormValidationDemo,
    formControls: antdFormControls(
      {
        name: '林晓',
        email: 'lin.xiao@example.com',
        projects: [
          {
            name: '管理后台升级',
            description: '更新供应商管理流程',
            members: [{ name: '周宁', role: '负责人', email: 'zhou.ning@example.com' }],
            tasks: []
          }
        ],
        targetPlatforms: ['web'],
        techStack: ['react']
      },
      {
        name: 'Lin Xiao',
        email: 'lin.xiao@example.com',
        projects: [
          {
            name: 'Admin Portal Upgrade',
            description: 'Update supplier management workflow',
            members: [{ name: 'Zhou Ning', role: 'Owner', email: 'zhou.ning@example.com' }],
            tasks: []
          }
        ],
        targetPlatforms: ['web'],
        techStack: ['react']
      },
      ['validate', 'restore', 'reset', 'submit']
    )
  },
  uiConfig: {
    name: 'UIConfigDemo',
    title: 'UI 配置演示',
    description: '以工单处理表单演示静态 uiConfig 与 effect 返回的动态 UI 配置如何合并。',
    component: UIConfigDemo,
    formControls: antdFormControls(
      {
        title: '更新供应商资料',
        requester: '林晓',
        status: 'in_progress'
      },
      {
        title: 'Update supplier details',
        requester: 'Lin Xiao',
        status: 'in_progress'
      }
    )
  },
  renderExtension: {
    name: 'RenderExtensionDemo',
    title: '渲染扩展能力演示',
    description: '演示自定义渲染参数和自定义组件注册的扩展能力。',
    component: RenderExtensionDemo,
    formControls: antdFormControls({ username: 'demo-user', email: 'demo@example.com', age: 32 })
  },
  compilerFoundation: {
    name: 'CompilerFoundationDemo',
    title: '编译器基础演示',
    description:
      '演示 metadata adapter 如何把申请字段模块转换为标准 FormConfig，再由 DynamicForm 渲染。',
    component: CompilerFoundationDemo,
    formControls: antdFormControls(
      {
        ownerDepartment: 'engineering',
        requestTitle: '供应商资料接入'
      },
      {
        ownerDepartment: 'engineering',
        requestTitle: 'Supplier data integration'
      }
    )
  },
  nodeModel4: {
    name: 'NodeModel4Demo',
    title: '4.0 Node Model / Container 演示',
    description:
      '演示 4.0 nodes、普通 container、嵌套 container、repeatable container、级联字段联动和跨层级 effect graph；企业客户开关控制企业资料与联系人。',
    component: NodeModel4Demo,
    formControls: antdFormControls(
      {
        isCompany: true,
        contacts: [{ contactName: '周宁', contactPhone: '13800000001' }]
      },
      {
        isCompany: true,
        contacts: [{ contactName: 'Zhou Ning', contactPhone: '13800000001' }]
      }
    )
  },
  headlessRenderer: {
    name: 'HeadlessRendererDemo',
    title: 'Headless Renderer / Memory Adapter 演示',
    description:
      '演示 createMemoryFormAdapter、headlessRenderer、嵌套 name、隐藏字段和 render hooks 覆盖 defaultRender。',
    component: HeadlessRendererDemo,
    formControls: { adapter: 'headless', actions: [] }
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
