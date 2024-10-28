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
  isPrivateName,
  isStringLiteral,
  Declaration,
  ClassConstructor,
  ClassAccessor,
  ClassElementName,
  SourcePosition,
  NumericLiteralKinds,
  ClassMethodDeclaration,
  TSAbstractClassAccessorDeclaration,
  TSTypeParameterDeclaration,
  TSTypeAnnotation,
} from "web-infra-common";
import { ErrorMessageMap } from "@/src/parser/error";
import { ExportContext } from "@/src/parser/scope/lexicalScope";
import { StrictModeScope } from "@/src/parser/scope/strictModeScope";
import { SymbolType } from "@/src/parser/scope/symbolScope";
import {
  BindingIdentifierSyntaxKindArray,
  IdentiferWithKeyworArray,
  PreserveWordSet,
} from "@/src/parser/type";

export type ModifierState = {
  isStatic: boolean;
  isAsync: boolean;
  isGenerator: boolean;
  isAccessor: boolean;
  type: "set" | "get" | "method";
  readonly: boolean;
  abstract: boolean;
  accessibility: "private" | "protected" | "public" | null;
};

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
  const start = this.getStartPosition();
  let decorators: Decorator[] | null = null;
  if (this.match(SyntaxKinds.AtPunctuator)) {
    decorators = this.parseDecoratorList();
  } else {
    decorators = this.takeCacheDecorator();
  }
  const modifierState = this.parsePropertyModifier();
  // parse static block
  if (this.match(SyntaxKinds.BracesLeftPunctuator) && modifierState.isStatic) {
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
  // parse ClassElementName
  const [name, computed] = this.parseClassElementName(modifierState);
  // parse class method or declaration
  if (this.match(SyntaxKinds.ParenthesesLeftPunctuator)) {
    return this.parseClassMethodDefinition(start, decorators, modifierState, name, computed);
  }
  // Class Property or accessor
  this.staticSematicForModifierInPropertyName(modifierState);
  this.staticSematicForClassPropertyName(name, computed, modifierState.isStatic);
  const optional = this.tryParseOptionalTypeParam();
  const typeNode = this.tryParseTypeAnnotation();
  let propertyValue = undefined;
  if (this.match([SyntaxKinds.AssginOperator])) {
    this.nextToken();
    const [value, scope] = this.parseWithCatpureLayer(() => this.parseAssignmentExpressionAllowIn());
    propertyValue = value;
    this.staticSematicForClassPropertyValue(scope);
  }
  this.shouldInsertSemi();
  if (modifierState.isAccessor) {
    return Factory.createClassAccessorProperty(
      name,
      propertyValue,
      computed,
      modifierState.isStatic,
      modifierState.abstract,
      decorators,
      typeNode,
      modifierState.accessibility,
      start,
      this.getLastTokenEndPositon(),
    );
  }
  return Factory.createClassProperty(
    name,
    propertyValue,
    computed,
    modifierState.isStatic,
    modifierState.abstract,
    decorators,
    optional,
    typeNode,
    modifierState.accessibility,
    start,
    this.getLastTokenEndPositon(),
  );
}
export function parseClassElementName(this: Parser, state: ModifierState): [ClassElementName, boolean] {
  const isComputedRef = { isComputed: false };
  let key: PropertyName | PrivateName | undefined;
  if (this.match(SyntaxKinds.PrivateName)) {
    key = this.parsePrivateName();
    this.defPrivateName(
      key.name,
      key.start,
      state.type === "method" ? "other" : state.isStatic ? `static-${state.type}` : state.type,
    );
  } else {
    key = this.parsePropertyName(isComputedRef);
  }
  return [key, isComputedRef.isComputed];
}
/**
 *
 */
export function parsePropertyModifier(this: Parser) {
  const state: ModifierState = {
    isAsync: false,
    isGenerator: false,
    isStatic: false,
    type: "method",
    accessibility: null,
    readonly: false,
    abstract: false,
    isAccessor: false,
  };
  // TODO: check double condition and order
  loop: while (
    (this.match(SyntaxKinds.Identifier) && !this.getEscFlag()) ||
    this.match(SyntaxKinds.MultiplyOperator)
  ) {
    if (this.match(SyntaxKinds.MultiplyOperator)) {
      this.nextToken();
      state.isGenerator = true;
      continue;
    }
    const [shouldContinue, lineBreak] = this.isLookAheadCanStartPropertyName();
    if (!shouldContinue) {
      break;
    }
    switch (this.getSourceValue()) {
      case "async": {
        if (lineBreak) break loop;
        state.isAsync = true;
        break;
      }
      case "set": {
        state.type = "set";
        break;
      }
      case "get": {
        state.type = "get";
        break;
      }
      case "static": {
        state.isStatic = true;
        if (state.isAsync) {
          this.raiseError(ErrorMessageMap.ts_invalid_modifier_error, this.getStartPosition());
        }
        break;
      }
      case "readonly": {
        if (lineBreak) break loop;
        state.readonly = true;
        break;
      }
      case "private": {
        if (lineBreak) break loop;
        state.accessibility = "private";
        break;
      }
      case "protected": {
        if (lineBreak) break loop;
        state.accessibility = "public";
        break;
      }
      case "public": {
        if (lineBreak) break loop;
        state.accessibility = "public";
        break;
      }
      case "accessor": {
        if (lineBreak) break loop;
        state.isAccessor = true;
        break;
      }
      case "abstract": {
        if (lineBreak) break loop;
        state.abstract = true;
        break;
      }
      default: {
        // possible to be like
        // static a
        // static
        break loop;
      }
    }
    this.nextToken();
  }
  return state;
}
export function isLookAheadCanStartPropertyName(this: Parser): [boolean, boolean] {
  const { kind, lineTerminatorFlag } = this.lookahead();
  switch (kind) {
    case SyntaxKinds.MultiplyOperator:
    case SyntaxKinds.BracketLeftPunctuator:
    case SyntaxKinds.BracesLeftPunctuator:
    case SyntaxKinds.StringLiteral:
    case SyntaxKinds.PrivateName:
      return [true, lineTerminatorFlag];
    default: {
      if (NumericLiteralKinds.includes(kind) || IdentiferWithKeyworArray.includes(kind)) {
        return [true, lineTerminatorFlag];
      }
    }
  }
  return [false, lineTerminatorFlag];
}
/**
 * Parse Class Method
 * ```
 *  (`?`)? (<Type-Parameters>)? <FunctionParams> (<function-body>)?
 * ```
 * @param this
 * @param propertyName
 * @param isComputed
 * @param state
 */
export function parseClassMethodDefinition(
  this: Parser,
  start: SourcePosition,
  decorators: Decorator[] | null,
  state: ModifierState,
  propertyName: ClassElementName,
  isComputed: boolean,
):
  | ClassConstructor
  | ClassMethodDefinition
  | ClassMethodDeclaration
  | ClassAccessor
  | TSAbstractClassAccessorDeclaration {
  // pre check for parse
  const isCtor = !state.isStatic && !isComputed && this.helperIsPropertyNameIsCtor(propertyName);
  if (isCtor) {
    this.lexicalScopeRecorder.enterCtor();
    if (this.lexicalScopeRecorder.testAndSetCtor()) {
      this.raiseError(ErrorMessageMap.v8_error_a_class_may_only_have_one_constructor, propertyName.start);
    }
  }
  // major parse pattern
  const optional = this.tryParseOptionalTypeParam();
  const typeParameters = this.tryParseTSTypeParameterDeclaration(false);
  this.enterFunctionScope(state.isAsync, state.isGenerator);
  const [parmas, scope] = this.parseWithCatpureLayer(() => this.parseFunctionParam());
  const returnType = this.tryParseTSReturnTypeOrTypePredicate(SyntaxKinds.ColonPunctuator);
  let body: FunctionBody | undefined;
  if (this.match(SyntaxKinds.BracesLeftPunctuator)) {
    body = this.parseFunctionBody();
  }
  this.postStaticSematicEarlyErrorForStrictModeOfFunction(null, scope);
  this.exitFunctionScope(true);
  // post check for parse
  if (isCtor) this.lexicalScopeRecorder.exitCtor();
  this.staticSematicEarlyErrorForMethodDefinition(state, propertyName, parmas);
  this.staticSematicForClassMethod(propertyName, state);
  // create by variant
  return this.helperCreateClassElement(
    isCtor,
    start,
    decorators,
    state,
    propertyName,
    isComputed,
    parmas,
    optional,
    typeParameters,
    returnType,
    body,
  );
}
export function helperIsPropertyNameIsCtor(propertyName: PropertyName) {
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
export function staticSematicForClassMethod(
  this: Parser,
  classElementName: ClassElementName,
  state: ModifierState,
) {
  let valueOfName: string | undefined,
    isPrivate = false,
    fromLiteral = false; //
  if (isStringLiteral(classElementName)) {
    valueOfName = classElementName.value;
    fromLiteral = true;
  } else if (isIdentifer(classElementName)) {
    valueOfName = classElementName.name;
  } else if (isPrivateName(classElementName)) {
    valueOfName = classElementName.name;
    isPrivate = true;
  }
  if (valueOfName === "constructor" && !fromLiteral) {
    if (state.isAsync) {
      this.raiseError(
        ErrorMessageMap.v8_error_class_constructor_may_not_be_an_async_method,
        classElementName.start,
      );
    }
    if (state.isGenerator) {
      this.raiseError(
        ErrorMessageMap.v8_error_class_constructor_may_not_be_a_generator,
        classElementName.start,
      );
    }
    if (state.type === "get" || state.type === "set") {
      this.raiseError(
        ErrorMessageMap.v8_error_class_constructor_may_not_be_an_accessor,
        classElementName.start,
      );
    }
    if (isPrivate) {
      this.raiseError(
        ErrorMessageMap.v8_error_class_may_not_have_a_private_field_named_constructor,
        classElementName.start,
      );
    }
  }
  if (valueOfName === "prototype" && !isPrivate && state.type === "method" && state.isStatic) {
    this.raiseError(
      ErrorMessageMap.v8_error_class_may_not_have_static_property_named_prototype,
      classElementName.start,
    );
  }
}
export function helperCreateClassElement(
  this: Parser,
  isCtor: boolean,
  start: SourcePosition,
  decorators: Decorator[] | null,
  state: ModifierState,
  classElementName: ClassElementName,
  isComputed: boolean,
  parmas: Array<Pattern>,
  optional: boolean,
  typeParameters: TSTypeParameterDeclaration | undefined,
  returnType: TSTypeAnnotation | undefined,
  body: FunctionBody | undefined,
) {
  if (isCtor) {
    if (decorators) {
      this.raiseError(
        ErrorMessageMap.babel_error_decorators_can_not_be_used_with_a_constructor,
        decorators[0].start,
      );
    }
    // if(!body) {
    //   this.raiseError(
    //     ErrorMessageMap.babel_error_decorators_can_not_be_used_with_a_constructor,
    //     this.getLastTokenEndPositon(),
    //   );
    // }
    return Factory.createClassConstructor(
      classElementName as ClassConstructor["key"],
      body!,
      parmas,
      returnType,
      state.accessibility,
      start,
      this.getLastTokenEndPositon(),
    );
  }
  if (state.type === "set" || state.type === "get") {
    if (!body) {
      if (!state.abstract) {
        // should error,
      }
      return Factory.createTSAbstractClassAccessorDeclaration(
        classElementName,
        parmas,
        typeParameters,
        returnType,
        state.accessibility,
        state.type,
        state.isStatic,
        isComputed,
        decorators,
        start,
        this.getLastTokenEndPositon(),
      );
    }
    return Factory.createClassAccessor(
      classElementName,
      body,
      parmas,
      typeParameters,
      returnType,
      state.accessibility,
      state.type,
      state.isStatic,
      isComputed,
      decorators,
      start,
      this.getLastTokenEndPositon(),
    );
  }
  if (!body) {
    return Factory.createClassMethodDeclaration(
      classElementName,
      parmas,
      typeParameters,
      returnType,
      state.isAsync,
      state.isGenerator,
      state.abstract,
      isComputed,
      state.isStatic,
      decorators,
      optional,
      state.accessibility,
      start,
      this.getLastTokenEndPositon(),
    );
  }
  if (state.abstract) {
    // reoverable error.
  }
  return Factory.createClassMethodDefintion(
    classElementName,
    body,
    parmas,
    typeParameters,
    returnType,
    state.isAsync,
    state.isGenerator,
    isComputed,
    state.isStatic,
    decorators,
    optional,
    state.accessibility,
    start,
    this.getLastTokenEndPositon(),
  );
}
