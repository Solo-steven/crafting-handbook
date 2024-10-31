import { ModuleItem } from "@/src/ast/base";
import { SyntaxKinds } from "@/src/kind";
import {
  Expression,
  Identifier,
  StringLiteral,
  NumberLiteral,
  NullLiteral,
  BoolLiteral,
  UndefinbedLiteral,
} from "@/src/ast/expression";
import { ObjectPattern, ArrayPattern, AssignmentPattern, RestElement } from "@/src/ast/pattern";
import { PropertyName, Function } from "@/src/ast/declaration";

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
