import type React from 'react';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import SiteCodeBlock from '../components/SiteCodeBlock';
import styles from './examples.module.css';

const examples = [
  {
    title: translate({
      id: 'examples.minimal.title',
      message: '最小表单'
    }),
    description: translate({
      id: 'examples.minimal.description',
      message: '用 fields 配置一组基础字段，DynamicForm 默认使用 Ant Design 展示表单。'
    }),
    code: `const formConfig = {
  fields: [
    { id: 'name', label: 'Name', component: 'TextInput', required: true }
  ]
};`,
    docs: '/docs/development',
    demoUrl: '/demos?demo=storeBoundary'
  },
  {
    title: translate({
      id: 'examples.grouped.title',
      message: '分组表单'
    }),
    description: translate({
      id: 'examples.grouped.description',
      message: '把相关字段放进同一个分组。默认会按分组卡片显示，也可以按需要调整布局。'
    }),
    code: `const formConfig = {
  groups: [
    { id: 'basic', title: 'Basic', fields: [{ id: 'email', component: 'TextInput' }] }
  ]
};`,
    docs: '/docs/configuration',
    demoUrl: '/demos?demo=uiConfig'
  },
  {
    title: translate({
      id: 'examples.effects.title',
      message: '字段联动'
    }),
    description: translate({
      id: 'examples.effects.description',
      message: '根据“是否有公司”的选择，自动显示或隐藏公司名称字段。'
    }),
    code: `const formConfig = {
  fields: [
    { id: 'hasCompany', label: '是否有公司', component: 'Switch', dependents: ['companyName'] },
    {
      id: 'companyName', label: '公司名称', component: 'TextInput', initialVisible: false,
      effect: (_value, allValues) => ({ visible: allValues.hasCompany === true })
    }
  ]
};`,
    docs: '/docs/effects-and-handlers',
    demoUrl: '/demos?demo=customHandlers'
  },
  {
    title: translate({
      id: 'examples.customComponents.title',
      message: '自定义组件'
    }),
    description: translate({
      id: 'examples.customComponents.description',
      message: '把自定义输入组件注册到 componentRegistry，并在字段配置中引用它。'
    }),
    code: `<DynamicForm
  componentRegistry={{ customComponents: { ProjectSelect } }}
  formConfig={formConfig}
/>`,
    docs: '/docs/rendering-and-ui',
    demoUrl: '/demos?demo=customComponents'
  },
  {
    title: translate({
      id: 'examples.customHandlers.title',
      message: '自定义 handlers'
    }),
    description: translate({
      id: 'examples.customHandlers.description',
      message: '用自定义 handler 处理业务专属的联动结果；字段组件仍负责显示和输入。'
    }),
    code: `const handler = {
  name: 'highlight',
  canHandle: (key) => key === 'highlight',
  handle: (context, enabled) => context.updateFieldMeta({
    componentProps: {
      className: enabled ? 'field-highlight' : undefined,
      style: enabled ? { backgroundColor: '#fffbe6' } : undefined
    }
  })
};`,
    docs: '/docs/effects-and-handlers',
    demoUrl: '/demos?demo=customHandlers'
  },
  {
    title: translate({ id: 'examples.compilerAdapter.title', message: '转换外部配置' }),
    description: translate({
      id: 'examples.compilerAdapter.description',
      message: '把 JSON Schema、OpenAPI 或自有数据格式转换成 DynamicForm 可以显示的表单配置。'
    }),
    code: `import { compileAdaptedFormConfig } from '@whynotsnow/dynamic-form-core';

const formConfig = compileAdaptedFormConfig(schema, {
  adapterType: 'json-schema',
  moduleRegistry
});`,
    docs: '/docs/compiler-foundation',
    demoUrl: '/demos?demo=compilerFoundation'
  }
];

export default function Examples(): React.JSX.Element {
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
                <SiteCodeBlock
                  className={styles.code}
                  code={example.code}
                  language="tsx"
                  showCopy={false}
                />
                <div className={styles.links}>
                  <Link className="button button--primary button--sm" to={example.docs}>
                    <Translate id="examples.card.docsLink">文档</Translate>
                  </Link>
                  <Link className="button button--secondary button--sm" to={example.demoUrl}>
                    <Translate id="examples.card.demosLink">demo演示</Translate>
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
