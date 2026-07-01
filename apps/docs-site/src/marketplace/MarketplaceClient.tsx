import React, { useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import { marketplaceFilters, marketplaceItems } from './marketplaceData';
import type { MarketplaceItem, MarketplaceKind } from './marketplaceData';
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

function MarketplaceCard({ item }: { item: MarketplaceItem }) {
  return (
    <Link
      aria-label={`${item.title} ${translate({ id: 'marketplace.card.openDetail', message: '查看详情' })}`}
      className={styles.card}
      to={`/marketplace/detail?id=${item.id}`}
    >
      <div className={styles.cardTopline}>
        <span
          aria-label={installModeDescription[item.installMode]}
          className={`${styles.installBadge} ${styles[item.installMode]}`}
          data-tooltip={installModeDescription[item.installMode]}
        >
          {installModeText[item.installMode]}
        </span>
        <span className={styles.kind}>
          {marketplaceFilters.find((filter) => filter.id === item.kind)?.label}
        </span>
      </div>
      <Heading as="h2">{item.title}</Heading>
      <p className={styles.description}>{item.description}</p>
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
      <div className={styles.codeSummary}>
        <strong>
          {item.installMode === 'builtin' ? (
            <Translate id="marketplace.card.builtinSummary">内置能力</Translate>
          ) : (
            <Translate id="marketplace.card.codeSummary" values={{ count: item.codeBlocks.length }}>
              {'{count} 个代码片段'}
            </Translate>
          )}
        </strong>
        {item.codeBlocks.map((block) => (
          <span key={`${item.id}-${block.title}`}>{block.title}</span>
        ))}
      </div>
    </Link>
  );
}

export default function MarketplaceClient(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') {
      return marketplaceItems;
    }

    return marketplaceItems.filter((item) => item.kind === activeFilter);
  }, [activeFilter]);

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
          <MarketplaceCard item={item} key={item.id} />
        ))}
      </section>
    </div>
  );
}
