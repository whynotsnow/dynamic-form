const nodeModule = process.getBuiltinModule('node:module');
const loadDependency = nodeModule.createRequire(__filename);
const {
  ts,
  translatorType,
  translatorCall,
  translatorCallWithExpressions,
  propertyName,
  templateKey,
  translatedTemplate
} = loadDependency('./ast-utils.cjs');

const activeDemoFiles = new Set([
  'storeBoundaryDemo.tsx',
  'customHandlersDemo.tsx',
  'customComponentsDemo.tsx',
  'formValidationDemo.tsx',
  'uiConfigDemo.tsx',
  'renderExtensionDemo.tsx',
  'compilerFoundationDemo.tsx',
  'nodeModel4Demo.tsx',
  'headlessRendererDemo.tsx',
  'customComponents/CustomEditTable.tsx',
  'customComponents/CustomProjectList.tsx',
  'customComponents/OperatingAreaField.tsx',
  'customComponents/index.tsx'
]);

const localizedPropertyNames = new Set([
  'description',
  'extra',
  'initialValue',
  'label',
  'message',
  'placeholder',
  'submitButtonText',
  'title',
  'unit'
]);

const localizedJsxAttributeNames = new Set([
  'checkedChildren',
  'description',
  'extra',
  'label',
  'message',
  'placeholder',
  'submitButtonText',
  'title',
  'unCheckedChildren'
]);

const translateDemoConfigCall = (expression) =>
  ts.factory.createCallExpression(ts.factory.createIdentifier('translateDemoConfig'), undefined, [
    expression,
    ts.factory.createIdentifier('t')
  ]);

const containsJsx = (node) => {
  let found = false;
  const visit = (child) => {
    if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
      found = true;
      return;
    }
    if (!found) ts.forEachChild(child, visit);
  };
  visit(node);
  return found;
};

const appendTranslatorImport = (sourceFile, relativeImport) => {
  const importDeclaration = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports(
        ['translateDemoConfig', 'translateDemoValues', 'useDemoT'].map((name) =>
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))
        )
      )
    ),
    ts.factory.createStringLiteral(relativeImport),
    undefined
  );
  return ts.factory.updateSourceFile(sourceFile, [importDeclaration, ...sourceFile.statements]);
};

const transformActiveDemo = (sourceFile, messages, relativeImport) => {
  let changed = false;
  const configHelperNames = new Set();

  const hasLocalizedConfigProperty = (root) => {
    let matched = false;
    const visit = (node) => {
      if (
        ts.isPropertyAssignment(node) &&
        localizedPropertyNames.has(propertyName(node.name)) &&
        ts.isStringLiteral(node.initializer) &&
        messages[node.initializer.text] !== undefined
      ) {
        matched = true;
        return;
      }
      if (!matched) ts.forEachChild(node, visit);
    };
    visit(root);
    return matched;
  };

  const directlyCalledIdentifiers = new Set();
  const collectCalls = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      directlyCalledIdentifiers.add(node.expression.text);
    }
    ts.forEachChild(node, collectCalls);
  };
  collectCalls(sourceFile);
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        !/^[A-Z]/.test(declaration.name.text) &&
        directlyCalledIdentifiers.has(declaration.name.text) &&
        declaration.initializer &&
        ts.isArrowFunction(declaration.initializer) &&
        hasLocalizedConfigProperty(declaration.initializer.body)
      ) {
        configHelperNames.add(declaration.name.text);
      }
    }
  }

  const contextTransformer = (context) => {
    const transformComponent = (body) => {
      const visitor = (node) => {
        if (
          ts.isPropertyAssignment(node) &&
          propertyName(node.name) === 'validator' &&
          ts.isIdentifier(node.initializer) &&
          node.initializer.text === 'validateEditTableRows'
        ) {
          changed = true;
          return ts.factory.updatePropertyAssignment(
            node,
            node.name,
            ts.factory.createArrowFunction(
              undefined,
              undefined,
              [
                ts.factory.createParameterDeclaration(undefined, undefined, 'rule'),
                ts.factory.createParameterDeclaration(undefined, undefined, 'value')
              ],
              undefined,
              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              ts.factory.createCallExpression(
                ts.factory.createIdentifier('validateEditTableRows'),
                undefined,
                [
                  ts.factory.createIdentifier('rule'),
                  ts.factory.createIdentifier('value'),
                  ts.factory.createIdentifier('t')
                ]
              )
            )
          );
        }

        if (
          ts.isPropertyAssignment(node) &&
          localizedPropertyNames.has(propertyName(node.name)) &&
          ts.isStringLiteral(node.initializer) &&
          messages[node.initializer.text] !== undefined
        ) {
          const { text: zh } = node.initializer;
          changed = true;
          return ts.factory.updatePropertyAssignment(
            node,
            node.name,
            translatorCall(zh, messages[zh])
          );
        }

        if (
          ts.isPropertyAssignment(node) &&
          propertyName(node.name) === 'contactName' &&
          ts.isTemplateExpression(node.initializer)
        ) {
          const template = node.initializer;
          const english = messages[templateKey(template).key];
          if (english !== undefined) {
            changed = true;
            return ts.factory.updatePropertyAssignment(
              node,
              node.name,
              translatorCallWithExpressions(template, translatedTemplate(template, english))
            );
          }
        }

        if (ts.isJsxText(node)) {
          const text = node.text.trim();
          if (messages[text] !== undefined) {
            changed = true;
            const leading = node.text.slice(0, node.text.indexOf(text));
            const trailing = node.text.slice(node.text.indexOf(text) + text.length);
            const children = [];
            if (leading) children.push(ts.factory.createJsxText(leading));
            children.push(
              ts.factory.createJsxExpression(undefined, translatorCall(text, messages[text]))
            );
            if (trailing) children.push(ts.factory.createJsxText(trailing));
            return children;
          }
        }

        if (ts.isJsxAttribute(node) && node.initializer) {
          const attributeName = propertyName(node.name);
          if (
            localizedJsxAttributeNames.has(attributeName) &&
            ts.isStringLiteral(node.initializer) &&
            messages[node.initializer.text] !== undefined
          ) {
            const { text: zh } = node.initializer;
            changed = true;
            return ts.factory.updateJsxAttribute(
              node,
              node.name,
              ts.factory.createJsxExpression(undefined, translatorCall(zh, messages[zh]))
            );
          }
          if (
            localizedJsxAttributeNames.has(attributeName) &&
            ts.isJsxExpression(node.initializer) &&
            node.initializer.expression &&
            ts.isTemplateExpression(node.initializer.expression)
          ) {
            const template = node.initializer.expression;
            const key = templateKey(template).key;
            const english = messages[key];
            if (english !== undefined) {
              changed = true;
              return ts.factory.updateJsxAttribute(
                node,
                node.name,
                ts.factory.createJsxExpression(
                  undefined,
                  translatorCallWithExpressions(template, translatedTemplate(template, english))
                )
              );
            }
          }
          if (
            attributeName === 'formConfig' &&
            ts.isJsxExpression(node.initializer) &&
            node.initializer.expression
          ) {
            changed = true;
            return ts.factory.updateJsxAttribute(
              node,
              node.name,
              ts.factory.createJsxExpression(
                undefined,
                translateDemoConfigCall(ts.visitNode(node.initializer.expression, visitor))
              )
            );
          }
          if (
            attributeName === 'values' &&
            ts.isJsxExpression(node.initializer) &&
            node.initializer.expression
          ) {
            changed = true;
            return ts.factory.updateJsxAttribute(
              node,
              node.name,
              ts.factory.createJsxExpression(
                undefined,
                ts.factory.createCallExpression(
                  ts.factory.createIdentifier('translateDemoValues'),
                  undefined,
                  [
                    ts.visitNode(node.initializer.expression, visitor),
                    ts.factory.createIdentifier('t')
                  ]
                )
              )
            );
          }
          if (
            attributeName === 'options' &&
            ts.isJsxExpression(node.initializer) &&
            node.initializer.expression
          ) {
            changed = true;
            return ts.factory.updateJsxAttribute(
              node,
              node.name,
              ts.factory.createJsxExpression(
                undefined,
                translateDemoConfigCall(ts.visitNode(node.initializer.expression, visitor))
              )
            );
          }
        }

        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          configHelperNames.has(node.expression.text)
        ) {
          const visited = ts.visitEachChild(node, visitor, context);
          changed = true;
          return ts.factory.updateCallExpression(
            visited,
            visited.expression,
            visited.typeArguments,
            [...visited.arguments, ts.factory.createIdentifier('t')]
          );
        }

        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          node.arguments[0] &&
          ['setFieldsValue'].includes(node.expression.name.text)
        ) {
          const visited = ts.visitEachChild(node, visitor, context);
          return ts.factory.updateCallExpression(
            visited,
            visited.expression,
            visited.typeArguments,
            [
              ts.factory.createCallExpression(
                ts.factory.createIdentifier('translateDemoValues'),
                undefined,
                [visited.arguments[0], ts.factory.createIdentifier('t')]
              ),
              ...visited.arguments.slice(1)
            ]
          );
        }

        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'createMemoryFormAdapter' &&
          node.arguments[0]
        ) {
          const visited = ts.visitEachChild(node, visitor, context);
          return ts.factory.updateCallExpression(
            visited,
            visited.expression,
            visited.typeArguments,
            [
              ts.factory.createCallExpression(
                ts.factory.createIdentifier('translateDemoValues'),
                undefined,
                [visited.arguments[0], ts.factory.createIdentifier('t')]
              ),
              ...visited.arguments.slice(1)
            ]
          );
        }

        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'renderDesktopField' &&
          ts.isStringLiteral(node.arguments[2]) &&
          messages[node.arguments[2].text] !== undefined
        ) {
          const visited = ts.visitEachChild(node, visitor, context);
          const args = [...visited.arguments];
          const { text: zh } = node.arguments[2];
          args[2] = translatorCall(zh, messages[zh]);
          changed = true;
          return ts.factory.updateCallExpression(
            visited,
            visited.expression,
            visited.typeArguments,
            args
          );
        }

        if (
          ts.isCallExpression(node) &&
          node.arguments[0] &&
          (ts.isStringLiteral(node.arguments[0]) || ts.isTemplateExpression(node.arguments[0]))
        ) {
          const argument = node.arguments[0];
          const key = ts.isStringLiteral(argument) ? argument.text : templateKey(argument).key;
          const english = messages[key];
          if (english !== undefined) {
            changed = true;
            const translated = ts.isStringLiteral(argument)
              ? translatorCall(key, english)
              : translatorCallWithExpressions(argument, translatedTemplate(argument, english));
            return ts.factory.updateCallExpression(node, node.expression, node.typeArguments, [
              translated,
              ...node.arguments.slice(1)
            ]);
          }
        }

        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          ['useMemo', 'useCallback'].includes(node.expression.text)
        ) {
          const visited = ts.visitEachChild(node, visitor, context);
          const dependencies = visited.arguments[1];
          if (ts.isArrayLiteralExpression(dependencies)) {
            const hasTranslator = dependencies.elements.some(
              (element) => ts.isIdentifier(element) && element.text === 't'
            );
            if (!hasTranslator) {
              return ts.factory.updateCallExpression(
                visited,
                visited.expression,
                visited.typeArguments,
                [
                  visited.arguments[0],
                  ts.factory.updateArrayLiteralExpression(dependencies, [
                    ...dependencies.elements,
                    ts.factory.createIdentifier('t')
                  ])
                ]
              );
            }
          }
          return visited;
        }

        return ts.visitEachChild(node, visitor, context);
      };
      return ts.visitNode(body, visitor);
    };

    const visitor = (node) => {
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === 'validateEditTableRows' &&
        node.initializer &&
        ts.isArrowFunction(node.initializer)
      ) {
        const arrow = node.initializer;
        const body = transformComponent(arrow.body);
        const updated = ts.factory.updateArrowFunction(
          arrow,
          arrow.modifiers,
          arrow.typeParameters,
          arrow.parameters,
          arrow.type,
          arrow.equalsGreaterThanToken,
          body
        );
        return ts.factory.updateVariableDeclaration(
          node,
          node.name,
          node.exclamationToken,
          node.type,
          updated
        );
      }

      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        configHelperNames.has(node.name.text) &&
        node.initializer &&
        ts.isArrowFunction(node.initializer)
      ) {
        const arrow = node.initializer;
        const body = transformComponent(arrow.body);
        const parameter = ts.factory.createParameterDeclaration(
          undefined,
          undefined,
          't',
          undefined,
          translatorType
        );
        const updated = ts.factory.updateArrowFunction(
          arrow,
          arrow.modifiers,
          arrow.typeParameters,
          [...arrow.parameters, parameter],
          arrow.type,
          arrow.equalsGreaterThanToken,
          body
        );
        return ts.factory.updateVariableDeclaration(
          node,
          node.name,
          node.exclamationToken,
          node.type,
          updated
        );
      }

      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        /^[A-Z]/.test(node.name.text) &&
        node.initializer &&
        ts.isArrowFunction(node.initializer) &&
        containsJsx(node.initializer.body)
      ) {
        const arrow = node.initializer;
        const body = transformComponent(arrow.body);
        const hook = ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                't',
                undefined,
                undefined,
                ts.factory.createCallExpression(
                  ts.factory.createIdentifier('useDemoT'),
                  undefined,
                  []
                )
              )
            ],
            ts.NodeFlags.Const
          )
        );
        const updatedBody = ts.isBlock(body)
          ? ts.factory.updateBlock(body, [hook, ...body.statements])
          : ts.factory.createBlock([hook, ts.factory.createReturnStatement(body)], true);
        const updated = ts.factory.updateArrowFunction(
          arrow,
          arrow.modifiers,
          arrow.typeParameters,
          arrow.parameters,
          arrow.type,
          arrow.equalsGreaterThanToken,
          updatedBody
        );
        return ts.factory.updateVariableDeclaration(
          node,
          node.name,
          node.exclamationToken,
          node.type,
          updated
        );
      }
      return ts.visitEachChild(node, visitor, context);
    };
    return (root) => {
      const transformed = ts.visitNode(root, visitor);
      return changed ? appendTranslatorImport(transformed, relativeImport) : transformed;
    };
  };

  const result = ts.transform(sourceFile, [contextTransformer]);
  const output = ts
    .createPrinter({ newLine: ts.NewLineKind.LineFeed })
    .printFile(result.transformed[0]);
  result.dispose();
  return changed ? output : undefined;
};

module.exports = { activeDemoFiles, transformActiveDemo };
