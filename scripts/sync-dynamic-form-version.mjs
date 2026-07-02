import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rootPackagePath = resolve(rootDir, 'package.json');
const corePackagePath = resolve(rootDir, 'packages/dynamic-form-core/package.json');
const reactPackagePath = resolve(rootDir, 'packages/dynamic-form/package.json');
const lockfilePath = resolve(rootDir, 'pnpm-lock.yaml');
const corePackageName = '@whynotsnow/dynamic-form-core';

const nextVersion = process.argv.slice(2).find((arg) => arg !== '--');

function fail(message) {
  console.error(`[ERROR] ${message}`);
  process.exit(1);
}

function isValidSemverLike(version) {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version);
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function updateVersion(filePath, version) {
  const packageJson = readJson(filePath);
  const previousVersion = packageJson.version;
  packageJson.version = version;
  writeJson(filePath, packageJson);
  return {
    name: packageJson.name,
    previousVersion,
    version
  };
}

function updateReactCoreDependency(version) {
  const packageJson = readJson(reactPackagePath);

  if (!packageJson.dependencies?.[corePackageName]) {
    fail(`${packageJson.name} must depend on ${corePackageName}.`);
  }

  const previousRange = packageJson.dependencies[corePackageName];
  packageJson.dependencies[corePackageName] = version;
  writeJson(reactPackagePath, packageJson);

  return {
    name: `${packageJson.name} dependency ${corePackageName}`,
    previousVersion: previousRange,
    version
  };
}

function updateLockfileSpecifier(version) {
  const lockfile = readFileSync(lockfilePath, 'utf8');
  const importerMarker = '\n  packages/dynamic-form:\n';
  const dependencyMarker = `      '${corePackageName}':\n`;
  const importerStart = lockfile.indexOf(importerMarker);

  if (importerStart === -1) {
    fail('Could not find packages/dynamic-form importer in pnpm-lock.yaml.');
  }

  const nextImporterStart = lockfile.indexOf(
    '\n  packages/',
    importerStart + importerMarker.length
  );
  const importerEnd = nextImporterStart === -1 ? lockfile.length : nextImporterStart;
  const beforeImporter = lockfile.slice(0, importerStart);
  const importerBlock = lockfile.slice(importerStart, importerEnd);
  const afterImporter = lockfile.slice(importerEnd);
  const dependencyStart = importerBlock.indexOf(dependencyMarker);

  if (dependencyStart === -1) {
    fail(`Could not find ${corePackageName} dependency in pnpm-lock.yaml.`);
  }

  const nextDependencyStart = importerBlock.indexOf(
    '\n      ',
    dependencyStart + dependencyMarker.length
  );
  const dependencyEnd = nextDependencyStart === -1 ? importerBlock.length : nextDependencyStart;
  const dependencyBlock = importerBlock.slice(dependencyStart, dependencyEnd);
  if (!/\n\s+specifier: [^\n]+/.test(dependencyBlock)) {
    fail(`Could not find ${corePackageName} specifier in pnpm-lock.yaml.`);
  }

  const nextDependencyBlock = dependencyBlock.replace(/(\n\s+specifier: )[^\n]+/, `$1${version}`);

  const nextImporterBlock =
    importerBlock.slice(0, dependencyStart) +
    nextDependencyBlock +
    importerBlock.slice(dependencyEnd);
  const nextLockfile = beforeImporter + nextImporterBlock + afterImporter;

  writeFileSync(lockfilePath, nextLockfile);
}

if (!nextVersion) {
  fail('Usage: pnpm run version:sync -- <version>');
}

if (!isValidSemverLike(nextVersion)) {
  fail(`Invalid version "${nextVersion}". Expected semver like 4.2.1 or 4.3.0-beta.1.`);
}

const updates = [
  updateVersion(rootPackagePath, nextVersion),
  updateVersion(corePackagePath, nextVersion),
  updateVersion(reactPackagePath, nextVersion),
  updateReactCoreDependency(nextVersion)
];
updateLockfileSpecifier(nextVersion);

console.log(`Synchronized DynamicForm release version to ${nextVersion}:`);
updates.forEach((update) => {
  console.log(`- ${update.name}: ${update.previousVersion} -> ${update.version}`);
});
console.log(`- pnpm-lock.yaml: ${corePackageName} specifier -> ${nextVersion}`);
