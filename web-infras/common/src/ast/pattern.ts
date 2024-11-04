import { ModuleItem } from "@/src/ast/base";
import { SyntaxKinds } from "@/src/kind";
import {
  Expression,
  Identifier,
  MemberExpression,
  TSAsExpression,
  TSTypeAssertionExpression,
  TSSatisfiesExpression,
  TSNonNullExpression,
} from "@/src/ast/expression";
import { PropertyName } from "@/src/ast/declaration";
import { TSTypeAnnotation } from "@/src/ast/typescript";

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
