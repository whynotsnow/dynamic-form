import type React from 'react';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import styles from './api.module.css';

const apiPackages = [
  {
    name: '@whynotsnow/dynamic-form',
    description: translate({
      id: 'api.package.react.description',
      message:
        '在 React 应用中显示和使用表单。这个包还会重新导出常用的 core 配置能力，已有项目可以继续从这里导入。'
    }),
    groups: [
      {
        title: translate({ id: 'api.react.components.title', message: '表单组件' }),
        description: translate({
          id: 'api.groups.components.description',
          message: '显示手写配置或转换后的表单。'
        }),
        exports: [
          'DynamicForm',
          'CompiledDynamicForm',
          'DynamicFormProvider',
          'FormChainEffectWrapper'
        ],
        docs: '/docs/development'
      },
      {
        title: translate({ id: 'api.react.hooks.title', message: 'Hooks' }),
        description: translate({
          id: 'api.groups.hooks.description',
          message: '注册联动处理器，或在自定义扩展中访问表单上下文。'
        }),
        exports: ['useInitHandlers', 'useFormChainContext', 'useStoreInit'],
        docs: '/docs/effects-and-handlers'
      },
      {
        title: translate({ id: 'api.react.ui.title', message: '表单与界面扩展' }),
        description: translate({
          id: 'api.groups.formRendererAdapters.description',
          message: '连接表单实例、替换默认展示方式或注册自定义字段组件。'
        }),
        exports: [
          'createAntdFormAdapter',
          'createMemoryFormAdapter',
          'assertFormAdapter',
          'antdRenderer',
          'headlessRenderer',
          'assertRendererAdapter',
          'ComponentRegistryManager',
          'DefaultRegistryFieldComponents'
        ],
        docs: '/docs/rendering-and-ui'
      },
      {
        title: translate({ id: 'api.react.types.title', message: '常用配置类型' }),
        description: translate({
          id: 'api.groups.configTypes.description',
          message: '描述字段、分组、提交值和表单界面设置。'
        }),
        exports: [
          'FormConfig',
          'BaseFieldConfig',
          'DynamicFormProps',
          'UIConfig',
          'FormValues',
          'DesignerMetadata'
        ],
        docs: '/docs/configuration'
      },
      {
        title: translate({ id: 'api.react.validation.title', message: '配置检查与联动规则' }),
        description: translate({
          id: 'api.groups.utilities.description',
          message: '检查配置并查询字段显示、提交和校验状态。'
        }),
        exports: [
          'processFormConfig',
          'getFormConfigDiagnostics',
          'validateFormConfig',
          'getFieldRuntimeSnapshot',
          'getRenderedFieldIds',
          'getSubmitableFieldIds',
          'getValidatableFieldIds',
          'RuleEngine',
          'createRuleEngine'
        ],
        docs: '/docs/core-package'
      },
      {
        title: translate({ id: 'api.react.conversion.title', message: '配置转换' }),
        description: translate({
          id: 'api.groups.adapters.description',
          message: '把字段模块、JSON Schema、OpenAPI 或 metadata 转换为 DynamicForm 配置。'
        }),
        exports: [
          'compileFormConfig',
          'ModuleRegistryManager',
          'defaultModuleRegistry',
          'adaptModuleConfigs',
          'compileAdaptedFormConfig',
          'JsonSchemaAdapter',
          'OpenApiAdapter',
          'MetadataAdapter'
        ],
        docs: '/docs/adapter-foundation'
      }
    ]
  },
  {
    name: '@whynotsnow/dynamic-form-core',
    description: translate({
      id: 'api.package.core.description',
      message:
        '在不显示 React 表单的场景中检查、转换或分析表单配置，例如设计器、服务端任务和构建脚本。'
    }),
    groups: [
      {
        title: translate({ id: 'api.core.config.title', message: '配置检查' }),
        description: translate({
          id: 'api.groups.coreConfig.description',
          message: '检查配置问题，或准备表单运行所需的信息。'
        }),
        exports: ['processFormConfig', 'getFormConfigDiagnostics', 'validateFormConfig'],
        docs: '/docs/core-package'
      },
      {
        title: translate({ id: 'api.core.compiler.title', message: '字段模块与配置转换' }),
        description: translate({
          id: 'api.groups.coreCompiler.description',
          message: '把可复用的字段模块或外部 schema 转换成表单配置。'
        }),
        exports: [
          'compileFormConfig',
          'ModuleRegistryManager',
          'defaultModuleRegistry',
          'adaptModuleConfigs',
          'compileAdaptedFormConfig',
          'JsonSchemaAdapter',
          'OpenApiAdapter',
          'MetadataAdapter'
        ],
        docs: '/docs/compiler-foundation'
      },
      {
        title: translate({ id: 'api.core.rules.title', message: '联动规则' }),
        description: translate({
          id: 'api.groups.rules.description',
          message: '定义同步规则，并转换成 DynamicForm 可以处理的联动结果。'
        }),
        exports: ['RuleEngine', 'createRuleEngine', 'compileRulesToEffect', 'evaluateRule'],
        docs: '/docs/rule-engine'
      },
      {
        title: translate({ id: 'api.core.runtime.title', message: '字段路径与运行状态' }),
        description: translate({
          id: 'api.groups.runtimeInspection.description',
          message: '处理嵌套字段路径，或查询字段是否显示、提交和校验。'
        }),
        exports: [
          'getFieldName',
          'resolveFieldAddress',
          'resolveRuntimeState',
          'resolveFieldCapability',
          'resolveGroupCapability',
          'getAllFields',
          'getAllFieldIds',
          'getRenderedFieldIds',
          'getSubmitableFieldIds',
          'getValidatableFieldIds'
        ],
        docs: '/docs/field-address'
      },
      {
        title: translate({ id: 'api.core.types.title', message: '常用配置类型' }),
        description: translate({
          id: 'api.groups.coreTypes.description',
          message: '为表单、字段、规则和运行状态提供 TypeScript 类型。'
        }),
        exports: ['FormConfig', 'BaseFieldConfig', 'FieldAddress', 'FieldNamePath', 'RuntimeState'],
        docs: '/docs/configuration'
      }
    ]
  }
];

export default function Api(): React.JSX.Element {
  return (
    <Layout
      title={translate({
        id: 'api.layout.title',
        message: '导出API'
      })}
      description={translate({
        id: 'api.layout.description',
        message: '按 package 整理的常用导出 API 摘要。'
      })}
    >
      <main className={styles.page}>
        <div className="container">
          <section className={styles.intro}>
            <Heading as="h1">
              <Translate id="api.page.title">导出API</Translate>
            </Heading>
            <p>
              <Translate id="api.page.description">
                这里列出两个 package 的常用
                API，帮助你选择合适的导入入口。它不是完整导出清单；具体类型和全部导出请以对应
                package 为准。
              </Translate>
            </p>
          </section>

          {apiPackages.map((apiPackage) => (
            <section className={styles.package} key={apiPackage.name}>
              <header className={styles.packageHeader}>
                <Heading as="h2">{apiPackage.name}</Heading>
                <p>{apiPackage.description}</p>
              </header>
              <div className={styles.groups}>
                {apiPackage.groups.map((group) => (
                  <article className={styles.group} key={group.title}>
                    <Heading as="h3">{group.title}</Heading>
                    <p>{group.description}</p>
                    <div className={styles.exports}>
                      {group.exports.map((name) => (
                        <code key={name}>{name}</code>
                      ))}
                    </div>
                    <Link className="button button--secondary button--sm" to={group.docs}>
                      <Translate id="api.group.relatedDocs">相关文档</Translate>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </Layout>
  );
}
