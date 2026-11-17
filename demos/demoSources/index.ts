import manifest from './index.json';
import zhSource0 from './files/zh-CN/storeBoundaryDemo.tsx.txt';
import enSource0 from './files/en/storeBoundaryDemo.tsx.txt';
import zhSource1 from './files/zh-CN/useDemoInitHandlers.tsx.txt';
import enSource1 from './files/en/useDemoInitHandlers.tsx.txt';
import zhSource2 from './files/zh-CN/testData.tsx.txt';
import enSource2 from './files/en/testData.tsx.txt';
import zhSource3 from './files/zh-CN/customHandlersDemo.tsx.txt';
import enSource3 from './files/en/customHandlersDemo.tsx.txt';
import zhSource4 from './files/zh-CN/customHandlers.tsx.txt';
import enSource4 from './files/en/customHandlers.tsx.txt';
import zhSource5 from './files/zh-CN/customComponentsDemo.tsx.txt';
import enSource5 from './files/en/customComponentsDemo.tsx.txt';
import zhSource6 from './files/zh-CN/formValidationDemo.tsx.txt';
import enSource6 from './files/en/formValidationDemo.tsx.txt';
import zhSource7 from './files/zh-CN/uiConfigDemo.tsx.txt';
import enSource7 from './files/en/uiConfigDemo.tsx.txt';
import zhSource8 from './files/zh-CN/renderExtensionDemo.tsx.txt';
import enSource8 from './files/en/renderExtensionDemo.tsx.txt';
import zhSource9 from './files/zh-CN/compilerFoundationDemo.tsx.txt';
import enSource9 from './files/en/compilerFoundationDemo.tsx.txt';
import zhSource10 from './files/zh-CN/nodeModel4Demo.tsx.txt';
import enSource10 from './files/en/nodeModel4Demo.tsx.txt';
import zhSource11 from './files/zh-CN/nodeModel4DemoConfig.tsx.txt';
import enSource11 from './files/en/nodeModel4DemoConfig.tsx.txt';
import zhSource12 from './files/zh-CN/headlessRendererDemo.tsx.txt';
import enSource12 from './files/en/headlessRendererDemo.tsx.txt';

type DemoSourceManifestEntry = {
  sourceFiles: string[];
  githubDemoPath: string;
  relatedComponents: string[];
  presentationDescription?: Record<'zh-CN' | 'en', string>;
};

const typedManifest = manifest as Record<string, DemoSourceManifestEntry>;

const files = {
  storeBoundaryDemo: {
    path: 'demos/storeBoundaryDemo.tsx',
    content: { 'zh-CN': zhSource0, en: enSource0 }
  },
  useDemoInitHandlers: {
    path: 'demos/useDemoInitHandlers.ts',
    content: { 'zh-CN': zhSource1, en: enSource1 }
  },
  testData: {
    path: 'tests/testData.tsx',
    content: { 'zh-CN': zhSource2, en: enSource2 }
  },
  customHandlersDemo: {
    path: 'demos/customHandlersDemo.tsx',
    content: { 'zh-CN': zhSource3, en: enSource3 }
  },
  customHandlers: {
    path: 'demos/customHandlers.ts',
    content: { 'zh-CN': zhSource4, en: enSource4 }
  },
  customComponentsDemo: {
    path: 'demos/customComponentsDemo.tsx',
    content: { 'zh-CN': zhSource5, en: enSource5 }
  },
  formValidationDemo: {
    path: 'demos/formValidationDemo.tsx',
    content: { 'zh-CN': zhSource6, en: enSource6 }
  },
  uiConfigDemo: {
    path: 'demos/uiConfigDemo.tsx',
    content: { 'zh-CN': zhSource7, en: enSource7 }
  },
  renderExtensionDemo: {
    path: 'demos/renderExtensionDemo.tsx',
    content: { 'zh-CN': zhSource8, en: enSource8 }
  },
  compilerFoundationDemo: {
    path: 'demos/compilerFoundationDemo.tsx',
    content: { 'zh-CN': zhSource9, en: enSource9 }
  },
  nodeModel4Demo: {
    path: 'demos/nodeModel4Demo.tsx',
    content: { 'zh-CN': zhSource10, en: enSource10 }
  },
  nodeModel4DemoConfig: {
    path: 'demos/nodeModel4DemoConfig.ts',
    content: { 'zh-CN': zhSource11, en: enSource11 }
  },
  headlessRendererDemo: {
    path: 'demos/headlessRendererDemo.tsx',
    content: { 'zh-CN': zhSource12, en: enSource12 }
  }
};

const filesById: Record<string, (typeof files)[keyof typeof files]> = files;

export const demoSourceEntries = Object.fromEntries(
  Object.entries(typedManifest).map(([demo, entry]) => [
    demo,
    {
      ...entry,
      sourceFiles: entry.sourceFiles.map((id) => filesById[id])
    }
  ])
);
