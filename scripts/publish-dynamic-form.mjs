import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const expectedNpmUser = 'whynotsnow';
const expectedRegistry = 'https://registry.npmjs.org/';
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packages = [
  {
    name: '@whynotsnow/dynamic-form-core',
    dir: resolve(rootDir, 'packages/dynamic-form-core')
  },
  {
    name: '@whynotsnow/dynamic-form',
    dir: resolve(rootDir, 'packages/dynamic-form')
  }
];
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
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

function readPackageJson(packageDir) {
  const packageJsonPath = resolve(packageDir, 'package.json');
  return JSON.parse(readFileSync(packageJsonPath, 'utf8'));
}

function readReleasePackages() {
  return packages.map((packageInfo) => {
    const packageJson = readPackageJson(packageInfo.dir);

    if (packageJson.name !== packageInfo.name) {
      console.error(
        `[ERROR] Expected package "${packageInfo.name}", but got "${packageJson.name}".`
      );
      process.exitCode = 1;
      throw new Error('invalid package name');
    }

    if (!packageJson.version) {
      console.error(`[ERROR] Could not read package version from ${packageInfo.name}.`);
      process.exitCode = 1;
      throw new Error('missing package version');
    }

    return {
      ...packageInfo,
      version: packageJson.version
    };
  });
}

function ensureVersionDoesNotExist(packageInfo) {
  console.log(`Checking whether ${packageInfo.name}@${packageInfo.version} already exists on npm...`);
  const viewResult = run(npm, ['view', `${packageInfo.name}@${packageInfo.version}`, 'version'], {
    capture: true
  });

  if (viewResult.status === 0) {
    console.error(`[ERROR] ${packageInfo.name}@${packageInfo.version} already exists on npm.`);
    console.error('npm does not allow publishing the same version twice.');
    process.exitCode = 1;
    throw new Error('version already exists');
  }

  const viewOutput = `${viewResult.stdout ?? ''}\n${viewResult.stderr ?? ''}`;
  if (!/E404|404|not found/i.test(viewOutput)) {
    console.error(`[ERROR] Failed to check ${packageInfo.name}@${packageInfo.version} on npm.`);
    console.error(viewOutput.trim());
    process.exitCode = viewResult.status ?? 1;
    throw new Error('version check failed');
  }

  console.log(`[OK] ${packageInfo.name}@${packageInfo.version} was not found on npm.`);
}

async function waitBeforeExit() {
  const rl = createInterface({ input, output });
  await rl.question('\nPress Enter to close this window.');
  rl.close();
}

async function main() {
  try {
    requireSuccess(npm, ['--version'], { capture: true });
    requireSuccess(pnpm, ['--version'], { capture: true });
    requireSuccess(node, ['--version'], { capture: true });

    const releasePackages = readReleasePackages();

    console.log('');
    console.log('Publishing DynamicForm packages:');
    releasePackages.forEach((packageInfo) => {
      console.log(`- ${packageInfo.name}@${packageInfo.version}`);
    });
    console.log(`Workspace root: ${rootDir}`);
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
    console.log('');
    releasePackages.forEach(ensureVersionDoesNotExist);

    console.log('');
    console.log('Running release checks...');
    requireSuccess(pnpm, ['run', 'type-check']);
    requireSuccess(pnpm, ['run', 'test']);
    requireSuccess(pnpm, ['run', 'build']);

    console.log('');
    console.log('Running package dry-run...');
    releasePackages.forEach((packageInfo) => {
      requireSuccess(npm, ['pack', '--dry-run'], {
        cwd: packageInfo.dir,
        env: {
          HUSKY: '0'
        }
      });
    });

    console.log('');
    console.log('Ready to publish packages in order: core, then dynamic-form.');
    console.log('This operation is permanent for these version numbers.');

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
    releasePackages.forEach((packageInfo) => {
      requireSuccess(npm, ['publish', '--access', 'public'], {
        cwd: packageInfo.dir,
        env: {
          HUSKY: '0'
        }
      });
    });

    console.log('');
    console.log('[OK] Published DynamicForm packages.');
    console.log('Verify with:');
    releasePackages.forEach((packageInfo) => {
      console.log(`npm view ${packageInfo.name}@${packageInfo.version} version`);
    });
  } catch {
    if (!process.exitCode) {
      process.exitCode = 1;
    }
  } finally {
    await waitBeforeExit();
  }
}

await main();
