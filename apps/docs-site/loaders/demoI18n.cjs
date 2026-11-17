const nodeModule = process.getBuiltinModule('node:module');
const path = process.getBuiltinModule('node:path');
const { readFileSync } = process.getBuiltinModule('node:fs');
const loadDependency = nodeModule.createRequire(__filename);
const ts = loadDependency('typescript');
const catalog = JSON.parse(
  readFileSync(path.resolve(__dirname, '../../../demos/demoI18n.catalog.json'), 'utf8')
);

const translatorType = ts.factory.createFunctionTypeNode(
  undefined,
  [
    ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      'zh',
      undefined,
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
    ),
    ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      'en',
      undefined,
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
    )
  ],
  ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
);

const translatorCall = (zh, en) =>
  ts.factory.createCallExpression(ts.factory.createIdentifier('t'), undefined, [
    ts.factory.createStringLiteral(zh),
    ts.factory.createStringLiteral(en)
  ]);

const translatorCallWithExpressions = (zh, en) =>
  ts.factory.createCallExpression(ts.factory.createIdentifier('t'), undefined, [zh, en]);

const propertyName = (name) => {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return undefined;
};

const templateKey = (node) => {
  let key = node.head.text;
  const expressions = [];

  for (const span of node.templateSpans) {
    const expressionText = span.expression.getText();
    expressions.push(expressionText);
    key += `{{${expressionText}}}${span.literal.text}`;
  }

  return { key, expressions };
};

const translatedTemplate = (node, english) => {
  const { expressions } = templateKey(node);
  const placeholders = [...english.matchAll(/\{\{([^{}]+)\}\}/g)];
  if (placeholders.length !== expressions.length) {
    throw new Error('Translated template must preserve all interpolation placeholders');
  }

  const spans = placeholders.map((match, index) => {
    const expressionIndex = expressions.indexOf(match[1]);
    if (expressionIndex < 0) throw new Error(`Unknown template placeholder: ${match[1]}`);
    const followingStart = match.index + match[0].length;
    const followingEnd = placeholders[index + 1]?.index ?? english.length;
    const following = english.slice(followingStart, followingEnd);
    const literal =
      index === placeholders.length - 1
        ? ts.factory.createTemplateTail(following)
        : ts.factory.createTemplateMiddle(following);
    return ts.factory.createTemplateSpan(node.templateSpans[expressionIndex].expression, literal);
  });
  const first = placeholders[0];
  const head = english.slice(0, first.index);
  return ts.factory.createTemplateExpression(ts.factory.createTemplateHead(head), spans);
};

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
    throw new Error(`Demo i18n prototype catalog entries were not matched: ${missing.join(', ')}`);
  }

  return output;
};

const appendDemoTranslatorImport = (sourceFile) => {
  const importDeclaration = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('useDemoT'))
      ])
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
        ['translateDemoConfig', 'useDemoT'].map((name) =>
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
    return transformDemo(sourceFile, catalog.customHandlersDemo);
  }
  if (relativePath === 'uiConfigDemo.tsx') {
    return transformUiConfigDemo(sourceFile, catalog.uiConfigDemo);
  }
  if (relativePath === 'customComponents/PriorityField.tsx') {
    return transformPriorityField(sourceFile, catalog.uiConfigDemo.priorityMessages);
  }
  if (activeDemoFiles.has(relativePath)) {
    const translated = transformActiveDemo(
      sourceFile,
      catalog.sharedMessages ?? {},
      relativePath.startsWith('customComponents/') ? '../demoI18n' : './demoI18n'
    );
    if (translated) return translated;
  }
  return source;
};
