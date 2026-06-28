import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import styles from './playground.module.css';

export default function Playground(): JSX.Element {
  return (
    <Layout
      title="Playground"
      description="Interactive DynamicForm demos powered by the shared demo registry."
    >
      <main className={styles.page}>
        <BrowserOnly
          fallback={
            <div className="container">
              <div className={styles.loading}>正在加载 Playground / Loading playground...</div>
            </div>
          }
        >
          {() => {
            const DemoPlaygroundClient =
              require('../components/DemoPlaygroundClient').default;
            return <DemoPlaygroundClient />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
