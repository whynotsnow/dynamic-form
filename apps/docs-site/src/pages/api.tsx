import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import styles from './api.module.css';

const apiGroups = [
  {
    title: 'Components',
    description: translate({
      id: 'api.groups.components.description',
      message: '用于渲染标准配置或 compiler/adapter 产物的主要 React 入口。'
    }),
    exports: [
      'DynamicForm',
      'CompiledDynamicForm',
      'DynamicFormProvider',
      'FormChainEffectEngineWrapper'
    ],
    docs: '/docs/development'
  },
  {
    title: 'Hooks',
    description: translate({
      id: 'api.groups.hooks.description',
      message: '初始化 effect handlers、访问上下文和复用 store 初始化逻辑。'
    }),
    exports: ['useInitHandlers', 'useFormChainContext', 'useStoreInit'],
    docs: '/docs/effects-and-handlers'
  },
  {
    title: 'Config / Types',
    description: translate({
      id: 'api.groups.configTypes.description',
      message: '描述表单配置、字段配置、UI 配置、render hooks 参数和核心值类型。'
    }),
    exports: ['FormConfig', 'BaseFieldConfig', 'DynamicFormProps', 'UIConfig', 'FormValues'],
    docs: '/docs/configuration'
  },
  {
    title: 'Component Registry',
    description: translate({
      id: 'api.groups.componentRegistry.description',
      message: '注册或扩展字段组件，并访问默认 Ant Design 组件集合。'
    }),
    exports: [
      'ComponentRegistryManager',
      'DefaultRegistryFieldComponents',
      'ComponentRegistryConfig'
    ],
    docs: '/docs/rendering-and-ui'
  },
  {
    title: 'Compiler / Modules',
    description: translate({
      id: 'api.groups.compilerModules.description',
      message: '把领域字段模块编译为标准 FormConfig，保留运行时渲染管线不变。'
    }),
    exports: ['compileFormConfig', 'ModuleRegistryManager', 'defaultModuleRegistry', 'FieldModule'],
    docs: '/docs/compiler-foundation'
  },
  {
    title: 'Adapters',
    description: translate({
      id: 'api.groups.adapters.description',
      message: '把 ModuleConfig、JsonSchema、OpenAPI 或 metadata 输入归一化为模块配置。'
    }),
    exports: [
      'adaptModuleConfigs',
      'compileAdaptedFormConfig',
      'JsonSchemaAdapter',
      'OpenApiAdapter',
      'MetadataAdapter'
    ],
    docs: '/docs/adapter-foundation'
  },
  {
    title: 'Rules',
    description: translate({
      id: 'api.groups.rules.description',
      message: '声明式同步规则层，可编译为标准 effects 并复用现有处理管线。'
    }),
    exports: ['RuleEngine', 'createRuleEngine', 'compileRulesToEffect', 'evaluateRule'],
    docs: '/docs/rule-engine'
  },
  {
    title: 'Field Address',
    description: translate({
      id: 'api.groups.fieldAddress.description',
      message: '分离稳定字段 id 与 Ant Design NamePath，支持嵌套值路径。'
    }),
    exports: ['getFieldName', 'resolveFieldAddress', 'FieldAddress'],
    docs: '/docs/field-address'
  },
  {
    title: 'Utilities',
    description: translate({
      id: 'api.groups.utilities.description',
      message: '默认配置和配置处理入口，主要服务高级集成与测试场景。'
    }),
    exports: ['getDefaultConfig', 'processFormConfig'],
    docs: '/docs/ARCHITECTURE'
  }
];

export default function Api(): JSX.Element {
  return (
    <Layout
      title="API"
      description={translate({
        id: 'api.layout.description',
        message: '@whynotsnow/dynamic-form 的手写公共 API 摘要。'
      })}
    >
      <main className={styles.page}>
        <div className="container">
          <section className={styles.intro}>
            <Heading as="h1">API</Heading>
            <p>
              <Translate id="api.page.description">
                这里按用途整理 src/exports.ts
                的公共导出，作为快速查找入口。完整行为说明仍以专题文档为准。
              </Translate>
            </p>
          </section>

          <section className={styles.groups}>
            {apiGroups.map((group) => (
              <article className={styles.group} key={group.title}>
                <Heading as="h2">{group.title}</Heading>
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
          </section>
        </div>
      </main>
    </Layout>
  );
}
