import type React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Translate, { translate } from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import MarketplaceClient from '../marketplace/MarketplaceClient';
import styles from './marketplace.module.css';

export default function Marketplace(): React.JSX.Element {
  return (
    <Layout
      title={translate({ id: 'marketplace.layout.title', message: '扩展市场' })}
      description={translate({
        id: 'marketplace.layout.description',
        message: '浏览 DynamicForm 内置能力和可复制的自定义扩展示例。'
      })}
    >
      <main className={styles.page}>
        <BrowserOnly
          fallback={
            <div className="container">
              <div className={styles.loading}>
                <Translate id="marketplace.loading">正在加载扩展市场...</Translate>
              </div>
            </div>
          }
        >
          {() => <MarketplaceClient />}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
