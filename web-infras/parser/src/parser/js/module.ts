import {
  ClassDeclaration,
  ClassExpression,
  cloneSourcePosition,
  ExportAllDeclaration,
  ExportDeclaration,
  ExportDefaultDeclaration,
  ExportNamedDeclarations,
  ExportSpecifier,
  Factory,
  Identifier,
  ImportAttribute,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
  isIdentifer,
  isStringLiteral,
  Keywords,
  ModuleItem,
  SourcePosition,
  StringLiteral,
  SyntaxKinds,
} from "web-infra-common";
import { ParserPlugin } from "@/src/parser/config";
import { ErrorMessageMap } from "@/src/parser/error";
import { ExportContext } from "@/src/parser/scope/lexicalScope";
import { IdentiferWithKeyworArray, KeywordSet } from "@/src/parser/type";
import { Parser } from "@/src/parser";

export function parseProgram(this: Parser) {
  const body: Array<ModuleItem> = [];
  this.enterProgram();
  while (!this.match(SyntaxKinds.EOFToken)) {
    body.push(this.parseModuleItem());
  }
  for (const propertyHasInit of this.context.propertiesInitSet) {
    this.raiseError(
      ErrorMessageMap.Syntax_error_Invalid_shorthand_property_initializer,
      propertyHasInit.start,
    );
  }
  for (const duplicateProto of this.context.propertiesProtoDuplicateSet) {
    this.raiseError(
      ErrorMessageMap.syntax_error_property_name__proto__appears_more_than_once_in_object_literal,
      duplicateProto.start,
    );
  }
  this.exitProgram();
  return Factory.createProgram(
    body,
    body.length === 0 ? this.getStartPosition() : cloneSourcePosition(body[0].start),
    this.getEndPosition(),
  );
}
export function parseModuleItem(this: Parser): ModuleItem {
  if (this.match(SyntaxKinds.AtPunctuator)) {
    this.parseDecoratorListToCache();
  }
  const token = this.getToken();
  switch (token) {
    case SyntaxKinds.ImportKeyword: {
      const { kind } = this.lookahead();
      if (kind === SyntaxKinds.DotOperator || kind === SyntaxKinds.ParenthesesLeftPunctuator) {
        return this.parseStatementListItem();
      }
      return this.parseImportDeclaration();
    }
    case SyntaxKinds.ExportKeyword:
      return this.parseExportDeclaration();
    default:
      return this.parseStatementListItem();
  }
}
/** ================================================================================
 *  Parse Import Declaration
 *  entry point: https://tc39.es/ecma262/#sec-imports
 * ==================================================================================
 */
export function expectFormKeyword(this: Parser) {
  if (this.getSourceValue() !== "from") {
    throw this.createUnexpectError();
  }
  if (this.getEscFlag()) {
    this.raiseError(ErrorMessageMap.invalid_esc_char_in_keyword, this.getStartPosition());
  }
  this.nextToken();
}
/**
 * Parse Import Declaration
 * ```
 * ImportDeclaration := 'import'  ImportClasue FromClause WithClause?
 *                   := 'import'  StringLiteral WithClause?
 * FromClause := 'from' StringLiteral
 * ImportClause := ImportDefaultBinding
 *              := ImportNamesapce
 *              := ImportNamed
 *              := ImportDefaultBindling ',' ImportNamed
 *              := ImportDefaultBindling ',' ImportNamespace
 * ```
 * - frist, eat import keyword
 *   1. if it is string literal, must be `import StringLiteral`
 *   2. if it start with `*`, must be import name space
 *   3. if it start with '{', must be import named
 *   4. fallback case: default import with import named or import namesspace
 *      or nothing
 * @returns {ImportDeclaration}
 */
export function parseImportDeclaration(this: Parser): ImportDeclaration {
  const { start } = this.expect(SyntaxKinds.ImportKeyword);
  if (this.config.sourceType === "script") {
    this.raiseError(
      ErrorMessageMap.babel_error_import_and_export_may_appear_only_with_sourceType_module,
      start,
    );
  }
  let importKind: ImportDeclaration["importKind"] = "value";
  if (this.isContextKeyword("type")) {
    const { kind, value } = this.lookahead();
    if (!((kind === SyntaxKinds.Identifier && value === "from") || kind === SyntaxKinds.StringLiteral)) {
      this.nextToken();
      importKind = "type";
    }
  }
  const specifiers: Array<ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier> = [];
  if (this.match(SyntaxKinds.StringLiteral)) {
    const source = this.parseStringLiteral();
    const attributes = this.parseImportAttributesOptional();
    this.shouldInsertSemi();
    return Factory.createImportDeclaration(
      specifiers,
      source,
      importKind,
      attributes,
      start,
      cloneSourcePosition(source.end),
    );
  }
  if (this.match(SyntaxKinds.MultiplyOperator)) {
    specifiers.push(this.parseImportNamespaceSpecifier());
    this.expectFormKeyword();
    const source = this.parseStringLiteral();
    const attributes = this.parseImportAttributesOptional();
    this.shouldInsertSemi();
    return Factory.createImportDeclaration(
      specifiers,
      source,
      importKind,
      attributes,
      start,
      cloneSourcePosition(source.end),
    );
  }
  if (this.match(SyntaxKinds.BracesLeftPunctuator)) {
    this.parseImportSpecifiers(specifiers);
    this.expectFormKeyword();
    const source = this.parseStringLiteral();
    const attributes = this.parseImportAttributesOptional();
    this.shouldInsertSemi();
    return Factory.createImportDeclaration(
      specifiers,
      source,
      importKind,
      attributes,
      start,
      cloneSourcePosition(source.end),
    );
  }
  specifiers.push(this.parseImportDefaultSpecifier());
  if (this.match(SyntaxKinds.CommaToken)) {
    this.nextToken();
    if (this.match(SyntaxKinds.BracesLeftPunctuator)) {
      if (importKind === "type")
        this.raiseError(
          ErrorMessageMap.ts_1363_A_type_only_import_can_specify_a_default_import_or_named_bindings_but_not_both,
          this.getStartPosition(),
        );
      this.parseImportSpecifiers(specifiers);
    } else if (this.match(SyntaxKinds.MultiplyOperator)) {
      if (importKind === "type")
        this.raiseError(
          ErrorMessageMap.ts_1363_A_type_only_import_can_specify_a_default_import_or_named_bindings_but_not_both,
          this.getStartPosition(),
        );
      specifiers.push(this.parseImportNamespaceSpecifier());
    } else {
      throw this.createMessageError(
        "import default specifier can only concat with namespace of import named specifier",
      );
    }
  }
  this.expectFormKeyword();
  const source = this.parseStringLiteral();
  const attributes = this.parseImportAttributesOptional();
  this.shouldInsertSemi();
  return Factory.createImportDeclaration(
    specifiers,
    source,
    importKind,
    attributes,
    start,
    cloneSourcePosition(source.end),
  );
}
/**
 * Parse Default import binding
 * ```
 * ImportDefaultBinding := Identifer
 * ```
 * @returns {ImportDefaultSpecifier}
 */
export function parseImportDefaultSpecifier(this: Parser): ImportDefaultSpecifier {
  const name = this.parseIdentifierReference();
  this.declarateLetSymbol(name.name, name.start);
  return Factory.createImportDefaultSpecifier(
    name,
    cloneSourcePosition(name.start),
    cloneSourcePosition(name.end),
  );
}
/**
 * Parse namespace import
 * ```
 * ImportNamespace := '*' 'as' Identifer
 * ```
 * @returns {ImportNamespaceSpecifier}
 */
export function parseImportNamespaceSpecifier(this: Parser): ImportNamespaceSpecifier {
  const { start } = this.expect(SyntaxKinds.MultiplyOperator);
  if (!this.isContextKeyword("as")) {
    this.raiseError(ErrorMessageMap.babel_error_unexpected_token_expected_as, this.getStartPosition());
  }
  this.nextToken();
  const id = this.parseIdentifierReference();
  this.declarateLetSymbol(id.name, id.start);
  return Factory.createImportNamespaceSpecifier(id, start, cloneSourcePosition(id.end));
}
/**
 * Parse Import Nameds
 * ```
 *  ImportNamed := '{' ImportList ','? '}'
 *  ImportList  := [ ImportItem ]
 *  ImportItem  := IdentiferWithKeyword
 *              := (Identifer | StringLiteral) 'as' Identifer
 * ```
 * @param specifiers
 * @return {void}
 */
export function parseImportSpecifiers(
  this: Parser,
  specifiers: Array<ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier>,
): void {
  this.expect(SyntaxKinds.BracesLeftPunctuator);
  let isStart = true;
  while (!this.match(SyntaxKinds.BracesRightPunctuator) && !this.match(SyntaxKinds.EOFToken)) {
    if (isStart) {
      isStart = false;
    } else {
      this.expect(SyntaxKinds.CommaToken);
    }
    if (this.match(SyntaxKinds.BracesRightPunctuator) || this.match(SyntaxKinds.EOFToken)) {
      break;
    }
    specifiers.push(this.parseImportSpecifier());
  }
  this.expect(SyntaxKinds.BracesRightPunctuator);
}

export function parseImportSpecifier(this: Parser): ImportSpecifier {
  const start = this.getStartPosition();
  // eslint-disable-next-line prefer-const
  let [shouleParseAs, imported, local, isTypeOnly] = this.parseTypePrefixOfSpecifier("import");
  if (shouleParseAs && this.isContextKeyword("as")) {
    this.nextToken();
    local = this.parseIdentifierReference();
    this.declarateLetSymbol(local.name, local.start);
    return Factory.createImportSpecifier(imported, local, isTypeOnly, start, this.getLastTokenEndPositon());
  }
  if (isIdentifer(imported) && KeywordSet.has(imported.name)) {
    // recoverable error
    this.raiseError(ErrorMessageMap.extra_error_unexpect_keyword_in_module_name, imported.start);
  } else if (isStringLiteral(imported)) {
    // recoverable error
    this.raiseError(
      ErrorMessageMap.babel_error_string_literal_cannot_be_used_as_an_imported_binding,
      imported.start,
    );
  }
  if (isIdentifer(imported)) this.declarateLetSymbol(imported.name, imported.start);
  return Factory.createImportSpecifier(
    imported,
    local as Identifier | null,
    isTypeOnly,
    cloneSourcePosition(imported.start),
    cloneSourcePosition(imported.end),
  );
}

export function parseTypePrefixOfSpecifier(
  this: Parser,
  kind: "import" | "export",
): [boolean, StringLiteral | Identifier, Identifier | StringLiteral | null, boolean] {
  const maybeType = this.isContextKeyword("type");
  let isTypeOnly = false;
  let imported = this.parseModuleExportName();
  let local: Identifier | StringLiteral | null = null;
  let shouleParseAs = true;
  // https://github.com/microsoft/TypeScript/blob/fc4f9d83d5939047aa6bb2a43965c6e9bbfbc35b/src/compiler/parser.ts#L7411-L7456
  // import { type } from "mod";          - hasTypeSpecifier: false, leftOfAs: type
  // import { type as } from "mod";       - hasTypeSpecifier: true,  leftOfAs: as
  // import { type as as } from "mod";    - hasTypeSpecifier: false, leftOfAs: type, rightOfAs: as
  // import { type as as as } from "mod"; - hasTypeSpecifier: true,  leftOfAs: as,   rightOfAs: as
  if (maybeType) {
    if (this.isContextKeyword("as")) {
      const firstAs = this.parseIdentifierName();
      if (this.isContextKeyword("as")) {
        const secondAs = this.parseIdentifierName();
        if (this.match(IdentiferWithKeyworArray)) {
          // type as as <id or keyword>
          shouleParseAs = false;
          isTypeOnly = true;
          imported = firstAs;
          local = kind === "import" ? this.parseIdentifierReference() : this.parseModuleExportName();
        } else {
          // type as as <not id or keyword>
          shouleParseAs = false;
          local = secondAs;
        }
      } else if (this.match(IdentiferWithKeyworArray)) {
        // type as <id-or-keyword-but-not-`as`>
        local = kind === "import" ? this.parseIdentifierReference() : this.parseModuleExportName();
        shouleParseAs = false;
      } else {
        // type as <not id or keyword>
        imported = firstAs;
        shouleParseAs = false;
        isTypeOnly = true;
      }
    } else if (this.match(IdentiferWithKeyworArray)) {
      // type somthing
      imported = this.parseIdentifierReference();
      isTypeOnly = true;
    }
  }
  return [shouleParseAs, imported, local, isTypeOnly];
}

export function parseImportAttributesOptional(this: Parser): ImportAttribute[] | undefined {
  if (
    (this.requirePlugin(ParserPlugin.ImportAttribute) && this.match(SyntaxKinds.WithKeyword)) ||
    (this.requirePlugin(ParserPlugin.ImportAssertions) &&
      this.match(SyntaxKinds.Identifier) &&
      this.getSourceValue() === "assert")
  ) {
    this.nextToken();
    return this.parseImportAttributes();
  }
  return undefined;
}
export function parseImportAttributes(this: Parser): ImportAttribute[] {
  this.expect(SyntaxKinds.BracesLeftPunctuator);
  const attributes: Array<ImportAttribute> = [this.parseImportAttribute()];
  while (!this.match([SyntaxKinds.BracesRightPunctuator, SyntaxKinds.EOFToken])) {
    this.expect(SyntaxKinds.CommaToken);
    if (this.match([SyntaxKinds.BracesRightPunctuator, SyntaxKinds.EOFToken])) {
      break;
    }
    attributes.push(this.parseImportAttribute());
  }
  this.expect(SyntaxKinds.BracesRightPunctuator);
  return attributes;
}
export function parseImportAttribute(this: Parser): ImportAttribute {
  const key = this.parseIdentifierName();
  this.expect(SyntaxKinds.ColonPunctuator);
  const value = this.parseStringLiteral();
  return Factory.createImportAttribute(
    key,
    value,
    cloneSourcePosition(key.start),
    cloneSourcePosition(value.end),
  );
}
/** ================================================================================
 *  Parse Export Declaration
 *  entry point: https://tc39.es/ecma262/#prod-ExportDeclaration
 * ==================================================================================
 */
/**
 * Parse Export Declaration
 * ```
 * ExportDeclaration := 'export' ExportNamedDeclaration ';'?
 *                   := 'export' ExportDefaultDeclaration
 *                   := 'export' ExportAllDeclaration
 * ExportNamedDeclaration := '{' ExportList  '}' ('from' StringLiteral)?
 *                        := Declaration
 *                        := VarStatement
 * ExportAllDeclaration := '*' 'from' StringLiteral
 *                      := '*' 'as'  Identifer 'from' StringLiteral
 * ```
 * @returns {ExportDeclaration}
 */
export function parseExportDeclaration(this: Parser): ExportDeclaration {
  this.setExportContext(ExportContext.InExport);

  const { start } = this.expect(SyntaxKinds.ExportKeyword);
  if (this.config.sourceType === "script") {
    this.raiseError(
      ErrorMessageMap.babel_error_import_and_export_may_appear_only_with_sourceType_module,
      start,
    );
  }
  let exportDeclaration: ExportDeclaration;
  switch (this.getToken()) {
    case SyntaxKinds.DefaultKeyword: {
      exportDeclaration = this.parseExportDefaultDeclaration(start);
      break;
    }
    case SyntaxKinds.MultiplyOperator: {
      exportDeclaration = this.parseExportAllDeclaration(start);
      break;
    }
    case SyntaxKinds.BracesLeftPunctuator: {
      exportDeclaration = this.parseExportNamedDeclaration(start);
      break;
    }
    default: {
      const declaration = this.match(SyntaxKinds.VarKeyword)
        ? this.parseVariableDeclaration()
        : this.parseDeclaration();
      exportDeclaration = Factory.createExportNamedDeclaration(
        [],
        declaration,
        null,
        start,
        cloneSourcePosition(declaration.end),
      );
      break;
    }
  }
  this.setExportContext(ExportContext.NotInExport);
  return exportDeclaration;
}
/**
 * Parse default export declaration
 * ```
 * ```
 * @param {SourcePosition} start
 * @returns {ExportDefaultDeclaration}
 */
export function parseExportDefaultDeclaration(this: Parser, start: SourcePosition): ExportDefaultDeclaration {
  this.expect(SyntaxKinds.DefaultKeyword);
  switch (this.getToken()) {
    case SyntaxKinds.ClassKeyword:
    case SyntaxKinds.AtPunctuator: {
      let decoratorList = this.takeCacheDecorator();
      if (this.match(SyntaxKinds.AtPunctuator)) {
        decoratorList = this.mergeDecoratorList(decoratorList, this.parseDecoratorList());
      }
      const classDeclar = Factory.transFormClassToClassDeclaration(this.parseClass(decoratorList, false));
      this.staticSematicForDuplicateDefaultExport(classDeclar);
      return Factory.createExportDefaultDeclaration(
        classDeclar as ClassDeclaration | ClassExpression,
        start,
        cloneSourcePosition(classDeclar.end),
      );
    }
    case SyntaxKinds.FunctionKeyword: {
      const funcDeclar = this.parseFunctionDeclaration(false, true);
      this.staticSematicForDuplicateDefaultExport(funcDeclar);
      return Factory.createExportDefaultDeclaration(funcDeclar, start, cloneSourcePosition(funcDeclar.end));
    }
    default: {
      if (this.isContextKeyword("async") && this.lookahead().kind === SyntaxKinds.FunctionKeyword) {
        this.nextToken();
        const funcDeclar = this.parseFunctionDeclaration(true, true);
        // funcDeclar.async = true;
        this.staticSematicForDuplicateDefaultExport(funcDeclar);
        return Factory.createExportDefaultDeclaration(funcDeclar, start, cloneSourcePosition(funcDeclar.end));
      }
      const typeDeclar = this.tryParseDeclarationWithIdentifierStart();
      if (typeDeclar) {
        this.shouldInsertSemi();
        return Factory.createExportDefaultDeclaration(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          typeDeclar as any,
          start,
          this.getLastTokenEndPositon(),
        );
      }
      // TODO: parse export default from ""; (experimental feature)
      const expr = this.parseAssignmentExpressionAllowIn();
      this.shouldInsertSemi();
      this.staticSematicForDuplicateDefaultExport(expr);
      return Factory.createExportDefaultDeclaration(expr, start, cloneSourcePosition(expr.end));
    }
  }
}
/**
 * Using symbol scope recorder for record the default export.
 * @param node
 */
export function staticSematicForDuplicateDefaultExport(this: Parser, node: ModuleItem) {
  const isDefaultAlreadyBeDeclarated = this.symbolScopeRecorder.testAndSetDefaultExport(node.start);
  if (isDefaultAlreadyBeDeclarated) {
    this.raiseError(ErrorMessageMap.v8_error_duplicate_identifier, isDefaultAlreadyBeDeclarated);
  }
}
export function parseExportNamedDeclaration(this: Parser, start: SourcePosition): ExportNamedDeclarations {
  this.expect(SyntaxKinds.BracesLeftPunctuator);
  const specifier: Array<ExportSpecifier> = [];
  let isStart = true;
  let isMatchKeyword = false;
  const undefExportSymbols: Array<[string, SourcePosition]> = [];
  while (!this.match(SyntaxKinds.BracesRightPunctuator) && !this.match(SyntaxKinds.EOFToken)) {
    if (isStart) {
      isStart = false;
    } else {
      this.expect(SyntaxKinds.CommaToken);
    }
    if (this.match(SyntaxKinds.BracesRightPunctuator) || this.match(SyntaxKinds.EOFToken)) {
      break;
    }
    if (this.match(Keywords)) {
      isMatchKeyword = true;
    }
    specifier.push(this.parseExportSpecifier(undefExportSymbols));
  }
  const { end: bracesRightPunctuatorEnd } = this.expect(SyntaxKinds.BracesRightPunctuator);
  let source: StringLiteral | null = null;
  if (this.getSourceValue() === "from") {
    this.nextToken();
    source = this.parseStringLiteral();
  } else {
    if (isMatchKeyword) {
      throw new Error();
    }
    if (undefExportSymbols.length > 0) {
      undefExportSymbols.forEach(([sym, pos]) => {
        this.symbolScopeRecorder.addToUndefExportSource(sym, pos);
      });
    }
    this.staticSematicEarlyErrorForExportName(specifier);
  }
  this.shouldInsertSemi();
  const end = source
    ? source.end
    : specifier.length === 0
      ? bracesRightPunctuatorEnd
      : specifier[specifier.length - 1].end;
  return Factory.createExportNamedDeclaration(specifier, null, source, start, cloneSourcePosition(end));
}
export function parseExportSpecifier(
  this: Parser,
  undefExportSymbols: Array<[string, SourcePosition]>,
): ExportSpecifier {
  // eslint-disable-next-line prefer-const
  let [shouleParseAs, exported, local, isTypeOnly] = this.parseTypePrefixOfSpecifier("export");
  if (!this.isVariableDeclarated(helperGetValueOfExportName(exported))) {
    undefExportSymbols.push([helperGetValueOfExportName(exported), exported.start]);
  }
  if (shouleParseAs && this.isContextKeyword("as")) {
    this.nextToken();
    local = this.parseModuleExportName();
    this.staticSematicForDuplicateExportName(local);
    return Factory.createExportSpecifier(
      exported,
      local,
      isTypeOnly,
      cloneSourcePosition(exported.start),
      cloneSourcePosition(local.end),
    );
  }
  this.staticSematicForDuplicateExportName(exported);
  return Factory.createExportSpecifier(
    exported,
    local,
    isTypeOnly,
    cloneSourcePosition(exported.start),
    cloneSourcePosition(exported.end),
  );
}
/**
 * Static Sematic Check based on
 * - 16.2.3.1 Static Semantics: Early Errors
 * @param specifiers
 */
export function staticSematicEarlyErrorForExportName(this: Parser, specifiers: Array<ExportSpecifier>) {
  for (const specifier of specifiers) {
    if (isStringLiteral(specifier.exported)) {
      this.raiseError(
        ErrorMessageMap.babel_error_string_literal_cannot_be_used_as_an_exported_binding_without_from,
        specifier.exported.start,
      );
    }
  }
}
/**
 * Using symbol scope recorder for record export name identifier
 * @param exportName
 */
export function staticSematicForDuplicateExportName(this: Parser, exportName: StringLiteral | Identifier) {
  const name = helperGetValueOfExportName(exportName);
  const isExportNameAlreadyBeDeclar = this.declarateExportSymbol(name, exportName.start);
  if (isExportNameAlreadyBeDeclar) {
    this.raiseError(ErrorMessageMap.v8_error_duplicate_identifier, isExportNameAlreadyBeDeclar);
  }
  const isDefaultAlreadyBeDeclarated = this.symbolScopeRecorder.testAndSetDefaultExport(exportName.start);
  if (name === "default" && isDefaultAlreadyBeDeclarated) {
    this.raiseError(ErrorMessageMap.v8_error_duplicate_identifier, isDefaultAlreadyBeDeclarated);
  }
}
export function parseExportAllDeclaration(this: Parser, start: SourcePosition): ExportAllDeclaration {
  this.expect(SyntaxKinds.MultiplyOperator);
  let exported: Identifier | StringLiteral | null = null;
  if (this.isContextKeyword("as")) {
    this.nextToken();
    exported = this.parseModuleExportName();
  } else {
    exported = null;
  }
  this.expectFormKeyword();
  const source = this.parseStringLiteral();
  this.shouldInsertSemi();
  return Factory.createExportAllDeclaration(exported, source, start, cloneSourcePosition(source.end));
}
export function parseModuleExportName(this: Parser) {
  if (this.match(SyntaxKinds.StringLiteral)) {
    return this.parseStringLiteral();
  }
  return this.parseIdentifierName();
}
export function helperGetValueOfExportName(exportName: StringLiteral | Identifier) {
  if (isIdentifer(exportName)) {
    return exportName.name;
  }
  return exportName.value;
}
