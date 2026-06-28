import clsx from 'clsx';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

const features = [
  {
    title: '配置化表单 / Config-driven forms',
    description:
      '用 FormConfig 描述字段、分组、校验和 UI 配置，把 Ant Design Form 的使用方式收敛到稳定配置层。'
  },
  {
    title: '联动与运行时策略 / Effects and runtime',
    description:
      '通过 form-chain-effect-engine 执行依赖链，并由 Runtime Layer 统一解析显示、提交、禁用、只读和校验能力。'
  },
  {
    title: '扩展能力 / Extension points',
    description:
      '支持自定义组件、effect result handlers、render hooks、compiler、adapter 和声明式规则层。'
  }
];

export default function Home(): JSX.Element {
  return (
    <Layout
      title="DynamicForm"
      description="DynamicForm 是一个基于 React、TypeScript 和 Ant Design 的动态表单库。"
    >
      <main>
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroInner}>
              <div>
                <p className={styles.eyebrow}>@whynotsnow/dynamic-form</p>
                <Heading as="h1" className={styles.title}>
                  DynamicForm
                </Heading>
                <p className={styles.subtitle}>
                  一个基于 React、TypeScript 和 Ant Design 的动态表单库，用配置描述表单结构，
                  用 effect 链处理字段联动，并用 Runtime Layer 统一运行时参与策略。
                </p>
                <div className={styles.actions}>
                  <Link className="button button--primary button--lg" to="/docs">
                    阅读文档 / Read docs
                  </Link>
                  <Link className="button button--secondary button--lg" to="/playground">
                    查看 Playground
                  </Link>
                </div>
              </div>
              <pre className={styles.install}>
                <code>npm install @whynotsnow/dynamic-form antd react react-dom</code>
              </pre>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.grid}>
              {features.map((feature) => (
                <article className={clsx(styles.feature)} key={feature.title}>
                  <Heading as="h2">{feature.title}</Heading>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
