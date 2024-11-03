import { ModuleItem } from "@/src/ast/base";
import { SyntaxKinds } from "@/src/kind";
import {
  Expression,
  Identifier,
  StringLiteral,
  FunctionExpression,
  ClassExpression,
} from "@/src/ast/expression";
import { Declaration, ClassDeclaration, FunctionDeclaration, TSDeclaration } from "@/src/ast/declaration";
/** ==========================================
 * Import Declaration
 * ===========================================
 */
export interface ImportDeclaration extends ModuleItem {
  kind: SyntaxKinds.ImportDeclaration;
  specifiers: Array<ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier>;
  importKind: "type" | "value";
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
  isTypeOnly: boolean;
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
  isTypeOnly: boolean;
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
