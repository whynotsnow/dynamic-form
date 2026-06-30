import BrowserOnly from '@docusaurus/BrowserOnly';
import Translate, { translate } from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import DemoPlaygroundClient from '../components/DemoPlaygroundClient';
import styles from './playground.module.css';

export default function Playground(): JSX.Element {
  return (
    <Layout
      title={translate({
        id: 'playground.layout.title',
        message: 'demo演示'
      })}
      description={translate({
        id: 'playground.layout.description',
        message: '由共享 demo registry 驱动的 DynamicForm 交互演示。'
      })}
    >
      <main className={styles.page}>
        <BrowserOnly
          fallback={
            <div className="container">
              <div className={styles.loading}>
                <Translate id="playground.loading">正在加载 demo演示...</Translate>
              </div>
            </div>
          }
        >
          {() => <DemoPlaygroundClient />}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
