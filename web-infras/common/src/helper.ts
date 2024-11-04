import { SyntaxKinds } from "@/src/kind";
import {
  ModuleItem,
  StringLiteral,
  TemplateElement,
  MemberExpression,
  ObjectExpression,
  ObjectProperty,
  ObjectAccessor,
  SpreadElement,
  RestElement,
  ClassExpression,
  ArrayExpression,
  UnaryExpression,
  AwaitExpression,
  YieldExpression,
  FunctionExpression,
  BinaryExpression,
  AssigmentExpression,
  AssignmentPattern,
  VariableDeclaration,
  ArrorFunctionExpression,
  ArrayPattern,
  ObjectPattern,
  ObjectPatternProperty,
  Pattern,
  CallExpression,
  IfStatement,
  BlockStatement,
  ReturnStatement,
  FunctionDeclaration,
  ExpressionStatement,
  ObjectMethodDefinition,
  ThisExpression,
  Identifier,
  NumberLiteral,
  PrivateName,
  Super,
} from "@/src/ast/index";

export function isSuper(node: ModuleItem): node is Super {
  return node.kind === SyntaxKinds.Super;
}
export function isThisExpression(node: ModuleItem): node is ThisExpression {
  return node.kind === SyntaxKinds.ThisExpression;
}
export function isIdentifer(node: ModuleItem): node is Identifier {
  return node.kind === SyntaxKinds.Identifier;
}
export function isPrivateName(node: ModuleItem): node is PrivateName {
  return node.kind === SyntaxKinds.PrivateName;
}
export function isNumnerLiteral(node: ModuleItem): node is NumberLiteral {
  return (
    node.kind === SyntaxKinds.DecimalLiteral ||
    node.kind === SyntaxKinds.NonOctalDecimalLiteral ||
    node.kind === SyntaxKinds.BinaryIntegerLiteral ||
    node.kind === SyntaxKinds.OctalIntegerLiteral ||
    node.kind === SyntaxKinds.HexIntegerLiteral ||
    node.kind === SyntaxKinds.LegacyOctalIntegerLiteral ||
    node.kind === SyntaxKinds.DecimalBigIntegerLiteral ||
    node.kind === SyntaxKinds.BinaryBigIntegerLiteral ||
    node.kind === SyntaxKinds.HexBigIntegerLiteral ||
    node.kind === SyntaxKinds.OctalBigIntegerLiteral
  );
}
export function isStringLiteral(node: ModuleItem): node is StringLiteral {
  return node.kind === SyntaxKinds.StringLiteral;
}
export function isTemplateLiteral(node: ModuleItem): node is TemplateElement {
  return node.kind === SyntaxKinds.TemplateLiteral;
}
export function isTemplateElement(node: ModuleItem): node is TemplateElement {
  return node.kind === SyntaxKinds.TemplateElement;
}
export function isMemberExpression(node: ModuleItem): node is MemberExpression {
  return node.kind === SyntaxKinds.MemberExpression;
}
export function isObjectExpression(node: ModuleItem): node is ObjectExpression {
  return node.kind === SyntaxKinds.ObjectExpression;
}
export function isObjectProperty(node: ModuleItem): node is ObjectProperty {
  return node.kind === SyntaxKinds.ObjectProperty;
}
export function isObjectMethodDefinition(node: ModuleItem): node is ObjectMethodDefinition {
  return node.kind === SyntaxKinds.ObjectMethodDefintion;
}
export function isObjectAccessor(node: ModuleItem): node is ObjectAccessor {
  return node.kind === SyntaxKinds.ObjectAccessor;
}
export function isSpreadElement(node: ModuleItem): node is SpreadElement {
  return node.kind === SyntaxKinds.SpreadElement;
}
export function isRestElement(node: ModuleItem): node is RestElement {
  return node.kind === SyntaxKinds.RestElement;
}
export function isClassExpression(node: ModuleItem): node is ClassExpression {
  return node.kind === SyntaxKinds.ClassExpression;
}
export function isArrayExpression(node: ModuleItem): node is ArrayExpression {
  return node.kind === SyntaxKinds.ArrayExpression;
}
export function isUnaryExpression(node: ModuleItem): node is UnaryExpression {
  return node.kind === SyntaxKinds.UnaryExpression;
}
export function isAwaitExpression(node: ModuleItem): node is AwaitExpression {
  return node.kind === SyntaxKinds.AwaitExpression;
}
export function isYieldExpression(node: ModuleItem): node is YieldExpression {
  return node.kind === SyntaxKinds.YieldExpression;
}
export function isFunctionExpression(node: ModuleItem): node is FunctionExpression {
  return node.kind === SyntaxKinds.FunctionExpression;
}
export function isBinaryExpression(node: ModuleItem): node is BinaryExpression {
  return node.kind === SyntaxKinds.BinaryExpression;
}
export function isAssignmentExpression(node: ModuleItem): node is AssigmentExpression {
  return node.kind === SyntaxKinds.AssigmentExpression;
}
export function isAssignmentPattern(node: ModuleItem): node is AssignmentPattern {
  return node.kind === SyntaxKinds.AssignmentPattern;
}
export function isVarDeclaration(node: ModuleItem): node is VariableDeclaration {
  return node.kind === SyntaxKinds.VariableDeclaration;
}
export function isArrowFunctionExpression(node: ModuleItem): node is ArrorFunctionExpression {
  return node.kind === SyntaxKinds.ArrowFunctionExpression;
}
export function isArrayPattern(node: ModuleItem): node is ArrayPattern {
  return node.kind === SyntaxKinds.ArrayPattern;
}
export function isObjectPattern(node: ModuleItem): node is ObjectPattern {
  return node.kind === SyntaxKinds.ObjectPattern;
}
export function isObjectPatternProperty(node: ModuleItem): node is ObjectPatternProperty {
  return node.kind === SyntaxKinds.ObjectPatternProperty;
}
export function isPattern(node: ModuleItem): node is Pattern {
  return (
    node.kind === SyntaxKinds.AssignmentPattern ||
    node.kind === SyntaxKinds.ObjectPattern ||
    node.kind === SyntaxKinds.ArrayPattern ||
    node.kind === SyntaxKinds.RestElement ||
    node.kind === SyntaxKinds.Identifier ||
    node.kind === SyntaxKinds.MemberExpression
  );
}
export function isCallExpression(node: ModuleItem): node is CallExpression {
  return node.kind === SyntaxKinds.CallExpression;
}

export function isIfStatement(node: ModuleItem): node is IfStatement {
  return node.kind === SyntaxKinds.IfStatement;
}

export function isBlockStatement(node: ModuleItem): node is BlockStatement {
  return node.kind === SyntaxKinds.BlockStatement;
}

export function isReturnStatement(node: ModuleItem): node is ReturnStatement {
  return node.kind === SyntaxKinds.ReturnStatement;
}

export function isFunctionDeclaration(node: ModuleItem): node is FunctionDeclaration {
  return node.kind === SyntaxKinds.FunctionDeclaration;
}

export function isExpressionStatement(node: ModuleItem): node is ExpressionStatement {
  return node.kind === SyntaxKinds.ExpressionStatement;
}
