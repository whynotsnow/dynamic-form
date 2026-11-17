import type React from 'react';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import SiteContentErrorBoundary from '../components/SiteContentErrorBoundary';
import SiteCodeBlock from '../components/SiteCodeBlock';
import styles from './examples.module.css';

const examples = [
  {
    title: translate({ id: 'examples.minimal.title', message: 'Store 状态边界' }),
    description: translate({
      id: 'examples.minimal.description',
      message: '使用外部 Ant Design Form 管理字段值，并通过 componentRegistry 注册自定义字段组件。'
    }),
    code: `<DynamicForm
  form={form}
  formConfig={supplierFormConfig}
  componentRegistry={{ customComponents: { OperatingAreaField } }}
/>`,
    docs: '/docs/configuration',
    demoUrl: '/demos?demo=storeBoundary'
  },
  {
    title: translate({
      id: 'examples.grouped.title',
      message: 'UI 配置与字段联动'
    }),
    description: translate({
      id: 'examples.grouped.description',
      message: 'UIConfig Demo 通过工单状态 effect 更新表单和按钮样式，并根据描述长度调整输入框。'
    }),
    code: `<DynamicForm
  formConfig={formConfig}
  uiConfig={{ formProps: { layout: 'vertical' } }}
/>`,
    docs: '/docs/configuration',
    demoUrl: '/demos?demo=uiConfig'
  },
  {
    title: translate({
      id: 'examples.effects.title',
      message: '自定义 Effect 结果处理器'
    }),
    description: translate({
      id: 'examples.effects.description',
      message: '自定义处理器练习场演示数据转换、条件显示和链式处理；它不代表单一业务流程。'
    }),
    code: `import type { CustomEffectResultHandler } from '@whynotsnow/dynamic-form';

const effect = (value: number) => ({ dataTransform: value });

const handler: CustomEffectResultHandler = {
  name: 'dataTransform',
  canHandle: (key) => key === 'dataTransform',
  handle: (context, value) => context.setFieldValue(Number(value) * 2)
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
      message: '渲染扩展'
    }),
    description: translate({
      id: 'examples.customHandlers.description',
      message: '按需提供 render hooks，自定义字段、分组和表单内容的渲染方式。'
    }),
    code: `<DynamicForm
  formConfig={formConfig}
  renderFieldItem={renderFieldItem}
  renderGroups={renderGroups}
/>`,
    docs: '/docs/rendering-and-ui',
    demoUrl: '/demos?demo=renderExtension'
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
              <SiteContentErrorBoundary
                context={`example card: ${example.demoUrl}`}
                key={example.title}
              >
                <article className={styles.card}>
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
              </SiteContentErrorBoundary>
            ))}
          </section>
        </div>
      </main>
    </Layout>
  );
}
