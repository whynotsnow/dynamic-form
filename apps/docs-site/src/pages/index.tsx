import clsx from 'clsx';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';

const features = [
  {
    title: translate({
      id: 'homepage.features.configDriven.title',
      message: '配置化表单'
    }),
    description: translate({
      id: 'homepage.features.configDriven.description',
      message:
        '用 FormConfig 描述字段、分组、校验和 UI 配置，把 Ant Design Form 的使用方式收敛到稳定配置层。'
    })
  },
  {
    title: translate({
      id: 'homepage.features.effectsRuntime.title',
      message: '联动与运行时策略'
    }),
    description: translate({
      id: 'homepage.features.effectsRuntime.description',
      message:
        '通过 form-chain-effect-engine 执行依赖链，并由 Runtime Layer 统一解析显示、提交、禁用、只读和校验能力。'
    })
  },
  {
    title: translate({
      id: 'homepage.features.extensionPoints.title',
      message: '扩展能力'
    }),
    description: translate({
      id: 'homepage.features.extensionPoints.description',
      message:
        '支持自定义组件、effect result handlers、render hooks、compiler、adapter 和声明式规则层。'
    })
  }
];

const flowSteps = [
  {
    title: 'Adapter / Compiler',
    description: translate({
      id: 'homepage.flow.adapterCompiler.description',
      message: '把外部 schema、metadata 或字段模块归一化为标准 FormConfig。'
    })
  },
  {
    title: 'State / Runtime',
    description: translate({
      id: 'homepage.flow.stateRuntime.description',
      message: '保存结构与 meta，并统一解析 rendered、editable、validatable 等能力。'
    })
  },
  {
    title: 'Consumer / Effects',
    description: translate({
      id: 'homepage.flow.consumerEffects.description',
      message: '渲染 Ant Design Form，并把字段联动结果交给语义化 handlers。'
    })
  }
];

const paths = [
  {
    title: translate({
      id: 'homepage.paths.start.title',
      message: '开始使用'
    }),
    description: translate({
      id: 'homepage.paths.start.description',
      message: '从安装、最小配置和字段配置开始，快速运行第一个 DynamicForm。'
    }),
    to: '/docs/development'
  },
  {
    title: translate({
      id: 'homepage.paths.examples.title',
      message: '查看场景'
    }),
    description: translate({
      id: 'homepage.paths.examples.description',
      message: '按最小表单、分组、联动、自定义组件和 compiler 管线查找示例入口。'
    }),
    to: '/examples'
  },
  {
    title: translate({
      id: 'homepage.paths.playground.title',
      message: '交互验证'
    }),
    description: translate({
      id: 'homepage.paths.playground.description',
      message: '直接运行现有 demos，观察表单联动、校验、render hooks 和扩展行为。'
    }),
    to: '/playground'
  },
  {
    title: translate({
      id: 'homepage.paths.api.title',
      message: '公共接口'
    }),
    description: translate({
      id: 'homepage.paths.api.description',
      message: '按组件、hooks、compiler、adapters、rules 和类型查看公共导出摘要。'
    }),
    to: '/api'
  }
];

export default function Home(): JSX.Element {
  const workflowImage = useBaseUrl('/img/dynamic-form-workflow.png');

  return (
    <Layout
      title="DynamicForm"
      description={translate({
        id: 'homepage.layout.description',
        message: 'DynamicForm 是一个基于 React、TypeScript 和 Ant Design 的动态表单库。'
      })}
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
                  <Translate id="homepage.hero.subtitle">
                    一个基于 React、TypeScript 和 Ant Design 的动态表单库，用配置描述表单结构，用
                    effect 链处理字段联动，并用 Runtime Layer 统一运行时参与策略。
                  </Translate>
                </p>
                <div className={styles.actions}>
                  <Link className="button button--primary button--lg" to="/docs">
                    <Translate id="homepage.hero.readDocs">阅读文档</Translate>
                  </Link>
                  <Link className="button button--secondary button--lg" to="/playground">
                    <Translate id="homepage.hero.viewPlayground">查看演练场</Translate>
                  </Link>
                  <Link className="button button--secondary button--lg" to="/examples">
                    <Translate id="homepage.hero.browseExamples">浏览示例</Translate>
                  </Link>
                </div>
              </div>
              <div className={styles.heroMedia}>
                <img
                  alt="DynamicForm configuration, runtime, and rendering workflow"
                  src={workflowImage}
                />
                <pre className={styles.install}>
                  <code>pnpm add @whynotsnow/dynamic-form antd react react-dom</code>
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
              <Heading as="h2">
                <Translate id="homepage.workflow.title">核心流程</Translate>
              </Heading>
              <p>
                <Translate id="homepage.workflow.description">
                  DynamicForm 把输入归一化、运行时能力和 UI 渲染拆成清晰层次，便于复用、扩展和验证。
                </Translate>
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
              <Heading as="h2">
                <Translate id="homepage.paths.title">使用路径</Translate>
              </Heading>
              <p>
                <Translate id="homepage.paths.description">
                  站点内容按学习、查找、验证和 API 摘要组织。
                </Translate>
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
