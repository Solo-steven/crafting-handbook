import * as AST from "@/src/ast/index";
import { SyntaxKinds } from "@/src/kind";
import { SourcePosition } from "@/src/position";
import {
  AssigmentOperatorKinds,
  BinaryOperatorKinds,
  UnaryOperatorKinds,
  UpdateOperatorKinds,
} from "@/src/kind";

export function createIdentifier(
  name: string,
  start: SourcePosition,
  end: SourcePosition,
  typeAnnotation: AST.TSTypeAnnotation | undefined,
  optional: boolean | undefined,
): AST.Identifier {
  return {
    kind: SyntaxKinds.Identifier,
    name,
    typeAnnotation,
    optional,
    start,
    end,
  };
}
export function createPrivateName(name: string, start: SourcePosition, end: SourcePosition): AST.PrivateName {
  return {
    kind: SyntaxKinds.PrivateName,
    name,
    start,
    end,
  };
}
export function createRegexLiteral(
  pattern: AST.RegexLiteral["pattern"],
  flag: AST.RegexLiteral["flag"],
  start: SourcePosition,
  end: SourcePosition,
): AST.RegexLiteral {
  return {
    kind: SyntaxKinds.RegexLiteral,
    pattern,
    flag,
    start,
    end,
  };
}
export function createDecimalLiteral(
  rawValue: string,
  start: SourcePosition,
  end: SourcePosition,
): AST.DecimalLiteral {
  return {
    kind: SyntaxKinds.DecimalLiteral,
    rawValue,
    start,
    end,
  };
}
export function createNonOctalDecimalLiteral(
  rawValue: string,
  start: SourcePosition,
  end: SourcePosition,
): AST.NonOctalDecimalLiteral {
  return {
    kind: SyntaxKinds.NonOctalDecimalLiteral,
    rawValue,
    start,
    end,
  };
}
export function createBinaryIntegerLiteral(
  rawValue: string,
  start: SourcePosition,
  end: SourcePosition,
): AST.BinaryIntegerLiteral {
  return {
    kind: SyntaxKinds.BinaryIntegerLiteral,
    rawValue,
    start,
    end,
  };
}
export function createOctalIntegerLiteral(
  rawValue: string,
  start: SourcePosition,
  end: SourcePosition,
): AST.OctalIntegerLiteral {
  return {
    kind: SyntaxKinds.OctalIntegerLiteral,
    rawValue,
    start,
    end,
  };
}
export function createHexIntegerLiteral(
  rawValue: string,
  start: SourcePosition,
  end: SourcePosition,
): AST.HexIntegerLiteral {
  return {
    kind: SyntaxKinds.HexIntegerLiteral,
    rawValue,
    start,
    end,
  };
}
export function createLegacyOctalIntegerLiteral(
  rawValue: string,
  start: SourcePosition,
  end: SourcePosition,
): AST.LegacyOctalIntegerLiteral {
  return {
    kind: SyntaxKinds.LegacyOctalIntegerLiteral,
    rawValue,
    start,
    end,
  };
}
export function createDecimalBigIntegerLiteral(
  rawValue: string,
  start: SourcePosition,
  end: SourcePosition,
): AST.DecimalBigIntegerLiteral {
  return {
    kind: SyntaxKinds.DecimalBigIntegerLiteral,
    rawValue,
    start,
    end,
  };
}
export function createBinaryBigIntegerLiteral(
  rawValue: string,
  start: SourcePosition,
  end: SourcePosition,
): AST.BinaryBigIntegerLiteral {
  return {
    kind: SyntaxKinds.BinaryBigIntegerLiteral,
    rawValue,
    start,
    end,
  };
}
export function createOctBigIntegerLiteral(
  rawValue: string,
  start: SourcePosition,
  end: SourcePosition,
): AST.OctalBigIntegerLiteral {
  return {
    kind: SyntaxKinds.OctalBigIntegerLiteral,
    rawValue,
    start,
    end,
  };
}
export function createHexBigIntegerLiteral(
  rawValue: string,
  start: SourcePosition,
  end: SourcePosition,
): AST.HexBigIntegerLiteral {
  return {
    kind: SyntaxKinds.HexBigIntegerLiteral,
    rawValue,
    start,
    end,
  };
}
export function createStringLiteral(
  value: string,
  start: SourcePosition,
  end: SourcePosition,
): AST.StringLiteral {
  return {
    kind: SyntaxKinds.StringLiteral,
    value,
    start,
    end,
  };
}
export function createNullLiteral(start: SourcePosition, end: SourcePosition): AST.NullLiteral {
  return {
    kind: SyntaxKinds.NullLiteral,
    start,
    end,
  };
}
export function createUndefinedLiteral(start: SourcePosition, end: SourcePosition): AST.UndefinbedLiteral {
  return {
    kind: SyntaxKinds.UndefinedLiteral,
    start,
    end,
  };
}
export function createBoolLiteral(
  value: boolean,
  start: SourcePosition,
  end: SourcePosition,
): AST.BoolLiteral {
  return {
    kind: SyntaxKinds.BooleanLiteral,
    value,
    start,
    end,
  };
}
export function createTemplateLiteral(
  quasis: Array<AST.TemplateElement>,
  expressions: Array<AST.Expression>,
  start: SourcePosition,
  end: SourcePosition,
): AST.TemplateLiteral {
  return {
    kind: SyntaxKinds.TemplateLiteral,
    quasis,
    expressions,
    start,
    end,
  };
}
export function createTemplateElement(
  value: string,
  tail: boolean,
  start: SourcePosition,
  end: SourcePosition,
): AST.TemplateElement {
  return {
    kind: SyntaxKinds.TemplateElement,
    value,
    tail,
    start,
    end,
  };
}
export function createArrayExpression(
  elements: Array<AST.Expression | null>,
  start: SourcePosition,
  end: SourcePosition,
  trailingComma = false,
): AST.ArrayExpression {
  return {
    kind: SyntaxKinds.ArrayExpression,
    elements,
    trailingComma,
    start,
    end,
  };
}
export function createObjectExpression(
  properties: AST.ObjectExpression["properties"],
  trailingComma: AST.ObjectExpression["trailingComma"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ObjectExpression {
  return {
    kind: SyntaxKinds.ObjectExpression,
    properties,
    trailingComma,
    start,
    end,
  };
}
export function createObjectProperty(
  key: AST.ObjectProperty["key"],
  value: AST.ObjectProperty["value"],
  computed: AST.ObjectProperty["computed"],
  shorted: AST.ObjectProperty["shorted"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ObjectProperty {
  return {
    kind: SyntaxKinds.ObjectProperty,
    computed,
    shorted,
    key,
    value,
    start,
    end,
  };
}
export function createObjectMethodDefintion(
  key: AST.ObjectMethodDefinition["key"],
  body: AST.ObjectMethodDefinition["body"],
  params: AST.ObjectMethodDefinition["params"],
  typeParameters: AST.ObjectMethodDefinition["typeParameters"],
  returnType: AST.ObjectMethodDefinition["returnType"],
  async: AST.ObjectMethodDefinition["async"],
  generator: AST.ObjectMethodDefinition["generator"],
  computed: AST.ObjectMethodDefinition["computed"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ObjectMethodDefinition {
  return {
    kind: SyntaxKinds.ObjectMethodDefintion,
    async,
    generator,
    computed,
    key,
    params,
    typeParameters,
    returnType,
    body,
    start,
    end,
  };
}
export function createObjectAccessor(
  key: AST.ObjectAccessor["key"],
  body: AST.ObjectAccessor["body"],
  params: AST.ObjectAccessor["params"],
  typeParameters: AST.ObjectAccessor["typeParameters"],
  returnType: AST.ObjectAccessor["returnType"],
  type: AST.ObjectAccessor["type"],
  computed: AST.ObjectAccessor["computed"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ObjectAccessor {
  return {
    kind: SyntaxKinds.ObjectAccessor,
    key,
    params,
    typeParameters,
    returnType,
    body,
    type,
    computed,
    start,
    end,
  };
}
export function createSpreadElement(
  argument: AST.Expression,
  start: SourcePosition,
  end: SourcePosition,
): AST.SpreadElement {
  return {
    kind: SyntaxKinds.SpreadElement,
    argument,
    start,
    end,
  };
}
export function createMetaProperty(
  meta: AST.MetaProperty["meta"],
  property: AST.MetaProperty["property"],
  start: SourcePosition,
  end: SourcePosition,
): AST.MetaProperty {
  return {
    kind: SyntaxKinds.MetaProperty,
    meta,
    property,
    start,
    end,
  };
}
export function createSuper(start: SourcePosition, end: SourcePosition): AST.Super {
  return {
    kind: SyntaxKinds.Super,
    name: "super",
    start,
    end,
  };
}
export function createImport(start: SourcePosition, end: SourcePosition): AST.Import {
  return {
    kind: SyntaxKinds.Import,
    name: "import",
    start,
    end,
  };
}
export function createThisExpression(start: SourcePosition, end: SourcePosition): AST.ThisExpression {
  return {
    kind: SyntaxKinds.ThisExpression,
    name: "this",
    start,
    end,
  };
}
export function createChainExpression(
  expr: AST.Expression,
  start: SourcePosition,
  end: SourcePosition,
): AST.ChainExpression {
  return {
    kind: SyntaxKinds.ChainExpression,
    expression: expr,
    start,
    end,
  };
}
export function createCallExpression(
  callee: AST.Expression,
  calleeArguments: Array<AST.Expression>,
  typeArguments: AST.CallExpression["typeArguments"],
  optional: boolean,
  start: SourcePosition,
  end: SourcePosition,
): AST.CallExpression {
  return {
    kind: SyntaxKinds.CallExpression,
    optional,
    callee,
    typeArguments,
    arguments: calleeArguments,
    start,
    end,
  };
}
export function createNewExpression(
  callee: AST.Expression,
  calleeArguments: Array<AST.Expression>,
  typeArguments: AST.NewExpression["typeArguments"],
  start: SourcePosition,
  end: SourcePosition,
): AST.NewExpression {
  return {
    kind: SyntaxKinds.NewExpression,
    callee,
    arguments: calleeArguments,
    typeArguments,
    start,
    end,
  };
}
export function createMemberExpression(
  computed: boolean,
  object: AST.Expression,
  property: AST.Expression,
  optional: boolean,
  start: SourcePosition,
  end: SourcePosition,
): AST.MemberExpression {
  return {
    kind: SyntaxKinds.MemberExpression,
    computed,
    optional,
    object,
    property,
    start,
    end,
  };
}
export function createTagTemplateExpression(
  base: AST.Expression,
  quasi: AST.TemplateLiteral,
  start: SourcePosition,
  end: SourcePosition,
): AST.TaggedTemplateExpression {
  return {
    kind: SyntaxKinds.TaggedTemplateExpression,
    tag: base,
    quasi,
    start,
    end,
  };
}
export function createUpdateExpression(
  argument: AST.Expression,
  operator: UpdateOperatorKinds,
  prefix: boolean,
  start: SourcePosition,
  end: SourcePosition,
): AST.UpdateExpression {
  return {
    kind: SyntaxKinds.UpdateExpression,
    operator,
    prefix,
    argument,
    start,
    end,
  };
}
export function createAwaitExpression(
  argument: AST.Expression,
  start: SourcePosition,
  end: SourcePosition,
): AST.AwaitExpression {
  return {
    kind: SyntaxKinds.AwaitExpression,
    argument,
    start,
    end,
  };
}
export function createUnaryExpression(
  argument: AST.Expression,
  operator: UnaryOperatorKinds,
  start: SourcePosition,
  end: SourcePosition,
): AST.UnaryExpression {
  return {
    kind: SyntaxKinds.UnaryExpression,
    operator,
    argument,
    start,
    end,
  };
}
export function createArrowExpression(
  isExpression: boolean,
  body: AST.Expression | AST.FunctionBody,
  calleeArguments: AST.ArrorFunctionExpression["arguments"],
  typeParameters: AST.ArrorFunctionExpression["typeParameters"],
  returnType: AST.ArrorFunctionExpression["returnType"],
  async: boolean,
  start: SourcePosition,
  end: SourcePosition,
): AST.ArrorFunctionExpression {
  return {
    kind: SyntaxKinds.ArrowFunctionExpression,
    expressionBody: isExpression,
    async,
    arguments: calleeArguments,
    typeParameters,
    returnType,
    body,
    start,
    end,
  };
}
export function createBinaryExpression(
  left: AST.Expression,
  right: AST.Expression,
  operator: BinaryOperatorKinds,
  start: SourcePosition,
  end: SourcePosition,
): AST.BinaryExpression {
  return {
    kind: SyntaxKinds.BinaryExpression,
    operator,
    left,
    right,
    start,
    end,
  };
}
export function createConditionalExpression(
  test: AST.Expression,
  consequnce: AST.Expression,
  alter: AST.Expression,
  start: SourcePosition,
  end: SourcePosition,
): AST.ConditionalExpression {
  return {
    kind: SyntaxKinds.ConditionalExpression,
    test,
    consequnce,
    alter,
    start,
    end,
  };
}
export function createYieldExpression(
  argument: AST.YieldExpression["argument"],
  delegate: AST.YieldExpression["delegate"],
  start: SourcePosition,
  end: SourcePosition,
): AST.YieldExpression {
  return {
    kind: SyntaxKinds.YieldExpression,
    argument,
    delegate,
    start,
    end,
  };
}
export function createAssignmentExpression(
  left: AST.AssigmentExpression["left"],
  right: AST.Expression,
  operator: AssigmentOperatorKinds,
  start: SourcePosition,
  end: SourcePosition,
): AST.AssigmentExpression {
  return {
    kind: SyntaxKinds.AssigmentExpression,
    operator,
    left,
    right,
    start,
    end,
  };
}
export function createSequenceExpression(
  exprs: Array<AST.Expression>,
  start: SourcePosition,
  end: SourcePosition,
): AST.SequenceExpression {
  return {
    kind: SyntaxKinds.SequenceExpression,
    exprs,
    start,
    end,
  };
}

export function createJSXElement(
  openingElement: AST.JSXElement["openingElement"],
  closingElement: AST.JSXElement["closingElement"],
  children: AST.JSXElement["children"],
  start: SourcePosition,
  end: SourcePosition,
): AST.JSXElement {
  return {
    kind: SyntaxKinds.JSXElement,
    openingElement,
    closingElement,
    children,
    start,
    end,
  };
}

export function createJSXOpeningElement(
  name: AST.JSXOpeningElement["name"],
  attributes: AST.JSXOpeningElement["attributes"],
  selfClosing: AST.JSXOpeningElement["selfClosing"],
  start: SourcePosition,
  end: SourcePosition,
): AST.JSXOpeningElement {
  return {
    kind: SyntaxKinds.JSXOpeningElement,
    name,
    selfClosing,
    attributes,
    start,
    end,
  };
}

export function createJSXClosingElement(
  name: AST.JSXClosingElement["name"],
  start: SourcePosition,
  end: SourcePosition,
): AST.JSXClosingElement {
  return {
    kind: SyntaxKinds.JSXClosingElement,
    name,
    start,
    end,
  };
}
export function createJSXIdentifier(
  name: AST.JSXIdentifier["name"],
  start: SourcePosition,
  end: SourcePosition,
): AST.JSXIdentifier {
  return {
    kind: SyntaxKinds.JSXIdentifier,
    name,
    start,
    end,
  };
}
export function createJSXMemberExpression(
  object: AST.JSXMemberExpression["object"],
  property: AST.JSXMemberExpression["property"],
  start: SourcePosition,
  end: SourcePosition,
): AST.JSXMemberExpression {
  return {
    kind: SyntaxKinds.JSXMemberExpression,
    object,
    property,
    start,
    end,
  };
}
export function createJSXNamespacedName(
  namespace: AST.JSXNamespacedName["namespace"],
  name: AST.JSXNamespacedName["name"],
  start: SourcePosition,
  end: SourcePosition,
): AST.JSXNamespacedName {
  return {
    kind: SyntaxKinds.JSXNamespaceName,
    namespace,
    name,
    start,
    end,
  };
}

export function createJSXAttribute(
  name: AST.JSXAttribute["name"],
  value: AST.JSXAttribute["value"],
  start: SourcePosition,
  end: SourcePosition,
): AST.JSXAttribute {
  return {
    kind: SyntaxKinds.JSXAttribute,
    name,
    value,
    start,
    end,
  };
}

export function createJSXSpreadAttribute(
  argument: AST.JSXSpreadAttribute["argument"],
  start: SourcePosition,
  end: SourcePosition,
): AST.JSXSpreadAttribute {
  return {
    kind: SyntaxKinds.JSXSpreadAttribute,
    argument,
    start,
    end,
  };
}

export function createJSXSpreadChild(
  argument: AST.JSXSpreadChild["argument"],
  start: SourcePosition,
  end: SourcePosition,
): AST.JSXSpreadChild {
  return {
    kind: SyntaxKinds.JSXSpreadChild,
    argument,
    start,
    end,
  };
}

export function createJSXText(
  value: AST.JSXText["value"],
  start: SourcePosition,
  end: SourcePosition,
): AST.JSXText {
  return {
    kind: SyntaxKinds.JSXText,
    value,
    start,
    end,
  };
}

export function createsJSXExpressionContainer(
  expression: AST.JSXExpressionContainer["expression"],
  start: SourcePosition,
  end: SourcePosition,
): AST.JSXExpressionContainer {
  return {
    kind: SyntaxKinds.JSXExpressionContainer,
    expression,
    start,
    end,
  };
}

export function createJSXFragment(
  openingFragment: AST.JSXFragment["openingFragment"],
  closingFragment: AST.JSXFragment["closingFragment"],
  children: AST.JSXFragment["children"],
  start: SourcePosition,
  end: SourcePosition,
): AST.JSXFragment {
  return {
    kind: SyntaxKinds.JSXFragment,
    openingFragment,
    closingFragment,
    children,
    start,
    end,
  };
}

export function createJSXOpeningFragment(start: SourcePosition, end: SourcePosition): AST.JSXOpeningFragment {
  return {
    kind: SyntaxKinds.JSXOpeningFragment,
    start,
    end,
  };
}

export function createJSXClosingFragment(start: SourcePosition, end: SourcePosition): AST.JSXClosingFragment {
  return {
    kind: SyntaxKinds.JSXClosingFragment,
    start,
    end,
  };
}
