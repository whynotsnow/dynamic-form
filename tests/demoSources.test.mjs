import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(repoRoot, 'demos/demoSources/files');

test('demo source snapshots provide editable Chinese and English text files', async () => {
  const manifest = JSON.parse(
    await readFile(path.join(repoRoot, 'demos/demoSources/index.json'), 'utf8')
  );
  const fileIds = [...new Set(Object.values(manifest).flatMap(({ sourceFiles }) => sourceFiles))];

  assert.ok(fileIds.length > 0);

  for (const fileId of fileIds) {
    const [zhSource, enSource] = await Promise.all([
      readFile(path.join(sourceRoot, 'zh-CN', `${fileId}.tsx.txt`), 'utf8'),
      readFile(path.join(sourceRoot, 'en', `${fileId}.tsx.txt`), 'utf8')
    ]);

    assert.ok(zhSource.trim().length > 0, `${fileId} should have a Chinese snapshot`);
    assert.ok(enSource.trim().length > 0, `${fileId} should have an English snapshot`);
    assert.notEqual(zhSource, enSource, `${fileId} should have locale-specific source`);
    assert.doesNotMatch(
      enSource,
      /\p{Script=Han}/u,
      `${fileId} should not contain Han text in English`
    );
  }
});
