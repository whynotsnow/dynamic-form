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

const transformDemo = (sourceFile, options) => {
  const messages = options.messages;
  const matched = new Set();
  const propertyNames = new Set(['label', 'initialValue', 'message']);
  const jsxAttributeNames = new Set(['message', 'description', 'submitButtonText']);
  const helperNames = new Set(options.helperFunctions);

  const translateLiteral = (node) => {
    const english = messages[node.text];
    if (english === undefined) return node;
    matched.add(node.text);
    return translatorCall(node.text, english);
  };

  const transformConfigScope = (root) => {
    const visitor = (node) => {
      if (
        ts.isPropertyAssignment(node) &&
        propertyNames.has(propertyName(node.name)) &&
        ts.isStringLiteral(node.initializer)
      ) {
        const initializer = translateLiteral(node.initializer);
        return initializer === node.initializer
          ? ts.visitEachChild(node, visitor, context)
          : ts.factory.updatePropertyAssignment(node, node.name, initializer);
      }

      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        helperNames.has(node.expression.text)
      ) {
        const visited = ts.visitEachChild(node, visitor, context);
        return ts.factory.updateCallExpression(visited, visited.expression, visited.typeArguments, [
          ...visited.arguments,
          ts.factory.createIdentifier('t')
        ]);
      }

      return ts.visitEachChild(node, visitor, context);
    };
    return ts.visitNode(root, visitor);
  };

  const transformComponentScope = (root) => {
    const visitor = (node) => {
      if (
        ts.isJsxAttribute(node) &&
        ['formConfig', 'values'].includes(propertyName(node.name)) &&
        ts.isJsxExpression(node.initializer) &&
        node.initializer.expression
      ) {
        const helper =
          propertyName(node.name) === 'formConfig' ? 'translateDemoConfig' : 'translateDemoValues';
        return ts.factory.updateJsxAttribute(
          node,
          node.name,
          ts.factory.createJsxExpression(
            undefined,
            ts.factory.createCallExpression(ts.factory.createIdentifier(helper), undefined, [
              ts.visitNode(node.initializer.expression, visitor),
              ts.factory.createIdentifier('t')
            ])
          )
        );
      }

      if (
        ts.isJsxAttribute(node) &&
        jsxAttributeNames.has(propertyName(node.name)) &&
        node.initializer
      ) {
        if (ts.isStringLiteral(node.initializer)) {
          const value = translateLiteral(node.initializer);
          if (value !== node.initializer) {
            return ts.factory.updateJsxAttribute(
              node,
              node.name,
              ts.factory.createJsxExpression(undefined, value)
            );
          }
        } else if (
          ts.isJsxExpression(node.initializer) &&
          node.initializer.expression &&
          ts.isTemplateExpression(node.initializer.expression)
        ) {
          const template = node.initializer.expression;
          const key = templateKey(template).key;
          const english = messages[key];
          if (english !== undefined) {
            matched.add(key);
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
      }

      if (ts.isJsxText(node)) {
        const text = node.text.trim();
        const english = messages[text];
        if (english !== undefined && text === node.text) {
          matched.add(text);
          return ts.factory.createJsxExpression(undefined, translatorCall(text, english));
        }
      }

      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'getConfig'
      ) {
        const visited = ts.visitEachChild(node, visitor, context);
        return ts.factory.updateCallExpression(visited, visited.expression, visited.typeArguments, [
          ...visited.arguments,
          ts.factory.createIdentifier('t')
        ]);
      }

      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'useMemo'
      ) {
        const visited = ts.visitEachChild(node, visitor, context);
        const dependencies = visited.arguments[1];
        if (
          ts.isArrayLiteralExpression(dependencies) &&
          !dependencies.elements.some((element) => ts.isIdentifier(element) && element.text === 't')
        ) {
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
        return visited;
      }

      return ts.visitEachChild(node, visitor, context);
    };
    return ts.visitNode(root, visitor);
  };

  let context;
  const transformer = (transformationContext) => {
    context = transformationContext;
    const visitor = (node) => {
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        options.helperFunctions.includes(node.name.text) &&
        node.initializer &&
        ts.isArrowFunction(node.initializer)
      ) {
        const arrow = node.initializer;
        const body = transformConfigScope(arrow.body);
        const parameter = ts.factory.createParameterDeclaration(
          undefined,
          undefined,
          't',
          undefined,
          translatorType
        );
        const updatedArrow = ts.factory.updateArrowFunction(
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
          updatedArrow
        );
      }

      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === 'CustomHandlersDemo' &&
        node.initializer &&
        ts.isArrowFunction(node.initializer) &&
        ts.isBlock(node.initializer.body)
      ) {
        const arrow = node.initializer;
        const transformedBody = transformComponentScope(arrow.body);
        const tDeclaration = ts.factory.createVariableStatement(
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
        const updatedBody = ts.factory.updateBlock(transformedBody, [
          tDeclaration,
          ...transformedBody.statements
        ]);
        const updatedArrow = ts.factory.updateArrowFunction(
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
          updatedArrow
        );
      }

      return ts.visitEachChild(node, visitor, transformationContext);
    };

    return (root) => {
      const result = ts.visitNode(root, visitor);
      const importDeclaration = ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier('useDemoT')
            )
          ])
        ),
        ts.factory.createStringLiteral('./demoI18n'),
        undefined
      );
      return ts.factory.updateSourceFile(result, [importDeclaration, ...result.statements]);
    };
  };

  const result = ts.transform(sourceFile, [transformer]);
  const output = ts
    .createPrinter({ newLine: ts.NewLineKind.LineFeed })
    .printFile(result.transformed[0]);
  result.dispose();

  const missing = Object.keys(messages).filter((message) => !matched.has(message));
  if (missing.length > 0) {
    throw new Error(`Demo i18n catalog entries were not matched: ${missing.join(', ')}`);
  }

  return output;
};

const appendDemoTranslatorImport = (sourceFile) => {
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
    ts.factory.createStringLiteral('./demoI18n'),
    undefined
  );
  return ts.factory.updateSourceFile(sourceFile, [importDeclaration, ...sourceFile.statements]);
};

const transformUiConfigDemo = (sourceFile, options) => {
  const messages = options.messages;
  const matched = new Set();
  const visitor = (node, context) => {
    if (
      ts.isPropertyAssignment(node) &&
      propertyName(node.name) === 'label' &&
      ts.isStringLiteral(node.initializer) &&
      messages[node.initializer.text] !== undefined
    ) {
      const { text: zh } = node.initializer;
      matched.add(zh);
      return ts.factory.updatePropertyAssignment(node, node.name, translatorCall(zh, messages[zh]));
    }

    if (ts.isJsxText(node) && messages[node.text] !== undefined) {
      matched.add(node.text);
      return ts.factory.createJsxExpression(
        undefined,
        translatorCall(node.text, messages[node.text])
      );
    }

    if (
      ts.isPropertyAssignment(node) &&
      propertyName(node.name) === 'effect' &&
      ts.isIdentifier(node.initializer) &&
      node.initializer.text === 'priorityEffect'
    ) {
      return ts.factory.updatePropertyAssignment(
        node,
        node.name,
        ts.factory.createCallExpression(node.initializer, undefined, [
          ts.factory.createIdentifier('t')
        ])
      );
    }

    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(sourceFile) === 'DynamicForm') {
      const attributes = [...node.attributes.properties];
      if (
        !attributes.some(
          (attribute) =>
            ts.isJsxAttribute(attribute) && propertyName(attribute.name) === 'submitButtonText'
        )
      ) {
        const zh = '提交表单';
        matched.add(zh);
        attributes.push(
          ts.factory.createJsxAttribute(
            ts.factory.createIdentifier('submitButtonText'),
            ts.factory.createJsxExpression(undefined, translatorCall(zh, messages[zh]))
          )
        );
      }
      const updated = ts.factory.updateJsxSelfClosingElement(
        node,
        node.tagName,
        node.typeArguments,
        ts.factory.updateJsxAttributes(node.attributes, attributes)
      );
      return ts.visitEachChild(updated, (child) => visitor(child, context), context);
    }

    return ts.visitEachChild(node, (child) => visitor(child, context), context);
  };

  const transformer = (context) => (root) => {
    const visit = (node) => {
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === 'UIConfigDemo' &&
        node.initializer &&
        ts.isArrowFunction(node.initializer) &&
        ts.isBlock(node.initializer.body)
      ) {
        const arrow = node.initializer;
        const body = ts.visitNode(arrow.body, (child) => visitor(child, context));
        const tDeclaration = ts.factory.createVariableStatement(
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
        const updatedArrow = ts.factory.updateArrowFunction(
          arrow,
          arrow.modifiers,
          arrow.typeParameters,
          arrow.parameters,
          arrow.type,
          arrow.equalsGreaterThanToken,
          ts.factory.updateBlock(body, [tDeclaration, ...body.statements])
        );
        return ts.factory.updateVariableDeclaration(
          node,
          node.name,
          node.exclamationToken,
          node.type,
          updatedArrow
        );
      }
      return ts.visitEachChild(node, visit, context);
    };
    const transformed = visit(root);
    return appendDemoTranslatorImport(transformed);
  };

  const result = ts.transform(sourceFile, [transformer]);
  const output = ts
    .createPrinter({ newLine: ts.NewLineKind.LineFeed })
    .printFile(result.transformed[0]);
  result.dispose();

  const missing = Object.keys(messages).filter((message) => !matched.has(message));
  if (missing.length > 0) {
    throw new Error(`UIConfig demo catalog entries were not matched: ${missing.join(', ')}`);
  }
  return output;
};

const transformPriorityField = (sourceFile, messages) => {
  const matched = new Set();
  const visitor = (node, context) => {
    if (ts.isJsxText(node) && messages[node.text] !== undefined) {
      matched.add(node.text);
      return ts.factory.createJsxExpression(
        undefined,
        translatorCall(node.text, messages[node.text])
      );
    }

    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'renderPriorityLabel'
    ) {
      const visited = ts.visitEachChild(node, (child) => visitor(child, context), context);
      return ts.factory.updateCallExpression(visited, visited.expression, visited.typeArguments, [
        ...visited.arguments,
        ts.factory.createIdentifier('t')
      ]);
    }
    return ts.visitEachChild(node, (child) => visitor(child, context), context);
  };

  const translatorParameter = () =>
    ts.factory.createParameterDeclaration(undefined, undefined, 't', undefined, translatorType);

  const transformer = (context) => (root) => {
    const visit = (node) => {
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === 'renderPriorityLabel' &&
        node.initializer &&
        ts.isArrowFunction(node.initializer)
      ) {
        const arrow = node.initializer;
        const body = ts.visitNode(arrow.body, (child) => visitor(child, context));
        const updated = ts.factory.updateArrowFunction(
          arrow,
          arrow.modifiers,
          arrow.typeParameters,
          [...arrow.parameters, translatorParameter()],
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
        node.name.text === 'priorityEffect' &&
        node.initializer &&
        ts.isArrowFunction(node.initializer)
      ) {
        const arrow = node.initializer;
        const body = ts.visitNode(arrow.body, (child) => visitor(child, context));
        const inner = ts.factory.updateArrowFunction(
          arrow,
          arrow.modifiers,
          arrow.typeParameters,
          arrow.parameters,
          arrow.type,
          arrow.equalsGreaterThanToken,
          body
        );
        const outer = ts.factory.createArrowFunction(
          undefined,
          undefined,
          [translatorParameter()],
          undefined,
          ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          inner
        );
        return ts.factory.updateVariableDeclaration(
          node,
          node.name,
          node.exclamationToken,
          node.type,
          outer
        );
      }

      return ts.visitEachChild(node, visit, context);
    };
    return visit(root);
  };

  const result = ts.transform(sourceFile, [transformer]);
  const output = ts
    .createPrinter({ newLine: ts.NewLineKind.LineFeed })
    .printFile(result.transformed[0]);
  result.dispose();

  const missing = Object.keys(messages).filter((message) => !matched.has(message));
  if (missing.length > 0) {
    throw new Error(`PriorityField catalog entries were not matched: ${missing.join(', ')}`);
  }
  return output;
};

module.exports = { transformDemo, transformUiConfigDemo, transformPriorityField };
