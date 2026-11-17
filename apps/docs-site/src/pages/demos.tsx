import type React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { translate } from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import DemoLoading from '../../../../demos/DemoLoading';
import DemoGalleryClient from '../components/DemoGalleryClient';
import styles from './demos.module.css';

export default function Demos(): React.JSX.Element {
  return (
    <Layout
      title={translate({
        id: 'demos.layout.title',
        message: 'demo演示'
      })}
      description={translate({
        id: 'demos.layout.description',
        message: '由共享 demo registry 驱动的 DynamicForm 交互演示。'
      })}
    >
      <main className={styles.page}>
        <BrowserOnly
          fallback={
            <div className={`container ${styles.browserFallback}`}>
              <div className={styles.fallbackShell}>
                <aside aria-hidden="true" className={styles.fallbackSidebar}>
                  {Array.from({ length: 10 }, (_, index) => (
                    <div className={styles.fallbackSidebarLine} key={index} />
                  ))}
                </aside>
                <section>
                  <div aria-hidden="true">
                    <div className={styles.fallbackHeadingLine} />
                    <div className={styles.fallbackIntroLine} />
                  </div>
                  <div aria-hidden="true" className={styles.fallbackGuide}>
                    {Array.from({ length: 4 }, (_, index) => (
                      <div className={styles.fallbackGuideLine} key={index} />
                    ))}
                  </div>
                  <div className={styles.fallbackDemo}>
                    <DemoLoading
                      message={translate({ id: 'demos.loading', message: '正在加载 demo演示...' })}
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className={`${styles.fallbackPanel} ${styles.fallbackSource}`}
                  >
                    {Array.from({ length: 12 }, (_, index) => (
                      <div className={styles.fallbackSourceLine} key={index} />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          }
        >
          {() => <DemoGalleryClient />}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
