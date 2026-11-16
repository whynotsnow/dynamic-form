import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
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
  title: string;
  description: string;
  guide: DemoGuideItem[];
  githubDemoPath: string;
  relatedComponentPaths: string[];
  sourceFiles: DemoSourceFile[];
  children: React.ReactNode;
}

interface DemoSourcePanelProps {
  githubDemoPath: string;
  relatedComponentPaths: string[];
  sourceFiles: DemoSourceFile[];
}

const MINIMUM_LOADING_DURATION = 180;
const GITHUB_SOURCE_BASE = 'https://github.com/whynotsnow/dynamic-form/blob/main/';

function DemoSourcePanel({
  githubDemoPath,
  relatedComponentPaths,
  sourceFiles
}: DemoSourcePanelProps): React.JSX.Element | null {
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
      <div className={styles.sourcePanelContent}>
        <div className={styles.sourceContext}>
          <p>
            {translate({
              id: 'demos.sourcePanel.sharedContext',
              message:
                'DemoWrapper 和 DemoLoading 是共享展示组件；下方链接指向当前 demo 和它使用的自定义组件。'
            })}
          </p>
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
      </div>
    </details>
  );
}

export default function DemoWrapper({
  title,
  description,
  guide,
  githubDemoPath,
  relatedComponentPaths,
  sourceFiles,
  children
}: DemoWrapperProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const pendingLoaders = useRef(0);
  const minimumLoadingElapsed = useRef(false);

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
            githubDemoPath={githubDemoPath}
            relatedComponentPaths={relatedComponentPaths}
            sourceFiles={sourceFiles}
          />
        ) : null}
      </DemoLoadingContext.Provider>
    </div>
  );
}
