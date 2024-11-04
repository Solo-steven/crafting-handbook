import {
  AssigmentOperatorKinds,
  BinaryOperatorKinds,
  SyntaxKinds,
  UnaryOperatorKinds,
  UpdateOperatorKinds,
} from "@/src/kind";
import { ExpressionModuleItem, ModuleItem } from "@/src/ast/base";
import { Pattern } from "@/src/ast/pattern";
import { PropertyName, FunctionBody, Function, Class } from "@/src/ast/declaration";
import {
  TSTypeAnnotation,
  TSTypeNode,
  TSTypeParameterDeclaration,
  TSTypeParameterInstantiation,
} from "@/src/ast/typescript";

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
export interface ObjectProperty extends ModuleItem {
  kind: SyntaxKinds.ObjectProperty;
  key: PropertyName;
  value: Expression | undefined; // actually is assignment expression,
  computed: boolean;
  shorted: boolean;
}
export interface ObjectMethodDefinition extends ModuleItem {
  kind: SyntaxKinds.ObjectMethodDefintion;
  key: PropertyName;
  body: FunctionBody;
  params: Array<Pattern>;
  typeParameters: TSTypeParameterDeclaration | undefined;
  returnType: TSTypeAnnotation | undefined;
  computed: boolean;
  generator: boolean;
  async: boolean;
}
export interface ObjectAccessor extends ModuleItem {
  kind: SyntaxKinds.ObjectAccessor;
  type: "get" | "set";
  key: PropertyName | PrivateName;
  body: FunctionBody;
  params: Array<Pattern>;
  typeParameters: TSTypeParameterDeclaration | undefined;
  returnType: TSTypeAnnotation | undefined;
  computed: boolean;
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
