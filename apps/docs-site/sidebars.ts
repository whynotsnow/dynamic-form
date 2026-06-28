import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'category',
      label: '概览',
      items: ['README']
    },
    {
      type: 'category',
      label: '架构',
      items: ['ARCHITECTURE', 'runtime-layer', 'field-address']
    },
    {
      type: 'category',
      label: '使用',
      items: ['configuration', 'development', 'effects-and-handlers', 'rendering-and-ui']
    },
    {
      type: 'category',
      label: '扩展层',
      items: ['compiler-foundation', 'rule-engine', 'adapter-foundation', 'schema-adapters']
    },
    {
      type: 'category',
      label: '维护',
      items: ['maintenance']
    }
  ]
};

export default sidebars;
