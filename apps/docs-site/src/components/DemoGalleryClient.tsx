import React, { useEffect, useMemo, useState } from 'react';
import 'antd/dist/reset.css';
import { translate } from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import {
  DEMO_COMPONENTS,
  DEMO_GITHUB_SOURCE,
  DEMO_RELATED_COMPONENTS,
  DEMO_SOURCE_FILES,
  type DemoType
} from '../../../../demos/demoRegistry';
import DemoWrapper, { type DemoGuideItem } from './DemoWrapper';
import styles from './DemoGalleryClient.module.css';

const DEFAULT_DEMO: DemoType = 'storeBoundary';

const DEMO_TEXT: Record<DemoType, { title: string; description: string }> = {
  storeBoundary: {
    title: translate({
      id: 'demos.items.storeBoundary.title',
      message: 'Store 边界验证'
    }),
    description: translate({
      id: 'demos.items.storeBoundary.description',
      message: '验证字段值由 Ant Design Form 管理，effect 只更新字段值或 DynamicForm meta。'
    })
  },
  customHandlers: {
    title: translate({
      id: 'demos.items.customHandlers.title',
      message: '自定义处理器演示'
    }),
    description: translate({
      id: 'demos.items.customHandlers.description',
      message: '演示自定义 EffectResultHandler 如何更新 value、field meta 和动态样式。'
    })
  },
  customComponents: {
    title: translate({
      id: 'demos.items.customComponents.title',
      message: '自定义组件注册演示'
    }),
    description: translate({
      id: 'demos.items.customComponents.description',
      message: '演示如何注册自定义组件，并展示表单的详情页显示模式。'
    })
  },
  formValidation: {
    title: translate({
      id: 'demos.items.formValidation.title',
      message: 'Form.Item 校验集成演示'
    }),
    description: translate({
      id: 'demos.items.formValidation.description',
      message: '演示标准字段和 Form.List 复杂组件如何统一接入 Ant Design Form 校验。'
    })
  },
  uiConfig: {
    title: translate({
      id: 'demos.items.uiConfig.title',
      message: 'UI 配置演示'
    }),
    description: translate({
      id: 'demos.items.uiConfig.description',
      message: '演示静态 uiConfig 与 effect 返回的动态 UI 配置如何合并。'
    })
  },
  renderExtension: {
    title: translate({
      id: 'demos.items.renderExtension.title',
      message: '渲染扩展能力演示'
    }),
    description: translate({
      id: 'demos.items.renderExtension.description',
      message: '演示自定义渲染参数和自定义组件注册的扩展能力。'
    })
  },
  compilerFoundation: {
    title: translate({
      id: 'demos.items.compilerFoundation.title',
      message: '编译器基础演示'
    }),
    description: translate({
      id: 'demos.items.compilerFoundation.description',
      message: '演示如何把字段模块编译为标准 FormConfig，再交给 DynamicForm 渲染。'
    })
  },
  nodeModel4: {
    title: translate({
      id: 'demos.items.nodeModel4.title',
      message: '4.0 Node Model / Container 演示'
    }),
    description: translate({
      id: 'demos.items.nodeModel4.description',
      message:
        '演示 4.0 nodes、普通 container、嵌套 container、repeatable container、级联字段联动和跨层级 effect graph。'
    })
  },
  headlessRenderer: {
    title: translate({
      id: 'demos.items.headlessRenderer.title',
      message: 'Headless Renderer / Memory Adapter 演示'
    }),
    description: translate({
      id: 'demos.items.headlessRenderer.description',
      message:
        '演示 createMemoryFormAdapter、headlessRenderer、嵌套 name、隐藏字段和 render hooks 覆盖 defaultRender。'
    })
  }
};

const guideItem = (id: string, message: string): DemoGuideItem => ({
  text: translate({ id: `demos.guide.${id}`, message })
});

const DEMO_GUIDES: Record<DemoType, DemoGuideItem[]> = {
  storeBoundary: [
    guideItem('storeBoundary.employeeCount', '修改员工数量，观察控制台日志。'),
    guideItem(
      'storeBoundary.formValue',
      '检查字段值由 Ant Design Form 管理，effect 返回的 value 会写入 Form。'
    ),
    guideItem(
      'storeBoundary.meta',
      '观察 visible、disabled 等 effect meta 是否更新到 DynamicForm Store。'
    ),
    guideItem('storeBoundary.groupVisibility', '切换字段，验证分组显隐和地区选项联动。')
  ],
  customHandlers: [
    guideItem('customHandlers.name', '将姓名改为 admin，观察字段背景颜色变化。'),
    guideItem('customHandlers.age', '修改年龄，观察自定义数据转换处理器的结果。'),
    guideItem('customHandlers.email', '输入无效邮箱，观察邮箱备注字段隐藏和提交值清理。'),
    guideItem('customHandlers.status', '切换状态，观察链式样式和数据转换处理。')
  ],
  customComponents: [
    guideItem('customComponents.viewMode', '切换“控件禁用”和“自定义渲染”查看两种展示模式。'),
    guideItem('customComponents.visibility', '切换“显示额外信息”，验证自定义字段显隐联动。'),
    guideItem('customComponents.registry', '使用各个自定义字段并提交表单，查看注册组件的交互结果。')
  ],
  formValidation: [
    guideItem('formValidation.standard', '检查标准字段的必填、长度和邮箱格式校验。'),
    guideItem('formValidation.custom', '使用项目、成员或任务列表，验证 Form.List 复杂组件规则。'),
    guideItem('formValidation.actions', '点击“校验所有字段”查看错误提示，或重置表单恢复初始数据。')
  ],
  uiConfig: [
    guideItem('uiConfig.global', '切换状态字段，观察动态全局 UIConfig 的变化。'),
    guideItem('uiConfig.field', '修改优先级字段，观察字段级 UI 配置和校验规则。'),
    guideItem('uiConfig.priority', '对比字段级、动态全局和静态全局配置的合并优先级。')
  ],
  renderExtension: [
    guideItem('renderExtension.field', 'renderFieldItem 为单字段添加自定义外观。'),
    guideItem('renderExtension.fields', 'renderFields 为字段集合添加自定义容器。'),
    guideItem('renderExtension.group', 'renderGroupItem 自定义分组展示。'),
    guideItem('renderExtension.groups', 'renderGroups 将分组展示切换为 Tabs。'),
    guideItem('renderExtension.form', 'renderFormInner 自定义表单提交按钮。')
  ],
  compilerFoundation: [
    guideItem(
      'compilerFoundation.adapter',
      '查看 metadata adapter 如何转换为 mixed module config。'
    ),
    guideItem(
      'compilerFoundation.modules',
      '观察 TextField、DepartmentPicker 等模块如何编译为标准字段。'
    ),
    guideItem(
      'compilerFoundation.override',
      '选择 Engineering 显示审核分组，切换部门后观察分组显隐。'
    ),
    guideItem('compilerFoundation.submit', '提交表单后查看控制台中的编译结果。')
  ],
  nodeModel4: [
    guideItem(
      'nodeModel4.container',
      '关闭“企业客户”，验证企业信息整体隐藏且隐藏字段不进入提交值。'
    ),
    guideItem('nodeModel4.parentChild', '修改企业类型，观察嵌套地址用途的默认值和选项变化。'),
    guideItem('nodeModel4.cascade', '修改省份和城市，观察城市与区县的级联更新。'),
    guideItem('nodeModel4.crossLevel', '将城市改为非上海值，观察联系人列表跨层级隐藏与恢复。')
  ],
  headlessRenderer: [
    guideItem('headlessRenderer.fields', '修改嵌套的姓名和邮箱字段。'),
    guideItem('headlessRenderer.submit', '提交表单，查看 Memory Adapter 返回的提交值。'),
    guideItem('headlessRenderer.hidden', '检查隐藏字段和自定义 render hook 的渲染结果。')
  ]
};

const isDemoType = (value: string | null): value is DemoType => {
  return value != null && Object.prototype.hasOwnProperty.call(DEMO_COMPONENTS, value);
};

const readDemoFromUrl = (): DemoType => {
  if (typeof window === 'undefined') {
    return DEFAULT_DEMO;
  }

  const url = new URL(window.location.href);
  const requestedDemo = url.searchParams.get('demo');

  if (isDemoType(requestedDemo)) {
    return requestedDemo;
  }

  if (requestedDemo != null) {
    url.searchParams.set('demo', DEFAULT_DEMO);
    window.history.replaceState(null, '', url);
  }

  return DEFAULT_DEMO;
};

const writeDemoToUrl = (demoKey: DemoType) => {
  const url = new URL(window.location.href);
  url.searchParams.set('demo', demoKey);
  window.history.pushState(null, '', url);
};

interface DemoErrorBoundaryProps {
  children: React.ReactNode;
  demoTitle: string;
}

interface DemoErrorBoundaryState {
  error: Error | null;
}

class DemoErrorBoundary extends React.Component<DemoErrorBoundaryProps, DemoErrorBoundaryState> {
  state: DemoErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): DemoErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[DemoGalleryClient] demo render failed:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.demoError} role="alert">
          <h3>
            {translate({
              id: 'demos.error.title',
              message: '当前 demo 渲染失败'
            })}
          </h3>
          <p>
            {translate(
              {
                id: 'demos.error.description',
                message: '{demoTitle} 抛出了运行时错误，其他 demo 仍可继续查看。'
              },
              { demoTitle: this.props.demoTitle }
            )}
          </p>
          <pre>{this.state.error.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function DemoGalleryClient(): React.JSX.Element {
  const [currentDemo, setCurrentDemo] = useState<DemoType>(() => readDemoFromUrl());
  const demoEntries = useMemo(
    () => Object.entries(DEMO_COMPONENTS) as Array<[DemoType, (typeof DEMO_COMPONENTS)[DemoType]]>,
    []
  );
  const currentDemoInfo = DEMO_COMPONENTS[currentDemo];
  const currentDemoText = DEMO_TEXT[currentDemo];
  const CurrentDemo = currentDemoInfo.component;
  const sourceFiles = DEMO_SOURCE_FILES[currentDemo] ?? [];

  useEffect(() => {
    const handlePopState = () => {
      setCurrentDemo(readDemoFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleDemoChange = (demoKey: DemoType) => {
    if (demoKey === currentDemo) {
      return;
    }

    setCurrentDemo(demoKey);
    writeDemoToUrl(demoKey);
  };

  return (
    <div className="container">
      <div className={styles.shell}>
        <aside
          className={styles.sidebar}
          aria-label={translate({
            id: 'demos.client.sidebarLabel',
            message: 'DynamicForm demos'
          })}
        >
          <div className={styles.sidebarHeader}>
            <Heading as="h1">
              {translate({
                id: 'demos.client.title',
                message: 'demo演示'
              })}
            </Heading>
            <p>
              {translate({
                id: 'demos.client.description',
                message: '选择一个 demo 查看交互效果。'
              })}
            </p>
          </div>

          {demoEntries.map(([demoKey]) => (
            <button
              aria-current={demoKey === currentDemo ? 'page' : undefined}
              className={`${styles.demoButton} ${
                demoKey === currentDemo ? styles.demoButtonActive : ''
              }`}
              key={demoKey}
              onClick={() => handleDemoChange(demoKey)}
              type="button"
            >
              {DEMO_TEXT[demoKey].title}
            </button>
          ))}
        </aside>

        <section className={styles.content}>
          <DemoWrapper
            description={currentDemoText.description}
            guide={DEMO_GUIDES[currentDemo]}
            key={currentDemo}
            githubDemoPath={DEMO_GITHUB_SOURCE[currentDemo]}
            relatedComponentPaths={DEMO_RELATED_COMPONENTS[currentDemo] ?? []}
            sourceFiles={sourceFiles}
            title={currentDemoText.title}
          >
            <DemoErrorBoundary demoTitle={currentDemoText.title}>
              <CurrentDemo />
            </DemoErrorBoundary>
          </DemoWrapper>
        </section>
      </div>
    </div>
  );
}
