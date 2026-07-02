import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'category',
      label: '开始',
      items: ['README', 'quick-start']
    },
    {
      type: 'category',
      label: '使用',
      items: ['configuration', 'development', 'effects-and-handlers', 'rendering-and-ui']
    },
    {
      type: 'category',
      label: '高级能力',
      items: [
        'core-package',
        'compiler-foundation',
        'rule-engine',
        'adapter-foundation',
        'schema-adapters'
      ]
    },
    {
      type: 'category',
      label: '深入理解',
      items: ['ARCHITECTURE', 'runtime-layer', 'field-address']
    },
    {
      type: 'category',
      label: '维护',
      items: ['changelog', 'maintenance']
    }
  ]
};

export default sidebars;
