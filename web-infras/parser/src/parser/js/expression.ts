import {
  Expression,
  SyntaxKinds,
  Factory,
  cloneSourcePosition,
  AssigmentOperators,
  Pattern,
  AssigmentOperatorKinds,
  YieldExpression,
  isArrowFunctionExpression,
  isPrivateName,
  BinaryOperatorKinds,
  isUnaryExpression,
  isAwaitExpression,
  UnaryOperators,
  UnaryOperatorKinds,
  UnaryExpression,
  isIdentifer,
  UpdateOperators,
  UpdateOperatorKinds,
  TSTypeParameterInstantiation,
  ModuleItem,
  TSTypeAnnotation,
  PrivateName,
  ExpressionStatement,
  isClassExpression,
  isFunctionExpression,
  isStringLiteral,
} from "web-infra-common";
import { Parser } from "@/src/parser";
import { ParserPlugin } from "@/src/parser/config";
import { ErrorMessageMap } from "@/src/parser/error";
import { ExpressionScopeKind } from "@/src/parser/scope/type";
import { ASTArrayWithMetaData } from "@/src/parser/type";

interface LefthansSideParseState {
  shouldStop: boolean;
  hasOptional: boolean;
  optional: boolean;
  abortLastTime: boolean;
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
export function parseExpressionStatement(this: Parser): ExpressionStatement {
  this.preStaticSematicEarlyErrorForExpressionStatement();
  const lastTokenIndex = this.lexer.getLastTokenEndPositon().index;
  const expr = this.parseExpressionAllowIn();
  this.checkStrictMode(expr);
  this.postStaticSematicEarlyErrorForExpressionStatement(expr, lastTokenIndex);
  this.shouldInsertSemi();
  return Factory.createExpressionStatement(
    expr,
    cloneSourcePosition(expr.start),
    cloneSourcePosition(expr.end),
  );
}
/**
 * Implement part of NOTE section in 14.5
 */
export function preStaticSematicEarlyErrorForExpressionStatement(this: Parser) {
  if (this.match(SyntaxKinds.LetKeyword)) {
    const { kind, lineTerminatorFlag } = this.lookahead();
    if (
      kind === SyntaxKinds.BracketLeftPunctuator ||
      (!lineTerminatorFlag && (kind === SyntaxKinds.BracesLeftPunctuator || kind === SyntaxKinds.Identifier))
    ) {
      this.raiseError(
        ErrorMessageMap.v8_error_lexical_declaration_cannot_appear_in_a_single_statement_context,
        this.getStartPosition(),
      );
    }
  }
}
/**
 * Implement part of NOTE section in 14.5
 */
export function postStaticSematicEarlyErrorForExpressionStatement(
  this: Parser,
  expr: Expression,
  lastTokenIndex: number,
) {
  if (!expr.parentheses) {
    if (isClassExpression(expr)) {
      this.raiseError(ErrorMessageMap.syntax_error_functions_declare_non_strict_mode, expr.start);
      return;
    }
    if (isFunctionExpression(expr)) {
      if (expr.async) {
        this.raiseError(ErrorMessageMap.syntax_error_async_function_declare, expr.start);
      }
      if (expr.generator) {
        this.raiseError(ErrorMessageMap.syntax_error_generator_function_declare, expr.start);
      }
      if (this.isInStrictMode()) {
        this.raiseError(ErrorMessageMap.syntax_error_functions_declare_strict_mode, expr.start);
      } else {
        if (lastTokenIndex !== this.context.lastTokenIndexOfIfStmt) {
          this.raiseError(ErrorMessageMap.syntax_error_functions_declare_non_strict_mode, expr.start);
        }
      }
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
export function checkStrictMode(this: Parser, expr: Expression) {
  if (isStringLiteral(expr)) {
    if (expr.value === "use strict" && !expr.parentheses) {
      if (this.isDirectToFunctionContext()) {
        if (!this.isCurrentFunctionParameterListSimple()) {
          // recoverable error
          this.raiseError(
            ErrorMessageMap.syntax_error_use_strict_not_allowed_in_function_with_non_simple_parameters,
            expr.start,
          );
        }
        this.setCurrentFunctionContextAsStrictMode();
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
export function parseExpressionAllowIn(this: Parser): Expression {
  return this.allowInOperaotr(() => this.parseExpressionInheritIn());
}
/**
 * Private Parse API, parse Expression.
 * - allow disallow in operator syntax transition action.
 * - for more detail, please refer to `parseExpressionAllowIn`.
 * @returns {Expression}
 */
export function parseExpressionDisallowIn(this: Parser): Expression {
  return this.disAllowInOperaotr(() => this.parseExpressionInheritIn());
}
/**
 * Private Parse API, parse Expression.
 * - inherit in operator syntax transition action.
 * - for more detail, please refer to `parseExpressionAllowIn`.
 * @returns {Expression}
 */
export function parseExpressionInheritIn(this: Parser): Expression {
  const exprs = [this.parseAssignmentExpressionInheritIn()];
  while (this.match(SyntaxKinds.CommaToken)) {
    this.nextToken();
    exprs.push(this.parseAssignmentExpressionInheritIn());
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
export function parseAssignmentExpressionAllowIn(this: Parser): Expression {
  return this.allowInOperaotr(() => this.parseAssignmentExpressionInheritIn());
}
/**
 * Private Parse API, parse AssignmentExpression
 * - inherit in operator syntax transition action.
 * - for more detail, please refer to `parseAssignmentExpressionAllowIn`.
 * @returns {Expression}
 */
export function parseAssignmentExpressionInheritIn(this: Parser): Expression {
  if (
    this.match([
      SyntaxKinds.ParenthesesLeftPunctuator,
      SyntaxKinds.Identifier,
      SyntaxKinds.LetKeyword,
      SyntaxKinds.YieldKeyword,
      SyntaxKinds.AwaitKeyword,
    ])
  ) {
    this.context.maybeArrowStart = this.getStartPosition().index;
  }
  if (this.match(SyntaxKinds.YieldKeyword) && this.isCurrentScopeParseYieldAsExpression()) {
    return this.parseYieldExpression();
  }
  if (
    !this.requirePlugin(ParserPlugin.JSX) &&
    this.requirePlugin(ParserPlugin.TypeScript) &&
    (this.match(SyntaxKinds.LtOperator) || this.match(SyntaxKinds.BitwiseLeftShiftOperator))
  ) {
    const expr = this.parseTSGenericArrowFunctionExpression();
    if (expr) return expr;
  }
  const [leftExpr, scope] = this.parseWithCatpureLayer(() => this.parseConditionalExpression());
  if (!this.match(AssigmentOperators)) {
    return leftExpr;
  }
  const left = this.exprToPattern(leftExpr, false);
  this.checkStrictModeScopeError(scope);
  const operator = this.getToken();
  if (operator !== SyntaxKinds.AssginOperator) {
    this.checkExpressionAsLeftValue(left);
  }
  this.nextToken();
  const right = this.parseAssignmentExpressionInheritIn();
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
export function canParseAsArrowFunction(this: Parser): boolean {
  return this.getStartPosition().index === this.context.maybeArrowStart;
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
export function parseYieldExpression(this: Parser): YieldExpression {
  const { start } = this.expect(SyntaxKinds.YieldKeyword);
  let delegate = false;
  if (this.match(SyntaxKinds.MultiplyOperator)) {
    if (!this.getLineTerminatorFlag()) {
      this.nextToken();
      delegate = true;
    }
  }
  const isLineDterminator = this.getLineTerminatorFlag();
  let argument: Expression | null = null;
  if (!this.isSoftInsertSemi(false) && this.checkIsFollowByExpreesion()) {
    if (delegate || (!delegate && !isLineDterminator)) {
      argument = this.parseAssignmentExpressionInheritIn();
    }
  }
  if (delegate && !argument) {
    this.raiseError(
      ErrorMessageMap.extra_error_yield_deletgate_can_must_be_followed_by_assignment_expression,
      this.getStartPosition(),
    );
  }
  if (this.isInParameter()) {
    this.raiseError(ErrorMessageMap.extra_error_yield_expression_can_not_used_in_parameter_list, start);
  }
  this.recordScope(ExpressionScopeKind.YieldExpressionInParameter, start);
  return Factory.createYieldExpression(
    argument,
    delegate,
    start,
    cloneSourcePosition(argument ? argument.end : start),
  );
}
export function checkIsFollowByExpreesion(this: Parser) {
  switch (this.getToken()) {
    case SyntaxKinds.ColonPunctuator:
    case SyntaxKinds.ParenthesesRightPunctuator:
    case SyntaxKinds.BracketRightPunctuator:
    case SyntaxKinds.CommaToken:
      return false;
    default:
      return true;
  }
}
export function parseConditionalExpression(this: Parser): Expression {
  const test = this.parseBinaryExpression();
  if (this.shouldEarlyReturn(test)) {
    return test;
  }
  // for `arrow function` param, will first
  if (!this.match(SyntaxKinds.QustionOperator)) {
    return test;
  }
  if (this.requirePlugin(ParserPlugin.TypeScript)) {
    const { kind } = this.lookahead();
    if (kind === SyntaxKinds.ColonPunctuator || kind === SyntaxKinds.ParenthesesRightPunctuator) {
      return test;
    }
  }
  this.nextToken();
  const conseq = this.parseAssignmentExpressionAllowIn();
  this.expect(SyntaxKinds.ColonPunctuator);
  const alter = this.parseAssignmentExpressionInheritIn();
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
export function shouldEarlyReturn(this: Parser, expr: Expression) {
  return isArrowFunctionExpression(expr) && !expr.parentheses;
}
/**
 * Using Operator-precedence parser algorithm is used for parse binary expressiom
 * with precedence order. and this is entry function for parseBinaryExpression.
 * @returns {Expression}
 */
export function parseBinaryExpression(this: Parser): Expression {
  let atom = this.parseUnaryOrPrivateName();
  if (this.shouldEarlyReturn(atom)) {
    return atom;
  }
  atom = this.parseBinaryOps(atom);
  if (isPrivateName(atom)) {
    this.raiseError(ErrorMessageMap.babel_error_private_name_wrong_used, atom.start);
  }
  return atom;
}
/**
 * Return the precedence order by given binary operator.
 * this function should only used by parseBinaryOps
 * @param {SyntaxKinds} kind Binary Operator
 * @returns {number}
 */
export function getBinaryPrecedence(this: Parser, kind: SyntaxKinds): number {
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
      if (kind === SyntaxKinds.InKeyword && !this.getCurrentInOperatorStack()) {
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
export function isBinaryOps(this: Parser, kind: SyntaxKinds) {
  return this.getBinaryPrecedence(kind) > 0;
}
/**
 * Bottom up recurive function for parse binary operator and next
 * expression.
 * @param {Expression} left
 * @param {number} lastPre
 * @returns {Expression}
 */
export function parseBinaryOps(this: Parser, left: Expression, lastPre: number = 0): Expression {
  // eslint-disable-next-line no-constant-condition
  while (1) {
    // TS handle
    if (
      this.requirePlugin(ParserPlugin.TypeScript) &&
      (this.isContextKeyword("as") || this.isContextKeyword("satisfies"))
    ) {
      const isSatisfies = this.isContextKeyword("satisfies");
      this.nextToken();
      const typeNode = this.parseTSTypeNode();
      if (isSatisfies) {
        left = Factory.createTSSatisfiesExpression(
          left,
          typeNode,
          cloneSourcePosition(left.start),
          this.getLastTokenEndPositon(),
        );
      } else {
        left = Factory.createTSAsExpression(
          left,
          typeNode,
          cloneSourcePosition(left.start),
          this.getLastTokenEndPositon(),
        );
      }
      continue;
    }
    const currentOp = this.getToken();
    if (!this.isBinaryOps(currentOp) || this.getBinaryPrecedence(currentOp) < lastPre) {
      break;
    }
    this.nextToken();
    let right = this.parseUnaryOrPrivateName();
    const nextOp = this.getToken();
    if (this.isBinaryOps(nextOp) && this.getBinaryPrecedence(nextOp) > this.getBinaryPrecedence(currentOp)) {
      right = this.parseBinaryOps(right, this.getBinaryPrecedence(nextOp));
    }
    this.staticSematicForBinaryExpr(currentOp, nextOp, left, right);
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
export function staticSematicForBinaryExpr(
  this: Parser,
  currentOps: SyntaxKinds,
  nextOps: SyntaxKinds,
  left: Expression,
  right: Expression,
) {
  if (isPrivateName(right) || (isPrivateName(left) && currentOps !== SyntaxKinds.InKeyword)) {
    // recoverable error
    this.raiseError(ErrorMessageMap.babel_error_private_name_wrong_used, left.start);
  }
  if (left.parentheses) {
    return;
  }
  if (currentOps === SyntaxKinds.ExponOperator) {
    if (isUnaryExpression(left) || isAwaitExpression(left)) {
      // recoverable error
      this.raiseError(ErrorMessageMap.v8_error_expont_operator_need_parans, left.start);
    }
  }
  // if currentOp is nullish, next is logical or not
  // if current Ops is logical, check next is nullish or not
  if (
    currentOps === SyntaxKinds.NullishOperator &&
    (nextOps === SyntaxKinds.LogicalANDOperator || nextOps === SyntaxKinds.LogicalOROperator)
  ) {
    // recoverable error
    this.raiseError(ErrorMessageMap.v8_error_nullish_require_parans, left.end);
  }
  if (
    nextOps === SyntaxKinds.NullishOperator &&
    (currentOps === SyntaxKinds.LogicalANDOperator || currentOps === SyntaxKinds.LogicalOROperator)
  ) {
    // recoverable error
    this.raiseError(ErrorMessageMap.v8_error_nullish_require_parans, left.end);
  }
}
export function parseUnaryOrPrivateName(this: Parser): Expression {
  if (this.match(SyntaxKinds.PrivateName)) {
    const privateName = this.parsePrivateName();
    this.usePrivateName(privateName.name, privateName.start);
    return privateName;
  }
  if (
    (this.match(SyntaxKinds.LtOperator) || this.match(SyntaxKinds.BitwiseLeftShiftOperator)) &&
    !this.requirePlugin(ParserPlugin.JSX)
  ) {
    const start = this.getStartPosition();
    const typeArguments = this.parseTSTypeParameterInstantiation(false);
    const expression = this.parseUnaryExpression();
    return Factory.createTSTypeAssertionExpression(
      expression,
      typeArguments.params[0],
      start,
      this.getLastTokenEndPositon(),
    );
  }
  return this.parseUnaryExpression();
}
export function parseUnaryExpression(this: Parser): Expression {
  if (this.match(UnaryOperators)) {
    const operator = this.getToken() as UnaryOperatorKinds;
    const isDelete = operator === SyntaxKinds.DeleteKeyword;
    const start = this.getStartPosition();
    this.nextToken();
    let argument;
    if (isDelete) {
      this.enterDelete();
      argument = this.parseUnaryExpression();
      this.exitDelete();
    } else {
      argument = this.parseUnaryExpression();
    }
    const unaryExpr = Factory.createUnaryExpression(
      argument,
      operator,
      start,
      cloneSourcePosition(argument.end),
    );
    this.staticSematicEarlyErrorForUnaryExpression(unaryExpr);
    return unaryExpr;
  }
  if (this.match(SyntaxKinds.AwaitKeyword) && this.isCurrentScopeParseAwaitAsExpression()) {
    return this.parseAwaitExpression();
  }
  return this.parseUpdateExpression();
}
// 13.5.1.1
export function staticSematicEarlyErrorForUnaryExpression(this: Parser, expr: UnaryExpression) {
  if (this.isInStrictMode() && expr.operator === SyntaxKinds.DeleteKeyword && isIdentifer(expr.argument)) {
    this.raiseError(
      ErrorMessageMap.syntax_error_applying_the_delete_operator_to_an_unqualified_name_is_deprecated,
      expr.start,
    );
  }
}
export function parseAwaitExpression(this: Parser) {
  if (this.isInParameter()) {
    this.raiseError(
      ErrorMessageMap.extra_error_await_expression_can_not_used_in_parameter_list,
      this.getStartPosition(),
    );
  }
  const start = this.getStartPosition();
  this.nextToken();
  this.recordScope(ExpressionScopeKind.AwaitExpressionImParameter, start);
  const argu = this.parseUnaryExpression();
  return Factory.createAwaitExpression(argu, start, cloneSourcePosition(argu.end));
}
export function parseUpdateExpression(this: Parser): Expression {
  if (this.match(UpdateOperators)) {
    const operator = this.getToken() as UpdateOperatorKinds;
    const start = this.getStartPosition();
    this.nextToken();
    const argument = this.parseWithLHSLayer(() => this.parseLeftHandSideExpression());
    this.checkExpressionAsLeftValue(argument);
    return Factory.createUpdateExpression(argument, operator, true, start, cloneSourcePosition(argument.end));
  }
  const [argument, scope] = this.parseWithCatpureLayer(() => this.parseLeftHandSideExpression());
  if (this.match(UpdateOperators) && !this.getLineTerminatorFlag()) {
    this.checkStrictModeScopeError(scope);
    this.checkExpressionAsLeftValue(argument);
    const operator = this.getToken() as UpdateOperatorKinds;
    const end = this.getEndPosition();
    this.nextToken();
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
export function parseLeftHandSideExpression(this: Parser): Expression {
  let base = this.parsePrimaryExpression();
  if (this.shouldEarlyReturn(base)) {
    return base;
  }
  const state: LefthansSideParseState = {
    shouldStop: false,
    hasOptional: false,
    optional: false,
    abortLastTime: false,
  };
  while (!state.shouldStop) {
    state.optional = false;
    if (
      this.requirePlugin(ParserPlugin.TypeScript) &&
      !this.getLineTerminatorFlag() &&
      this.match(SyntaxKinds.LogicalNOTOperator)
    ) {
      this.nextToken();
      base = Factory.createTSNonNullExpression(
        base,
        cloneSourcePosition(base.start),
        this.getLastTokenEndPositon(),
      );
      continue;
    }
    if (state.abortLastTime) {
      base = this.parseLeftHandSideExpressionWithoutTypeArguments(base, state);
    } else {
      base = this.parseLeftHandSideExpressionWithTypeArguments(base, state);
    }
  }
  if (state.abortLastTime && state.hasOptional) {
    throw this.createUnexpectError();
  }
  if (state.hasOptional) {
    return Factory.createChainExpression(
      base,
      cloneSourcePosition(base.start),
      cloneSourcePosition(base.end),
    );
  }
  return base;
}
export function parseLeftHandSideExpressionWithTypeArguments(
  this: Parser,
  base: Expression,
  state: LefthansSideParseState,
) {
  this.parseQuestionDotOfLeftHandSideExpression(state);
  const result = this.parseTypeArgumentsOfLeftHandSideExpression(state);
  const [typeArguments, abort] = result;
  if (this.match(SyntaxKinds.ParenthesesLeftPunctuator)) {
    // callexpression
    base = this.parseCallExpression(base, state.optional, typeArguments);
  } else if (this.match([SyntaxKinds.DotOperator, SyntaxKinds.BracketLeftPunctuator]) || state.optional) {
    // memberexpression
    if (typeArguments) {
      abort();
    } else {
      base = this.parseMemberExpression(base, state.optional);
    }
  } else if (this.match(SyntaxKinds.TemplateHead) || this.match(SyntaxKinds.TemplateNoSubstitution)) {
    // tag template expressuin
    if (state.hasOptional) {
      // recoverable error
      this.raiseError(
        ErrorMessageMap.syntax_error_tag_template_expression_can_not_use_option_chain,
        this.getStartPosition(),
      );
    }
    base = this.parseTagTemplateExpression(base);
  } else {
    if (typeArguments) {
      const currentToken = this.getToken();
      if (
        currentToken === SyntaxKinds.GtOperator ||
        currentToken === SyntaxKinds.BitwiseRightShiftOperator ||
        (currentToken !== SyntaxKinds.ParenthesesLeftPunctuator &&
          this.canStartExpression() &&
          !this.getLineTerminatorFlag())
      ) {
        abort();
      } else {
        // base == TSInstanitExpr
        base = Factory.createTSInstantiationExpression(
          base,
          typeArguments,
          cloneSourcePosition(base.start),
          this.getLastTokenEndPositon(),
        );
        if (
          this.match(SyntaxKinds.DotOperator) ||
          (this.match(SyntaxKinds.QustionDotOperator) &&
            this.lookahead().kind !== SyntaxKinds.ParenthesesLeftPunctuator)
        ) {
          // TODO: should error
        }
      }
    } else {
      state.shouldStop = true;
    }
  }
  return base;
}
export function parseLeftHandSideExpressionWithoutTypeArguments(
  this: Parser,
  base: Expression,
  state: LefthansSideParseState,
) {
  this.parseQuestionDotOfLeftHandSideExpression(state);
  if (this.match(SyntaxKinds.ParenthesesLeftPunctuator)) {
    // callexpression
    state.abortLastTime = false;
    base = this.parseCallExpression(base, state.optional, undefined);
  } else if (this.match([SyntaxKinds.DotOperator, SyntaxKinds.BracketLeftPunctuator]) || state.optional) {
    // memberexpression
    state.abortLastTime = false;
    base = this.parseMemberExpression(base, state.optional);
  } else if (this.match(SyntaxKinds.TemplateHead) || this.match(SyntaxKinds.TemplateNoSubstitution)) {
    // tag template expressuin
    if (state.hasOptional) {
      // recoverable error
      this.raiseError(
        ErrorMessageMap.syntax_error_tag_template_expression_can_not_use_option_chain,
        this.getStartPosition(),
      );
    }
    state.abortLastTime = false;
    base = this.parseTagTemplateExpression(base);
  } else {
    state.shouldStop = true;
  }
  return base;
}
export function parseQuestionDotOfLeftHandSideExpression(this: Parser, state: LefthansSideParseState) {
  if (this.match(SyntaxKinds.QustionDotOperator)) {
    state.optional = true;
    state.hasOptional = true;
    this.nextToken();
  }
}
export function parseTypeArgumentsOfLeftHandSideExpression(
  this: Parser,
  state: LefthansSideParseState,
): [TSTypeParameterInstantiation | undefined, () => void] {
  let typeArguments: TSTypeParameterInstantiation | undefined = undefined;
  let abort = () => {};
  if (this.match(SyntaxKinds.LtOperator) || this.match(SyntaxKinds.BitwiseLeftShiftOperator)) {
    const result = this.tryParse(() => {
      return this.tryParseTSTypeParameterInstantiation(false);
    });
    if (result) {
      typeArguments = result?.[0];
      abort = () => {
        this.lexer.restoreState(result[1], result[2]);
        this.errorHandler.restoreTryFail(result[3]);
        state.abortLastTime = true;
      };
      return [typeArguments, abort];
    }
    //return undefined;
  }
  return [typeArguments, abort];
}
/**
 * Check is a assignable left value
 * @param expression
 * @returns
 */
export function checkExpressionAsLeftValue(this: Parser, expression: ModuleItem) {
  if (this.isAssignable(expression)) {
    return;
  }
  this.raiseError(ErrorMessageMap.invalid_left_value, expression.start);
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
export function parseCallExpression(
  this: Parser,
  callee: Expression,
  optional: boolean,
  typeParameter: TSTypeParameterInstantiation | undefined,
): Expression {
  this.expectButNotEat([SyntaxKinds.ParenthesesLeftPunctuator]);
  const { nodes, end } = this.parseArguments();
  return Factory.createCallExpression(
    callee,
    nodes,
    typeParameter,
    optional,
    cloneSourcePosition(callee.start),
    end,
  );
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
 */
export function parseArguments(this: Parser) {
  return this.parseArgumentsBase(false);
}
export function parseArgumentsWithType(this: Parser) {
  return this.parseArgumentsBase(true);
}
export function parseArgumentsBase(
  this: Parser,
  acceptType: boolean,
): ASTArrayWithMetaData<Expression> & {
  trailingComma: boolean;
  typeAnnotations: Array<[TSTypeAnnotation | undefined, boolean]> | undefined;
} {
  const { start } = this.expect(SyntaxKinds.ParenthesesLeftPunctuator);
  let isStart = true;
  // TODO: refactor logic to remove shoulStop
  const callerArguments: Array<Expression> = [];
  const typeAnnotations: Array<[TSTypeAnnotation | undefined, boolean]> = [];
  let trailingComma = false;
  while (!this.match(SyntaxKinds.ParenthesesRightPunctuator) && !this.match(SyntaxKinds.EOFToken)) {
    if (isStart) {
      isStart = false;
      if (this.match(SyntaxKinds.CommaToken)) {
        // trailing comma
        this.raiseError(ErrorMessageMap.extra_error_unexpect_trailing_comma, this.getStartPosition());
        this.nextToken();
      }
    } else {
      trailingComma = true;
      this.expect(SyntaxKinds.CommaToken);
    }
    // case 1: ',' following by ')'
    if (this.match(SyntaxKinds.ParenthesesRightPunctuator)) {
      break;
    }
    trailingComma = false;
    // case 2: ',' following by SpreadElement, maybe follwed by ','
    if (this.match(SyntaxKinds.SpreadOperator)) {
      const spreadElementStart = this.getStartPosition();
      this.nextToken();
      let argu: Expression = Factory.createSpreadElement(
        this.parseAssignmentExpressionAllowIn(),
        spreadElementStart,
        this.getLastTokenEndPositon(),
      );
      if (acceptType) {
        typeAnnotations.push(this.parsePossibleArugmentType());
        argu = this.parsePossibleArugmentDefaultValue(argu);
      }
      callerArguments.push(argu);
      continue;
    }
    // case 3 : ',' AssigmentExpression
    let argu = this.parseAssignmentExpressionAllowIn();
    if (acceptType) {
      typeAnnotations.push(this.parsePossibleArugmentType());
      argu = this.parsePossibleArugmentDefaultValue(argu);
    }
    callerArguments.push(argu);
  }
  const { end } = this.expect(SyntaxKinds.ParenthesesRightPunctuator);
  return {
    end,
    start,
    nodes: callerArguments,
    typeAnnotations: typeAnnotations.length === 0 ? undefined : typeAnnotations,
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
export function parseMemberExpression(this: Parser, base: Expression, optional: boolean): Expression {
  if (!this.match(SyntaxKinds.DotOperator) && !this.match(SyntaxKinds.BracketLeftPunctuator) && !optional) {
    throw this.createUnreachError([SyntaxKinds.DotOperator, SyntaxKinds.BracketLeftPunctuator]);
  }
  // if start with dot, must be a access property, can not with optional.
  // because optional means that last token is `?.`
  if (this.match(SyntaxKinds.DotOperator) && !optional) {
    this.expect(SyntaxKinds.DotOperator);
    const property = this.parseMemberExpressionProperty();

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
  else if (this.match(SyntaxKinds.BracketLeftPunctuator)) {
    this.expect(SyntaxKinds.BracketLeftPunctuator);
    const property = this.parseExpressionAllowIn();
    const { end } = this.expect(SyntaxKinds.BracketRightPunctuator);
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
    const property = this.parseMemberExpressionProperty();
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
export function parseMemberExpressionProperty(this: Parser) {
  let property: Expression | PrivateName;
  if (this.match(SyntaxKinds.PrivateName)) {
    property = this.parsePrivateName();
    this.usePrivateName(property.name, property.start);
    if (this.isInDelete()) {
      this.raiseError(
        ErrorMessageMap.syntax_error_applying_the_delete_operator_to_an_unqualified_name_is_deprecated,
        property.start,
      );
    }
  } else {
    property = this.parseIdentifierName();
  }
  return property;
}
export function parseTagTemplateExpression(this: Parser, base: Expression) {
  const quasi = this.parseTemplateLiteral(true);
  return Factory.createTagTemplateExpression(
    base,
    quasi,
    cloneSourcePosition(base.end),
    cloneSourcePosition(quasi.end),
  );
}
export function parsePrimaryExpression(this: Parser): Expression {
  switch (this.getToken()) {
    case SyntaxKinds.LtOperator:
      return this.parseJSXElementOrJSXFragment(false);
    case SyntaxKinds.DivideOperator:
    case SyntaxKinds.DivideAssignOperator:
      return this.parseRegexLiteral();
    case SyntaxKinds.NullKeyword:
      return this.parseNullLiteral();
    case SyntaxKinds.UndefinedKeyword:
      return this.parseUndefinedLiteral();
    case SyntaxKinds.TrueKeyword:
    case SyntaxKinds.FalseKeyword:
      return this.parseBoolLiteral();
    case SyntaxKinds.DecimalLiteral:
      return this.parseDecimalLiteral();
    case SyntaxKinds.DecimalBigIntegerLiteral:
      return this.parseDecimalBigIntegerLiteral();
    case SyntaxKinds.NonOctalDecimalLiteral:
      return this.parseNonOctalDecimalLiteral();
    case SyntaxKinds.BinaryIntegerLiteral:
      return this.parseBinaryIntegerLiteral();
    case SyntaxKinds.BinaryBigIntegerLiteral:
      return this.parseBinaryBigIntegerLiteral();
    case SyntaxKinds.OctalIntegerLiteral:
      return this.parseOctalIntegerLiteral();
    case SyntaxKinds.OctalBigIntegerLiteral:
      return this.parseOctalBigIntegerLiteral();
    case SyntaxKinds.HexIntegerLiteral:
      return this.parseHexIntegerLiteral();
    case SyntaxKinds.HexBigIntegerLiteral:
      return this.parseHexBigIntegerLiteral();
    case SyntaxKinds.LegacyOctalIntegerLiteral:
      return this.parseLegacyOctalIntegerLiteral();
    case SyntaxKinds.StringLiteral:
      return this.parseStringLiteral();
    case SyntaxKinds.TemplateHead:
    case SyntaxKinds.TemplateNoSubstitution:
      return this.parseTemplateLiteral(false);
    case SyntaxKinds.ImportKeyword: {
      const { kind } = this.lookahead();
      if (kind === SyntaxKinds.DotOperator) return this.parseImportMeta();
      if (kind === SyntaxKinds.ParenthesesLeftPunctuator) {
        return this.parseImportCall();
      }
      throw this.createUnexpectError();
    }
    case SyntaxKinds.NewKeyword: {
      const { kind } = this.lookahead();
      if (kind === SyntaxKinds.DotOperator) {
        return this.parseNewTarget();
      }
      return this.parseNewExpression();
    }
    case SyntaxKinds.SuperKeyword:
      return this.parseSuper();
    case SyntaxKinds.ThisKeyword:
      return this.parseThisExpression();
    case SyntaxKinds.BracesLeftPunctuator:
      return this.parseObjectExpression();
    case SyntaxKinds.BracketLeftPunctuator:
      return this.parseArrayExpression();
    case SyntaxKinds.FunctionKeyword:
      return this.parseFunctionExpression(false);
    case SyntaxKinds.AtPunctuator: {
      return this.parseClassExpression(this.parseDecoratorList());
    }
    case SyntaxKinds.ClassKeyword:
      return this.parseClassExpression(null);
    case SyntaxKinds.ParenthesesLeftPunctuator:
      return this.parseCoverExpressionORArrowFunction();
    // TODO: consider wrap as function or default case ?
    case SyntaxKinds.PrivateName:
      // recoverable error
      this.raiseError(ErrorMessageMap.babel_error_private_name_wrong_used, this.getStartPosition());
      return this.parsePrivateName();
    // return parsePrivateName();
    case SyntaxKinds.Identifier:
    case SyntaxKinds.LetKeyword:
    case SyntaxKinds.AwaitKeyword:
    case SyntaxKinds.YieldKeyword: {
      const { kind, lineTerminatorFlag: flag } = this.lookahead();
      // case 0: identifier `=>` ...
      if (kind === SyntaxKinds.ArrowOperator && this.canParseAsArrowFunction()) {
        const [[argus, strictModeScope], arrowExprScope] = this.parseWithArrowExpressionScope(() =>
          this.parseWithLHSLayerReturnScope(() => [this.parseIdentifierReference()]),
        );
        if (this.getLineTerminatorFlag()) {
          this.raiseError(
            ErrorMessageMap.extra_error_no_line_break_is_allowed_before_arrow,
            this.getStartPosition(),
          );
        }
        this.enterArrowFunctionBodyScope();
        const arrowExpr = this.parseArrowFunctionExpression(
          {
            nodes: argus,
            start: argus[0].start,
            end: argus[0].end,
            trailingComma: false,
            typeAnnotations: undefined,
          },
          undefined,
          strictModeScope,
          arrowExprScope,
        );
        this.exitArrowFunctionBodyScope();
        return arrowExpr;
      }
      if (this.getSourceValue() === "async") {
        // case 1: `async` `function` ==> must be async function <id> () {}
        if (kind === SyntaxKinds.FunctionKeyword && !this.getEscFlag()) {
          const { value, start, end } = this.expect(SyntaxKinds.Identifier);
          if (this.getLineTerminatorFlag()) {
            return Factory.createIdentifier(value, start, end, undefined, undefined);
          }
          return this.parseFunctionExpression(true);
        }
        if (this.canParseAsArrowFunction()) {
          // case 2 `async` `(`
          // There might be two case :
          // 1.frist case is there are line change after async, which make this case into
          //   call expression
          // 2.second case is not change line after async, making it become async arrow
          //   function.
          // --------------------------
          if (kind === SyntaxKinds.ParenthesesLeftPunctuator) {
            const containEsc = this.getEscFlag();
            const id = this.parseIdentifierReference(); // async
            // TODO: better accept type param or argument to create async arrow or async call.
            const [[meta, strictModeScope], arrowExprScope] = this.parseWithArrowExpressionScope(() =>
              this.parseWithCatpureLayer(() => this.parseArgumentsWithType()),
            );
            if (
              flag ||
              (!this.match(SyntaxKinds.ArrowOperator) &&
                !(this.match(SyntaxKinds.ColonPunctuator) && this.requirePlugin(ParserPlugin.TypeScript)))
            ) {
              return Factory.createCallExpression(
                id,
                meta.nodes,
                undefined,
                false,
                cloneSourcePosition(id.start),
                meta.end,
              );
            }
            if (containEsc) {
              this.raiseError(ErrorMessageMap.invalid_esc_char_in_keyword, id.start);
            }
            const returnType = this.tryParseTSReturnTypeOrTypePredicate(SyntaxKinds.ColonPunctuator);
            this.enterArrowFunctionBodyScope(true);
            const arrowFunExpr = this.parseArrowFunctionExpression(
              meta,
              undefined,
              strictModeScope,
              arrowExprScope,
            );
            this.exitArrowFunctionBodyScope();
            arrowFunExpr.returnType = returnType;
            return arrowFunExpr;
          }
          // case 2-TS: `async` `<` or async `<<`
          // for `<`, is possible to be a
          // - typeParameter: for a async function declaration
          // - typeArguments: for a function call which callee is `async`
          // - binary expression: `async < literal-item`.
          if (kind === SyntaxKinds.LtOperator) {
            const id = this.parseIdentifierReference();
            const typeParameterResult = this.tryParse(() => this.parseTSTypeParameterDeclaration(false));
            if (typeParameterResult) {
              // there
              const [
                [{ start, end, nodes, trailingComma, typeAnnotations }, strictModeScope],
                arrowExprScope,
              ] = this.parseWithArrowExpressionScope(() =>
                this.parseWithCatpureLayer(() => this.parseArgumentsWithType()),
              );
              const returnType = this.tryParseTSReturnTypeOrTypePredicateForArrowExpression(true, nodes);
              if (this.match(SyntaxKinds.ArrowOperator)) {
                this.enterArrowFunctionBodyScope(true);
                const arrowExpr = this.parseArrowFunctionExpression(
                  { start, end, nodes, trailingComma, typeAnnotations },
                  undefined,
                  strictModeScope,
                  arrowExprScope,
                );
                this.exitArrowFunctionBodyScope();
                arrowExpr.returnType = returnType;
                arrowExpr.typeParameters = typeParameterResult[0];
                return arrowExpr;
              }
              this.abortTryParseResult(
                typeParameterResult[1],
                typeParameterResult[2],
                typeParameterResult[3],
              );
            }
            const typeArgumentResult = this.tryParse(() => this.parseTSTypeParameterInstantiation(false));
            if (typeArgumentResult) {
              const typeArguments = typeArgumentResult[0];
              const callArguments = this.parseArguments().nodes;
              return Factory.createCallExpression(
                id,
                callArguments,
                typeArguments,
                false,
                cloneSourcePosition(id.start),
                this.getLastTokenEndPositon(),
              );
            }
            return id;
          }
          // for '<<', it must be `async<<T....` which is type argument -> async as function call
          if (kind === SyntaxKinds.BitwiseLeftShiftOperator) {
            const id = this.parseIdentifierReference();
            this.lexer.reLexLtRelateToken();
            const typeArguments = this.parseTSTypeParameterInstantiation(false);
            const callArguments = this.parseArguments().nodes;
            return Factory.createCallExpression(
              id,
              callArguments,
              typeArguments,
              false,
              cloneSourcePosition(id.start),
              this.getLastTokenEndPositon(),
            );
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
              return this.parseIdentifierReference();
            }
            const isAsyncContainUnicode = this.getEscFlag();
            const { start, end } = this.expect(SyntaxKinds.Identifier); // eat async
            const { kind: maybeArrowToken } = this.lookahead();
            // there is no arrow operator.
            if (maybeArrowToken !== SyntaxKinds.ArrowOperator) {
              return Factory.createIdentifier("async", start, end, undefined, undefined);
            }
            if (isAsyncContainUnicode) {
              this.raiseError(ErrorMessageMap.invalid_esc_char_in_keyword, start);
            }
            const [[argus, strictModeScope], arrowExprScope] = this.parseWithArrowExpressionScope(() =>
              this.parseWithCatpureLayer(() => [this.parseIdentifierReference()]),
            );
            if (this.getLineTerminatorFlag()) {
              this.raiseError(
                ErrorMessageMap.extra_error_no_line_break_is_allowed_before_arrow,
                this.getStartPosition(),
              );
            }
            this.enterArrowFunctionBodyScope(true);
            const arrowExpr = this.parseArrowFunctionExpression(
              {
                nodes: argus,
                start: argus[0].start,
                end: argus[0].end,
                trailingComma: false,
                typeAnnotations: undefined,
              },
              undefined,
              strictModeScope,
              arrowExprScope,
            );
            this.exitArrowFunctionBodyScope();
            return arrowExpr;
          }
        }
      }
      return this.parseIdentifierReference();
    }
    default:
      throw this.createUnexpectError();
  }
}
