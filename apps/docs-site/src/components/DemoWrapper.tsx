import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { translate } from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import {
  DemoLoadingContext,
  DemoLoadingView,
  type DemoLoadingContextValue
} from '../../../../demos/DemoLoading';
import type { DemoSourceFile } from '../../../../demos/demoRegistry';
import SiteCodeBlock from './SiteCodeBlock';
import styles from './DemoWrapper.module.css';

export interface DemoGuideItem {
  text: string;
}

interface DemoWrapperProps {
  componentName: string;
  title: string;
  description: string;
  guide: DemoGuideItem[];
  githubDemoPath: string;
  relatedComponentPaths: string[];
  sourceFiles: DemoSourceFile[];
  reservedContentHeight: number;
  onReadyHeightChange: (height: number) => void;
  children: React.ReactNode;
}

interface DemoSourcePanelProps {
  componentName: string;
  githubDemoPath: string;
  relatedComponentPaths: string[];
  sourceFiles: DemoSourceFile[];
}

const MINIMUM_LOADING_DURATION = 180;
const CONTENT_HEIGHT_TRANSITION_DURATION = 220;
const GITHUB_SOURCE_BASE = 'https://github.com/whynotsnow/dynamic-form/blob/main/';

function DemoSourcePanel({
  componentName,
  githubDemoPath,
  relatedComponentPaths,
  sourceFiles
}: DemoSourcePanelProps): React.JSX.Element | null {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const idPrefix = useId().replace(/:/g, '');
  const { i18n } = useDocusaurusContext();

  if (sourceFiles.length === 0) {
    return null;
  }

  const activeFile = sourceFiles[activeFileIndex] ?? sourceFiles[0];
  const sourcePathLabel = i18n.currentLocale === 'en' ? 'File path' : '文件路径';
  const activeSource = `// ${sourcePathLabel}: ${activeFile.path}\n${activeFile.content.trim()}`;
  const referenceMountSource = [
    "import React from 'react';",
    "import { createRoot } from 'react-dom/client';",
    `import { ${componentName} } from './demos';`,
    '',
    `const App: React.FC = () => <${componentName} />;`,
    '',
    "createRoot(document.getElementById('root')!).render(<App />);"
  ].join('\n');
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
      <div className={styles.sourcePanelContent}>
        <div className={styles.sourceContext}>
          <p>
            {translate({
              id: 'demos.sourcePanel.sharedContext',
              message:
                'DemoWrapper 是站点展示组件；DemoLoading 和 useDemoSubmitResult 由 demo 复用。下方链接指向当前 demo、相关组件和提交结果助手。'
            })}
          </p>
          <div className={styles.mountReference}>
            <strong>
              {translate({
                id: 'demos.sourcePanel.mountTitle',
                message: '参考挂载方式'
              })}
            </strong>
            <p>
              {translate({
                id: 'demos.sourcePanel.mountDescription',
                message:
                  '示例假设 App.tsx 位于仓库根目录；从 ./demos 导入当前组件，将它作为 React 组件渲染后挂载到 #root。'
              })}
            </p>
            <SiteCodeBlock
              code={referenceMountSource}
              copyCode={referenceMountSource}
              language="tsx"
              title="App.tsx"
            />
          </div>
          <div>
            <strong>
              {translate({
                id: 'demos.sourcePanel.githubLinks',
                message: 'GitHub 源码'
              })}
            </strong>
            <ul>
              {[githubDemoPath, ...relatedComponentPaths].map((path) => {
                const fileName = path.split('/').pop() ?? path;

                return (
                  <li key={path}>
                    <a
                      href={`${GITHUB_SOURCE_BASE}${path}`}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      {fileName}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
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
            copyCode={activeFile.content}
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
      </div>
    </details>
  );
}

export default function DemoWrapper({
  componentName,
  title,
  description,
  guide,
  githubDemoPath,
  relatedComponentPaths,
  sourceFiles,
  reservedContentHeight,
  onReadyHeightChange,
  children
}: DemoWrapperProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [contentHeight, setContentHeight] = useState<number | null>(reservedContentHeight);
  const pendingLoaders = useRef(0);
  const minimumLoadingElapsed = useRef(false);
  const naturalContentRef = useRef<HTMLDivElement>(null);
  const unlockTimer = useRef<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      minimumLoadingElapsed.current = true;
      if (pendingLoaders.current === 0) {
        setIsLoading(false);
      }
    }, MINIMUM_LOADING_DURATION);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleLoadingChange = useCallback((loading: boolean) => {
    if (loading) {
      pendingLoaders.current += 1;
      setIsLoading(true);
      return;
    }

    pendingLoaders.current = Math.max(0, pendingLoaders.current - 1);
    if (pendingLoaders.current === 0 && minimumLoadingElapsed.current) {
      setIsLoading(false);
    }
  }, []);
  const loadingContext = useMemo<DemoLoadingContextValue>(
    () => ({ onLoadingChange: handleLoadingChange }),
    [handleLoadingChange]
  );
  const loadingMessage = translate({
    id: 'demos.loading',
    message: '正在加载 demo演示...'
  });

  useLayoutEffect(() => {
    if (isLoading) {
      setContentHeight(reservedContentHeight);
      return;
    }

    const nextHeight = naturalContentRef.current?.getBoundingClientRect().height;
    if (nextHeight && Number.isFinite(nextHeight)) {
      const roundedHeight = Math.ceil(nextHeight);
      setContentHeight(roundedHeight);
      onReadyHeightChange(roundedHeight);
    }

    unlockTimer.current = window.setTimeout(() => {
      setContentHeight(null);
      unlockTimer.current = null;
    }, CONTENT_HEIGHT_TRANSITION_DURATION);

    return () => {
      if (unlockTimer.current !== null) {
        window.clearTimeout(unlockTimer.current);
        unlockTimer.current = null;
      }
    };
  }, [isLoading, onReadyHeightChange]);

  useEffect(() => {
    if (isLoading || !naturalContentRef.current) return;

    const observedContent = naturalContentRef.current;
    const observer = new ResizeObserver(() => {
      const nextHeight = Math.ceil(observedContent.getBoundingClientRect().height);
      if (nextHeight > 0) onReadyHeightChange(nextHeight);
    });
    observer.observe(observedContent);
    return () => observer.disconnect();
  }, [isLoading, onReadyHeightChange]);

  const handleHeightTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && event.propertyName === 'height') {
      if (unlockTimer.current !== null) {
        window.clearTimeout(unlockTimer.current);
        unlockTimer.current = null;
      }
      setContentHeight(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.intro}>
        <Heading as="h2">{title}</Heading>
        <p>{description}</p>
      </header>

      {guide.length > 0 ? (
        <section
          className={styles.guide}
          aria-label={translate({
            id: 'demos.wrapper.guideLabel',
            message: '测试与验证说明'
          })}
        >
          <Heading as="h3">
            {translate({
              id: 'demos.wrapper.guideTitle',
              message: '测试与验证说明'
            })}
          </Heading>
          <ul>
            {guide.map((item, index) => (
              <li key={`${index}-${item.text}`}>{item.text}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <DemoLoadingContext.Provider value={loadingContext}>
        <div
          className={`${styles.demoContent} ${isLoading ? styles.demoContentLoading : ''}`}
          onTransitionEnd={handleHeightTransitionEnd}
          style={{
            height: contentHeight === null ? undefined : `${contentHeight}px`
          }}
        >
          <div className={styles.demoContentNatural} ref={naturalContentRef}>
            <div className={styles.demoFrame}>
              {isLoading ? <DemoLoadingView message={loadingMessage} /> : null}
              <div
                aria-hidden={isLoading || undefined}
                className={styles.demoSandbox}
                hidden={isLoading}
              >
                {children}
              </div>
            </div>
            {!isLoading ? (
              <DemoSourcePanel
                componentName={componentName}
                githubDemoPath={githubDemoPath}
                relatedComponentPaths={relatedComponentPaths}
                sourceFiles={sourceFiles}
              />
            ) : null}
          </div>
        </div>
      </DemoLoadingContext.Provider>
    </div>
  );
}
