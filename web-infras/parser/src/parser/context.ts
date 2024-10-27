import {
  ModuleItem,
  PropertyName,
  SyntaxKinds,
  SourcePosition,
  SytaxKindsMapLexicalLiteral,
  Decorator,
} from "web-infra-common";
import { ExpectToken } from "./type";
import { ErrorMessageMap } from "./error";
import { ParserPlugin } from "./config";
import { LookaheadToken } from "../lexer/type";
import { AsyncArrowExpressionScope } from "./scope/arrowExprScope";
import { StrictModeScope } from "./scope/strictModeScope";
import { ExpressionScopeKind } from "./scope/type";
import { ExportContext, PrivateNameDefKind } from "./scope/lexicalScope";
import { FunctionSymbolScope, NonFunctionalSymbolType, SymbolType } from "./scope/symbolScope";
import type { Parser } from "@/src/parser";

export interface Context {
  maybeArrowStart: number;
  isInType: boolean;
  inOperatorStack: Array<boolean>;
  propertiesInitSet: Set<ModuleItem>;
  propertiesProtoDuplicateSet: Set<PropertyName>;
  lastTokenIndexOfIfStmt: number;
  cache: {
    decorators: Decorator[] | null;
  };
}
/**
 * Create context for parser
 * @returns {Context}
 */
export function createContext(): Context {
  return {
    maybeArrowStart: -1,
    isInType: false,
    inOperatorStack: [],
    propertiesInitSet: new Set(),
    propertiesProtoDuplicateSet: new Set(),
    lastTokenIndexOfIfStmt: -1,
    cache: {
      decorators: null,
    },
  };
}
/**
 * Private API for parser, helper to require some plugin
 */
export function requirePlugin(this: Parser, ...plugins: Array<ParserPlugin>): boolean {
  for (const plugin of plugins) {
    if (!this.config.plugins.includes(plugin)) {
      return false;
    }
  }
  return true;
}
/**
 * Private API for parser, move to next token, skip comment and
 * block comment token.
 * @returns {SyntaxKinds}
 */
export function nextToken(this: Parser): SyntaxKinds {
  this.lexer.nextToken();
  const token = this.lexer.getTokenKind();
  if (token === SyntaxKinds.Comment || token == SyntaxKinds.BlockComment) {
    return this.nextToken();
  }
  return token;
}
/**
 * Private API for parser, get current token kind, skip comment
 * and block comment token
 * @returns {SyntaxKinds}
 */
export function getToken(this: Parser): SyntaxKinds {
  const token = this.lexer.getTokenKind();
  if (token === SyntaxKinds.Comment || token == SyntaxKinds.BlockComment) {
    return this.nextToken();
  }
  return token;
}
/**
 * Private API for parser, get current token's string value.
 * @returns {string}
 */
export function getSourceValue(this: Parser): string {
  return this.lexer.getSourceValue();
}
/**
 * Private API for parser, just wrapper of this.lexer, get start
 * position of current token.
 * @return {SourcePosition}
 */
export function getStartPosition(this: Parser): SourcePosition {
  return this.lexer.getStartPosition();
}
/**
 * Private API for parser, just wrapper of this.lexer, get end
 * position of current token.
 * @return {SourcePosition}
 */
export function getEndPosition(this: Parser): SourcePosition {
  return this.lexer.getEndPosition();
}
/**
 * Private API for parser, just wrapper of this.lexer, get end
 * position of last token.
 * @returns {SourcePosition}
 */
export function getLastTokenEndPositon(this: Parser): SourcePosition {
  return this.lexer.getLastTokenEndPositon();
}
/**
 * Private API for parser, just wrapper of lookahead method
 * of this.lexer.
 * @returns
 */
export function lookahead(this: Parser): LookaheadToken {
  return this.lexer.lookahead();
}
/**
 * Private API for parser, just wrapper of this.lexer method.
 * @returns
 */
export function readRegex(this: Parser) {
  return this.lexer.readRegex();
}
/**
 * Private API for parser, just wrapper of this.lexer method, check
 * is a line terminator in the range of last token end and start
 * of current token.
 * @returns {boolean}
 */
export function getLineTerminatorFlag(this: Parser): boolean {
  return this.lexer.getLineTerminatorFlag();
}
/**
 * Private API for parser, just wrapper of this.lexer methid, check
 * is current token contain a unicode esc.
 */
export function getEscFlag(this: Parser): boolean {
  return this.lexer.getEscFlag();
}
/**
 * Private API for parser, is current token kind match the
 * given token kind ?
 * @param {SyntaxKinds | Array<SyntaxKinds>} kind
 * @returns {boolean}
 */
export function match(this: Parser, kind: SyntaxKinds | Array<SyntaxKinds>): boolean {
  const currentToken = this.getToken();
  if (Array.isArray(kind)) {
    const tokenSet = new Set(kind);
    return tokenSet.has(currentToken);
  }
  return currentToken === kind;
}
/**
 * Private API for check if current identifier is a given value,
 * used when we need to detect a contextual keyword (like `async`).
 * @param {string} value
 * @returns {boolean}
 */
export function isContextKeyword(this: Parser, value: string): boolean {
  if (
    this.getSourceValue() === value &&
    this.getToken() === SyntaxKinds.Identifier &&
    !this.lexer.getEscFlag()
  ) {
    return true;
  }
  return false;
}
/**
 * Private API for parser, expect current token is one of given token(s),
 * it not, it will create a unexpect error, if is one of given token, it will
 * eat token and return `value`, `start`, `end` of token
 * @param kind
 * @param message
 * @returns {ExpectToken}
 */
export function expect(this: Parser, kind: SyntaxKinds | Array<SyntaxKinds>): ExpectToken {
  if (this.match(kind)) {
    const metaData = {
      value: this.getSourceValue(),
      start: this.getStartPosition(),
      end: this.getEndPosition(),
    };
    this.nextToken();
    return metaData;
  }
  throw this.createUnexpectError();
}
/**
 * Private API for parser, expect current token is one of given token(s),
 * it not, it will create a unexpect error, if is one of given token, it
 * will NOT eat token.
 * @param kind
 * @param message
 * @returns {void}
 */
export function expectButNotEat(this: Parser, kind: SyntaxKinds | Array<SyntaxKinds>): void {
  if (this.match(kind)) {
    return;
  }
  throw this.createUnexpectError();
}
/**
 * Private API for `shouldInsertSemi` and `isSoftInsertSemi`,
 * test is there a semi or equal syntax, return three state
 * - `SemiExisted`: there is a semi token.
 * - `SemiInsertAble`: there is a equal to semi syntax.
 * - `SemiNotExisted`: there is no semi or equal syntax,
 * @returns
 */
export function isSemiInsertable(this: Parser) {
  if (this.match(SyntaxKinds.SemiPunctuator)) {
    return "SemiExisted";
  }
  if (this.match([SyntaxKinds.BracesRightPunctuator, SyntaxKinds.EOFToken])) {
    return "SemiInsertAble";
  }
  if (this.getLineTerminatorFlag()) {
    return "SemiInsertAble";
  }
  return "SemiNotExisted";
}
/**
 * Private API for most of insert semi check, if semi exist, eat token,
 * pass if equal syntax exist, throw error if not existed semi or equal
 * syntax.
 * @returns
 */
export function shouldInsertSemi(this: Parser) {
  const semiState = this.isSemiInsertable();
  switch (semiState) {
    case "SemiExisted":
      this.nextToken();
      return;
    case "SemiInsertAble":
      return;
    case "SemiNotExisted":
      // recoverable error
      this.raiseError(ErrorMessageMap.missing_semicolon, this.getStartPosition());
  }
}
/**
 * Private API for insert semi for three edge case
 * - `DoWhileStatement`
 * - `ReturnStatement`
 * - `YeildExpression`
 * @param {boolean} shouldEat - false whem used in yield expression.
 * @returns
 */
export function isSoftInsertSemi(this: Parser, shouldEat: boolean = true) {
  const semiState = this.isSemiInsertable();
  switch (semiState) {
    case "SemiExisted":
      if (shouldEat) {
        this.nextToken();
      }
      return true;
    case "SemiInsertAble":
      return true;
    case "SemiNotExisted":
      return false;
  }
}
/**
 * Create a Message error from parser's error map.
 * @param {string} messsage
 */
export function createMessageError(this: Parser, messsage: string, position?: SourcePosition) {
  if (position === undefined) position = this.getStartPosition();

  return new Error(`[Syntax Error]: ${messsage} (${position.row}, ${position.col})`);
}
/**
 * Create a error object with message tell developer that get a
 * unexpect token.
 * @returns {Error}
 */
export function createUnexpectError(this: Parser): Error {
  const startPos = this.getStartPosition();
  return new Error(
    `[Syntax Error]: Unexpect token ${SytaxKindsMapLexicalLiteral[this.getToken()]}(${startPos.row}, ${startPos.col}).`,
  );
}
/**
 * Given that this parser is recurive decent parser, some
 * export function must call with some start token, if export function call
 * with unexecpt start token, it should throw this error.
 * @param {Array<SyntaxKinds>} startTokens
 * @returns {Error}
 */
export function createUnreachError(this: Parser, startTokens: Array<SyntaxKinds> = []): Error {
  const start = this.getStartPosition();
  let message = `[Unreach Zone]: this piece of code should not be reach (${start.row}, ${start.col}), have a unexpect token ${this.getToken()} (${this.getSourceValue()}).`;
  if (startTokens.length !== 0) {
    message += " it should call with start token[";
    for (const token of startTokens) {
      message += `${token}, `;
    }
    message += "]";
  }
  message += ", please report to developer.";
  return new Error(message);
}
export function disAllowInOperaotr<T>(this: Parser, parseCallback: () => T): T {
  this.context.inOperatorStack.push(false);
  const result = parseCallback();
  this.context.inOperatorStack.pop();
  return result;
}
/**
 * Private API for parse api for expression, in ECMAscript, there is
 * a syntax tranlation for in operator production rule.
 * @param parseCallback
 * @returns
 */
export function allowInOperaotr<T>(this: Parser, parseCallback: () => T) {
  this.context.inOperatorStack.push(true);
  const result = parseCallback();
  this.context.inOperatorStack.pop();
  return result;
}
/** ===========================================================
 *     Private API for other Parser API, just wrapper of recorder
 *  ===========================================================
 */

/**
 *  please reference to recorder api
 */
export function enterFunctionScope(this: Parser, isAsync: boolean = false, isGenerator: boolean = false) {
  this.asyncArrowExprScopeRecorder.enterFunctionScope();
  this.strictModeScopeRecorder.enterRHSStrictModeScope();
  this.symbolScopeRecorder.enterFunctionSymbolScope();
  this.lexicalScopeRecorder.enterFunctionLexicalScope(isAsync, isGenerator);
  this.lexer.setStrictModeContext(this.isInStrictMode());
}
export function exitFunctionScope(this: Parser, focusCheck: boolean) {
  const isNonSimpleParam = !this.isCurrentFunctionParameterListSimple();
  const isStrict = this.isInStrictMode();
  const symbolScope = this.symbolScopeRecorder.exitSymbolScope()!;
  if (isNonSimpleParam || isStrict || focusCheck) {
    const functionSymbolScope = symbolScope as FunctionSymbolScope;
    for (const symPos of functionSymbolScope.duplicateParams) {
      this.raiseError(ErrorMessageMap.duplicate_param, symPos);
    }
  }
  this.asyncArrowExprScopeRecorder.exitAsyncArrowExpressionScope();
  this.strictModeScopeRecorder.exitStrictModeScope();
  this.lexicalScopeRecorder.exitFunctionLexicalScope();
  this.lexer.setStrictModeContext(this.isInStrictMode());
}
export function enterProgram(this: Parser) {
  this.symbolScopeRecorder.enterProgramSymbolScope();
  this.lexicalScopeRecorder.enterProgramLexicalScope(
    this.config.allowAwaitOutsideFunction || false,
    this.config.sourceType === "module",
  );
  this.lexer.setStrictModeContext(this.config.sourceType === "module");
}
export function exitProgram(this: Parser) {
  if (!this.config.allowUndeclaredExports) {
    for (const pos of this.symbolScopeRecorder.getProgramContainUndefSymbol()) {
      this.raiseError(ErrorMessageMap.babel_error_export_is_not_defined, pos);
    }
  }
  this.symbolScopeRecorder.exitSymbolScope();
  this.lexicalScopeRecorder.exitProgramLexicalScope();
  this.lexer.setStrictModeContext(false);
}
export function enterBlockScope(this: Parser) {
  this.lexicalScopeRecorder.enterBlockLexicalScope(false);
  this.symbolScopeRecorder.enterBlockSymbolScope();
}
export function exitBlockScope(this: Parser) {
  this.lexicalScopeRecorder.exitBlockLexicalScope();
  this.symbolScopeRecorder.exitSymbolScope();
}
export function enterCatchBlockScope(this: Parser) {
  this.lexicalScopeRecorder.enterBlockLexicalScope(true);
  this.symbolScopeRecorder.enterFunctionSymbolScope();
}
export function exitCatchBlockScope(this: Parser) {
  this.lexicalScopeRecorder.exitBlockLexicalScope();
  this.symbolScopeRecorder.exitSymbolScope();
}
export function parseAsLoop<T>(this: Parser, callback: () => T): T {
  this.lexicalScopeRecorder.enterVirtualBlockScope("Loop");
  const result = callback();
  this.lexicalScopeRecorder.exitVirtualBlockScope();
  return result;
}
export function parseAsSwitch<T>(this: Parser, callback: () => T): T {
  this.lexicalScopeRecorder.enterVirtualBlockScope("Switch");
  const result = callback();
  this.lexicalScopeRecorder.exitVirtualBlockScope();
  return result;
}
export function recordScope(this: Parser, kind: ExpressionScopeKind, position: SourcePosition) {
  this.strictModeScopeRecorder.record(kind, position);
  this.asyncArrowExprScopeRecorder.record(kind, position);
}
export function enterArrowFunctionBodyScope(this: Parser, isAsync: boolean = false) {
  this.lexicalScopeRecorder.enterArrowFunctionBodyScope(isAsync);
  this.symbolScopeRecorder.enterFunctionSymbolScope();
}
export function exitArrowFunctionBodyScope(this: Parser) {
  const symbolScope = this.symbolScopeRecorder.exitSymbolScope()!;
  const functionSymbolScope = symbolScope as FunctionSymbolScope;
  for (const symPos of functionSymbolScope.duplicateParams) {
    this.raiseError(ErrorMessageMap.duplicate_param, symPos);
  }
  this.lexicalScopeRecorder.exitArrowFunctionBodyScope();
}
export function parseWithArrowExpressionScope<T>(
  this: Parser,
  callback: () => T,
): [T, AsyncArrowExpressionScope] {
  this.asyncArrowExprScopeRecorder.enterAsyncArrowExpressionScope();
  const result = callback();
  const scope = this.asyncArrowExprScopeRecorder.getCurrentAsyncArrowExpressionScope()!;
  this.asyncArrowExprScopeRecorder.exitAsyncArrowExpressionScope();
  return [result, scope];
}
export function parseWithCatpureLayer<T>(this: Parser, callback: () => T): [T, StrictModeScope] {
  this.strictModeScopeRecorder.enterCatpureStrictModeScope();
  const result = callback();
  const scope = this.strictModeScopeRecorder.getCurrentStrictModeScope();
  this.strictModeScopeRecorder.exitStrictModeScope();
  return [result, scope];
}
export function parseWithLHSLayer<T>(this: Parser, callback: () => T): T {
  this.strictModeScopeRecorder.enterLHSStrictModeScope();
  const result = callback();
  this.strictModeScopeRecorder.exitStrictModeScope();
  return result;
}
export function parseWithLHSLayerReturnScope<T>(this: Parser, callback: () => T): [T, StrictModeScope] {
  this.strictModeScopeRecorder.enterLHSStrictModeScope();
  const result = callback();
  const scope = this.strictModeScopeRecorder.getCurrentStrictModeScope();
  this.strictModeScopeRecorder.exitStrictModeScope();
  return [result, scope];
}
export function parseWithRHSLayer<T>(this: Parser, callback: () => T): T {
  this.strictModeScopeRecorder.enterRHSStrictModeScope();
  const result = callback();
  this.strictModeScopeRecorder.exitStrictModeScope();
  return result;
}
export function checkStrictModeScopeError(this: Parser, scope: StrictModeScope) {
  if (this.isInStrictMode() && this.strictModeScopeRecorder.isStrictModeScopeViolateStrictMode(scope)) {
    if (scope.kind !== "RHSLayer") {
      for (const pos of scope.argumentsIdentifier) {
        this.raiseError(ErrorMessageMap.syntax_error_bad_strict_arguments_eval, pos);
      }
      for (const pos of scope.evalIdentifier) {
        this.raiseError(ErrorMessageMap.syntax_error_bad_strict_arguments_eval, pos);
      }
      for (const pos of scope.letIdentifier) {
        this.raiseError(ErrorMessageMap.unexpect_keyword_in_stric_mode, pos);
      }
      for (const pos of scope.yieldIdentifier) {
        this.raiseError(ErrorMessageMap.unexpect_keyword_in_stric_mode, pos);
      }
      for (const pos of scope.preservedWordIdentifier) {
        this.raiseError(ErrorMessageMap.unexpect_keyword_in_stric_mode, pos);
      }
    }
  }
}
export function checkAsyncArrowExprScopeError(this: Parser, scope: AsyncArrowExpressionScope) {
  if (this.asyncArrowExprScopeRecorder.isAsyncArrowExpressionScopeHaveError(scope)) {
    for (const pos of scope.awaitExpressionInParameter) {
      this.raiseError(ErrorMessageMap.extra_error_await_expression_can_not_used_in_parameter_list, pos);
    }
    for (const pos of scope.yieldExpressionInParameter) {
      this.raiseError(ErrorMessageMap.extra_error_yield_expression_can_not_used_in_parameter_list, pos);
    }
    for (const pos of scope.awaitIdentifier) {
      this.raiseError(
        ErrorMessageMap.babel_error_can_not_use_await_as_identifier_inside_an_async_function,
        pos,
      );
    }
  }
}
export function enterFunctionParameter(this: Parser) {
  this.lexicalScopeRecorder.enterFunctionLexicalScopeParamemter();
}
export function existFunctionParameter(this: Parser) {
  this.lexicalScopeRecorder.exitFunctionLexicalScopeParamemter();
}
export function setCurrentFunctionContextAsGenerator(this: Parser) {
  this.lexicalScopeRecorder.setCurrentFunctionLexicalScopeAsGenerator();
}
export function setCurrentFunctionContextAsStrictMode(this: Parser) {
  this.lexicalScopeRecorder.setCurrentFunctionLexicalScopeAsStrictMode();
  this.lexer.setStrictModeContext(true);
}
/**
 * Private API for `For-In` parsering problem.
 * @returns {boolean}
 */
export function getCurrentInOperatorStack(this: Parser): boolean {
  if (this.context.inOperatorStack.length === 0) {
    return false;
  }
  return this.context.inOperatorStack[this.context.inOperatorStack.length - 1];
}
export function isTopLevel(this: Parser): boolean {
  return this.lexicalScopeRecorder.isInTopLevel();
}
export function isCurrentScopeParseAwaitAsExpression(this: Parser): boolean {
  return this.lexicalScopeRecorder.canAwaitParseAsExpression();
}
export function isCurrentScopeParseYieldAsExpression(this: Parser): boolean {
  return this.lexicalScopeRecorder.canYieldParseAsExpression();
}
export function isInParameter(this: Parser): boolean {
  return this.lexicalScopeRecorder.isInParameter();
}
export function setCurrentFunctionParameterListAsNonSimple(this: Parser) {
  return this.lexicalScopeRecorder.setCurrentFunctionLexicalScopeParameterAsNonSimple();
}
export function isCurrentFunctionParameterListSimple(this: Parser): boolean {
  return this.lexicalScopeRecorder.isCurrentFunctionLexicalScopeParameterSimple();
}
export function isParentFunctionAsync(this: Parser): boolean {
  return this.lexicalScopeRecorder.isParentFunctionAsync();
}
export function isParentFunctionGenerator(this: Parser): boolean {
  return this.lexicalScopeRecorder.isParentFunctionGenerator();
}
export function enterClassScope(this: Parser, isExtend: boolean = false) {
  this.lexicalScopeRecorder.enterClassLexicalScope(isExtend);
  this.asyncArrowExprScopeRecorder.enterAsyncArrowExpressionScope();
  this.symbolScopeRecorder.enterClassSymbolScope();
}
export function existClassScope(this: Parser) {
  const duplicateSet = this.symbolScopeRecorder.isDuplicatePrivateName();
  if (duplicateSet) {
    for (const pos of duplicateSet.values()) {
      this.raiseError(ErrorMessageMap.babel_error_private_name_duplicate, pos);
    }
  }
  const undefSet = this.symbolScopeRecorder.isUndeinfedPrivateName();
  if (undefSet) {
    for (const pos of undefSet.values()) {
      this.raiseError(ErrorMessageMap.babel_error_private_name_undeinfed, pos);
    }
  }
  this.lexicalScopeRecorder.exitClassLexicalScope();
  this.symbolScopeRecorder.exitClassSymbolScope();
  this.asyncArrowExprScopeRecorder.exitAsyncArrowExpressionScope();
}
export function isInClassScope(this: Parser): boolean {
  return this.lexicalScopeRecorder.isInClassScope();
}
export function isCurrentClassExtend(this: Parser): boolean {
  return this.lexicalScopeRecorder.isCurrentClassExtend();
}
export function usePrivateName(
  this: Parser,
  name: string,
  position: SourcePosition,
  type: PrivateNameDefKind = "other",
) {
  return this.symbolScopeRecorder.usePrivateName(name, position, type);
}
export function defPrivateName(
  this: Parser,
  name: string,
  position: SourcePosition,
  type: PrivateNameDefKind = "other",
) {
  return this.symbolScopeRecorder.defPrivateName(name, position, type);
}
export function enterDelete(this: Parser) {
  this.lexicalScopeRecorder.enterDelete();
}
export function exitDelete(this: Parser) {
  this.lexicalScopeRecorder.exitDelete();
}
export function isInDelete(this: Parser) {
  return this.lexicalScopeRecorder.isCurrentInDelete();
}
export function isInStrictMode(this: Parser): boolean {
  return this.lexicalScopeRecorder.isInStrictMode();
}
export function isDirectToFunctionContext(this: Parser): boolean {
  return this.lexicalScopeRecorder.isDirectToFunctionContext();
}
export function isDirectToClassScope(this: Parser): boolean {
  return this.lexicalScopeRecorder.isDirectToClassScope();
}
export function isReturnValidate(this: Parser): boolean {
  return this.config.allowReturnOutsideFunction || this.lexicalScopeRecorder.isReturnValidate();
}
export function isBreakValidate(this: Parser): boolean {
  return this.lexicalScopeRecorder.isBreakValidate();
}
export function isContinueValidate(this: Parser): boolean {
  return this.lexicalScopeRecorder.isContinueValidate();
}
export function canLabelReach(this: Parser, name: string): boolean {
  return this.lexicalScopeRecorder.canLabelReach(name);
}
export function isEncloseInFunction(this: Parser): boolean {
  return this.lexicalScopeRecorder.isEncloseInFunction();
}
export function isInPropertyName(this: Parser): boolean {
  return this.lexicalScopeRecorder.isInPropertyName();
}
export function setExportContext(this: Parser, context: ExportContext) {
  this.lexicalScopeRecorder.setExportContext(context);
}
export function getExportContext(this: Parser): ExportContext {
  return this.lexicalScopeRecorder.getExportContext();
}
export function takeCacheDecorator(this: Parser) {
  const list = this.context.cache.decorators;
  this.context.cache.decorators = null;
  return list;
}
export function mergeDecoratorList(input1: Decorator[] | null, input2: Decorator[] | null) {
  const list = [...(input1 || []), ...(input2 || [])];
  if (list.length === 0) {
    return null;
  }
  return list;
}
/**
 *
 * @param name
 * @param position
 * @returns
 */
export function declarateNonFunctionalSymbol(this: Parser, name: string, position: SourcePosition) {
  if (this.context.isInType) return;
  if (this.isInParameter()) {
    this.symbolScopeRecorder.declarateParam(name, position);
    return;
  }
  if (!this.symbolScopeRecorder.declarateNonFunctionalSymbol(name)) {
    this.raiseError(ErrorMessageMap.v8_error_duplicate_identifier, position);
  }
  const isExportAlreadyExist = this.declarateExportSymbolIfInContext(name, position);
  if (isExportAlreadyExist) {
    this.raiseError(ErrorMessageMap.v8_error_duplicate_identifier, isExportAlreadyExist);
  }
  return;
}
/**
 *
 * @param name
 * @param generator
 * @param position
 * @returns
 */
export function delcarateFcuntionSymbol(
  this: Parser,
  name: string,
  generator: boolean,
  position: SourcePosition,
) {
  if (this.context.isInType) return;
  const duplicateType = this.symbolScopeRecorder.declarateFuncrtionSymbol(name, generator);
  if (duplicateType) {
    if (
      (!generator &&
        ((duplicateType === SymbolType.Function && this.config.sourceType === "module") ||
          duplicateType === SymbolType.GenFunction)) ||
      (generator &&
        ((duplicateType === SymbolType.GenFunction && this.config.sourceType === "module") ||
          duplicateType === SymbolType.Function)) ||
      (duplicateType === SymbolType.Var && this.lexicalScopeRecorder.isInCatch()) ||
      duplicateType === SymbolType.Let ||
      duplicateType === SymbolType.Const
    ) {
      this.raiseError(ErrorMessageMap.v8_error_duplicate_identifier, position);
    }
  }
  const isExportAlreadyExist = this.declarateExportSymbolIfInContext(name, position);
  if (isExportAlreadyExist) {
    this.raiseError(ErrorMessageMap.v8_error_duplicate_identifier, isExportAlreadyExist);
  }
  return;
}
export function declarateLetSymbol(this: Parser, name: string, position: SourcePosition) {
  if (this.context.isInType) return;
  if (!this.symbolScopeRecorder.declarateLetSymbol(name)) {
    this.raiseError(ErrorMessageMap.v8_error_duplicate_identifier, position);
  }
  const isExportAlreadyExist = this.declarateExportSymbolIfInContext(name, position);
  if (isExportAlreadyExist) {
    this.raiseError(ErrorMessageMap.v8_error_duplicate_identifier, isExportAlreadyExist);
  }
}
export function declarateParam(this: Parser, name: string, position: SourcePosition) {
  if (this.context.isInType) return;
  this.symbolScopeRecorder.declarateParam(name, position);
  this.declarateExportSymbolIfInContext(name, position);
  return;
}
export function declarateExportSymbolIfInContext(this: Parser, name: string, position: SourcePosition) {
  if (this.context.isInType) return;
  switch (this.getExportContext()) {
    case ExportContext.NotInExport:
      return null;
    case ExportContext.InExport: {
      this.setExportContext(ExportContext.NotInExport);
      return this.declarateExportSymbol(name, position);
    }
    case ExportContext.InExportBinding: {
      return this.declarateExportSymbol(name, position);
    }
  }
}
export function declarateExportSymbol(this: Parser, name: string, position: SourcePosition) {
  if (this.context.isInType) return;
  return this.symbolScopeRecorder.declarateExportSymbol(name, position);
}
export function isVariableDeclarated(this: Parser, name: string) {
  return this.symbolScopeRecorder.isVariableDeclarated(name);
}
export function getSymbolType(this: Parser) {
  return this.symbolScopeRecorder.getSymbolType() as NonFunctionalSymbolType;
}
export function setSymbolType(this: Parser, symbolType: NonFunctionalSymbolType) {
  this.symbolScopeRecorder.setSymbolType(symbolType);
}
/**
 * Raise a error, if config recoverable set to false, it will throw a error and
 * cause stack unwidning.
 * @param message
 * @param position
 */
export function raiseError(this: Parser, message: string, position: SourcePosition) {
  this.errorHandler.pushSyntaxErrors({
    message,
    position,
  });
}
