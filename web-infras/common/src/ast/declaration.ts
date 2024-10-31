import { ModuleItem } from "@/src/ast/base";
import { SyntaxKinds } from "@/src/kind";
import { StatementListItem } from "@/src/ast/program";
import { Expression, Identifier, NumberLiteral, PrivateName, StringLiteral } from "@/src/ast/expression";
import { Pattern } from "@/src/ast/pattern";
import {
  TSTypeParameterDeclaration,
  TSTypeAnnotation,
  TSDeclareFunction,
  TSEnumDeclaration,
  TSInterfaceDeclaration,
  TSTypeAliasDeclaration,
} from "@/src/ast/typescript";

export type PropertyName = StringLiteral | NumberLiteral | Identifier | Expression;

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
export interface TSClassConstructorDeclaration extends ModuleItem {
  kind: SyntaxKinds.TSClassConstructorDeclaration;
  // ClassElementName
  key: Identifier;
  // function
  params: Array<Pattern>;
  // TS Type
  returnTye: TSTypeAnnotation | undefined;
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

export type TSDeclaration =
  | TSTypeAliasDeclaration
  | TSInterfaceDeclaration
  | TSEnumDeclaration
  | TSDeclareFunction;
