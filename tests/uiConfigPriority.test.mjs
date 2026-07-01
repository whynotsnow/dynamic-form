import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const uiConfigModulePromise = build({
  entryPoints: ['packages/dynamic-form/src/shared/utils/uiConfig.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'silent'
}).then(async ({ outputFiles }) => {
  const source = outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
});

async function getUIConfigUtils() {
  return uiConfigModulePromise;
}

test('mergeUIConfig keeps static sections while dynamic sections override matching keys', async () => {
  const { mergeUIConfig } = await getUIConfigUtils();

  assert.deepEqual(
    mergeUIConfig(
      {
        rowProps: { gutter: 16, align: 'top' },
        buttonProps: { type: 'primary' }
      },
      {
        rowProps: { gutter: 24 },
        formProps: { layout: 'vertical' }
      }
    ),
    {
      rowProps: { gutter: 24, align: 'top' },
      buttonProps: { type: 'primary' },
      formProps: { layout: 'vertical' }
    }
  );
});

test('resolveMergedFormItemProps follows dynamic-over-static and field-over-global priority', async () => {
  const { resolveMergedFormItemProps } = await getUIConfigUtils();

  const result = resolveMergedFormItemProps({
    baseFormItemProps: {
      label: '系统默认',
      required: false,
      colon: true
    },
    staticUIConfig: {
      formItemProps: {
        label: '静态全局',
        required: true,
        tooltip: '静态全局提示'
      }
    },
    field: {
      id: 'name',
      component: 'TextInput',
      formItemProps: {
        label: '静态字段',
        tooltip: '静态字段提示',
        extra: '静态字段说明'
      },
      meta: {
        formItemProps: {
          label: '动态字段'
        }
      }
    },
    dynamicUIConfig: {
      formItemProps: {
        label: '动态全局',
        colon: false,
        extra: '动态全局说明'
      }
    }
  });

  assert.deepEqual(result, {
    label: '动态字段',
    required: true,
    colon: false,
    tooltip: '静态字段提示',
    extra: '动态全局说明'
  });
});
