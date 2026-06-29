import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'node:path';

const config: Config = {
  title: 'DynamicForm',
  tagline: '基于 Ant Design 的配置化 React 表单',

  url: 'https://whynotsnow.github.io',
  baseUrl: '/dynamic-form/',
  trailingSlash: true,

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
    locales: ['zh-CN', 'en']
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
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
            resolve: {
              alias: {
                '@': path.resolve(__dirname, '../../src')
              }
            },
            watchOptions: {
              ignored: ['**/node_modules/**', '**/build/**', '**/.docusaurus/**', '**/dist/**']
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
          label: '文档'
        },
        {
          to: '/playground',
          label: '演练场',
          position: 'left'
        },
        {
          to: '/examples',
          label: '示例',
          position: 'left'
        },
        {
          to: '/api',
          label: 'API',
          position: 'left'
        },
        {
          type: 'localeDropdown',
          position: 'right'
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
          title: '文档',
          items: [
            {
              label: '文档首页',
              to: '/docs'
            },
            {
              label: '演练场',
              to: '/playground'
            },
            {
              label: '示例',
              to: '/examples'
            },
            {
              label: 'API',
              to: '/api'
            }
          ]
        },
        {
          title: '项目',
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
