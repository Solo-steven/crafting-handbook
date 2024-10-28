import { SourcePosition } from "@/src/position";
import {
  SyntaxKinds,
  UpdateOperatorKinds,
  UnaryOperatorKinds,
  BinaryOperatorKinds,
  AssigmentOperatorKinds,
} from "./kind";
/** ======================================
 *    Shared, Basic, Top Level AST Node
 * ======================================
 */
export interface ModuleItem {
  kind: SyntaxKinds;
  start: SourcePosition;
  end: SourcePosition;
  parent?: ModuleItem;
}
export type StatementListItem = Statement | Declaration;
export interface Program extends ModuleItem {
  kind: SyntaxKinds.Program;
  body: Array<ModuleItem>; //TODO: using StatementListItem
}
export type PropertyName = Identifier | StringLiteral | NumberLiteral | Expression;
export interface Property extends ModuleItem {
  kind: SyntaxKinds;
  key: PropertyName | PrivateName;
  value: Expression | undefined; // actually is assignment expression,
  computed: boolean;
  shorted: boolean;
  static: boolean;
}
export interface MethodDefinition extends ModuleItem {
  kind: SyntaxKinds;
  key: PropertyName | PrivateName;
  body: FunctionBody;
  params: Array<Pattern>;
  typeParameters: TSTypeParameterDeclaration | undefined;
  returnType: TSTypeAnnotation | undefined;
  type: "constructor" | "method" | "get" | "set";
  computed: boolean;
  generator: boolean;
  async: boolean;
  static: boolean;
}
/** ====================================
 *  JSX Element or JSX fragment
 * =====================================
 */
export interface JSXElement extends ExpressionModuleItem {
  kind: SyntaxKinds.JSXElement;
  openingElement: JSXOpeningElement;
  children: Array<JSXText | JSXExpressionContainer | JSXSpreadChild | JSXElement | JSXFragment>;
  closingElement: JSXClosingElement | null;
}
export interface JSXIdentifier extends ModuleItem {
  kind: SyntaxKinds.JSXIdentifier;
  name: string;
}
export interface JSXMemberExpression extends ModuleItem {
  kind: SyntaxKinds.JSXMemberExpression;
  object: JSXMemberExpression | JSXIdentifier;
  property: JSXIdentifier;
}
export interface JSXNamespacedName extends ModuleItem {
  kind: SyntaxKinds.JSXNamespaceName;
  namespace: JSXIdentifier;
  name: JSXIdentifier;
}
export interface JSXAttribute extends ModuleItem {
  kind: SyntaxKinds.JSXAttribute;
  name: JSXIdentifier | JSXNamespacedName;
  value:
    | NumberLiteral
    | StringLiteral
    | BoolLiteral
    | TemplateLiteral
    | UndefinbedLiteral
    | NullLiteral
    | RegexLiteral
    | JSXExpressionContainer
    | JSXElement
    | JSXFragment
    | null;
}
export interface JSXSpreadAttribute extends ModuleItem {
  kind: SyntaxKinds.JSXSpreadAttribute;
  argument: Expression;
}
export interface JSXOpeningElement extends ModuleItem {
  kind: SyntaxKinds.JSXOpeningElement;
  name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName;
  attributes: Array<JSXAttribute | JSXSpreadAttribute>;
  selfClosing: boolean;
}
export interface JSXClosingElement extends ModuleItem {
  kind: SyntaxKinds.JSXClosingElement;
  name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName;
}
export interface JSXSpreadChild extends ModuleItem {
  kind: SyntaxKinds.JSXSpreadChild;
  argument: Expression;
}
export interface JSXText extends ModuleItem {
  kind: SyntaxKinds.JSXText;
  value: string;
}
export interface JSXExpressionContainer extends ModuleItem {
  kind: SyntaxKinds.JSXExpressionContainer;
  expression: Expression | null;
}
export interface JSXFragment extends ExpressionModuleItem {
  kind: SyntaxKinds.JSXFragment;
  openingFragment: JSXOpeningFragment;
  children: Array<JSXText | JSXExpressionContainer | JSXSpreadChild | JSXElement | JSXFragment>;
  closingFragment: JSXClosingFragment;
}
export interface JSXOpeningFragment extends ModuleItem {
  kind: SyntaxKinds.JSXOpeningFragment;
}
export interface JSXClosingFragment extends ModuleItem {
  kind: SyntaxKinds.JSXClosingFragment;
}
/** =====================================
 *      Expression
 * ======================================
 */
export interface ExpressionModuleItem extends ModuleItem {
  parentheses?: boolean;
}
export interface Super extends ExpressionModuleItem {
  kind: SyntaxKinds.Super;
  name: "super";
}
export interface Import extends ExpressionModuleItem {
  kind: SyntaxKinds.Import;
  name: "import";
}
export interface ThisExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.ThisExpression;
  name: "this";
}
export interface Identifier extends ExpressionModuleItem {
  kind: SyntaxKinds.Identifier;
  name: string;
  typeAnnotation: TSTypeAnnotation | undefined;
  optional: boolean | undefined;
}
export interface PrivateName extends ExpressionModuleItem {
  kind: SyntaxKinds.PrivateName;
  name: string;
}
export interface DecimalLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.DecimalLiteral;
  rawValue: string;
}
export interface DecimalBigIntegerLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.DecimalBigIntegerLiteral;
  rawValue: string;
}
export interface NonOctalDecimalLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.NonOctalDecimalLiteral;
  rawValue: string;
}
export interface BinaryIntegerLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.BinaryIntegerLiteral;
  rawValue: string;
}
export interface OctalIntegerLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.OctalIntegerLiteral;
  rawValue: string;
}
export interface HexIntegerLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.HexIntegerLiteral;
  rawValue: string;
}
export interface BinaryBigIntegerLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.BinaryBigIntegerLiteral;
  rawValue: string;
}
export interface OctalBigIntegerLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.OctalBigIntegerLiteral;
  rawValue: string;
}
export interface HexBigIntegerLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.HexBigIntegerLiteral;
  rawValue: string;
}
export interface LegacyOctalIntegerLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.LegacyOctalIntegerLiteral;
  rawValue: string;
}
export type NumberLiteral =
  | DecimalLiteral
  | NonOctalDecimalLiteral
  | BinaryIntegerLiteral
  | OctalIntegerLiteral
  | HexIntegerLiteral
  | LegacyOctalIntegerLiteral
  | BinaryBigIntegerLiteral
  | HexBigIntegerLiteral
  | OctalBigIntegerLiteral
  | DecimalBigIntegerLiteral;
export interface StringLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.StringLiteral;
  value: string;
}
export interface BoolLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.BooleanLiteral;
  value: boolean;
}
export interface NullLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.NullLiteral;
}
export interface UndefinbedLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.UndefinedLiteral;
}
export interface RegexLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.RegexLiteral;
  pattern: string;
  flag: string;
}
export interface TemplateLiteral extends ExpressionModuleItem {
  kind: SyntaxKinds.TemplateLiteral;
  quasis: Array<TemplateElement>;
  expressions: Array<Expression>;
}
export interface TemplateElement extends ExpressionModuleItem {
  kind: SyntaxKinds.TemplateElement;
  value: string;
  tail: boolean;
}
export interface ObjectExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.ObjectExpression;
  properties: Array<PropertyDefinition>;
  trailingComma: boolean;
}
export type PropertyDefinition = ObjectProperty | ObjectMethodDefinition | SpreadElement | ObjectAccessor;
export interface ObjectProperty extends Omit<Property, "static"> {
  kind: SyntaxKinds.ObjectProperty;
  key: PropertyName;
}
export interface ObjectMethodDefinition extends Omit<MethodDefinition, "static" | "type"> {
  kind: SyntaxKinds.ObjectMethodDefintion;
  key: PropertyName;
}
export interface ObjectAccessor extends Omit<MethodDefinition, "static" | "generator" | "async"> {
  kind: SyntaxKinds.ObjectAccessor;
  type: "get" | "set";
}
export interface SpreadElement extends ExpressionModuleItem {
  kind: SyntaxKinds.SpreadElement;
  argument: Expression;
}
export interface ClassExpression extends Class, ExpressionModuleItem {
  kind: SyntaxKinds.ClassExpression;
}
export interface ArrayExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.ArrayExpression;
  elements: Array<Expression | null>; // actually need to be assigment expression;
  trailingComma: boolean;
}
export interface FunctionExpression extends ExpressionModuleItem, Function {
  kind: SyntaxKinds.FunctionExpression;
}
// TODO: make arrowfunctionExpression extends form function
export interface ArrorFunctionExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.ArrowFunctionExpression;
  expressionBody: boolean;
  async: boolean;
  arguments: Array<Pattern>;
  typeParameters: TSTypeParameterDeclaration | undefined;
  returnType: TSTypeAnnotation | undefined;
  body: Expression | FunctionBody;
}
export interface MetaProperty extends ExpressionModuleItem {
  kind: SyntaxKinds.MetaProperty;
  meta: Identifier | Import;
  property: Identifier;
}
export interface AwaitExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.AwaitExpression;
  argument: Expression; // actually is unary expression
}
export interface NewExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.NewExpression;
  callee: Expression;
  arguments: Array<Expression>;
  typeArguments: TSTypeParameterInstantiation | undefined;
}
export interface MemberExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.MemberExpression;
  object: Expression;
  property: Expression | PrivateName;
  computed: boolean;
  optional: boolean;
}
export interface CallExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.CallExpression;
  callee: Expression;
  arguments: Array<Expression>;
  typeArguments: TSTypeParameterInstantiation | undefined;
  optional: boolean;
}
export interface TaggedTemplateExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.TaggedTemplateExpression;
  quasi: TemplateLiteral;
  tag: Expression;
}
export interface ChainExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.ChainExpression;
  expression: Expression;
}
export interface UpdateExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.UpdateExpression;
  argument: Expression;
  prefix: boolean;
  operator: UpdateOperatorKinds;
}
export interface UnaryExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.UnaryExpression;
  argument: Expression;
  operator: UnaryOperatorKinds;
}
export interface BinaryExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.BinaryExpression;
  left: Expression;
  right: Expression;
  operator: BinaryOperatorKinds;
}
export interface ConditionalExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.ConditionalExpression;
  test: Expression;
  consequnce: Expression;
  alter: Expression;
}
export interface YieldExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.YieldExpression;
  argument: Expression | null;
  delegate: boolean;
}
export interface AssigmentExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.AssigmentExpression;
  left: Pattern;
  right: Expression;
  operator: AssigmentOperatorKinds;
}
export interface SequenceExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.SequenceExpression;
  exprs: Array<Expression>;
}

export interface TSInstantiationExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.TSInstantiationExpression;
  typeArguments: TSTypeParameterInstantiation;
  expression: Expression;
}

export interface TSTypeAssertionExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.TSTypeAssertionExpression;
  expression: Expression;
  typeAnnotation: TSTypeNode;
}

export interface TSAsExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.TSAsExpression;
  expression: Expression;
  typeAnnotation: TSTypeNode;
}

export interface TSSatisfiesExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.TSSatisfiesExpression;
  expression: Expression;
  typeAnnotation: TSTypeNode;
}

export interface TSNonNullExpression extends ExpressionModuleItem {
  kind: SyntaxKinds.TSNonNullExpression;
  expression: Expression;
}

export type Expression =
  // jsx element
  | JSXElement
  | JSXFragment
  // identifer and super and ThisExpression
  | Identifier
  | PrivateName
  | Super
  | ThisExpression
  | Import
  // literals
  | NumberLiteral
  | StringLiteral
  | BoolLiteral
  | TemplateLiteral
  | UndefinbedLiteral
  | NullLiteral
  | RegexLiteral
  // structal literal
  | ObjectExpression
  | ArrayExpression
  | ArrorFunctionExpression
  | FunctionExpression
  | ClassExpression
  // meta property and spread element
  | SpreadElement
  | MetaProperty
  // other expression
  | CallExpression
  | MemberExpression
  | TaggedTemplateExpression
  | NewExpression
  | ChainExpression
  | UpdateExpression
  | UnaryExpression
  | AwaitExpression
  | BinaryExpression
  | ConditionalExpression
  | YieldExpression
  | AssigmentExpression
  | SequenceExpression
  // TS expression
  | TSInstantiationExpression
  | TSTypeAssertionExpression
  | TSAsExpression
  | TSSatisfiesExpression
  | TSNonNullExpression;
export interface ExpressionStatement extends ModuleItem {
  kind: SyntaxKinds.ExpressionStatement;
  expr: Expression;
}

/** =================================
 *   Pattern
 * ==================================
 */
export interface ObjectPattern extends ModuleItem {
  kind: SyntaxKinds.ObjectPattern;
  properties: Array<ObjectPatternProperty | RestElement | AssignmentPattern>;
  typeAnnotation: TSTypeAnnotation | undefined;
  optional: boolean | undefined;
}
export interface ObjectPatternProperty extends ModuleItem {
  kind: SyntaxKinds.ObjectPatternProperty;
  key: PropertyName;
  value: Pattern | Expression | undefined;
  computed: boolean;
  shorted: boolean;
}
export interface ArrayPattern extends ModuleItem {
  kind: SyntaxKinds.ArrayPattern;
  elements: Array<null | Pattern>;
  typeAnnotation: TSTypeAnnotation | undefined;
  optional: boolean | undefined;
}
export interface AssignmentPattern extends ModuleItem {
  kind: SyntaxKinds.AssignmentPattern;
  left: Pattern;
  right: Expression;
  typeAnnotation: TSTypeAnnotation | undefined;
  optional: boolean | undefined;
}
export interface RestElement extends ModuleItem {
  kind: SyntaxKinds.RestElement;
  argument: Pattern;
  typeAnnotation: TSTypeAnnotation | undefined;
  optional: boolean | undefined;
}

export type Pattern =
  | RestElement
  | AssignmentPattern
  | ObjectPattern
  | ArrayPattern
  | Identifier
  | MemberExpression
  | TSAsExpression
  | TSTypeAssertionExpression
  | TSSatisfiesExpression
  | TSNonNullExpression;

/** ==========================
 * Statement
 * ===========================
 */
export interface IfStatement extends ModuleItem {
  kind: SyntaxKinds.IfStatement;
  test: Expression;
  conseqence: Statement;
  alternative: Statement | null;
}
export interface BlockStatement extends ModuleItem {
  kind: SyntaxKinds.BlockStatement;
  body: Array<StatementListItem>;
}
export interface SwitchStatement extends ModuleItem {
  kind: SyntaxKinds.SwitchStatement;
  discriminant: Expression;
  cases: Array<SwitchCase>;
}
export interface SwitchCase extends ModuleItem {
  kind: SyntaxKinds.SwitchCase;
  test: Expression | null;
  consequence: Array<StatementListItem>;
}
export interface ContinueStatement extends ModuleItem {
  kind: SyntaxKinds.ContinueStatement;
  label: Identifier | null;
}
export interface BreakStatement extends ModuleItem {
  kind: SyntaxKinds.BreakStatement;
  label: Identifier | null;
}
export interface ReturnStatement extends ModuleItem {
  kind: SyntaxKinds.ReturnStatement;
  argu: Expression | null;
}
export interface LabeledStatement extends ModuleItem {
  kind: SyntaxKinds.LabeledStatement;
  label: Identifier;
  body: Statement | FunctionDeclaration;
}
export interface WhileStatement extends ModuleItem {
  kind: SyntaxKinds.WhileStatement;
  test: Expression;
  body: Statement;
}
export interface DoWhileStatement extends ModuleItem {
  kind: SyntaxKinds.DoWhileStatement;
  test: Expression;
  body: Statement;
}
export interface TryStatement extends ModuleItem {
  kind: SyntaxKinds.TryStatement;
  block: BlockStatement;
  handler: CatchClause | null;
  finalizer: BlockStatement | null;
}
export interface CatchClause extends ModuleItem {
  kind: SyntaxKinds.CatchClause;
  param: Pattern | null;
  body: BlockStatement;
}
export interface ThrowStatement extends ModuleItem {
  kind: SyntaxKinds.ThrowStatement;
  argu: Expression;
}
export interface WithStatement extends ModuleItem {
  kind: SyntaxKinds.WithStatement;
  object: Expression;
  body: Statement;
}
export interface DebuggerStatement extends ModuleItem {
  kind: SyntaxKinds.DebuggerStatement;
}
export interface EmptyStatement extends ModuleItem {
  kind: SyntaxKinds.EmptyStatement;
}
export interface ForStatement extends ModuleItem {
  kind: SyntaxKinds.ForStatement;
  init: Expression | VariableDeclaration | null;
  test: Expression | null;
  update: Expression | null;
  body: Statement;
}
export interface ForOfStatement extends ModuleItem {
  kind: SyntaxKinds.ForOfStatement;
  left: Expression | VariableDeclaration;
  right: Expression;
  await: boolean;
  body: Statement;
}
// TODO. better Type
// type ForOfInStatementLeft = VariableDeclaration | Pattern | TSAsExpression | TSTypeAssertionExpression;
export interface ForInStatement extends ModuleItem {
  kind: SyntaxKinds.ForInStatement;
  left: Expression | VariableDeclaration;
  right: Expression;
  body: Statement;
}
export type Statement =
  | IfStatement
  | BlockStatement
  | SwitchStatement
  | ForInStatement
  | ForOfStatement
  | ForStatement
  | BreakStatement
  | ContinueStatement
  | ReturnStatement
  | LabeledStatement
  | WhileStatement
  | DoWhileStatement
  | TryStatement
  | ThrowStatement
  | WithStatement
  | DebuggerStatement
  | EmptyStatement
  | ExpressionStatement
  | VariableDeclaration /** when is `var` */;

/** ================================
 *  Declaration
 * =================================
 */
export interface VariableDeclaration extends ModuleItem {
  kind: SyntaxKinds.VariableDeclaration;
  declarations: Array<VariableDeclarator>;
  variant: "let" | "const" | "var";
}
export interface VariableDeclarator extends ModuleItem {
  kind: SyntaxKinds.VariableDeclarator;
  id: Pattern;
  init: Expression | null;
}
export interface Function extends Omit<ModuleItem, "kind"> {
  name: Identifier | null;
  params: Array<Pattern>;
  typeParameters: TSTypeParameterDeclaration | undefined;
  returnType: TSTypeAnnotation | undefined;
  body: FunctionBody;
  generator: boolean;
  async: boolean;
}
export interface FunctionBody extends ModuleItem {
  kind: SyntaxKinds.FunctionBody;
  body: Array<StatementListItem>; //TODO: using StatementListItem
}
export interface FunctionDeclaration extends ModuleItem, Function {
  kind: SyntaxKinds.FunctionDeclaration;
  name: Identifier;
}
export interface Class extends Omit<ModuleItem, "kind"> {
  id: Identifier | null;
  superClass: Expression | null;
  body: ClassBody;
  decorators: Decorator[] | null;
}
export interface ClassBody extends ModuleItem {
  kind: SyntaxKinds.ClassBody;
  body: Array<ClassElement>;
}
export type ClassElementName = PropertyName | PrivateName;
export interface ClassProperty extends ModuleItem {
  kind: SyntaxKinds.ClassProperty;
  decorators: Decorator[] | null;
  // JS modifier
  static: boolean;
  // ClassElementName
  key: ClassElementName;
  computed: boolean;
  // TS Modifier
  accessibility: "private" | "public" | "protected" | null;
  abstract: boolean;
  // TS type
  optional: boolean;
  typeAnnotation: TSTypeAnnotation | undefined;
  // Default value
  value: Expression | undefined; // actually is assignment expression,
}
export interface ClassAccessorProperty extends ModuleItem {
  kind: SyntaxKinds.ClassAccessorProperty;
  decorators: Decorator[] | null;
  // JS modifier
  static: boolean;
  // ClassElementName
  key: ClassElementName;
  computed: boolean;
  // TS Modifier
  accessibility: "private" | "public" | "protected" | null;
  abstract: boolean;
  // TS type
  typeAnnotation: TSTypeAnnotation | undefined;
  // Default value
  value: Expression | undefined; // actually is assignment expression,
}

export interface ClassConstructor extends ModuleItem {
  kind: SyntaxKinds.ClassConstructor;
  // ClassElementName
  key: Identifier;
  // function
  params: Array<Pattern>;
  body: FunctionBody;
  // TS type
  returnType: TSTypeAnnotation | undefined;
  // TS modifier
  accessibility: "private" | "public" | "protected" | null;
}
export interface ClassMethodDefinition extends ModuleItem {
  kind: SyntaxKinds.ClassMethodDefinition;
  decorators: Decorator[] | null;
  // JS modifier
  generator: boolean;
  async: boolean;
  static: boolean;
  // ClassElementName
  key: ClassElementName;
  computed: boolean;
  // function
  params: Array<Pattern>;
  body: FunctionBody;
  // TS type
  typeParameters: TSTypeParameterDeclaration | undefined;
  returnType: TSTypeAnnotation | undefined;
  // TS modifier
  optional: boolean;
  accessibility: "private" | "public" | "protected" | null;
}
export interface ClassMethodDeclaration extends ModuleItem {
  kind: SyntaxKinds.ClassMethodDeclaration;
  decorators: Decorator[] | null;
  // JS modifier
  generator: boolean;
  async: boolean;
  static: boolean;
  // ClassElementName
  key: ClassElementName;
  computed: boolean;
  // function
  params: Array<Pattern>;
  // TS type
  typeParameters: TSTypeParameterDeclaration | undefined;
  returnType: TSTypeAnnotation | undefined;
  // TS modifier
  optional: boolean;
  accessibility: "private" | "public" | "protected" | null;
  abstract: boolean;
}
export interface ClassAccessor extends ModuleItem {
  kind: SyntaxKinds.ClassAccessor;
  decorators: Decorator[] | null;
  // JS modifier
  type: "get" | "set";
  static: boolean;
  // ClassElementName
  key: ClassElementName;
  computed: boolean;
  // function
  params: Array<Pattern>;
  body: FunctionBody;
  // TS type
  typeParameters: TSTypeParameterDeclaration | undefined;
  returnType: TSTypeAnnotation | undefined;
  // TS modifier
  accessibility: "private" | "public" | "protected" | null;
}
// NOTE: accessor must be abstract to be declaration.
export interface TSAbstractClassAccessorDeclaration extends ModuleItem {
  kind: SyntaxKinds.TSAbstractClassAccessorDeclaration;
  decorators: Decorator[] | null;
  // JS modifier
  type: "get" | "set";
  static: boolean;
  // ClassElementName
  key: ClassElementName;
  computed: boolean;
  // function
  params: Array<Pattern>;
  // TS type
  typeParameters: TSTypeParameterDeclaration | undefined;
  returnType: TSTypeAnnotation | undefined;
  // TS modifier
  accessibility: "private" | "public" | "protected" | null;
}
export interface ClassStaticBlock extends ModuleItem {
  kind: SyntaxKinds.ClassStaticBlock;
  body: Array<StatementListItem>;
}
export type ClassElement =
  | ClassProperty
  | ClassAccessorProperty
  | ClassMethodDefinition
  | ClassMethodDeclaration
  | ClassAccessor
  | TSAbstractClassAccessorDeclaration
  | ClassConstructor
  | ClassStaticBlock;
export interface ClassDeclaration extends ModuleItem, Class {
  kind: SyntaxKinds.ClassDeclaration;
}
export interface Decorator extends ModuleItem {
  kind: SyntaxKinds.Decorator;
  expression: Expression;
}
export type Declaration = FunctionDeclaration | VariableDeclaration | ClassDeclaration | TSDeclaration;

type TSDeclaration = TSTypeAliasDeclaration | TSInterfaceDeclaration | TSEnumDeclaration | TSDeclareFunction;

/** ==========================================
 * Import Declaration
 * ===========================================
 */
export interface ImportDeclaration extends ModuleItem {
  kind: SyntaxKinds.ImportDeclaration;
  specifiers: Array<ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier>;
  source: StringLiteral;
  attributes: ImportAttribute[] | undefined;
}
export interface ImportDefaultSpecifier extends ModuleItem {
  kind: SyntaxKinds.ImportDefaultSpecifier;
  imported: Identifier;
}
export interface ImportSpecifier extends ModuleItem {
  kind: SyntaxKinds.ImportSpecifier;
  imported: Identifier | StringLiteral;
  local: Identifier | null;
}
export interface ImportNamespaceSpecifier extends ModuleItem {
  kind: SyntaxKinds.ImportNamespaceSpecifier;
  imported: Identifier;
}
/** ==========================================
 * export Declaration
 * ===========================================
 */

export interface ExportNamedDeclarations extends ModuleItem {
  kind: SyntaxKinds.ExportNamedDeclaration;
  specifiers: Array<ExportSpecifier>;
  declaration: Declaration | null;
  source: StringLiteral | null;
}
export interface ExportSpecifier extends ModuleItem {
  kind: SyntaxKinds.ExportSpecifier;
  exported: Identifier | StringLiteral;
  local: Identifier | StringLiteral | null;
}
export interface ExportDefaultDeclaration extends ModuleItem {
  kind: SyntaxKinds.ExportDefaultDeclaration;
  declaration:
    | FunctionDeclaration
    | FunctionExpression
    | ClassDeclaration
    | ClassExpression
    | Expression
    | TSDeclaration;
}
export interface ExportAllDeclaration extends ModuleItem {
  kind: SyntaxKinds.ExportAllDeclaration;
  exported: Identifier | StringLiteral | null;
  source: StringLiteral;
}
export type ExportDeclaration = ExportNamedDeclarations | ExportDefaultDeclaration | ExportAllDeclaration;

/** ==========================================
 * Module Aserttion and Attribute
 * ===========================================
 */
export interface ImportAttribute extends ModuleItem {
  kind: SyntaxKinds.ImportAttribute;
  key: Identifier | StringLiteral;
  value: StringLiteral;
}

/** ========================================
 *   TypeScript AST
 * reference from typescript-eslint AST spec
 * to create estree based AST for TypeScript.
 * =========================================
 */
export type TSTypeNode =
  | TSConditionalType
  | TSUnionType
  | TSIntersectionType
  | TSTypeOperator
  | TSArrayType
  | TSIndexedAccessType
  | TSTypeQuery
  | TSLiteralType
  | TSConstrcutorType
  | TSInterfaceDeclaration
  | TSTypeAliasDeclaration
  | TSFunctionType
  | TSTypeLiteral
  | TSTupleType
  | TSTypePredicate
  | TSTypeReference
  | TSStringKeyword
  | TSNumberKeyword
  | TSBigIntKeyword
  | TSBooleanKeyword
  | TSNullKeyword
  | TSUndefinedKeyword
  | TSSymbolKeyword
  | TSAnyKeyword
  | TSNeverKeyword
  | TSUnknowKeyword
  | TSVoidKeyword;

// ======== TS Comnputed Type
export interface TSConditionalType extends ModuleItem {
  kind: SyntaxKinds.TSConditionalType;
  checkType: TSTypeNode;
  extendType: TSTypeNode;
  trueType: TSTypeNode;
  falseType: TSTypeNode;
}
export interface TSUnionType extends ModuleItem {
  kind: SyntaxKinds.TSUnionType;
  types: Array<TSTypeNode>;
}
export interface TSIntersectionType extends ModuleItem {
  kind: SyntaxKinds.TSIntersectionType;
  types: Array<TSTypeNode>;
}
export interface TSTypeOperator extends ModuleItem {
  kind: SyntaxKinds.TSTypeOperator;
  operator: "keyof" | "unique" | "readonly";
  typeAnnotation: TSTypeNode;
}
export interface TSArrayType extends ModuleItem {
  kind: SyntaxKinds.TSArrayType;
  elementType: TSTypeNode;
}
export interface TSIndexedAccessType extends ModuleItem {
  kind: SyntaxKinds.TSIndexedAccessType;
  indexedType: TSTypeNode;
  objectType: TSTypeNode;
}
// ======= TS High Level Basic Type

// ======= TS Type-Param
export interface TSTypeParameterDeclaration extends ModuleItem {
  kind: SyntaxKinds.TSTypeParameterDeclaration;
  params: Array<TSTypeParameter>;
}

export interface TSTypeParameter extends ModuleItem {
  kind: SyntaxKinds.TSTypeParameter;
  constraint: TSTypeNode | undefined;
  default: TSTypeNode | undefined;
  name: Identifier;
}

export interface TSTypeParameterInstantiation extends ModuleItem {
  kind: SyntaxKinds.TSTypeParameterInstantiation;
  params: Array<TSTypeNode>;
}
// ===== TS Basic Type
export interface TSFunctionType extends TSFunctionSignatureBase {
  kind: SyntaxKinds.TSFunctionType;
}
export interface TSDeclareFunction extends Omit<Function, "body">, ModuleItem {
  kind: SyntaxKinds.TSDeclareFunction;
}
export interface TSConstrcutorType extends TSFunctionSignatureBase {
  kind: SyntaxKinds.TSConstructorType;
}
export interface TSEnumDeclaration extends ModuleItem {
  id: Identifier;
  kind: SyntaxKinds.TSEnumDeclaration;
  body: TSEnumBody;
}

export interface TSEnumBody extends ModuleItem {
  kind: SyntaxKinds.TSEnumBody;
  members: Array<TSEnumMember>;
}
export interface TSEnumMember extends ModuleItem {
  kind: SyntaxKinds.TSEnumMember;
  computed: boolean;
  id: Identifier;
  init: Expression | undefined;
}

export interface TSTypeAliasDeclaration extends ModuleItem {
  kind: SyntaxKinds.TSTypeAliasDeclaration;
  name: Identifier;
  typeAnnotation: TSTypeNode;
  typeParameters: TSTypeParameterDeclaration | undefined;
}
export interface TSInterfaceDeclaration extends ModuleItem {
  kind: SyntaxKinds.TSInterfaceDeclaration;
  name: Identifier;
  body: TSInterfaceBody;
  typeParameters: TSTypeParameterDeclaration | undefined;
  extends: Array<TSInterfaceHeritage>;
}
export interface TSInterfaceHeritage extends ModuleItem {
  typeName: TSEntityName;
  typeArguments: TSTypeParameterInstantiation | undefined;
}
export interface TSInterfaceBody extends ModuleItem {
  kind: SyntaxKinds.TSInterfaceBody;
  body: TSTypeElement[];
}
export type TSParameter = Identifier | ObjectPattern | AssignmentPattern | ArrayPattern | RestElement;
export interface TSTypeAnnotation extends ModuleItem {
  kind: SyntaxKinds.TSTypeAnnotation;
  typeAnnotation: TSTypeNode;
}
export interface TSTypePredicate extends ModuleItem {
  kind: SyntaxKinds.TSTypePredicate;
  parameterName: Identifier;
  asserts: boolean;
  typeAnnotation: TSTypeAnnotation | undefined;
}
export interface TSFunctionSignatureBase extends ModuleItem {
  returnType: TSTypeAnnotation | undefined;
  parameters: Array<TSParameter>;
  typeParameters: TSTypeParameterDeclaration | undefined;
}
export interface TSTypeLiteral extends ModuleItem {
  members: Array<TSTypeElement>;
}
export type TSTypeElement =
  | TSCallSignatureDeclaration
  | TSConstructSignatureDeclaration
  // | TSIndexSignature
  | TSMethodSignature
  | TSPropertySignature;
export interface TSPropertySignature extends ModuleItem {
  kind: SyntaxKinds.TSPropertySignature;
  key: PropertyName;
  computed: boolean;
  optional: boolean;
  typeAnnotation: TSTypeAnnotation | undefined;
}
export interface TSCallSignatureDeclaration extends TSFunctionSignatureBase {
  kind: SyntaxKinds.TSCallSignatureDeclaration;
}
export interface TSConstructSignatureDeclaration extends TSFunctionSignatureBase {
  kind: SyntaxKinds.TSConstructSignatureDeclaration;
}
export interface TSMethodSignature extends TSFunctionSignatureBase {
  kind: SyntaxKinds.TSMethodSignature;
  key: PropertyName;
  computed: boolean;
  optional: boolean;
}
export interface TSTypeQuery extends ModuleItem {
  kind: SyntaxKinds.TSTypeQuery;
  exprName: TSEntityName;
}
export interface TSTupleType extends ModuleItem {
  kind: SyntaxKinds.TSTupleType;
  elementTypes: Array<TSTypeNode>;
}
export interface TSLiteralType extends ModuleItem {
  kind: SyntaxKinds.TSLiteralType;
  literal: StringLiteral | NumberLiteral | BoolLiteral | NullLiteral | UndefinbedLiteral;
}
export interface TSTypeReference extends ModuleItem {
  typeName: TSEntityName;
  typeArguments: TSTypeParameterInstantiation | undefined;
}
export interface TSQualifiedName extends ModuleItem {
  kind: SyntaxKinds.TSQualifiedName;
  left: TSEntityName;
  right: Identifier;
}
export type TSEntityName = Identifier | TSQualifiedName;
export interface TSStringKeyword extends ModuleItem {
  kind: SyntaxKinds.TSStringKeyword;
}
export interface TSNumberKeyword extends ModuleItem {
  kind: SyntaxKinds.TSNumberKeyword;
}
export interface TSBigIntKeyword extends ModuleItem {
  kind: SyntaxKinds.TSBigIntKeyword;
}
export interface TSBooleanKeyword extends ModuleItem {
  kind: SyntaxKinds.TSBooleanKeyword;
}
export interface TSNullKeyword extends ModuleItem {
  kind: SyntaxKinds.TSNullKeyword;
}
export interface TSUndefinedKeyword extends ModuleItem {
  kind: SyntaxKinds.TSUndefinedKeyword;
}
export interface TSSymbolKeyword extends ModuleItem {
  kind: SyntaxKinds.TSSymbolKeyword;
}
export interface TSAnyKeyword extends ModuleItem {
  kind: SyntaxKinds.TSAnyKeyword;
}
export interface TSNeverKeyword extends ModuleItem {
  kind: SyntaxKinds.TSNeverKeyword;
}
export interface TSUnknowKeyword extends ModuleItem {
  kind: SyntaxKinds.TSUnknowKeyword;
}
export interface TSVoidKeyword extends ModuleItem {
  kind: SyntaxKinds.TSVoidKeyword;
}
/** ========================================
 *   Helper
 * =========================================
 */

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
export function isObjectMethodDefinition(node: ModuleItem): node is MethodDefinition {
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
