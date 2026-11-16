import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import 'antd/dist/reset.css';
import { translate } from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import { DEMO_COMPONENTS, DEMO_SOURCE_FILES, type DemoType } from '../../../../demos/demoRegistry';
import SiteCodeBlock from './SiteCodeBlock';
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

interface DemoSourcePanelProps {
  sourceFiles: Array<{ path: string; content: string }>;
}

function DemoSourcePanel({ sourceFiles }: DemoSourcePanelProps): React.JSX.Element | null {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const idPrefix = useId().replace(/:/g, '');

  if (sourceFiles.length === 0) {
    return null;
  }

  const activeFile = sourceFiles[activeFileIndex] ?? sourceFiles[0];
  const activeSource = `// 文件路径: ${activeFile.path}\n${activeFile.content.trim()}`;
  const tabIds = sourceFiles.map((_, index) => `${idPrefix}-tab-${index}`);
  const panelId = `${idPrefix}-tab-panel`;

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % sourceFiles.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + sourceFiles.length) % sourceFiles.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = sourceFiles.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      setActiveFileIndex(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <details className={styles.sourcePanel} open>
      <summary>
        {translate({
          id: 'demos.sourcePanel.open',
          message: '查看示例源码'
        })}
      </summary>
      {sourceFiles.length > 1 ? (
        <>
          <p className={styles.sourceHint}>
            {translate({
              id: 'demos.sourcePanel.multiFileHint',
              message: '切换文件标签查看源码；复制操作只会复制当前文件。'
            })}
          </p>
          <div
            aria-label={translate({
              id: 'demos.sourcePanel.fileTabsLabel',
              message: '示例源码文件'
            })}
            className={styles.sourceTabs}
            role="tablist"
          >
            {sourceFiles.map((file, index) => {
              const fileName = file.path.split('/').pop() ?? file.path;
              const tabId = tabIds[index];

              return (
                <button
                  aria-controls={panelId}
                  aria-selected={index === activeFileIndex}
                  className={styles.sourceTab}
                  id={tabId}
                  key={file.path}
                  onClick={() => setActiveFileIndex(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  role="tab"
                  tabIndex={index === activeFileIndex ? 0 : -1}
                  title={file.path}
                  type="button"
                >
                  {fileName}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
      <div
        aria-labelledby={sourceFiles.length > 1 ? tabIds[activeFileIndex] : undefined}
        className={styles.sourceTabPanel}
        id={sourceFiles.length > 1 ? panelId : undefined}
        role={sourceFiles.length > 1 ? 'tabpanel' : undefined}
        tabIndex={sourceFiles.length > 1 ? 0 : undefined}
      >
        <SiteCodeBlock
          className={styles.sourceCodeBlock}
          code={activeSource}
          copyCode={activeSource}
          copyLabel={
            sourceFiles.length > 1
              ? translate({
                  id: 'siteCodeBlock.copyCurrentFile',
                  message: '复制当前文件'
                })
              : undefined
          }
          key={activeFile.path}
          language="tsx"
        />
      </div>
    </details>
  );
}

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
          <header className={styles.intro}>
            <Heading as="h2">{currentDemoText.title}</Heading>
            <p>{currentDemoText.description}</p>
          </header>

          <div className={styles.demoFrame}>
            <div className={styles.demoSandbox}>
              <DemoErrorBoundary demoTitle={currentDemoText.title} key={currentDemo}>
                <CurrentDemo />
              </DemoErrorBoundary>
            </div>
          </div>

          <DemoSourcePanel key={currentDemo} sourceFiles={sourceFiles} />
        </section>
      </div>
    </div>
  );
}
