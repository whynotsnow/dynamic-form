import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const expectedPackageName = '@whynotsnow/dynamic-form';
const expectedNpmUser = 'whynotsnow';
const expectedRegistry = 'https://registry.npmjs.org/';
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageDir = resolve(rootDir, 'packages/dynamic-form');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const node = process.platform === 'win32' ? 'node.exe' : 'node';

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd ?? rootDir,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: options.capture ? 'pipe' : 'inherit',
    env: {
      ...process.env,
      ...options.env
    }
  });
}

function requireSuccess(command, args, options = {}) {
  const result = run(command, args, options);

  if (result.error) {
    console.error(`[ERROR] Failed to run ${command}: ${result.error.message}`);
    process.exitCode = 1;
    throw new Error('command failed');
  }

  if (result.status !== 0) {
    console.error(`[ERROR] Command failed: ${command} ${args.join(' ')}`);
    process.exitCode = result.status ?? 1;
    throw new Error('command failed');
  }

  return result;
}

function readPackageJson() {
  const packageJsonPath = resolve(packageDir, 'package.json');
  return JSON.parse(readFileSync(packageJsonPath, 'utf8'));
}

async function waitBeforeExit() {
  const rl = createInterface({ input, output });
  await rl.question('\nPress Enter to close this window.');
  rl.close();
}

async function main() {
  try {
    requireSuccess(npm, ['--version'], { capture: true });
    requireSuccess(node, ['--version'], { capture: true });

    const packageJson = readPackageJson();
    const packageName = packageJson.name;
    const packageVersion = packageJson.version;

    if (packageName !== expectedPackageName) {
      console.error(`[ERROR] Expected package "${expectedPackageName}", but got "${packageName}".`);
      process.exitCode = 1;
      return;
    }

    if (!packageVersion) {
      console.error('[ERROR] Could not read package version from package.json.');
      process.exitCode = 1;
      return;
    }

    console.log('');
    console.log(`Publishing ${packageName}@${packageVersion}`);
    console.log(`Workspace root: ${rootDir}`);
    console.log(`Package workspace: ${packageDir}`);
    console.log('Auth mode: npm default user config');
    console.log('');

    const registryResult = requireSuccess(npm, ['config', 'get', 'registry'], { capture: true });
    const registry = registryResult.stdout.trim();

    if (registry !== expectedRegistry) {
      console.error(`[ERROR] Expected npm registry "${expectedRegistry}", but got "${registry}".`);
      console.error('Set the npm registry to the official npm registry before publishing.');
      process.exitCode = 1;
      return;
    }

    console.log(`[OK] npm registry: ${registry}`);

    const whoami = requireSuccess(npm, ['whoami'], { capture: true });
    const npmUser = whoami.stdout.trim();

    if (npmUser !== expectedNpmUser) {
      console.error(`[ERROR] Expected npm user "${expectedNpmUser}", but got "${npmUser}".`);
      console.error('Run "npm login" first, then run this script again.');
      process.exitCode = 1;
      return;
    }

    console.log(`[OK] npm user: ${npmUser}`);
    console.log(`[OK] package.json version is ${packageVersion}`);

    console.log('');
    console.log(`Checking whether ${packageName}@${packageVersion} already exists on npm...`);
    const viewResult = run(npm, ['view', `${packageName}@${packageVersion}`, 'version'], {
      capture: true
    });

    if (viewResult.status === 0) {
      console.error(`[ERROR] ${packageName}@${packageVersion} already exists on npm.`);
      console.error('npm does not allow publishing the same version twice.');
      process.exitCode = 1;
      return;
    }

    const viewOutput = `${viewResult.stdout ?? ''}\n${viewResult.stderr ?? ''}`;
    if (!/E404|404|not found/i.test(viewOutput)) {
      console.error('[ERROR] Failed to check the current version on npm.');
      console.error(viewOutput.trim());
      process.exitCode = viewResult.status ?? 1;
      return;
    }

    console.log('[OK] Exact version was not found on npm.');

    console.log('');
    console.log('Running release checks...');
    requireSuccess(npm, ['run', 'type-check']);
    requireSuccess(npm, ['run', 'test']);
    requireSuccess(npm, ['run', 'build']);

    console.log('');
    console.log('Running package dry-run...');
    requireSuccess(npm, ['pack', '--dry-run'], {
      cwd: packageDir,
      env: {
        HUSKY: '0'
      }
    });

    console.log('');
    console.log(`Ready to publish ${packageName}@${packageVersion}.`);
    console.log('This operation is permanent for this version number.');

    const rl = createInterface({ input, output });
    const confirmation = await rl.question('Type PUBLISH to continue: ');
    rl.close();

    if (confirmation !== 'PUBLISH') {
      console.log('Publish cancelled.');
      process.exitCode = 1;
      return;
    }

    console.log('');
    console.log('Publishing to npm...');
    requireSuccess(npm, ['publish', '--access', 'public'], {
      cwd: packageDir,
      env: {
        HUSKY: '0'
      }
    });

    console.log('');
    console.log(`[OK] Published ${packageName}@${packageVersion}.`);
    console.log('Verify with:');
    console.log(`npm view ${packageName}@${packageVersion} version`);
  } catch {
    if (!process.exitCode) {
      process.exitCode = 1;
    }
  } finally {
    await waitBeforeExit();
  }
}

await main();
