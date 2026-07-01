import BrowserOnly from '@docusaurus/BrowserOnly';
import Translate, { translate } from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import DemoGalleryClient from '../components/DemoGalleryClient';
import styles from './demos.module.css';

export default function Demos(): JSX.Element {
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
            <div className="container">
              <div className={styles.loading}>
                <Translate id="demos.loading">正在加载 demo演示...</Translate>
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
