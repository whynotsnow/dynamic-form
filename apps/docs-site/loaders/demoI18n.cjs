const nodeModule = process.getBuiltinModule('node:module');
const path = process.getBuiltinModule('node:path');
const { readFileSync } = process.getBuiltinModule('node:fs');
const loadDependency = nodeModule.createRequire(__filename);
const { activeDemoFiles, transformActiveDemo } = loadDependency(
  './demoI18n/active-demo-transform.cjs'
);
const { transformDemo, transformUiConfigDemo, transformPriorityField } = loadDependency(
  './demoI18n/special-transforms.cjs'
);
const catalogRoot = path.resolve(__dirname, '../../../demos/demoI18n');
const readCatalog = (file) => JSON.parse(readFileSync(path.join(catalogRoot, file), 'utf8'));
const sharedMessages = readCatalog('shared.json');
const catalog = {
  customHandlersDemo: readCatalog('special/customHandlers.json'),
  uiConfigDemo: readCatalog('special/uiConfig.json'),
  sampleValues: readCatalog('data/shared.json')
};
const demoCatalogFiles = {
  'storeBoundaryDemo.tsx': 'storeBoundary',
  'customComponentsDemo.tsx': 'customComponents',
  'formValidationDemo.tsx': 'formValidation',
  'uiConfigDemo.tsx': 'uiConfig',
  'renderExtensionDemo.tsx': 'renderExtension',
  'compilerFoundationDemo.tsx': 'compilerFoundation',
  'nodeModel4Demo.tsx': 'nodeModel4',
  'nodeModel4DemoConfig.ts': 'nodeModel4',
  'headlessRendererDemo.tsx': 'headlessRenderer',
  'customComponents/CustomEditTable.tsx': 'formValidation',
  'customComponents/CustomProjectList.tsx': 'formValidation',
  'customComponents/OperatingAreaField.tsx': 'storeBoundary',
  'customComponents/index.tsx': 'customComponents'
};
const messagesForDemo = (demo) => ({
  ...sharedMessages,
  ...readCatalog(`demos/${demo}.json`),
  ...catalog.sampleValues
});
const ts = loadDependency('typescript');

module.exports = function demoI18nLoader(source) {
  const sourceFile = ts.createSourceFile(
    this.resourcePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const relativePath = path
    .relative(path.resolve(__dirname, '../../../demos'), this.resourcePath)
    .replace(/\\/g, '/');
  if (relativePath === 'customHandlersDemo.tsx') {
    return transformDemo(sourceFile, {
      ...catalog.customHandlersDemo,
      messages: {
        ...catalog.customHandlersDemo.messages,
        ...readCatalog('demos/customHandlers.json')
      }
    });
  }
  if (relativePath === 'uiConfigDemo.tsx') {
    return transformUiConfigDemo(sourceFile, catalog.uiConfigDemo);
  }
  if (relativePath === 'customComponents/PriorityField.tsx')
    return transformPriorityField(sourceFile, catalog.uiConfigDemo.priorityMessages);
  if (activeDemoFiles.has(relativePath)) {
    const demo = demoCatalogFiles[relativePath];
    const translated = transformActiveDemo(
      sourceFile,
      messagesForDemo(demo),
      relativePath.startsWith('customComponents/') ? '../demoI18n' : './demoI18n'
    );
    if (translated) return translated;
  }
  return source;
};
