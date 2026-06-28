import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import styles from './playground.module.css';

export default function Playground(): JSX.Element {
  return (
    <Layout
      title="Playground"
      description="DynamicForm playground placeholder for phase 1."
    >
      <main className={styles.page}>
        <div className="container">
          <section className={styles.intro}>
            <Heading as="h1">Playground</Heading>
            <p>
              这里会在阶段 2 接入 <code>demos/demoRegistry.tsx</code>，以站点级布局展示
              DynamicForm 的可交互 demo。第一阶段只保留占位页面，避免提前处理 demo alias 和
              展示容器问题。
            </p>
          </section>

          <section className={styles.placeholder}>
            <Heading as="h2">Phase 2 Scope</Heading>
            <p>
              The interactive demo registry integration is intentionally deferred to phase 2.
              This page confirms the route and layout entry are ready without loading demo
              components yet.
            </p>
          </section>
        </div>
      </main>
    </Layout>
  );
}
