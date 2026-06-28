import clsx from 'clsx';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
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

const flowSteps = [
  {
    title: 'Adapter / Compiler',
    description: '把外部 schema、metadata 或字段模块归一化为标准 FormConfig。'
  },
  {
    title: 'State / Runtime',
    description: '保存结构与 meta，并统一解析 rendered、editable、validatable 等能力。'
  },
  {
    title: 'Consumer / Effects',
    description: '渲染 Ant Design Form，并把字段联动结果交给语义化 handlers。'
  }
];

const paths = [
  {
    title: '开始使用 / Start',
    description: '从安装、最小配置和字段配置开始，快速运行第一个 DynamicForm。',
    to: '/docs/development'
  },
  {
    title: '查看场景 / Examples',
    description: '按最小表单、分组、联动、自定义组件和 compiler 管线查找示例入口。',
    to: '/examples'
  },
  {
    title: '交互验证 / Playground',
    description: '直接运行现有 demos，观察表单联动、校验、render hooks 和扩展行为。',
    to: '/playground'
  },
  {
    title: '公共接口 / API',
    description: '按组件、hooks、compiler、adapters、rules 和类型查看公共导出摘要。',
    to: '/api'
  }
];

export default function Home(): JSX.Element {
  const workflowImage = useBaseUrl('/img/dynamic-form-workflow.png');

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
                  <Link className="button button--secondary button--lg" to="/examples">
                    浏览 Examples
                  </Link>
                </div>
              </div>
              <div className={styles.heroMedia}>
                <img
                  alt="DynamicForm configuration, runtime, and rendering workflow"
                  src={workflowImage}
                />
                <pre className={styles.install}>
                  <code>npm install @whynotsnow/dynamic-form antd react react-dom</code>
                </pre>
              </div>
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

        <section className={styles.sectionAlt}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <Heading as="h2">核心流程 / Core workflow</Heading>
              <p>
                DynamicForm 把输入归一化、运行时能力和 UI 渲染拆成清晰层次，便于复用、扩展和验证。
              </p>
            </div>
            <div className={styles.flow}>
              {flowSteps.map((step, index) => (
                <article className={styles.flowStep} key={step.title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <Heading as="h3">{step.title}</Heading>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <Heading as="h2">使用路径 / Paths</Heading>
              <p>
                站点内容按学习、查找、验证和 API 摘要组织。 / The site is organized for learning,
                lookup, verification, and API reference.
              </p>
            </div>
            <div className={styles.pathGrid}>
              {paths.map((pathItem) => (
                <Link className={styles.pathCard} key={pathItem.to} to={pathItem.to}>
                  <Heading as="h3">{pathItem.title}</Heading>
                  <p>{pathItem.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
