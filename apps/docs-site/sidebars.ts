import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'category',
      label: 'Overview',
      items: ['README']
    },
    {
      type: 'category',
      label: 'Architecture',
      items: ['ARCHITECTURE', 'runtime-layer', 'field-address']
    },
    {
      type: 'category',
      label: 'Usage',
      items: ['configuration', 'development', 'effects-and-handlers', 'rendering-and-ui']
    },
    {
      type: 'category',
      label: 'Extension Layers',
      items: [
        'compiler-foundation',
        'rule-engine',
        'adapter-foundation',
        'schema-adapters'
      ]
    },
    {
      type: 'category',
      label: 'Maintenance',
      items: ['maintenance']
    }
  ]
};

export default sidebars;
