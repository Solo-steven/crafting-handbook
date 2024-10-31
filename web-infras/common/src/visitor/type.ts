import {
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

/**
 * Visitor Type for AST traversal table
 */
export type RequireVisitor = {
  [SyntaxKinds.Program]: (node: Program, visitor: Visitor) => void;
  [SyntaxKinds.RegexLiteral]: (node: RegexLiteral, visitor: Visitor) => void;
  [SyntaxKinds.NullLiteral]: (node: NullLiteral, visitor: Visitor) => void;
  [SyntaxKinds.UndefinedLiteral]: (node: UndefinbedLiteral, visitor: Visitor) => void;
  [SyntaxKinds.BooleanLiteral]: (node: BoolLiteral, visior: Visitor) => void;
  [SyntaxKinds.DecimalLiteral]: (node: DecimalLiteral, visior: Visitor) => void;
  [SyntaxKinds.NonOctalDecimalLiteral]: (node: NonOctalDecimalLiteral, visior: Visitor) => void;
  [SyntaxKinds.BinaryIntegerLiteral]: (node: BinaryIntegerLiteral, visior: Visitor) => void;
  [SyntaxKinds.OctalIntegerLiteral]: (node: OctalIntegerLiteral, visior: Visitor) => void;
  [SyntaxKinds.HexIntegerLiteral]: (node: HexIntegerLiteral, visior: Visitor) => void;
  [SyntaxKinds.LegacyOctalIntegerLiteral]: (node: LegacyOctalIntegerLiteral, visior: Visitor) => void;
  [SyntaxKinds.DecimalBigIntegerLiteral]: (node: DecimalBigIntegerLiteral, visitor: Visitor) => void;
  [SyntaxKinds.BinaryBigIntegerLiteral]: (node: BinaryIntegerLiteral, visitor: Visitor) => void;
  [SyntaxKinds.OctalBigIntegerLiteral]: (node: OctalBigIntegerLiteral, visitor: Visitor) => void;
  [SyntaxKinds.HexBigIntegerLiteral]: (node: HexBigIntegerLiteral, visitor: Visitor) => void;
  [SyntaxKinds.StringLiteral]: (node: StringLiteral, visitor: Visitor) => void;
  [SyntaxKinds.Identifier]: (node: Identifier, visitor: Visitor) => void;
  [SyntaxKinds.Super]: (node: Super, visitor: Visitor) => void;
  [SyntaxKinds.Import]: (node: Import, visitor: Visitor) => void;
  [SyntaxKinds.ThisExpression]: (node: ThisExpression, visitor: Visitor) => void;
  [SyntaxKinds.PrivateName]: (node: PrivateName, visitor: Visitor) => void;
  [SyntaxKinds.TemplateLiteral]: (node: TemplateLiteral, visitor: Visitor) => void;
  [SyntaxKinds.TemplateElement]: (node: TemplateElement, visitor: Visitor) => void;
  [SyntaxKinds.ObjectExpression]: (node: ObjectExpression, visitor: Visitor) => void;
  [SyntaxKinds.ObjectProperty]: (node: ObjectProperty, visitor: Visitor) => void;
  [SyntaxKinds.ObjectMethodDefintion]: (node: ObjectMethodDefinition, visitor: Visitor) => void;
  [SyntaxKinds.ObjectAccessor]: (node: ObjectAccessor, visitor: Visitor) => void;
  [SyntaxKinds.SpreadElement]: (node: SpreadElement, visitor: Visitor) => void;
  [SyntaxKinds.ClassExpression]: (node: ClassExpression, visitor: Visitor) => void;
  [SyntaxKinds.ArrayExpression]: (node: ArrayExpression, visitor: Visitor) => void;
  [SyntaxKinds.FunctionExpression]: (node: FunctionExpression, visitor: Visitor) => void;
  [SyntaxKinds.ArrowFunctionExpression]: (node: ArrorFunctionExpression, visitor: Visitor) => void;
  [SyntaxKinds.MetaProperty]: (node: MetaProperty, visitor: Visitor) => void;
  [SyntaxKinds.AwaitExpression]: (node: AwaitExpression, visitor: Visitor) => void;
  [SyntaxKinds.NewExpression]: (node: NewExpression, visitor: Visitor) => void;
  [SyntaxKinds.MemberExpression]: (node: MemberExpression, visitor: Visitor) => void;
  [SyntaxKinds.CallExpression]: (node: CallExpression, visitor: Visitor) => void;
  [SyntaxKinds.TaggedTemplateExpression]: (node: TaggedTemplateExpression, visitor: Visitor) => void;
  [SyntaxKinds.ChainExpression]: (node: ChainExpression, visitor: Visitor) => void;
  [SyntaxKinds.UpdateExpression]: (node: UpdateExpression, visitor: Visitor) => void;
  [SyntaxKinds.UnaryExpression]: (node: UnaryExpression, visitor: Visitor) => void;
  [SyntaxKinds.BinaryExpression]: (node: BinaryExpression, visitor: Visitor) => void;
  [SyntaxKinds.ConditionalExpression]: (node: ConditionalExpression, visitor: Visitor) => void;
  [SyntaxKinds.YieldExpression]: (node: YieldExpression, visitor: Visitor) => void;
  [SyntaxKinds.AssigmentExpression]: (node: AssigmentExpression, visitor: Visitor) => void;
  [SyntaxKinds.SequenceExpression]: (node: SequenceExpression, visitor: Visitor) => void;
  [SyntaxKinds.ExpressionStatement]: (node: ExpressionStatement, visitor: Visitor) => void;
  [SyntaxKinds.ObjectPattern]: (node: ObjectPattern, visitor: Visitor) => void;
  [SyntaxKinds.ObjectPatternProperty]: (node: ObjectPatternProperty, visitor: Visitor) => void;
  [SyntaxKinds.ArrayPattern]: (node: ArrayPattern, visitor: Visitor) => void;
  [SyntaxKinds.AssignmentPattern]: (node: AssignmentPattern, visitor: Visitor) => void;
  [SyntaxKinds.RestElement]: (node: RestElement, visitor: Visitor) => void;
  [SyntaxKinds.IfStatement]: (node: IfStatement, visitor: Visitor) => void;
  [SyntaxKinds.BlockStatement]: (node: BlockStatement, visitor: Visitor) => void;
  [SyntaxKinds.SwitchStatement]: (node: SwitchStatement, visitor: Visitor) => void;
  [SyntaxKinds.SwitchCase]: (node: SwitchCase, visitor: Visitor) => void;
  [SyntaxKinds.ContinueStatement]: (node: ContinueStatement, visitor: Visitor) => void;
  [SyntaxKinds.BreakStatement]: (node: BreakStatement, visitor: Visitor) => void;
  [SyntaxKinds.ReturnStatement]: (node: ReturnStatement, visitor: Visitor) => void;
  [SyntaxKinds.LabeledStatement]: (node: LabeledStatement, visitor: Visitor) => void;
  [SyntaxKinds.WhileStatement]: (node: WhileStatement, visitor: Visitor) => void;
  [SyntaxKinds.DoWhileStatement]: (node: DoWhileStatement, visitor: Visitor) => void;
  [SyntaxKinds.TryStatement]: (node: TryStatement, visitor: Visitor) => void;
  [SyntaxKinds.CatchClause]: (node: CatchClause, visitor: Visitor) => void;
  [SyntaxKinds.ThrowStatement]?: (node: ThrowStatement, visitor: Visitor) => void;
  [SyntaxKinds.WithStatement]?: (node: WithStatement, visitor: Visitor) => void;
  [SyntaxKinds.DebuggerStatement]?: (node: DebuggerStatement, visitor: Visitor) => void;
  [SyntaxKinds.EmptyStatement]?: (node: EmptyStatement, visitor: Visitor) => void;
  [SyntaxKinds.ForStatement]?: (node: ForStatement, visitor: Visitor) => void;
  [SyntaxKinds.ForInStatement]?: (node: ForInStatement, visitor: Visitor) => void;
  [SyntaxKinds.ForOfStatement]?: (node: ForOfStatement, visitor: Visitor) => void;
  [SyntaxKinds.VariableDeclaration]?: (node: VariableDeclaration, visitor: Visitor) => void;
  [SyntaxKinds.VariableDeclarator]?: (node: VariableDeclarator, visitor: Visitor) => void;
  [SyntaxKinds.FunctionBody]?: (node: FunctionBody, visitor: Visitor) => void;
  [SyntaxKinds.FunctionDeclaration]?: (node: FunctionDeclaration, visitor: Visitor) => void;
  [SyntaxKinds.ClassBody]?: (node: ClassBody, visitor: Visitor) => void;
  [SyntaxKinds.ClassProperty]?: (node: ClassProperty, visitor: Visitor) => void;
  [SyntaxKinds.ClassAccessorProperty]?: (node: ClassAccessorProperty, visitor: Visitor) => void;
  [SyntaxKinds.ClassMethodDefinition]?: (node: ClassMethodDefinition, visitor: Visitor) => void;
  [SyntaxKinds.ClassConstructor]?: (node: ClassConstructor, visitor: Visitor) => void;
  [SyntaxKinds.ClassAccessor]?: (node: ClassAccessor, visitor: Visitor) => void;
  [SyntaxKinds.ClassDeclaration]?: (node: ClassDeclaration, visitor: Visitor) => void;
  [SyntaxKinds.Decorator]?: (node: Decorator, visitor: Visitor) => void;
  [SyntaxKinds.ImportDeclaration]?: (node: ImportDeclaration, visitor: Visitor) => void;
  [SyntaxKinds.ImportDefaultSpecifier]?: (node: ImportDefaultSpecifier, visitor: Visitor) => void;
  [SyntaxKinds.ImportSpecifier]?: (node: ImportSpecifier, visitor: Visitor) => void;
  [SyntaxKinds.ImportNamespaceSpecifier]?: (node: ImportNamespaceSpecifier, visitor: Visitor) => void;
  [SyntaxKinds.ExportNamedDeclaration]?: (node: ExportNamedDeclarations, visitor: Visitor) => void;
  [SyntaxKinds.ExportSpecifier]?: (node: ExportSpecifier, visitor: Visitor) => void;
  [SyntaxKinds.ExportDefaultDeclaration]?: (node: ExportDefaultDeclaration, visitor: Visitor) => void;
  [SyntaxKinds.ExportAllDeclaration]?: (node: ExportAllDeclaration, visitor: Visitor) => void;
  [SyntaxKinds.ImportAttribute]?: (node: ImportAttribute, visior: Visitor) => void;
  [SyntaxKinds.JSXElement]?: (node: JSXElement, visitor: Visitor) => void;
  [SyntaxKinds.JSXIdentifier]?: (node: JSXIdentifier, visitor: Visitor) => void;
  [SyntaxKinds.JSXMemberExpression]?: (node: JSXMemberExpression, visitor: Visitor) => void;
  [SyntaxKinds.JSXNamespaceName]?: (node: JSXNamespacedName, visitor: Visitor) => void;
  [SyntaxKinds.JSXAttribute]?: (node: JSXAttribute, visitor: Visitor) => void;
  [SyntaxKinds.JSXSpreadAttribute]?: (node: JSXSpreadAttribute, visitor: Visitor) => void;
  [SyntaxKinds.JSXOpeningElement]?: (node: JSXOpeningElement, visitor: Visitor) => void;
  [SyntaxKinds.JSXClosingElement]?: (node: JSXClosingElement, visitor: Visitor) => void;
  [SyntaxKinds.JSXSpreadChild]?: (node: JSXSpreadAttribute, visitor: Visitor) => void;
  [SyntaxKinds.JSXText]?: (node: JSXText, visitor: Visitor) => void;
  [SyntaxKinds.JSXExpressionContainer]?: (node: JSXExpressionContainer, visitor: Visitor) => void;
  [SyntaxKinds.JSXFragment]?: (node: JSXFragment, visitor: Visitor) => void;
  [SyntaxKinds.JSXOpeningFragment]?: (node: JSXOpeningFragment, visitor: Visitor) => void;
  [SyntaxKinds.JSXClosingFragment]?: (node: JSXClosingFragment, visitor: Visitor) => void;
  [SyntaxKinds.TSConditionalType]?: (node: TSConditionalType, visitor: Visitor) => void;
  [SyntaxKinds.TSUnionType]?: (node: TSUnionType, visitor: Visitor) => void;
  [SyntaxKinds.TSIntersectionType]?: (node: TSIntersectionType, visitor: Visitor) => void;
  [SyntaxKinds.TSArrayType]?: (node: TSArrayType, visitor: Visitor) => void;
  [SyntaxKinds.TSTypeOperator]?: (node: TSTypeOperator, visitor: Visitor) => void;
  [SyntaxKinds.TSArrayType]?: (node: TSArrayType, visitor: Visitor) => void;
  [SyntaxKinds.TSIndexedAccessType]?: (node: TSIndexedAccessType, visitor: Visitor) => void;
  [SyntaxKinds.TSFunctionType]?: (node: TSFunctionType, visitor: Visitor) => void;
  [SyntaxKinds.TSConstructorType]?: (node: TSConstrcutorType, visitor: Visitor) => void;
  [SyntaxKinds.TSTypeAliasDeclaration]?: (node: TSTypeAliasDeclaration, visitor: Visitor) => void;
  [SyntaxKinds.TSInterfaceDeclaration]?: (node: TSInterfaceDeclaration, visitor: Visitor) => void;
  [SyntaxKinds.TSInterfaceBody]?: (node: TSInterfaceBody, visitor: Visitor) => void;
  [SyntaxKinds.TSTypeLiteral]?: (node: TSTypeLiteral, visitor: Visitor) => void;
  [SyntaxKinds.TSCallSignatureDeclaration]?: (node: TSCallSignatureDeclaration, visitor: Visitor) => void;
  [SyntaxKinds.TSConstructSignatureDeclaration]?: (
    node: TSConstructSignatureDeclaration,
    visitor: Visitor,
  ) => void;
  [SyntaxKinds.TSTypeParameterInstantiation]?: (node: TSTypeParameterInstantiation, visitor: Visitor) => void;
  [SyntaxKinds.TSTypeParameterDeclaration]?: (node: TSTypeParameterDeclaration, visitor: Visitor) => void;
  [SyntaxKinds.TSTypeParameter]?: (node: TSTypeParameter, visitor: Visitor) => void;
  [SyntaxKinds.TSPropertySignature]?: (node: TSPropertySignature, visitor: Visitor) => void;
  [SyntaxKinds.TSMethodSignature]?: (node: TSMethodSignature, visitor: Visitor) => void;
  [SyntaxKinds.TSQualifiedName]?: (node: TSQualifiedName, visitor: Visitor) => void;
  [SyntaxKinds.TSTypePredicate]?: (node: TSTypePredicate, visitor: Visitor) => void;
  [SyntaxKinds.TSTypeAnnotation]?: (node: TSTypeAnnotation, visitor: Visitor) => void;
  [SyntaxKinds.TSTypeReference]?: (node: TSTypeReference, visitor: Visitor) => void;
  [SyntaxKinds.TSStringKeyword]?: (node: TSStringKeyword, visitor: Visitor) => void;
  [SyntaxKinds.TSNumberKeyword]?: (node: TSNumberKeyword, visitor: Visitor) => void;
  [SyntaxKinds.TSBigIntKeyword]?: (node: TSBigIntKeyword, visitor: Visitor) => void;
  [SyntaxKinds.TSBooleanKeyword]?: (node: TSBooleanKeyword, visitor: Visitor) => void;
  [SyntaxKinds.TSNullKeyword]?: (node: TSNullKeyword, visitor: Visitor) => void;
  [SyntaxKinds.TSUndefinedKeyword]?: (node: TSUndefinedKeyword, visitor: Visitor) => void;
  [SyntaxKinds.TSSymbolKeyword]?: (node: TSSymbolKeyword, visitor: Visitor) => void;
  [SyntaxKinds.TSAnyKeyword]?: (node: TSAnyKeyword, visitor: Visitor) => void;
  [SyntaxKinds.TSNeverKeyword]?: (node: TSNeverKeyword, visitor: Visitor) => void;
  [SyntaxKinds.TSUnknowKeyword]?: (node: TSUnknowKeyword, visitor: Visitor) => void;
  [SyntaxKinds.TSVoidKeyword]?: (node: TSVoidKeyword, visitor: Visitor) => void;
  [SyntaxKinds.TSInstantiationExpression]?: (node: TSInstantiationExpression, visitor: Visitor) => void;
  [SyntaxKinds.TSInterfaceHeritage]?: (node: TSInterfaceHeritage, visitor: Visitor) => void;
  [SyntaxKinds.TSTypeAssertionExpression]?: (node: TSTypeAssertionExpression, visitor: Visitor) => void;
  [SyntaxKinds.TSAsExpression]?: (node: TSAsExpression, visitor: Visitor) => void;
  [SyntaxKinds.TSSatisfiesExpression]?: (node: TSSatisfiesExpression, visitor: Visitor) => void;
  [SyntaxKinds.TSNonNullExpression]?: (node: TSNonNullExpression, visitor: Visitor) => void;
  [SyntaxKinds.TSEnumDeclaration]?: (node: TSEnumDeclaration, visitor: Visitor) => void;
  [SyntaxKinds.TSEnumBody]?: (node: TSEnumBody, visitor: Visitor) => void;
  [SyntaxKinds.TSEnumMember]?: (node: TSEnumMember, visitor: Visitor) => void;
  [SyntaxKinds.TSDeclareFunction]?: (node: TSDeclareFunction, visitor: Visitor) => void;
};

export type Visitor = Partial<RequireVisitor>;
