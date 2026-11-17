import { spawn } from 'node:child_process';
import { mkdtemp, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDirectory, '..');
const siteDirectory = path.join(workspaceRoot, 'apps/docs-site');
const docusaurusBin = path.join(siteDirectory, 'node_modules/@docusaurus/core/bin/docusaurus.mjs');
const configPath = path.join(siteDirectory, 'docusaurus.config.ts');
const localLocaleUrls =
  process.argv[2] === 'all'
    ? {
        'zh-CN': 'http://localhost:3001',
        en: 'http://localhost:3002'
      }
    : undefined;
const locales =
  process.argv[2] === 'all'
    ? [
        { locale: 'zh-CN', port: 3001 },
        { locale: 'en', port: 3002 }
      ]
    : process.argv[2] === 'en'
      ? [{ locale: 'en', port: 3002 }]
      : [{ locale: 'zh-CN', port: 3001 }];

const children = [];
const temporarySiteDirectories = [];
let shuttingDown = false;

const createIsolatedSiteDirectory = async (locale) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), `dynamic-form-docs-${locale}-`));
  temporarySiteDirectories.push(directory);

  for (const entry of [
    'node_modules',
    'package.json',
    'sidebars.ts',
    'src',
    'static'
  ]) {
    await symlink(path.join(siteDirectory, entry), path.join(directory, entry));
  }

  return directory;
};

const stopChildren = (signal = 'SIGTERM') => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
};

process.on('SIGINT', () => stopChildren('SIGINT'));
process.on('SIGTERM', () => stopChildren('SIGTERM'));

const startLocale = async ({ locale, port }) => {
  const isolatedSiteDirectory = await createIsolatedSiteDirectory(locale);
  console.log(
    `[${locale}] starting isolated docs-site on http://localhost:${port}${locale === 'en' ? '/en/' : '/'}`
  );

  const child = spawn(
    process.execPath,
    [docusaurusBin, 'start', '--locale', locale, '--port', String(port), '--config', configPath],
    {
      cwd: isolatedSiteDirectory,
      env: {
        ...process.env,
        ...(localLocaleUrls
          ? {
              SITE_URL: localLocaleUrls[locale],
              SITE_URL_ZH_CN: localLocaleUrls['zh-CN'],
              SITE_URL_EN: localLocaleUrls.en,
              SITE_DOCS_PATH: path.join(siteDirectory, 'docs'),
              SITE_I18N_PATH: path.join(siteDirectory, 'i18n')
            }
          : {}),
        WATCHPACK_POLLING: 'true'
      },
      stdio: 'inherit'
    }
  );
  children.push(child);

  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (!shuttingDown && code !== 0) stopChildren();
      resolve({ code: code ?? 1, signal });
    });
  });
};

try {
  const results = await Promise.all(locales.map(startLocale));
  const failed = results.find((result) => result.code !== 0 && !shuttingDown);
  if (failed) process.exitCode = failed.code;
} catch (error) {
  stopChildren();
  console.error(error);
  process.exitCode = 1;
} finally {
  await Promise.all(
    temporarySiteDirectories.map((directory) => rm(directory, { recursive: true, force: true }))
  );
}
