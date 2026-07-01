import React, { useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import SiteCodeBlock from '../components/SiteCodeBlock';
import { marketplaceFilters, marketplaceItems } from './marketplaceData';
import type { MarketplaceItem } from './marketplaceData';
import { previewRegistry } from './previews/previewRegistry';
import styles from '../pages/marketplace.module.css';

const installModeText = {
  builtin: translate({ id: 'marketplace.installMode.builtin', message: '系统内置安装' }),
  copy: translate({ id: 'marketplace.installMode.copy', message: '复制安装' })
};

const installModeDescription = {
  builtin: translate({
    id: 'marketplace.installMode.builtin.description',
    message:
      '无需复制代码。组件可直接在 component 中引用；默认 handlers 在 useInitHandlers() 后可用。'
  }),
  copy: translate({
    id: 'marketplace.installMode.copy.description',
    message: '复制源码、注册代码和使用示例到你的项目，再通过 DynamicForm 的注册入口接入。'
  })
};

function readMarketplaceItemId(): string | undefined {
  return new URLSearchParams(window.location.search).get('id') ?? undefined;
}

function getKindLabel(item: MarketplaceItem): string | undefined {
  return marketplaceFilters.find((filter) => filter.id === item.kind)?.label;
}

export default function MarketplaceDetailClient(): React.JSX.Element {
  const itemId = useMemo(() => readMarketplaceItemId(), []);
  const item = useMemo(() => marketplaceItems.find((entry) => entry.id === itemId), [itemId]);
  const [previewKey, setPreviewKey] = useState(0);
  const [activeCodeIndex, setActiveCodeIndex] = useState(0);

  if (!item) {
    return (
      <div className="container">
        <section className={styles.detailNotFound}>
          <Heading as="h1">
            <Translate id="marketplace.detail.notFoundTitle">未找到扩展条目</Translate>
          </Heading>
          <p>
            <Translate id="marketplace.detail.notFoundDescription">
              当前链接对应的扩展条目不存在，可能已被重命名或移除。
            </Translate>
          </p>
          <Link className="button button--primary" to="/marketplace">
            <Translate id="marketplace.detail.backToList">返回扩展市场</Translate>
          </Link>
        </section>
      </div>
    );
  }

  const ActivePreview = previewRegistry[item.previewId];
  const activeCodeBlock = item.codeBlocks[activeCodeIndex] ?? item.codeBlocks[0];

  return (
    <div className="container">
      <Link className={styles.backLink} to="/marketplace">
        <Translate id="marketplace.detail.back">返回扩展市场</Translate>
      </Link>

      <section className={styles.detailHero}>
        <div className={styles.detailHeroMain}>
          <div className={styles.cardTopline}>
            <span
              className={`${styles.installBadge} ${styles.detailBadge} ${styles[item.installMode]}`}
            >
              {installModeText[item.installMode]}
            </span>
            <span className={`${styles.kind} ${styles.detailBadge}`}>{getKindLabel(item)}</span>
          </div>
          <Heading as="h1">{item.title}</Heading>
          <p>{item.description}</p>
        </div>
      </section>

      <div className={styles.detailLayout}>
        <div className={styles.detailMain}>
          <section className={styles.docSection} id="usage">
            <Heading as="h2">
              <Translate id="marketplace.detail.usageTitle">使用</Translate>
            </Heading>
            <p>{installModeDescription[item.installMode]}</p>
            <div className={styles.usageMeta}>
              <div>
                <span>
                  <Translate id="marketplace.detail.installModeLabel">安装方式</Translate>
                </span>
                <strong>{installModeText[item.installMode]}</strong>
              </div>
              <div>
                <span>
                  <Translate id="marketplace.detail.kindLabel">分类</Translate>
                </span>
                <strong>{getKindLabel(item)}</strong>
              </div>
              <div>
                <span>
                  <Translate id="marketplace.detail.codeCountLabel">代码片段</Translate>
                </span>
                <strong>{item.codeBlocks.length}</strong>
              </div>
            </div>
            {item.dependencies && item.dependencies.length > 0 ? (
              <div className={`${styles.dependencies} ${styles.detailDependencies}`}>
                <strong>
                  <Translate id="marketplace.card.dependencies">依赖</Translate>
                </strong>
                {item.dependencies.map((dependency) => (
                  <code key={dependency}>{dependency}</code>
                ))}
              </div>
            ) : null}
          </section>

          <section className={styles.docSection} id="when-to-use">
            <Heading as="h2">
              <Translate id="marketplace.detail.whenToUseTitle">何时使用</Translate>
            </Heading>
            <p>{item.description}</p>
            <div className={styles.tags}>
              {item.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </section>

          <section className={styles.detailSection} id="preview">
            <div className={styles.detailSectionHeader}>
              <div>
                <span>
                  <Translate id="marketplace.preview.label">按需预览</Translate>
                </span>
                <Heading as="h2">
                  <Translate id="marketplace.detail.previewTitle">真实预览</Translate>
                </Heading>
              </div>
              <button
                className="button button--secondary button--sm"
                onClick={() => setPreviewKey((current) => current + 1)}
                type="button"
              >
                <Translate id="marketplace.preview.reset">重置预览</Translate>
              </button>
            </div>
            <div className={styles.previewBody}>
              {ActivePreview ? (
                <ActivePreview key={`${item.previewId}-${previewKey}`} />
              ) : (
                <p>
                  <Translate id="marketplace.detail.previewMissing">
                    当前条目暂未提供可交互预览。
                  </Translate>
                </p>
              )}
            </div>
          </section>

          <section className={styles.detailSection} id="code">
            <div className={styles.detailSectionHeader}>
              <div>
                <span>
                  <Translate id="marketplace.detail.codeLabel">代码</Translate>
                </span>
                <Heading as="h2">
                  <Translate id="marketplace.detail.codeTitle">代码演示</Translate>
                </Heading>
              </div>
            </div>
            <div
              aria-label={translate({ id: 'marketplace.detail.codeTabs', message: '代码片段' })}
              className={styles.codeTabs}
              role="tablist"
            >
              {item.codeBlocks.map((block, index) => (
                <button
                  aria-selected={activeCodeIndex === index}
                  className={activeCodeIndex === index ? styles.codeTabActive : undefined}
                  key={`${item.id}-${block.title}`}
                  onClick={() => setActiveCodeIndex(index)}
                  role="tab"
                  type="button"
                >
                  {block.title}
                </button>
              ))}
            </div>
            {activeCodeBlock ? (
              <SiteCodeBlock
                code={activeCodeBlock.code}
                copyCode={activeCodeBlock.code}
                language={activeCodeBlock.language}
                title={activeCodeBlock.title}
              />
            ) : null}
          </section>
        </div>

        <aside
          className={styles.detailAside}
          aria-label={translate({ id: 'marketplace.detail.sidebar', message: '详情页导航' })}
        >
          <div className={styles.detailSideGroup}>
            <span>
              <Translate id="marketplace.detail.pathLabel">扩展</Translate>
            </span>
            <strong>{item.id}</strong>
          </div>
          <div className={styles.detailSideGroup}>
            <span>
              <Translate id="marketplace.detail.feedbackLabel">反馈</Translate>
            </span>
            {item.docsPath ? (
              <Link to={item.docsPath}>
                <Translate id="marketplace.card.docs">文档</Translate>
              </Link>
            ) : null}
            <Link to="/marketplace">
              <Translate id="marketplace.detail.backToList">返回扩展市场</Translate>
            </Link>
          </div>
          <nav className={styles.detailAnchorNav}>
            <span>
              <Translate id="marketplace.detail.anchorTitle">目录</Translate>
            </span>
            <a href="#usage">
              <Translate id="marketplace.detail.usageTitle">使用</Translate>
            </a>
            <a href="#when-to-use">
              <Translate id="marketplace.detail.whenToUseTitle">何时使用</Translate>
            </a>
            <a href="#preview">
              <Translate id="marketplace.detail.jumpPreview">预览</Translate>
            </a>
            <a href="#code">
              <Translate id="marketplace.detail.jumpCode">代码</Translate>
            </a>
          </nav>
        </aside>
      </div>
    </div>
  );
}
