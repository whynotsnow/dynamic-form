import React, { useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import SiteContentErrorBoundary from '../components/SiteContentErrorBoundary';
import { marketplaceFilters, marketplaceItems } from './marketplaceData';
import type { MarketplaceItem, MarketplaceKind } from './marketplaceData';
import styles from '../pages/marketplace.module.css';

type ActiveFilter = 'all' | MarketplaceKind;

const installModeText = {
  builtin: translate({ id: 'marketplace.installMode.builtin', message: '系统内置安装' }),
  copy: translate({ id: 'marketplace.installMode.copy', message: '复制示例' })
};

const installModeDescription = {
  builtin: translate({
    id: 'marketplace.installMode.builtin.description',
    message: '内置字段组件可直接写在字段配置中；调用 useInitHandlers({}) 后即可使用内置联动处理器。'
  }),
  copy: translate({
    id: 'marketplace.installMode.copy.description',
    message:
      '复制示例代码并注册到 DynamicForm。示例用于说明接入方式；真实数据和业务逻辑需要按你的项目调整。'
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
            浏览 DynamicForm 的内置字段和联动处理方式，也可以复制自定义组件、handler
            和组合示例作为项目起点。这里展示的是代码示例，不是可直接安装的插件包；复制后请按项目补充数据请求和业务逻辑。
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
          <SiteContentErrorBoundary context={`marketplace card: ${item.id}`} key={item.id}>
            <MarketplaceCard item={item} />
          </SiteContentErrorBoundary>
        ))}
      </section>
    </div>
  );
}
