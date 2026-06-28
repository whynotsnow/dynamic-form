import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './examples.module.css';

const examples = [
  {
    title: '最小表单 / Minimal form',
    description: '用一个 flat FormConfig 渲染基础字段，并把提交交给 Ant Design Form。',
    code: `const formConfig = {
  fields: [
    { id: 'name', label: 'Name', component: 'TextInput', required: true }
  ]
};`,
    docs: '/docs/development',
    playground: '/playground?demo=storeBoundary'
  },
  {
    title: '分组表单 / Grouped form',
    description: '把字段组织到 groups 中，使用默认 Card 布局或后续 render hooks 替换外壳。',
    code: `const formConfig = {
  groups: [
    { id: 'basic', title: 'Basic', fields: [{ id: 'email', component: 'TextInput' }] }
  ]
};`,
    docs: '/docs/configuration',
    playground: '/playground?demo=uiConfig'
  },
  {
    title: '字段联动 / Field effects',
    description: '通过 dependents 和 effect 返回 visible、disabled、value 或 render meta。',
    code: `{
  id: 'companyName',
  dependents: ['hasCompany'],
  effect: (_value, allValues) => ({ visible: allValues.hasCompany === true })
}`,
    docs: '/docs/effects-and-handlers',
    playground: '/playground?demo=customHandlers'
  },
  {
    title: '自定义组件 / Custom components',
    description: '用 componentRegistry 注册业务字段组件，仍由 DynamicForm 负责运行时 props。',
    code: `<DynamicForm
  componentRegistry={{ customComponents: { ProjectSelect } }}
  formConfig={formConfig}
/>`,
    docs: '/docs/rendering-and-ui',
    playground: '/playground?demo=customComponents'
  },
  {
    title: '自定义 handlers / Custom handlers',
    description: '把 effect 返回值映射到业务语义，保持组件只负责渲染。',
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
    description: '把 JsonSchema、OpenAPI 或 metadata 适配为模块配置，再编译为标准 FormConfig。',
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
      title="Examples"
      description="Scenario-based DynamicForm examples with docs and playground links."
    >
      <main className={styles.page}>
        <div className="container">
          <section className={styles.intro}>
            <Heading as="h1">Examples</Heading>
            <p>
              按常见场景查找配置入口。每个示例保留短代码片段，并链接到完整文档和可交互
              Playground。 / Find configuration entry points by scenario, with concise snippets,
              full documentation links, and interactive playground links.
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
                    Docs
                  </Link>
                  <Link className="button button--secondary button--sm" to={example.playground}>
                    Playground
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
