import {
  ModuleItem,
  BinaryExpression,
  ObjectExpression,
  ObjectMethodDefinition,
  ObjectProperty,
  ObjectAccessor,
  PrivateName,
  Program,
  Super,
  TemplateElement,
  TemplateLiteral,
  ThisExpression,
  SpreadElement,
  ClassExpression,
  ArrayExpression,
  FunctionExpression,
  ArrorFunctionExpression,
  MetaProperty,
  AwaitExpression,
  NewExpression,
  MemberExpression,
  CallExpression,
  UpdateExpression,
  UnaryExpression,
  ConditionalExpression,
  YieldExpression,
  AssigmentExpression,
  SequenceExpression,
  ObjectPattern,
  ObjectPatternProperty,
  ArrayPattern,
  AssignmentPattern,
  RestElement,
  IfStatement,
  BlockStatement,
  SwitchStatement,
  SwitchCase,
  ContinueStatement,
  BreakStatement,
  ReturnStatement,
  LabeledStatement,
  WhileStatement,
  DoWhileStatement,
  TryStatement,
  CatchClause,
  ThrowStatement,
  WithStatement,
  DebuggerStatement,
  ForStatement,
  ForInStatement,
  ForOfStatement,
  VariableDeclaration,
  VariableDeclarator,
  FunctionBody,
  FunctionDeclaration,
  ClassBody,
  ClassProperty,
  ClassMethodDefinition,
  ClassAccessor,
  ClassDeclaration,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportSpecifier,
  ImportNamespaceSpecifier,
  ExportNamedDeclarations,
  ExportSpecifier,
  ExportDefaultDeclaration,
  ExportAllDeclaration,
  TaggedTemplateExpression,
  ChainExpression,
  ClassConstructor,
  ExpressionStatement,
  Identifier,
  StringLiteral,
  BoolLiteral,
  EmptyStatement,
  NullLiteral,
  UndefinbedLiteral,
  Import,
  RegexLiteral,
  DecimalLiteral,
  NonOctalDecimalLiteral,
  BinaryIntegerLiteral,
  OctalIntegerLiteral,
  HexIntegerLiteral,
  LegacyOctalIntegerLiteral,
  ImportAttribute,
  DecimalBigIntegerLiteral,
  OctalBigIntegerLiteral,
  HexBigIntegerLiteral,
  JSXClosingElement,
  JSXAttribute,
  JSXElement,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName,
  JSXOpeningElement,
  JSXSpreadAttribute,
  JSXText,
  JSXExpressionContainer,
  JSXFragment,
  JSXClosingFragment,
  JSXOpeningFragment,
  Decorator,
  ClassAccessorProperty,
  TSTypeAliasDeclaration,
  TSInterfaceDeclaration,
  TSTypeLiteral,
  TSCallSignatureDeclaration,
  TSConstructSignatureDeclaration,
  TSPropertySignature,
  TSMethodSignature,
  TSQualifiedName,
  TSTypePredicate,
  TSTypeAnnotation,
  TSTypeReference,
  TSStringKeyword,
  TSNumberKeyword,
  TSBigIntKeyword,
  TSBooleanKeyword,
  TSTypeParameter,
  TSTypeParameterDeclaration,
  TSTypeParameterInstantiation,
  TSInterfaceBody,
  TSFunctionType,
  TSUnknowKeyword,
  TSNeverKeyword,
  TSAnyKeyword,
  TSSymbolKeyword,
  TSUndefinedKeyword,
  TSNullKeyword,
  TSConstrcutorType,
  TSConditionalType,
  TSIntersectionType,
  TSArrayType,
  TSTypeOperator,
  TSIndexedAccessType,
  TSUnionType,
  TSInstantiationExpression,
  TSVoidKeyword,
  TSInterfaceHeritage,
  TSTypeAssertionExpression,
  TSAsExpression,
  TSSatisfiesExpression,
  TSNonNullExpression,
  TSEnumDeclaration,
  TSEnumBody,
  TSEnumMember,
  TSDeclareFunction,
} from "@/src/ast/index";
import { SyntaxKinds } from "@/src/kind";
import { RequireVisitor, Visitor } from "./type";

export const PropagationtVisitorTable: RequireVisitor = {
  [SyntaxKinds.Program]: function visitProgram(node: Program, visitor: Visitor) {
    visitNodes(node.body, visitor);
  },
  [SyntaxKinds.RegexLiteral]: function visitRegexLiteral(_node: RegexLiteral, _visior: Visitor) {},
  [SyntaxKinds.NullLiteral]: function visitNullLiteral(_node: NullLiteral, _visitor: Visitor) {},
  [SyntaxKinds.UndefinedLiteral]: function visitUndefinedLiteral(
    _node: UndefinbedLiteral,
    _visitor: Visitor,
  ) {},
  [SyntaxKinds.BooleanLiteral]: function visitBoolLiteral(_node: BoolLiteral, _visior: Visitor) {},
  [SyntaxKinds.StringLiteral]: function visitStringLiteral(_node: StringLiteral, _visitor: Visitor) {},
  [SyntaxKinds.DecimalLiteral]: function (_node: DecimalLiteral, _visitor: Visitor) {},
  [SyntaxKinds.NonOctalDecimalLiteral]: function (_node: NonOctalDecimalLiteral, _visior: Visitor) {},
  [SyntaxKinds.BinaryIntegerLiteral]: function (_node: BinaryIntegerLiteral, _visior: Visitor) {},
  [SyntaxKinds.OctalIntegerLiteral]: function (_node: OctalIntegerLiteral, _visior: Visitor) {},
  [SyntaxKinds.HexIntegerLiteral]: function (_node: HexIntegerLiteral, _visior: Visitor) {},
  [SyntaxKinds.LegacyOctalIntegerLiteral]: function (_node: LegacyOctalIntegerLiteral, _visior: Visitor) {},
  [SyntaxKinds.DecimalBigIntegerLiteral]: function (_node: DecimalBigIntegerLiteral, _visitor: Visitor) {},
  [SyntaxKinds.BinaryBigIntegerLiteral]: function (_node: BinaryIntegerLiteral, _visitor: Visitor) {},
  [SyntaxKinds.OctalBigIntegerLiteral]: function (_node: OctalBigIntegerLiteral, _visitor: Visitor) {},
  [SyntaxKinds.HexBigIntegerLiteral]: function (_node: HexBigIntegerLiteral, _visitor: Visitor) {},
  [SyntaxKinds.Identifier]: function bindIdentifier(node: Identifier, visitor: Visitor) {
    visitNode(node.typeAnnotation, visitor);
  },
  [SyntaxKinds.Super]: function bindSuper(_node: Super, _visitor: Visitor) {},
  [SyntaxKinds.Import]: function bindImport(_node: Import, _visitor: Visitor) {},
  [SyntaxKinds.ThisExpression]: function bindThisExpression(_node: ThisExpression, _visitor: Visitor) {},
  [SyntaxKinds.PrivateName]: function bindPrivateName(_node: PrivateName, _visitor: Visitor) {},
  [SyntaxKinds.TemplateLiteral]: function bindTemplateLiteral(node: TemplateLiteral, visitor: Visitor) {
    visitNodes(node.expressions, visitor);
    visitNodes(node.quasis, visitor);
  },
  [SyntaxKinds.TemplateElement]: function bindTemplateElement(_node: TemplateElement, _visitor: Visitor) {},
  [SyntaxKinds.ObjectExpression]: function bindObjectExpression(node: ObjectExpression, visitor: Visitor) {
    visitNodes(node.properties, visitor);
  },
  [SyntaxKinds.ObjectProperty]: function bindObjectProperty(node: ObjectProperty, visitor: Visitor) {
    visitNode(node.key, visitor);
    visitNode(node.value, visitor);
  },
  [SyntaxKinds.ObjectMethodDefintion]: function bindObjectMethodDefintion(
    node: ObjectMethodDefinition,
    visitor: Visitor,
  ) {
    visitNode(node.key, visitor);
    visitNode(node.typeParameters, visitor);
    visitNodes(node.params, visitor);
    visitNode(node.returnType, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.ObjectAccessor]: function bindObjectAccessor(node: ObjectAccessor, visitor: Visitor) {
    visitNode(node.key, visitor);
    visitNode(node.typeParameters, visitor);
    visitNodes(node.params, visitor);
    visitNode(node.returnType, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.SpreadElement]: function bindSpreadElement(node: SpreadElement, visitor: Visitor) {
    visitNode(node.argument, visitor);
  },
  [SyntaxKinds.ClassExpression]: function bindClassExpression(node: ClassExpression, visitor: Visitor) {
    visitNode(node.id, visitor);
    visitNode(node.superClass, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.ArrayExpression]: function bindArrayExpression(node: ArrayExpression, visitor: Visitor) {
    visitNodes(node.elements, visitor);
  },
  [SyntaxKinds.FunctionExpression]: function bindFunctionExpression(
    node: FunctionExpression,
    visitor: Visitor,
  ) {
    visitNode(node.name, visitor);
    visitNode(node.typeParameters, visitor);
    visitNodes(node.params, visitor);
    visitNode(node.returnType, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.ArrowFunctionExpression]: function bindArrowFunctionExpression(
    node: ArrorFunctionExpression,
    visitor: Visitor,
  ) {
    visitNode(node.typeParameters, visitor);
    visitNodes(node.arguments, visitor);
    visitNode(node.returnType, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.MetaProperty]: function bindMetaProperty(node: MetaProperty, visitor: Visitor) {
    visitNode(node.meta, visitor);
    visitNode(node.property, visitor);
  },
  [SyntaxKinds.AwaitExpression]: function bindAwaitExpression(node: AwaitExpression, visitor: Visitor) {
    visitNode(node.argument, visitor);
  },
  [SyntaxKinds.NewExpression]: function bindNewExpression(node: NewExpression, visitor: Visitor) {
    visitNode(node.callee, visitor);
    visitNode(node.typeArguments, visitor);
    visitNodes(node.arguments, visitor);
  },
  [SyntaxKinds.MemberExpression]: function bindMemberExpression(node: MemberExpression, visitor: Visitor) {
    visitNode(node.object, visitor);
    visitNode(node.property, visitor);
  },
  [SyntaxKinds.CallExpression]: function bindCallExpression(node: CallExpression, visitor: Visitor) {
    visitNode(node.callee, visitor);
    visitNodes(node.arguments, visitor);
    visitNode(node.typeArguments, visitor);
  },
  [SyntaxKinds.TaggedTemplateExpression]: function bindTaggTemplateExpression(
    node: TaggedTemplateExpression,
    visitor: Visitor,
  ) {
    visitNode(node.tag, visitor);
    visitNode(node.quasi, visitor);
  },
  [SyntaxKinds.ChainExpression]: function bindChainExpression(node: ChainExpression, visitor: Visitor) {
    visitNode(node.expression, visitor);
  },
  [SyntaxKinds.UpdateExpression]: function bindUpdateExpression(node: UpdateExpression, visitor: Visitor) {
    visitNode(node.argument, visitor);
  },
  [SyntaxKinds.UnaryExpression]: function bindUnaryExpression(node: UnaryExpression, visitor: Visitor) {
    visitNode(node.argument, visitor);
  },
  [SyntaxKinds.BinaryExpression]: function bindBinaryExpression(node: BinaryExpression, visitor: Visitor) {
    visitNode(node.left, visitor);
    visitNode(node.right, visitor);
  },
  [SyntaxKinds.ConditionalExpression]: function bindConditionalExpression(
    node: ConditionalExpression,
    visitor: Visitor,
  ) {
    visitNode(node.test, visitor);
    visitNode(node.consequnce, visitor);
    visitNode(node.alter, visitor);
  },
  [SyntaxKinds.YieldExpression]: function bindYieldExpression(node: YieldExpression, visitor: Visitor) {
    visitNode(node.argument, visitor);
  },
  [SyntaxKinds.AssigmentExpression]: function bindAssignmentExpression(
    node: AssigmentExpression,
    visitor: Visitor,
  ) {
    visitNode(node.left, visitor);
    visitNode(node.right, visitor);
  },
  [SyntaxKinds.SequenceExpression]: function bindSequenceExpression(
    node: SequenceExpression,
    visitor: Visitor,
  ) {
    visitNodes(node.exprs, visitor);
  },
  [SyntaxKinds.ExpressionStatement]: function bindExpressionStatement(
    node: ExpressionStatement,
    visitor: Visitor,
  ) {
    visitNode(node.expr, visitor);
  },
  [SyntaxKinds.ObjectPattern]: function bindObjectPattern(node: ObjectPattern, visitor: Visitor) {
    visitNodes(node.properties, visitor);
    visitNode(node.typeAnnotation, visitor);
  },
  [SyntaxKinds.ObjectPatternProperty]: function bindObjectPatternProperty(
    node: ObjectPatternProperty,
    visitor: Visitor,
  ) {
    visitNode(node.key, visitor);
    visitNode(node.value, visitor);
  },
  [SyntaxKinds.ArrayPattern]: function bindArrayPattern(node: ArrayPattern, visitor: Visitor) {
    visitNodes(node.elements, visitor);
    visitNode(node.typeAnnotation, visitor);
  },
  [SyntaxKinds.AssignmentPattern]: function bindAssigmentPattern(node: AssignmentPattern, visitor: Visitor) {
    visitNode(node.left, visitor);
    visitNode(node.right, visitor);
    visitNode(node.typeAnnotation, visitor);
  },
  [SyntaxKinds.RestElement]: function bindRestElement(node: RestElement, visitor: Visitor) {
    visitNode(node.argument, visitor);
    visitNode(node.typeAnnotation, visitor);
  },
  [SyntaxKinds.IfStatement]: function bindIfStatement(node: IfStatement, visitor: Visitor) {
    visitNode(node.test, visitor);
    visitNode(node.conseqence, visitor);
    visitNode(node.alternative, visitor);
  },
  [SyntaxKinds.BlockStatement]: function bindBlockStatement(node: BlockStatement, visitor: Visitor) {
    visitNodes(node.body, visitor);
  },
  [SyntaxKinds.SwitchStatement]: function bindSwitchStatement(node: SwitchStatement, visitor: Visitor) {
    visitNode(node.discriminant, visitor);
    visitNodes(node.cases, visitor);
  },
  [SyntaxKinds.SwitchCase]: function bindSwitchCase(node: SwitchCase, visitor: Visitor) {
    visitNode(node.test, visitor);
    visitNodes(node.consequence, visitor);
  },
  [SyntaxKinds.ContinueStatement]: function bindContinueStatement(node: ContinueStatement, visitor: Visitor) {
    visitNode(node.label, visitor);
  },
  [SyntaxKinds.BreakStatement]: function bindBreakStatement(node: BreakStatement, visitor: Visitor) {
    visitNode(node.label, visitor);
  },
  [SyntaxKinds.ReturnStatement]: function bindReturnStatement(node: ReturnStatement, visitor: Visitor) {
    visitNode(node.argu, visitor);
  },
  [SyntaxKinds.LabeledStatement]: function bindLabeledStatement(node: LabeledStatement, visitor: Visitor) {
    visitNode(node.label, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.WhileStatement]: function bindWhileStatement(node: WhileStatement, visitor: Visitor) {
    visitNode(node.test, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.DoWhileStatement]: function bindDoWhileStatement(node: DoWhileStatement, visitor: Visitor) {
    visitNode(node.test, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.TryStatement]: function bindTryStatement(node: TryStatement, visitor: Visitor) {
    visitNode(node.block, visitor);
    visitNode(node.handler, visitor);
    visitNode(node.finalizer, visitor);
  },
  [SyntaxKinds.CatchClause]: function bindCatchClause(node: CatchClause, visitor: Visitor) {
    visitNode(node.param, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.ThrowStatement]: function bindThrowStatement(node: ThrowStatement, visitor: Visitor) {
    visitNode(node.argu, visitor);
  },
  [SyntaxKinds.WithStatement]: function bindWithStatement(node: WithStatement, visitor: Visitor) {
    visitNode(node.object, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.DebuggerStatement]: function bindDebuggerStatement(
    _node: DebuggerStatement,
    _visitor: Visitor,
  ) {},
  [SyntaxKinds.EmptyStatement]: function visitEmptyStatement(_node: EmptyStatement, _visitor: Visitor) {},
  [SyntaxKinds.ForStatement]: function bindForStatement(node: ForStatement, visitor: Visitor) {
    visitNode(node.test, visitor);
    visitNode(node.init, visitor);
    visitNode(node.update, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.ForInStatement]: function bindForInStatement(node: ForInStatement, visitor: Visitor) {
    visitNode(node.left, visitor);
    visitNode(node.right, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.ForOfStatement]: function bindForOfStatement(node: ForOfStatement, visitor: Visitor) {
    visitNode(node.left, visitor);
    visitNode(node.right, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.VariableDeclaration]: function bindVariableDeclaration(
    node: VariableDeclaration,
    visitor: Visitor,
  ) {
    visitNodes(node.declarations, visitor);
  },
  [SyntaxKinds.VariableDeclarator]: function bindVariableDeclarator(
    node: VariableDeclarator,
    visitor: Visitor,
  ) {
    visitNode(node.id, visitor);
    visitNode(node.init, visitor);
  },
  [SyntaxKinds.FunctionBody]: function bindFunctionBody(node: FunctionBody, visitor: Visitor) {
    visitNodes(node.body, visitor);
  },
  [SyntaxKinds.FunctionDeclaration]: function bindFunctionDeclaration(
    node: FunctionDeclaration,
    visitor: Visitor,
  ) {
    visitNode(node.name, visitor);
    visitNode(node.typeParameters, visitor);
    visitNodes(node.params, visitor);
    visitNode(node.returnType, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.ClassBody]: function bindClassBody(node: ClassBody, visitor: Visitor) {
    visitNodes(node.body, visitor);
  },
  [SyntaxKinds.ClassProperty]: function bindClassProperty(node: ClassProperty, visitor: Visitor) {
    visitNode(node.key, visitor);
    visitNode(node.value, visitor);
    visitNodes(node.decorators, visitor);
  },
  [SyntaxKinds.ClassAccessorProperty]: function (node: ClassAccessorProperty, visitor: Visitor) {
    visitNode(node.key, visitor);
    visitNode(node.value, visitor);
    visitNodes(node.decorators, visitor);
  },
  [SyntaxKinds.ClassMethodDefinition]: function bindClassMethodDefiniton(
    node: ClassMethodDefinition,
    visitor: Visitor,
  ) {
    visitNode(node.key, visitor);
    visitNode(node.typeParameters, visitor);
    visitNodes(node.params, visitor);
    visitNode(node.returnType, visitor);
    visitNode(node.body, visitor);
    visitNodes(node.decorators, visitor);
  },
  [SyntaxKinds.ClassConstructor]: function bindClassConstructor(node: ClassConstructor, visitor: Visitor) {
    visitNode(node.key, visitor);
    visitNodes(node.params, visitor);
    visitNode(node.returnType, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.ClassAccessor]: function bindClassAccessor(node: ClassAccessor, visitor: Visitor) {
    visitNode(node.key, visitor);
    visitNode(node.typeParameters, visitor);
    visitNodes(node.params, visitor);
    visitNode(node.returnType, visitor);
    visitNode(node.body, visitor);
    visitNodes(node.decorators, visitor);
  },
  [SyntaxKinds.Decorator]: function (node: Decorator, visitor: Visitor) {
    visitNode(node.expression, visitor);
  },
  [SyntaxKinds.ClassDeclaration]: function bindClassDeclaration(node: ClassDeclaration, visitor: Visitor) {
    visitNode(node.id, visitor);
    visitNode(node.superClass, visitor);
    visitNode(node.body, visitor);
    visitNodes(node.decorators, visitor);
  },
  [SyntaxKinds.ImportDeclaration]: function bindImportDeclaration(node: ImportDeclaration, visitor: Visitor) {
    visitNodes(node.specifiers, visitor);
    visitNode(node.source, visitor);
    visitNodes(node.attributes, visitor);
  },
  [SyntaxKinds.ImportDefaultSpecifier]: function bindImportDefaultSpecifier(
    node: ImportDefaultSpecifier,
    visitor: Visitor,
  ) {
    visitNode(node.imported, visitor);
  },
  [SyntaxKinds.ImportSpecifier]: function bindImportSpecifier(node: ImportSpecifier, visitor: Visitor) {
    visitNode(node.imported, visitor);
    visitNode(node.local, visitor);
  },
  [SyntaxKinds.ImportNamespaceSpecifier]: function bindImportNamespaceSpecifier(
    node: ImportNamespaceSpecifier,
    visitor: Visitor,
  ) {
    visitNode(node.imported, visitor);
  },
  [SyntaxKinds.ExportNamedDeclaration]: function bindExportNameDeclaration(
    node: ExportNamedDeclarations,
    visitor: Visitor,
  ) {
    visitNode(node.declaration, visitor);
    visitNodes(node.specifiers, visitor);
    visitNode(node.source, visitor);
  },
  [SyntaxKinds.ExportSpecifier]: function bindExportSpecifier(node: ExportSpecifier, visitor: Visitor) {
    visitNode(node.exported, visitor);
    visitNode(node.local, visitor);
  },
  [SyntaxKinds.ExportDefaultDeclaration]: function bindExportDefaultDeclaration(
    node: ExportDefaultDeclaration,
    visitor: Visitor,
  ) {
    visitNode(node.declaration, visitor);
  },
  [SyntaxKinds.ExportAllDeclaration]: function bindExportAllDeclaration(
    node: ExportAllDeclaration,
    visitor: Visitor,
  ) {
    visitNode(node.exported, visitor);
    visitNode(node.source, visitor);
  },
  [SyntaxKinds.ImportAttribute]: function (node: ImportAttribute, visitor: Visitor) {
    visitNode(node.key, visitor);
    visitNode(node.value, visitor);
  },
  [SyntaxKinds.JSXElement]: function (node: JSXElement, visitor: Visitor) {
    visitNode(node.openingElement, visitor);
    visitNodes(node.children, visitor);
    visitNode(node.closingElement, visitor);
  },
  [SyntaxKinds.JSXIdentifier]: function (_node: JSXIdentifier, _visitor: Visitor) {},
  [SyntaxKinds.JSXMemberExpression]: function (node: JSXMemberExpression, visitor: Visitor) {
    visitNode(node.object, visitor);
    visitNode(node.property, visitor);
  },
  [SyntaxKinds.JSXNamespaceName]: function (node: JSXNamespacedName, visitor: Visitor) {
    visitNode(node.namespace, visitor);
    visitNode(node.name, visitor);
  },
  [SyntaxKinds.JSXAttribute]: function (node: JSXAttribute, visitor: Visitor) {
    visitNode(node.name, visitor);
    visitNode(node.value, visitor);
  },
  [SyntaxKinds.JSXSpreadAttribute]: function (node: JSXSpreadAttribute, visitor: Visitor) {
    visitNode(node.argument, visitor);
  },
  [SyntaxKinds.JSXOpeningElement]: function (node: JSXOpeningElement, visitor: Visitor) {
    visitNode(node.name, visitor);
    visitNodes(node.attributes, visitor);
  },
  [SyntaxKinds.JSXClosingElement]: function (node: JSXClosingElement, visitor: Visitor) {
    visitNode(node.name, visitor);
  },
  [SyntaxKinds.JSXSpreadChild]: function (node: JSXSpreadAttribute, visitor: Visitor) {
    visitNode(node.argument, visitor);
  },
  [SyntaxKinds.JSXText]: function (_node: JSXText, _visitor: Visitor) {},
  [SyntaxKinds.JSXExpressionContainer]: function (node: JSXExpressionContainer, visitor: Visitor) {
    visitNode(node.expression, visitor);
  },
  [SyntaxKinds.JSXFragment]: function (node: JSXFragment, visitor: Visitor) {
    visitNode(node.openingFragment, visitor);
    visitNodes(node.children, visitor);
    visitNode(node.closingFragment, visitor);
  },
  [SyntaxKinds.JSXOpeningFragment]: function (_node: JSXOpeningFragment, _visitor: Visitor) {},
  [SyntaxKinds.JSXClosingFragment]: function (_node: JSXClosingFragment, _visitor: Visitor) {},
  [SyntaxKinds.TSConditionalType]: function (node: TSConditionalType, visitor: Visitor) {
    visitNode(node.checkType, visitor);
    visitNode(node.extendType, visitor);
    visitNode(node.trueType, visitor);
    visitNode(node.falseType, visitor);
  },
  [SyntaxKinds.TSUnionType]: function (node: TSUnionType, visitor: Visitor) {
    visitNodes(node.types, visitor);
  },
  [SyntaxKinds.TSIntersectionType]: function (node: TSIntersectionType, visitor: Visitor) {
    visitNodes(node.types, visitor);
  },
  [SyntaxKinds.TSArrayType]: function (node: TSArrayType, visitor: Visitor) {
    visitNode(node.elementType, visitor);
  },
  [SyntaxKinds.TSTypeOperator]: function (node: TSTypeOperator, visitor: Visitor) {
    visitNode(node.typeAnnotation, visitor);
  },
  [SyntaxKinds.TSIndexedAccessType]: function (node: TSIndexedAccessType, visitor: Visitor) {
    visitNode(node.indexedType, visitor);
    visitNode(node.objectType, visitor);
  },
  [SyntaxKinds.TSFunctionType]: function (node: TSFunctionType, visitor: Visitor) {
    visitNode(node.typeParameters, visitor);
    visitNodes(node.parameters, visitor);
    visitNode(node.returnType, visitor);
  },
  [SyntaxKinds.TSConstructorType]: function (node: TSConstrcutorType, visitor: Visitor) {
    visitNode(node.typeParameters, visitor);
    visitNodes(node.parameters, visitor);
    visitNode(node.returnType, visitor);
  },
  [SyntaxKinds.TSTypeAliasDeclaration]: function (node: TSTypeAliasDeclaration, visitor: Visitor) {
    visitNode(node.typeAnnotation, visitor);
    visitNode(node.typeParameters, visitor);
  },
  [SyntaxKinds.TSInterfaceDeclaration]: function (node: TSInterfaceDeclaration, visitor: Visitor) {
    visitNode(node.body, visitor);
    visitNode(node.typeParameters, visitor);
    visitNodes(node.extends, visitor);
  },
  [SyntaxKinds.TSTypeLiteral]: function (node: TSTypeLiteral, visitor: Visitor) {
    visitNodes(node.members, visitor);
  },
  [SyntaxKinds.TSCallSignatureDeclaration]: function (node: TSCallSignatureDeclaration, visitor: Visitor) {
    visitNodes(node.parameters, visitor);
    visitNode(node.returnType, visitor);
  },
  [SyntaxKinds.TSConstructSignatureDeclaration]: function (
    node: TSConstructSignatureDeclaration,
    visitor: Visitor,
  ) {
    visitNodes(node.parameters, visitor);
    visitNode(node.returnType, visitor);
  },
  [SyntaxKinds.TSPropertySignature]: function (node: TSPropertySignature, visitor: Visitor) {
    visitNode(node.key, visitor);
    visitNode(node.typeAnnotation, visitor);
  },
  [SyntaxKinds.TSMethodSignature]: function (node: TSMethodSignature, visitor: Visitor) {
    visitNode(node.key, visitor);
    visitNode(node.typeParameters, visitor);
    visitNodes(node.parameters, visitor);
    visitNode(node.returnType, visitor);
  },
  [SyntaxKinds.TSQualifiedName]: function (node: TSQualifiedName, visitor: Visitor) {
    visitNode(node.left, visitor);
    visitNode(node.right, visitor);
  },
  [SyntaxKinds.TSTypePredicate]: function (node: TSTypePredicate, visitor: Visitor) {
    visitNode(node.parameterName, visitor);
    visitNode(node.typeAnnotation, visitor);
  },
  [SyntaxKinds.TSTypeAnnotation]: function (node: TSTypeAnnotation, visitor: Visitor) {
    visitNode(node.typeAnnotation, visitor);
  },
  [SyntaxKinds.TSTypeReference]: function (node: TSTypeReference, visitor: Visitor) {
    visitNode(node.typeArguments, visitor);
    visitNode(node.typeName, visitor);
  },
  [SyntaxKinds.TSInstantiationExpression]: function (node: TSInstantiationExpression, visitor: Visitor) {
    visitNode(node.expression, visitor);
    visitNode(node.typeArguments, visitor);
  },
  [SyntaxKinds.TSStringKeyword]: function (_node: TSStringKeyword, _visitor: Visitor) {},
  [SyntaxKinds.TSNumberKeyword]: function (_node: TSNumberKeyword, _visitor: Visitor) {},
  [SyntaxKinds.TSBigIntKeyword]: function (_node: TSBigIntKeyword, _visitor: Visitor) {},
  [SyntaxKinds.TSBooleanKeyword]: function (_node: TSBooleanKeyword, _visitor: Visitor) {},
  [SyntaxKinds.TSNullKeyword]: function (_node: TSNullKeyword, _visitor: Visitor) {},
  [SyntaxKinds.TSUndefinedKeyword]: function (_node: TSUndefinedKeyword, _visitor: Visitor) {},
  [SyntaxKinds.TSSymbolKeyword]: function (_node: TSSymbolKeyword, _visitor: Visitor) {},
  [SyntaxKinds.TSAnyKeyword]: function (_node: TSAnyKeyword, _visitor: Visitor) {},
  [SyntaxKinds.TSNeverKeyword]: function (_node: TSNeverKeyword, _visitor: Visitor) {},
  [SyntaxKinds.TSUnknowKeyword]: function (_node: TSUnknowKeyword, _visitor: Visitor) {},
  [SyntaxKinds.TSVoidKeyword]: function (_node: TSVoidKeyword, _visitor: Visitor) {},
  [SyntaxKinds.TSInterfaceBody]: function (node: TSInterfaceBody, visitor: Visitor) {
    visitNodes(node.body, visitor);
  },
  [SyntaxKinds.TSTypeParameterInstantiation]: function (
    node: TSTypeParameterInstantiation,
    visitor: Visitor,
  ) {
    visitNodes(node.params, visitor);
  },
  [SyntaxKinds.TSTypeParameterDeclaration]: function (node: TSTypeParameterDeclaration, visitor: Visitor) {
    visitNodes(node.params, visitor);
  },
  [SyntaxKinds.TSTypeParameter]: function (node: TSTypeParameter, visitor: Visitor) {
    visitNode(node.name, visitor);
    visitNode(node.constraint, visitor);
    visitNode(node.default, visitor);
  },
  [SyntaxKinds.TSInterfaceHeritage]: function (node: TSInterfaceHeritage, visitor: Visitor) {
    visitNode(node.typeName, visitor);
    visitNode(node.typeArguments, visitor);
  },
  [SyntaxKinds.TSTypeAssertionExpression]: function (node: TSTypeAssertionExpression, visitor: Visitor) {
    visitNode(node.expression, visitor);
    visitNode(node.typeAnnotation, visitor);
  },
  [SyntaxKinds.TSAsExpression]: function (node: TSAsExpression, visitor: Visitor) {
    visitNode(node.expression, visitor);
    visitNode(node.typeAnnotation, visitor);
  },
  [SyntaxKinds.TSSatisfiesExpression]: function (node: TSSatisfiesExpression, visitor: Visitor) {
    visitNode(node.expression, visitor);
    visitNode(node.typeAnnotation, visitor);
  },
  [SyntaxKinds.TSNonNullExpression]: function (node: TSNonNullExpression, visitor: Visitor) {
    visitNode(node.expression, visitor);
  },
  [SyntaxKinds.TSEnumDeclaration]: function (node: TSEnumDeclaration, visitor: Visitor) {
    visitNode(node.id, visitor);
    visitNode(node.body, visitor);
  },
  [SyntaxKinds.TSEnumBody]: function (node: TSEnumBody, visitor: Visitor) {
    visitNodes(node.members, visitor);
  },
  [SyntaxKinds.TSEnumMember]: function (node: TSEnumMember, visitor: Visitor) {
    visitNode(node.init, visitor);
    visitNode(node.id, visitor);
  },
  [SyntaxKinds.TSDeclareFunction]: function (node: TSDeclareFunction, visitor: Visitor) {
    visitNode(node.name, visitor);
    visitNodes(node.params, visitor);
    visitNode(node.typeParameters, visitor);
    visitNode(node.returnType, visitor);
  },
};

export function visitNode<T extends ModuleItem>(node: T | null | undefined, visitor: Visitor) {
  if (!node) return;
  // @ts-expect-error Kind of a AST node must can index a callback in table
  const handler = visitor[node.kind] || PropagationtVisitorTable[node.kind];
  if (handler) {
    handler(node, visitor);
  }
}

export function visitNodes<T extends ModuleItem>(
  nodes: Array<T | null | undefined> | null | undefined,
  visitor: Visitor,
) {
  if (!nodes) return;
  for (const node of nodes) {
    visitNode(node, visitor);
  }
}
