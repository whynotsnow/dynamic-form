import type React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Translate, { translate } from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import MarketplaceDetailClient from '../../marketplace/MarketplaceDetailClient';
import styles from '../marketplace.module.css';

export default function MarketplaceDetail(): React.JSX.Element {
  return (
    <Layout
      title={translate({ id: 'marketplace.detail.layout.title', message: '扩展详情' })}
      description={translate({
        id: 'marketplace.detail.layout.description',
        message: '查看 DynamicForm 扩展示例的预览、使用说明和代码片段。'
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
          {() => <MarketplaceDetailClient />}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
