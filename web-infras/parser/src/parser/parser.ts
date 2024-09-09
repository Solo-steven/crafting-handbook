import {
  Expression,
  FunctionBody,
  Function as FunctionAST,
  Identifier,
  ModuleItem,
  Pattern,
  PropertyDefinition,
  PropertyName,
  MethodDefinition,
  TemplateElement,
  PrivateName,
  ObjectMethodDefinition,
  ClassMethodDefinition,
  ClassElement,
  ClassBody,
  Class,
  VariableDeclaration,
  VariableDeclarator,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
  RestElement,
  ObjectPattern,
  ArrayPattern,
  StatementListItem,
  Declaration,
  Statement,
  IfStatement,
  SwitchCase,
  LabeledStatement,
  BreakStatement,
  ContinueStatement,
  ReturnStatement,
  WhileStatement,
  DoWhileStatement,
  TryStatement,
  CatchClause,
  BlockStatement,
  WithStatement,
  DebuggerStatement,
  ForStatement,
  ForInStatement,
  ForOfStatement,
  ExportDeclaration,
  ExportAllDeclaration,
  ExportNamedDeclarations,
  ExportSpecifier,
  ExportDefaultDeclaration,
  FunctionDeclaration,
  ClassDeclaration,
  ClassExpression,
  ObjectAccessor,
  ClassAccessor,
  StringLiteral,
  ClassConstructor,
  ObjectPatternProperty,
  SyntaxKinds,
  UnaryOperators,
  BinaryOperators,
  AssigmentOperators,
  AssigmentOperatorKinds,
  BinaryOperatorKinds,
  UnaryOperatorKinds,
  UpdateOperators,
  UpdateOperatorKinds,
  Keywords,
  SourcePosition,
  cloneSourcePosition,
  Factory,
  EmptyStatement,
  ObjectExpression,
  ArrayExpression,
  SpreadElement,
  SytaxKindsMapLexicalLiteral,
  AssigmentExpression,
  isRestElement,
  isSpreadElement,
  isAssignmentPattern,
  isVarDeclaration,
  RegexLiteral,
  isArrowFunctionExpression,
  isIdentifer,
  isArrayPattern,
  isObjectPattern,
  AssignmentPattern,
  ObjectProperty,
  isMemberExpression,
  LexicalLiteral,
  isAwaitExpression,
  isObjectPatternProperty,
  ArrorFunctionExpression,
  YieldExpression,
  isCallExpression,
  isStringLiteral,
  ExpressionStatement,
  Program,
  isPattern,
  isUnaryExpression,
  JSXElement,
  JSXOpeningElement,
  JSXAttribute,
  JSXSpreadAttribute,
  JSXIdentifier,
  JSXNamespacedName,
  JSXFragment,
  JSXMemberExpression,
  JSXExpressionContainer,
  JSXClosingElement,
  isNumnerLiteral,
  isFunctionExpression,
  isPrivateName,
  isFunctionDeclaration,
  isClassExpression,
  NumericLiteralKinds,
  NumberLiteral,
  UnaryExpression,
  ImportAttribute,
  Decorator,
  MetaProperty,
  CallExpression,
  ThisExpression,
  // isBlockStatement,
} from "web-infra-common";
import { ExpectToken } from "./type";
import { ErrorMessageMap } from "./error";
import { ParserUserConfig, getConfigFromUserInput } from "./config";
import { LookaheadToken } from "../lexer/type";
import { createLexer } from "../lexer/index";
import { createAsyncArrowExpressionScopeRecorder, AsyncArrowExpressionScope } from "./scope/arrowExprScope";
import { createStrictModeScopeRecorder, StrictModeScope } from "./scope/strictModeScope";
import { ExpressionScopeKind } from "./scope/type";
import { createLexicalScopeRecorder, ExportContext, PrivateNameDefKind } from "./scope/lexicalScope";
import {
  createSymbolScopeRecorder,
  FunctionSymbolScope,
  NonFunctionalSymbolType,
  SymbolType,
} from "./scope/symbolScope";
import { SyntaxErrorHandler } from "@/src/errorHandler/type";

interface Context {
  maybeArrowStart: number;
  inOperatorStack: Array<boolean>;
  propertiesInitSet: Set<ModuleItem>;
  propertiesProtoDuplicateSet: Set<PropertyName>;
  cache: {
    decorators: Decorator[] | null;
  };
}

interface ASTArrayWithMetaData<T> {
  nodes: Array<T>;
  start: SourcePosition;
  end: SourcePosition;
}
/**
 * Create context for parser
 * @returns {Context}
 */
function createContext(): Context {
  return {
    maybeArrowStart: -1,
    inOperatorStack: [],
    propertiesInitSet: new Set(),
    propertiesProtoDuplicateSet: new Set(),
    cache: {
      decorators: null,
    },
  };
}

const IdentiferWithKeyworArray = [SyntaxKinds.Identifier, ...Keywords];
const BindingIdentifierSyntaxKindArray = [
  SyntaxKinds.Identifier,
  SyntaxKinds.AwaitKeyword,
  SyntaxKinds.YieldKeyword,
  SyntaxKinds.LetKeyword,
];
const PreserveWordSet = new Set(LexicalLiteral.preserveword);
const KeywordSet = new Set([
  ...LexicalLiteral.keywords,
  ...LexicalLiteral.BooleanLiteral,
  ...LexicalLiteral.NullLiteral,
  ...LexicalLiteral.UndefinbedLiteral,
]);
/**
 * create parser for input code.
 * @param {string} code
 * @returns
 */
export function createParser(code: string, errorhandler: SyntaxErrorHandler, option?: ParserUserConfig) {
  const lexer = createLexer(code);
  const context = createContext();
  const config = getConfigFromUserInput(option);
  const lexicalScopeRecorder = createLexicalScopeRecorder();
  const symbolScopeRecorder = createSymbolScopeRecorder();
  const strictModeScopeRecorder = createStrictModeScopeRecorder();
  const asyncArrowExprScopeRecorder = createAsyncArrowExpressionScopeRecorder();
  /** ===========================================================
   *              Public API for Parser
   *  ===========================================================
   */
  /**
   * Only Public API for parser, parse code and
   * return a program.
   * @returns {Program}
   */
  function parse(): Program {
    return parseProgram();
  }
  return { parse };
  /** ===========================================================
   *            Private API for other Parser API
   *  ===========================================================
   */
  /**
   * Private API for parser, move to next token, skip comment and
   * block comment token.
   * @returns {SyntaxKinds}
   */
  function nextToken(): SyntaxKinds {
    lexer.nextToken();
    const token = lexer.getTokenKind();
    if (token === SyntaxKinds.Comment || token == SyntaxKinds.BlockComment) {
      return nextToken();
    }
    return token;
  }
  /**
   * Private API for parser, get current token kind, skip comment
   * and block comment token
   * @returns {SyntaxKinds}
   */
  function getToken(): SyntaxKinds {
    const token = lexer.getTokenKind();
    if (token === SyntaxKinds.Comment || token == SyntaxKinds.BlockComment) {
      return nextToken();
    }
    return token;
  }
  /**
   * Private API for parser, get current token's string value.
   * @returns {string}
   */
  function getSourceValue(): string {
    return lexer.getSourceValue();
  }
  /**
   * Private API for parser, just wrapper of lexer, get start
   * position of current token.
   * @return {SourcePosition}
   */
  function getStartPosition(): SourcePosition {
    return lexer.getStartPosition();
  }
  /**
   * Private API for parser, just wrapper of lexer, get end
   * position of current token.
   * @return {SourcePosition}
   */
  function getEndPosition(): SourcePosition {
    return lexer.getEndPosition();
  }
  /**
   * Private API for parser, just wrapper of lookahead method
   * of lexer.
   * @returns
   */
  function lookahead(): LookaheadToken {
    return lexer.lookahead();
  }
  /**
   * Private API for parser, just wrapper of lexer method.
   * @returns
   */
  function readRegex() {
    return lexer.readRegex();
  }
  /**
   * Private API for parser, just wrapper of lexer method, check
   * is a line terminator in the range of last token end and start
   * of current token.
   * @returns {boolean}
   */
  function getLineTerminatorFlag(): boolean {
    return lexer.getLineTerminatorFlag();
  }
  /**
   * Private API for parser, just wrapper of lexer methid, check
   * is current token contain a unicode esc.
   */
  function getEscFlag(): boolean {
    return lexer.getEscFlag();
  }
  /**
   * Private API for parser, is current token kind match the
   * given token kind ?
   * @param {SyntaxKinds | Array<SyntaxKinds>} kind
   * @returns {boolean}
   */
  function match(kind: SyntaxKinds | Array<SyntaxKinds>): boolean {
    const currentToken = getToken();
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
  function isContextKeyword(value: string): boolean {
    if (getSourceValue() === value && getToken() === SyntaxKinds.Identifier && !lexer.getEscFlag()) {
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
  function expect(kind: SyntaxKinds | Array<SyntaxKinds>): ExpectToken {
    if (match(kind)) {
      const metaData = {
        value: getSourceValue(),
        start: getStartPosition(),
        end: getEndPosition(),
      };
      nextToken();
      return metaData;
    }
    throw createUnexpectError();
  }
  /**
   * Private API for parser, expect current token is one of given token(s),
   * it not, it will create a unexpect error, if is one of given token, it
   * will NOT eat token.
   * @param kind
   * @param message
   * @returns {void}
   */
  function expectButNotEat(kind: SyntaxKinds | Array<SyntaxKinds>): void {
    if (match(kind)) {
      return;
    }
    throw createUnexpectError();
  }
  /**
   * Private API for `shouldInsertSemi` and `isSoftInsertSemi`,
   * test is there a semi or equal syntax, return three state
   * - `SemiExisted`: there is a semi token.
   * - `SemiInsertAble`: there is a equal to semi syntax.
   * - `SemiNotExisted`: there is no semi or equal syntax,
   * @returns
   */
  function isSemiInsertable() {
    if (match(SyntaxKinds.SemiPunctuator)) {
      return "SemiExisted";
    }
    if (match([SyntaxKinds.BracesRightPunctuator, SyntaxKinds.EOFToken])) {
      return "SemiInsertAble";
    }
    if (getLineTerminatorFlag()) {
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
  function shouldInsertSemi() {
    const semiState = isSemiInsertable();
    switch (semiState) {
      case "SemiExisted":
        nextToken();
        return;
      case "SemiInsertAble":
        return;
      case "SemiNotExisted":
        // recoverable error
        raiseError(ErrorMessageMap.missing_semicolon, getStartPosition());
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
  function isSoftInsertSemi(shouldEat: boolean = true) {
    const semiState = isSemiInsertable();
    switch (semiState) {
      case "SemiExisted":
        if (shouldEat) {
          nextToken();
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
  function createMessageError(messsage: string, position?: SourcePosition) {
    if (position === undefined) position = getStartPosition();

    return new Error(`[Syntax Error]: ${messsage} (${position.row}, ${position.col})`);
  }
  /**
   * Create a error object with message tell developer that get a
   * unexpect token.
   * @returns {Error}
   */
  function createUnexpectError(): Error {
    return new Error(`[Syntax Error]: Unexpect token ${SytaxKindsMapLexicalLiteral[getToken()]}.`);
  }
  /**
   * Given that this parser is recurive decent parser, some
   * function must call with some start token, if function call
   * with unexecpt start token, it should throw this error.
   * @param {Array<SyntaxKinds>} startTokens
   * @returns {Error}
   */
  function createUnreachError(startTokens: Array<SyntaxKinds> = []): Error {
    const start = getStartPosition();
    let message = `[Unreach Zone]: this piece of code should not be reach (${start.row}, ${start.col}), have a unexpect token ${getToken()} (${getSourceValue()}).`;
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
  function disAllowInOperaotr<T>(parseCallback: () => T): T {
    context.inOperatorStack.push(false);
    const result = parseCallback();
    context.inOperatorStack.pop();
    return result;
  }
  /**
   * Private API for parse api for expression, in ECMAscript, there is
   * a syntax tranlation for in operator production rule.
   * @param parseCallback
   * @returns
   */
  function allowInOperaotr<T>(parseCallback: () => T) {
    context.inOperatorStack.push(true);
    const result = parseCallback();
    context.inOperatorStack.pop();
    return result;
  }
  /** ===========================================================
   *     Private API for other Parser API, just wrapper of recorder
   *  ===========================================================
   */

  /**
   *  please reference to recorder api
   */
  function enterFunctionScope(isAsync: boolean = false, isGenerator: boolean = false) {
    asyncArrowExprScopeRecorder.enterFunctionScope();
    strictModeScopeRecorder.enterRHSStrictModeScope();
    symbolScopeRecorder.enterFunctionSymbolScope();
    lexicalScopeRecorder.enterFunctionLexicalScope(isAsync, isGenerator);
    lexer.setStrictModeContext(isInStrictMode());
  }
  function exitFunctionScope(focusCheck: boolean) {
    const isNonSimpleParam = !isCurrentFunctionParameterListSimple();
    const isStrict = isInStrictMode();
    const symbolScope = symbolScopeRecorder.exitSymbolScope()!;
    if (isNonSimpleParam || isStrict || focusCheck) {
      const functionSymbolScope = symbolScope as FunctionSymbolScope;
      for (const symPos of functionSymbolScope.duplicateParams) {
        raiseError(ErrorMessageMap.duplicate_param, symPos);
      }
    }
    asyncArrowExprScopeRecorder.exitAsyncArrowExpressionScope();
    strictModeScopeRecorder.exitStrictModeScope();
    lexicalScopeRecorder.exitFunctionLexicalScope();
    lexer.setStrictModeContext(isInStrictMode());
  }
  function enterProgram() {
    symbolScopeRecorder.enterProgramSymbolScope();
    lexicalScopeRecorder.enterProgramLexicalScope(
      config.allowAwaitOutsideFunction || false,
      config.sourceType === "module",
    );
    lexer.setStrictModeContext(config.sourceType === "module");
  }
  function exitProgram() {
    if (!config.allowUndeclaredExports) {
      for (const pos of symbolScopeRecorder.getProgramContainUndefSymbol()) {
        raiseError(ErrorMessageMap.babel_error_export_is_not_defined, pos);
      }
    }
    symbolScopeRecorder.exitSymbolScope();
    lexicalScopeRecorder.exitProgramLexicalScope();
    lexer.setStrictModeContext(false);
  }
  function enterBlockScope() {
    lexicalScopeRecorder.enterBlockLexicalScope(false);
    symbolScopeRecorder.enterBlockSymbolScope();
  }
  function exitBlockScope() {
    lexicalScopeRecorder.exitBlockLexicalScope();
    symbolScopeRecorder.exitSymbolScope();
  }
  function enterCatchBlockScope() {
    lexicalScopeRecorder.enterBlockLexicalScope(true);
    symbolScopeRecorder.enterFunctionSymbolScope();
  }
  function exitCatchBlockScope() {
    lexicalScopeRecorder.exitBlockLexicalScope();
    symbolScopeRecorder.exitSymbolScope();
  }
  function parseAsLoop<T>(callback: () => T): T {
    lexicalScopeRecorder.enterVirtualBlockScope("Loop");
    const result = callback();
    lexicalScopeRecorder.exitVirtualBlockScope();
    return result;
  }
  function parseAsSwitch<T>(callback: () => T): T {
    lexicalScopeRecorder.enterVirtualBlockScope("Switch");
    const result = callback();
    lexicalScopeRecorder.exitVirtualBlockScope();
    return result;
  }
  function recordScope(kind: ExpressionScopeKind, position: SourcePosition) {
    strictModeScopeRecorder.record(kind, position);
    asyncArrowExprScopeRecorder.record(kind, position);
  }
  function enterArrowFunctionBodyScope(isAsync: boolean = false) {
    lexicalScopeRecorder.enterArrowFunctionBodyScope(isAsync);
    symbolScopeRecorder.enterFunctionSymbolScope();
  }
  function exitArrowFunctionBodyScope() {
    const symbolScope = symbolScopeRecorder.exitSymbolScope()!;
    const functionSymbolScope = symbolScope as FunctionSymbolScope;
    for (const symPos of functionSymbolScope.duplicateParams) {
      raiseError(ErrorMessageMap.duplicate_param, symPos);
    }
    lexicalScopeRecorder.exitArrowFunctionBodyScope();
  }
  function parseWithArrowExpressionScope<T>(callback: () => T): [T, AsyncArrowExpressionScope] {
    asyncArrowExprScopeRecorder.enterAsyncArrowExpressionScope();
    const result = callback();
    const scope = asyncArrowExprScopeRecorder.getCurrentAsyncArrowExpressionScope()!;
    asyncArrowExprScopeRecorder.exitAsyncArrowExpressionScope();
    return [result, scope];
  }
  function parseWithCatpureLayer<T>(callback: () => T): [T, StrictModeScope] {
    strictModeScopeRecorder.enterCatpureStrictModeScope();
    const result = callback();
    const scope = strictModeScopeRecorder.getCurrentStrictModeScope();
    strictModeScopeRecorder.exitStrictModeScope();
    return [result, scope];
  }
  function parseWithLHSLayer<T>(callback: () => T): T {
    strictModeScopeRecorder.enterLHSStrictModeScope();
    const result = callback();
    strictModeScopeRecorder.exitStrictModeScope();
    return result;
  }
  function parseWithLHSLayerReturnScope<T>(callback: () => T): [T, StrictModeScope] {
    strictModeScopeRecorder.enterLHSStrictModeScope();
    const result = callback();
    const scope = strictModeScopeRecorder.getCurrentStrictModeScope();
    strictModeScopeRecorder.exitStrictModeScope();
    return [result, scope];
  }
  function parseWithRHSLayer<T>(callback: () => T): T {
    strictModeScopeRecorder.enterRHSStrictModeScope();
    const result = callback();
    strictModeScopeRecorder.exitStrictModeScope();
    return result;
  }
  function checkStrictModeScopeError(scope: StrictModeScope) {
    if (isInStrictMode() && strictModeScopeRecorder.isStrictModeScopeViolateStrictMode(scope)) {
      throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
    }
  }
  function checkAsyncArrowExprScopeError(scope: AsyncArrowExpressionScope) {
    if (asyncArrowExprScopeRecorder.isAsyncArrowExpressionScopeHaveError(scope)) {
      if (scope.awaitExpressionInParameter.length > 0) {
        throw createMessageError(ErrorMessageMap.await_expression_can_not_used_in_parameter_list);
      }
      if (scope.yieldExpressionInParameter.length > 0) {
        throw createMessageError(ErrorMessageMap.yield_expression_can_not_used_in_parameter_list);
      }
      if (scope.awaitIdentifier.length > 0) {
        throw createMessageError(ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword);
      }
    }
  }
  function enterFunctionParameter() {
    lexicalScopeRecorder.enterFunctionLexicalScopeParamemter();
  }
  function existFunctionParameter() {
    lexicalScopeRecorder.exitFunctionLexicalScopeParamemter();
  }
  function setCurrentFunctionContextAsGenerator() {
    lexicalScopeRecorder.setCurrentFunctionLexicalScopeAsGenerator();
  }
  function setCurrentFunctionContextAsStrictMode() {
    lexicalScopeRecorder.setCurrentFunctionLexicalScopeAsStrictMode();
    lexer.setStrictModeContext(true);
  }
  /**
   * Private API for `For-In` parsering problem.
   * @returns {boolean}
   */
  function getCurrentInOperatorStack(): boolean {
    if (context.inOperatorStack.length === 0) {
      return false;
    }
    return context.inOperatorStack[context.inOperatorStack.length - 1];
  }
  function isTopLevel(): boolean {
    return lexicalScopeRecorder.isInTopLevel();
  }
  function isCurrentScopeParseAwaitAsExpression(): boolean {
    return lexicalScopeRecorder.canAwaitParseAsExpression();
  }
  function isCurrentScopeParseYieldAsExpression(): boolean {
    return lexicalScopeRecorder.canYieldParseAsExpression();
  }
  function isInParameter(): boolean {
    return lexicalScopeRecorder.isInParameter();
  }
  function setCurrentFunctionParameterListAsNonSimple() {
    return lexicalScopeRecorder.setCurrentFunctionLexicalScopeParameterAsNonSimple();
  }
  function isCurrentFunctionParameterListSimple(): boolean {
    return lexicalScopeRecorder.isCurrentFunctionLexicalScopeParameterSimple();
  }
  function isParentFunctionAsync(): boolean {
    return lexicalScopeRecorder.isParentFunctionAsync();
  }
  function isParentFunctionGenerator(): boolean {
    return lexicalScopeRecorder.isParentFunctionGenerator();
  }
  function enterClassScope(isExtend: boolean = false) {
    lexicalScopeRecorder.enterClassLexicalScope(isExtend);
    asyncArrowExprScopeRecorder.enterAsyncArrowExpressionScope();
    symbolScopeRecorder.enterClassSymbolScope();
  }
  function existClassScope() {
    if (symbolScopeRecorder.isDuplicatePrivateName()) {
      // TODO: make it recoverable error
      throw createMessageError(ErrorMessageMap.babel_error_private_name_duplicate);
    }
    if (symbolScopeRecorder.isUndeinfedPrivateName()) {
      // TODO: make it recoverable error
      throw createMessageError(ErrorMessageMap.babel_error_private_name_undeinfed);
    }
    lexicalScopeRecorder.exitClassLexicalScope();
    symbolScopeRecorder.exitClassSymbolScope();
    asyncArrowExprScopeRecorder.exitAsyncArrowExpressionScope();
  }
  function isInClassScope(): boolean {
    return lexicalScopeRecorder.isInClassScope();
  }
  function isCurrentClassExtend(): boolean {
    return lexicalScopeRecorder.isCurrentClassExtend();
  }
  function usePrivateName(name: string, type: PrivateNameDefKind = "other") {
    return symbolScopeRecorder.usePrivateName(name, type);
  }
  function defPrivateName(name: string, type: PrivateNameDefKind = "other") {
    return symbolScopeRecorder.defPrivateName(name, type);
  }
  function enterDelete() {
    lexicalScopeRecorder.enterDelete();
  }
  function exitDelete() {
    lexicalScopeRecorder.exitDelete();
  }
  function isInDelete() {
    return lexicalScopeRecorder.isCurrentInDelete();
  }
  function isInStrictMode(): boolean {
    return lexicalScopeRecorder.isInStrictMode();
  }
  function isDirectToFunctionContext(): boolean {
    return lexicalScopeRecorder.isDirectToFunctionContext();
  }
  function isDirectToClassScope(): boolean {
    return lexicalScopeRecorder.isDirectToClassScope();
  }
  function isReturnValidate(): boolean {
    return config.allowReturnOutsideFunction || lexicalScopeRecorder.isReturnValidate();
  }
  function isBreakValidate(): boolean {
    return lexicalScopeRecorder.isBreakValidate();
  }
  function isContinueValidate(): boolean {
    return lexicalScopeRecorder.isContinueValidate();
  }
  function canLabelReach(name: string): boolean {
    return lexicalScopeRecorder.canLabelReach(name);
  }
  function isEncloseInFunction(): boolean {
    return lexicalScopeRecorder.isEncloseInFunction();
  }
  function isInPropertyName(): boolean {
    return lexicalScopeRecorder.isInPropertyName();
  }
  function setExportContext(context: ExportContext) {
    lexicalScopeRecorder.setExportContext(context);
  }
  function getExportContext(): ExportContext {
    return lexicalScopeRecorder.getExportContext();
  }
  function takeCacheDecorator() {
    const list = context.cache.decorators;
    context.cache.decorators = null;
    return list;
  }
  function mergeDecoratorList(input1: Decorator[] | null, input2: Decorator[] | null) {
    const list = [...(input1 || []), ...(input2 || [])];
    if (list.length === 0) {
      return null;
    }
    return list;
  }
  function declarateNonFunctionalSymbol(name: string, position: SourcePosition) {
    if (isInParameter()) {
      symbolScopeRecorder.declarateParam(name, position);
      return;
    }
    if (!symbolScopeRecorder.declarateNonFunctionalSymbol(name)) {
      raiseError(ErrorMessageMap.v8_error_duplicate_identifier, position);
    }
    const isExportAlreadyExist = declarateExportSymbolIfInContext(name, position);
    if (isExportAlreadyExist) {
      raiseError(ErrorMessageMap.v8_error_duplicate_identifier, isExportAlreadyExist);
    }
    return;
  }
  function delcarateFcuntionSymbol(name: string, generator: boolean, position: SourcePosition) {
    const duplicateType = symbolScopeRecorder.declarateFuncrtionSymbol(name, generator);
    if (duplicateType) {
      if (
        (!generator &&
          ((duplicateType === SymbolType.Function && config.sourceType === "module") ||
            duplicateType === SymbolType.GenFunction)) ||
        (generator &&
          ((duplicateType === SymbolType.GenFunction && config.sourceType === "module") ||
            duplicateType === SymbolType.Function)) ||
        (duplicateType === SymbolType.Var && lexicalScopeRecorder.isInCatch()) ||
        duplicateType === SymbolType.Let ||
        duplicateType === SymbolType.Const
      )
        raiseError(ErrorMessageMap.v8_error_duplicate_identifier, position);
    }
    const isExportAlreadyExist = declarateExportSymbolIfInContext(name, position);
    if (isExportAlreadyExist) {
      raiseError(ErrorMessageMap.v8_error_duplicate_identifier, isExportAlreadyExist);
    }
    return;
  }
  function declarateLetSymbol(name: string, position: SourcePosition) {
    if (!symbolScopeRecorder.declarateLetSymbol(name)) {
      raiseError(ErrorMessageMap.v8_error_duplicate_identifier, position);
    }
    const isExportAlreadyExist = declarateExportSymbolIfInContext(name, position);
    if (isExportAlreadyExist) {
      raiseError(ErrorMessageMap.v8_error_duplicate_identifier, isExportAlreadyExist);
    }
  }
  function declarateParam(name: string, position: SourcePosition) {
    symbolScopeRecorder.declarateParam(name, position);
    declarateExportSymbolIfInContext(name, position);
    return;
  }
  function declarateExportSymbolIfInContext(name: string, position: SourcePosition) {
    switch (getExportContext()) {
      case ExportContext.NotInExport:
        return null;
      case ExportContext.InExport: {
        setExportContext(ExportContext.NotInExport);
        return declarateExportSymbol(name, position);
      }
      case ExportContext.InExportBinding: {
        return declarateExportSymbol(name, position);
      }
    }
  }
  function declarateExportSymbol(name: string, position: SourcePosition) {
    return symbolScopeRecorder.declarateExportSymbol(name, position);
  }
  function isVariableDeclarated(name: string) {
    return symbolScopeRecorder.isVariableDeclarated(name);
  }
  function getSymbolType() {
    return symbolScopeRecorder.getSymbolType() as NonFunctionalSymbolType;
  }
  function setSymbolType(symbolType: NonFunctionalSymbolType) {
    symbolScopeRecorder.setSymbolType(symbolType);
  }
  /**
   * Raise a error, if config recoverable set to false, it will throw a error and
   * cause stack unwidning.
   * @param message
   * @param position
   */
  function raiseError(message: string, position: SourcePosition) {
    errorhandler.pushSyntaxErrors({
      message,
      position,
    });
  }
  /** ===========================================================
   *            Parser internal Parse API
   *  ===========================================================
   */
  /** ==================================================
   *  Top level parse function
   *  ==================================================
   */
  function parseProgram() {
    const body: Array<ModuleItem> = [];
    enterProgram();
    while (!match(SyntaxKinds.EOFToken)) {
      body.push(parseModuleItem());
    }
    for (const propertyHasInit of context.propertiesInitSet) {
      raiseError(ErrorMessageMap.Syntax_error_Invalid_shorthand_property_initializer, propertyHasInit.start);
    }
    for (const duplicateProto of context.propertiesProtoDuplicateSet) {
      raiseError(
        ErrorMessageMap.syntax_error_property_name__proto__appears_more_than_once_in_object_literal,
        duplicateProto.start,
      );
    }
    exitProgram();
    return Factory.createProgram(
      body,
      body.length === 0 ? getStartPosition() : cloneSourcePosition(body[0].start),
      getEndPosition(),
    );
  }
  function parseModuleItem(): ModuleItem {
    if (match(SyntaxKinds.AtPunctuator)) {
      parseDecoratorListToCache();
    }
    const token = getToken();
    switch (token) {
      case SyntaxKinds.ImportKeyword: {
        const { kind } = lookahead();
        if (kind === SyntaxKinds.DotOperator || kind === SyntaxKinds.ParenthesesLeftPunctuator) {
          return parseStatementListItem();
        }
        return parseImportDeclaration();
      }
      case SyntaxKinds.ExportKeyword:
        return parseExportDeclaration();
      default:
        return parseStatementListItem();
    }
  }
  function parseStatementListItem(): StatementListItem {
    const token = getToken();
    switch (token) {
      // 'aync' maybe is
      // 1. aync function  -> declaration
      // 2. aync arrow function -> statement(expressionStatement)
      // 3. identifer -> statement (expressionStatement)
      case SyntaxKinds.ConstKeyword:
      case SyntaxKinds.FunctionKeyword:
      case SyntaxKinds.ClassKeyword:
      case SyntaxKinds.AtPunctuator:
        return parseDeclaration();
      case SyntaxKinds.Identifier:
        if (isContextKeyword("async")) {
          const { kind, lineTerminatorFlag: flag } = lookahead();
          if (kind === SyntaxKinds.FunctionKeyword && flag == false) {
            nextToken();
            return parseFunctionDeclaration(true);
          }
        }
        return parseStatement();
      case SyntaxKinds.LetKeyword:
        if (isLetPossibleIdentifier()) {
          return parseStatement();
        }
        return parseDeclaration();
      default:
        return parseStatement();
    }
  }
  function isLetPossibleIdentifier() {
    const { kind: kind } = lookahead();
    if (
      kind === SyntaxKinds.BracesLeftPunctuator || // object pattern
      kind === SyntaxKinds.BracketLeftPunctuator || // array pattern
      kind === SyntaxKinds.Identifier || // id
      kind === SyntaxKinds.AwaitKeyword ||
      kind === SyntaxKinds.YieldKeyword
    ) {
      return false;
    }
    return true;
  }
  /**
   * Parse Declaration
   *
   * ```
   *  Declaration := ('let' | 'const') BindingLst
   *              := FunctionDeclaration
   *              := FunctionGeneratorDeclaration
   *              := 'async' FunctionDeclaration
   *              := 'async' FunctionGeneratorDeclaration
   *              := ClassDeclaration
   * ```
   * when call parseDeclaration, please make sure currentToken is
   * - `let` or `const` keyword
   * - `function` keyword
   * - `class` keyword
   * - `async` with `function` keyword
   *
   * ref: https://tc39.es/ecma262/#prod-Declaration
   * @returns
   */
  function parseDeclaration(): Declaration {
    const token = getToken();
    switch (token) {
      // async function declaration
      case SyntaxKinds.Identifier:
        if (isContextKeyword("async")) {
          nextToken();
          if (getLineTerminatorFlag()) {
            raiseError(ErrorMessageMap.missing_semicolon, getStartPosition());
          }
          return parseFunctionDeclaration(true);
        } else {
          throw createUnreachError();
        }
      // function delcaration
      case SyntaxKinds.FunctionKeyword:
        return parseFunctionDeclaration(false);
      case SyntaxKinds.ConstKeyword:
      case SyntaxKinds.LetKeyword:
        return parseVariableDeclaration();
      case SyntaxKinds.AtPunctuator:
        return parseClassDeclaration(parseDecoratorList());
      case SyntaxKinds.ClassKeyword:
        return parseClassDeclaration(null);
      default:
        throw createUnreachError([
          SyntaxKinds.ClassKeyword,
          SyntaxKinds.FunctionKeyword,
          SyntaxKinds.LetKeyword,
          SyntaxKinds.ConstKeyword,
        ]);
    }
  }
  /**
   * ref: https://tc39.es/ecma262/#prod-Statement
   */
  function parseStatement(): Statement {
    const token = getToken();
    switch (token) {
      case SyntaxKinds.SwitchKeyword:
        return parseSwitchStatement();
      case SyntaxKinds.ContinueKeyword:
        return parseContinueStatement();
      case SyntaxKinds.BreakKeyword:
        return parseBreakStatement();
      case SyntaxKinds.ReturnKeyword:
        return parseReturnStatement();
      case SyntaxKinds.BracesLeftPunctuator:
        return parseBlockStatement();
      case SyntaxKinds.TryKeyword:
        return parseTryStatement();
      case SyntaxKinds.ThrowKeyword:
        return parseThrowStatement();
      case SyntaxKinds.WithKeyword:
        return parseWithStatement();
      case SyntaxKinds.DebuggerKeyword:
        return parseDebuggerStatement();
      case SyntaxKinds.SemiPunctuator:
        return parseEmptyStatement();
      case SyntaxKinds.IfKeyword:
        return parseIfStatement();
      case SyntaxKinds.ForKeyword:
        return parseForStatement();
      case SyntaxKinds.WhileKeyword:
        return parseWhileStatement();
      case SyntaxKinds.DoKeyword:
        return parseDoWhileStatement();
      case SyntaxKinds.VarKeyword:
        return parseVariableDeclaration();
      default:
        if (match(SyntaxKinds.Identifier) && lookahead().kind === SyntaxKinds.ColonPunctuator) {
          return parseLabeledStatement();
        }
        return parseExpressionStatement();
    }
  }
  /**
   * This is a critial helper function for transform expression (major is ObjectExpression
   * and ArrayExpression) to Pattern (`BindingObjectPattern`, `BindingArrayPattern`, `AssignmentObjectPattern`
   * `AssignmentArrayPattern`).
   *
   * ### Use Case : ParseAssignmentExpression
   * This function is used when `parseAssignmentExpression`, because parseAssignmentExpression
   * would parse left as expression first, when left is followed by assignment operator, we need
   * to transform expression to AssignmentPattern.
   *
   * ### Use Case : ParseArrowFunctionExpression
   * When `parseArrowFunctionExpression`, it would use this function too. Because `parseArrowFunctionExpresssion`
   * might accept argument (array of `AssignmentExpression`) as param, so we need to transform arguments to function
   * parameter, which is transform `AssignmenExpression` to `BiningElement`(`Identifier` or `BindingPattern`).
   *
   * ### Paramemter: isBinding
   * Most of BindingPattern and AssignmentPattern's production rule is alike, one key different is that BindingPattern
   * `PropertyName` can only have `BindingElement`, but `PropertyName` of AssignmentPattern can have LeftHandSideExpression
   * so we add a param `isBinding` to determinate is transform to BindingPattern or not.
   * @param {Expression} expr target for transform to Pattern
   * @param {boolean} isBinding Is transform to BindingPattern
   */
  function exprToPattern(expr: Expression, isBinding: boolean): Pattern {
    // TODO, remove impl function.
    return exprToPatternImpl(expr, isBinding);
  }
  function exprToPatternImpl(node: Expression, isBinding: boolean): Pattern {
    /**
     * parentheses in pattern only allow in Assignment Pattern
     * for MemberExpression and Identifier
     */
    if (node.parentheses) {
      if (isBinding || (!isBinding && !isMemberExpression(node) && !isIdentifer(node)))
        // recoverable error
        raiseError(ErrorMessageMap.babel_error_invalid_parenthesized_pattern, node.start);
    }
    switch (node.kind) {
      case SyntaxKinds.AssigmentExpression: {
        return assignmentExpressionToAssignmentPattern(node, isBinding);
      }
      case SyntaxKinds.SpreadElement: {
        return spreadElementToFunctionRestParameter(node);
      }
      case SyntaxKinds.ArrayExpression: {
        return arrayExpressionToArrayPattern(node, isBinding);
      }
      case SyntaxKinds.ObjectExpression: {
        return objectExpressionToObjectPattern(node, isBinding);
      }
      case SyntaxKinds.Identifier:
        declarateSymbolInBindingPatternAsParam(node.name, isBinding, node.start);
        return node as Identifier;
      case SyntaxKinds.MemberExpression:
        if (!isBinding) {
          return node as Pattern;
        }
      // fall to error
      // eslint-disable-next-line no-fallthrough
      default:
        throw createMessageError(ErrorMessageMap.syntax_error_invalid_assignment_left_hand_side);
    }
  }
  /**
   * ## Transform Assignment Expression
   * @param expr
   * @param isBinding
   * @returns
   */
  function assignmentExpressionToAssignmentPattern(expr: AssigmentExpression, isBinding: boolean) {
    const left = isBinding ? helperCheckPatternWithBinding(expr.left) : expr.left;
    if (expr.operator !== SyntaxKinds.AssginOperator) {
      throw createMessageError(ErrorMessageMap.syntax_error_invalid_assignment_left_hand_side);
    }
    return Factory.createAssignmentPattern(left as Pattern, expr.right, expr.start, expr.end);
  }
  /**
   *
   * @param leftValue
   * @param isBinding
   * @returns
   */
  function helperCheckPatternWithBinding(leftValue: Pattern): Pattern {
    if (isObjectPattern(leftValue)) {
      for (const property of leftValue.properties) {
        if (isObjectPatternProperty(property)) {
          if (property.value && isMemberExpression(property.value)) {
            raiseError(ErrorMessageMap.babel_error_binding_member_expression, property.start);
          }
          if (
            property.value &&
            (isMemberExpression(property.value) || isIdentifer(property.value)) &&
            property.value.parentheses
          ) {
            // recoverable error
            raiseError(ErrorMessageMap.babel_error_invalid_parenthesized_pattern, leftValue.start);
          }
        }
      }
      return leftValue;
    }
    if (isAssignmentPattern(leftValue)) {
      helperCheckPatternWithBinding(leftValue.left);
      return leftValue;
    }
    if (isRestElement(leftValue)) {
      helperCheckPatternWithBinding(leftValue.argument);
      return leftValue;
    }
    if (isArrayPattern(leftValue)) {
      for (const pat of leftValue.elements) {
        if (pat) {
          helperCheckPatternWithBinding(pat);
        }
      }
    }
    if (isMemberExpression(leftValue) || isIdentifer(leftValue)) {
      if (leftValue.parentheses) {
        // recoverable error
        raiseError(ErrorMessageMap.babel_error_invalid_parenthesized_pattern, leftValue.start);
      }
    }
    return leftValue;
  }
  /**
   * ## Transform `SpreadElement` to RestElement in function param
   *
   * Accoring to production rule, `FunctionRestParameter` is just alias
   * of `BindingRestElement` which be used in ArrayPattern.
   * @param spreadElement
   * @returns
   */
  function spreadElementToFunctionRestParameter(spreadElement: SpreadElement) {
    return spreadElementToArrayRestElement(spreadElement, true);
  }
  /**
   * ## Transform `ArrayExpression` to `ArrayPattern`
   * @param elements
   * @param isBinding
   * @returns
   */
  function arrayExpressionToArrayPattern(expr: ArrayExpression, isBinding: boolean): ArrayPattern {
    const arrayPatternElements: Array<Pattern | null> = [];
    const restElementIndexs = [];
    for (let index = 0; index < expr.elements.length; ++index) {
      const element = expr.elements[index];
      if (!element) {
        arrayPatternElements.push(null);
        continue;
      }
      if (isSpreadElement(element)) {
        arrayPatternElements.push(spreadElementToArrayRestElement(element, isBinding));
        restElementIndexs.push(index);
        continue;
      }
      arrayPatternElements.push(exprToPattern(element, isBinding));
    }
    if (
      restElementIndexs.length > 1 ||
      (restElementIndexs.length === 1 &&
        (restElementIndexs[0] !== arrayPatternElements.length - 1 || expr.trailingComma))
    ) {
      throw createMessageError(ErrorMessageMap.syntax_error_parameter_after_rest_parameter);
    }
    return Factory.createArrayPattern(arrayPatternElements, expr.start, expr.end);
  }
  /**
   * ## Transform `SpreadElement` in ArrayPattern
   * This function transform spread element to following two production rule AST:
   *
   * - `BindingRestElement` in  `ArrayBindingPattern`
   * - `AssignmentRestElement` in `ArrayAssignmentPattern`
   *
   * According to production rule, `BindingRestElement`'s argument can only be identifier or ObjectPattern
   * or ArrayPattern, and argument of `AssignmentRestProperty` can only be identifier or memberExpression.
   * ```
   * BindingRestElement := ... BindingIdentifier
   *                    := ... BindingPattern
   * AssignmentRestElement :=... DestructuringAssignmentTarget
   * ```
   * @param spreadElement
   * @param isBinding
   */
  function spreadElementToArrayRestElement(spreadElement: SpreadElement, isBinding: boolean): RestElement {
    const argument = exprToPattern(spreadElement.argument, isBinding);
    if (isAssignmentPattern(argument)) {
      // recoverable error
      raiseError(
        ErrorMessageMap.v8_error_rest_assignment_property_must_be_followed_by_an_identifier_in_declaration_contexts,
        argument.start,
      );
    }
    return Factory.createRestElement(argument, spreadElement.start, argument.end);
  }
  /**
   * ## Transform `ObjectExpression` To `ObjectPattern`
   * @param properties
   * @param isBinding
   * @returns
   */
  function objectExpressionToObjectPattern(expr: ObjectExpression, isBinding: boolean): ObjectPattern {
    const objectPatternProperties: Array<ObjectPatternProperty | AssignmentPattern | RestElement> = [];
    const restElementIndexs = [];
    for (let index = 0; index < expr.properties.length; ++index) {
      const property = expr.properties[index];
      switch (property.kind) {
        case SyntaxKinds.ObjectProperty:
          objectPatternProperties.push(ObjectPropertyToObjectPatternProperty(property, isBinding));
          break;
        case SyntaxKinds.SpreadElement:
          restElementIndexs.push(index);
          objectPatternProperties.push(spreadElementToObjectRestElement(property, isBinding));
          break;
        default:
          throw createMessageError(ErrorMessageMap.invalid_left_value);
      }
    }
    if (
      restElementIndexs.length > 1 ||
      (restElementIndexs.length === 1 &&
        (restElementIndexs[0] !== objectPatternProperties.length - 1 || expr.trailingComma))
    ) {
      raiseError(ErrorMessageMap.syntax_error_parameter_after_rest_parameter, expr.end);
    }
    return Factory.createObjectPattern(objectPatternProperties, expr.start, expr.end);
  }
  /**
   * ## Transform `SpreadElement` in ObjectPattern
   * This function transform spread element to following two production rule AST:
   *
   * - `BindingRestProperty` in BindingObjectPattern
   * - `AssignmentRestProperty` in AssignObjectPattern
   *
   * According to production rule, `BindingRestProperty`'s argument can only be identifier,
   * and argument of `AssignmentRestProperty` can only be identifier or memberExpression.
   * ```
   * BindingRestProperty := ... BindingIdentifier
   * AssignmentRestProperty:= ... DestructuringAssignmentTarget
   * ```
   */
  function spreadElementToObjectRestElement(spreadElement: SpreadElement, isBinding: boolean): RestElement {
    const argument = exprToPattern(spreadElement.argument, isBinding);
    if (isBinding) {
      if (!isIdentifer(argument)) {
        // recoverable error
        raiseError(
          ErrorMessageMap.v8_error_rest_binding_property_must_be_followed_by_an_identifier_in_declaration_contexts,
          argument.start,
        );
      }
    } else {
      if (!isIdentifer(argument) && !isMemberExpression(argument)) {
        // recoverable error
        raiseError(
          ErrorMessageMap.v8_error_rest_assignment_property_must_be_followed_by_an_identifier_in_declaration_contexts,
          argument.start,
        );
      }
    }
    return Factory.createRestElement(argument, spreadElement.start, argument.end);
  }
  function ObjectPropertyToObjectPatternProperty(
    objectPropertyNode: ObjectProperty,
    isBinding = false,
  ): ObjectPatternProperty | AssignmentPattern {
    // object property's value can not has parentheses.
    if (objectPropertyNode.value && objectPropertyNode.value.parentheses && isBinding) {
      // recoverable error
      raiseError(ErrorMessageMap.babel_error_invalid_parenthesized_pattern, objectPropertyNode.start);
    }
    if (context.propertiesProtoDuplicateSet.has(objectPropertyNode.key)) {
      context.propertiesProtoDuplicateSet.delete(objectPropertyNode.key);
    }
    // When a property name is a CoverInitializedName, we need to cover to assignment pattern
    if (context.propertiesInitSet.has(objectPropertyNode) && !objectPropertyNode.shorted) {
      context.propertiesInitSet.delete(objectPropertyNode);
      if (objectPropertyNode.computed || !isIdentifer(objectPropertyNode.key)) {
        // property name of assignment pattern can not use computed propertyname or literal
        throw createMessageError(
          ErrorMessageMap.assignment_pattern_left_value_can_only_be_idenifier_or_pattern,
        );
      }
      declarateSymbolInBindingPatternAsParam(
        objectPropertyNode.key.name,
        isBinding,
        objectPropertyNode.start,
      );
      return Factory.createAssignmentPattern(
        objectPropertyNode.key,
        objectPropertyNode.value as Expression,
        objectPropertyNode.start,
        objectPropertyNode.end,
      );
    }
    const patternValue = !objectPropertyNode.value
      ? objectPropertyNode.value
      : exprToPatternImpl(objectPropertyNode.value, isBinding);
    // for binding pattern, member expression is not allow
    //  - for assignment pattern: value production rule is `DestructuringAssignmentTarget`, which just a LeftHandSideExpression
    //  - for binding pattern: value production rule is `BindingElement`, which only can be object-pattern, array-pattern, id.
    if (isBinding && patternValue && isMemberExpression(patternValue)) {
      raiseError(ErrorMessageMap.babel_error_binding_member_expression, patternValue.start);
    }
    return Factory.createObjectPatternProperty(
      objectPropertyNode.key,
      patternValue,
      objectPropertyNode.computed,
      objectPropertyNode.shorted,
      objectPropertyNode.start,
      objectPropertyNode.end,
    );
  }
  function declarateSymbolInBindingPatternAsParam(
    name: string,
    isBinding: boolean,
    position: SourcePosition,
  ) {
    if (isBinding) {
      declarateParam(name, position);
    }
  }
  /**
   * Parse For-related Statement, include ForStatement, ForInStatement, ForOfStatement.
   *
   * This function is pretty complex and hard to understand, some function's flag is only
   * used in this function. ex: allowIn flag of parseExpression, parseAssignmentExpression.
   * @returns {ForStatement | ForInStatement | ForOfStatement}
   */
  function parseForStatement(): ForStatement | ForInStatement | ForOfStatement {
    // symbolScopeRecorder.enterPreBlockScope();
    symbolScopeRecorder.enterBlockSymbolScope();
    const { start: keywordStart } = expect(SyntaxKinds.ForKeyword);
    // First, parse await modifier and lefthandside or init of for-related statement,
    // init might start with let, const, var keyword, but if is let keyword need to
    // lookahead to determinate is identifier.
    // delcaration in there should not eat semi, becuase semi is seperator of ForStatement,
    // and might not need init for pattern, because maybe used by ForIn or ForOf.
    // If not start with let, var or const keyword, it should be expression, but this
    // expression can not take `in` operator as operator in toplevel, so we need pass
    // false to disallow parseExpression to take in  as operator
    let isAwait: SourcePosition | null = null,
      isParseLetAsExpr = false,
      leftOrInit: VariableDeclaration | Expression | null = null;
    if (match(SyntaxKinds.AwaitKeyword)) {
      isAwait = getStartPosition();
      nextToken();
      if (!config.allowAwaitOutsideFunction && !isCurrentScopeParseAwaitAsExpression()) {
        throw createMessageError(ErrorMessageMap.await_can_not_call_if_not_in_async);
      }
    }
    expect(SyntaxKinds.ParenthesesLeftPunctuator);
    if (match([SyntaxKinds.LetKeyword, SyntaxKinds.ConstKeyword, SyntaxKinds.VarKeyword])) {
      if (match(SyntaxKinds.LetKeyword) && isLetPossibleIdentifier()) {
        isParseLetAsExpr = true;
        leftOrInit = parseExpressionDisallowIn();
      } else {
        leftOrInit = disAllowInOperaotr(() => parseVariableDeclaration(true));
      }
    } else if (match(SyntaxKinds.SemiPunctuator)) {
      // for test case `for(;;)`
      leftOrInit = null;
    } else {
      leftOrInit = parseExpressionDisallowIn();
    }
    // Second is branching part, determinate the branch by following token
    // - if start with semi it should be ForStatement,
    // - if is in operator, it should be ForInStatement,
    // - if is of contextual keyword, it should be ForOfStatement.
    // then according to branch case, parse the following part and do the
    // sematic check.
    // - ForStatement: if init is variable declaration pattern, it need init.
    // - ForInStatement: if left is variable decalration, must not have init, and delcaration length must be 1.
    //                   then if left is expression, must transform it to pattern.
    // - ForOfStatement: same as ForInStatement.
    // There is one case that even we disallow in operator in top level, there maybe
    // wrong init of expression like `for(a = 0 in []);` or `for(a=0 of [])` which would
    // make leftOrInit parse all token in () as a expression, so we need to check if those
    // case happend.
    if (match(SyntaxKinds.SemiPunctuator)) {
      if (isAwait) {
        // recoverable error
        raiseError(ErrorMessageMap.extra_error_for_await_not_of_loop, isAwait);
      }
      if (leftOrInit && isVarDeclaration(leftOrInit)) {
        for (const delcar of leftOrInit.declarations) {
          if ((isArrayPattern(delcar.id) || isObjectPattern(delcar.id)) && !delcar.init) {
            // recoverable error
            raiseError(ErrorMessageMap.babel_error_destructing_pattern_must_need_initializer, delcar.start);
          }
        }
      }
      nextToken();
      let test: Expression | null = null,
        update: Expression | null = null;
      if (!match(SyntaxKinds.SemiPunctuator)) {
        test = parseExpressionAllowIn();
      }
      expect(SyntaxKinds.SemiPunctuator);
      if (!match(SyntaxKinds.ParenthesesRightPunctuator)) {
        update = parseExpressionAllowIn();
      }
      expect(SyntaxKinds.ParenthesesRightPunctuator);
      const body = parseForStatementBody();
      const forStatement = Factory.createForStatement(
        body,
        leftOrInit,
        test,
        update,
        keywordStart,
        cloneSourcePosition(body.end),
      );
      staticSematicEarlyErrorForFORStatement(forStatement);
      return forStatement;
    }
    // unreach case, even if syntax error, when leftOrInit, it must match semi token.
    // and because it match semi token, if would enter forStatement case, will not
    // reach there. even syntax error, error would be throw at parseExpression or
    // parseDeclaration.
    if (!leftOrInit) {
      throw createUnreachError();
    }
    // for case `for(a = 0 of [])`; leftOrInit would parse all token before `of` as one expression
    // in this case , leftOrInit would be a assignment expression, and when it pass to toAssignment
    // function, it would transform to assignment pattern, so we need to checko if there is Assignment
    // pattern, it is , means original is assignment expression, it should throw a error.
    if (!isVarDeclaration(leftOrInit)) {
      leftOrInit = exprToPattern(leftOrInit, false) as Expression;
      if (isAssignmentPattern(leftOrInit)) {
        throw createMessageError(ErrorMessageMap.invalid_left_value);
      }
    }
    // branch case for `for-in` statement
    if (match(SyntaxKinds.InKeyword)) {
      if (isAwait) {
        // recoverable error
        raiseError(ErrorMessageMap.extra_error_for_await_not_of_loop, isAwait);
      }
      if (isVarDeclaration(leftOrInit)) {
        helperCheckDeclarationmaybeForInOrForOfStatement(leftOrInit, "ForIn");
      }
      nextToken();
      const right = parseExpressionAllowIn();
      expect(SyntaxKinds.ParenthesesRightPunctuator);
      const body = parseForStatementBody();
      const forInStatement = Factory.createForInStatement(
        leftOrInit,
        right,
        body,
        keywordStart,
        cloneSourcePosition(body.end),
      );
      staticSematicEarlyErrorForFORStatement(forInStatement);
      return forInStatement;
    }
    // branch case for `for-of` statement
    if (isContextKeyword("of")) {
      if (isVarDeclaration(leftOrInit)) {
        helperCheckDeclarationmaybeForInOrForOfStatement(leftOrInit, "ForOf");
      }
      if (isParseLetAsExpr) {
        throw createMessageError(ErrorMessageMap.extra_error_for_of_can_not_use_let_as_identifier);
      }
      nextToken();
      const right = parseAssignmentExpressionAllowIn();
      expect(SyntaxKinds.ParenthesesRightPunctuator);
      const body = parseForStatementBody();
      const forOfStatement = Factory.createForOfStatement(
        !!isAwait,
        leftOrInit,
        right,
        body,
        keywordStart,
        cloneSourcePosition(body.end),
      );
      staticSematicEarlyErrorForFORStatement(forOfStatement);
      return forOfStatement;
    }
    throw createUnexpectError();
  }
  function parseForStatementBody(): Statement {
    const stmt = parseAsLoop(parseStatement);
    symbolScopeRecorder.exitSymbolScope();
    return stmt;
  }
  function staticSematicEarlyErrorForFORStatement(statement: ForStatement | ForInStatement | ForOfStatement) {
    if (checkIsLabelledFunction(statement.body)) {
      raiseError(ErrorMessageMap.syntax_error_functions_cannot_be_labelled, statement.body.start);
    }
  }
  /**
   * Helper function for check sematic error of VariableDeclaration of ForInStatement and ForOfStatement,
   * please reference to comment in parseForStatement.
   * @param {VariableDeclaration} declaration
   */
  function helperCheckDeclarationmaybeForInOrForOfStatement(
    declaration: VariableDeclaration,
    kind: "ForIn" | "ForOf",
  ) {
    if (declaration.declarations.length > 1) {
      // recoverable error
      raiseError(
        ErrorMessageMap.v8_error_Invalid_left_hand_side_in_for_in_loop_must_have_a_single_binding,
        declaration.start,
      );
    }
    const delcarationVariant = declaration.variant;
    const onlyDeclaration = declaration.declarations[0];
    if (kind === "ForIn") {
      if (onlyDeclaration.init !== null) {
        if (delcarationVariant === "var" && !isInStrictMode() && isIdentifer(onlyDeclaration.id)) {
          return;
        }
        // recoverable error
        raiseError(
          ErrorMessageMap.syntax_error_for_in_loop_head_declarations_may_not_have_initializer,
          onlyDeclaration.start,
        );
      }
    } else {
      if (onlyDeclaration.init !== null) {
        // recoverable error
        raiseError(
          ErrorMessageMap.syntax_error_for_of_loop_variable_declaration_may_not_have_an_initializer,
          onlyDeclaration.init.start,
        );
      }
    }
  }
  function parseIfStatement(): IfStatement {
    const { start: keywordStart } = expect(SyntaxKinds.IfKeyword);
    expect(SyntaxKinds.ParenthesesLeftPunctuator);
    const test = parseExpressionAllowIn();
    expect(SyntaxKinds.ParenthesesRightPunctuator);
    const consequnce = parseStatement();
    if (match(SyntaxKinds.ElseKeyword)) {
      nextToken();
      const alter = parseStatement();
      return Factory.createIfStatement(test, consequnce, alter, keywordStart, cloneSourcePosition(alter.end));
    }
    const ifStatement = Factory.createIfStatement(
      test,
      consequnce,
      null,
      keywordStart,
      cloneSourcePosition(consequnce.end),
    );
    staticSematicEarlyErrorForIfStatement(ifStatement);
    return ifStatement;
  }
  function staticSematicEarlyErrorForIfStatement(statement: IfStatement) {
    if (checkIsLabelledFunction(statement.conseqence)) {
      raiseError(ErrorMessageMap.syntax_error_functions_cannot_be_labelled, statement.conseqence.start);
    }
    if (statement.alternative && checkIsLabelledFunction(statement.alternative)) {
      raiseError(ErrorMessageMap.syntax_error_functions_cannot_be_labelled, statement.alternative.start);
    }
  }
  function parseWhileStatement(): WhileStatement {
    const { start: keywordStart } = expect(SyntaxKinds.WhileKeyword);
    expect(SyntaxKinds.ParenthesesLeftPunctuator);
    const test = parseExpressionAllowIn();
    expect(SyntaxKinds.ParenthesesRightPunctuator);
    const body = parseAsLoop(parseStatement);
    const whileStatement = Factory.createWhileStatement(
      test,
      body,
      keywordStart,
      cloneSourcePosition(body.end),
    );
    staticSematicEarlyErrorForWhileStatement(whileStatement);
    return whileStatement;
  }
  function checkIsLabelledFunction(statement: Statement) {
    while (statement.kind === SyntaxKinds.LabeledStatement) {
      if (statement.body.kind === SyntaxKinds.FunctionDeclaration) {
        return true;
      }
      statement = statement.body;
    }
  }
  function staticSematicEarlyErrorForWhileStatement(statement: WhileStatement) {
    if (checkIsLabelledFunction(statement.body)) {
      // recoverable error
      raiseError(ErrorMessageMap.syntax_error_functions_cannot_be_labelled, statement.body.start);
    }
  }
  function parseDoWhileStatement(): DoWhileStatement {
    const { start: keywordStart } = expect(SyntaxKinds.DoKeyword);
    const body = parseAsLoop(parseStatement);
    expect(SyntaxKinds.WhileKeyword);
    expect(SyntaxKinds.ParenthesesLeftPunctuator);
    const test = parseExpressionAllowIn();
    const { end: punctEnd } = expect(SyntaxKinds.ParenthesesRightPunctuator);
    isSoftInsertSemi();
    const doWhileStatement = Factory.createDoWhileStatement(test, body, keywordStart, punctEnd);
    staticSematicEarlyErrorForDoWhileStatement(doWhileStatement);
    return doWhileStatement;
  }
  function staticSematicEarlyErrorForDoWhileStatement(statement: DoWhileStatement) {
    if (checkIsLabelledFunction(statement.body)) {
      // recoverable error
      raiseError(ErrorMessageMap.syntax_error_functions_cannot_be_labelled, statement.body.start);
    }
  }
  function parseBlockStatement() {
    const { start: puncStart } = expect(SyntaxKinds.BracesLeftPunctuator);
    enterBlockScope();
    const body: Array<StatementListItem> = [];
    while (!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
      body.push(parseStatementListItem());
    }
    exitBlockScope();
    const { end: puncEnd } = expect(SyntaxKinds.BracesRightPunctuator);
    return Factory.createBlockStatement(body, puncStart, puncEnd);
  }
  function parseSwitchStatement() {
    const { start: keywordStart } = expect(SyntaxKinds.SwitchKeyword);
    expect(SyntaxKinds.ParenthesesLeftPunctuator);
    const discriminant = parseExpressionAllowIn();
    expect(SyntaxKinds.ParenthesesRightPunctuator);
    const { nodes, end } = parseAsSwitch(parseSwitchCases);
    return Factory.createSwitchStatement(discriminant, nodes, keywordStart, end);
  }
  function parseSwitchCases(): ASTArrayWithMetaData<SwitchCase> {
    enterBlockScope();
    const { start } = expect(SyntaxKinds.BracesLeftPunctuator);
    const cases: Array<SwitchCase> = [];
    let haveDefault = false;
    while (!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
      let test: Expression | null = null;
      const start = getStartPosition();
      if (match(SyntaxKinds.CaseKeyword)) {
        nextToken();
        test = parseExpressionAllowIn();
      } else if (match(SyntaxKinds.DefaultKeyword)) {
        const start = getStartPosition();
        nextToken();
        if (haveDefault) {
          // recoverable error
          raiseError(ErrorMessageMap.v8_error_more_than_one_default_clause_in_switch_statement, start);
        } else {
          haveDefault = true;
        }
      }
      expect(SyntaxKinds.ColonPunctuator);
      const consequence: Array<StatementListItem> = [];
      while (
        !match([
          SyntaxKinds.BracesRightPunctuator,
          SyntaxKinds.EOFToken,
          SyntaxKinds.CaseKeyword,
          SyntaxKinds.DefaultKeyword,
        ])
      ) {
        consequence.push(parseStatementListItem());
      }
      const end = getStartPosition();
      cases.push(Factory.createSwitchCase(test, consequence, start, end));
    }
    const { end } = expect(SyntaxKinds.BracesRightPunctuator);
    exitBlockScope();
    return {
      nodes: cases,
      start,
      end,
    };
  }
  function parseContinueStatement(): ContinueStatement {
    const { start: keywordStart, end: keywordEnd } = expect(SyntaxKinds.ContinueKeyword);
    staticSematicEarlyErrorForContinueStatement(keywordStart);
    if (match(SyntaxKinds.Identifier) && !getLineTerminatorFlag()) {
      const id = parseIdentifierReference();
      shouldInsertSemi();
      staticSematicEarlyErrorForLabelInContinueStatement(id);
      return Factory.createContinueStatement(id, keywordStart, cloneSourcePosition(id.end));
    }
    shouldInsertSemi();
    return Factory.createContinueStatement(null, keywordStart, keywordEnd);
  }
  function staticSematicEarlyErrorForContinueStatement(start: SourcePosition) {
    if (!isContinueValidate()) {
      // recoverable error
      raiseError(ErrorMessageMap.syntax_error_continue_must_be_inside_loop, start);
    }
  }
  function staticSematicEarlyErrorForLabelInContinueStatement(label: Identifier) {
    if (!canLabelReach(label.name)) {
      // recoverable error
      raiseError(ErrorMessageMap.syntax_error_label_not_found, label.start);
    }
  }
  /**
   * Parse Break Statement.
   * ```
   * BreakStatement := break;
   *                := break [no lineTerminator] LabeledIdentifier;
   * ```
   * @returns {BreakStatement}
   */
  function parseBreakStatement(): BreakStatement {
    const { start, end } = expect(SyntaxKinds.BreakKeyword);
    if (match(SyntaxKinds.Identifier) && !getLineTerminatorFlag()) {
      const label = parseIdentifierReference();
      shouldInsertSemi();
      staticSematicEarlyErrorForLabelInBreakStatement(label);
      return Factory.createBreakStatement(label, start, end);
    }
    shouldInsertSemi();
    const breakStmt = Factory.createBreakStatement(null, start, end);
    staticSematicEarlyErrorForBreakStatement(breakStmt);
    return breakStmt;
  }
  /**
   * Spec def early error checking for break statement.
   * @param {BreakStatement} breakStmt
   * reference: https://tc39.es/ecma262/#sec-break-statement-static-semantics-early-errors
   */
  function staticSematicEarlyErrorForBreakStatement(breakStmt: BreakStatement) {
    if (!isBreakValidate()) {
      // recoverable error
      raiseError(ErrorMessageMap.syntax_error_unlabeled_break_must_be_inside_loop_or_switch, breakStmt.start);
    }
  }
  /**
   * Spec def early error checking for break statement with break label
   * @param {Identifier} label
   * reference: https://tc39.es/ecma262/#sec-break-statement-static-semantics-early-errors
   */
  function staticSematicEarlyErrorForLabelInBreakStatement(label: Identifier) {
    if (!canLabelReach(label.name)) {
      // recoverable error
      raiseError(ErrorMessageMap.syntax_error_label_not_found, label.start);
    }
  }
  /**
   * Parse labeled statement
   * ```
   * LabelledStatement := LabelIdentifier: LabelledItem
   * LabelledItem := Statement
   *              := FunctionDeclaration
   * ```
   * @returns {LabeledStatement}
   */
  function parseLabeledStatement(): LabeledStatement {
    // TODO: using dev mode unreach checking
    // if (!match(SyntaxKinds.Identifier) || lookahead().kind !== SyntaxKinds.ColonPunctuator) {
    // }
    const label = parseIdentifierReference();
    if (lexicalScopeRecorder.enterVirtualBlockScope("Label", label.name)) {
      // recoverable error
      raiseError(ErrorMessageMap.v8_error_label_has_already_been_declared, label.start);
    }
    expect(SyntaxKinds.ColonPunctuator);
    const labeled = match(SyntaxKinds.FunctionKeyword) ? parseFunctionDeclaration(false) : parseStatement();
    lexicalScopeRecorder.exitVirtualBlockScope();
    staticSematicEarlyErrorForLabelStatement(labeled);
    return Factory.createLabeledStatement(
      label,
      labeled,
      cloneSourcePosition(label.start),
      cloneSourcePosition(labeled.end),
    );
  }
  /**
   * Spec def early error. using alter production rule.
   * @param labeled
   * reference: https://tc39.es/ecma262/#sec-labelled-statements-static-semantics-early-errors
   */
  function staticSematicEarlyErrorForLabelStatement(labeled: Statement | FunctionDeclaration) {
    if (isFunctionDeclaration(labeled)) {
      if (labeled.generator) {
        // recoverable error
        raiseError(
          ErrorMessageMap.babel_error_generators_can_only_be_declared_at_the_top_level_or_inside_a_block,
          labeled.start,
        );
      }
      if (isInStrictMode()) {
        // recoverable error
        raiseError(ErrorMessageMap.syntax_error_functions_cannot_be_labelled, labeled.start);
      }
    }
  }
  function parseReturnStatement(): ReturnStatement {
    const { start, end } = expect(SyntaxKinds.ReturnKeyword);
    if (!isReturnValidate()) {
      throw createMessageError(ErrorMessageMap.syntax_error_return_not_in_function);
    }
    if (isSoftInsertSemi(true)) {
      return Factory.createReturnStatement(null, start, end);
    }
    const expr = parseExpressionAllowIn();
    shouldInsertSemi();
    return Factory.createReturnStatement(expr, start, cloneSourcePosition(expr.end));
  }
  function parseTryStatement(): TryStatement {
    const { start: tryKeywordStart } = expect(SyntaxKinds.TryKeyword);
    const body = parseBlockStatement();
    let handler: CatchClause | null = null,
      finalizer: BlockStatement | null = null;
    if (match(SyntaxKinds.CatchKeyword)) {
      const catchKeywordStart = getStartPosition();
      nextToken();
      //symbolScopeRecorder.enterFunctionSymbolScope();
      enterCatchBlockScope();
      if (match(SyntaxKinds.ParenthesesLeftPunctuator)) {
        nextToken();
        symbolScopeRecorder.enterCatchParam();
        // catch clause should not have init
        const param = parseBindingElement(false);
        if (!symbolScopeRecorder.setCatchParamTo(isIdentifer(param) ? SymbolType.Var : SymbolType.Let)) {
          throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
        }
        // should check param is duplicate or not.
        expect(SyntaxKinds.ParenthesesRightPunctuator);
        const body = parseCatchBlock();
        handler = Factory.createCatchClause(param, body, catchKeywordStart, cloneSourcePosition(body.end));
      } else {
        const body = parseCatchBlock();
        handler = Factory.createCatchClause(null, body, catchKeywordStart, cloneSourcePosition(body.end));
      }
      exitCatchBlockScope();
    }
    if (match(SyntaxKinds.FinallyKeyword)) {
      nextToken();
      finalizer = parseBlockStatement();
    }
    if (!handler && !finalizer) {
      raiseError(ErrorMessageMap.v8_error_missing_catch_or_finally_after_try, tryKeywordStart);
    }
    return Factory.createTryStatement(
      body,
      handler,
      finalizer,
      tryKeywordStart,
      cloneSourcePosition(finalizer ? finalizer.end : handler ? handler.end : body.end),
    );
  }
  function parseCatchBlock() {
    const { start: puncStart } = expect(SyntaxKinds.BracesLeftPunctuator);
    const body: Array<StatementListItem> = [];
    while (!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
      body.push(parseStatementListItem());
    }
    const { end: puncEnd } = expect(SyntaxKinds.BracesRightPunctuator);
    return Factory.createBlockStatement(body, puncStart, puncEnd);
  }
  function parseThrowStatement() {
    const { start } = expect(SyntaxKinds.ThrowKeyword);
    staticSmaticEarlyErrorForThrowStatement();
    const expr = parseExpressionAllowIn();
    shouldInsertSemi();
    return Factory.createThrowStatement(expr, start, cloneSourcePosition(expr.end));
  }
  function staticSmaticEarlyErrorForThrowStatement() {
    if (getLineTerminatorFlag()) {
      throw createMessageError("TODO, line break not allow");
    }
  }
  function parseWithStatement(): WithStatement {
    const { start } = expect(SyntaxKinds.WithKeyword);
    expect(SyntaxKinds.ParenthesesLeftPunctuator);
    const object = parseExpressionAllowIn();
    expect(SyntaxKinds.ParenthesesRightPunctuator);
    const body = parseStatement();
    const withStmt = Factory.createWithStatement(object, body, start, cloneSourcePosition(body.end));
    staticSmaticEarlyErrorForWithStatement(withStmt);
    return withStmt;
  }
  function staticSmaticEarlyErrorForWithStatement(withStatement: WithStatement) {
    if (isInStrictMode()) {
      // recoverable error.
      raiseError(ErrorMessageMap.babel_error_with_statement_in_strict_mode, withStatement.start);
    }
  }
  function parseDebuggerStatement(): DebuggerStatement {
    const { start, end } = expect(SyntaxKinds.DebuggerKeyword);
    shouldInsertSemi();
    return Factory.createDebuggerStatement(start, end);
  }
  function parseEmptyStatement(): EmptyStatement {
    const { start, end } = expect([SyntaxKinds.SemiPunctuator]);
    return Factory.createEmptyStatement(start, end);
  }
  /** =================================================================
   * Parse Delcarations
   * entry point reference: https://tc39.es/ecma262/#prod-Declaration
   * ==================================================================
   */
  /**
   * Parse VariableStatement and LexicalBindingDeclaration.
   *
   * when in for-in statement, variable declaration do not need semi for
   * ending, in binding pattern of for-in statement, variable declaration
   * maybe do not need init.(for-in, for-of do not need, but for still need)
   *
   * Anthoer side, let can be identifier in VariableStatement. and parsrIdentifier
   * function would always parse let as identifier if not in strict mode. so we need
   * to implement custom function for check is identifier or value of pattern is let
   * when in LexicalBindingDeclaration
   * ```
   * VariableStatement := 'var' VariableDeclarationList
   * LexicalBidningDeclaration := '(let | const)' LexicalBinding
   * VariableDeclarationList := BindingIdentidier initalizer
   *                         := BindingPattern initalizer
   * LexicalBinding  := BindingIdentidier initalizer
   *                 := BindingPattern initalizer
   * ```
   * @returns {VariableDeclaration}
   */
  function parseVariableDeclaration(inForInit: boolean = false): VariableDeclaration {
    const variableKind = match(SyntaxKinds.VarKeyword) ? "var" : "lexical";
    const { start: keywordStart, value: variant } = expect([
      SyntaxKinds.VarKeyword,
      SyntaxKinds.ConstKeyword,
      SyntaxKinds.LetKeyword,
    ]);
    let shouldStop = false,
      isStart = true;
    const declarations: Array<VariableDeclarator> = [];
    const lastSymbolKind = getSymbolType();
    setSymbolType(
      variant === "var" ? SymbolType.Var : variant === "const" ? SymbolType.Const : SymbolType.Let,
    );
    if (getExportContext() === ExportContext.InExport) {
      setExportContext(ExportContext.InExportBinding);
    }
    while (!shouldStop) {
      if (isStart) {
        isStart = false;
      } else {
        if (!match(SyntaxKinds.CommaToken)) {
          shouldStop = true;
          continue;
        }
        nextToken();
      }
      const [id, scope] = parseWithCatpureLayer(() => parseBindingElement(false));
      const isBindingPattern = !isIdentifer(id);
      if (variableKind === "lexical" && scope.kind !== "RHSLayer" && scope.letIdentifier.length > 0) {
        throw new Error("TODO ERROR: Better");
      }
      // custom logical for check is lexical binding have let identifier ?
      if (
        // variable declarations binding pattern but but have init.
        (isBindingPattern || variant === "const") &&
        !match(SyntaxKinds.AssginOperator) &&
        // variable declaration in for statement can existed with `of`, `in` operator
        !inForInit
      ) {
        // recoverable error
        raiseError(ErrorMessageMap.syntax_error_missing_init_in_const_declaration, id.start);
      }
      if (match(SyntaxKinds.AssginOperator)) {
        nextToken();
        const init = parseAssignmentExpressionInheritIn();
        declarations.push(
          Factory.createVariableDeclarator(
            id,
            init,
            cloneSourcePosition(id.start),
            cloneSourcePosition(init.end),
          ),
        );
        continue;
      }
      declarations.push(
        Factory.createVariableDeclarator(
          id,
          null,
          cloneSourcePosition(id.start),
          cloneSourcePosition(id.end),
        ),
      );
    }
    setSymbolType(lastSymbolKind);
    setExportContext(ExportContext.NotInExport);
    if (!inForInit) {
      shouldInsertSemi();
    }
    return Factory.createVariableDeclaration(
      declarations,
      variant as VariableDeclaration["variant"],
      keywordStart,
      declarations[declarations.length - 1].end,
    );
  }
  function parseFunctionDeclaration(isAsync: boolean) {
    enterFunctionScope(isAsync);
    const func = parseFunction(false);
    exitFunctionScope(false);
    // for function declaration, symbol should declar in parent scope.
    const name = func.name!;
    delcarateFcuntionSymbol(name.name, func.generator, func.start);
    return Factory.transFormFunctionToFunctionDeclaration(func);
  }
  /**
   * Parse function maybe call by parseFunctionDeclaration and parseFunctionExpression,
   * first different of those two function is that function-declaration can not have null
   * name.
   * @returns {FunctionAST}
   */
  function parseFunction(isExpression: boolean): FunctionAST {
    const { start } = expect(SyntaxKinds.FunctionKeyword);
    let generator = false;
    if (match(SyntaxKinds.MultiplyOperator)) {
      generator = true;
      setCurrentFunctionContextAsGenerator();
      nextToken();
    }
    const [[name, params], scope] = parseWithCatpureLayer(() => {
      const name = parseFunctionName(isExpression);
      if (!name && !isExpression) {
        // recoverable error
        raiseError(ErrorMessageMap.syntax_error_function_statement_requires_a_name, getStartPosition());
      }
      const params = parseFunctionParam();
      return [name, params];
    });
    const body = parseFunctionBody();
    postStaticSematicEarlyErrorForStrictModeOfFunction(name, scope);
    return Factory.createFunction(
      name,
      body,
      params,
      generator,
      isCurrentScopeParseAwaitAsExpression(),
      start,
      cloneSourcePosition(body.end),
    );
  }
  /**
   * Because we "use strict" directive is in function body,  we will not sure
   * if this function contain stric directive or not until we enter the function body.
   * as the result, we need to check function name and function paramemter's name after
   * parseFunctionBody.
   * @param name
   * @param params
   */
  function postStaticSematicEarlyErrorForStrictModeOfFunction(
    name: Identifier | null,
    scope: StrictModeScope,
  ) {
    if (isInStrictMode()) {
      checkStrictModeScopeError(scope);
      if (name) {
        if (
          name.name === "arugments" ||
          name.name === "eval" ||
          name.name === "yield" ||
          name.name === "let" ||
          PreserveWordSet.has(name.name)
        ) {
          throw createMessageError("unexepct keyword in parameter list in strict mode");
        }
      }
    }
  }
  /**
   * When parse name of function, can not just call parseIdentifier, because function name
   * maybe await or yield, and function name's context rule is different from identifier in
   * scope (function body). so there we need to implement special logical for parse function
   * name. and you need to note that name of function expression and name of function delcaration
   * have different context rule for parse function name.
   * @param {boolean} isExpression
   * @returns {Identifier | null}
   */
  function parseFunctionName(isExpression: boolean): Identifier | null {
    return parseWithLHSLayer(() => {
      let name: Identifier | null = null;
      // there we do not just using parseIdentifier function as the reason above
      // let can be function name as other place
      if (match([SyntaxKinds.Identifier, SyntaxKinds.LetKeyword])) {
        name = parseIdentifierReference();
      } else {
        if (match(SyntaxKinds.AwaitKeyword)) {
          // for function expression, can await treat as function name is dep on current scope.
          if (isExpression && isCurrentScopeParseAwaitAsExpression()) {
            throw createMessageError(
              ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword,
            );
          }
          // for function declaration, can await treat as function name is dep on parent scope.
          if (!isExpression && isParentFunctionAsync()) {
            throw createMessageError(
              ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword,
            );
          }
          if (config.sourceType === "module") {
            throw createMessageError(
              ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword,
            );
          }
          name = parseIdentifierName();
        } else if (match(SyntaxKinds.YieldKeyword)) {
          // for function expression, can yield treat as function name is dep on current scope.
          if (isExpression && isCurrentScopeParseYieldAsExpression()) {
            throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
          }
          // for function declaration, can yield treat as function name is  dep on parent scope.
          if (!isExpression && isParentFunctionGenerator()) {
            throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
          }
          // if in strict mode, yield can not be function name.
          if (isInStrictMode()) {
            throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
          }
          name = parseIdentifierName();
        }
      }
      return name;
    });
  }
  /**
   * Parse Function Body
   * ```
   *  FunctionBody  := '{' StatementList '}'
   *  StatementList := StatementList StatementListItem
   *                := StatementListItem
   * ```
   * @return {FunctionBody}
   */
  function parseFunctionBody(): FunctionBody {
    const { start } = expect(SyntaxKinds.BracesLeftPunctuator);
    const body: Array<StatementListItem> = [];
    while (!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
      body.push(parseStatementListItem());
    }
    const { end } = expect(SyntaxKinds.BracesRightPunctuator);
    return Factory.createFunctionBody(body, start, end);
  }
  /**
   * Parse Function Params, parameter list is a spcial place for await and yield,
   * function parameter list is in current function scope, so await and yield would
   * parse as expression, but parameter list can not call await and yield expression.
   *
   * Anthoer thing is that trailing comma of restElement is error, multi restElement is
   * error for function param list.
   * ```
   * FunctionParams := '(' FunctionParamsList ')'
   *                := '(' FunctionParamsList ',' ')'
   *                := '(' FunctionPramsList ',' RestElement ')'
   *                := '(' RestElement ')'
   * FunctiinParamList := FunctionParamList ',' FunctionParam
   *                   := FunctionParam
   * FunctionParam := BindingElement
   * ```
   */
  function parseFunctionParam(): Array<Pattern> {
    expect(SyntaxKinds.ParenthesesLeftPunctuator);
    enterFunctionParameter();
    let isStart = true;
    let isEndWithRest = false;
    const params: Array<Pattern> = [];
    while (!match(SyntaxKinds.ParenthesesRightPunctuator)) {
      if (isStart) {
        if (match(SyntaxKinds.CommaToken)) {
          // recoverable error
          raiseError(ErrorMessageMap.extra_error_unexpect_trailing_comma, getStartPosition());
          nextToken();
        }
        isStart = false;
      } else {
        expect(SyntaxKinds.CommaToken);
      }
      if (match(SyntaxKinds.ParenthesesRightPunctuator)) {
        continue;
      }
      // parse SpreadElement (identifer, Object, Array)
      if (match(SyntaxKinds.SpreadOperator)) {
        isEndWithRest = true;
        params.push(parseRestElement(true));
        break;
      }
      params.push(parseBindingElement());
    }
    if (!match(SyntaxKinds.ParenthesesRightPunctuator)) {
      if (isEndWithRest && match(SyntaxKinds.CommaToken)) {
        // recoverable error
        throw createMessageError(ErrorMessageMap.babel_error_unexpected_trailing_comma_after_rest_element);
      }
      throw createUnexpectError();
    }
    nextToken();
    setContextIfParamsIsSimpleParameterList(params);
    existFunctionParameter();
    return params;
  }
  /**
   * Helper function for check if parameter list is simple
   * parameter list or not, if is simple parameter, set
   * the context.
   * @param {Array<Pattern>} params
   * @returns
   */
  function setContextIfParamsIsSimpleParameterList(params: Array<Pattern>) {
    for (const param of params) {
      if (!isIdentifer(param)) {
        setCurrentFunctionParameterListAsNonSimple();
        return;
      }
    }
  }
  function parseDecoratorListToCache() {
    const decoratorList = parseDecoratorList();
    context.cache.decorators = decoratorList;
  }
  function parseDecoratorList(): [Decorator] {
    const decoratorList: [Decorator] = [parseDecorator()];
    while (match(SyntaxKinds.AtPunctuator)) {
      decoratorList.push(parseDecorator());
    }
    if (
      match(SyntaxKinds.ClassKeyword) ||
      (match(SyntaxKinds.ExportKeyword) && config.sourceType === "module") ||
      isInClassScope()
    ) {
      return decoratorList;
    }
    throw createMessageError(
      ErrorMessageMap.babel_error_leading_decorators_must_be_attached_to_a_class_declaration,
    );
  }
  function parseDecorator(): Decorator {
    const { start } = expect(SyntaxKinds.AtPunctuator);
    switch (getToken()) {
      case SyntaxKinds.ParenthesesLeftPunctuator: {
        nextToken();
        const expr = parseExpressionAllowIn();
        expect(SyntaxKinds.ParenthesesRightPunctuator);
        return Factory.createDecorator(expr, start, expr.end);
      }
      default: {
        let expr: Expression = parseIdentifierName();
        while (match(SyntaxKinds.DotOperator)) {
          nextToken();
          const property = match(SyntaxKinds.PrivateName) ? parsePrivateName() : parseIdentifierName();
          expr = Factory.createMemberExpression(
            false,
            property,
            expr,
            false,
            cloneSourcePosition(expr.start),
            cloneSourcePosition(property.end),
          );
        }
        if (match(SyntaxKinds.ParenthesesLeftPunctuator)) {
          const { nodes, end } = parseArguments();
          const callExpr = Factory.createCallExpression(
            expr,
            nodes,
            false,
            cloneSourcePosition(expr.start),
            end,
          );
          return Factory.createDecorator(callExpr, start, cloneSourcePosition(callExpr.end));
        }
        return Factory.createDecorator(expr, start, expr.end);
      }
    }
  }

  /**
   *
   */
  function parseClassDeclaration(decoratorList: Decorator[] | null): ClassDeclaration {
    expectButNotEat(SyntaxKinds.ClassKeyword);
    const classDelcar = parseClass(decoratorList);
    if (classDelcar.id === null) {
      throw createMessageError("class declaration must have class id");
    }
    return Factory.transFormClassToClassDeclaration(classDelcar);
  }
  /**
   * Parse Class
   * ```
   * Class := 'class' identifer ('extends' LeftHandSideExpression) ClassBody
   * ```
   * @returns {Class}
   */
  function parseClass(decoratorList: Decorator[] | null): Class {
    const { start } = expect(SyntaxKinds.ClassKeyword);
    let name: Identifier | null = null;
    if (match(BindingIdentifierSyntaxKindArray)) {
      name = parseIdentifierReference();
      declarateLetSymbol(name.name, name.start);
    }
    let superClass: Expression | null = null;
    if (match(SyntaxKinds.ExtendsKeyword)) {
      enterClassScope(true);
      nextToken();
      superClass = parseLeftHandSideExpression();
    } else {
      enterClassScope(false);
    }
    const body = parseClassBody();
    existClassScope();
    return Factory.createClass(name, superClass, body, decoratorList, start, cloneSourcePosition(body.end));
  }
  /**
   * Parse ClassBody
   * ```
   *  ClassBody := '{' [ClassElement] '}'
   * ```
   * @return {ClassBody}
   */
  function parseClassBody(): ClassBody {
    const { start } = expect(SyntaxKinds.BracesLeftPunctuator);
    const classbody: ClassBody["body"] = [];
    while (!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
      if (match(SyntaxKinds.SemiPunctuator)) {
        nextToken();
        continue;
      }
      classbody.push(parseClassElement());
    }
    const { end } = expect(SyntaxKinds.BracesRightPunctuator);
    return Factory.createClassBody(classbody, cloneSourcePosition(start), cloneSourcePosition(end));
  }
  /**
   * Parse ClassElement
   * ```
   * ClassElement := MethodDefinition
   *              := 'static' MethodDefinition
   *              := FieldDefintion ;
   *              := 'static' FieldDefintion ;
   *              := ClassStaticBlock
   *              := ; (this production rule handle by caller)
   * FieldDefintion := ClassElementName ('=' AssignmentExpression)?
   * ```
   * - frist, parse 'static' keyword if possible, next follow cases
   *   1. start with some method modifier like 'set', 'get', 'async', '*' must be methodDefintion
   *   2. start with '{', must be static block
   * - then parse ClassElement
   *    1. if next token is '(', must be MethodDefintion,
   *    2. else this only case is FieldDefinition with init or not.
   * @returns {ClassElement}
   */
  function parseClassElement(): ClassElement {
    let decorators: [Decorator] | null = null;
    if (match(SyntaxKinds.AtPunctuator)) {
      decorators = parseDecoratorList();
    }
    // parse static modifier
    const isStatic = checkIsMethodStartWithStaticModifier();
    if (checkIsMethodStartWithModifier()) {
      return parseMethodDefintion(true, undefined, isStatic, decorators) as ClassMethodDefinition;
    }
    if (match(SyntaxKinds.BracesLeftPunctuator) && isStatic) {
      if (decorators) {
        throw createMessageError(ErrorMessageMap.babel_error_decorators_can_not_be_used_with_a_static_block);
      }
      const { start } = expect(SyntaxKinds.BracesLeftPunctuator);
      symbolScopeRecorder.enterFunctionSymbolScope();
      const body: Array<StatementListItem> = [];
      while (!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
        body.push(parseStatementListItem());
      }
      symbolScopeRecorder.exitSymbolScope();
      const { end } = expect(SyntaxKinds.BracesRightPunctuator);
      return Factory.createClassStaticBlock(body, start, end);
    }
    let accessor = false;
    if (isContextKeyword("accessor")) {
      const { kind, lineTerminatorFlag } = lookahead();
      if (kind === SyntaxKinds.Identifier && !lineTerminatorFlag) {
        nextToken();
        accessor = true;
      }
    }
    // parse ClassElementName
    const isComputedRef = { isComputed: false };
    let key: PropertyName | PrivateName | undefined;
    if (match(SyntaxKinds.PrivateName)) {
      key = parsePrivateName();
      defPrivateName(key.name);
    } else {
      key = parsePropertyName(isComputedRef);
    }
    if (match(SyntaxKinds.ParenthesesLeftPunctuator)) {
      return parseMethodDefintion(
        true,
        [key, isComputedRef.isComputed],
        isStatic,
        decorators,
      ) as ClassMethodDefinition;
    }
    staticSematicForClassPropertyName(key, isComputedRef.isComputed, isStatic);
    let propertyValue = undefined,
      shorted = true;
    if (match([SyntaxKinds.AssginOperator])) {
      nextToken();
      shorted = false;
      const [value, scope] = parseWithCatpureLayer(parseAssignmentExpressionAllowIn);
      propertyValue = value;
      staticSematicForClassPropertyValue(scope);
    }
    shouldInsertSemi();
    if (accessor) {
      return Factory.createClassAccessorProperty(
        key,
        propertyValue,
        isComputedRef.isComputed,
        isStatic,
        shorted,
        decorators,
        cloneSourcePosition(key.start),
        cloneSourcePosition(key.end),
      );
    }
    return Factory.createClassProperty(
      key,
      propertyValue,
      isComputedRef.isComputed,
      isStatic,
      shorted,
      decorators,
      cloneSourcePosition(key.start),
      cloneSourcePosition(key.end),
    );
  }
  function checkIsMethodStartWithStaticModifier() {
    const { kind } = lookahead();
    if (isContextKeyword("static")) {
      switch (kind) {
        // static <name>
        // static get/set/async
        // static { <static-block>
        // static [<compute-name>]
        // static *
        case SyntaxKinds.Identifier:
        case SyntaxKinds.PrivateName:
        case SyntaxKinds.StringLiteral:
        case SyntaxKinds.BracesLeftPunctuator:
        case SyntaxKinds.BracketLeftPunctuator:
        case SyntaxKinds.MultiplyOperator:
          nextToken();
          return true;
        default:
          // static for/if ...etc
          if (Keywords.find((kw) => kw === kind)) return true;
          return false;
      }
    }
    return false;
  }
  /**
   * For a class scope, it must be strict mode, so argument identifier can
   * @param {StrictModeScope} scope
   * @returns
   */
  function staticSematicForClassPropertyValue(scope: StrictModeScope) {
    if (scope.kind !== "CatpureLayer") {
      return;
    }
    if (scope.argumentsIdentifier.length > 0) {
      throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
    }
  }
  /**
   * Check sematic for class property name.
   *  - `constructor` can not used as property name
   *  - `prototype` can not be a static property
   * @param {PropertyName | PrivateName} propertyName
   * @param isComputed
   * @param {boolean} isStatic
   * @returns
   */
  function staticSematicForClassPropertyName(
    propertyName: PropertyName | PrivateName,
    isComputed: boolean,
    isStatic: boolean,
  ) {
    if (isComputed) return;
    let value;
    if (isPrivateName(propertyName) || isIdentifer(propertyName)) {
      value = propertyName.name;
    } else if (isStringLiteral(propertyName)) {
      value = propertyName.value;
    }
    if (value) {
      if (value === "constructor") {
        // recoverable error
        raiseError(
          ErrorMessageMap.babel_error_classe_may_not_have_a_field_named_constructor,
          propertyName.start,
        );
      }
      if (value === "prototype" && isStatic) {
        raiseError(
          ErrorMessageMap.v8_error_class_may_not_have_static_property_named_prototype,
          propertyName.start,
        );
      }
    }
  }
  /** ====================================================================
   *  Parse Expression
   *  entry point reference : https://tc39.es/ecma262/#sec-comma-operator
   * =====================================================================
   */

  /**
   * Entry function for parse a expression statement.
   * @returns {ExpressionStatement}
   */
  function parseExpressionStatement(): ExpressionStatement {
    preStaticSematicEarlyErrorForExpressionStatement();
    const expr = parseExpressionAllowIn();
    checkStrictMode(expr);
    postStaticSematicEarlyErrorForExpressionStatement(expr);
    shouldInsertSemi();
    return Factory.createExpressionStatement(
      expr,
      cloneSourcePosition(expr.start),
      cloneSourcePosition(expr.end),
    );
  }
  /**
   * Implement part of NOTE section in 14.5
   */
  function preStaticSematicEarlyErrorForExpressionStatement() {
    if (match(SyntaxKinds.LetKeyword)) {
      const { kind, lineTerminatorFlag } = lookahead();
      if (
        kind === SyntaxKinds.BracketLeftPunctuator ||
        (!lineTerminatorFlag &&
          (kind === SyntaxKinds.BracesLeftPunctuator || kind === SyntaxKinds.Identifier))
      ) {
        throw createMessageError(
          ErrorMessageMap.v8_error_lexical_declaration_cannot_appear_in_a_single_statement_context,
        );
      }
    }
  }
  /**
   * Implement part of NOTE section in 14.5
   */
  function postStaticSematicEarlyErrorForExpressionStatement(expr: Expression) {
    if (!expr.parentheses) {
      if (isFunctionExpression(expr) || isClassExpression(expr)) {
        throw createMessageError(ErrorMessageMap.syntax_error_functions_cannot_be_labelled);
      }
    }
  }
  /**
   * Helper function for checking `use strict` directive, according to
   * ECMA spec, `use strict` directive is a `ExpressionStatement` in
   * which value is `use strict`, and this function is doing the same
   * thing as spec required.
   *
   * NOTE: this function would perform side effect to parse context
   *
   * ref: https://tc39.es/ecma262/#use-strict-directive
   * @param {Expression} expr
   */
  function checkStrictMode(expr: Expression) {
    if (isStringLiteral(expr)) {
      if (expr.value === "use strict" && !expr.parentheses) {
        if (isDirectToFunctionContext()) {
          if (!isCurrentFunctionParameterListSimple()) {
            // recoverable error
            raiseError(
              ErrorMessageMap.syntax_error_use_strict_not_allowed_in_function_with_non_simple_parameters,
              expr.start,
            );
          }
          setCurrentFunctionContextAsStrictMode();
        }
      }
    }
  }
  /**
   * Private Parse API, parse Expression.
   * ```
   * Expression:
   *  AssignmentExpression
   *  Expression, AssignmentExpression
   * ```
   * Since Expression have in operator syntax action, so there we split parseExpression
   * into three kind of function.
   * - `parseExpressionAllowIn`: equal to production rule with parameter `Expression[+In]`
   * - `parseExpressionDisallowIn`: equal to production rule with parameter `Expression[~In]`
   * - `parseExpressionInheritIn`: equal to production rule with parameter `Expression[?in]`
   * @returns {Expression}
   */
  function parseExpressionAllowIn(): Expression {
    return allowInOperaotr(parseExpressionInheritIn);
  }
  /**
   * Private Parse API, parse Expression.
   * - allow disallow in operator syntax transition action.
   * - for more detail, please refer to `parseExpressionAllowIn`.
   * @returns {Expression}
   */
  function parseExpressionDisallowIn(): Expression {
    return disAllowInOperaotr(parseExpressionInheritIn);
  }
  /**
   * Private Parse API, parse Expression.
   * - inherit in operator syntax transition action.
   * - for more detail, please refer to `parseExpressionAllowIn`.
   * @returns {Expression}
   */
  function parseExpressionInheritIn(): Expression {
    const exprs = [parseAssignmentExpressionInheritIn()];
    while (match(SyntaxKinds.CommaToken)) {
      nextToken();
      exprs.push(parseAssignmentExpressionInheritIn());
    }
    if (exprs.length === 1) {
      return exprs[0];
    }
    return Factory.createSequenceExpression(
      exprs,
      cloneSourcePosition(exprs[0].start),
      cloneSourcePosition(exprs[exprs.length - 1].end),
    );
  }
  /**
   * Private Parse API, parse AssignmentExpression
   *
   * Since AssignmentExpression usually is a entry point of in operator syntax action. just like
   * parseExpression, there we split function into three kind:
   * - `parseAssignmentExpressionAllowIn`: equals to production rule with parameter
   * - `parseAssignmentExpressionInhertIn`: equals to production rule with parameter
   * - It since that disallow is not show in current spec, so ignore it.
   * @returns {Expression}
   */
  function parseAssignmentExpressionAllowIn(): Expression {
    return allowInOperaotr(parseAssignmentExpressionInheritIn);
  }
  /**
   * Private Parse API, parse AssignmentExpression
   * - inherit in operator syntax transition action.
   * - for more detail, please refer to `parseAssignmentExpressionAllowIn`.
   * @returns {Expression}
   */
  function parseAssignmentExpressionInheritIn(): Expression {
    if (
      match([
        SyntaxKinds.ParenthesesLeftPunctuator,
        SyntaxKinds.Identifier,
        SyntaxKinds.LetKeyword,
        SyntaxKinds.YieldKeyword,
        SyntaxKinds.AwaitKeyword,
      ])
    ) {
      context.maybeArrowStart = getStartPosition().index;
    }
    if (match(SyntaxKinds.YieldKeyword) && isCurrentScopeParseYieldAsExpression()) {
      return parseYieldExpression();
    }
    const [leftExpr, scope] = parseWithCatpureLayer(parseConditionalExpression);
    if (!match(AssigmentOperators)) {
      return leftExpr;
    }
    const left = exprToPattern(leftExpr, false);
    checkStrictModeScopeError(scope);
    const operator = getToken();
    if (operator !== SyntaxKinds.AssginOperator) {
      checkExpressionAsLeftValue(left);
    }
    nextToken();
    const right = parseAssignmentExpressionInheritIn();
    return Factory.createAssignmentExpression(
      left as Pattern,
      right,
      operator as AssigmentOperatorKinds,
      cloneSourcePosition(left.start),
      cloneSourcePosition(right.end),
    );
  }
  /**
   * Helper function for any parse API that need to parse Arrow function.
   * From production rule in `AssignmentExpression`, `ArrowFunctionExpression` and
   * `AsyncArrowFunctionExpression` is same level of `ConditionalExpression`, but we
   * parse ArrowFunction in the bottom of parse recursion(parsePrimary), so we should
   * mark context there to make parseArrowFunction only parse when context is mark.
   * @returns {boolean}
   */
  function canParseAsArrowFunction(): boolean {
    return getStartPosition().index === context.maybeArrowStart;
  }
  /**
   * Parse Yield Expression, when current function scope is generator, yield would
   * seems as keyword of yield expression, but even if in generator function scope,
   * function parameter can call yield expression, so this function would check is
   * current place is in function paramter or not. if yield expression shows in
   * parameter list, it would throw error.
   * ```
   * YieldExpression := 'yield'
   *                 := 'yield' AssignmentExpression
   *                 := 'yield' '*' AssignmentExpression
   * ```
   * @returns {YieldExpression}
   */
  function parseYieldExpression(): YieldExpression {
    const { start } = expect(SyntaxKinds.YieldKeyword);
    let delegate = false;
    if (match(SyntaxKinds.MultiplyOperator)) {
      if (!getLineTerminatorFlag()) {
        nextToken();
        delegate = true;
      }
    }
    const isLineDterminator = getLineTerminatorFlag();
    let argument: Expression | null = null;
    if (!isSoftInsertSemi(false) && checkIsFollowByExpreesion()) {
      if (delegate || (!delegate && !isLineDterminator)) {
        argument = parseAssignmentExpressionInheritIn();
      }
    }
    if (delegate && !argument) {
      throw createMessageError(ErrorMessageMap.yield_deletgate_can_must_be_followed_by_assignment_expression);
    }
    if (isInParameter()) {
      throw createMessageError(ErrorMessageMap.yield_expression_can_not_used_in_parameter_list);
    }
    recordScope(ExpressionScopeKind.YieldExpressionInParameter, start);
    return Factory.createYieldExpression(
      argument,
      delegate,
      start,
      cloneSourcePosition(argument ? argument.end : start),
    );
  }
  function checkIsFollowByExpreesion() {
    switch (getToken()) {
      case SyntaxKinds.ColonPunctuator:
      case SyntaxKinds.ParenthesesRightPunctuator:
      case SyntaxKinds.BracketRightPunctuator:
      case SyntaxKinds.CommaToken:
        return false;
      default:
        return true;
    }
  }
  function parseConditionalExpression(): Expression {
    const test = parseBinaryExpression();
    if (shouldEarlyReturn(test)) {
      return test;
    }
    if (!match(SyntaxKinds.QustionOperator)) {
      return test;
    }
    nextToken();
    const conseq = parseAssignmentExpressionAllowIn();
    expect(SyntaxKinds.ColonPunctuator);
    const alter = parseAssignmentExpressionInheritIn();
    return Factory.createConditionalExpression(
      test,
      conseq,
      alter,
      cloneSourcePosition(test.start),
      cloneSourcePosition(alter.end),
    );
  }
  /**
   * Private Parse Helper API for parse arrow function.
   * @param {Expression} expr
   * @returns
   */
  function shouldEarlyReturn(expr: Expression) {
    return isArrowFunctionExpression(expr) && !expr.parentheses;
  }
  /**
   * Using Operator-precedence parser algorithm is used for parse binary expressiom
   * with precedence order. and this is entry function for parseBinaryExpression.
   * @returns {Expression}
   */
  function parseBinaryExpression(): Expression {
    let atom = parseUnaryOrPrivateName();
    if (shouldEarlyReturn(atom)) {
      return atom;
    }
    if (match(BinaryOperators)) {
      atom = parseBinaryOps(atom);
    }
    if (isPrivateName(atom)) {
      raiseError(ErrorMessageMap.babel_error_private_name_wrong_used, atom.start);
    }
    return atom;
  }
  /**
   * Return the precedence order by given binary operator.
   * this function should only used by parseBinaryOps
   * @param {SyntaxKinds} kind Binary Operator
   * @returns {number}
   */
  function getBinaryPrecedence(kind: SyntaxKinds): number {
    switch (kind) {
      case SyntaxKinds.NullishOperator:
      case SyntaxKinds.LogicalOROperator:
        return 4;
      case SyntaxKinds.LogicalANDOperator:
        return 5;
      case SyntaxKinds.BitwiseOROperator:
        return 6;
      case SyntaxKinds.BitwiseXOROperator:
        return 7;
      case SyntaxKinds.BitwiseANDOperator:
        return 8;
      case SyntaxKinds.StrictEqOperator:
      case SyntaxKinds.StrictNotEqOperator:
      case SyntaxKinds.EqOperator:
      case SyntaxKinds.NotEqOperator:
        return 9;
      case SyntaxKinds.InKeyword:
      case SyntaxKinds.InstanceofKeyword:
      case SyntaxKinds.GtOperator:
      case SyntaxKinds.GeqtOperator:
      case SyntaxKinds.LeqtOperator:
      case SyntaxKinds.LtOperator:
        if (kind === SyntaxKinds.InKeyword && !getCurrentInOperatorStack()) {
          return -1;
        }
        return 10;
      case SyntaxKinds.BitwiseLeftShiftOperator:
      case SyntaxKinds.BitwiseRightShiftOperator:
      case SyntaxKinds.BitwiseRightShiftFillOperator:
        return 11;
      case SyntaxKinds.PlusOperator:
      case SyntaxKinds.MinusOperator:
        return 12;
      case SyntaxKinds.ModOperator:
      case SyntaxKinds.DivideOperator:
      case SyntaxKinds.MultiplyOperator:
        return 13;
      case SyntaxKinds.ExponOperator:
        return 14;
      default:
        return -1;
    }
  }
  function isBinaryOps(kind: SyntaxKinds) {
    return getBinaryPrecedence(kind) > 0;
  }
  /**
   * Bottom up recurive function for parse binary operator and next
   * expression.
   * @param {Expression} left
   * @param {number} lastPre
   * @returns {Expression}
   */
  function parseBinaryOps(left: Expression, lastPre: number = 0): Expression {
    // eslint-disable-next-line no-constant-condition
    while (1) {
      const currentOp = getToken();
      if (!isBinaryOps(currentOp) || getBinaryPrecedence(currentOp) < lastPre) {
        break;
      }
      nextToken();
      let right = parseUnaryOrPrivateName();
      const nextOp = getToken();
      if (isBinaryOps(nextOp) && getBinaryPrecedence(nextOp) > getBinaryPrecedence(currentOp)) {
        right = parseBinaryOps(right, getBinaryPrecedence(nextOp));
      }
      staticSematicForBinaryExpr(currentOp, nextOp, left, right);
      left = Factory.createBinaryExpression(
        left,
        right,
        currentOp as BinaryOperatorKinds,
        cloneSourcePosition(left.start),
        cloneSourcePosition(right.end),
      );
    }
    return left;
  }
  function staticSematicForBinaryExpr(
    currentOps: SyntaxKinds,
    nextOps: SyntaxKinds,
    left: Expression,
    right: Expression,
  ) {
    if (isPrivateName(right) || (isPrivateName(left) && currentOps !== SyntaxKinds.InKeyword)) {
      // recoverable error
      raiseError(ErrorMessageMap.babel_error_private_name_wrong_used, left.start);
    }
    if (left.parentheses) {
      return;
    }
    if (currentOps === SyntaxKinds.ExponOperator) {
      if (isUnaryExpression(left) || isAwaitExpression(left)) {
        // recoverable error
        raiseError(ErrorMessageMap.v8_error_expont_operator_need_parans, left.start);
      }
    }
    // if currentOp is nullish, next is logical or not
    // if current Ops is logical, check next is nullish or not
    if (
      currentOps === SyntaxKinds.NullishOperator &&
      (nextOps === SyntaxKinds.LogicalANDOperator || nextOps === SyntaxKinds.LogicalOROperator)
    ) {
      // recoverable error
      raiseError(ErrorMessageMap.v8_error_nullish_require_parans, left.end);
    }
    if (
      nextOps === SyntaxKinds.NullishOperator &&
      (currentOps === SyntaxKinds.LogicalANDOperator || currentOps === SyntaxKinds.LogicalOROperator)
    ) {
      // recoverable error
      raiseError(ErrorMessageMap.v8_error_nullish_require_parans, left.end);
    }
  }
  function parseUnaryOrPrivateName(): Expression {
    if (match(SyntaxKinds.PrivateName)) {
      const privateName = parsePrivateName();
      usePrivateName(privateName.name);
      return privateName;
    }
    return parseUnaryExpression();
  }
  function parseUnaryExpression(): Expression {
    if (match(UnaryOperators)) {
      const operator = getToken() as UnaryOperatorKinds;
      const isDelete = operator === SyntaxKinds.DeleteKeyword;
      const start = getStartPosition();
      nextToken();
      let argument;
      if (isDelete) {
        enterDelete();
        argument = parseUnaryExpression();
        exitDelete();
      } else {
        argument = parseUnaryExpression();
      }
      const unaryExpr = Factory.createUnaryExpression(
        argument,
        operator,
        start,
        cloneSourcePosition(argument.end),
      );
      staticSematicEarlyErrorForUnaryExpression(unaryExpr);
      return unaryExpr;
    }
    if (match(SyntaxKinds.AwaitKeyword) && isCurrentScopeParseAwaitAsExpression()) {
      return parseAwaitExpression();
    }
    return parseUpdateExpression();
  }
  // 13.5.1.1
  function staticSematicEarlyErrorForUnaryExpression(expr: UnaryExpression) {
    if (isInStrictMode() && expr.operator === SyntaxKinds.DeleteKeyword && isIdentifer(expr.argument)) {
      throw createMessageError(
        ErrorMessageMap.syntax_error_applying_the_delete_operator_to_an_unqualified_name_is_deprecated,
      );
    }
  }
  function parseAwaitExpression() {
    if (isInParameter()) {
      throw createMessageError(ErrorMessageMap.await_expression_can_not_used_in_parameter_list);
    }
    const start = getStartPosition();
    nextToken();
    recordScope(ExpressionScopeKind.AwaitExpressionImParameter, start);
    const argu = parseUnaryExpression();
    return Factory.createAwaitExpression(argu, start, cloneSourcePosition(argu.end));
  }
  function parseUpdateExpression(): Expression {
    if (match(UpdateOperators)) {
      const operator = getToken() as UpdateOperatorKinds;
      const start = getStartPosition();
      nextToken();
      const argument = parseWithLHSLayer(parseLeftHandSideExpression);
      checkExpressionAsLeftValue(argument);
      return Factory.createUpdateExpression(
        argument,
        operator,
        true,
        start,
        cloneSourcePosition(argument.end),
      );
    }
    const [argument, scope] = parseWithCatpureLayer(parseLeftHandSideExpression);
    if (match(UpdateOperators) && !getLineTerminatorFlag()) {
      checkStrictModeScopeError(scope);
      checkExpressionAsLeftValue(argument);
      const operator = getToken() as UpdateOperatorKinds;
      const end = getEndPosition();
      nextToken();
      return Factory.createUpdateExpression(
        argument,
        operator,
        false,
        cloneSourcePosition(argument.start),
        end,
      );
    }
    return argument;
  }
  /**
   * Parse Left hand side Expression. This syntax is reference babel function, which is simplify original syntax of TS39,
   * 'this' and super 'super' would be meanful when apper at start of atoms, which can be handle by parseAtoms. NewExpression
   * is a spacial case , because it can not using optionalChain, so i handle it into a atom.
   * ```
   *  LeftHandSideExpression := Atoms '?.' CallExpression
   *                         := Atoms '?.' MemberExpression
   *                         := Atoms TagTemplateExpression
   * ```
   * @returns {Expression}
   */
  function parseLeftHandSideExpression(): Expression {
    let base = parsePrimaryExpression();
    if (shouldEarlyReturn(base)) {
      return base;
    }
    let shouldStop = false;
    let hasOptional = false;
    while (!shouldStop) {
      let optional = false;
      if (match(SyntaxKinds.QustionDotOperator)) {
        optional = true;
        hasOptional = true;
        nextToken();
      }
      if (match(SyntaxKinds.ParenthesesLeftPunctuator)) {
        // callexpression
        base = parseCallExpression(base, optional);
      } else if (match([SyntaxKinds.DotOperator, SyntaxKinds.BracketLeftPunctuator]) || optional) {
        // memberexpression
        base = parseMemberExpression(base, optional);
      } else if (match(SyntaxKinds.TemplateHead) || match(SyntaxKinds.TemplateNoSubstitution)) {
        // tag template expressuin
        if (hasOptional) {
          // recoverable error
          raiseError(
            ErrorMessageMap.syntax_error_tag_template_expression_can_not_use_option_chain,
            getStartPosition(),
          );
        }
        base = parseTagTemplateExpression(base);
      } else {
        shouldStop = true;
      }
    }
    if (hasOptional) {
      return Factory.createChainExpression(
        base,
        cloneSourcePosition(base.start),
        cloneSourcePosition(base.end),
      );
    }
    return base;
  }
  /**
   * Check is a assignable left value
   * @param expression
   * @returns
   */
  function checkExpressionAsLeftValue(expression: ModuleItem) {
    if (isIdentifer(expression) || isMemberExpression(expression)) {
      return;
    }
    throw createMessageError(ErrorMessageMap.invalid_left_value);
  }
  /**
   * Parse CallExpression
   * ```
   * CallExpresion := GivenBase(base, optional) '(' Arguments ')'
   * ```
   * @param {Expression} callee base expression
   * @param {boolean} optional is this call optional ?
   * @returns {Expression}
   */
  function parseCallExpression(callee: Expression, optional: boolean): Expression {
    expectButNotEat([SyntaxKinds.ParenthesesLeftPunctuator]);
    const { nodes, end } = parseArguments();
    return Factory.createCallExpression(callee, nodes, optional, cloneSourcePosition(callee.start), end);
  }
  /**
   * // TODO: remove possble dep of arrow function paramemter need to call this function.
   *
   * Parse Arguments, used by call expression, and arrow function paramemter.
   * ```
   * Arguments := '(' ArgumentList ')'
   * ArgumentList := ArgumentList AssigmentExpression
   *              := ArgumentList SpreadElement
   *              := AssignmentExpression
   *              := SpreadElement
   * ```
   * @returns {Array<Expression>}
   */
  function parseArguments(): ASTArrayWithMetaData<Expression> & {
    trailingComma: boolean;
  } {
    const { start } = expect(SyntaxKinds.ParenthesesLeftPunctuator);
    let isStart = true;
    // TODO: refactor logic to remove shoulStop
    const callerArguments: Array<Expression> = [];
    let trailingComma = false;
    while (!match(SyntaxKinds.ParenthesesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
      if (isStart) {
        isStart = false;
        if (match(SyntaxKinds.CommaToken)) {
          // trailing comma
          raiseError(ErrorMessageMap.extra_error_unexpect_trailing_comma, getStartPosition());
          nextToken();
        }
      } else {
        trailingComma = true;
        expect(SyntaxKinds.CommaToken);
      }
      // case 1: ',' following by ')'
      if (match(SyntaxKinds.ParenthesesRightPunctuator)) {
        break;
      }
      trailingComma = false;
      // case 2: ',' following by SpreadElement, maybe follwed by ','
      if (match(SyntaxKinds.SpreadOperator)) {
        const spreadElementStart = getStartPosition();
        nextToken();
        const argu = parseAssignmentExpressionAllowIn();
        callerArguments.push(
          Factory.createSpreadElement(argu, spreadElementStart, cloneSourcePosition(argu.end)),
        );
        continue;
      }
      // case 3 : ',' AssigmentExpression
      callerArguments.push(parseAssignmentExpressionAllowIn());
    }
    const { end } = expect(SyntaxKinds.ParenthesesRightPunctuator);
    return {
      end,
      start,
      nodes: callerArguments,
      trailingComma,
    };
  }
  /**
   * Parse with base, this different between parseLeftHandSideExpression is
   * that parseMemberExpression would only eat a `atom` of chain of expression.
   * ```
   * MemberExpression := GivenBase(base ,optional) '.' IdentiferWithKeyword
   *                  := GivenBase(base, optional) '[' Expreession ']'
   *                  := GivenBase(base, optional) IdentiferWithKeyword
   * // for last condition, optional prope must be True
   * ```
   * @param {Expression} base base expression
   * @param {boolean} optional is base expression contain a optional
   * @returns {Expression}
   */
  function parseMemberExpression(base: Expression, optional: boolean): Expression {
    if (!match(SyntaxKinds.DotOperator) && !match(SyntaxKinds.BracketLeftPunctuator) && !optional) {
      throw createUnreachError([SyntaxKinds.DotOperator, SyntaxKinds.BracketLeftPunctuator]);
    }
    // if start with dot, must be a access property, can not with optional.
    // because optional means that last token is `?.`
    if (match(SyntaxKinds.DotOperator) && !optional) {
      expect(SyntaxKinds.DotOperator);
      const property = parseMemberExpressionProperty();

      return Factory.createMemberExpression(
        false,
        base,
        property,
        optional,
        cloneSourcePosition(base.start),
        cloneSourcePosition(property.end),
      );
    }
    // if start with `[`, must be computed property access.
    else if (match(SyntaxKinds.BracketLeftPunctuator)) {
      expect(SyntaxKinds.BracketLeftPunctuator);
      const property = parseExpressionAllowIn();
      const { end } = expect(SyntaxKinds.BracketRightPunctuator);
      return Factory.createMemberExpression(
        true,
        base,
        property,
        optional,
        cloneSourcePosition(base.start),
        end,
      );
    } else {
      // because parseLeftHandSideExpression would eat optional mark (QustionDotToken) frist, so maybe there
      // is not dot or `[` for start a member expression, so we can check optional is
      const property = parseMemberExpressionProperty();
      return Factory.createMemberExpression(
        false,
        base,
        property,
        optional,
        cloneSourcePosition(base.start),
        cloneSourcePosition(property.end),
      );
    }
  }
  function parseMemberExpressionProperty() {
    let property: Expression | PrivateName;
    if (match(SyntaxKinds.PrivateName)) {
      property = parsePrivateName();
      usePrivateName(property.name);
      if (isInDelete()) {
        throw createMessageError(
          ErrorMessageMap.syntax_error_applying_the_delete_operator_to_an_unqualified_name_is_deprecated,
        );
      }
    } else {
      property = parseIdentifierName();
    }
    return property;
  }
  function parseTagTemplateExpression(base: Expression) {
    const quasi = parseTemplateLiteral(true);
    return Factory.createTagTemplateExpression(
      base,
      quasi,
      cloneSourcePosition(base.end),
      cloneSourcePosition(quasi.end),
    );
  }
  function parsePrimaryExpression(): Expression {
    switch (getToken()) {
      case SyntaxKinds.LtOperator:
        return parseJSXElementOrJSXFragment(false);
      case SyntaxKinds.DivideOperator:
      case SyntaxKinds.DivideAssignOperator:
        return parseRegexLiteral();
      case SyntaxKinds.NullKeyword:
        return parseNullLiteral();
      case SyntaxKinds.UndefinedKeyword:
        return parseUndefinedLiteral();
      case SyntaxKinds.TrueKeyword:
      case SyntaxKinds.FalseKeyword:
        return parseBoolLiteral();
      case SyntaxKinds.DecimalLiteral:
        return parseDecimalLiteral();
      case SyntaxKinds.DecimalBigIntegerLiteral:
        return parseDecimalBigIntegerLiteral();
      case SyntaxKinds.NonOctalDecimalLiteral:
        return parseNonOctalDecimalLiteral();
      case SyntaxKinds.BinaryIntegerLiteral:
        return parseBinaryIntegerLiteral();
      case SyntaxKinds.BinaryBigIntegerLiteral:
        return parseBinaryBigIntegerLiteral();
      case SyntaxKinds.OctalIntegerLiteral:
        return parseOctalIntegerLiteral();
      case SyntaxKinds.OctalBigIntegerLiteral:
        return parseOctalBigIntegerLiteral();
      case SyntaxKinds.HexIntegerLiteral:
        return parseHexIntegerLiteral();
      case SyntaxKinds.HexBigIntegerLiteral:
        return parseHexBigIntegerLiteral();
      case SyntaxKinds.LegacyOctalIntegerLiteral:
        return parseLegacyOctalIntegerLiteral();
      case SyntaxKinds.StringLiteral:
        return parseStringLiteral();
      case SyntaxKinds.TemplateHead:
      case SyntaxKinds.TemplateNoSubstitution:
        return parseTemplateLiteral(false);
      case SyntaxKinds.ImportKeyword: {
        const { kind } = lookahead();
        if (kind === SyntaxKinds.DotOperator) return parseImportMeta();
        if (kind === SyntaxKinds.ParenthesesLeftPunctuator) {
          return parseImportCall();
        }
        throw createUnexpectError();
      }
      case SyntaxKinds.NewKeyword: {
        const { kind } = lookahead();
        if (kind === SyntaxKinds.DotOperator) {
          return parseNewTarget();
        }
        return parseNewExpression();
      }
      case SyntaxKinds.SuperKeyword:
        return parseSuper();
      case SyntaxKinds.ThisKeyword:
        return parseThisExpression();
      case SyntaxKinds.BracesLeftPunctuator:
        return parseObjectExpression();
      case SyntaxKinds.BracketLeftPunctuator:
        return parseArrayExpression();
      case SyntaxKinds.FunctionKeyword:
        return parseFunctionExpression(false);
      case SyntaxKinds.AtPunctuator: {
        return parseClassExpression(parseDecoratorList());
      }
      case SyntaxKinds.ClassKeyword:
        return parseClassExpression(null);
      case SyntaxKinds.ParenthesesLeftPunctuator:
        return parseCoverExpressionORArrowFunction();
      // TODO: consider wrap as function or default case ?
      case SyntaxKinds.PrivateName:
        // recoverable error
        raiseError(ErrorMessageMap.babel_error_private_name_wrong_used, getStartPosition());
        return parsePrivateName();
      // return parsePrivateName();
      case SyntaxKinds.Identifier:
      case SyntaxKinds.LetKeyword:
      case SyntaxKinds.AwaitKeyword:
      case SyntaxKinds.YieldKeyword: {
        const { kind, lineTerminatorFlag: flag } = lookahead();
        // case 0: identifier `=>` ...
        if (kind === SyntaxKinds.ArrowOperator && canParseAsArrowFunction()) {
          const [[argus, strictModeScope], arrowExprScope] = parseWithArrowExpressionScope(() =>
            parseWithLHSLayerReturnScope(() => [parseIdentifierReference()]),
          );
          if (getLineTerminatorFlag()) {
            raiseError(ErrorMessageMap.extra_error_no_line_break_is_allowed_before_arrow, getStartPosition());
          }
          enterArrowFunctionBodyScope();
          const arrowExpr = parseArrowFunctionExpression(
            {
              nodes: argus,
              start: argus[0].start,
              end: argus[0].end,
              trailingComma: false,
            },
            strictModeScope,
            arrowExprScope,
          );
          exitArrowFunctionBodyScope();
          return arrowExpr;
        }
        if (getSourceValue() === "async") {
          // case 1 async function ==> must be async function <id> () {}
          if (kind === SyntaxKinds.FunctionKeyword && !getEscFlag()) {
            const { value, start, end } = expect(SyntaxKinds.Identifier);
            if (getLineTerminatorFlag()) {
              return Factory.createIdentifier(value, start, end);
            }
            return parseFunctionExpression(true);
          }
          if (canParseAsArrowFunction()) {
            // case 2 `async` `(`
            // There might be two case :
            // 1.frist case is there are line change after async, which make this case into
            //   call expression
            // 2.second case is not change line after async, making it become async arrow
            //   function.
            if (kind === SyntaxKinds.ParenthesesLeftPunctuator) {
              const containEsc = getEscFlag();
              const id = parseIdentifierReference();
              const [[meta, strictModeScope], arrowExprScope] = parseWithArrowExpressionScope(() =>
                parseWithCatpureLayer(parseArguments),
              );
              if (flag || !match(SyntaxKinds.ArrowOperator)) {
                return Factory.createCallExpression(
                  id,
                  meta.nodes,
                  false,
                  cloneSourcePosition(id.start),
                  meta.end,
                );
              }
              if (containEsc) {
                throw createMessageError(ErrorMessageMap.invalid_esc_char_in_keyword);
              }
              enterArrowFunctionBodyScope(true);
              const arrowFunExpr = parseArrowFunctionExpression(meta, strictModeScope, arrowExprScope);
              exitArrowFunctionBodyScope();
              return arrowFunExpr;
            }
            // case 3: `async` `Identifer` ...
            // There might be two case :
            // 1.frist case is there are line change after async, or there is no arrow operator,
            //  which make this case into async as identifier
            // 2.second case is not change line after async, making it become async arrow
            //   function.
            if (
              kind === SyntaxKinds.Identifier ||
              kind === SyntaxKinds.YieldKeyword ||
              kind === SyntaxKinds.AwaitKeyword
            ) {
              // async followed by line break
              if (flag) {
                return parseIdentifierReference();
              }
              const isAsyncContainUnicode = getEscFlag();
              const { start, end } = expect(SyntaxKinds.Identifier); // eat async
              const { kind: maybeArrowToken } = lookahead();
              // there is no arrow operator.
              if (maybeArrowToken !== SyntaxKinds.ArrowOperator) {
                return Factory.createIdentifier("async", start, end);
              }
              if (isAsyncContainUnicode) {
                raiseError(ErrorMessageMap.invalid_esc_char_in_keyword, start);
              }
              const [[argus, strictModeScope], arrowExprScope] = parseWithArrowExpressionScope(() =>
                parseWithCatpureLayer(() => [parseIdentifierReference()]),
              );
              if (getLineTerminatorFlag()) {
                raiseError(
                  ErrorMessageMap.extra_error_no_line_break_is_allowed_before_arrow,
                  getStartPosition(),
                );
              }
              enterArrowFunctionBodyScope(true);
              const arrowExpr = parseArrowFunctionExpression(
                {
                  nodes: argus,
                  start: argus[0].start,
                  end: argus[0].end,
                  trailingComma: false,
                },
                strictModeScope,
                arrowExprScope,
              );
              exitArrowFunctionBodyScope();
              return arrowExpr;
            }
          }
        }
        return parseIdentifierReference();
      }
      default:
        throw createUnexpectError();
    }
  }
  function parseRegexLiteral(): RegexLiteral {
    expectButNotEat([SyntaxKinds.DivideOperator, SyntaxKinds.DivideAssignOperator]);
    const startWithAssignOperator = match(SyntaxKinds.DivideAssignOperator);
    const start = getStartPosition();
    // eslint-disable-next-line prefer-const
    let { pattern, flag } = readRegex();
    nextToken();
    if (startWithAssignOperator) {
      pattern = "=" + pattern;
    }
    return Factory.createRegexLiteral(pattern, flag, start, getEndPosition());
  }
  /**
   * IdentifierReference, IdentifierName and BindingIdentifier is not samething in the
   * spec.
   * - IdentifierReference is a id in Lval or Rval
   * - IdentifierName is a property of member expression or object, class
   * - BindingIdentifier is a lval.
   * @returns {Identifier}
   */
  function parseIdentifierReference(): Identifier {
    expectButNotEat([
      SyntaxKinds.Identifier,
      SyntaxKinds.AwaitKeyword,
      SyntaxKinds.YieldKeyword,
      SyntaxKinds.LetKeyword,
    ]);
    // sematic check for a binding identifier
    let identifer: Identifier;
    switch (getToken()) {
      // for most of yield keyword, if it should treat as identifier,
      // it should not in generator function.
      case SyntaxKinds.YieldKeyword: {
        const { value, start, end } = expect(SyntaxKinds.YieldKeyword);
        staticSematicForIdentifierAsYield(start);
        identifer = Factory.createIdentifier(value, start, end);
        break;
      }
      // for most of await keyword, if it should treat as identifier,
      // it should not in async function.
      case SyntaxKinds.AwaitKeyword: {
        const { value, start, end } = expect(SyntaxKinds.AwaitKeyword);
        staticSematicForIdentifierAsAwait(start);
        identifer = Factory.createIdentifier(value, start, end);
        break;
      }
      // let maybe treat as identifier in not strict mode, and not lexical binding declaration.
      // so lexical binding declaration should implement it's own checker logical with parseIdentifierWithKeyword
      case SyntaxKinds.LetKeyword: {
        const { value, start, end } = expect(SyntaxKinds.LetKeyword);
        staticSematicForIdentifierAsLet(start);
        identifer = Factory.createIdentifier(value, start, end);
        break;
      }
      case SyntaxKinds.Identifier: {
        const { value, start, end } = expect(SyntaxKinds.Identifier);
        staticSematicForIdentifierDefault(value, start);
        identifer = Factory.createIdentifier(value, start, end);
        break;
      }
      default: {
        throw createUnexpectError();
      }
    }
    return identifer;
  }
  /**
   * Yield only could be used as a identifier when
   *
   * - it is not in strict mode.
   * - not in a generator context.
   *
   * record it's usage for defer check.
   * @param {SourcePosition} start
   */
  function staticSematicForIdentifierAsYield(start: SourcePosition) {
    if (isCurrentScopeParseYieldAsExpression() || isInStrictMode()) {
      throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
    }
    recordScope(ExpressionScopeKind.YieldIdentifier, start);
  }
  /**
   * Await only could be used as identifirt when
   *
   * - it is not in module mode
   * - not in async context
   *
   * record it's usgae for defer check.
   * @param {SourcePosition} start
   */
  function staticSematicForIdentifierAsAwait(start: SourcePosition) {
    if (isCurrentScopeParseAwaitAsExpression() || config.sourceType === "module") {
      throw createMessageError(ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword);
    }
    // skip if is using await in class property name in async context
    if (isDirectToClassScope() && !isInPropertyName()) {
      return;
    }
    recordScope(ExpressionScopeKind.AwaitIdentifier, start);
  }
  /**
   * Let only could be used as identifirt when
   *
   * - it is not in strict mode
   *
   * record it's usgae for defer check.
   * @param {SourcePosition} start
   */
  function staticSematicForIdentifierAsLet(start: SourcePosition) {
    if (isInStrictMode()) {
      throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
    }
    recordScope(ExpressionScopeKind.LetIdentifiier, start);
  }
  /**
   * Checking the usage for arguments and eval, presverveword
   *
   * - for presverveword, only could be used when not in strict mode
   * - for argument, can not used when
   *   1. in strict mode, and in the lhs
   *   2. in strict mode, not in function.
   * - for eval, can not used when
   *   1. in strict mode, and in the lhs
   *
   * record it's usgae for defer check.
   * @param {SourcePosition} start
   */
  function staticSematicForIdentifierDefault(value: string, start: SourcePosition) {
    const isPreserveWord = PreserveWordSet.has(value);
    if (isPreserveWord) {
      if (isInStrictMode()) {
        throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
      }
      recordScope(ExpressionScopeKind.PresveredWordIdentifier, start);
    }
    if (value === "arguments") {
      if (isInStrictMode()) {
        if (!isEncloseInFunction() && !isInPropertyName()) {
          // invalud usage
          throw createMessageError(ErrorMessageMap.syntax_error_arguments_is_not_valid_in_fields);
        }
        if (strictModeScopeRecorder.isInLHS()) {
          // invalid assignment
          throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
        }
      }
      recordScope(ExpressionScopeKind.ArgumentsIdentifier, start);
    }
    if (value === "eval") {
      if (isInStrictMode() && strictModeScopeRecorder.isInLHS()) {
        throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
      }
      recordScope(ExpressionScopeKind.EvalIdentifier, start);
    }
  }
  /**
   * Relatedly loose function for parseIdentifier, it not only can parse identifier,
   * it also can parse keyword as identifier.
   * @returns {Identifier}
   */
  function parseIdentifierName(): Identifier {
    const { value, start, end } = expect(IdentiferWithKeyworArray);
    return Factory.createIdentifier(value, start, end);
  }
  /**
   * ECMA spec has every strict rule to private name, but in this parser, most of
   * strict rule check is implemented by callee, there we only gonna check is in
   * class scope or not.
   * @returns {PrivateName}
   */
  function parsePrivateName(): PrivateName {
    const { value, start, end } = expect(SyntaxKinds.PrivateName);
    if (!isInClassScope()) {
      throw createMessageError(ErrorMessageMap.syntax_error_unexpected_hash_used_outside_of_class_body); // semantics check for private
    }
    return Factory.createPrivateName(value, start, end);
  }
  function parseNullLiteral() {
    const { start, end } = expect(SyntaxKinds.NullKeyword);
    return Factory.createNullLiteral(start, end);
  }
  function parseUndefinedLiteral() {
    const { start, end } = expect(SyntaxKinds.UndefinedKeyword);
    return Factory.createUndefinedLiteral(start, end);
  }
  function parseDecimalLiteral() {
    const { start, end, value } = expect(SyntaxKinds.DecimalLiteral);
    return Factory.createDecimalLiteral(value, start, end);
  }
  function parseDecimalBigIntegerLiteral() {
    const { start, end, value } = expect(SyntaxKinds.DecimalBigIntegerLiteral);
    return Factory.createDecimalBigIntegerLiteral(value, start, end);
  }
  function parseNonOctalDecimalLiteral() {
    if (isInStrictMode()) {
      throw createMessageError(ErrorMessageMap.Syntax_error_0_prefixed_octal_literals_are_deprecated);
    }
    const { start, end, value } = expect(SyntaxKinds.NonOctalDecimalLiteral);
    return Factory.createNonOctalDecimalLiteral(value, start, end);
  }
  function parseBinaryIntegerLiteral() {
    const { start, end, value } = expect(SyntaxKinds.BinaryIntegerLiteral);
    return Factory.createBinaryIntegerLiteral(value, start, end);
  }
  function parseBinaryBigIntegerLiteral() {
    const { start, end, value } = expect(SyntaxKinds.BinaryBigIntegerLiteral);
    return Factory.createBinaryBigIntegerLiteral(value, start, end);
  }
  function parseOctalIntegerLiteral() {
    const { start, end, value } = expect(SyntaxKinds.OctalIntegerLiteral);
    return Factory.createOctalIntegerLiteral(value, start, end);
  }
  function parseOctalBigIntegerLiteral() {
    const { start, end, value } = expect(SyntaxKinds.OctalBigIntegerLiteral);
    return Factory.createOctBigIntegerLiteral(value, start, end);
  }
  function parseHexIntegerLiteral() {
    const { start, end, value } = expect(SyntaxKinds.HexIntegerLiteral);
    return Factory.createHexIntegerLiteral(value, start, end);
  }
  function parseHexBigIntegerLiteral() {
    const { start, end, value } = expect(SyntaxKinds.HexBigIntegerLiteral);
    return Factory.createHexBigIntegerLiteral(value, start, end);
  }
  function parseLegacyOctalIntegerLiteral() {
    if (isInStrictMode()) {
      throw createMessageError(ErrorMessageMap.Syntax_error_0_prefixed_octal_literals_are_deprecated);
    }
    const { start, end, value } = expect(SyntaxKinds.LegacyOctalIntegerLiteral);
    return Factory.createLegacyOctalIntegerLiteral(value, start, end);
  }
  function parseNumericLiteral(): NumberLiteral {
    switch (getToken()) {
      case SyntaxKinds.DecimalLiteral:
        return parseDecimalLiteral();
      case SyntaxKinds.DecimalBigIntegerLiteral:
        return parseDecimalBigIntegerLiteral();
      case SyntaxKinds.NonOctalDecimalLiteral:
        return parseNonOctalDecimalLiteral();
      case SyntaxKinds.BinaryIntegerLiteral:
        return parseBinaryIntegerLiteral();
      case SyntaxKinds.BinaryBigIntegerLiteral:
        return parseBinaryBigIntegerLiteral();
      case SyntaxKinds.OctalIntegerLiteral:
        return parseOctalIntegerLiteral();
      case SyntaxKinds.OctalBigIntegerLiteral:
        return parseOctalBigIntegerLiteral();
      case SyntaxKinds.HexIntegerLiteral:
        return parseHexIntegerLiteral();
      case SyntaxKinds.HexBigIntegerLiteral:
        return parseHexBigIntegerLiteral();
      case SyntaxKinds.LegacyOctalIntegerLiteral:
        return parseLegacyOctalIntegerLiteral();
      default:
        throw createMessageError("");
    }
  }
  function parseStringLiteral() {
    const { start, end, value } = expect(SyntaxKinds.StringLiteral);
    return Factory.createStringLiteral(value, start, end);
  }
  function parseBoolLiteral() {
    const { start, end, value } = expect([SyntaxKinds.TrueKeyword, SyntaxKinds.FalseKeyword]);
    return Factory.createBoolLiteral(value === "true" ? true : false, start, end);
  }
  function parseTemplateLiteral(tagged: boolean) {
    if (!match([SyntaxKinds.TemplateHead, SyntaxKinds.TemplateNoSubstitution])) {
      throw createUnreachError([SyntaxKinds.TemplateHead, SyntaxKinds.TemplateNoSubstitution]);
    }
    const templateLiteralStart = getStartPosition();
    if (match(SyntaxKinds.TemplateNoSubstitution)) {
      if (!tagged && lexer.getTemplateLiteralTag()) {
        throw createMessageError(ErrorMessageMap.v8_error_invalid_hexadecimal_escape_sequence);
      }
      const value = getSourceValue();
      const templateLiteralEnd = getEndPosition();
      nextToken();
      return Factory.createTemplateLiteral(
        [Factory.createTemplateElement(value, true, templateLiteralStart, templateLiteralEnd)],
        [],
        templateLiteralStart,
        templateLiteralEnd,
      );
    }
    nextToken();
    const expressions = [parseExpressionAllowIn()];
    const quasis: Array<TemplateElement> = [];
    while (
      !match(SyntaxKinds.TemplateTail) &&
      match(SyntaxKinds.TemplateMiddle) &&
      !match(SyntaxKinds.EOFToken)
    ) {
      if (!tagged && lexer.getTemplateLiteralTag()) {
        throw createMessageError(ErrorMessageMap.v8_error_invalid_hexadecimal_escape_sequence);
      }
      quasis.push(
        Factory.createTemplateElement(getSourceValue(), false, getStartPosition(), getEndPosition()),
      );
      nextToken();
      expressions.push(parseExpressionAllowIn());
    }
    if (match(SyntaxKinds.EOFToken)) {
      throw createUnexpectError();
    }
    if (!tagged && lexer.getTemplateLiteralTag()) {
      throw createMessageError(ErrorMessageMap.v8_error_invalid_hexadecimal_escape_sequence);
    }
    quasis.push(Factory.createTemplateElement(getSourceValue(), true, getStartPosition(), getEndPosition()));
    const templateLiteralEnd = getEndPosition();
    nextToken();
    return Factory.createTemplateLiteral(quasis, expressions, templateLiteralStart, templateLiteralEnd);
  }
  /**
   * Parse import meta property
   * ```
   * ImportMeta := import . meta
   * ```
   * @returns {MetaProperty}
   */
  function parseImportMeta(): MetaProperty {
    const { start, end } = expect(SyntaxKinds.ImportKeyword);
    expect(SyntaxKinds.DotOperator);
    const ecaFlag = getEscFlag();
    const property = parseIdentifierReference();
    staticSematicForImportMeta(property, ecaFlag);
    return Factory.createMetaProperty(
      Factory.createIdentifier("import", start, end),
      property,
      start,
      cloneSourcePosition(property.end),
    );
  }
  /**
   * Sematic check for import meta
   * - import member expression's property only could be meta
   * - meta should be a contextual keyword
   * - import meta can't use in script mode
   * @param property
   * @param ecaFlag
   */
  function staticSematicForImportMeta(property: Identifier, ecaFlag: boolean) {
    if (property.name !== "meta") {
      throw createMessageError(
        ErrorMessageMap.babel_error_the_only_valid_meta_property_for_import_is_import_meta,
      );
    }
    if (ecaFlag) {
      throw createMessageError(ErrorMessageMap.invalid_esc_char_in_keyword);
    }
    if (config.sourceType === "script") {
      throw createMessageError(
        ErrorMessageMap.babel_error_import_meta_may_appear_only_with_source_type_module,
      );
    }
  }
  /**
   * Parse Import call
   * ```
   * ImportCall := import ( AssignmentExpression[+In], (optional support attribute) )
   * ```
   * @returns {CallExpression}
   */
  function parseImportCall(): CallExpression {
    const { start, end } = expect(SyntaxKinds.ImportKeyword);
    expect(SyntaxKinds.ParenthesesLeftPunctuator);
    const argument = parseAssignmentExpressionAllowIn();
    const option = parseImportAttributeOptional();
    const { end: finalEnd } = expect(SyntaxKinds.ParenthesesRightPunctuator);
    return Factory.createCallExpression(
      Factory.createImport(start, end),
      option ? [argument, option] : [argument],
      false,
      cloneSourcePosition(start),
      cloneSourcePosition(finalEnd),
    );
  }
  /**
   * Parse import attribute (stage 3 syntax)
   * ref: https://github.com/tc39/proposal-import-attributes
   * @returns
   */
  function parseImportAttributeOptional(): Expression | null {
    if (!config.plugins.includes("importAttributes") && !config.plugins.includes("importAssertions")) {
      return null;
    }
    if (!match(SyntaxKinds.CommaToken)) {
      return null;
    }
    nextToken();
    if (match(SyntaxKinds.ParenthesesRightPunctuator)) {
      return null;
    }
    const option = parseAssignmentExpressionAllowIn();
    if (match(SyntaxKinds.CommaToken)) {
      nextToken();
    }
    return option;
  }
  /**
   * Parse new target
   * ```
   * NewTarget := new . target
   * ```
   * @returns {MetaProperty}
   */
  function parseNewTarget(): MetaProperty {
    const { start, end } = expect(SyntaxKinds.NewKeyword);
    expect(SyntaxKinds.DotOperator);
    staticSematicForNewTarget(start);
    const targetStart = getStartPosition();
    const targetEnd = getEndPosition();
    nextToken();
    return Factory.createMetaProperty(
      Factory.createIdentifier("new", start, end),
      Factory.createIdentifier("target", targetStart, targetEnd),
      start,
      targetEnd,
    );
  }
  function staticSematicForNewTarget(start: SourcePosition) {
    if (!isContextKeyword("target")) {
      // recoverable error
      throw createUnexpectError();
    }
    if (!config.allowNewTargetOutsideFunction && isTopLevel() && !isInClassScope()) {
      // recoverable error
      raiseError(ErrorMessageMap.babel_error_new_target_can_only_be_used_in_class_or_function_scope, start);
    }
  }
  /**
   * Parse New Expression, the callee part of new expression is a trick one,
   * this is not a member expression, it can not contain qustion dot or call
   * expression.
   * ```
   * NewExpression := 'new' NewExpression
   *               := 'new' MemberExpressionWithoutOptional Arugment?
   * ```
   * @returns {Expression}
   */
  function parseNewExpression(): Expression {
    const { start } = expect(SyntaxKinds.NewKeyword);
    // maybe is new.target
    if (match(SyntaxKinds.NewKeyword) && lookahead().kind !== SyntaxKinds.DotOperator) {
      return parseNewExpression();
    }
    let base = parsePrimaryExpression();
    staticSematicForBaseInNewExpression(base);
    base = parseNewExpressionCallee(base);
    if (!match(SyntaxKinds.ParenthesesLeftPunctuator)) {
      // accpect New XXX -> No argument
      return Factory.createNewExpression(base, [], start, cloneSourcePosition(base.end));
    }
    const { end, nodes } = parseArguments();
    return Factory.createNewExpression(base, nodes, start, end);
  }
  /**
   * The base of new expression can not be a import call expression, if must be a import
   * call expression, it must be have a paran.
   * @param {Expression} base
   */
  function staticSematicForBaseInNewExpression(base: Expression) {
    if (!base.parentheses && isCallExpression(base) && base.callee.kind === SyntaxKinds.Import) {
      // recoverable error
      raiseError(ErrorMessageMap.babel_error_cannot_use_new_with_import, base.start);
    }
  }
  /**
   * Parse the callee of new expression, base of new expression can not
   * be a call expression or a qustion dot expression.
   * @param {Expression} base
   * @returns
   */
  function parseNewExpressionCallee(base: Expression): Expression {
    while (
      match(SyntaxKinds.DotOperator) ||
      match(SyntaxKinds.BracketLeftPunctuator) ||
      match(SyntaxKinds.QustionDotOperator)
    ) {
      if (match(SyntaxKinds.QustionDotOperator)) {
        // recoverable error
        raiseError(
          ErrorMessageMap.babel_error_constructors_in_after_an_optional_chain_are_not_allowed,
          getStartPosition(),
        );
      }
      base = parseMemberExpression(base, false);
    }
    return base;
  }
  /**
   * Parse super expression, only parse the arguments and super or a first level
   * of access of member expression. Contain sematic check:
   * - Super call only valid in ctor.
   * - super property can be used in any method of class.
   * ```
   * SuperCall      := super argument
   * SuperProperty  := super[Expression]
   *                := super.IdentifierName
   * ```
   * @returns {Expression}
   */
  function parseSuper(): Expression {
    if (!isCurrentClassExtend()) {
      // recoverable error
      raiseError(
        ErrorMessageMap.syntax_error_super_is_only_valid_in_derived_class_constructors,
        getStartPosition(),
      );
    }
    const { start: keywordStart, end: keywordEnd } = expect([SyntaxKinds.SuperKeyword]);
    if (match(SyntaxKinds.ParenthesesLeftPunctuator)) {
      if (!lexicalScopeRecorder.isInCtor()) {
        // recoverable error
        raiseError(ErrorMessageMap.babel_error_call_super_outside_of_ctor, keywordStart);
      }
      const { nodes, end: argusEnd } = parseArguments();
      return Factory.createCallExpression(
        Factory.createSuper(keywordStart, keywordEnd),
        nodes,
        false,
        cloneSourcePosition(keywordStart),
        argusEnd,
      );
    }
    let property: Expression;
    let isComputed = false;
    let end: SourcePosition;
    switch (getToken()) {
      case SyntaxKinds.DotOperator: {
        nextToken();
        if (match(SyntaxKinds.PrivateName)) {
          property = parsePrivateName();
          // recoverable error
          raiseError(ErrorMessageMap.babel_error_private_fields_cant_be_accessed_on_super, property.start);
        } else {
          property = parseIdentifierName();
        }
        end = cloneSourcePosition(property.end);
        break;
      }
      case SyntaxKinds.BracketLeftPunctuator: {
        nextToken();
        property = parseExpressionAllowIn();
        isComputed = true;
        ({ end } = expect(SyntaxKinds.BracketRightPunctuator));
        break;
      }
      case SyntaxKinds.QustionDotOperator:
        // recoverable error.
        throw createMessageError(ErrorMessageMap.babel_invalid_usage_of_super_call);
      default:
        throw createUnexpectError();
    }
    return Factory.createMemberExpression(
      isComputed,
      Factory.createSuper(keywordStart, keywordEnd),
      property,
      false,
      cloneSourcePosition(keywordStart),
      end,
    );
  }
  /**
   * Parse this expression, only eat `this` token
   * @returns {ThisExpression}
   */
  function parseThisExpression(): ThisExpression {
    const { start, end } = expect([SyntaxKinds.ThisKeyword]);
    return Factory.createThisExpression(start, end);
  }
  /**
   * Parse ObjectLiterial, object property just a list of PropertyDefinition.
   * ### Trailing Comma problem
   * object expression maybe transform into `ObjectPattern` in `AssignmentExpression`
   * so i add a trailing comma field to object expression to AST struct for `toAssignment`
   * function.
   * ```
   *   ObjectLiteral := '{' PropertyDefinitionList ','? '}'
   *   PropertyDefinitionList := PropertyDefinitionList ',' PropertyDefinition
   *                          := PropertyDefinition
   * ```
   * @returns {Expression} actually is `ObjectExpression`
   */
  function parseObjectExpression(): Expression {
    const { start } = expect(SyntaxKinds.BracesLeftPunctuator);
    let isStart = true;
    const propertyDefinitionList: Array<PropertyDefinition> = [];
    let trailingComma = false;
    const protoPropertyNames: Array<PropertyName> = [];
    while (!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
      if (isStart) {
        propertyDefinitionList.push(parsePropertyDefinition(protoPropertyNames));
        isStart = false;
        continue;
      }
      expect(SyntaxKinds.CommaToken);
      if (match(SyntaxKinds.BracesRightPunctuator) || match(SyntaxKinds.EOFToken)) {
        trailingComma = true;
        break;
      }
      propertyDefinitionList.push(parsePropertyDefinition(protoPropertyNames));
    }
    staticSematicEarlyErrorForObjectExpression(protoPropertyNames);
    const { end } = expect(SyntaxKinds.BracesRightPunctuator);
    return Factory.createObjectExpression(propertyDefinitionList, trailingComma, start, end);
  }
  /**
   * Adding `__proto__` property key to duplication set, if object expression transform to pattern
   * duplication of `__proto__` is ok, but when is not pattern, it not a correct syntax.
   * @param {Array<PropertyName>} protoPropertyNames
   * reference: 13.2.5.1
   */
  function staticSematicEarlyErrorForObjectExpression(protoPropertyNames: Array<PropertyName>) {
    if (protoPropertyNames.length > 1) {
      for (let index = 1; index < protoPropertyNames.length; ++index)
        context.propertiesProtoDuplicateSet.add(protoPropertyNames[index]);
    }
  }
  /**
   * Helper for property definition to record the object property which property is
   * `__proto__`, since duplication of `__proto__` is a error.
   * @param protoPropertyNames
   * @param propertyName
   * @param isComputed
   * @returns
   */
  function staticSematicHelperRecordPropertyNameForEarlyError(
    protoPropertyNames: Array<PropertyName>,
    propertyName: PropertyName,
    isComputed: boolean,
  ) {
    if (isComputed) return;
    if (
      (isIdentifer(propertyName) && propertyName.name === "__proto__") ||
      (isStringLiteral(propertyName) && propertyName.value === "__proto__")
    ) {
      protoPropertyNames.push(propertyName);
      return;
    }
  }
  /**
   * Parse PropertyDefinition
   * ```
   *  PropertyDefinition := MethodDefintion
   *                     := Property
   *                     := SpreadElement
   * Property := PropertyName '=' AssignmentExpression
   * SpreadElement := '...' AssigmentExpression
   * ```
   * ### How to parse
   * 1. start with `...` operator, must be SpreadElment
   * 2. start with privatename is syntax error, but it is common, so we handle it as sematic problem.
   * 3. check is start with method modifier prefix by helper function `checkIsMethodStartWithModifier`.
   * 4. default case, property name with colon operator.
   * 5. this is speical case, we accept a coverinit in object expression, because object expression
   *    might be transform into object pattern, so we mark accept it and mark it. it coverInit of
   *    object expression is not transform by `toAssignment` function, it would throw error in the
   *    end of `parseProgram`
   * #### ref: https://tc39.es/ecma262/#prod-PropertyDefinition
   */
  function parsePropertyDefinition(protoPropertyNameLocations: Array<PropertyName>): PropertyDefinition {
    // semantics check for private
    if (match(SyntaxKinds.PrivateName)) {
      // TODO: make it recoverable
      throw createMessageError(ErrorMessageMap.extra_error_private_field_in_object_expression);
    }
    // spreadElement
    if (match(SyntaxKinds.SpreadOperator)) {
      const spreadElementStart = getStartPosition();
      nextToken();
      const expr = parseAssignmentExpressionAllowIn();
      return Factory.createSpreadElement(expr, spreadElementStart, cloneSourcePosition(expr.end));
    }
    // start with possible method modifier
    if (checkIsMethodStartWithModifier()) {
      return parseMethodDefintion() as ObjectMethodDefinition;
    }
    // otherwise, it would be Property start with PropertyName or MethodDeinftion start with PropertyName
    const isComputedRef = { isComputed: false };
    const propertyName = parsePropertyName(isComputedRef);
    if (match(SyntaxKinds.ParenthesesLeftPunctuator)) {
      return parseMethodDefintion(false, [propertyName, isComputedRef.isComputed]) as ObjectMethodDefinition;
    }
    if (isComputedRef.isComputed || match(SyntaxKinds.ColonPunctuator)) {
      staticSematicHelperRecordPropertyNameForEarlyError(
        protoPropertyNameLocations,
        propertyName,
        isComputedRef.isComputed,
      );
      nextToken();
      const expr = parseAssignmentExpressionAllowIn();
      return Factory.createObjectProperty(
        propertyName,
        expr,
        isComputedRef.isComputed,
        false,
        cloneSourcePosition(propertyName.start),
        cloneSourcePosition(expr.end),
      );
    }
    recordIdentifierValue(propertyName);
    if (match(SyntaxKinds.AssginOperator)) {
      staticSematicHelperRecordPropertyNameForEarlyError(
        protoPropertyNameLocations,
        propertyName,
        isComputedRef.isComputed,
      );
      nextToken();
      const expr = parseAssignmentExpressionAllowIn();
      const property = Factory.createObjectProperty(
        propertyName,
        expr,
        isComputedRef.isComputed,
        false,
        cloneSourcePosition(propertyName.start),
        cloneSourcePosition(expr.end),
      );
      context.propertiesInitSet.add(property);
      return property;
    }
    staticSematicForShortedPropertyNameInObjectLike(propertyName);
    staticSematicForShortedPropertyNameInObjectExpression(propertyName as Identifier);
    return Factory.createObjectProperty(
      propertyName,
      undefined,
      isComputedRef.isComputed,
      true,
      cloneSourcePosition(propertyName.start),
      cloneSourcePosition(propertyName.end),
    );
  }
  function recordIdentifierValue(propertyName: ModuleItem) {
    if (isIdentifer(propertyName)) {
      if (propertyName.name === "await") {
        recordScope(ExpressionScopeKind.AwaitIdentifier, propertyName.start);
      }
      if (propertyName.name === "yield") {
        recordScope(ExpressionScopeKind.YieldIdentifier, propertyName.start);
      }
      if (propertyName.name === "arguments") {
        recordScope(ExpressionScopeKind.ArgumentsIdentifier, propertyName.start);
      }
      if (propertyName.name === "eval") {
        recordScope(ExpressionScopeKind.EvalIdentifier, propertyName.start);
      }
      if (propertyName.name === "let") {
        recordScope(ExpressionScopeKind.LetIdentifiier, propertyName.start);
      }
      if (PreserveWordSet.has(propertyName.name)) {
        recordScope(ExpressionScopeKind.PresveredWordIdentifier, propertyName.start);
      }
    }
  }
  /**
   * Parse PropertyName, using context ref which passed in to record this property is computed or not.
   *
   * ### Extra action need for callee
   * In this function, we accept keywrod as property name, but when the property name use as a shorted
   * property name, it will be a syntax error, so father syntax check is needed handle by callee.
   * ```
   * PropertyName := Identifer (IdentifierName, not BindingIdentifier)
   *              := NumberLiteral
   *              := StringLiteral
   *              := ComputedPropertyName
   * ComputedPropertyName := '[' AssignmentExpression ']'
   * ```
   * ref: https://tc39.es/ecma262/#prod-PropertyName
   * @returns {PropertyName}
   */
  function parsePropertyName(isComputedRef: { isComputed: boolean }): PropertyName {
    expectButNotEat([
      SyntaxKinds.BracketLeftPunctuator,
      SyntaxKinds.StringLiteral,
      ...IdentiferWithKeyworArray,
      ...NumericLiteralKinds,
    ]);
    switch (getToken()) {
      case SyntaxKinds.StringLiteral: {
        return parseStringLiteral();
      }
      case SyntaxKinds.BracketLeftPunctuator: {
        nextToken();
        lexicalScopeRecorder.enterPropertyName();
        const expr = parseAssignmentExpressionAllowIn();
        lexicalScopeRecorder.exitPropertyName();
        expect(SyntaxKinds.BracketRightPunctuator);
        isComputedRef.isComputed = true;
        return expr;
      }
      default: {
        if (match(NumericLiteralKinds)) {
          return parseNumericLiteral();
        }
        // propty name is a spical test of binding identifier.
        // if `await` and `yield` is propty name with colon (means assign), it dose not affected by scope.
        if (match(IdentiferWithKeyworArray)) {
          const identifer = parseIdentifierName();
          return identifer;
        }
        throw createUnexpectError();
      }
    }
  }
  /**
   * Sematic check when a property name is shorted property
   * @param {PropertyName} propertyName
   * @returns
   */
  function staticSematicForShortedPropertyNameInObjectLike(propertyName: PropertyName) {
    if (isStringLiteral(propertyName) || isNumnerLiteral(propertyName)) {
      // recoverable error.
      raiseError(
        ErrorMessageMap.extra_error_when_binding_pattern_property_name_is_literal_can_not_be_shorted,
        propertyName.start,
      );
    }
  }
  /**
   * Like `staticCheckForPropertyNameAsSingleBinding` for object pattern, when shorted property in
   * object expression, if will no longer just
   * @param {PropertyName} propertyName
   * @returns
   */
  function staticSematicForShortedPropertyNameInObjectExpression(propertyName: Identifier) {
    if (propertyName.name === "await") {
      if (isCurrentScopeParseAwaitAsExpression() || config.sourceType === "module") {
        throw createMessageError(ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword);
      }
      return;
    }
    if (propertyName.name === "yield") {
      if (isCurrentScopeParseYieldAsExpression() || isInStrictMode()) {
        throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
      }
      return;
    }
    if (KeywordSet.has(propertyName.name)) {
      // recoverable error
      raiseError(ErrorMessageMap.babel_error_unexpected_keyword, propertyName.start);
    }
    if (PreserveWordSet.has(propertyName.name) && isInStrictMode()) {
      // recoverable error
      raiseError(ErrorMessageMap.babel_error_unexpected_reserved_word, propertyName.start);
    }
  }
  /** Parse MethodDefintion, this method should allow using when in class or in object literal.
   *  1. ClassElement can be PrivateName, when it used in object literal, it should throw a error.
   *  2. It should parse modifier when `withPropertyName` is falsey.
   *
   * ### Parse Modifier
   * we parse modifier according to the pattern `('set' | 'get')? 'async' '*' ClassElement `, this
   * is not a regulat syntax, it may accept wrong syntax, but by accept more case then spec, we cam
   * provide more concies sematic message to developer.
   * ```
   * MethodDefintion := ClassElementName BindingList FunctionBody
   *                 := AyncMethod
   *                 := GeneratorMethod
   *                 := AsyncGeneratorMethod
   *                 := 'set' ClassElementName BindingList FunctionBody
   *                 := 'get' ClassElementName '('')' FunctionBody
   * AyncMethod := 'async' ClassElementName BindingList FunctionBody
   * GeneratorMethod := '*' ClassElementName BindingList FunctionBody
   * AsyncGeneratorMethod := 'async' '*' ClassElementName BindingList FunctionBody
   * ClassElementName := PropertyName
   *                   := PrivateName
   * ```
   * @param {boolean} inClass is used in class or not.
   * @param {PropertyName | PrivateName | undefined } withPropertyName parse methodDeinfition with exited propertyName or not
   * @param {boolean} isStatic
   * @returns {ObjectMethodDefinition | ClassMethodDefinition | ObjectAccessor | ClassAccessor  | ClassConstructor}
   */
  function parseMethodDefintion(
    inClass: boolean = false,
    withPropertyName: [PropertyName | PrivateName, boolean] | undefined = undefined,
    isStatic: boolean = false,
    decorators: [Decorator] | null = null,
  ): ObjectMethodDefinition | ClassMethodDefinition | ObjectAccessor | ClassAccessor | ClassConstructor {
    if (!checkIsMethodStartWithModifier() && !withPropertyName) {
      throw createUnreachError([SyntaxKinds.MultiplyAssignOperator, SyntaxKinds.Identifier]);
    }
    /**
     * Step 1 : if not with propertyName , parse modifier frist, otherwise, if with propertyName, it shouldn't do anything.
     * structure would be like : ('set' | 'get')? 'async' '*' PropertyName  ...., this strcuture isn't match the spec.
     * but in this structure, we can detect some syntax error more concies, like set and get can not use with async
     * or generator.
     */
    let type: MethodDefinition["type"] = "method";
    let isAsync: MethodDefinition["async"] = false;
    let generator: MethodDefinition["generator"] = false;
    let computed: MethodDefinition["computed"] = withPropertyName ? withPropertyName[1] : false;
    let start: SourcePosition | null = null;
    let propertyName: PropertyName;
    if (!withPropertyName) {
      // frist, is setter or getter
      if (isContextKeyword("set")) {
        type = "set";
        start = getStartPosition();
        nextToken();
      } else if (isContextKeyword("get")) {
        type = "get";
        start = getStartPosition();
        nextToken();
      }
      // second, parser async and generator
      const { kind } = lookahead();
      if (isContextKeyword("async") && kind !== SyntaxKinds.ParenthesesLeftPunctuator) {
        start = getStartPosition();
        isAsync = true;
        nextToken();
        if (match(SyntaxKinds.MultiplyOperator)) {
          nextToken();
          generator = true;
        }
      } else if (match(SyntaxKinds.MultiplyOperator)) {
        start = getStartPosition();
        generator = true;
        nextToken();
      }
      if (match(SyntaxKinds.PrivateName)) {
        propertyName = parsePrivateName();
        defPrivateName(propertyName.name, type === "method" ? "other" : isStatic ? `static-${type}` : type);
      } else {
        const isComputedRef = { isComputed: false };
        propertyName = parsePropertyName(isComputedRef);
        computed = isComputedRef.isComputed;
      }
      if (!start) start = cloneSourcePosition(propertyName.start);
    } else {
      start = cloneSourcePosition(withPropertyName[0].start);
      propertyName = withPropertyName[0];
    }
    const isCtor = inClass && !isStatic && !computed && helperIsPropertyNameIsCtor(propertyName);
    if (isCtor) {
      lexicalScopeRecorder.enterCtor();
      if (lexicalScopeRecorder.testAndSetCtor()) {
        raiseError(ErrorMessageMap.v8_error_a_class_may_only_have_one_constructor, propertyName.start);
      }
    }
    enterFunctionScope(isAsync, generator);
    const [parmas, scope] = parseWithCatpureLayer(parseFunctionParam);
    const body = parseFunctionBody();
    postStaticSematicEarlyErrorForStrictModeOfFunction(null, scope);
    exitFunctionScope(true);
    if (isCtor) lexicalScopeRecorder.exitCtor();
    /**
     * Step 2: semantic and more concise syntax check instead just throw a unexpect
     * token error.
     */
    staticSematicEarlyErrorForClassMethodDefinition(
      propertyName,
      inClass,
      isStatic,
      isAsync,
      generator,
      parmas,
      type,
    );
    /**
     * Step 3 return based on type, if accessor or methodDefintion
     */
    if (inClass) {
      if (isCtor) {
        if (decorators) {
          raiseError(
            ErrorMessageMap.babel_error_decorators_can_not_be_used_with_a_constructor,
            decorators[0].start,
          );
        }
        return Factory.createClassConstructor(
          propertyName as ClassConstructor["key"],
          body,
          parmas,
          start as SourcePosition,
          cloneSourcePosition(body.end),
        );
      }
      if (type === "set" || type === "get") {
        return Factory.createClassAccessor(
          propertyName,
          body,
          parmas,
          type,
          computed,
          decorators,
          start as SourcePosition,
          cloneSourcePosition(body.end),
        );
      }
      return Factory.createClassMethodDefintion(
        propertyName,
        body,
        parmas,
        isAsync,
        generator,
        computed,
        isStatic,
        decorators,
        start ? start : cloneSourcePosition(propertyName.start),
        cloneSourcePosition(body.end),
      );
    }
    if (type === "set" || type === "get") {
      return Factory.createObjectAccessor(
        propertyName,
        body,
        parmas,
        type,
        computed,
        start as SourcePosition,
        cloneSourcePosition(body.end),
      );
    }
    return Factory.createObjectMethodDefintion(
      propertyName,
      body,
      parmas,
      isAsync,
      generator,
      computed,
      start ? start : cloneSourcePosition(propertyName.start),
      cloneSourcePosition(body.end),
    );
  }
  /**
   * This is a helper function for object expression and class for determiate is property
   * a method definition or not.
   *
   * Please notes that this function not only accept regualer syntax, but also accept something
   * like set and get generator, it will left sematic job for `parseMetodDefinition` method.
   * @returns  {boolean}
   */
  function checkIsMethodStartWithModifier(): boolean {
    if (match(SyntaxKinds.MultiplyOperator)) {
      return true;
    }
    const { kind, lineTerminatorFlag: flag } = lookahead();
    const isLookAheadValidatePropertyNameStart =
      Keywords.find((keyword) => keyword === kind) ||
      kind === SyntaxKinds.Identifier ||
      kind === SyntaxKinds.PrivateName ||
      kind === SyntaxKinds.StringLiteral ||
      NumericLiteralKinds.includes(kind) ||
      kind === SyntaxKinds.BracketLeftPunctuator ||
      kind === SyntaxKinds.MultiplyOperator;
    if (isContextKeyword("set") && isLookAheadValidatePropertyNameStart) {
      return true;
    }
    if (isContextKeyword("get") && isLookAheadValidatePropertyNameStart) {
      return true;
    }
    if (isContextKeyword("async") && isLookAheadValidatePropertyNameStart && !flag) {
      return true;
    }
    return false;
  }
  function helperIsPropertyNameIsCtor(propertyName: PropertyName) {
    switch (propertyName.kind) {
      case SyntaxKinds.Identifier: {
        return propertyName.name === "constructor";
      }
      case SyntaxKinds.StringLiteral: {
        return propertyName.value === "constructor";
      }
      default: {
        return false;
      }
    }
  }
  /**
   * Spec def of class method, only implement some of spec.
   * @param propertyName
   * @param isClass
   * @param isStatic
   * @param isAsync
   * @param isGenerator
   * @param params
   * @param type
   * reference: https://tc39.es/ecma262/#sec-class-definitions-static-semantics-early-errors
   */
  function staticSematicEarlyErrorForClassMethodDefinition(
    propertyName: PropertyName,
    isClass: boolean,
    isStatic: boolean,
    isAsync: boolean,
    isGenerator: boolean,
    params: Array<Pattern>,
    type: MethodDefinition["type"],
  ) {
    // general check
    if (type === "get" && params.length > 0) {
      raiseError(ErrorMessageMap.syntax_error_getter_functions_must_have_no_arguments, propertyName.start);
    }
    if (type === "set") {
      if (params.length !== 1) {
        raiseError(ErrorMessageMap.syntax_error_setter_functions_must_have_one_argument, params[0].start);
      }
      for (const param of params) {
        if (isRestElement(param)) {
          raiseError(
            ErrorMessageMap.syntax_error_setter_functions_must_have_one_argument_not_rest,
            param.start,
          );
        }
      }
    }
    if (type === "get" && (isAsync || isGenerator)) {
      raiseError(ErrorMessageMap.extra_error_getter_can_not_be_async_or_generator, propertyName.start);
    }
    if (type === "set" && (isAsync || isGenerator)) {
      raiseError(ErrorMessageMap.extra_error_setter_can_not_be_async_or_generator, propertyName.start);
    }
    // class check
    if (isClass) {
      let valueOfName: string | undefined,
        isPrivate = false,
        fromLiteral = false; //
      if (isStringLiteral(propertyName)) {
        valueOfName = propertyName.value;
        fromLiteral = true;
      } else if (isIdentifer(propertyName)) {
        valueOfName = propertyName.name;
      } else if (isPrivateName(propertyName)) {
        valueOfName = propertyName.name;
        isPrivate = true;
      }
      if (valueOfName === "constructor" && !fromLiteral) {
        if (isAsync) {
          raiseError(
            ErrorMessageMap.v8_error_class_constructor_may_not_be_an_async_method,
            propertyName.start,
          );
        }
        if (isGenerator) {
          raiseError(ErrorMessageMap.v8_error_class_constructor_may_not_be_a_generator, propertyName.start);
        }
        if (type === "get" || type === "set") {
          raiseError(ErrorMessageMap.v8_error_class_constructor_may_not_be_an_accessor, propertyName.start);
        }
        if (isPrivate) {
          raiseError(
            ErrorMessageMap.v8_error_class_may_not_have_a_private_field_named_constructor,
            propertyName.start,
          );
        }
      }
      if (valueOfName === "prototype" && !isPrivate && type === "method" && isStatic) {
        raiseError(
          ErrorMessageMap.v8_error_class_may_not_have_static_property_named_prototype,
          propertyName.start,
        );
      }
    }
  }
  function parseArrayExpression() {
    const { start } = expect(SyntaxKinds.BracketLeftPunctuator);
    const elements: Array<Expression | null> = [];
    let tralingComma = false;
    let isStart = true;
    while (!match(SyntaxKinds.BracketRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
      if (isStart) {
        isStart = false;
      } else {
        expect(SyntaxKinds.CommaToken);
      }
      if (match([SyntaxKinds.BracketRightPunctuator, SyntaxKinds.EOFToken])) {
        tralingComma = true;
        break;
      }
      if (match(SyntaxKinds.CommaToken)) {
        elements.push(null);
        continue;
      }
      if (match(SyntaxKinds.SpreadOperator)) {
        const start = getStartPosition();
        nextToken();
        const expr = parseAssignmentExpressionAllowIn();
        elements.push(Factory.createSpreadElement(expr, start, cloneSourcePosition(expr.end)));
      } else {
        const expr = parseAssignmentExpressionAllowIn();
        elements.push(expr);
      }
    }
    const { end } = expect(SyntaxKinds.BracketRightPunctuator);
    return Factory.createArrayExpression(elements, start, end, tralingComma);
  }
  function parseFunctionExpression(isAsync: boolean) {
    enterFunctionScope(isAsync);
    const funcExpr = parseFunction(true);
    exitFunctionScope(false);
    return Factory.transFormFunctionToFunctionExpression(funcExpr);
  }
  function parseClassExpression(decoratorList: Decorator[] | null) {
    return Factory.transFormClassToClassExpression(parseClass(decoratorList));
  }
  function parseCoverExpressionORArrowFunction() {
    const possibleBeArrow = canParseAsArrowFunction();
    expectButNotEat(SyntaxKinds.ParenthesesLeftPunctuator);
    const [[{ start, end, nodes, trailingComma }, strictModeScope], arrowExprScope] =
      parseWithArrowExpressionScope(() => parseWithCatpureLayer(parseArguments));
    if (!possibleBeArrow || !match(SyntaxKinds.ArrowOperator)) {
      // transfor to sequence or signal expression
      for (const element of nodes) {
        if (isSpreadElement(element)) {
          // recoverable error
          raiseError(ErrorMessageMap.extra_error_rest_element_invalid, element.start);
        }
      }
      if (trailingComma) {
        // recoverable error
        raiseError(ErrorMessageMap.extra_error_sequence_expression_can_not_have_trailing_comma, end);
      }
      if (nodes.length === 1) {
        nodes[0].parentheses = true;
        return nodes[0];
      }
      if (nodes.length === 0) {
        // recoverable error
        raiseError(ErrorMessageMap.extra_error_empty_parentheses_expression, start);
      }
      const seq = Factory.createSequenceExpression(nodes, start, end);
      seq.parentheses = true;
      return seq;
    }
    enterArrowFunctionBodyScope();
    const arrowExpr = parseArrowFunctionExpression(
      { start, end, nodes, trailingComma },
      strictModeScope,
      arrowExprScope,
    );
    exitArrowFunctionBodyScope();
    return arrowExpr;
  }
  /**
   * Parse arrow function expression, by given argumentlist and meta data, include
   * - start of `(`
   * - end of `)`,
   * - is trailing comma of argument list
   * please notes that this function accept with arguments, not paramemter list, so we need to
   * transform arguments to parameter list, so we need to call `toAssignment` for each argument.
   * and we also need to check is parameter duplicate.
   *
   * @param {ASTArrayWithMetaData<Expression> & { trailingComma: boolean }} metaData
   * @returns {ArrorFunctionExpression}
   */
  function parseArrowFunctionExpression(
    metaData: ASTArrayWithMetaData<Expression> & { trailingComma: boolean },
    strictModeScope: StrictModeScope,
    arrowExprScope: AsyncArrowExpressionScope,
  ): ArrorFunctionExpression {
    if (getLineTerminatorFlag()) {
      // recoverable error
      raiseError(ErrorMessageMap.extra_error_no_line_break_is_allowed_before_arrow, getStartPosition());
    }
    expect(SyntaxKinds.ArrowOperator);
    const functionArguments = argumentToFunctionParams(
      metaData.nodes,
      metaData.trailingComma,
      strictModeScope,
      arrowExprScope,
    );
    let body: Expression | FunctionBody | undefined;
    let isExpression = false;
    if (match(SyntaxKinds.BracesLeftPunctuator)) {
      body = parseFunctionBody();
    } else {
      body = parseAssignmentExpressionInheritIn();
      isExpression = true;
    }
    postStaticSematicEarlyErrorForStrictModeOfFunction(null, strictModeScope);
    return Factory.createArrowExpression(
      isExpression,
      body,
      functionArguments,
      isCurrentScopeParseAwaitAsExpression(),
      cloneSourcePosition(metaData.start),
      cloneSourcePosition(body.end),
    );
  }
  /**
   * Transform function from expressions to patterns (arguments to params), checking syntax error
   * by expression scope and post statci sematic check for pattern rule.
   * - asycn arrow scope: check await expression, yield expression
   * - strict mode scope: expression Rval to Lval has different rule in strict mode
   * - multi spread vs multi rest: rest is unique, spread can be multi.
   * @param functionArguments
   * @param trailingComma
   * @param strictModeScope
   * @param arrowExprScope
   * @returns
   */
  function argumentToFunctionParams(
    functionArguments: Array<Expression>,
    trailingComma: boolean,
    strictModeScope: StrictModeScope,
    arrowExprScope: AsyncArrowExpressionScope,
  ): Array<Pattern> {
    const params = functionArguments.map((node) => exprToPattern(node, true)) as Array<Pattern>;
    if (isCurrentScopeParseAwaitAsExpression() || isParentFunctionAsync() || isParentFunctionGenerator()) {
      checkAsyncArrowExprScopeError(arrowExprScope);
    }
    if (isInStrictMode()) {
      checkStrictModeScopeError(strictModeScope);
    }
    const isMultiSpread = postStaticSematicForArrowParamAfterTransform(params);
    if (isMultiSpread && trailingComma)
      // recoverable error
      raiseError(
        ErrorMessageMap.babel_error_unexpected_trailing_comma_after_rest_element,
        lexer.getLastTokenEndPositon(),
      );
    // check as function params
    setContextIfParamsIsSimpleParameterList(params);
    return params;
  }
  function postStaticSematicForArrowParamAfterTransform(params: Array<Pattern>) {
    let flag = false;
    params.forEach((param) => {
      if (flag && isRestElement(param)) {
        // recoverable error
        raiseError(ErrorMessageMap.babel_error_unexpected_trailing_comma_after_rest_element, param.start);
        return;
      }
      if (flag) {
        // recoverable error
        raiseError(ErrorMessageMap.babel_error_unexpected_trailing_comma_after_rest_element, param.start);
        return;
      }
      if (!flag && isRestElement(param)) {
        flag = true;
      }
    });
    return flag;
  }
  /** ================================================================================
   *  Parse JSX
   *  entry point: https://facebook.github.io/jsx/
   * ==================================================================================
   */
  /**
   * Parse JSX Element or JSX Fragment
   * ```
   * PrimaryExpression := JSXElement
   *                   := JSXFragment
   * ```
   */
  function parseJSXElementOrJSXFragment(inJSXChildren: boolean): JSXElement | JSXFragment {
    if (!config.plugins.includes("jsx")) {
      raiseError(ErrorMessageMap.babel_error_need_enable_jsx, getStartPosition());
    }
    const lookaheadToken = lookahead();
    if (lookaheadToken.kind !== SyntaxKinds.GtOperator) {
      return parseJSXElement(inJSXChildren);
    } else {
      return parseJSXFragment(inJSXChildren);
    }
  }
  /**
   * Parse JSX Element
   * ```
   * JSXElement := JSXOpeningElement JSXChildren JSXClosingElement
   *            := JSXOpeningElement
   * ```
   * @returns {JSXElement}
   */
  function parseJSXElement(inJSXChildren: boolean): JSXElement {
    const opeingElement = parseJSXOpeingElement(inJSXChildren);
    if (opeingElement.selfClosing) {
      return Factory.createJSXElement(
        opeingElement,
        null,
        [],
        cloneSourcePosition(opeingElement.start),
        cloneSourcePosition(opeingElement.end),
      );
    }
    const children = parseJSXChildren();
    const closingElement = parseJSXClosingElement(inJSXChildren);
    staticSematicEarlyErrorForJSXElement(opeingElement, closingElement);
    return Factory.createJSXElement(
      opeingElement,
      closingElement,
      children,
      cloneSourcePosition(opeingElement.start),
      cloneSourcePosition(opeingElement.end),
    );
  }
  function staticSematicEarlyErrorForJSXElement(
    openingElement: JSXOpeningElement,
    closingElement: JSXClosingElement,
  ) {
    const openElementSourceText = lexer.getSourceValueByIndex(
      openingElement.name.start.index,
      openingElement.name.end.index,
    );
    const closeElementSourceText = lexer.getSourceValueByIndex(
      closingElement.name.start.index,
      closingElement.name.end.index,
    );
    if (openElementSourceText !== closeElementSourceText) {
      throw new Error();
    }
  }
  /**
   * Parse JSXOpeingElement
   * ```
   * JSXOpeningElement := `<` JSXElementName JSXAtrributes `>`
   *                   := `<` JSXElementName JSXAtrributes `/>`
   * ```
   * @returns {JSXOpeningElement}
   */
  function parseJSXOpeingElement(inJSXChildren: boolean): JSXOpeningElement {
    const { start } = expect(SyntaxKinds.LtOperator);
    const lastLexerJSXEndTagContext = lexer.getJSXGtContext();
    lexer.setJSXGtContext(true);
    const name = parseJSXElementName();
    const attributes = parseJSXAttributes();
    lexer.setJSXGtContext(lastLexerJSXEndTagContext);
    if (match(SyntaxKinds.GtOperator)) {
      const end = getEndPosition();
      nextTokenInJSXChildren(true);
      return Factory.createJSXOpeningElement(name, attributes, false, start, end);
    }
    if (match(SyntaxKinds.JSXSelfClosedToken)) {
      const end = getEndPosition();
      nextTokenInJSXChildren(inJSXChildren);
      return Factory.createJSXOpeningElement(name, attributes, true, start, end);
    }
    // for  `/ >`
    if (match(SyntaxKinds.DivideOperator) && lookahead().kind === SyntaxKinds.GtOperator) {
      nextToken();
      const end = getEndPosition();
      nextTokenInJSXChildren(inJSXChildren);
      return Factory.createJSXOpeningElement(name, attributes, true, start, end);
    }
    throw createUnexpectError();
  }
  /**
   * Parse name of jsx element or jsx fragment
   * ```
   * JSXElementName := JSXIdentifier
   *                := JSXMemberExpression
   *                := JSXNamespaceName
   * ```
   * @returns {JSXIdentifier | JSXMemberExpression | JSXNamespacedName}
   */
  function parseJSXElementName(): JSXIdentifier | JSXMemberExpression | JSXNamespacedName {
    let name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName = parseJSXIdentifier();
    if (match(SyntaxKinds.ColonPunctuator)) {
      nextToken();
      const subName = parseJSXIdentifier();
      name = Factory.createJSXNamespacedName(
        name,
        subName,
        cloneSourcePosition(name.start),
        cloneSourcePosition(subName.end),
      );
    } else if (match(SyntaxKinds.DotOperator)) {
      while (match(SyntaxKinds.DotOperator) && !match(SyntaxKinds.EOFToken)) {
        nextToken();
        const property = parseJSXIdentifier();
        name = Factory.createJSXMemberExpression(
          name,
          property,
          cloneSourcePosition(name.start),
          cloneSourcePosition(property.end),
        );
      }
    }
    return name;
  }
  /**
   * Parse JSX Attributes.
   * ```
   * JSXAttributes := JSXAttributes JSXAttribute
   *               := JSXAttributes JSXSpreadAttribute
   *               := JSXAttribute
   *               := JSXSpreadAttribute
   * JSXAttribute  := JSXAttributeName '=' StringLiteral
   *               := JSXAttributeName '=' JSXExpressionContainer (expression can not be null)
   *               := JSXAttributeName '=' JSXElement
   *               := JSxAttributeName '=' JSXFragment
   *               := JSXAttrbuteName
   * JSXSpreadAttribute := '{''...' AssignmentExpression '}'
   * JSXAttributeName := JSXIdentifier
   *                  := JSXNamespaceName
   * ```
   * @returns {Array<JSXAttribute | JSXSpreadAttribute>}
   */
  function parseJSXAttributes(): Array<JSXAttribute | JSXSpreadAttribute> {
    const attribute: Array<JSXAttribute | JSXSpreadAttribute> = [];
    while (
      !match(SyntaxKinds.EOFToken) &&
      !match(SyntaxKinds.GtOperator) &&
      !match(SyntaxKinds.JSXSelfClosedToken) &&
      !(match(SyntaxKinds.DivideOperator) && lookahead().kind === SyntaxKinds.GtOperator)
    ) {
      // parse spread
      if (match(SyntaxKinds.BracesLeftPunctuator)) {
        nextToken();
        expect(SyntaxKinds.SpreadOperator);
        const expression = parseAssignmentExpressionAllowIn();
        expect(SyntaxKinds.BracesRightPunctuator);
        attribute.push(
          Factory.createJSXSpreadAttribute(
            expression,
            cloneSourcePosition(expression.start),
            cloneSourcePosition(expression.end),
          ),
        );
        continue;
      }
      // parse name
      let name: JSXIdentifier | JSXNamespacedName = parseJSXIdentifier();
      if (match(SyntaxKinds.ColonPunctuator)) {
        nextToken();
        const subName = parseJSXIdentifier();
        name = Factory.createJSXNamespacedName(
          name,
          subName,
          cloneSourcePosition(name.start),
          cloneSourcePosition(subName.end),
        );
      }
      // parse value
      if (match(SyntaxKinds.AssginOperator)) {
        lexer.setJSXStringContext(true);
        nextToken();
        lexer.setJSXStringContext(false);
        if (match(SyntaxKinds.StringLiteral)) {
          const value = parseStringLiteral();
          attribute.push(
            Factory.createJSXAttribute(
              name,
              value,
              cloneSourcePosition(name.start),
              cloneSourcePosition(value.end),
            ),
          );
          continue;
        }
        if (match(SyntaxKinds.BracesLeftPunctuator)) {
          const expression = parseJSXExpressionContainer(false);
          if (!expression.expression) {
            throw new Error("right hand side of jsx attribute must have expression if start with `{`");
          }
          attribute.push(
            Factory.createJSXAttribute(
              name,
              expression,
              cloneSourcePosition(name.start),
              cloneSourcePosition(expression.end),
            ),
          );
          continue;
        }
        const element = parseJSXElementOrJSXFragment(false);
        attribute.push(
          Factory.createJSXAttribute(
            name,
            element,
            cloneSourcePosition(name.start),
            cloneSourcePosition(element.end),
          ),
        );
      } else {
        attribute.push(
          Factory.createJSXAttribute(
            name,
            null,
            cloneSourcePosition(name.start),
            cloneSourcePosition(name.end),
          ),
        );
      }
    }
    return attribute;
  }
  /**
   * Parse JSX Children
   * ```
   * JSXChildren := JSXChildren JSXChild
   *             := JSXChild
   * JSXChild    := JSXText
   *             := JSXExpressionContainer
   *             := JSXElement
   *             := JSXFragment
   *             := JSXSpreadChild
   * JSXSpreadChild := {'...AssignmentExpression '}'
   * ```
   * @returns {Array<JSXText | JSXExpressionContainer | JSXElement | JSXFragment | JSXSpreadChild>}
   */
  function parseJSXChildren(): JSXElement["children"] {
    const children: JSXElement["children"] = [];
    while (!match(SyntaxKinds.JSXCloseTagStart) && !match(SyntaxKinds.EOFToken)) {
      if (match(SyntaxKinds.LtOperator)) {
        children.push(parseJSXElementOrJSXFragment(true));
        continue;
      }
      if (match(SyntaxKinds.BracesLeftPunctuator)) {
        if (lookahead().kind == SyntaxKinds.SpreadOperator) {
          expect(SyntaxKinds.BracesLeftPunctuator);
          expect(SyntaxKinds.SpreadOperator);
          const expression = parseAssignmentExpressionAllowIn();
          expect(SyntaxKinds.BracesRightPunctuator);
          children.push(
            Factory.createJSXSpreadChild(
              expression,
              cloneSourcePosition(expression.start),
              cloneSourcePosition(expression.end),
            ),
          );
          continue;
        }
        children.push(parseJSXExpressionContainer(true));
        continue;
      }
      children.push(parseJSXText());
    }
    return children;
  }
  /**
   * Parse JSX expression container
   * ```
   * JSXExpressionContainer = '{' AssignmentExpression '}'
   * ```
   * @returns {JSXExpressionContainer}
   */
  function parseJSXExpressionContainer(inJSXChildren: boolean): JSXExpressionContainer {
    const { start } = expect(SyntaxKinds.BracesLeftPunctuator);
    const expression = match(SyntaxKinds.BracesRightPunctuator) ? null : parseAssignmentExpressionAllowIn();
    const { end } = expectInJSXChildren(SyntaxKinds.BracesRightPunctuator, inJSXChildren);
    return Factory.createsJSXExpressionContainer(expression, start, end);
  }
  /**
   * Parse Closing Element of JSXElement
   * ```
   * JSXClosingElement := '</' JSXElementName '>'
   * ```
   * @returns {JSXClosingElement}
   */
  function parseJSXClosingElement(inJSXChildren: boolean): JSXClosingElement {
    const { start } = expect(SyntaxKinds.JSXCloseTagStart);
    const lastLexerJSXEndTagContext = lexer.getJSXGtContext();
    lexer.setJSXGtContext(true);
    const name = parseJSXElementName();
    const { end } = expectInJSXChildren(SyntaxKinds.GtOperator, inJSXChildren);
    lexer.setJSXGtContext(lastLexerJSXEndTagContext);
    return Factory.createJSXClosingElement(name, start, end);
  }
  /**
   *
   * @returns {JSXIdentifier}
   */
  function parseJSXIdentifier(): JSXIdentifier {
    // eslint-disable-next-line prefer-const
    let { start, end } = expect(IdentiferWithKeyworArray);
    // eslint-disable-next-line no-constant-condition
    while (1) {
      if (match(SyntaxKinds.MinusOperator)) {
        end = getEndPosition();
        nextToken();
      } else {
        break;
      }
      if (match(IdentiferWithKeyworArray)) {
        end = getEndPosition();
        nextToken();
      } else {
        break;
      }
    }
    const value = lexer.getSourceValueByIndex(start.index, end.index);
    return Factory.createJSXIdentifier(value, start, end);
  }
  function parseJSXText() {
    const { start, end, value } = expect(SyntaxKinds.JSXText);
    return Factory.createJSXText(value, start, end);
  }
  /**
   * Parse JSXFragment
   * ```
   * JSXFragment := `<``/>` JSXChildern `</``>`
   * ```
   * @returns {JSXFragment}
   */
  function parseJSXFragment(inJSXChildren: boolean): JSXFragment {
    const { start: openingStart } = expect(SyntaxKinds.LtOperator);
    const { end: openingEnd } = expectInJSXChildren(SyntaxKinds.GtOperator, true);
    const children = parseJSXChildren();
    const { start: closingStart } = expect(SyntaxKinds.JSXCloseTagStart);
    const { end: closingEnd } = expectInJSXChildren(SyntaxKinds.GtOperator, inJSXChildren);
    return Factory.createJSXFragment(
      Factory.createJSXOpeningFragment(openingStart, openingEnd),
      Factory.createJSXClosingFragment(closingStart, closingEnd),
      children,
      cloneSourcePosition(openingStart),
      cloneSourcePosition(closingEnd),
    );
  }
  function expectInJSXChildren(kind: SyntaxKinds, inJSXChildren: boolean) {
    if (match(kind)) {
      const metaData = {
        value: getSourceValue(),
        start: getStartPosition(),
        end: getEndPosition(),
      };
      if (inJSXChildren) {
        lexer.nextTokenInJSXChildrenContext();
      } else {
        lexer.nextToken();
      }
      return metaData;
    }
    throw createUnexpectError();
  }
  function nextTokenInJSXChildren(inJSXChildren: boolean) {
    if (inJSXChildren) {
      lexer.nextTokenInJSXChildrenContext();
    } else {
      lexer.nextToken();
    }
  }
  /** ================================================================================
   *  Parse Pattern
   *  entry point: https://tc39.es/ecma262/#sec-destructuring-binding-patterns
   * ==================================================================================
   */
  /**
   * Parse BindingElement
   * ```
   * BindingElemet := Identifer ('=' AssigmentExpression)?
   *               := BindingPattern ('=' AssigmentExpression)?
   * ```
   * @returns
   */
  function parseBindingElement(shouldParseAssignment = true): Pattern {
    expectButNotEat([
      ...IdentiferWithKeyworArray,
      SyntaxKinds.BracesLeftPunctuator,
      SyntaxKinds.BracketLeftPunctuator,
    ]);
    let left: Pattern | undefined;
    if (match(BindingIdentifierSyntaxKindArray)) {
      left = parseBindingIdentifier();
    } else {
      left = parseBindingPattern();
    }
    if (match(SyntaxKinds.AssginOperator) && shouldParseAssignment) {
      nextToken();
      const right = parseWithRHSLayer(parseAssignmentExpressionAllowIn);
      return Factory.createAssignmentPattern(
        left,
        right,
        cloneSourcePosition(left.start),
        cloneSourcePosition(right.end),
      );
    }
    return left;
  }
  function parseRestElement(allowPattern: boolean): RestElement {
    const { start } = expect([SyntaxKinds.SpreadOperator]);
    let id: Pattern | null = null;
    if (match(BindingIdentifierSyntaxKindArray)) {
      id = parseBindingIdentifier();
    }
    if (match([SyntaxKinds.BracesLeftPunctuator, SyntaxKinds.BracketLeftPunctuator])) {
      if (allowPattern) {
        id = parseBindingPattern();
      }
      if (!allowPattern) {
        // recoverable error ?
        throw createUnexpectError();
      }
    }
    if (!id) {
      throw createUnexpectError();
    }
    return Factory.createRestElement(id, start, cloneSourcePosition(id.end));
  }
  function parseBindingIdentifier() {
    const id = parseWithLHSLayer(parseIdentifierReference);
    declarateNonFunctionalSymbol(id.name, id.start);
    return id;
  }
  /**
   * Parse BindingPattern
   * ```
   * BindingPattern := ObjectPattern
   *                := ArrayPattern
   * ```
   */
  function parseBindingPattern(): ObjectPattern | ArrayPattern {
    return parseWithLHSLayer(() => {
      expectButNotEat([SyntaxKinds.BracesLeftPunctuator, SyntaxKinds.BracketLeftPunctuator]);
      if (match(SyntaxKinds.BracesLeftPunctuator)) {
        return parseObjectPattern();
      }
      return parseArrayPattern();
    });
  }
  /** Parse Object Pattern
   * ```
   * ObjectPattern := '{' ObjectPatternProperties  '}'
   *               := '{' ObjtecPatternProperties ',' '}'
   *               := '{' ObjectPatternProperties ',' RestElement '}'
   *               := '{' RestElement '}
   * ObjectPatternProperties := ObjectPatternProperties ',' ObjectPatternProperty
   * ObjectPatternProperty   := Identifer ('=' AssigmentExpression)
   *                          := BindingPattern ('=' AssignmentExpression)
   * ```
   * @return {ObjectPattern}
   */
  function parseObjectPattern(): ObjectPattern {
    const { start } = expect(SyntaxKinds.BracesLeftPunctuator);
    if (match(SyntaxKinds.BracesRightPunctuator)) {
      const end = getEndPosition();
      nextToken();
      const objectPattern = Factory.createObjectPattern([], start, end);
      return objectPattern;
    }
    const properties: Array<ObjectPatternProperty | RestElement | AssignmentPattern> = [
      parseObjectPatternPossibelProperty(),
    ];
    while (!match([SyntaxKinds.BracesRightPunctuator, SyntaxKinds.EOFToken])) {
      expect(SyntaxKinds.CommaToken);
      if (match(SyntaxKinds.BracesRightPunctuator) || match(SyntaxKinds.EOFToken)) {
        continue;
      }
      properties.push(parseObjectPatternPossibelProperty());
    }
    const { end } = expect(SyntaxKinds.BracesRightPunctuator);
    const objectPattern = Factory.createObjectPattern(properties, start, end);
    return objectPattern;
  }
  function parseObjectPatternPossibelProperty(): ObjectPatternProperty | RestElement | AssignmentPattern {
    // parse Rest property
    if (match(SyntaxKinds.SpreadOperator)) {
      const rest = parseRestElement(false);
      staticSematicForRestElementInObjectPattern();
      return rest;
    }
    // parse Object pattern property (rename)
    const isComputedRef = { isComputed: false };
    const propertyName = parsePropertyName(isComputedRef);
    if (isComputedRef.isComputed || match(SyntaxKinds.ColonPunctuator)) {
      nextToken();
      const pattern = parseBindingElement();
      return Factory.createObjectPatternProperty(
        propertyName,
        pattern,
        isComputedRef.isComputed,
        false,
        cloneSourcePosition(propertyName.start),
        cloneSourcePosition(pattern.end),
      );
    }
    staticCheckForPropertyNameAsSingleBinding(propertyName);
    // parse object pattern as Assignment pattern
    if (match(SyntaxKinds.AssginOperator)) {
      nextToken();
      const expr = parseWithRHSLayer(parseAssignmentExpressionAllowIn);
      staticSematicForAssignmentPatternInObjectPattern(propertyName);
      declarateNonFunctionalSymbol((propertyName as Identifier).name, propertyName.start);
      return Factory.createAssignmentPattern(
        propertyName as Pattern,
        expr,
        cloneSourcePosition(propertyName.start),
        cloneSourcePosition(expr.end),
      );
    }
    // parse object pattern as shorted property.
    staticSematicForShortedPropertyNameInObjectLike(propertyName);
    declarateNonFunctionalSymbol((propertyName as Identifier).name, propertyName.start);
    return Factory.createObjectPatternProperty(
      propertyName,
      undefined,
      isComputedRef.isComputed,
      true,
      cloneSourcePosition(propertyName.start),
      cloneSourcePosition(propertyName.end),
    );
  }
  /**
   * In Object Pattern, Rest Element should be last one, and can
   * not have trailing comma.
   */
  function staticSematicForRestElementInObjectPattern() {
    if (
      !match(SyntaxKinds.BracesRightPunctuator) ||
      (match(SyntaxKinds.CommaToken) && lookahead().kind === SyntaxKinds.BracesRightPunctuator)
    ) {
      // recoverable error
      raiseError(
        ErrorMessageMap.babel_error_unexpected_trailing_comma_after_rest_element,
        getStartPosition(),
      );
    }
  }
  /**
   * Ban some usage like `{ "string-key" = "name" }` in onject pattern
   * @param propertyName
   */
  function staticSematicForAssignmentPatternInObjectPattern(propertyName: PropertyName) {
    if (!isPattern(propertyName)) {
      throw createMessageError("assignment pattern left value can only allow identifier or pattern");
    }
  }
  /**
   * As for shorted and assignment patern in object pattern, the property name should be
   * a bidning identifier, so we need to check and record the property name.
   * @param propertyName
   * @returns
   */
  function staticCheckForPropertyNameAsSingleBinding(propertyName: PropertyName) {
    if (isIdentifer(propertyName)) {
      switch (propertyName.name) {
        case "await": {
          if (isCurrentScopeParseAwaitAsExpression() || config.sourceType === "module") {
            throw createMessageError(
              ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword,
            );
          }
          return;
        }
        case "yield": {
          if (isCurrentScopeParseYieldAsExpression() || isInStrictMode()) {
            throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
          }
          return;
        }
        case "arguments": {
          if (isInStrictMode() && strictModeScopeRecorder.isInLHS()) {
            throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
          }
          recordScope(ExpressionScopeKind.ArgumentsIdentifier, propertyName.start);
          return;
        }
        case "eval": {
          if (isInStrictMode() && strictModeScopeRecorder.isInLHS()) {
            throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
          }
          recordScope(ExpressionScopeKind.EvalIdentifier, propertyName.start);
          return;
        }
        case "let": {
          if (isInStrictMode()) {
            throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
          }
          recordScope(ExpressionScopeKind.LetIdentifiier, propertyName.start);
          return;
        }
        default: {
          if (KeywordSet.has(propertyName.name)) {
            // recoverable error
            raiseError(ErrorMessageMap.babel_error_unexpected_keyword, propertyName.start);
          }
          if (PreserveWordSet.has(propertyName.name) && isInStrictMode()) {
            // recoverable error
            raiseError(ErrorMessageMap.babel_error_unexpected_reserved_word, propertyName.start);
          }
          return;
        }
      }
    }
  }
  function parseArrayPattern(): ArrayPattern {
    const { start } = expect(SyntaxKinds.BracketLeftPunctuator);
    let isStart = true;
    const elements: Array<Pattern | null> = [];
    while (!match(SyntaxKinds.BracketRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
      if (isStart) {
        isStart = false;
      } else {
        expect(SyntaxKinds.CommaToken);
      }
      if (match(SyntaxKinds.BracketRightPunctuator) || match(SyntaxKinds.EOFToken)) {
        continue;
      }
      if (match(SyntaxKinds.CommaToken)) {
        elements.push(null);
        continue;
      }
      if (match(SyntaxKinds.SpreadOperator)) {
        elements.push(parseRestElement(true));
        if (!match(SyntaxKinds.BracketRightPunctuator)) {
          // recoverable error
          raiseError(
            ErrorMessageMap.babel_error_unexpected_trailing_comma_after_rest_element,
            getStartPosition(),
          );
        }
        break;
      }
      const pattern = parseBindingElement();
      elements.push(pattern);
    }
    const { end } = expect(SyntaxKinds.BracketRightPunctuator);
    const arrayPattern = Factory.createArrayPattern(elements, start, end);
    return arrayPattern;
  }
  /** ================================================================================
   *  Parse Import Declaration
   *  entry point: https://tc39.es/ecma262/#sec-imports
   * ==================================================================================
   */
  function expectFormKeyword() {
    if (getSourceValue() !== "from") {
      throw createUnexpectError();
    }
    if (getEscFlag()) {
      throw createMessageError(ErrorMessageMap.invalid_esc_char_in_keyword);
    }
    nextToken();
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
  function parseImportDeclaration(): ImportDeclaration {
    const { start } = expect(SyntaxKinds.ImportKeyword);
    if (config.sourceType === "script") {
      raiseError(ErrorMessageMap.babel_error_import_and_export_may_appear_only_with_sourceType_module, start);
    }
    const specifiers: Array<ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier> = [];
    if (match(SyntaxKinds.StringLiteral)) {
      const source = parseStringLiteral();
      const attributes = parseImportAttributesOptional();
      shouldInsertSemi();
      return Factory.createImportDeclaration(
        specifiers,
        source,
        attributes,
        start,
        cloneSourcePosition(source.end),
      );
    }
    if (match(SyntaxKinds.MultiplyOperator)) {
      specifiers.push(parseImportNamespaceSpecifier());
      expectFormKeyword();
      const source = parseStringLiteral();
      const attributes = parseImportAttributesOptional();
      shouldInsertSemi();
      return Factory.createImportDeclaration(
        specifiers,
        source,
        attributes,
        start,
        cloneSourcePosition(source.end),
      );
    }
    if (match(SyntaxKinds.BracesLeftPunctuator)) {
      parseImportSpecifiers(specifiers);
      expectFormKeyword();
      const source = parseStringLiteral();
      const attributes = parseImportAttributesOptional();
      shouldInsertSemi();
      return Factory.createImportDeclaration(
        specifiers,
        source,
        attributes,
        start,
        cloneSourcePosition(source.end),
      );
    }
    specifiers.push(parseImportDefaultSpecifier());
    if (match(SyntaxKinds.CommaToken)) {
      nextToken();
      if (match(SyntaxKinds.BracesLeftPunctuator)) {
        parseImportSpecifiers(specifiers);
      } else if (match(SyntaxKinds.MultiplyOperator)) {
        specifiers.push(parseImportNamespaceSpecifier());
      } else {
        throw createMessageError(
          "import default specifier can only concat with namespace of import named specifier",
        );
      }
    }
    expectFormKeyword();
    const source = parseStringLiteral();
    const attributes = parseImportAttributesOptional();
    shouldInsertSemi();
    return Factory.createImportDeclaration(
      specifiers,
      source,
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
  function parseImportDefaultSpecifier(): ImportDefaultSpecifier {
    const name = parseIdentifierReference();
    declarateLetSymbol(name.name, name.start);
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
  function parseImportNamespaceSpecifier(): ImportNamespaceSpecifier {
    const { start } = expect(SyntaxKinds.MultiplyOperator);
    if (!isContextKeyword("as")) {
      raiseError(ErrorMessageMap.babel_error_unexpected_token_expected_as, getStartPosition());
    }
    nextToken();
    const id = parseIdentifierReference();
    declarateLetSymbol(id.name, id.start);
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
  function parseImportSpecifiers(
    specifiers: Array<ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier>,
  ): void {
    expect(SyntaxKinds.BracesLeftPunctuator);
    let isStart = true;
    while (!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
      if (isStart) {
        isStart = false;
      } else {
        expect(SyntaxKinds.CommaToken);
      }
      if (match(SyntaxKinds.BracesRightPunctuator) || match(SyntaxKinds.EOFToken)) {
        break;
      }
      const imported = parseModuleExportName();
      if (!isContextKeyword("as")) {
        if (isIdentifer(imported) && KeywordSet.has(imported.name)) {
          // recoverable error
          raiseError(ErrorMessageMap.extra_error_unexpect_keyword_in_module_name, imported.start);
        } else if (isStringLiteral(imported)) {
          // recoverable error
          raiseError(
            ErrorMessageMap.babel_error_string_literal_cannot_be_used_as_an_imported_binding,
            imported.start,
          );
        }
        if (isIdentifer(imported)) declarateLetSymbol(imported.name, imported.start);
        specifiers.push(
          Factory.createImportSpecifier(
            imported,
            null,
            cloneSourcePosition(imported.start),
            cloneSourcePosition(imported.end),
          ),
        );
        continue;
      }
      nextToken();
      const local = parseIdentifierReference();
      declarateLetSymbol(local.name, local.start);
      specifiers.push(
        Factory.createImportSpecifier(
          imported,
          local,
          cloneSourcePosition(imported.start),
          cloneSourcePosition(local.end),
        ),
      );
    }
    expect(SyntaxKinds.BracesRightPunctuator);
  }
  function parseImportAttributesOptional(): ImportAttribute[] | undefined {
    if (
      (config.plugins.includes("importAttributes") && match(SyntaxKinds.WithKeyword)) ||
      (config.plugins.includes("importAssertions") &&
        match(SyntaxKinds.Identifier) &&
        getSourceValue() === "assert")
    ) {
      nextToken();
      return parseImportAttributes();
    }
    return undefined;
  }
  function parseImportAttributes(): ImportAttribute[] {
    expect(SyntaxKinds.BracesLeftPunctuator);
    const attributes: Array<ImportAttribute> = [parseImportAttribute()];
    while (!match([SyntaxKinds.BracesRightPunctuator, SyntaxKinds.EOFToken])) {
      expect(SyntaxKinds.CommaToken);
      if (match([SyntaxKinds.BracesRightPunctuator, SyntaxKinds.EOFToken])) {
        break;
      }
      attributes.push(parseImportAttribute());
    }
    expect(SyntaxKinds.BracesRightPunctuator);
    return attributes;
  }
  function parseImportAttribute(): ImportAttribute {
    const key = parseIdentifierName();
    expect(SyntaxKinds.ColonPunctuator);
    const value = parseStringLiteral();
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
  function parseExportDeclaration(): ExportDeclaration {
    setExportContext(ExportContext.InExport);

    const { start } = expect(SyntaxKinds.ExportKeyword);
    if (config.sourceType === "script") {
      raiseError(ErrorMessageMap.babel_error_import_and_export_may_appear_only_with_sourceType_module, start);
    }
    let exportDeclaration: ExportDeclaration;
    switch (getToken()) {
      case SyntaxKinds.DefaultKeyword: {
        exportDeclaration = parseExportDefaultDeclaration(start);
        break;
      }
      case SyntaxKinds.MultiplyOperator: {
        exportDeclaration = parseExportAllDeclaration(start);
        break;
      }
      case SyntaxKinds.BracesLeftPunctuator: {
        exportDeclaration = parseExportNamedDeclaration(start);
        break;
      }
      default: {
        const declaration = match(SyntaxKinds.VarKeyword) ? parseVariableDeclaration() : parseDeclaration();
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
    setExportContext(ExportContext.NotInExport);
    return exportDeclaration;
  }
  function parseExportDefaultDeclaration(start: SourcePosition): ExportDefaultDeclaration {
    expect(SyntaxKinds.DefaultKeyword);
    if (match([SyntaxKinds.ClassKeyword, SyntaxKinds.AtPunctuator])) {
      let decoratorList = takeCacheDecorator();
      if (match(SyntaxKinds.AtPunctuator)) {
        decoratorList = mergeDecoratorList(decoratorList, parseDecoratorList());
      }
      const classDeclar = Factory.transFormClassToClassDeclaration(parseClass(decoratorList));
      staticSematicForDuplicateDefaultExport(classDeclar);
      return Factory.createExportDefaultDeclaration(
        classDeclar as ClassDeclaration | ClassExpression,
        start,
        cloneSourcePosition(classDeclar.end),
      );
    }
    if (match(SyntaxKinds.FunctionKeyword)) {
      enterFunctionScope();
      const func = parseFunction(true);
      exitFunctionScope(false);
      const funcDeclar = Factory.transFormFunctionToFunctionDeclaration(func);
      staticSematicForDuplicateDefaultExport(funcDeclar);
      const name = funcDeclar.name;
      if (name) {
        delcarateFcuntionSymbol(name.name, func.generator, func.start);
      }
      return Factory.createExportDefaultDeclaration(funcDeclar, start, cloneSourcePosition(funcDeclar.end));
    }
    if (isContextKeyword("async") && lookahead().kind === SyntaxKinds.FunctionKeyword) {
      nextToken();
      enterFunctionScope(true);
      const func = parseFunction(true);
      exitFunctionScope(false);
      const funcDeclar = Factory.transFormFunctionToFunctionDeclaration(func);
      funcDeclar.async = true;
      staticSematicForDuplicateDefaultExport(funcDeclar);
      if (funcDeclar.name) {
        delcarateFcuntionSymbol(funcDeclar.name.name, func.generator, func.start);
      }
      return Factory.createExportDefaultDeclaration(funcDeclar, start, cloneSourcePosition(funcDeclar.end));
    }
    // TODO: parse export default from ""; (experimental feature)
    const expr = parseAssignmentExpressionAllowIn();
    shouldInsertSemi();
    staticSematicForDuplicateDefaultExport(expr);
    return Factory.createExportDefaultDeclaration(expr, start, cloneSourcePosition(expr.end));
  }
  /**
   * Using symbol scope recorder for record the default export.
   * @param node
   */
  function staticSematicForDuplicateDefaultExport(node: ModuleItem) {
    const isDefaultAlreadyBeDeclarated = symbolScopeRecorder.testAndSetDefaultExport(node.start);
    if (isDefaultAlreadyBeDeclarated) {
      raiseError(ErrorMessageMap.v8_error_duplicate_identifier, isDefaultAlreadyBeDeclarated);
    }
  }
  function parseExportNamedDeclaration(start: SourcePosition): ExportNamedDeclarations {
    expect(SyntaxKinds.BracesLeftPunctuator);
    const specifier: Array<ExportSpecifier> = [];
    let isStart = true;
    let isMatchKeyword = false;
    const undefExportSymbols: Array<[string, SourcePosition]> = [];
    while (!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
      if (isStart) {
        isStart = false;
      } else {
        expect(SyntaxKinds.CommaToken);
      }
      if (match(SyntaxKinds.BracesRightPunctuator) || match(SyntaxKinds.EOFToken)) {
        break;
      }
      if (match(Keywords)) {
        isMatchKeyword = true;
      }
      const exported = parseModuleExportName();
      if (!isVariableDeclarated(helperGetValueOfExportName(exported))) {
        undefExportSymbols.push([helperGetValueOfExportName(exported), exported.start]);
      }
      if (isContextKeyword("as")) {
        nextToken();
        const local = parseModuleExportName();
        staticSematicForDuplicateExportName(local);
        specifier.push(
          Factory.createExportSpecifier(
            exported,
            local,
            cloneSourcePosition(exported.start),
            cloneSourcePosition(local.end),
          ),
        );
        continue;
      }
      staticSematicForDuplicateExportName(exported);
      specifier.push(
        Factory.createExportSpecifier(
          exported,
          null,
          cloneSourcePosition(exported.start),
          cloneSourcePosition(exported.end),
        ),
      );
    }
    const { end: bracesRightPunctuatorEnd } = expect(SyntaxKinds.BracesRightPunctuator);
    let source: StringLiteral | null = null;
    if (getSourceValue() === "from") {
      nextToken();
      source = parseStringLiteral();
    } else {
      if (isMatchKeyword) {
        throw new Error();
      }
      if (undefExportSymbols.length > 0) {
        undefExportSymbols.forEach(([sym, pos]) => {
          symbolScopeRecorder.addToUndefExportSource(sym, pos);
        });
      }
      staticSematicEarlyErrorForExportName(specifier);
    }
    shouldInsertSemi();
    const end = source
      ? source.end
      : specifier.length === 0
        ? bracesRightPunctuatorEnd
        : specifier[specifier.length - 1].end;
    return Factory.createExportNamedDeclaration(specifier, null, source, start, cloneSourcePosition(end));
  }
  /**
   * Static Sematic Check based on
   * - 16.2.3.1 Static Semantics: Early Errors
   * @param specifiers
   */
  function staticSematicEarlyErrorForExportName(specifiers: Array<ExportSpecifier>) {
    for (const specifier of specifiers) {
      if (isStringLiteral(specifier.exported)) {
        raiseError(
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
  function staticSematicForDuplicateExportName(exportName: StringLiteral | Identifier) {
    const name = helperGetValueOfExportName(exportName);
    const isExportNameAlreadyBeDeclar = declarateExportSymbol(name, exportName.start);
    if (isExportNameAlreadyBeDeclar) {
      raiseError(ErrorMessageMap.v8_error_duplicate_identifier, isExportNameAlreadyBeDeclar);
    }
    const isDefaultAlreadyBeDeclarated = symbolScopeRecorder.testAndSetDefaultExport(exportName.start);
    if (name === "default" && isDefaultAlreadyBeDeclarated) {
      raiseError(ErrorMessageMap.v8_error_duplicate_identifier, isDefaultAlreadyBeDeclarated);
    }
  }
  function parseExportAllDeclaration(start: SourcePosition): ExportAllDeclaration {
    expect(SyntaxKinds.MultiplyOperator);
    let exported: Identifier | StringLiteral | null = null;
    if (isContextKeyword("as")) {
      nextToken();
      exported = parseModuleExportName();
    } else {
      exported = null;
    }
    expectFormKeyword();
    const source = parseStringLiteral();
    shouldInsertSemi();
    return Factory.createExportAllDeclaration(exported, source, start, cloneSourcePosition(source.end));
  }
  function parseModuleExportName() {
    if (match(SyntaxKinds.StringLiteral)) {
      return parseStringLiteral();
    }
    return parseIdentifierName();
  }
  function helperGetValueOfExportName(exportName: StringLiteral | Identifier) {
    if (isIdentifer(exportName)) {
      return exportName.name;
    }
    return exportName.value;
  }
}
