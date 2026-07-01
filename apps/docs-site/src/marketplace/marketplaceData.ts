import { translate } from '@docusaurus/Translate';
import {
  editableTableFieldSource,
  fieldErrorsHandlerSource,
  highlightHandlerSource,
  registerComponentSource,
  registerHandlerSource,
  remoteSelectFieldSource,
  toastHandlerSource,
  userPickerFieldSource
} from './snippets/copyInstallSnippets';

export type MarketplaceInstallMode = 'builtin' | 'copy';
export type MarketplaceKind =
  | 'builtin-component'
  | 'builtin-handler'
  | 'component-snippet'
  | 'handler-snippet'
  | 'recipe';

export interface MarketplaceCodeBlock {
  title: string;
  language: 'tsx' | 'ts' | 'json';
  code: string;
}

export interface MarketplaceItem {
  id: string;
  installMode: MarketplaceInstallMode;
  kind: MarketplaceKind;
  title: string;
  description: string;
  tags: string[];
  dependencies?: string[];
  previewId: string;
  codeBlocks: MarketplaceCodeBlock[];
  docsPath?: string;
}

export interface MarketplaceFilter {
  id: 'all' | MarketplaceKind;
  label: string;
}

const builtinComponentNames = [
  'Password',
  'ConfirmPassword',
  'TextInput',
  'NumberInput',
  'SelectField',
  'DatePicker',
  'Switch',
  'Rate',
  'TextDisplay',
  'CheckboxGroup',
  'Select',
  'TextArea'
];

const builtinHandlerNames = [
  'value',
  'visible',
  'disabled',
  'readonly',
  'groupsVisible',
  'formItemProps',
  'componentProps',
  'formProps',
  'buttonProps',
  'cardProps',
  'rowProps',
  'colProps',
  'submitAreaProps'
];

const builtinComponentDescription = translate({
  id: 'marketplace.data.builtinComponent.description',
  message: '系统内置字段组件，无需复制安装，可直接在 FormConfig 的 component 中引用。'
});

const builtinHandlerDescription = translate({
  id: 'marketplace.data.builtinHandler.description',
  message:
    '系统内置 effect result handler，调用 useInitHandlers() 后即可处理同名 effect result key。'
});

export const marketplaceFilters: MarketplaceFilter[] = [
  {
    id: 'all',
    label: translate({ id: 'marketplace.filters.all', message: '全部' })
  },
  {
    id: 'builtin-component',
    label: translate({ id: 'marketplace.filters.builtinComponent', message: '内置组件' })
  },
  {
    id: 'builtin-handler',
    label: translate({ id: 'marketplace.filters.builtinHandler', message: '内置 handlers' })
  },
  {
    id: 'component-snippet',
    label: translate({ id: 'marketplace.filters.componentSnippet', message: '组件片段' })
  },
  {
    id: 'handler-snippet',
    label: translate({ id: 'marketplace.filters.handlerSnippet', message: 'Handler 片段' })
  },
  {
    id: 'recipe',
    label: translate({ id: 'marketplace.filters.recipe', message: '组合方案' })
  }
];

const builtinComponentItems: MarketplaceItem[] = builtinComponentNames.map((componentName) => ({
  id: `builtin-component-${componentName}`,
  installMode: 'builtin',
  kind: 'builtin-component',
  title: componentName,
  description: builtinComponentDescription,
  tags: ['DynamicForm', 'Built-in', 'Component'],
  previewId: `builtin-component-${componentName}`,
  docsPath: '/docs/configuration',
  codeBlocks: [
    {
      title: translate({ id: 'marketplace.code.useInFormConfig', message: 'FormConfig 使用' }),
      language: 'ts',
      code: `const formConfig = {
  fields: [
    { id: '${componentName.toLowerCase()}', label: '${componentName}', component: '${componentName}' }
  ]
};`
    }
  ]
}));

const builtinHandlerItems: MarketplaceItem[] = builtinHandlerNames.map((handlerName) => ({
  id: `builtin-handler-${handlerName}`,
  installMode: 'builtin',
  kind: 'builtin-handler',
  title: handlerName,
  description: builtinHandlerDescription,
  tags: ['DynamicForm', 'Built-in', 'Handler'],
  previewId: `builtin-handler-${handlerName}`,
  docsPath: '/docs/effects-and-handlers',
  codeBlocks: [
    {
      title: translate({ id: 'marketplace.code.initHandlers', message: '初始化 handlers' }),
      language: 'tsx',
      code: `useInitHandlers();`
    },
    {
      title: translate({ id: 'marketplace.code.effectResult', message: 'Effect result 示例' }),
      language: 'ts',
      code: `effect: () => ({
  ${handlerName}: ${handlerName === 'visible' || handlerName === 'disabled' || handlerName === 'readonly' ? 'true' : "'示例值'"}
})`
    }
  ]
}));

const copyComponentItems: MarketplaceItem[] = [
  {
    id: 'copy-component-remote-select',
    installMode: 'copy',
    kind: 'component-snippet',
    title: 'RemoteSelectField',
    description: translate({
      id: 'marketplace.data.remoteSelect.description',
      message: '封装可搜索的远程选择字段，适合团队、组织、项目等异步选项场景。'
    }),
    tags: ['ComponentRegistry', 'Select', 'Async Options'],
    dependencies: ['antd'],
    previewId: 'snippet-component-remote-select',
    docsPath: '/docs/rendering-and-ui',
    codeBlocks: [
      {
        title: translate({ id: 'marketplace.code.componentSource', message: '组件源码' }),
        language: 'tsx',
        code: remoteSelectFieldSource
      },
      {
        title: translate({ id: 'marketplace.code.registerComponent', message: '注册代码' }),
        language: 'tsx',
        code: registerComponentSource
      },
      {
        title: translate({ id: 'marketplace.code.formConfigExample', message: 'FormConfig 示例' }),
        language: 'ts',
        code: `{ id: 'team', label: '团队', component: 'RemoteSelectField' }`
      }
    ]
  },
  {
    id: 'copy-component-user-picker',
    installMode: 'copy',
    kind: 'component-snippet',
    title: 'UserPickerField',
    description: translate({
      id: 'marketplace.data.userPicker.description',
      message: '封装带头像展示的人员选择字段，适合负责人、审批人和协作者选择。'
    }),
    tags: ['ComponentRegistry', 'Select', 'User'],
    dependencies: ['antd'],
    previewId: 'snippet-component-user-picker',
    docsPath: '/docs/rendering-and-ui',
    codeBlocks: [
      {
        title: translate({ id: 'marketplace.code.componentSource', message: '组件源码' }),
        language: 'tsx',
        code: userPickerFieldSource
      },
      {
        title: translate({ id: 'marketplace.code.registerComponent', message: '注册代码' }),
        language: 'tsx',
        code: registerComponentSource
      },
      {
        title: translate({ id: 'marketplace.code.formConfigExample', message: 'FormConfig 示例' }),
        language: 'ts',
        code: `{ id: 'owner', label: '负责人', component: 'UserPickerField' }`
      }
    ]
  },
  {
    id: 'copy-component-editable-table',
    installMode: 'copy',
    kind: 'component-snippet',
    title: 'EditableTableField',
    description: translate({
      id: 'marketplace.data.editableTable.description',
      message: '封装可编辑明细表格字段，适合订单行、费用明细和任务拆分。'
    }),
    tags: ['ComponentRegistry', 'Table', 'ProComponents'],
    dependencies: ['antd', '@ant-design/pro-components'],
    previewId: 'snippet-component-editable-table',
    docsPath: '/docs/rendering-and-ui',
    codeBlocks: [
      {
        title: translate({ id: 'marketplace.code.componentSource', message: '组件源码' }),
        language: 'tsx',
        code: editableTableFieldSource
      },
      {
        title: translate({ id: 'marketplace.code.registerComponent', message: '注册代码' }),
        language: 'tsx',
        code: registerComponentSource
      },
      {
        title: translate({ id: 'marketplace.code.formConfigExample', message: 'FormConfig 示例' }),
        language: 'ts',
        code: `{ id: 'items', label: '明细', component: 'EditableTableField' }`
      }
    ]
  }
];

const copyHandlerItems: MarketplaceItem[] = [
  {
    id: 'copy-handler-toast',
    installMode: 'copy',
    kind: 'handler-snippet',
    title: 'toast handler',
    description: translate({
      id: 'marketplace.data.toast.description',
      message: '把 effect result 转换为轻量消息提示，适合保存前提示或联动反馈。'
    }),
    tags: ['useInitHandlers', 'Message', 'Effect Result'],
    dependencies: ['antd'],
    previewId: 'snippet-handler-toast',
    docsPath: '/docs/effects-and-handlers',
    codeBlocks: [
      {
        title: translate({ id: 'marketplace.code.handlerSource', message: 'Handler 源码' }),
        language: 'ts',
        code: toastHandlerSource
      },
      {
        title: translate({ id: 'marketplace.code.registerHandler', message: '注册代码' }),
        language: 'tsx',
        code: registerHandlerSource
      },
      {
        title: translate({ id: 'marketplace.code.effectResult', message: 'Effect result 示例' }),
        language: 'ts',
        code: `effect: () => ({ toast: '状态已更新' })`
      }
    ]
  },
  {
    id: 'copy-handler-highlight',
    installMode: 'copy',
    kind: 'handler-snippet',
    title: 'highlight handler',
    description: translate({
      id: 'marketplace.data.highlight.description',
      message: '把业务语义 highlight 转换为字段渲染 meta，适合重点字段提示。'
    }),
    tags: ['useInitHandlers', 'Render Meta', 'Effect Result'],
    previewId: 'snippet-handler-highlight',
    docsPath: '/docs/effects-and-handlers',
    codeBlocks: [
      {
        title: translate({ id: 'marketplace.code.handlerSource', message: 'Handler 源码' }),
        language: 'ts',
        code: highlightHandlerSource
      },
      {
        title: translate({ id: 'marketplace.code.registerHandler', message: '注册代码' }),
        language: 'tsx',
        code: registerHandlerSource
      },
      {
        title: translate({ id: 'marketplace.code.effectResult', message: 'Effect result 示例' }),
        language: 'ts',
        code: `effect: () => ({ highlight: true })`
      }
    ]
  },
  {
    id: 'copy-handler-field-errors',
    installMode: 'copy',
    kind: 'handler-snippet',
    title: 'fieldErrors handler',
    description: translate({
      id: 'marketplace.data.fieldErrors.description',
      message: '把服务端字段错误写入 Ant Design Form，适合提交前后的业务校验反馈。'
    }),
    tags: ['useInitHandlers', 'Validation', 'Effect Result'],
    previewId: 'snippet-handler-field-errors',
    docsPath: '/docs/effects-and-handlers',
    codeBlocks: [
      {
        title: translate({ id: 'marketplace.code.handlerSource', message: 'Handler 源码' }),
        language: 'ts',
        code: fieldErrorsHandlerSource
      },
      {
        title: translate({ id: 'marketplace.code.registerHandler', message: '注册代码' }),
        language: 'tsx',
        code: registerHandlerSource
      },
      {
        title: translate({ id: 'marketplace.code.effectResult', message: 'Effect result 示例' }),
        language: 'ts',
        code: `effect: () => ({ fieldErrors: { email: '邮箱已被占用' } })`
      }
    ]
  }
];

const recipeItems: MarketplaceItem[] = [
  {
    id: 'recipe-remote-search',
    installMode: 'copy',
    kind: 'recipe',
    title: translate({ id: 'marketplace.recipe.remoteSearch.title', message: '远程搜索字段' }),
    description: translate({
      id: 'marketplace.recipe.remoteSearch.description',
      message:
        '使用 RemoteSelectField 接入远程选项搜索，并通过 componentRegistry 注册到 DynamicForm。'
    }),
    tags: ['Recipe', 'RemoteSelectField'],
    dependencies: ['antd'],
    previewId: 'recipe-remote-search',
    docsPath: '/docs/rendering-and-ui',
    codeBlocks: [
      {
        title: translate({ id: 'marketplace.code.componentSource', message: '组件源码' }),
        language: 'tsx',
        code: remoteSelectFieldSource
      },
      {
        title: translate({ id: 'marketplace.code.registerComponent', message: '注册代码' }),
        language: 'tsx',
        code: registerComponentSource
      }
    ]
  },
  {
    id: 'recipe-approver-picker',
    installMode: 'copy',
    kind: 'recipe',
    title: translate({ id: 'marketplace.recipe.approverPicker.title', message: '审批人选择' }),
    description: translate({
      id: 'marketplace.recipe.approverPicker.description',
      message: '使用 UserPickerField 为审批流或任务流提供人员选择能力。'
    }),
    tags: ['Recipe', 'UserPickerField'],
    dependencies: ['antd'],
    previewId: 'recipe-approver-picker',
    docsPath: '/docs/rendering-and-ui',
    codeBlocks: [
      {
        title: translate({ id: 'marketplace.code.componentSource', message: '组件源码' }),
        language: 'tsx',
        code: userPickerFieldSource
      },
      {
        title: translate({ id: 'marketplace.code.registerComponent', message: '注册代码' }),
        language: 'tsx',
        code: registerComponentSource
      }
    ]
  },
  {
    id: 'recipe-editable-table',
    installMode: 'copy',
    kind: 'recipe',
    title: translate({ id: 'marketplace.recipe.editableTable.title', message: '表格明细字段' }),
    description: translate({
      id: 'marketplace.recipe.editableTable.description',
      message: '使用 EditableTableField 在表单中维护一组结构化明细数据。'
    }),
    tags: ['Recipe', 'EditableTableField'],
    dependencies: ['antd', '@ant-design/pro-components'],
    previewId: 'recipe-editable-table',
    docsPath: '/docs/rendering-and-ui',
    codeBlocks: [
      {
        title: translate({ id: 'marketplace.code.componentSource', message: '组件源码' }),
        language: 'tsx',
        code: editableTableFieldSource
      },
      {
        title: translate({ id: 'marketplace.code.registerComponent', message: '注册代码' }),
        language: 'tsx',
        code: registerComponentSource
      }
    ]
  }
];

export const marketplaceItems: MarketplaceItem[] = [
  ...builtinComponentItems,
  ...builtinHandlerItems,
  ...copyComponentItems,
  ...copyHandlerItems,
  ...recipeItems
];
