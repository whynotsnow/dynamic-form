import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'DynamicForm',
  tagline: 'Configuration-driven React forms powered by Ant Design',

  url: 'https://whynotsnow.github.io',
  baseUrl: '/dynamic-form/',

  organizationName: 'whynotsnow',
  projectName: 'dynamic-form',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn'
    }
  },

  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN']
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: '../../docs',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts'
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css'
        }
      } satisfies Preset.Options
    ]
  ],

  plugins: [
    function workspaceWatchOptions() {
      return {
        name: 'workspace-watch-options',
        configureWebpack() {
          return {
            watchOptions: {
              ignored: [
                '**/node_modules/**',
                '**/build/**',
                '**/.docusaurus/**',
                '**/dist/**'
              ]
            }
          };
        }
      };
    }
  ],

  themeConfig: {
    navbar: {
      title: 'DynamicForm',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Docs'
        },
        {
          to: '/playground',
          label: 'Playground',
          position: 'left'
        },
        {
          href: 'https://github.com/whynotsnow/dynamic-form',
          label: 'GitHub',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Documentation',
              to: '/docs'
            },
            {
              label: 'Playground',
              to: '/playground'
            }
          ]
        },
        {
          title: 'Project',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/whynotsnow/dynamic-form'
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/@whynotsnow/dynamic-form'
            }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} DynamicForm.`
    },
    prism: {
      theme: require('prism-react-renderer').themes.github,
      darkTheme: require('prism-react-renderer').themes.dracula
    }
  } satisfies Preset.ThemeConfig
};

export default config;
