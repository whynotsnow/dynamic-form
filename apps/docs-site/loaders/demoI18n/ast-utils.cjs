const nodeModule = process.getBuiltinModule('node:module');
const path = process.getBuiltinModule('node:path');
const loadDependency = nodeModule.createRequire(
  path.resolve(__dirname, '../../../../package.json')
);
const ts = loadDependency('typescript');

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

module.exports = {
  ts,
  translatorType,
  translatorCall,
  translatorCallWithExpressions,
  propertyName,
  templateKey,
  translatedTemplate
};
