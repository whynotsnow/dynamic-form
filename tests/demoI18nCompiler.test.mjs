import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import demoI18nLoader from '../apps/docs-site/loaders/demoI18n.cjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const transformDemoFile = async (relativePath) => {
  const resourcePath = path.join(repoRoot, 'demos', relativePath);
  const source = await readFile(resourcePath, 'utf8');
  return demoI18nLoader.call({ resourcePath, addDependency() {} }, source);
};

test('docs-site localizes prefilled values and dynamic demo output at compile time', async () => {
  const customHandlers = await transformDemoFile('customHandlersDemo.tsx');
  const formValidation = await transformDemoFile('formValidationDemo.tsx');
  const customEditTable = await transformDemoFile('customComponents/CustomEditTable.tsx');
  const headlessRenderer = await transformDemoFile('headlessRendererDemo.tsx');
  const nodeModel4 = await transformDemoFile('nodeModel4Demo.tsx');

  assert.match(customHandlers, /t\.translateDemoValues\(initialValues\)/);
  assert.match(customHandlers, /t\.translateDemoConfig\(memoConfig as FlatFormConfig\)/);
  assert.match(customHandlers, /import \{ useDemoT \} from ["']\.\/demoI18n["'];/);
  assert.match(formValidation, /translateDemoValues\(cloneDemoValues\(initialValues\), t\)/);
  assert.match(customEditTable, /ageInvalidNumber:[\s\S]{0,120}Age must be a number/);
  assert.match(
    customEditTable,
    /phoneInvalidFormat:[\s\S]{0,160}Enter a valid 11-digit mobile number/
  );
  assert.match(customEditTable, /errors\.age = 'ageInvalidNumber'/);
  assert.doesNotMatch(customEditTable, /errors\.age = '年龄必须是数字'/);
  for (const [field, englishPlaceholder] of [
    ['name', 'Enter a name'],
    ['age', 'Age'],
    ['address', 'Enter an address'],
    ['email', 'Enter an email address'],
    ['phone', 'Enter a phone number']
  ]) {
    assert.match(
      customEditTable,
      new RegExp(
        String.raw`renderDesktopField\(row, '${field}', t\([\s\S]{0,120}${englishPlaceholder}`
      )
    );
  }
  for (const englishPlaceholder of [
    'Enter a name',
    'Enter an age',
    'Enter an address',
    'Enter an email address',
    'Enter a phone number'
  ]) {
    assert.match(
      customEditTable,
      new RegExp(String.raw`placeholder=\{t\([\s\S]{0,120}${englishPlaceholder}"\)\}`)
    );
  }
  assert.match(customEditTable, /import \{[^}]*useDemoT[^}]*\} from ["']\.\.\/demoI18n["'];/);
  assert.match(
    customEditTable,
    /export const validateEditTableRows[\s\S]{0,700}ageInvalidNumber: \{ message: t\([\s\S]{0,120}Age must be a number/
  );
  assert.match(
    formValidation,
    /validator: \(rule, value\) => validateEditTableRows\(rule, value, t\)/
  );
  assert.match(headlessRenderer, /translateDemoValues\(/);
  assert.match(nodeModel4, /Contact \$\{contacts\.length \+ 1\}/);

  for (const output of [
    customHandlers,
    formValidation,
    customEditTable,
    headlessRenderer,
    nodeModel4
  ]) {
    const result = ts.transpileModule(output, {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
      reportDiagnostics: true
    });
    const errors = (result.diagnostics ?? []).filter(
      (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
    );
    assert.deepEqual(errors, []);
  }
});

test('CustomEditTable row validator returns stable codes for every rule', async () => {
  const source = await readFile(
    path.join(repoRoot, 'demos/customComponents/CustomEditTable.tsx'),
    'utf8'
  );
  const sourceFile = ts.createSourceFile(
    'CustomEditTable.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const declaration = sourceFile.statements.find(
    (statement) =>
      ts.isVariableStatement(statement) &&
      statement.declarationList.declarations.some(
        (item) => ts.isIdentifier(item.name) && item.name.text === 'validateEditTableRow'
      )
  );

  assert.ok(declaration);
  const compiledValidator = ts.transpileModule(declaration.getText(sourceFile), {
    compilerOptions: { target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const validateEditTableRow = new Function(`${compiledValidator}; return validateEditTableRow;`)();
  const validRow = {
    key: 'test-row',
    name: 'Test User',
    age: '28',
    address: '1 Test Street',
    email: 'test@example.com',
    phone: '13812345678',
    status: 'active'
  };

  assert.deepEqual(
    validateEditTableRow({
      ...validRow,
      name: ' ',
      age: '',
      address: ' ',
      email: '',
      phone: '',
      status: ''
    }),
    {
      name: 'nameRequired',
      age: 'ageRequired',
      address: 'addressRequired',
      email: 'emailRequired',
      phone: 'phoneRequired',
      status: 'statusRequired'
    }
  );
  assert.deepEqual(validateEditTableRow({ ...validRow, age: '1.5' }), {
    age: 'ageInvalidNumber'
  });
  assert.deepEqual(validateEditTableRow({ ...validRow, age: '151' }), {
    age: 'ageOutOfRange'
  });
  assert.deepEqual(validateEditTableRow({ ...validRow, email: 'invalid-email' }), {
    email: 'emailInvalidFormat'
  });
  assert.deepEqual(validateEditTableRow({ ...validRow, phone: '123' }), {
    phone: 'phoneInvalidFormat'
  });
  assert.deepEqual(validateEditTableRow(validRow), {});
});

test('demo i18n catalog is grouped by responsibility and includes visible sample values', async () => {
  const sampleValues = JSON.parse(
    await readFile(path.join(repoRoot, 'demos/demoI18n/data/shared.json'), 'utf8')
  );

  assert.equal(sampleValues['示例用户'], 'Demo user');
  assert.equal(sampleValues['客户门户改版'], 'Customer portal redesign');
  assert.equal(sampleValues['小型企业'], 'Small business');
  assert.equal(sampleValues['浦东新区'], 'Pudong New Area');
  assert.equal(sampleValues['工商注册地址'], 'Registered business address');
});
