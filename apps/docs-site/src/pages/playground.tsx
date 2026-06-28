import BrowserOnly from '@docusaurus/BrowserOnly';
import Translate, { translate } from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import styles from './playground.module.css';

export default function Playground(): JSX.Element {
  return (
    <Layout
      title={translate({
        id: 'playground.layout.title',
        message: '演练场'
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
                <Translate id="playground.loading">正在加载演练场...</Translate>
              </div>
            </div>
          }
        >
          {() => {
            const DemoPlaygroundClient = require('../components/DemoPlaygroundClient').default;
            return <DemoPlaygroundClient />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
