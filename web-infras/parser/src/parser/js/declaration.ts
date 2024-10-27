/** =================================================================
 * Parse Delcarations
 * entry point reference: https://tc39.es/ecma262/#prod-Declaration
 * ==================================================================
 */
import { Parser } from "@/src/parser";
import {
  Function as FunctionAST,
  VariableDeclaration,
  SyntaxKinds,
  VariableDeclarator,
  isIdentifer,
  TSParameter,
  Factory,
  cloneSourcePosition,
  FunctionDeclaration,
  TSDeclareFunction,
  Identifier,
  FunctionBody,
  StatementListItem,
  Pattern,
  Decorator,
  Expression,
  ClassDeclaration,
  Class,
  ClassBody,
  ClassElement,
  ClassMethodDefinition,
  PropertyName,
  PrivateName,
  Keywords,
  isPrivateName,
  isStringLiteral,
  Declaration,
} from "web-infra-common";
import { ErrorMessageMap } from "@/src/parser/error";
import { ExportContext } from "@/src/parser/scope/lexicalScope";
import { StrictModeScope } from "@/src/parser/scope/strictModeScope";
import { SymbolType } from "@/src/parser/scope/symbolScope";
import { BindingIdentifierSyntaxKindArray, PreserveWordSet } from "@/src/parser/type";
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
export function parseDeclaration(this: Parser): Declaration {
  const token = this.getToken();
  switch (token) {
    // async function declaration
    case SyntaxKinds.Identifier:
    case SyntaxKinds.EnumKeyword: {
      const declar = this.tryParseDeclarationWithIdentifierStart();
      if (!declar) {
        throw this.createUnexpectError();
      }
      return declar;
    }
    // function delcaration
    case SyntaxKinds.FunctionKeyword:
      return this.parseFunctionDeclaration(false, false);
    case SyntaxKinds.ConstKeyword:
    case SyntaxKinds.LetKeyword:
      return this.parseVariableDeclaration();
    case SyntaxKinds.AtPunctuator:
      return this.parseClassDeclaration(this.parseDecoratorList());
    case SyntaxKinds.ClassKeyword:
      return this.parseClassDeclaration(null);
    default:
      throw this.createUnexpectError();
  }
}
export function tryParseDeclarationWithIdentifierStart(this: Parser): Declaration | undefined {
  if (this.getEscFlag()) {
    return;
  }
  if (this.match(SyntaxKinds.EnumKeyword)) {
    return this.parseTSEnumDeclaration();
  }
  const { kind: lookaheadToken, lineTerminatorFlag } = this.lookahead();
  const sourceValue = this.getSourceValue();
  switch (sourceValue) {
    case "async": {
      if (!(lookaheadToken === SyntaxKinds.FunctionKeyword && !lineTerminatorFlag)) {
        return;
      }
      this.nextToken();
      if (this.getLineTerminatorFlag()) {
        this.raiseError(ErrorMessageMap.missing_semicolon, this.getStartPosition());
      }
      return this.parseFunctionDeclaration(true, false);
    }
    case "type": {
      if (!(lookaheadToken === SyntaxKinds.Identifier && !lineTerminatorFlag)) {
        return;
      }
      return this.parseTSTypeAlias();
    }
    case "interface": {
      if (!(lookaheadToken === SyntaxKinds.Identifier && !lineTerminatorFlag)) {
        return;
      }
      return this.parseTSInterfaceDeclaration();
    }
    default: {
      return;
    }
  }
}
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
export function parseVariableDeclaration(this: Parser, inForInit: boolean = false): VariableDeclaration {
  const variableKind = this.match(SyntaxKinds.VarKeyword) ? "var" : "lexical";
  const { start: keywordStart, value: variant } = this.expect([
    SyntaxKinds.VarKeyword,
    SyntaxKinds.ConstKeyword,
    SyntaxKinds.LetKeyword,
  ]);
  let shouldStop = false,
    isStart = true;
  const declarations: Array<VariableDeclarator> = [];
  const lastSymbolKind = this.getSymbolType();
  this.setSymbolType(
    variant === "var" ? SymbolType.Var : variant === "const" ? SymbolType.Const : SymbolType.Let,
  );
  if (this.getExportContext() === ExportContext.InExport) {
    this.setExportContext(ExportContext.InExportBinding);
  }
  while (!shouldStop) {
    if (isStart) {
      isStart = false;
    } else {
      if (!this.match(SyntaxKinds.CommaToken)) {
        shouldStop = true;
        continue;
      }
      this.nextToken();
    }
    // eslint-disable-next-line prefer-const
    let [id, scope] = this.parseWithCatpureLayer(() => this.parseBindingElement(false));
    const isBindingPattern = !isIdentifer(id);
    if (variableKind === "lexical" && scope.kind !== "RHSLayer" && scope.letIdentifier.length > 0) {
      throw new Error("TODO ERROR: Better");
    }
    id = this.parseFunctionParamType(id as TSParameter, false);
    // custom logical for check is lexical binding have let identifier ?
    if (
      // variable declarations binding pattern but but have init.
      (isBindingPattern || variant === "const") &&
      !this.match(SyntaxKinds.AssginOperator) &&
      // variable declaration in for statement can existed with `of`, `in` operator
      !inForInit
    ) {
      // recoverable error
      this.raiseError(ErrorMessageMap.syntax_error_missing_init_in_const_declaration, id.start);
    }
    if (this.match(SyntaxKinds.AssginOperator)) {
      this.nextToken();
      const init = this.parseAssignmentExpressionInheritIn();
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
      Factory.createVariableDeclarator(id, null, cloneSourcePosition(id.start), cloneSourcePosition(id.end)),
    );
  }
  this.setSymbolType(lastSymbolKind);
  this.setExportContext(ExportContext.NotInExport);
  if (!inForInit) {
    this.shouldInsertSemi();
  }
  return Factory.createVariableDeclaration(
    declarations,
    variant as VariableDeclaration["variant"],
    keywordStart,
    declarations[declarations.length - 1].end,
  );
}
export function parseFunctionDeclaration(
  this: Parser,
  isAsync: boolean,
  isDefault: boolean,
): FunctionDeclaration | TSDeclareFunction {
  this.enterFunctionScope(isAsync);
  const { start } = this.expect(SyntaxKinds.FunctionKeyword);
  let generator = false;
  if (this.match(SyntaxKinds.MultiplyOperator)) {
    generator = true;
    this.setCurrentFunctionContextAsGenerator();
    this.nextToken();
  }
  const [[name, typeParameters, params], scope] = this.parseWithCatpureLayer(() => {
    const name = this.parseFunctionName(isDefault);
    if (!name && !isDefault) {
      // recoverable error
      this.raiseError(
        ErrorMessageMap.syntax_error_function_statement_requires_a_name,
        this.getStartPosition(),
      );
    }
    const typeParameters = this.tryParseTSTypeParameterDeclaration(false);
    const params = this.parseFunctionParam();
    return [name, typeParameters, params];
  });
  const returnType = this.tryParseTSReturnTypeOrTypePredicate(SyntaxKinds.ColonPunctuator);
  if (this.match(SyntaxKinds.BracesLeftPunctuator)) {
    const body = this.parseFunctionBody();
    this.postStaticSematicEarlyErrorForStrictModeOfFunction(name, scope);
    const func = Factory.createFunction(
      name,
      body,
      params,
      typeParameters,
      returnType,
      generator,
      this.isCurrentScopeParseAwaitAsExpression(),
      start,
      cloneSourcePosition(body.end),
    );
    this.exitFunctionScope(false);
    // for function declaration, symbol should declar in parent scope.
    if (name) {
      this.delcarateFcuntionSymbol(name.name, func.generator, func.start);
    }
    return Factory.transFormFunctionToFunctionDeclaration(func);
  } else {
    const funcDeclar = Factory.createTSDeclarFunction(
      name,
      returnType,
      params,
      typeParameters,
      generator,
      this.isCurrentScopeParseAwaitAsExpression(),
      start,
      this.getLastTokenEndPositon(),
    );
    this.shouldInsertSemi();
    this.exitFunctionScope(false);
    return funcDeclar;
  }
}
/**
 * Parse function maybe call by parseFunctionDeclaration and parseFunctionExpression,
 * first different of those two function is that function-declaration can not have null
 * name.
 * @returns {FunctionAST}
 */
export function parseFunction(this: Parser, isExpression: boolean): FunctionAST {
  const { start } = this.expect(SyntaxKinds.FunctionKeyword);
  let generator = false;
  if (this.match(SyntaxKinds.MultiplyOperator)) {
    generator = true;
    this.setCurrentFunctionContextAsGenerator();
    this.nextToken();
  }
  const [[name, typeParameters, params], scope] = this.parseWithCatpureLayer(() => {
    const name = this.parseFunctionName(isExpression);
    if (!name && !isExpression) {
      // recoverable error
      this.raiseError(
        ErrorMessageMap.syntax_error_function_statement_requires_a_name,
        this.getStartPosition(),
      );
    }
    const typeParameters = this.tryParseTSTypeParameterDeclaration(false);
    const params = this.parseFunctionParam();
    return [name, typeParameters, params];
  });
  const returnType = this.tryParseTSReturnTypeOrTypePredicate(SyntaxKinds.ColonPunctuator);
  const body = this.parseFunctionBody();
  this.postStaticSematicEarlyErrorForStrictModeOfFunction(name, scope);
  return Factory.createFunction(
    name,
    body,
    params,
    typeParameters,
    returnType,
    generator,
    this.isCurrentScopeParseAwaitAsExpression(),
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
export function postStaticSematicEarlyErrorForStrictModeOfFunction(
  this: Parser,
  name: Identifier | null,
  scope: StrictModeScope,
) {
  if (this.isInStrictMode()) {
    this.checkStrictModeScopeError(scope);
    if (name) {
      if (
        name.name === "arugments" ||
        name.name === "eval" ||
        name.name === "yield" ||
        name.name === "let" ||
        PreserveWordSet.has(name.name)
      ) {
        this.raiseError(ErrorMessageMap.unexpect_keyword_in_stric_mode, name.start);
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
 * @param {boolean} optionalName
 * @returns {Identifier | null}
 */
export function parseFunctionName(this: Parser, optionalName: boolean): Identifier | null {
  return this.parseWithLHSLayer(() => {
    let name: Identifier | null = null;
    // there we do not just using parseIdentifier function as the reason above
    // let can be function name as other place
    if (this.match([SyntaxKinds.Identifier, SyntaxKinds.LetKeyword])) {
      name = this.parseIdentifierReference();
    } else {
      if (this.match(SyntaxKinds.AwaitKeyword)) {
        // for function expression, can await treat as function name is dep on current scope.
        if (optionalName && this.isCurrentScopeParseAwaitAsExpression()) {
          this.raiseError(
            ErrorMessageMap.babel_error_can_not_use_await_as_identifier_inside_an_async_function,
            this.getStartPosition(),
          );
        }
        // for function declaration, can await treat as function name is dep on parent scope.
        if (!optionalName && this.isParentFunctionAsync()) {
          this.raiseError(
            ErrorMessageMap.babel_error_can_not_use_await_as_identifier_inside_an_async_function,
            this.getStartPosition(),
          );
        }
        if (this.config.sourceType === "module") {
          this.raiseError(
            ErrorMessageMap.babel_error_can_not_use_await_as_identifier_inside_an_async_function,
            this.getStartPosition(),
          );
        }
        name = this.parseIdentifierName();
      } else if (this.match(SyntaxKinds.YieldKeyword)) {
        // for function expression, can yield treat as function name is dep on current scope.
        if (optionalName && this.isCurrentScopeParseYieldAsExpression()) {
          this.raiseError(ErrorMessageMap.babel_error_invalid_yield, this.getStartPosition());
        }
        // for function declaration, can yield treat as function name is  dep on parent scope.
        if (!optionalName && this.isParentFunctionGenerator()) {
          this.raiseError(ErrorMessageMap.babel_error_invalid_yield, this.getStartPosition());
        }
        // if in strict mode, yield can not be function name.
        if (this.isInStrictMode()) {
          this.raiseError(ErrorMessageMap.babel_error_invalid_yield, this.getStartPosition());
        }
        name = this.parseIdentifierName();
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
export function parseFunctionBody(this: Parser): FunctionBody {
  const { start } = this.expect(SyntaxKinds.BracesLeftPunctuator);
  const body: Array<StatementListItem> = [];
  while (!this.match(SyntaxKinds.BracesRightPunctuator) && !this.match(SyntaxKinds.EOFToken)) {
    body.push(this.parseStatementListItem());
  }
  const { end } = this.expect(SyntaxKinds.BracesRightPunctuator);
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
export function parseFunctionParam(this: Parser): Array<Pattern> {
  this.expect(SyntaxKinds.ParenthesesLeftPunctuator);
  this.enterFunctionParameter();
  let isStart = true;
  let isEndWithRest = false;
  const params: Array<Pattern> = [];
  while (!this.match(SyntaxKinds.ParenthesesRightPunctuator)) {
    if (isStart) {
      if (this.match(SyntaxKinds.CommaToken)) {
        // recoverable error
        this.raiseError(ErrorMessageMap.extra_error_unexpect_trailing_comma, this.getStartPosition());
        this.nextToken();
      }
      isStart = false;
    } else {
      this.expect(SyntaxKinds.CommaToken);
    }
    if (this.match(SyntaxKinds.ParenthesesRightPunctuator)) {
      continue;
    }
    // parse SpreadElement (identifer, Object, Array)
    let param: Pattern;
    if (this.match(SyntaxKinds.SpreadOperator)) {
      isEndWithRest = true;
      param = this.parseRestElement(true);
      param = this.parseFunctionParamType(param as TSParameter, true);
      params.push(param);
      break;
    } else {
      param = this.parseBindingElement();
      param = this.parseFunctionParamType(param as TSParameter, true);
      params.push(param);
    }
  }
  if (!this.match(SyntaxKinds.ParenthesesRightPunctuator)) {
    if (isEndWithRest && this.match(SyntaxKinds.CommaToken)) {
      // recoverable error
      this.raiseError(
        ErrorMessageMap.babel_error_unexpected_trailing_comma_after_rest_element,
        this.getStartPosition(),
      );
      this.nextToken();
    }
    throw this.createUnexpectError();
  }
  this.nextToken();
  this.setContextIfParamsIsSimpleParameterList(params);
  this.existFunctionParameter();
  return params;
}
/**
 * Helper function for check if parameter list is simple
 * parameter list or not, if is simple parameter, set
 * the context.
 * @param {Array<Pattern>} params
 * @returns
 */
export function setContextIfParamsIsSimpleParameterList(this: Parser, params: Array<Pattern>) {
  for (const param of params) {
    if (!isIdentifer(param)) {
      this.setCurrentFunctionParameterListAsNonSimple();
      return;
    }
  }
}
export function parseDecoratorListToCache(this: Parser) {
  const decoratorList = this.parseDecoratorList();
  this.context.cache.decorators = decoratorList;
}
export function parseDecoratorList(this: Parser): [Decorator] {
  const decoratorList: [Decorator] = [this.parseDecorator()];
  while (this.match(SyntaxKinds.AtPunctuator)) {
    decoratorList.push(this.parseDecorator());
  }
  if (
    this.match(SyntaxKinds.ClassKeyword) ||
    (this.match(SyntaxKinds.ExportKeyword) && this.config.sourceType === "module") ||
    this.isInClassScope()
  ) {
    return decoratorList;
  }
  this.raiseError(
    ErrorMessageMap.babel_error_leading_decorators_must_be_attached_to_a_class_declaration,
    decoratorList[0].start,
  );
  return decoratorList;
}
export function parseDecorator(this: Parser): Decorator {
  const { start } = this.expect(SyntaxKinds.AtPunctuator);
  switch (this.getToken()) {
    case SyntaxKinds.ParenthesesLeftPunctuator: {
      this.nextToken();
      const expr = this.parseExpressionAllowIn();
      this.expect(SyntaxKinds.ParenthesesRightPunctuator);
      return Factory.createDecorator(expr, start, expr.end);
    }
    default: {
      let expr: Expression = this.parseIdentifierName();
      while (this.match(SyntaxKinds.DotOperator)) {
        this.nextToken();
        const property = this.match(SyntaxKinds.PrivateName)
          ? this.parsePrivateName()
          : this.parseIdentifierName();
        expr = Factory.createMemberExpression(
          false,
          property,
          expr,
          false,
          cloneSourcePosition(expr.start),
          cloneSourcePosition(property.end),
        );
      }
      if (
        this.match(SyntaxKinds.LtOperator) ||
        this.match(SyntaxKinds.BitwiseLeftShiftOperator) ||
        this.match(SyntaxKinds.ParenthesesLeftPunctuator)
      ) {
        const typeArguments = this.tryParseTSTypeParameterInstantiation(false);
        const { nodes, end } = this.parseArguments();
        const callExpr = Factory.createCallExpression(
          expr,
          nodes,
          typeArguments,
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
export function parseClassDeclaration(this: Parser, decoratorList: Decorator[] | null): ClassDeclaration {
  this.expectButNotEat(SyntaxKinds.ClassKeyword);
  decoratorList = decoratorList || this.takeCacheDecorator();
  const classDelcar = this.parseClass(decoratorList);
  if (classDelcar.id === null) {
    this.raiseError(ErrorMessageMap.babel_error_a_class_name_is_required, classDelcar.start);
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
export function parseClass(this: Parser, decoratorList: Decorator[] | null): Class {
  const { start } = this.expect(SyntaxKinds.ClassKeyword);
  let name: Identifier | null = null;
  if (this.match(BindingIdentifierSyntaxKindArray)) {
    name = this.parseIdentifierReference();
    this.declarateLetSymbol(name.name, name.start);
  }
  let superClass: Expression | null = null;
  if (this.match(SyntaxKinds.ExtendsKeyword)) {
    this.enterClassScope(true);
    this.nextToken();
    superClass = this.parseLeftHandSideExpression();
  } else {
    this.enterClassScope(false);
  }
  const body = this.parseClassBody();
  this.existClassScope();
  return Factory.createClass(name, superClass, body, decoratorList, start, cloneSourcePosition(body.end));
}
/**
 * Parse ClassBody
 * ```
 *  ClassBody := '{' [ClassElement] '}'
 * ```
 * @return {ClassBody}
 */
export function parseClassBody(this: Parser): ClassBody {
  const { start } = this.expect(SyntaxKinds.BracesLeftPunctuator);
  const classbody: ClassBody["body"] = [];
  while (!this.match(SyntaxKinds.BracesRightPunctuator) && !this.match(SyntaxKinds.EOFToken)) {
    if (this.match(SyntaxKinds.SemiPunctuator)) {
      this.nextToken();
      continue;
    }
    classbody.push(this.parseClassElement());
  }
  const { end } = this.expect(SyntaxKinds.BracesRightPunctuator);
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
export function parseClassElement(this: Parser): ClassElement {
  let decorators: Decorator[] | null = null;
  if (this.match(SyntaxKinds.AtPunctuator)) {
    decorators = this.parseDecoratorList();
  } else {
    decorators = this.takeCacheDecorator();
  }
  // parse static modifier
  const isStatic = this.checkIsMethodStartWithStaticModifier();
  if (this.checkIsMethodStartWithModifier()) {
    return this.parseMethodDefintion(true, undefined, isStatic, decorators) as ClassMethodDefinition;
  }
  if (this.match(SyntaxKinds.BracesLeftPunctuator) && isStatic) {
    if (decorators) {
      this.raiseError(
        ErrorMessageMap.babel_error_decorators_can_not_be_used_with_a_static_block,
        decorators[0].start,
      );
    }
    const { start } = this.expect(SyntaxKinds.BracesLeftPunctuator);
    this.symbolScopeRecorder.enterFunctionSymbolScope();
    const body: Array<StatementListItem> = [];
    while (!this.match(SyntaxKinds.BracesRightPunctuator) && !this.match(SyntaxKinds.EOFToken)) {
      body.push(this.parseStatementListItem());
    }
    this.symbolScopeRecorder.exitSymbolScope();
    const { end } = this.expect(SyntaxKinds.BracesRightPunctuator);
    return Factory.createClassStaticBlock(body, start, end);
  }
  let accessor = false;
  if (this.isContextKeyword("accessor")) {
    const { kind, lineTerminatorFlag } = this.lookahead();
    if (kind === SyntaxKinds.Identifier && !lineTerminatorFlag) {
      this.nextToken();
      accessor = true;
    }
  }
  // parse ClassElementName
  const isComputedRef = { isComputed: false };
  let key: PropertyName | PrivateName | undefined;
  if (this.match(SyntaxKinds.PrivateName)) {
    key = this.parsePrivateName();
    this.defPrivateName(key.name, key.start);
  } else {
    key = this.parsePropertyName(isComputedRef);
  }
  if (this.match(SyntaxKinds.ParenthesesLeftPunctuator)) {
    return this.parseMethodDefintion(
      true,
      [key, isComputedRef.isComputed],
      isStatic,
      decorators,
    ) as ClassMethodDefinition;
  }
  this.staticSematicForClassPropertyName(key, isComputedRef.isComputed, isStatic);
  let propertyValue = undefined,
    shorted = true;
  if (this.match([SyntaxKinds.AssginOperator])) {
    this.nextToken();
    shorted = false;
    const [value, scope] = this.parseWithCatpureLayer(() => this.parseAssignmentExpressionAllowIn());
    propertyValue = value;
    this.staticSematicForClassPropertyValue(scope);
  }
  this.shouldInsertSemi();
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
export function checkIsMethodStartWithStaticModifier(this: Parser) {
  const { kind } = this.lookahead();
  if (this.isContextKeyword("static")) {
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
        this.nextToken();
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
export function staticSematicForClassPropertyValue(this: Parser, scope: StrictModeScope) {
  if (scope.kind !== "CatpureLayer") {
    return;
  }
  for (const pos of scope.argumentsIdentifier) {
    this.raiseError(ErrorMessageMap.syntax_error_bad_strict_arguments_eval, pos);
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
export function staticSematicForClassPropertyName(
  this: Parser,
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
      this.raiseError(
        ErrorMessageMap.babel_error_classe_may_not_have_a_field_named_constructor,
        propertyName.start,
      );
    }
    if (value === "prototype" && isStatic) {
      this.raiseError(
        ErrorMessageMap.v8_error_class_may_not_have_static_property_named_prototype,
        propertyName.start,
      );
    }
  }
}
