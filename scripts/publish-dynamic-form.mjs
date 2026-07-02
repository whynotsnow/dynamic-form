import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const expectedNpmUser = 'whynotsnow';
const expectedRegistry = 'https://registry.npmjs.org/';
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rootPackagePath = resolve(rootDir, 'package.json');
const releasePackageDescriptors = [
  {
    id: 'core',
    name: '@whynotsnow/dynamic-form-core',
    dir: resolve(rootDir, 'packages/dynamic-form-core')
  },
  {
    id: 'react',
    name: '@whynotsnow/dynamic-form',
    dir: resolve(rootDir, 'packages/dynamic-form')
  }
];
const corePackageName = '@whynotsnow/dynamic-form-core';
const reactPackageName = '@whynotsnow/dynamic-form';
const publishAvailabilityTimeoutMs = 120_000;
const publishAvailabilityIntervalMs = 5_000;
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

function readRootPackageJson() {
  return JSON.parse(readFileSync(rootPackagePath, 'utf8'));
}

function readReleasePackages() {
  return releasePackageDescriptors.map((packageInfo) => {
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
      packageJson,
      version: packageJson.version
    };
  });
}

function getPublishedVersion(packageInfo, options = {}) {
  if (options.log !== false) {
    console.log(
      `Checking whether ${packageInfo.name}@${packageInfo.version} already exists on npm...`
    );
  }
  const viewResult = run(npm, ['view', `${packageInfo.name}@${packageInfo.version}`, 'version'], {
    capture: true
  });

  if (viewResult.status === 0) {
    return viewResult.stdout.trim();
  }

  const viewOutput = `${viewResult.stdout ?? ''}\n${viewResult.stderr ?? ''}`;
  if (/E404|404|not found/i.test(viewOutput)) {
    return null;
  }

  if (options.allowTransientFailure) {
    return undefined;
  }

  console.error(`[ERROR] Failed to check ${packageInfo.name}@${packageInfo.version} on npm.`);
  console.error(viewOutput.trim());
  process.exitCode = viewResult.status ?? 1;
  throw new Error('version check failed');
}

function inspectPublishState(releasePackages) {
  return releasePackages.map((packageInfo) => {
    const publishedVersion = getPublishedVersion(packageInfo);
    const published = publishedVersion === packageInfo.version;

    if (published) {
      console.log(`[OK] ${packageInfo.name}@${packageInfo.version} already exists on npm.`);
    } else {
      console.log(`[OK] ${packageInfo.name}@${packageInfo.version} was not found on npm.`);
    }

    return {
      ...packageInfo,
      published
    };
  });
}

function validateReleasePackages(rootPackageJson, releasePackages) {
  const corePackage = releasePackages.find((packageInfo) => packageInfo.name === corePackageName);
  const reactPackage = releasePackages.find((packageInfo) => packageInfo.name === reactPackageName);

  if (!corePackage || !reactPackage) {
    console.error('[ERROR] Release package list must include core and dynamic-form packages.');
    process.exitCode = 1;
    throw new Error('invalid release package list');
  }

  const expectedVersion = rootPackageJson.version;
  const mismatchedVersions = [
    {
      name: rootPackageJson.name ?? 'workspace root',
      version: rootPackageJson.version
    },
    ...releasePackages.map((packageInfo) => ({
      name: packageInfo.name,
      version: packageInfo.version
    }))
  ].filter((packageInfo) => packageInfo.version !== expectedVersion);

  if (mismatchedVersions.length > 0) {
    console.error('[ERROR] DynamicForm uses lockstep package versions.');
    console.error(`Expected every release package to use version ${expectedVersion}.`);
    mismatchedVersions.forEach((packageInfo) => {
      console.error(`- ${packageInfo.name}: ${packageInfo.version}`);
    });
    console.error(
      `Run "pnpm run version:sync -- ${expectedVersion}" or choose one release version first.`
    );
    process.exitCode = 1;
    throw new Error('lockstep version mismatch');
  }

  const coreDependency = reactPackage.packageJson.dependencies?.[corePackage.name];

  if (!coreDependency) {
    console.error(`[ERROR] ${reactPackage.name} must depend on ${corePackage.name}.`);
    process.exitCode = 1;
    throw new Error('missing core dependency');
  }

  if (coreDependency.startsWith('workspace:')) {
    console.error(
      `[ERROR] ${reactPackage.name} dependency ${corePackage.name} must not use "${coreDependency}".`
    );
    console.error('Published npm packages cannot depend on workspace protocol ranges.');
    process.exitCode = 1;
    throw new Error('invalid core dependency range');
  }

  if (coreDependency !== corePackage.version) {
    console.error(
      `[ERROR] ${reactPackage.name} depends on ${corePackage.name}@${coreDependency}, ` +
        `but this release will publish ${corePackage.name}@${corePackage.version}.`
    );
    console.error('Update the dependency range before publishing.');
    process.exitCode = 1;
    throw new Error('core dependency version mismatch');
  }

  console.log(`[OK] Lockstep version: ${expectedVersion}`);
}

function createPublishPlan(releasePackages) {
  const corePackage = releasePackages.find((packageInfo) => packageInfo.name === corePackageName);
  const reactPackage = releasePackages.find((packageInfo) => packageInfo.name === reactPackageName);

  if (corePackage.published && reactPackage.published) {
    console.error('[ERROR] Both release package versions already exist on npm.');
    console.error(
      'Nothing can be published because npm does not allow publishing the same version twice.'
    );
    process.exitCode = 1;
    throw new Error('release already published');
  }

  if (!corePackage.published && reactPackage.published) {
    console.error(
      `[ERROR] ${reactPackage.name}@${reactPackage.version} exists, but ${corePackage.name}@${corePackage.version} does not.`
    );
    console.error(
      'This inconsistent state would make the React package depend on a missing core package.'
    );
    process.exitCode = 1;
    throw new Error('invalid publish state');
  }

  if (corePackage.published && !reactPackage.published) {
    console.log('');
    console.log(
      `[RESUME] ${corePackage.name}@${corePackage.version} is already published; ` +
        `this run will only publish ${reactPackage.name}@${reactPackage.version}.`
    );
  }

  return releasePackages.filter((packageInfo) => !packageInfo.published);
}

function sleep(ms) {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

async function waitForPackageAvailability(packageInfo) {
  const startedAt = Date.now();
  console.log(
    `Waiting for ${packageInfo.name}@${packageInfo.version} to become available on npm...`
  );

  while (Date.now() - startedAt < publishAvailabilityTimeoutMs) {
    const publishedVersion = getPublishedVersion(packageInfo, {
      allowTransientFailure: true,
      log: false
    });

    if (publishedVersion === packageInfo.version) {
      console.log(`[OK] ${packageInfo.name}@${packageInfo.version} is available on npm.`);
      return;
    }

    await sleep(publishAvailabilityIntervalMs);
  }

  console.error(`[ERROR] Timed out waiting for ${packageInfo.name}@${packageInfo.version} on npm.`);
  console.error('Retry the release script after npm registry propagation catches up.');
  process.exitCode = 1;
  throw new Error('publish availability timeout');
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

    const rootPackageJson = readRootPackageJson();
    const releasePackages = readReleasePackages();
    validateReleasePackages(rootPackageJson, releasePackages);

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
    const inspectedPackages = inspectPublishState(releasePackages);
    const packagesToPublish = createPublishPlan(inspectedPackages);

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
    console.log('Packages to publish in this run:');
    packagesToPublish.forEach((packageInfo) => {
      console.log(`- ${packageInfo.name}@${packageInfo.version}`);
    });
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
    for (const packageInfo of inspectedPackages) {
      if (packageInfo.published) {
        console.log(`[SKIP] ${packageInfo.name}@${packageInfo.version} is already published.`);
        continue;
      }

      requireSuccess(npm, ['publish', '--access', 'public'], {
        cwd: packageInfo.dir,
        env: {
          HUSKY: '0'
        }
      });
      await waitForPackageAvailability(packageInfo);
    }

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
