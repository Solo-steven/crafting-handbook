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
  isExpressionStatement,
  NumericLiteralKinds,
  NumberLiteral,
  UnaryExpression,
  ImportAttribute,
  Decorator,
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
export function createParser(code: string, option?: ParserUserConfig) {
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
  function expect(kind: SyntaxKinds | Array<SyntaxKinds>, message = ""): ExpectToken {
    if (match(kind)) {
      const metaData = {
        value: getSourceValue(),
        start: getStartPosition(),
        end: getEndPosition(),
      };
      nextToken();
      return metaData;
    }
    throw createUnexpectError(kind, message);
  }
  /**
   * Private API for parser, expect current token is one of given token(s),
   * it not, it will create a unexpect error, if is one of given token, it
   * will NOT eat token.
   * @param kind
   * @param message
   * @returns {void}
   */
  function expectButNotEat(kind: SyntaxKinds | Array<SyntaxKinds>, message = ""): void {
    if (match(kind)) {
      return;
    }
    throw createUnexpectError(kind, message);
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
        throw createMessageError(ErrorMessageMap.missing_semicolon);
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

    return new Error(
      `[Syntax Error]: ${messsage} (${position.row}, ${position.col}), got token ${SytaxKindsMapLexicalLiteral[getToken()]}.\n ${code.slice(getStartPosition().index - 100, getStartPosition().index)} \n ${code.slice(getStartPosition().index, getEndPosition().index)}`,
    );
  }
  /**
   * Create a error object with message tell developer that get a
   * unexpect token.
   * @param {SyntaxKinds} expectToken
   * @param {string?} messsage
   * @returns {Error}
   */
  function createUnexpectError(
    expectToken: SyntaxKinds | Array<SyntaxKinds> | null,
    messsage: string | null = "",
  ): Error {
    let message = "";
    if (Array.isArray(expectToken)) {
      message += ", expect token [";
      for (const token of expectToken) {
        message += `${token}, `;
      }
      message += `]`;
    }
    if (expectToken) {
      message = `, expect token ${expectToken}`;
    }
    return new Error(
      `[Syntax Error]: Unexpect token${message}, got ${getToken()}(${getSourceValue()}). ${getStartPosition().row},${getStartPosition().col}.${messsage}\n ${code.slice(getStartPosition().index - 100, getStartPosition().index)} \n ${code.slice(getStartPosition().index, getEndPosition().index)}`,
    );
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
      if (functionSymbolScope.duplicateParams.size > 0) {
        throw createMessageError(ErrorMessageMap.duplicate_param);
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
    if (symbolScopeRecorder.isProgramContainUndefSymbol()) {
      throw createMessageError(ErrorMessageMap.babel_error_export_is_not_defined);
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
    if (functionSymbolScope.duplicateParams.size > 0) {
      throw createMessageError(ErrorMessageMap.duplicate_param);
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
      throw createMessageError(ErrorMessageMap.private_name_duplicate);
    }
    if (symbolScopeRecorder.isUndeinfedPrivateName()) {
      throw createMessageError(ErrorMessageMap.private_name_undeinfed);
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
  function declarateSymbol(name: string) {
    if (isInParameter()) {
      symbolScopeRecorder.declarateParam(name);
      declarateExportSymbolIfInContext(name);
      return;
    }
    if (!symbolScopeRecorder.declarateSymbol(name)) {
      throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
    }
    if (!declarateExportSymbolIfInContext(name)) {
      throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
    }
    return;
  }
  function delcarateFcuntionSymbol(name: string) {
    const duplicateType = symbolScopeRecorder.declarateFuncrtionSymbol(name);
    if (duplicateType) {
      if (
        (duplicateType === SymbolType.Function && config.sourceType === "module") ||
        (duplicateType === SymbolType.Var && lexicalScopeRecorder.isInCatch()) ||
        duplicateType === SymbolType.Let ||
        duplicateType === SymbolType.Const
      )
        throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
    }
    if (!declarateExportSymbolIfInContext(name)) {
      throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
    }
    return;
  }
  function declarateLetSymbol(name: string) {
    if (!symbolScopeRecorder.declarateLetSymbol(name)) {
      throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
    }
    if (!declarateExportSymbolIfInContext(name)) {
      throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
    }
  }
  function declarateParam(name: string) {
    symbolScopeRecorder.declarateParam(name);
    declarateExportSymbolIfInContext(name);
    return;
  }
  function declarateExportSymbolIfInContext(name: string) {
    switch (getExportContext()) {
      case ExportContext.NotInExport:
        return true;
      case ExportContext.InExport: {
        setExportContext(ExportContext.NotInExport);
        return declarateExportSymbol(name);
      }
      case ExportContext.InExportBinding: {
        return declarateExportSymbol(name);
      }
    }
  }
  function declarateExportSymbol(name: string) {
    return symbolScopeRecorder.declarateExportSymbol(name);
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
    if (context.propertiesInitSet.size > 0) {
      throw createMessageError(ErrorMessageMap.Syntax_error_Invalid_shorthand_property_initializer);
    }
    if (context.propertiesProtoDuplicateSet.size > 0) {
      throw createMessageError(
        ErrorMessageMap.syntax_error_property_name__proto__appears_more_than_once_in_object_literal,
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
            throw createMessageError(ErrorMessageMap.missing_semicolon);
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
        throw createMessageError(ErrorMessageMap.v8_error_invalid_parenthesized_assignment_pattern);
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
        declarateSymbolInBindingPatternAsParam(node.name, isBinding);
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
            throw new Error(ErrorMessageMap.binding_pattern_can_not_have_member_expression);
          }
          if (
            property.value &&
            (isMemberExpression(property.value) || isIdentifer(property.value)) &&
            property.value.parentheses
          ) {
            throw createMessageError(ErrorMessageMap.pattern_should_not_has_paran);
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
        throw createMessageError(ErrorMessageMap.pattern_should_not_has_paran);
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
      throw createMessageError(
        ErrorMessageMap.rest_operator_must_be_followed_by_an_assignable_reference_in_assignment_contexts,
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
      throw createMessageError(ErrorMessageMap.syntax_error_parameter_after_rest_parameter);
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
        throw createMessageError(
          ErrorMessageMap.v8_error_rest_binding_property_must_be_followed_by_an_identifier_in_declaration_contexts,
        );
      }
    } else {
      if (!isIdentifer(argument) && !isMemberExpression(argument)) {
        throw createMessageError(
          ErrorMessageMap.v8_error_rest_assignment_property_must_be_followed_by_an_identifier_in_declaration_contexts,
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
      throw createMessageError(ErrorMessageMap.pattern_should_not_has_paran);
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
      declarateSymbolInBindingPatternAsParam(objectPropertyNode.key.name, isBinding);
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
      throw new Error(ErrorMessageMap.binding_pattern_can_not_have_member_expression);
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
  function declarateSymbolInBindingPatternAsParam(name: string, isBinding: boolean) {
    if (isBinding) {
      declarateParam(name);
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
    let isAwait = false,
      isParseLetAsExpr = false,
      leftOrInit: VariableDeclaration | Expression | null = null;
    if (match(SyntaxKinds.AwaitKeyword)) {
      nextToken();
      if (!config.allowAwaitOutsideFunction && !isCurrentScopeParseAwaitAsExpression()) {
        throw createMessageError(ErrorMessageMap.await_can_not_call_if_not_in_async);
      }
      isAwait = true;
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
        throw createMessageError(ErrorMessageMap.await_can_just_in_for_of_loop);
      }
      if (leftOrInit && isVarDeclaration(leftOrInit)) {
        for (const delcar of leftOrInit.declarations) {
          if ((isArrayPattern(delcar.id) || isObjectPattern(delcar.id)) && !delcar.init) {
            throw createMessageError(ErrorMessageMap.destructing_pattern_must_need_initializer);
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
        throw createMessageError(ErrorMessageMap.await_can_just_in_for_of_loop);
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
        throw createMessageError(ErrorMessageMap.for_of_can_not_use_let_as_identifirt);
      }
      nextToken();
      const right = parseAssignmentExpressionAllowIn();
      expect(SyntaxKinds.ParenthesesRightPunctuator);
      const body = parseForStatementBody();
      const forOfStatement = Factory.createForOfStatement(
        isAwait,
        leftOrInit,
        right,
        body,
        keywordStart,
        cloneSourcePosition(body.end),
      );
      staticSematicEarlyErrorForFORStatement(forOfStatement);
      return forOfStatement;
    }
    throw createUnexpectError(null);
  }
  function parseForStatementBody(): Statement {
    const stmt = parseAsLoop(parseStatement);
    //if (!isBlockStatement(stmt)) {
    symbolScopeRecorder.exitSymbolScope();
    //}
    return stmt;
  }
  function staticSematicEarlyErrorForFORStatement(statement: ForStatement | ForInStatement | ForOfStatement) {
    if (checkIsLabelledFunction(statement.body)) {
      throw createMessageError(ErrorMessageMap.syntax_error_functions_cannot_be_labelled);
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
      throw createMessageError(ErrorMessageMap.for_in_of_loop_can_not_have_one_more_binding);
    }
    const delcarationVariant = declaration.variant;
    const onlyDeclaration = declaration.declarations[0];
    if (kind === "ForIn") {
      if (onlyDeclaration.init !== null) {
        if (delcarationVariant === "var" && !isInStrictMode() && isIdentifer(onlyDeclaration.id)) {
          return;
        }
        throw createMessageError(ErrorMessageMap.for_in_of_loop_may_not_using_initializer);
      }
    } else {
      if (onlyDeclaration.init !== null) {
        throw createMessageError(ErrorMessageMap.for_in_of_loop_may_not_using_initializer);
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
      throw createMessageError(ErrorMessageMap.syntax_error_functions_cannot_be_labelled);
    }
    if (statement.alternative && checkIsLabelledFunction(statement.alternative)) {
      throw createMessageError(ErrorMessageMap.syntax_error_functions_cannot_be_labelled);
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
      throw createMessageError(ErrorMessageMap.syntax_error_functions_cannot_be_labelled);
    }
  }
  function parseDoWhileStatement(): DoWhileStatement {
    const { start: keywordStart } = expect(SyntaxKinds.DoKeyword);
    const body = parseAsLoop(parseStatement);
    expect(SyntaxKinds.WhileKeyword, "do while statement should has while condition");
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
      throw createMessageError(ErrorMessageMap.syntax_error_functions_cannot_be_labelled);
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
    const { end: puncEnd } = expect(
      SyntaxKinds.BracesRightPunctuator,
      "block statement must wrapped by bracket",
    );
    return Factory.createBlockStatement(body, puncStart, puncEnd);
  }
  function parseSwitchStatement() {
    const { start: keywordStart } = expect(SyntaxKinds.SwitchKeyword);
    expect(SyntaxKinds.ParenthesesLeftPunctuator);
    const discriminant = parseExpressionAllowIn();
    expect(SyntaxKinds.ParenthesesRightPunctuator);
    //TODO: should remove, duplicate check
    if (!match(SyntaxKinds.BracesLeftPunctuator)) {
      throw createUnexpectError(SyntaxKinds.BracesLeftPunctuator, "switch statement should has cases body");
    }
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
        nextToken();
        if (haveDefault) {
          throw createMessageError(ErrorMessageMap.v8_error_more_than_one_default_clause_in_switch_statement);
        } else {
          haveDefault = true;
        }
      }
      expect(SyntaxKinds.ColonPunctuator, "switch case should has colon");
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
      if (match(SyntaxKinds.EOFToken)) {
        throw createMessageError("switch case should wrapped by braces");
      }
      const end = getStartPosition();
      cases.push(Factory.createSwitchCase(test, consequence, start, end));
    }
    if (match(SyntaxKinds.EOFToken)) {
      throw createMessageError("switch statement should wrapped by braces");
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
    staticSematicEarlyErrorForContinueStatement();
    if (match(SyntaxKinds.Identifier) && !getLineTerminatorFlag()) {
      const id = parseIdentifierReference();
      shouldInsertSemi();
      staticSematicEarlyErrorForLabelInContinueStatement(id.name);
      return Factory.createContinueStatement(id, keywordStart, cloneSourcePosition(id.end));
    }
    shouldInsertSemi();
    return Factory.createContinueStatement(null, keywordStart, keywordEnd);
  }
  function staticSematicEarlyErrorForContinueStatement() {
    if (!isContinueValidate()) {
      throw createMessageError(ErrorMessageMap.syntax_error_continue_must_be_inside_loop);
    }
  }
  function staticSematicEarlyErrorForLabelInContinueStatement(name: string) {
    if (!canLabelReach(name)) {
      throw createMessageError(ErrorMessageMap.syntax_error_label_not_found);
    }
  }
  function parseBreakStatement(): BreakStatement {
    const { start, end } = expect(SyntaxKinds.BreakKeyword);
    if (match(SyntaxKinds.Identifier) && !getLineTerminatorFlag()) {
      const label = parseIdentifierReference();
      shouldInsertSemi();
      staticSematicEarlyErrorForLabelInBreakStatement(label.name);
      return Factory.createBreakStatement(label, start, end);
    }
    shouldInsertSemi();
    staticSematicEarlyErrorForBreakStatement();
    return Factory.createBreakStatement(null, start, end);
  }
  function staticSematicEarlyErrorForBreakStatement() {
    if (!isBreakValidate()) {
      throw createMessageError(ErrorMessageMap.syntax_error_unlabeled_break_must_be_inside_loop_or_switch);
    }
  }
  function staticSematicEarlyErrorForLabelInBreakStatement(name: string) {
    if (!canLabelReach(name)) {
      throw createMessageError(ErrorMessageMap.syntax_error_label_not_found);
    }
  }
  function parseLabeledStatement(): LabeledStatement {
    if (!match(SyntaxKinds.Identifier) || lookahead().kind !== SyntaxKinds.ColonPunctuator) {
      // TODO: unreach
    }
    const label = parseIdentifierReference();
    if (lexicalScopeRecorder.enterVirtualBlockScope("Label", label.name)) {
      throw createMessageError(ErrorMessageMap.v8_error_label_has_already_been_declared);
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
  function staticSematicEarlyErrorForLabelStatement(labeled: Statement | FunctionDeclaration) {
    if (isFunctionDeclaration(labeled)) {
      if (labeled.generator) {
        throw createMessageError(
          ErrorMessageMap.lable_statement_can_not_have_function_declaration_is_generator,
        );
      }
      if (isInStrictMode()) {
        throw createMessageError("");
      }
    } else {
      if (
        isExpressionStatement(labeled) &&
        (isClassExpression(labeled.expr) || isFunctionExpression(labeled.expr))
      ) {
        throw createMessageError("");
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
      throw createMessageError(ErrorMessageMap.v8_error_missing_catch_or_finally_after_try);
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
    const { end: puncEnd } = expect(
      SyntaxKinds.BracesRightPunctuator,
      "block statement must wrapped by bracket",
    );
    return Factory.createBlockStatement(body, puncStart, puncEnd);
  }
  function parseThrowStatement() {
    const { start } = expect(SyntaxKinds.ThrowKeyword);
    if (getLineTerminatorFlag()) {
      throw createMessageError("TODO, line break not allow");
    }
    const expr = parseExpressionAllowIn();
    shouldInsertSemi();
    return Factory.createThrowStatement(expr, start, cloneSourcePosition(expr.end));
  }
  function parseWithStatement(): WithStatement {
    if (isInStrictMode()) {
      throw createMessageError(ErrorMessageMap.with_statement_can_not_use_in_strict_mode);
    }
    const { start } = expect(SyntaxKinds.WithKeyword);
    expect(SyntaxKinds.ParenthesesLeftPunctuator);
    const object = parseExpressionAllowIn();
    expect(SyntaxKinds.ParenthesesRightPunctuator);
    const body = parseStatement();
    return Factory.createWithStatement(object, body, start, cloneSourcePosition(body.end));
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
        throw createMessageError("lexical binding must have init");
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
    if (func.generator) {
      declarateLetSymbol(name.name);
    } else {
      delcarateFcuntionSymbol(name.name);
    }
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
        throw createMessageError(ErrorMessageMap.function_declaration_must_have_name);
      }
      const params = parseFunctionParam();
      return [name, params];
    });
    const body = parseFunctionBody();
    checkStrictModeScopeError(scope);
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
          throw createMessageError(ErrorMessageMap.function_parameter_can_not_have_empty_trailing_comma);
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
        throw createMessageError(ErrorMessageMap.rest_element_can_not_end_with_comma);
      }
      throw createUnexpectError(
        SyntaxKinds.ParenthesesRightPunctuator,
        "params list must end up with ParenthesesRight",
      );
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
  function parseDecoratorList(): Array<Decorator> {
    const decoratorList: Array<Decorator> = [parseDecorator()];
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
      declarateLetSymbol(name.name);
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
    let decorators: Decorator[] | null = null;
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
    helperSematicCheckClassPropertyName(key, isComputedRef.isComputed, isStatic);
    let propertyValue = undefined,
      shorted = true;
    if (match([SyntaxKinds.AssginOperator])) {
      nextToken();
      shorted = false;
      const [value, scope] = parseWithCatpureLayer(parseAssignmentExpressionAllowIn);
      propertyValue = value;
      checkStrictModeScopeError(scope);
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
  function helperSematicCheckClassPropertyName(
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
        throw createMessageError(ErrorMessageMap.constructor_can_not_be_class_property_name);
      }
      if (value === "prototype" && isStatic) {
        throw createMessageError(ErrorMessageMap.prototype_can_not_be_static);
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
            throw createMessageError(ErrorMessageMap.illegal_use_strict_in_non_simple_parameter_list);
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
      throw createMessageError(ErrorMessageMap.private_name_wrong_used);
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
      helperCheckBinaryExpr(currentOp, nextOp, left, right);
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
  function helperCheckBinaryExpr(
    currentOps: SyntaxKinds,
    nextOps: SyntaxKinds,
    left: Expression,
    right: Expression,
  ) {
    if (isPrivateName(right) || (isPrivateName(left) && currentOps !== SyntaxKinds.InKeyword)) {
      throw createMessageError(ErrorMessageMap.private_name_wrong_used);
    }
    if (left.parentheses) {
      return;
    }
    if (currentOps === SyntaxKinds.ExponOperator) {
      if (isUnaryExpression(left) || isAwaitExpression(left)) {
        throw createMessageError(ErrorMessageMap.expont_operator_need_parans);
      }
    }
    // if currentOp is nullish, next is logical or not
    // if current Ops is logical, check next is nullish or not
    if (
      currentOps === SyntaxKinds.NullishOperator &&
      (nextOps === SyntaxKinds.LogicalANDOperator || nextOps === SyntaxKinds.LogicalOROperator)
    ) {
      throw createMessageError(ErrorMessageMap.nullish_require_parans);
    }
    if (
      nextOps === SyntaxKinds.NullishOperator &&
      (currentOps === SyntaxKinds.LogicalANDOperator || currentOps === SyntaxKinds.LogicalOROperator)
    ) {
      throw createMessageError(ErrorMessageMap.nullish_require_parans);
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
          throw createMessageError(ErrorMessageMap.tag_template_expression_can_not_use_option_chain);
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
          throw createMessageError(ErrorMessageMap.function_argument_can_not_have_empty_trailing_comma);
        }
      } else {
        trailingComma = true;
        expect(SyntaxKinds.CommaToken, "Argument should seprated by comma.");
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
   * Parse MemberExpression with base, this different between parseLeftHandSideExpression is
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
        throw createMessageError(ErrorMessageMap.delete_private_name);
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
        throw createUnexpectError(null);
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
        throw createMessageError(ErrorMessageMap.private_name_wrong_used);
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
            throw createMessageError(ErrorMessageMap.no_line_break_is_allowed_before_arrow);
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
                throw createMessageError(ErrorMessageMap.invalid_esc_char_in_keyword);
              }
              const [[argus, strictModeScope], arrowExprScope] = parseWithArrowExpressionScope(() =>
                parseWithCatpureLayer(() => [parseIdentifierReference()]),
              );
              if (getLineTerminatorFlag()) {
                throw createMessageError(ErrorMessageMap.no_line_break_is_allowed_before_async);
              }
              // TODO: check arrow operator
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
        throw createUnexpectError(null);
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
   * this function is actually parse binding identifier. it accept more than just identifier
   * include await yield and let, if identifier is let, await or yield, this function would
   * auto check context for you. but if identifier is in VariableDeclaration, function name,
   * property name, context check is not suit those place, so you maybe need to implement another
   * context check logical with parseIdentifierWithKeyword function.
   * ```
   * BindingIdentifier := Identifier
   *                   := 'await' (deps in context)
   *                   := 'yield' (deps in context)
   *                   ('let' (deps on context))
   * ```
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
        if (isCurrentScopeParseYieldAsExpression() || isInStrictMode()) {
          throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
        }
        const { value, start, end } = expect(SyntaxKinds.YieldKeyword);
        recordScope(ExpressionScopeKind.YieldIdentifier, start);
        identifer = Factory.createIdentifier(value, start, end);
        break;
      }
      // for most of await keyword, if it should treat as identifier,
      // it should not in async function.
      case SyntaxKinds.AwaitKeyword: {
        if (isCurrentScopeParseAwaitAsExpression() || config.sourceType === "module") {
          throw createMessageError(ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword);
        }
        const { value, start, end } = expect(SyntaxKinds.AwaitKeyword);
        if (!(isDirectToClassScope() && !isInPropertyName())) {
          recordScope(ExpressionScopeKind.AwaitIdentifier, start);
        }
        identifer = Factory.createIdentifier(value, start, end);
        break;
      }
      // let maybe treat as identifier in not strict mode, and not lexical binding declaration.
      // so lexical binding declaration should implement it's own checker logical with parseIdentifierWithKeyword
      case SyntaxKinds.LetKeyword: {
        if (isInStrictMode() || isInClassScope()) {
          throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
        }
        const { value, start, end } = expect(SyntaxKinds.LetKeyword);
        recordScope(ExpressionScopeKind.LetIdentifiier, start);
        identifer = Factory.createIdentifier(value, start, end);
        break;
      }
      case SyntaxKinds.Identifier: {
        const { value, start, end } = expect(SyntaxKinds.Identifier);
        const isPreserveWord = PreserveWordSet.has(value);
        if (isPreserveWord) {
          if (isInStrictMode() || isInClassScope()) {
            throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
          }
          recordScope(ExpressionScopeKind.PresveredWordIdentifier, start);
        }
        if (value === "arguments") {
          if (isInStrictMode() && strictModeScopeRecorder.isInLHS()) {
            throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
          }
          if (isInClassScope() && !isEncloseInFunction() && !isInPropertyName()) {
            throw createMessageError(ErrorMessageMap.syntax_error_arguments_is_not_valid_in_fields);
          }
          recordScope(ExpressionScopeKind.ArgumentsIdentifier, start);
        }
        if (value === "eval") {
          if (isInStrictMode() && strictModeScopeRecorder.isInLHS()) {
            throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
          }
          recordScope(ExpressionScopeKind.EvalIdentifier, start);
        }
        identifer = Factory.createIdentifier(value, start, end);
        break;
      }
      default: {
        throw createUnreachError();
      }
    }
    return identifer;
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
  function parsePrivateName() {
    const { value, start, end } = expect(SyntaxKinds.PrivateName);
    if (!isInClassScope()) {
      throw createMessageError(ErrorMessageMap.private_field_can_not_use_in_object); // semantics check for private
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
      throw createUnexpectError(SyntaxKinds.BracesLeftPunctuator);
    }
    if (!tagged && lexer.getTemplateLiteralTag()) {
      throw createMessageError(ErrorMessageMap.v8_error_invalid_hexadecimal_escape_sequence);
    }
    quasis.push(Factory.createTemplateElement(getSourceValue(), true, getStartPosition(), getEndPosition()));
    const templateLiteralEnd = getEndPosition();
    nextToken();
    return Factory.createTemplateLiteral(quasis, expressions, templateLiteralStart, templateLiteralEnd);
  }
  function parseImportMeta() {
    const { start, end } = expect(SyntaxKinds.ImportKeyword);
    expect(SyntaxKinds.DotOperator);
    const ecaFlag = getEscFlag();
    const property = parseIdentifierReference();
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
    return Factory.createMetaProperty(
      Factory.createIdentifier("import", start, end),
      property,
      start,
      cloneSourcePosition(property.end),
    );
  }
  function parseImportCall() {
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
  function parseNewTarget() {
    const { start, end } = expect(SyntaxKinds.NewKeyword);
    expect(SyntaxKinds.DotOperator);
    if (!isContextKeyword("target")) {
      throw createUnexpectError(
        SyntaxKinds.Identifier,
        "new concat with dot should only be used in meta property",
      );
    }
    if (!config.allowNewTargetOutsideFunction && isTopLevel() && !isInClassScope()) {
      throw createMessageError(ErrorMessageMap.new_target_can_only_be_used_in_class_or_function_scope);
    }
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
  /**
   * Parse New Expression
   * new expression is a trick one, because is not always right to left,
   * for a new expression, last the rightest component must be a CallExpression,
   * and before that CallExpression, it can be a series of MemberExpression,
   * or event another NewExpression
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
    if (isCallExpression(base) && !base.parentheses) {
      throw createMessageError(ErrorMessageMap.import_call_is_not_allow_as_new_expression_called);
    }
    // TODO: refactor this loop to with function -> parseNewExpressionCallee ?
    while (
      match(SyntaxKinds.DotOperator) ||
      match(SyntaxKinds.BracketLeftPunctuator) ||
      match(SyntaxKinds.QustionDotOperator)
    ) {
      if (match(SyntaxKinds.QustionDotOperator)) {
        throw createMessageError(ErrorMessageMap.new_expression_cant_using_optional_chain);
      }
      base = parseMemberExpression(base, false);
    }
    // accpect New XXX -> No argument
    if (!match(SyntaxKinds.ParenthesesLeftPunctuator)) {
      return Factory.createNewExpression(base, [], start, cloneSourcePosition(base.end));
    }
    const { end, nodes } = parseArguments();
    return Factory.createNewExpression(base, nodes, start, end);
  }
  function parseSuper() {
    if (!isCurrentClassExtend()) {
      throw createMessageError(ErrorMessageMap.super_can_not_call_if_not_in_class);
    }
    const { start: keywordStart, end: keywordEnd } = expect([SyntaxKinds.SuperKeyword]);
    if (match(SyntaxKinds.ParenthesesLeftPunctuator)) {
      if (!lexicalScopeRecorder.isInCtor()) {
        throw createMessageError("");
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
          // TODO: error
        }
        property = parseIdentifierName();
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
        throw createMessageError("");
      default:
        throw createMessageError(ErrorMessageMap.super_must_be_followed_by_an_argument_list_or_member_access);
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
  function parseThisExpression() {
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
  // part of 13.2.5.1
  function staticSematicEarlyErrorForObjectExpression(protoPropertyNames: Array<PropertyName>) {
    if (protoPropertyNames.length > 1) {
      for (let index = 1; index < protoPropertyNames.length; ++index)
        context.propertiesProtoDuplicateSet.add(protoPropertyNames[index]);
    }
  }
  function helperRecordPropertyNameForStaticSematicEarly(
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
      throw createMessageError(ErrorMessageMap.private_field_can_not_use_in_object);
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
      helperRecordPropertyNameForStaticSematicEarly(
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
      helperRecordPropertyNameForStaticSematicEarly(
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
    if (isStringLiteral(propertyName) || isNumnerLiteral(propertyName)) {
      throw createMessageError(
        ErrorMessageMap.when_binding_pattern_property_name_is_string_literal_can_not_be_shorted,
      );
    }
    // check if shorted property is keyword or not.
    checkPropertyShortedIsKeyword(propertyName);
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
   * ### Problem of Keyword as PropertyName
   * PropertyName can not only be a identifier but alse can be a keyword in some place, for example, as method
   * of object or class, and it is ok to use it as left value of property name. the syntax error happend when
   * using keyword as shorted property. So when `parsePropertyName` parse a identifier with keyword, it would
   * check if next token is `(` or `:`, to make sure throw error when parse keyword as shorted property
   *
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
    if (match(SyntaxKinds.StringLiteral)) {
      return parseStringLiteral();
    }
    if (match(NumericLiteralKinds)) {
      return parseNumericLiteral();
    }
    // propty name is a spical test of binding identifier.
    // if `await` and `yield` is propty name with colon (means assign), it dose not affected by scope.
    if (match(IdentiferWithKeyworArray)) {
      const identifer = parseIdentifierName();
      return identifer;
    }

    nextToken();
    lexicalScopeRecorder.enterPropertyName();
    const expr = parseAssignmentExpressionAllowIn();
    lexicalScopeRecorder.exitPropertyName();
    expect(SyntaxKinds.BracketRightPunctuator);
    isComputedRef.isComputed = true;
    return expr;
  }
  /**
   *  propty name is a spical test of binding identifier.
   *  if `await` and `yield` is propty name with colon (means assign),
   *  it dose not affected by scope.
   * @param propertyName
   */
  function checkPropertyShortedIsKeyword(propertyName: PropertyName) {
    if (isIdentifer(propertyName)) {
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
        throw createMessageError(ErrorMessageMap.invalid_property_name);
      }
      if (PreserveWordSet.has(propertyName.name) && isInStrictMode()) {
        throw createMessageError(ErrorMessageMap.invalid_property_name);
      }
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
    decorators: Decorator[] | null = null,
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
        throw createMessageError(ErrorMessageMap.v8_error_a_class_may_only_have_one_constructor);
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
          throw createMessageError(ErrorMessageMap.babel_error_decorators_can_not_be_used_with_a_constructor);
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
  // part of 15.7.1
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
      throw createMessageError(ErrorMessageMap.getter_should_never_has_params);
    }
    if (type === "set") {
      if (params.length !== 1) {
        throw createMessageError(ErrorMessageMap.syntax_error_setter_functions_must_have_one_argument);
      }
      for (const param of params) {
        if (isRestElement(param)) {
          throw createMessageError(
            ErrorMessageMap.syntax_error_setter_functions_must_have_one_argument_not_rest,
          );
        }
      }
    }
    if (type === "get" && (isAsync || isGenerator)) {
      throw createMessageError(ErrorMessageMap.getter_can_not_be_async_or_generator);
    }
    if (type === "set" && (isAsync || isGenerator)) {
      throw createMessageError(ErrorMessageMap.setter_can_not_be_async_or_generator);
    }
    // class check
    if (isClass) {
      let valueOfName: string | undefined,
        isPrivate = false,
        fromLiteral = false;
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
        if (isAsync || isGenerator || type !== "method") {
          throw createMessageError(
            ErrorMessageMap.constructor_can_not_be_async_or_generator_or_method_incorrect,
          );
        }
        if (isPrivate) {
          throw createMessageError(ErrorMessageMap.constructor_name_as_private_name);
        }
      }
      if (valueOfName === "prototype" && !isPrivate && type === "method" && isStatic) {
        throw createMessageError(ErrorMessageMap.prototype_can_not_be_static);
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
        expect(SyntaxKinds.CommaToken, "array expression or pattern need comma for separating elements");
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
          throw createMessageError(ErrorMessageMap.rest_element_can_not_use_in_cover);
        }
      }
      if (trailingComma) {
        throw createMessageError(ErrorMessageMap.sequence_expression_can_not_have_trailing_comma);
      }
      if (nodes.length === 1) {
        nodes[0].parentheses = true;
        return nodes[0];
      }
      if (nodes.length === 0) {
        throw createMessageError(ErrorMessageMap.paran_expr_can_not_be_empty);
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
    if (!match(SyntaxKinds.ArrowOperator)) {
      throw createUnexpectError(SyntaxKinds.ArrowOperator);
    }
    if (getLineTerminatorFlag()) {
      throw createMessageError(ErrorMessageMap.no_line_break_is_allowed_before_arrow);
    }
    nextToken();
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
    // checkFunctionParamIsDuplicate(functionArguments);
    return Factory.createArrowExpression(
      isExpression,
      body,
      functionArguments,
      isCurrentScopeParseAwaitAsExpression(),
      cloneSourcePosition(metaData.start),
      cloneSourcePosition(body.end),
    );
  }
  // Transform argument list to function parameter list, there are some thing we need to check
  // 1. multi spread element is ok to argument list, but parameter list can only have one spread list
  // 2. if argument list last one is spread element, can have trailing comma, but paramemter last is restelement,
  //   it can not have trailing comma.
  // 3. argument list can have duplicate identifier name, but parameter list can not.
  // 4. argument list can have await or yield expression as default value, but paramemter list can not.
  // 5. there are some case dose not enter function scope when parse argument, so we need to check is there any await
  //    and yield usage in parameter list
  // First and second thing toAssignment would check for us. 3 can be done by call `checkFunctionParams`, 4 and 5
  // one can be done by create custome helper function.
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
    const isMultiSpread = checkArrowFunctionParamsSpreadElementRule(params);
    if (isMultiSpread && trailingComma)
      throw createMessageError(ErrorMessageMap.rest_element_can_not_end_with_comma);
    // check as function params
    setContextIfParamsIsSimpleParameterList(params);
    return params;
  }
  function checkArrowFunctionParamsSpreadElementRule(params: Array<Pattern>) {
    let flag = false;
    params.forEach((param) => {
      if (flag && isRestElement(param)) {
        throw createMessageError(ErrorMessageMap.rest_element_should_be_last_property);
      }
      if (flag) {
        throw createMessageError(ErrorMessageMap.rest_element_should_be_last_property);
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
      throw createMessageError(ErrorMessageMap.babel_error_need_enable_jsx);
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
    throw createUnexpectError(null);
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
    throw createUnexpectError(kind, "");
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
        throw createUnexpectError(SyntaxKinds.Identifier);
      }
    }
    if (!id) {
      throw createMessageError(
        ErrorMessageMap.rest_element_must_be_either_binding_identifier_or_binding_pattern,
      );
    }
    return Factory.createRestElement(id, start, cloneSourcePosition(id.end));
  }
  function parseBindingIdentifier() {
    const id = parseWithLHSLayer(parseIdentifierReference);
    declarateSymbol(id.name);
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
    let isStart = false;
    const properties: Array<ObjectPatternProperty | RestElement | AssignmentPattern> = [];
    while (!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
      // eat comma.
      if (!isStart) {
        isStart = true;
      } else {
        expect(SyntaxKinds.CommaToken);
      }
      if (match(SyntaxKinds.BracesRightPunctuator) || match(SyntaxKinds.EOFToken)) {
        continue;
      }
      // parse Rest property
      if (match(SyntaxKinds.SpreadOperator)) {
        properties.push(parseRestElement(false));
        if (
          !match(SyntaxKinds.BracesRightPunctuator) ||
          (match(SyntaxKinds.CommaToken) && lookahead().kind === SyntaxKinds.BracesRightPunctuator)
        ) {
          throw createMessageError(ErrorMessageMap.rest_element_should_be_last_property);
        }
        continue;
      }
      // parse Object pattern property
      const isComputedRef = { isComputed: false };
      const propertyName = parsePropertyName(isComputedRef);
      if (isComputedRef.isComputed || match(SyntaxKinds.ColonPunctuator)) {
        nextToken();
        const pattern = parseBindingElement();
        properties.push(
          Factory.createObjectPatternProperty(
            propertyName,
            pattern,
            isComputedRef.isComputed,
            false,
            cloneSourcePosition(propertyName.start),
            cloneSourcePosition(pattern.end),
          ),
        );
        continue;
      }
      checkPropertyNameAsSigleNameBinding(propertyName);
      if (match(SyntaxKinds.AssginOperator)) {
        nextToken();
        const expr = parseWithRHSLayer(parseAssignmentExpressionAllowIn);
        if (!isPattern(propertyName)) {
          throw createMessageError("assignment pattern left value can only allow identifier or pattern");
        }
        declarateSymbol((propertyName as Identifier).name);
        properties.push(
          Factory.createAssignmentPattern(
            propertyName,
            expr,
            cloneSourcePosition(propertyName.start),
            cloneSourcePosition(expr.end),
          ),
        );
        continue;
      }
      if (isStringLiteral(propertyName) || isNumnerLiteral(propertyName)) {
        throw createMessageError(
          ErrorMessageMap.when_binding_pattern_property_name_is_string_literal_can_not_be_shorted,
        );
      }
      // check property name is keyword or not
      checkPropertyShortedIsKeyword(propertyName);
      declarateSymbol((propertyName as Identifier).name);
      properties.push(
        Factory.createObjectPatternProperty(
          propertyName,
          undefined,
          isComputedRef.isComputed,
          true,
          cloneSourcePosition(propertyName.start),
          cloneSourcePosition(propertyName.end),
        ),
      );
    }
    const { end } = expect(SyntaxKinds.BracesRightPunctuator);
    const objectPattern = Factory.createObjectPattern(properties, start, end);
    return objectPattern;
  }
  function checkPropertyNameAsSigleNameBinding(propertyName: PropertyName) {
    if (isIdentifer(propertyName)) {
      if (propertyName.name === "yield") {
        recordScope(ExpressionScopeKind.YieldIdentifier, propertyName.start);
      }
      if (propertyName.name === "await") {
        recordScope(ExpressionScopeKind.AwaitIdentifier, propertyName.start);
      }
      if (propertyName.name === "arguments") {
        if (isInStrictMode() && strictModeScopeRecorder.isInLHS()) {
          throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
        }
        recordScope(ExpressionScopeKind.ArgumentsIdentifier, propertyName.start);
      }
      if (propertyName.name === "eval") {
        if (isInStrictMode() && strictModeScopeRecorder.isInLHS()) {
          throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
        }
        recordScope(ExpressionScopeKind.EvalIdentifier, propertyName.start);
      }
      if (propertyName.name === "let") {
        if (isInStrictMode()) {
          throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
        }
        recordScope(ExpressionScopeKind.LetIdentifiier, propertyName.start);
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
          throw createMessageError(ErrorMessageMap.rest_element_can_not_end_with_comma);
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
      throw createUnexpectError(SyntaxKinds.Identifier, "expect from keyword");
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
      throw createMessageError(
        ErrorMessageMap.babel_error_import_and_export_may_appear_only_with_sourceType_module,
      );
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
    declarateLetSymbol(name.name);
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
      throw createMessageError("import namespace specifier must has 'as'");
    }
    nextToken();
    const id = parseIdentifierReference();
    declarateLetSymbol(id.name);
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
          throw createMessageError(ErrorMessageMap.keyword_can_not_use_in_imported_when_just_a_specifier);
        } else if (isStringLiteral(imported)) {
          throw createMessageError(ErrorMessageMap.string_literal_cannot_be_used_as_an_imported_binding);
        }
        declarateLetSymbol(imported.name);
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
      declarateLetSymbol(local.name);
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
      throw createMessageError(
        ErrorMessageMap.babel_error_import_and_export_may_appear_only_with_sourceType_module,
      );
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
      let classDeclar = parseClass(decoratorList);
      classDeclar = Factory.transFormClassToClassDeclaration(classDeclar);
      if (!symbolScopeRecorder.testAndSetDefaultExport()) {
        throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
      }
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
      if (!symbolScopeRecorder.testAndSetDefaultExport()) {
        throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
      }
      const name = funcDeclar.name;
      if (name) {
        delcarateFcuntionSymbol(name.name);
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
      if (!symbolScopeRecorder.testAndSetDefaultExport()) {
        throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
      }
      const name = funcDeclar.name;
      if (name) {
        delcarateFcuntionSymbol(name.name);
      }
      return Factory.createExportDefaultDeclaration(funcDeclar, start, cloneSourcePosition(funcDeclar.end));
    }
    // TODO: parse export default from ""; (experimental feature)
    const expr = parseAssignmentExpressionAllowIn();
    shouldInsertSemi();
    if (!symbolScopeRecorder.testAndSetDefaultExport()) {
      throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
    }
    return Factory.createExportDefaultDeclaration(expr, start, cloneSourcePosition(expr.end));
  }
  function parseExportNamedDeclaration(start: SourcePosition): ExportNamedDeclarations {
    expect(SyntaxKinds.BracesLeftPunctuator);
    const specifier: Array<ExportSpecifier> = [];
    let isStart = true;
    let isMatchKeyword = false;
    const undefExportSymbols: Array<string> = [];
    while (!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
      if (isStart) {
        isStart = false;
      } else {
        expect(SyntaxKinds.CommaToken);
      }
      if (match(SyntaxKinds.BracesRightPunctuator) || match(SyntaxKinds.EOFToken)) {
        break;
      }
      // TODO: reafacor into parseModuleName ?
      if (match(Keywords)) {
        isMatchKeyword = true;
      }
      const exported = parseModuleExportName();
      if (isContextKeyword("as")) {
        nextToken();
        const local = parseModuleExportName();
        if (!declarateExportSymbol(helperGetValueOfExportName(local))) {
          throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
        }
        if (
          helperGetValueOfExportName(local) === "default" &&
          !symbolScopeRecorder.testAndSetDefaultExport()
        ) {
          throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
        }
        if (!isVariableDeclarated(helperGetValueOfExportName(exported))) {
          // throw createMessageError(ErrorMessageMap.babel_error_export_is_not_defined)
          undefExportSymbols.push(helperGetValueOfExportName(exported));
        }
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
      if (!declarateExportSymbol(helperGetValueOfExportName(exported))) {
        throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
      }
      if (
        helperGetValueOfExportName(exported) === "default" &&
        !symbolScopeRecorder.testAndSetDefaultExport()
      ) {
        throw createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
      }
      if (!isVariableDeclarated(helperGetValueOfExportName(exported))) {
        // throw createMessageError(ErrorMessageMap.babel_error_export_is_not_defined)
        undefExportSymbols.push(helperGetValueOfExportName(exported));
      }
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
        undefExportSymbols.forEach((sym) => {
          symbolScopeRecorder.addToUndefExportSource(sym);
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
        throw createMessageError(
          ErrorMessageMap.string_literal_cannot_be_used_as_an_exported_binding_without_from,
        );
      }
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
