import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import styles from './examples.module.css';

const examples = [
  {
    title: translate({
      id: 'examples.minimal.title',
      message: '最小表单'
    }),
    description: translate({
      id: 'examples.minimal.description',
      message: '用一个 flat FormConfig 渲染基础字段，并把提交交给 Ant Design Form。'
    }),
    code: `const formConfig = {
  fields: [
    { id: 'name', label: 'Name', component: 'TextInput', required: true }
  ]
};`,
    docs: '/docs/development',
    playground: '/playground?demo=storeBoundary'
  },
  {
    title: translate({
      id: 'examples.grouped.title',
      message: '分组表单'
    }),
    description: translate({
      id: 'examples.grouped.description',
      message: '把字段组织到 groups 中，使用默认 Card 布局或后续 render hooks 替换外壳。'
    }),
    code: `const formConfig = {
  groups: [
    { id: 'basic', title: 'Basic', fields: [{ id: 'email', component: 'TextInput' }] }
  ]
};`,
    docs: '/docs/configuration',
    playground: '/playground?demo=uiConfig'
  },
  {
    title: translate({
      id: 'examples.effects.title',
      message: '字段联动'
    }),
    description: translate({
      id: 'examples.effects.description',
      message: '通过 dependents 和 effect 返回 visible、disabled、value 或 render meta。'
    }),
    code: `{
  id: 'companyName',
  dependents: ['hasCompany'],
  effect: (_value, allValues) => ({ visible: allValues.hasCompany === true })
}`,
    docs: '/docs/effects-and-handlers',
    playground: '/playground?demo=customHandlers'
  },
  {
    title: translate({
      id: 'examples.customComponents.title',
      message: '自定义组件'
    }),
    description: translate({
      id: 'examples.customComponents.description',
      message: '用 componentRegistry 注册业务字段组件，仍由 DynamicForm 负责运行时 props。'
    }),
    code: `<DynamicForm
  componentRegistry={{ customComponents: { ProjectSelect } }}
  formConfig={formConfig}
/>`,
    docs: '/docs/rendering-and-ui',
    playground: '/playground?demo=customComponents'
  },
  {
    title: translate({
      id: 'examples.customHandlers.title',
      message: '自定义 handlers'
    }),
    description: translate({
      id: 'examples.customHandlers.description',
      message: '把 effect 返回值映射到业务语义，保持组件只负责渲染。'
    }),
    code: `const handler = {
  name: 'highlight',
  canHandle: (key) => key === 'highlight',
  handle: (context, enabled) => context.updateFieldMeta({ componentProps: { enabled } })
};`,
    docs: '/docs/effects-and-handlers',
    playground: '/playground?demo=customHandlers'
  },
  {
    title: 'Compiler / Adapter',
    description: translate({
      id: 'examples.compilerAdapter.description',
      message: '把 JsonSchema、OpenAPI 或 metadata 适配为模块配置，再编译为标准 FormConfig。'
    }),
    code: `const compiled = compileAdaptedFormConfig(schema, {
  adapterType: 'json-schema',
  moduleRegistry
});`,
    docs: '/docs/compiler-foundation',
    playground: '/playground?demo=compilerFoundation'
  }
];

export default function Examples(): JSX.Element {
  return (
    <Layout
      title={translate({
        id: 'examples.layout.title',
        message: '配置示例'
      })}
      description={translate({
        id: 'examples.layout.description',
        message: '按场景组织的 DynamicForm 配置示例，包含文档和 demo演示入口。'
      })}
    >
      <main className={styles.page}>
        <div className="container">
          <section className={styles.intro}>
            <Heading as="h1">
              <Translate id="examples.page.title">配置示例</Translate>
            </Heading>
            <p>
              <Translate id="examples.page.description">
                按常见场景查找配置入口。每个示例保留短代码片段，并链接到完整文档和可交互 demo演示。
              </Translate>
            </p>
          </section>

          <section className={styles.grid}>
            {examples.map((example) => (
              <article className={styles.card} key={example.title}>
                <Heading as="h2">{example.title}</Heading>
                <p>{example.description}</p>
                <pre className={styles.code}>
                  <code>{example.code}</code>
                </pre>
                <div className={styles.links}>
                  <Link className="button button--primary button--sm" to={example.docs}>
                    <Translate id="examples.card.docsLink">文档</Translate>
                  </Link>
                  <Link className="button button--secondary button--sm" to={example.playground}>
                    <Translate id="examples.card.playgroundLink">demo演示</Translate>
                  </Link>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </Layout>
  );
}
