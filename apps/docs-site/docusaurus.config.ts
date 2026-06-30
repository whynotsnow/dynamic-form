import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';
import path from 'node:path';

const config: Config = {
  title: 'DynamicForm',
  tagline: '基于 Ant Design 的配置化 React 表单',

  url: process.env.SITE_URL ?? 'https://form.whynotsnow.com',
  baseUrl: process.env.SITE_BASE_URL ?? '/',
  trailingSlash: true,

  organizationName: 'whynotsnow',
  projectName: 'dynamic-form',

  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
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
                '@': path.resolve(__dirname, '../../packages/dynamic-form/src'),
                '@whynotsnow/dynamic-form': path.resolve(
                  __dirname,
                  '../../packages/dynamic-form/src/exports.ts'
                )
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

  themes: ['@docusaurus/theme-mermaid'],

  themeConfig: {
    mermaid: {
      theme: {
        light: 'neutral',
        dark: 'dark'
      }
    },
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
          label: 'demo演示',
          position: 'left'
        },
        {
          to: '/examples',
          label: '配置示例',
          position: 'left'
        },
        {
          to: '/api',
          label: '导出API',
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
              label: 'demo演示',
              to: '/playground'
            },
            {
              label: '配置示例',
              to: '/examples'
            },
            {
              label: '导出API',
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
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula
    }
  } satisfies Preset.ThemeConfig
};

export default config;
