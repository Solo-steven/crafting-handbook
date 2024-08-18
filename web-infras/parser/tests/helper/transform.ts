import {
  BinaryExpression,
  Program,
  UpdateExpression,
  UnaryExpression,
  AssigmentExpression,
  SyntaxKinds,
  Visitor,
  SytaxKindsMapLexicalLiteral,
  visitNode,
  ModuleItem,
  PropagationtVisitorTable,
} from "web-infra-common";

const VisitorTable: Visitor = {
  [SyntaxKinds.Program]: transformKind,
  [SyntaxKinds.RegexLiteral]: transformKind,
  [SyntaxKinds.BooleanLiteral]: transformKind,
  [SyntaxKinds.NullLiteral]: transformKind,
  [SyntaxKinds.UndefinedLiteral]: transformKind,
  [SyntaxKinds.DecimalLiteral]: transformKind,
  [SyntaxKinds.NonOctalDecimalLiteral]: transformKind,
  [SyntaxKinds.BinaryIntegerLiteral]: transformKind,
  [SyntaxKinds.OctalIntegerLiteral]: transformKind,
  [SyntaxKinds.HexIntegerLiteral]: transformKind,
  [SyntaxKinds.LegacyOctalIntegerLiteral]: transformKind,
  [SyntaxKinds.DecimalBigIntegerLiteral]: transformKind,
  [SyntaxKinds.HexBigIntegerLiteral]: transformKind,
  [SyntaxKinds.OctalBigIntegerLiteral]: transformKind,
  [SyntaxKinds.BinaryBigIntegerLiteral]: transformKind,
  [SyntaxKinds.StringLiteral]: transformKind,
  [SyntaxKinds.Identifier]: transformKind,
  [SyntaxKinds.Super]: transformKind,
  [SyntaxKinds.Import]: transformKind,
  [SyntaxKinds.ThisExpression]: transformKind,
  [SyntaxKinds.PrivateName]: transformKind,
  [SyntaxKinds.TemplateLiteral]: transformKind,
  [SyntaxKinds.TemplateElement]: transformKind,
  [SyntaxKinds.ObjectExpression]: transformKind,
  [SyntaxKinds.ObjectProperty]: transformKind,
  [SyntaxKinds.ObjectMethodDefintion]: transformKind,
  [SyntaxKinds.ObjectAccessor]: transformKind,
  [SyntaxKinds.SpreadElement]: transformKind,
  [SyntaxKinds.ClassExpression]: transformKind,
  [SyntaxKinds.ArrayExpression]: transformKind,
  [SyntaxKinds.FunctionExpression]: transformKind,
  [SyntaxKinds.ArrowFunctionExpression]: transformKind,
  [SyntaxKinds.MetaProperty]: transformKind,
  [SyntaxKinds.AwaitExpression]: transformKind,
  [SyntaxKinds.NewExpression]: transformKind,
  [SyntaxKinds.MemberExpression]: transformKind,
  [SyntaxKinds.CallExpression]: transformKind,
  [SyntaxKinds.TaggedTemplateExpression]: transformKind,
  [SyntaxKinds.ChainExpression]: transformKind,
  [SyntaxKinds.UpdateExpression]: function UpdateExpression(node: UpdateExpression, visitor: Visitor) {
    // @ts-expect-error
    node.operator = SytaxKindsMapLexicalLiteral[node.operator];
    transformKind(node, visitor);
  },
  [SyntaxKinds.UnaryExpression]: function UnaryExpression(node: UnaryExpression, visitor: Visitor) {
    // @ts-expect-error
    node.operator = SytaxKindsMapLexicalLiteral[node.operator];
    transformKind(node, visitor);
  },
  [SyntaxKinds.BinaryExpression]: function BinaryExpression(node: BinaryExpression, visitor: Visitor) {
    // @ts-expect-error
    node.operator = SytaxKindsMapLexicalLiteral[node.operator];
    transformKind(node, visitor);
  },
  [SyntaxKinds.ConditionalExpression]: transformKind,
  [SyntaxKinds.YieldExpression]: transformKind,
  [SyntaxKinds.AssigmentExpression]: function AssignmentExpression(
    node: AssigmentExpression,
    visitor: Visitor,
  ) {
    // @ts-expect-error
    node.operator = SytaxKindsMapLexicalLiteral[node.operator];
    transformKind(node, visitor);
  },
  [SyntaxKinds.SequenceExpression]: transformKind,
  [SyntaxKinds.ExpressionStatement]: transformKind,
  [SyntaxKinds.ObjectPattern]: transformKind,
  [SyntaxKinds.ObjectPatternProperty]: transformKind,
  [SyntaxKinds.ArrayPattern]: transformKind,
  [SyntaxKinds.AssignmentPattern]: transformKind,
  [SyntaxKinds.RestElement]: transformKind,
  [SyntaxKinds.IfStatement]: transformKind,
  [SyntaxKinds.BlockStatement]: transformKind,
  [SyntaxKinds.DebuggerStatement]: transformKind,
  [SyntaxKinds.EmptyStatement]: transformKind,
  [SyntaxKinds.SwitchStatement]: transformKind,
  [SyntaxKinds.SwitchCase]: transformKind,
  [SyntaxKinds.ContinueStatement]: transformKind,
  [SyntaxKinds.BreakStatement]: transformKind,
  [SyntaxKinds.ReturnStatement]: transformKind,
  [SyntaxKinds.LabeledStatement]: transformKind,
  [SyntaxKinds.WhileStatement]: transformKind,
  [SyntaxKinds.DoWhileStatement]: transformKind,
  [SyntaxKinds.TryStatement]: transformKind,
  [SyntaxKinds.CatchClause]: transformKind,
  [SyntaxKinds.ThrowStatement]: transformKind,
  [SyntaxKinds.WithStatement]: transformKind,
  [SyntaxKinds.ForStatement]: transformKind,
  [SyntaxKinds.ForInStatement]: transformKind,
  [SyntaxKinds.ForOfStatement]: transformKind,
  [SyntaxKinds.VariableDeclaration]: transformKind,
  [SyntaxKinds.VariableDeclarator]: transformKind,
  [SyntaxKinds.FunctionBody]: transformKind,
  [SyntaxKinds.FunctionDeclaration]: transformKind,
  [SyntaxKinds.ClassBody]: transformKind,
  [SyntaxKinds.ClassProperty]: transformKind,
  [SyntaxKinds.ClassMethodDefinition]: transformKind,
  [SyntaxKinds.ClassConstructor]: transformKind,
  [SyntaxKinds.ClassAccessor]: transformKind,
  [SyntaxKinds.ClassDeclaration]: transformKind,
  [SyntaxKinds.ImportDeclaration]: transformKind,
  [SyntaxKinds.ImportDefaultSpecifier]: transformKind,
  [SyntaxKinds.ImportSpecifier]: transformKind,
  [SyntaxKinds.ImportNamespaceSpecifier]: transformKind,
  [SyntaxKinds.ExportNamedDeclaration]: transformKind,
  [SyntaxKinds.ExportSpecifier]: transformKind,
  [SyntaxKinds.ExportDefaultDeclaration]: transformKind,
  [SyntaxKinds.ExportAllDeclaration]: transformKind,
  [SyntaxKinds.JSXElement]: transformKind,
  [SyntaxKinds.JSXOpeningElement]: transformKind,
  [SyntaxKinds.JSXClosingElement]: transformKind,
  [SyntaxKinds.JSXIdentifier]: transformKind,
  [SyntaxKinds.JSXMemberExpression]: transformKind,
  [SyntaxKinds.JSXNamespaceName]: transformKind,
  [SyntaxKinds.JSXAttribute]: transformKind,
  [SyntaxKinds.JSXSpreadAttribute]: transformKind,
  [SyntaxKinds.JSXSpreadChild]: transformKind,
  [SyntaxKinds.JSXExpressionContainer]: transformKind,
  [SyntaxKinds.JSXFragment]: transformKind,
  [SyntaxKinds.JSXOpeningFragment]: transformKind,
  [SyntaxKinds.JSXClosingFragment]: transformKind,
};
function transformKind(node: ModuleItem, visior: Visitor) {
  // @ts-expect-error
  const visitChild = PropagationtVisitorTable[node.kind];
  // @ts-expect-error
  node.kind = SytaxKindsMapLexicalLiteral[node.kind];
  visitChild(node, visior);
}
/**
 * Transform AST kind from number enum to string.
 * @param {Program} program
 */
export function transformSyntaxKindToLiteral(program: Program): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  visitNode(program, VisitorTable);
}
