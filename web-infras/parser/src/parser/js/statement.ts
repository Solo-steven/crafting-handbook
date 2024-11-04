import {
  BlockStatement,
  BreakStatement,
  CatchClause,
  cloneSourcePosition,
  ContinueStatement,
  DebuggerStatement,
  DoWhileStatement,
  EmptyStatement,
  Expression,
  Factory,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  isArrayPattern,
  isAssignmentPattern,
  isFunctionDeclaration,
  isIdentifer,
  isObjectPattern,
  isVarDeclaration,
  LabeledStatement,
  ReturnStatement,
  SourcePosition,
  Statement,
  StatementListItem,
  SwitchCase,
  SyntaxKinds,
  TryStatement,
  TSParameter,
  VariableDeclaration,
  WhileStatement,
  WithStatement,
} from "web-infra-common";
import { ErrorMessageMap } from "@/src/parser/error";
import { SymbolType } from "@/src/parser/scope/symbolScope";
import { Parser } from "@/src/parser";
import { ASTArrayWithMetaData } from "@/src/parser/type";

export function parseStatementListItem(this: Parser): StatementListItem {
  const token = this.getToken();
  switch (token) {
    // 'aync' maybe is
    // 1. aync function  -> declaration
    // 2. aync arrow function -> statement(expressionStatement)
    // 3. identifer -> statement (expressionStatement)
    case SyntaxKinds.ConstKeyword:
    case SyntaxKinds.FunctionKeyword:
    case SyntaxKinds.ClassKeyword:
    case SyntaxKinds.AtPunctuator:
    case SyntaxKinds.EnumKeyword:
      return this.parseDeclaration();
    case SyntaxKinds.Identifier: {
      const declar = this.tryParseDeclarationWithIdentifierStart();
      if (!declar) {
        return this.parseStatement();
      }
      return declar;
    }
    case SyntaxKinds.LetKeyword:
      if (this.isLetPossibleIdentifier()) {
        return this.parseStatement();
      }
      return this.parseDeclaration();
    default:
      return this.parseStatement();
  }
}
export function isLetPossibleIdentifier(this: Parser) {
  const { kind: kind } = this.lookahead();
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
 * ref: https://tc39.es/ecma262/#prod-Statement
 */
export function parseStatement(this: Parser): Statement {
  const token = this.getToken();
  switch (token) {
    case SyntaxKinds.SwitchKeyword:
      return this.parseSwitchStatement();
    case SyntaxKinds.ContinueKeyword:
      return this.parseContinueStatement();
    case SyntaxKinds.BreakKeyword:
      return this.parseBreakStatement();
    case SyntaxKinds.ReturnKeyword:
      return this.parseReturnStatement();
    case SyntaxKinds.BracesLeftPunctuator:
      return this.parseBlockStatement();
    case SyntaxKinds.TryKeyword:
      return this.parseTryStatement();
    case SyntaxKinds.ThrowKeyword:
      return this.parseThrowStatement();
    case SyntaxKinds.WithKeyword:
      return this.parseWithStatement();
    case SyntaxKinds.DebuggerKeyword:
      return this.parseDebuggerStatement();
    case SyntaxKinds.SemiPunctuator:
      return this.parseEmptyStatement();
    case SyntaxKinds.IfKeyword:
      return this.parseIfStatement();
    case SyntaxKinds.ForKeyword:
      return this.parseForStatement();
    case SyntaxKinds.WhileKeyword:
      return this.parseWhileStatement();
    case SyntaxKinds.DoKeyword:
      return this.parseDoWhileStatement();
    case SyntaxKinds.VarKeyword:
      return this.parseVariableDeclaration();
    default:
      if (this.match(SyntaxKinds.Identifier) && this.lookahead().kind === SyntaxKinds.ColonPunctuator) {
        return this.parseLabeledStatement();
      }
      return this.parseExpressionStatement();
  }
}

/**
 * Parse For-related Statement, include ForStatement, ForInStatement, ForOfStatement.
 *
 * This function is pretty complex and hard to understand, some function's flag is only
 * used in this function. ex: allowIn flag of parseExpression, parseAssignmentExpression.
 * @returns {ForStatement | ForInStatement | ForOfStatement}
 */
export function parseForStatement(this: Parser): ForStatement | ForInStatement | ForOfStatement {
  // symbolScopeRecorder.enterPreBlockScope();
  this.symbolScopeRecorder.enterBlockSymbolScope();
  const { start: keywordStart } = this.expect(SyntaxKinds.ForKeyword);
  // First, parse await modifier and lefthandside or init of for-related statement,
  // init might start with let, const, var keyword, but if is let keyword need to
  // lookahead to determinate is identifier.
  // delcaration in there should not eat semi, becuase semi is seperator of ForStatement,
  // and might not need init for pattern, because maybe used by ForIn or ForOf.
  // If not start with let, var or const keyword, it should be expression, but this
  // expression can not take `in` operator as operator in toplevel, so we need pass
  // false to disallow parseExpression to take in  as operator
  let isAwait: SourcePosition | null = null,
    isParseLetAsExpr: SourcePosition | null = null,
    leftOrInit: VariableDeclaration | Expression | null = null,
    isEscap = false;
  if (this.match(SyntaxKinds.AwaitKeyword)) {
    isAwait = this.getStartPosition();
    this.nextToken();
    if (!this.config.allowAwaitOutsideFunction && !this.isCurrentScopeParseAwaitAsExpression()) {
      this.raiseError(ErrorMessageMap.babel_error_invalid_await, isAwait);
    }
  }
  this.expect(SyntaxKinds.ParenthesesLeftPunctuator);
  if (this.match([SyntaxKinds.LetKeyword, SyntaxKinds.ConstKeyword, SyntaxKinds.VarKeyword])) {
    if (this.match(SyntaxKinds.LetKeyword) && this.isLetPossibleIdentifier()) {
      isParseLetAsExpr = this.getStartPosition();
      leftOrInit = this.parseExpressionDisallowIn();
    } else {
      leftOrInit = this.disAllowInOperaotr(() => this.parseVariableDeclaration(true));
    }
  } else if (this.match(SyntaxKinds.SemiPunctuator)) {
    // for test case `for(;;)`
    leftOrInit = null;
  } else {
    isEscap = this.getEscFlag();
    leftOrInit = this.parseExpressionDisallowIn();
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
  if (this.match(SyntaxKinds.SemiPunctuator)) {
    if (isAwait) {
      // recoverable error
      this.raiseError(ErrorMessageMap.extra_error_for_await_not_of_loop, isAwait);
    }
    if (leftOrInit && isVarDeclaration(leftOrInit)) {
      for (const delcar of leftOrInit.declarations) {
        if ((isArrayPattern(delcar.id) || isObjectPattern(delcar.id)) && !delcar.init) {
          // recoverable error
          this.raiseError(
            ErrorMessageMap.babel_error_destructing_pattern_must_need_initializer,
            delcar.start,
          );
        }
      }
    }
    this.nextToken();
    let test: Expression | null = null,
      update: Expression | null = null;
    if (!this.match(SyntaxKinds.SemiPunctuator)) {
      test = this.parseExpressionAllowIn();
    }
    this.expect(SyntaxKinds.SemiPunctuator);
    if (!this.match(SyntaxKinds.ParenthesesRightPunctuator)) {
      update = this.parseExpressionAllowIn();
    }
    this.expect(SyntaxKinds.ParenthesesRightPunctuator);
    const body = this.parseForStatementBody();
    const forStatement = Factory.createForStatement(
      body,
      leftOrInit,
      test,
      update,
      keywordStart,
      cloneSourcePosition(body.end),
    );
    this.staticSematicEarlyErrorForFORStatement(forStatement);
    return forStatement;
  }
  // unreach case, even if syntax error, when leftOrInit, it must match semi token.
  // and because it match semi token, if would enter forStatement case, will not
  // reach there. even syntax error, error would be throw at parseExpression or
  // parseDeclaration.
  if (!leftOrInit) {
    throw this.createUnreachError();
  }
  // for case `for(a = 0 of [])`; leftOrInit would parse all token before `of` as one expression
  // in this case , leftOrInit would be a assignment expression, and when it pass to toAssignment
  // function, it would transform to assignment pattern, so we need to checko if there is Assignment
  // pattern, it is , means original is assignment expression, it should throw a error.
  if (!isVarDeclaration(leftOrInit)) {
    leftOrInit = this.exprToPattern(leftOrInit, false) as Expression;
    if (isAssignmentPattern(leftOrInit)) {
      throw this.createMessageError(ErrorMessageMap.invalid_left_value);
    }
  }
  // branch case for `for-in` statement
  if (this.match(SyntaxKinds.InKeyword)) {
    if (isAwait) {
      // recoverable error
      this.raiseError(ErrorMessageMap.extra_error_for_await_not_of_loop, isAwait);
    }
    if (isVarDeclaration(leftOrInit)) {
      this.helperCheckDeclarationmaybeForInOrForOfStatement(leftOrInit, "ForIn");
    }
    this.nextToken();
    const right = this.parseExpressionAllowIn();
    this.expect(SyntaxKinds.ParenthesesRightPunctuator);
    const body = this.parseForStatementBody();
    const forInStatement = Factory.createForInStatement(
      leftOrInit,
      right,
      body,
      keywordStart,
      cloneSourcePosition(body.end),
    );
    this.staticSematicEarlyErrorForFORStatement(forInStatement);
    return forInStatement;
  }
  // branch case for `for-of` statement
  if (this.isContextKeyword("of")) {
    if (isVarDeclaration(leftOrInit)) {
      this.helperCheckDeclarationmaybeForInOrForOfStatement(leftOrInit, "ForOf");
    }
    if (isParseLetAsExpr) {
      this.raiseError(ErrorMessageMap.extra_error_for_of_can_not_use_let_as_identifier, isParseLetAsExpr);
    }
    if (
      !isAwait &&
      !isEscap &&
      isIdentifer(leftOrInit) &&
      leftOrInit.name === "async" &&
      !leftOrInit.parentheses
    ) {
      this.raiseError(ErrorMessageMap.v8_error_async_of_forbidden, leftOrInit.start);
    }
    this.nextToken();
    const right = this.parseAssignmentExpressionAllowIn();
    this.expect(SyntaxKinds.ParenthesesRightPunctuator);
    const body = this.parseForStatementBody();
    const forOfStatement = Factory.createForOfStatement(
      !!isAwait,
      leftOrInit,
      right,
      body,
      keywordStart,
      cloneSourcePosition(body.end),
    );
    this.staticSematicEarlyErrorForFORStatement(forOfStatement);
    return forOfStatement;
  }
  throw this.createUnexpectError();
}
export function parseForStatementBody(this: Parser): Statement {
  const stmt = this.parseAsLoop(() => this.parseStatement());
  this.symbolScopeRecorder.exitSymbolScope();
  return stmt;
}
export function staticSematicEarlyErrorForFORStatement(
  this: Parser,
  statement: ForStatement | ForInStatement | ForOfStatement,
) {
  if (checkIsLabelledFunction(statement.body)) {
    this.raiseError(
      this.isInStrictMode()
        ? ErrorMessageMap.syntax_error_functions_declare_strict_mode
        : ErrorMessageMap.syntax_error_functions_declare_non_strict_mode,
      statement.body.start,
    );
  }
}
/**
 * Helper function for check sematic error of VariableDeclaration of ForInStatement and ForOfStatement,
 * please reference to comment in parseForStatement.
 * @param {VariableDeclaration} declaration
 */
export function helperCheckDeclarationmaybeForInOrForOfStatement(
  this: Parser,
  declaration: VariableDeclaration,
  kind: "ForIn" | "ForOf",
) {
  if (declaration.declarations.length > 1) {
    // recoverable error
    this.raiseError(
      ErrorMessageMap.v8_error_Invalid_left_hand_side_in_for_in_loop_must_have_a_single_binding,
      declaration.start,
    );
  }
  const delcarationVariant = declaration.variant;
  const onlyDeclaration = declaration.declarations[0];
  if (kind === "ForIn") {
    if (onlyDeclaration.init !== null) {
      if (delcarationVariant === "var" && !this.isInStrictMode() && isIdentifer(onlyDeclaration.id)) {
        return;
      }
      // recoverable error
      this.raiseError(
        ErrorMessageMap.syntax_error_for_in_loop_head_declarations_may_not_have_initializer,
        onlyDeclaration.start,
      );
    }
  } else {
    if (onlyDeclaration.init !== null) {
      // recoverable error
      this.raiseError(
        ErrorMessageMap.syntax_error_for_of_loop_variable_declaration_may_not_have_an_initializer,
        onlyDeclaration.init.start,
      );
    }
  }
}
export function parseIfStatement(this: Parser): IfStatement {
  const { start: keywordStart } = this.expect(SyntaxKinds.IfKeyword);
  this.expect(SyntaxKinds.ParenthesesLeftPunctuator);
  const test = this.parseExpressionAllowIn();
  const { end: headerEnd } = this.expect(SyntaxKinds.ParenthesesRightPunctuator);
  this.context.lastTokenIndexOfIfStmt = headerEnd.index;
  const consequnce = this.parseStatement();
  if (this.match(SyntaxKinds.ElseKeyword)) {
    this.nextToken();
    const alter = this.parseStatement();
    return Factory.createIfStatement(test, consequnce, alter, keywordStart, cloneSourcePosition(alter.end));
  }
  const ifStatement = Factory.createIfStatement(
    test,
    consequnce,
    null,
    keywordStart,
    cloneSourcePosition(consequnce.end),
  );
  this.staticSematicEarlyErrorForIfStatement(ifStatement);
  return ifStatement;
}
export function staticSematicEarlyErrorForIfStatement(this: Parser, statement: IfStatement) {
  if (checkIsLabelledFunction(statement.conseqence)) {
    this.raiseError(
      this.isInStrictMode()
        ? ErrorMessageMap.syntax_error_functions_declare_strict_mode
        : ErrorMessageMap.syntax_error_functions_declare_non_strict_mode,
      statement.conseqence.start,
    );
  }
  if (statement.alternative && checkIsLabelledFunction(statement.alternative)) {
    this.raiseError(
      this.isInStrictMode()
        ? ErrorMessageMap.syntax_error_functions_declare_strict_mode
        : ErrorMessageMap.syntax_error_functions_declare_non_strict_mode,
      statement.alternative.start,
    );
  }
}
export function parseWhileStatement(this: Parser): WhileStatement {
  const { start: keywordStart } = this.expect(SyntaxKinds.WhileKeyword);
  this.expect(SyntaxKinds.ParenthesesLeftPunctuator);
  const test = this.parseExpressionAllowIn();
  this.expect(SyntaxKinds.ParenthesesRightPunctuator);
  const body = this.parseAsLoop(() => this.parseStatement());
  const whileStatement = Factory.createWhileStatement(
    test,
    body,
    keywordStart,
    cloneSourcePosition(body.end),
  );
  this.staticSematicEarlyErrorForWhileStatement(whileStatement);
  return whileStatement;
}
export function checkIsLabelledFunction(statement: Statement) {
  while (statement.kind === SyntaxKinds.LabeledStatement) {
    if (statement.body.kind === SyntaxKinds.FunctionDeclaration) {
      return true;
    }
    statement = statement.body;
  }
}
export function staticSematicEarlyErrorForWhileStatement(this: Parser, statement: WhileStatement) {
  if (checkIsLabelledFunction(statement.body)) {
    // recoverable error
    this.raiseError(
      this.isInStrictMode()
        ? ErrorMessageMap.syntax_error_functions_declare_strict_mode
        : ErrorMessageMap.syntax_error_functions_declare_non_strict_mode,
      statement.body.start,
    );
  }
}
export function parseDoWhileStatement(this: Parser): DoWhileStatement {
  const { start: keywordStart } = this.expect(SyntaxKinds.DoKeyword);
  const body = this.parseAsLoop(() => this.parseStatement());
  this.expect(SyntaxKinds.WhileKeyword);
  this.expect(SyntaxKinds.ParenthesesLeftPunctuator);
  const test = this.parseExpressionAllowIn();
  const { end: punctEnd } = this.expect(SyntaxKinds.ParenthesesRightPunctuator);
  this.isSoftInsertSemi();
  const doWhileStatement = Factory.createDoWhileStatement(test, body, keywordStart, punctEnd);
  this.staticSematicEarlyErrorForDoWhileStatement(doWhileStatement);
  return doWhileStatement;
}
export function staticSematicEarlyErrorForDoWhileStatement(this: Parser, statement: DoWhileStatement) {
  if (checkIsLabelledFunction(statement.body)) {
    // recoverable error
    this.raiseError(
      this.isInStrictMode()
        ? ErrorMessageMap.syntax_error_functions_declare_strict_mode
        : ErrorMessageMap.syntax_error_functions_declare_non_strict_mode,
      statement.body.start,
    );
  }
}
export function parseBlockStatement(this: Parser) {
  const { start: puncStart } = this.expect(SyntaxKinds.BracesLeftPunctuator);
  this.enterBlockScope();
  const body: Array<StatementListItem> = [];
  while (!this.match(SyntaxKinds.BracesRightPunctuator) && !this.match(SyntaxKinds.EOFToken)) {
    body.push(this.parseStatementListItem());
  }
  this.exitBlockScope();
  const { end: puncEnd } = this.expect(SyntaxKinds.BracesRightPunctuator);
  return Factory.createBlockStatement(body, puncStart, puncEnd);
}
export function parseSwitchStatement(this: Parser) {
  const { start: keywordStart } = this.expect(SyntaxKinds.SwitchKeyword);
  this.expect(SyntaxKinds.ParenthesesLeftPunctuator);
  const discriminant = this.parseExpressionAllowIn();
  this.expect(SyntaxKinds.ParenthesesRightPunctuator);
  const { nodes, end } = this.parseAsSwitch(() => this.parseSwitchCases());
  return Factory.createSwitchStatement(discriminant, nodes, keywordStart, end);
}
export function parseSwitchCases(this: Parser): ASTArrayWithMetaData<SwitchCase> {
  this.enterBlockScope();
  const { start } = this.expect(SyntaxKinds.BracesLeftPunctuator);
  const cases: Array<SwitchCase> = [];
  let haveDefault = false;
  while (!this.match(SyntaxKinds.BracesRightPunctuator) && !this.match(SyntaxKinds.EOFToken)) {
    let test: Expression | null = null;
    const start = this.getStartPosition();
    if (this.match(SyntaxKinds.CaseKeyword)) {
      this.nextToken();
      test = this.parseExpressionAllowIn();
    } else if (this.match(SyntaxKinds.DefaultKeyword)) {
      const start = this.getStartPosition();
      this.nextToken();
      if (haveDefault) {
        // recoverable error
        this.raiseError(ErrorMessageMap.v8_error_more_than_one_default_clause_in_switch_statement, start);
      } else {
        haveDefault = true;
      }
    }
    this.expect(SyntaxKinds.ColonPunctuator);
    const consequence: Array<StatementListItem> = [];
    while (
      !this.match([
        SyntaxKinds.BracesRightPunctuator,
        SyntaxKinds.EOFToken,
        SyntaxKinds.CaseKeyword,
        SyntaxKinds.DefaultKeyword,
      ])
    ) {
      consequence.push(this.parseStatementListItem());
    }
    const end = this.getStartPosition();
    cases.push(Factory.createSwitchCase(test, consequence, start, end));
  }
  const { end } = this.expect(SyntaxKinds.BracesRightPunctuator);
  this.exitBlockScope();
  return {
    nodes: cases,
    start,
    end,
  };
}
export function parseContinueStatement(this: Parser): ContinueStatement {
  const { start: keywordStart, end: keywordEnd } = this.expect(SyntaxKinds.ContinueKeyword);
  this.staticSematicEarlyErrorForContinueStatement(keywordStart);
  if (this.match(SyntaxKinds.Identifier) && !this.getLineTerminatorFlag()) {
    const id = this.parseIdentifierReference();
    this.shouldInsertSemi();
    this.staticSematicEarlyErrorForLabelInContinueStatement(id);
    return Factory.createContinueStatement(id, keywordStart, cloneSourcePosition(id.end));
  }
  this.shouldInsertSemi();
  return Factory.createContinueStatement(null, keywordStart, keywordEnd);
}
export function staticSematicEarlyErrorForContinueStatement(this: Parser, start: SourcePosition) {
  if (!this.isContinueValidate()) {
    // recoverable error
    this.raiseError(ErrorMessageMap.syntax_error_continue_must_be_inside_loop, start);
  }
}
export function staticSematicEarlyErrorForLabelInContinueStatement(this: Parser, label: Identifier) {
  if (!this.canLabelReach(label.name)) {
    // recoverable error
    this.raiseError(ErrorMessageMap.syntax_error_label_not_found, label.start);
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
export function parseBreakStatement(this: Parser): BreakStatement {
  const { start, end } = this.expect(SyntaxKinds.BreakKeyword);
  if (this.match(SyntaxKinds.Identifier) && !this.getLineTerminatorFlag()) {
    const label = this.parseIdentifierReference();
    this.shouldInsertSemi();
    this.staticSematicEarlyErrorForLabelInBreakStatement(label);
    return Factory.createBreakStatement(label, start, end);
  }
  this.shouldInsertSemi();
  const breakStmt = Factory.createBreakStatement(null, start, end);
  this.staticSematicEarlyErrorForBreakStatement(breakStmt);
  return breakStmt;
}
/**
 * Spec def early error checking for break statement.
 * @param {BreakStatement} breakStmt
 * reference: https://tc39.es/ecma262/#sec-break-statement-static-semantics-early-errors
 */
export function staticSematicEarlyErrorForBreakStatement(this: Parser, breakStmt: BreakStatement) {
  if (!this.isBreakValidate()) {
    // recoverable error
    this.raiseError(
      ErrorMessageMap.syntax_error_unlabeled_break_must_be_inside_loop_or_switch,
      breakStmt.start,
    );
  }
}
/**
 * Spec def early error checking for break statement with break label
 * @param {Identifier} label
 * reference: https://tc39.es/ecma262/#sec-break-statement-static-semantics-early-errors
 */
export function staticSematicEarlyErrorForLabelInBreakStatement(this: Parser, label: Identifier) {
  if (!this.canLabelReach(label.name)) {
    // recoverable error
    this.raiseError(ErrorMessageMap.syntax_error_label_not_found, label.start);
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
export function parseLabeledStatement(this: Parser): LabeledStatement {
  // TODO: using dev mode unreach checking
  // if (!this.match(SyntaxKinds.Identifier) || this.lookahead().kind !== SyntaxKinds.ColonPunctuator) {
  // }
  const label = this.parseIdentifierReference();
  if (this.lexicalScopeRecorder.enterVirtualBlockScope("Label", label.name)) {
    // recoverable error
    this.raiseError(ErrorMessageMap.v8_error_label_has_already_been_declared, label.start);
  }
  this.expect(SyntaxKinds.ColonPunctuator);
  const labeled = this.match(SyntaxKinds.FunctionKeyword)
    ? this.parseFunctionDeclaration(false, false)
    : this.parseStatement();
  this.lexicalScopeRecorder.exitVirtualBlockScope();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this.staticSematicEarlyErrorForLabelStatement(labeled as any);
  return Factory.createLabeledStatement(
    label,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labeled as any,
    cloneSourcePosition(label.start),
    cloneSourcePosition(labeled.end),
  );
}
/**
 * Spec def early error. using alter production rule.
 * @param labeled
 * reference: https://tc39.es/ecma262/#sec-labelled-statements-static-semantics-early-errors
 */
export function staticSematicEarlyErrorForLabelStatement(
  this: Parser,
  labeled: Statement | FunctionDeclaration,
) {
  if (isFunctionDeclaration(labeled)) {
    if (labeled.generator) {
      this.raiseError(ErrorMessageMap.syntax_error_generator_function_declare, labeled.start);
    }
    if (this.isInStrictMode()) {
      this.raiseError(ErrorMessageMap.syntax_error_functions_declare_strict_mode, labeled.start);
    }
  }
}
export function parseReturnStatement(this: Parser): ReturnStatement {
  const { start, end } = this.expect(SyntaxKinds.ReturnKeyword);
  if (!this.isReturnValidate()) {
    this.raiseError(ErrorMessageMap.syntax_error_return_not_in_function, start);
  }
  if (this.isSoftInsertSemi(true)) {
    return Factory.createReturnStatement(null, start, end);
  }
  const expr = this.parseExpressionAllowIn();
  this.shouldInsertSemi();
  return Factory.createReturnStatement(expr, start, cloneSourcePosition(expr.end));
}
export function parseTryStatement(this: Parser): TryStatement {
  const { start: tryKeywordStart } = this.expect(SyntaxKinds.TryKeyword);
  const body = this.parseBlockStatement();
  let handler: CatchClause | null = null,
    finalizer: BlockStatement | null = null;
  if (this.match(SyntaxKinds.CatchKeyword)) {
    const catchKeywordStart = this.getStartPosition();
    this.nextToken();
    //symbolScopeRecorder.enterFunctionSymbolScope();
    this.enterCatchBlockScope();
    if (this.match(SyntaxKinds.ParenthesesLeftPunctuator)) {
      this.nextToken();
      this.symbolScopeRecorder.enterCatchParam();
      // catch clause should not have init
      const param = this.parseBindingElement(false);
      this.parseFunctionParamType(param as TSParameter, false);
      if (!this.symbolScopeRecorder.setCatchParamTo(isIdentifer(param) ? SymbolType.Var : SymbolType.Let)) {
        throw this.createMessageError(ErrorMessageMap.v8_error_duplicate_identifier);
      }
      // should check param is duplicate or not.
      this.expect(SyntaxKinds.ParenthesesRightPunctuator);
      const body = this.parseCatchBlock();
      handler = Factory.createCatchClause(param, body, catchKeywordStart, cloneSourcePosition(body.end));
    } else {
      const body = this.parseCatchBlock();
      handler = Factory.createCatchClause(null, body, catchKeywordStart, cloneSourcePosition(body.end));
    }
    this.exitCatchBlockScope();
  }
  if (this.match(SyntaxKinds.FinallyKeyword)) {
    this.nextToken();
    finalizer = this.parseBlockStatement();
  }
  if (!handler && !finalizer) {
    this.raiseError(ErrorMessageMap.v8_error_missing_catch_or_finally_after_try, tryKeywordStart);
  }
  return Factory.createTryStatement(
    body,
    handler,
    finalizer,
    tryKeywordStart,
    cloneSourcePosition(finalizer ? finalizer.end : handler ? handler.end : body.end),
  );
}
export function parseCatchBlock(this: Parser) {
  const { start: puncStart } = this.expect(SyntaxKinds.BracesLeftPunctuator);
  const body: Array<StatementListItem> = [];
  while (!this.match(SyntaxKinds.BracesRightPunctuator) && !this.match(SyntaxKinds.EOFToken)) {
    body.push(this.parseStatementListItem());
  }
  const { end: puncEnd } = this.expect(SyntaxKinds.BracesRightPunctuator);
  return Factory.createBlockStatement(body, puncStart, puncEnd);
}
export function parseThrowStatement(this: Parser) {
  const { start } = this.expect(SyntaxKinds.ThrowKeyword);
  this.staticSmaticEarlyErrorForThrowStatement();
  const expr = this.parseExpressionAllowIn();
  this.shouldInsertSemi();
  return Factory.createThrowStatement(expr, start, cloneSourcePosition(expr.end));
}
export function staticSmaticEarlyErrorForThrowStatement(this: Parser) {
  if (this.getLineTerminatorFlag()) {
    this.raiseError(ErrorMessageMap.babel_error_illegal_newline_after_throw, this.getStartPosition());
  }
}
export function parseWithStatement(this: Parser): WithStatement {
  const { start } = this.expect(SyntaxKinds.WithKeyword);
  this.expect(SyntaxKinds.ParenthesesLeftPunctuator);
  const object = this.parseExpressionAllowIn();
  this.expect(SyntaxKinds.ParenthesesRightPunctuator);
  const body = this.parseStatement();
  const withStmt = Factory.createWithStatement(object, body, start, cloneSourcePosition(body.end));
  this.staticSmaticEarlyErrorForWithStatement(withStmt);
  return withStmt;
}
export function staticSmaticEarlyErrorForWithStatement(this: Parser, withStatement: WithStatement) {
  if (this.isInStrictMode()) {
    // recoverable error.
    this.raiseError(ErrorMessageMap.babel_error_with_statement_in_strict_mode, withStatement.start);
  }
}
export function parseDebuggerStatement(this: Parser): DebuggerStatement {
  const { start, end } = this.expect(SyntaxKinds.DebuggerKeyword);
  this.shouldInsertSemi();
  return Factory.createDebuggerStatement(start, end);
}
export function parseEmptyStatement(this: Parser): EmptyStatement {
  const { start, end } = this.expect([SyntaxKinds.SemiPunctuator]);
  return Factory.createEmptyStatement(start, end);
}
