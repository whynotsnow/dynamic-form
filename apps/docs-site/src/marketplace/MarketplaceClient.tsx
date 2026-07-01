import React, { useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import { marketplaceFilters, marketplaceItems } from './marketplaceData';
import type { MarketplaceCodeBlock, MarketplaceItem, MarketplaceKind } from './marketplaceData';
import { previewRegistry } from './previews/previewRegistry';
import styles from '../pages/marketplace.module.css';

type ActiveFilter = 'all' | MarketplaceKind;

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

function CodeBlock({ block }: { block: MarketplaceCodeBlock }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(block.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span>{block.title}</span>
        <button onClick={handleCopy} type="button">
          {copied
            ? translate({ id: 'marketplace.code.copied', message: '已复制' })
            : translate({ id: 'marketplace.code.copy', message: '复制' })}
        </button>
      </div>
      <pre>
        <code>{block.code}</code>
      </pre>
    </div>
  );
}

function MarketplaceCard({
  item,
  active,
  onPreview
}: {
  item: MarketplaceItem;
  active: boolean;
  onPreview: (item: MarketplaceItem) => void;
}) {
  return (
    <article className={`${styles.card} ${active ? styles.cardActive : ''}`}>
      <div className={styles.cardTopline}>
        <span className={`${styles.installBadge} ${styles[item.installMode]}`}>
          {installModeText[item.installMode]}
        </span>
        <span className={styles.kind}>
          {marketplaceFilters.find((filter) => filter.id === item.kind)?.label}
        </span>
      </div>
      <Heading as="h2">{item.title}</Heading>
      <p className={styles.description}>{item.description}</p>
      <p className={styles.installNote}>{installModeDescription[item.installMode]}</p>
      {item.dependencies && item.dependencies.length > 0 ? (
        <div className={styles.dependencies}>
          <strong>
            <Translate id="marketplace.card.dependencies">依赖</Translate>
          </strong>
          {item.dependencies.map((dependency) => (
            <code key={dependency}>{dependency}</code>
          ))}
        </div>
      ) : null}
      <div className={styles.tags}>
        {item.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className={styles.codeList}>
        {item.codeBlocks.map((block) => (
          <CodeBlock block={block} key={`${item.id}-${block.title}`} />
        ))}
      </div>
      <div className={styles.actions}>
        <button
          className="button button--primary button--sm"
          onClick={() => onPreview(item)}
          type="button"
        >
          <Translate id="marketplace.card.preview">预览</Translate>
        </button>
        {item.docsPath ? (
          <Link className="button button--secondary button--sm" to={item.docsPath}>
            <Translate id="marketplace.card.docs">文档</Translate>
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export default function MarketplaceClient(): JSX.Element {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [activeItem, setActiveItem] = useState<MarketplaceItem | undefined>();
  const [previewKey, setPreviewKey] = useState(0);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') {
      return marketplaceItems;
    }

    return marketplaceItems.filter((item) => item.kind === activeFilter);
  }, [activeFilter]);

  const ActivePreview = activeItem ? previewRegistry[activeItem.previewId] : undefined;

  const handlePreview = (item: MarketplaceItem) => {
    setActiveItem(item);
    setPreviewKey((current) => current + 1);
  };

  return (
    <div className="container">
      <section className={styles.intro}>
        <Heading as="h1">
          <Translate id="marketplace.page.title">扩展市场</Translate>
        </Heading>
        <p>
          <Translate id="marketplace.page.description">
            浏览 DynamicForm
            的系统内置能力和可复制安装的组件、handlers、组合方案。复制安装条目面向用户项目，复制后通过
            componentRegistry 或 useInitHandlers 注册到 DynamicForm。
          </Translate>
        </p>
      </section>

      <section className={styles.installSummary}>
        <div>
          <strong>{installModeText.builtin}</strong>
          <span>{installModeDescription.builtin}</span>
        </div>
        <div>
          <strong>{installModeText.copy}</strong>
          <span>{installModeDescription.copy}</span>
        </div>
      </section>

      <section className={styles.previewPanel} aria-live="polite">
        <div className={styles.previewHeader}>
          <div>
            <span>
              <Translate id="marketplace.preview.label">按需预览</Translate>
            </span>
            <Heading as="h2">
              {activeItem?.title ??
                translate({
                  id: 'marketplace.preview.emptyTitle',
                  message: '选择一个条目开始预览'
                })}
            </Heading>
          </div>
          {activeItem ? (
            <button
              className="button button--secondary button--sm"
              onClick={() => setPreviewKey((current) => current + 1)}
              type="button"
            >
              <Translate id="marketplace.preview.reset">重置预览</Translate>
            </button>
          ) : null}
        </div>
        <div className={styles.previewBody}>
          {ActivePreview ? (
            <ActivePreview key={`${activeItem?.previewId}-${previewKey}`} />
          ) : (
            <p>
              <Translate id="marketplace.preview.emptyDescription">
                页面默认不挂载所有预览。点击任意条目的“预览”按钮后，这里才会渲染对应的真实
                DynamicForm 示例。
              </Translate>
            </p>
          )}
        </div>
      </section>

      <nav
        className={styles.filters}
        aria-label={translate({ id: 'marketplace.filters.label', message: '扩展市场分类' })}
      >
        {marketplaceFilters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter.id}
            className={activeFilter === filter.id ? styles.filterActive : ''}
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </nav>

      <section className={styles.grid}>
        {filteredItems.map((item) => (
          <MarketplaceCard
            active={activeItem?.id === item.id}
            item={item}
            key={item.id}
            onPreview={handlePreview}
          />
        ))}
      </section>
    </div>
  );
}
