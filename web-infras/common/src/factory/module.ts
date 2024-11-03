import * as AST from "@/src/ast/index";
import { SyntaxKinds } from "@/src/kind";
import { SourcePosition } from "@/src/position";

export function createProgram(
  body: Array<AST.ModuleItem>,
  start: SourcePosition,
  end: SourcePosition,
): AST.Program {
  return { kind: SyntaxKinds.Program, body, start, end };
}
export function createImportDeclaration(
  specifiers: AST.ImportDeclaration["specifiers"],
  source: AST.ImportDeclaration["source"],
  importKind: AST.ImportDeclaration["importKind"],
  attributes: AST.ImportDeclaration["attributes"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ImportDeclaration {
  return {
    kind: SyntaxKinds.ImportDeclaration,
    specifiers,
    importKind,
    source,
    attributes,
    start,
    end,
  };
}
export function createImportDefaultSpecifier(
  imported: AST.ImportDefaultSpecifier["imported"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ImportDefaultSpecifier {
  return {
    kind: SyntaxKinds.ImportDefaultSpecifier,
    imported,
    start,
    end,
  };
}
export function createImportNamespaceSpecifier(
  imported: AST.ImportNamespaceSpecifier["imported"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ImportNamespaceSpecifier {
  return {
    kind: SyntaxKinds.ImportNamespaceSpecifier,
    imported,
    start,
    end,
  };
}
export function createImportSpecifier(
  imported: AST.ImportSpecifier["imported"],
  local: AST.ImportSpecifier["local"],
  isTypeOnly: AST.ImportSpecifier["isTypeOnly"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ImportSpecifier {
  return {
    kind: SyntaxKinds.ImportSpecifier,
    imported,
    local,
    isTypeOnly,
    start,
    end,
  };
}

export function createExportAllDeclaration(
  exported: AST.ExportAllDeclaration["exported"],
  source: AST.ExportAllDeclaration["source"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ExportAllDeclaration {
  return {
    kind: SyntaxKinds.ExportAllDeclaration,
    exported,
    source,
    start,
    end,
  };
}
export function createExportNamedDeclaration(
  specifiers: AST.ExportNamedDeclarations["specifiers"],
  declaration: AST.ExportNamedDeclarations["declaration"],
  source: AST.ExportNamedDeclarations["source"],

  start: SourcePosition,
  end: SourcePosition,
): AST.ExportNamedDeclarations {
  return {
    kind: SyntaxKinds.ExportNamedDeclaration,
    specifiers,
    declaration,
    source,
    start,
    end,
  };
}
export function createExportSpecifier(
  exported: AST.ExportSpecifier["exported"],
  local: AST.ExportSpecifier["local"],
  isTypeOnly: AST.ExportSpecifier["isTypeOnly"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ExportSpecifier {
  return {
    kind: SyntaxKinds.ExportSpecifier,
    exported,
    isTypeOnly,
    local,
    start,
    end,
  };
}
export function createExportDefaultDeclaration(
  declaration: AST.ExportDefaultDeclaration["declaration"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ExportDefaultDeclaration {
  return {
    kind: SyntaxKinds.ExportDefaultDeclaration,
    declaration,
    start,
    end,
  };
}

export function createImportAttribute(
  key: AST.ImportAttribute["key"],
  value: AST.ImportAttribute["value"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ImportAttribute {
  return {
    kind: SyntaxKinds.ImportAttribute,
    key,
    value,
    start,
    end,
  };
}
