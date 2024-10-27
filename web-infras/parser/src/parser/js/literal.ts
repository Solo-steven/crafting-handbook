import {
  RegexLiteral,
  SyntaxKinds,
  Factory,
  Identifier,
  SourcePosition,
  PrivateName,
  NumberLiteral,
  TemplateElement,
  MetaProperty,
  cloneSourcePosition,
  CallExpression,
  Expression,
  isCallExpression,
  ThisExpression,
  PropertyName,
  isIdentifer,
  isStringLiteral,
  ObjectMethodDefinition,
  ModuleItem,
  NumericLiteralKinds,
  isNumnerLiteral,
  Decorator,
  ClassMethodDefinition,
  ObjectAccessor,
  ClassAccessor,
  ClassConstructor,
  MethodDefinition,
  Keywords,
  Pattern,
  isRestElement,
  isPrivateName,
  isSpreadElement,
  ArrorFunctionExpression,
  PropertyDefinition,
  FunctionBody,
  TSParameter,
  TSTypeAnnotation,
  isAssignmentPattern,
} from "web-infra-common";
import { ParserPlugin } from "@/src/parser/config";
import { ErrorMessageMap } from "@/src/parser/error";
import { ExpressionScopeKind } from "@/src/parser/scope/type";
import { Parser } from "..";
import { StrictModeScope } from "@/src/parser/scope/strictModeScope";
import { AsyncArrowExpressionScope } from "@/src/parser/scope/arrowExprScope";
import {
  ASTArrayWithMetaData,
  IdentiferWithKeyworArray,
  PreserveWordSet,
  KeywordSet,
} from "@/src/parser/type";

export function parseRegexLiteral(this: Parser): RegexLiteral {
  this.expectButNotEat([SyntaxKinds.DivideOperator, SyntaxKinds.DivideAssignOperator]);
  const startWithAssignOperator = this.match(SyntaxKinds.DivideAssignOperator);
  const start = this.getStartPosition();
  // eslint-disable-next-line prefer-const
  let { pattern, flag } = this.readRegex();
  this.nextToken();
  if (startWithAssignOperator) {
    pattern = "=" + pattern;
  }
  return Factory.createRegexLiteral(pattern, flag, start, this.getEndPosition());
}
/**
 * IdentifierReference, IdentifierName and BindingIdentifier is not samething in the
 * spec.
 * - IdentifierReference is a id in Lval or Rval
 * - IdentifierName is a property of member expression or object, class
 * - BindingIdentifier is a lval.
 * @returns {Identifier}
 */
export function parseIdentifierReference(this: Parser): Identifier {
  this.expectButNotEat([
    SyntaxKinds.Identifier,
    SyntaxKinds.AwaitKeyword,
    SyntaxKinds.YieldKeyword,
    SyntaxKinds.LetKeyword,
  ]);
  // sematic check for a binding identifier
  let identifer: Identifier;
  switch (this.getToken()) {
    // for most of yield keyword, if it should treat as identifier,
    // it should not in generator function.
    case SyntaxKinds.YieldKeyword: {
      const { value, start, end } = this.expect(SyntaxKinds.YieldKeyword);
      this.staticSematicForIdentifierAsYield(start);
      identifer = Factory.createIdentifier(value, start, end, undefined, undefined);
      break;
    }
    // for most of await keyword, if it should treat as identifier,
    // it should not in async function.
    case SyntaxKinds.AwaitKeyword: {
      const { value, start, end } = this.expect(SyntaxKinds.AwaitKeyword);
      this.staticSematicForIdentifierAsAwait(start);
      identifer = Factory.createIdentifier(value, start, end, undefined, undefined);
      break;
    }
    // let maybe treat as identifier in not strict mode, and not lexical binding declaration.
    // so lexical binding declaration should implement it's own checker logical with parseIdentifierWithKeyword
    case SyntaxKinds.LetKeyword: {
      const { value, start, end } = this.expect(SyntaxKinds.LetKeyword);
      this.staticSematicForIdentifierAsLet(start);
      identifer = Factory.createIdentifier(value, start, end, undefined, undefined);
      break;
    }
    case SyntaxKinds.Identifier: {
      const { value, start, end } = this.expect(SyntaxKinds.Identifier);
      this.staticSematicForIdentifierDefault(value, start);
      identifer = Factory.createIdentifier(value, start, end, undefined, undefined);
      break;
    }
    default: {
      throw this.createUnexpectError();
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
export function staticSematicForIdentifierAsYield(this: Parser, start: SourcePosition) {
  if (this.isCurrentScopeParseYieldAsExpression() || this.isInStrictMode()) {
    this.raiseError(ErrorMessageMap.babel_error_invalid_yield, start);
  }
  this.recordScope(ExpressionScopeKind.YieldIdentifier, start);
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
export function staticSematicForIdentifierAsAwait(this: Parser, start: SourcePosition) {
  if (this.isCurrentScopeParseAwaitAsExpression() || this.config.sourceType === "module") {
    this.raiseError(
      ErrorMessageMap.babel_error_can_not_use_await_as_identifier_inside_an_async_function,
      start,
    );
  }
  // skip if is using await in class property name in async context
  if (this.isDirectToClassScope() && !this.isInPropertyName()) {
    return;
  }
  this.recordScope(ExpressionScopeKind.AwaitIdentifier, start);
}
/**
 * Let only could be used as identifirt when
 *
 * - it is not in strict mode
 *
 * record it's usgae for defer check.
 * @param {SourcePosition} start
 */
export function staticSematicForIdentifierAsLet(this: Parser, start: SourcePosition) {
  if (this.isInStrictMode()) {
    this.raiseError(ErrorMessageMap.unexpect_keyword_in_stric_mode, start);
  }
  this.recordScope(ExpressionScopeKind.LetIdentifiier, start);
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
export function staticSematicForIdentifierDefault(this: Parser, value: string, start: SourcePosition) {
  const isPreserveWord = PreserveWordSet.has(value);
  if (isPreserveWord) {
    if (this.isInStrictMode()) {
      this.raiseError(ErrorMessageMap.unexpect_keyword_in_stric_mode, start);
    }
    this.recordScope(ExpressionScopeKind.PresveredWordIdentifier, start);
  }
  if (value === "arguments") {
    if (this.isInStrictMode()) {
      if (!this.isEncloseInFunction() && !this.isInPropertyName()) {
        // invalud usage
        this.raiseError(ErrorMessageMap.syntax_error_arguments_is_not_valid_in_fields, start);
      }
      if (this.strictModeScopeRecorder.isInLHS()) {
        // invalid assignment
        this.raiseError(ErrorMessageMap.unexpect_keyword_in_stric_mode, start);
      }
    }
    this.recordScope(ExpressionScopeKind.ArgumentsIdentifier, start);
  }
  if (value === "eval") {
    if (this.isInStrictMode() && this.strictModeScopeRecorder.isInLHS()) {
      this.raiseError(ErrorMessageMap.unexpect_keyword_in_stric_mode, start);
    }
    this.recordScope(ExpressionScopeKind.EvalIdentifier, start);
  }
}
/**
 * Relatedly loose function for parseIdentifier, it not only can parse identifier,
 * it also can parse keyword as identifier.
 * @returns {Identifier}
 */
export function parseIdentifierName(this: Parser): Identifier {
  const { value, start, end } = this.expect(IdentiferWithKeyworArray);
  return Factory.createIdentifier(value, start, end, undefined, undefined);
}
/**
 * ECMA spec has every strict rule to private name, but in this parser, most of
 * strict rule check is implemented by callee, there we only gonna check is in
 * class scope or not.
 * @returns {PrivateName}
 */
export function parsePrivateName(this: Parser): PrivateName {
  const { value, start, end } = this.expect(SyntaxKinds.PrivateName);
  if (!this.isInClassScope()) {
    this.raiseError(ErrorMessageMap.syntax_error_unexpected_hash_used_outside_of_class_body, start); // semantics check for private
  }
  return Factory.createPrivateName(value, start, end);
}
export function parseNullLiteral(this: Parser) {
  const { start, end } = this.expect(SyntaxKinds.NullKeyword);
  return Factory.createNullLiteral(start, end);
}
export function parseUndefinedLiteral(this: Parser) {
  const { start, end } = this.expect(SyntaxKinds.UndefinedKeyword);
  return Factory.createUndefinedLiteral(start, end);
}
export function parseDecimalLiteral(this: Parser) {
  const { start, end, value } = this.expect(SyntaxKinds.DecimalLiteral);
  return Factory.createDecimalLiteral(value, start, end);
}
export function parseDecimalBigIntegerLiteral(this: Parser) {
  const { start, end, value } = this.expect(SyntaxKinds.DecimalBigIntegerLiteral);
  return Factory.createDecimalBigIntegerLiteral(value, start, end);
}
export function parseNonOctalDecimalLiteral(this: Parser) {
  const { start, end, value } = this.expect(SyntaxKinds.NonOctalDecimalLiteral);
  if (this.isInStrictMode()) {
    this.raiseError(ErrorMessageMap.Syntax_error_0_prefixed_octal_literals_are_deprecated, start);
  }
  return Factory.createNonOctalDecimalLiteral(value, start, end);
}
export function parseBinaryIntegerLiteral(this: Parser) {
  const { start, end, value } = this.expect(SyntaxKinds.BinaryIntegerLiteral);
  return Factory.createBinaryIntegerLiteral(value, start, end);
}
export function parseBinaryBigIntegerLiteral(this: Parser) {
  const { start, end, value } = this.expect(SyntaxKinds.BinaryBigIntegerLiteral);
  return Factory.createBinaryBigIntegerLiteral(value, start, end);
}
export function parseOctalIntegerLiteral(this: Parser) {
  const { start, end, value } = this.expect(SyntaxKinds.OctalIntegerLiteral);
  return Factory.createOctalIntegerLiteral(value, start, end);
}
export function parseOctalBigIntegerLiteral(this: Parser) {
  const { start, end, value } = this.expect(SyntaxKinds.OctalBigIntegerLiteral);
  return Factory.createOctBigIntegerLiteral(value, start, end);
}
export function parseHexIntegerLiteral(this: Parser) {
  const { start, end, value } = this.expect(SyntaxKinds.HexIntegerLiteral);
  return Factory.createHexIntegerLiteral(value, start, end);
}
export function parseHexBigIntegerLiteral(this: Parser) {
  const { start, end, value } = this.expect(SyntaxKinds.HexBigIntegerLiteral);
  return Factory.createHexBigIntegerLiteral(value, start, end);
}
export function parseLegacyOctalIntegerLiteral(this: Parser) {
  const { start, end, value } = this.expect(SyntaxKinds.LegacyOctalIntegerLiteral);
  if (this.isInStrictMode()) {
    this.raiseError(ErrorMessageMap.Syntax_error_0_prefixed_octal_literals_are_deprecated, start);
  }
  return Factory.createLegacyOctalIntegerLiteral(value, start, end);
}
export function parseNumericLiteral(this: Parser): NumberLiteral {
  switch (this.getToken()) {
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
    default:
      throw this.createUnexpectError();
  }
}
export function parseStringLiteral(this: Parser) {
  const { start, end, value } = this.expect(SyntaxKinds.StringLiteral);
  return Factory.createStringLiteral(value, start, end);
}
export function parseBoolLiteral(this: Parser) {
  const { start, end, value } = this.expect([SyntaxKinds.TrueKeyword, SyntaxKinds.FalseKeyword]);
  return Factory.createBoolLiteral(value === "true" ? true : false, start, end);
}
export function parseTemplateLiteral(this: Parser, tagged: boolean) {
  if (!this.match([SyntaxKinds.TemplateHead, SyntaxKinds.TemplateNoSubstitution])) {
    throw this.createUnreachError([SyntaxKinds.TemplateHead, SyntaxKinds.TemplateNoSubstitution]);
  }
  const templateLiteralStart = this.getStartPosition();
  if (this.match(SyntaxKinds.TemplateNoSubstitution)) {
    if (!tagged && this.lexer.getTemplateLiteralTag()) {
      this.raiseError(ErrorMessageMap.v8_error_invalid_hexadecimal_escape_sequence, this.getStartPosition());
    }
    const value = this.getSourceValue();
    const templateLiteralEnd = this.getEndPosition();
    this.nextToken();
    return Factory.createTemplateLiteral(
      [Factory.createTemplateElement(value, true, templateLiteralStart, templateLiteralEnd)],
      [],
      templateLiteralStart,
      templateLiteralEnd,
    );
  }
  this.nextToken();
  const expressions = [this.parseExpressionAllowIn()];
  const quasis: Array<TemplateElement> = [];
  while (
    !this.match(SyntaxKinds.TemplateTail) &&
    this.match(SyntaxKinds.TemplateMiddle) &&
    !this.match(SyntaxKinds.EOFToken)
  ) {
    if (!tagged && this.lexer.getTemplateLiteralTag()) {
      this.raiseError(ErrorMessageMap.v8_error_invalid_hexadecimal_escape_sequence, this.getStartPosition());
    }
    quasis.push(
      Factory.createTemplateElement(
        this.getSourceValue(),
        false,
        this.getStartPosition(),
        this.getEndPosition(),
      ),
    );
    this.nextToken();
    expressions.push(this.parseExpressionAllowIn());
  }
  if (this.match(SyntaxKinds.EOFToken)) {
    throw this.createUnexpectError();
  }
  if (!tagged && this.lexer.getTemplateLiteralTag()) {
    this.raiseError(ErrorMessageMap.v8_error_invalid_hexadecimal_escape_sequence, this.getStartPosition());
  }
  quasis.push(
    Factory.createTemplateElement(
      this.getSourceValue(),
      true,
      this.getStartPosition(),
      this.getEndPosition(),
    ),
  );
  const templateLiteralEnd = this.getEndPosition();
  this.nextToken();
  return Factory.createTemplateLiteral(quasis, expressions, templateLiteralStart, templateLiteralEnd);
}
/**
 * Parse import meta property
 * ```
 * ImportMeta := import . meta
 * ```
 * @returns {MetaProperty}
 */
export function parseImportMeta(this: Parser): MetaProperty {
  const { start, end } = this.expect(SyntaxKinds.ImportKeyword);
  this.expect(SyntaxKinds.DotOperator);
  const ecaFlag = this.getEscFlag();
  const property = this.parseIdentifierReference();
  this.staticSematicForImportMeta(property, ecaFlag, start);
  return Factory.createMetaProperty(
    Factory.createIdentifier("import", start, end, undefined, undefined),
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
export function staticSematicForImportMeta(
  this: Parser,
  property: Identifier,
  ecaFlag: boolean,
  start: SourcePosition,
) {
  if (property.name !== "meta") {
    this.raiseError(
      ErrorMessageMap.babel_error_the_only_valid_meta_property_for_import_is_import_meta,
      property.start,
    );
  }
  if (ecaFlag) {
    this.raiseError(ErrorMessageMap.invalid_esc_char_in_keyword, start);
  }
  if (this.config.sourceType === "script") {
    this.raiseError(ErrorMessageMap.babel_error_import_meta_may_appear_only_with_source_type_module, start);
  }
}
/**
 * Parse Import call
 * ```
 * ImportCall := import ( AssignmentExpression[+In], (optional support attribute) )
 * ```
 * @returns {CallExpression}
 */
export function parseImportCall(this: Parser): CallExpression {
  const { start, end } = this.expect(SyntaxKinds.ImportKeyword);
  this.expect(SyntaxKinds.ParenthesesLeftPunctuator);
  const argument = this.parseAssignmentExpressionAllowIn();
  const option = this.parseImportAttributeOptional();
  const { end: finalEnd } = this.expect(SyntaxKinds.ParenthesesRightPunctuator);
  return Factory.createCallExpression(
    Factory.createImport(start, end),
    option ? [argument, option] : [argument],
    undefined,
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
export function parseImportAttributeOptional(this: Parser): Expression | null {
  if (
    !this.requirePlugin(ParserPlugin.ImportAssertions) &&
    !this.requirePlugin(ParserPlugin.ImportAttribute)
  ) {
    return null;
  }
  if (!this.match(SyntaxKinds.CommaToken)) {
    return null;
  }
  this.nextToken();
  if (this.match(SyntaxKinds.ParenthesesRightPunctuator)) {
    return null;
  }
  const option = this.parseAssignmentExpressionAllowIn();
  if (this.match(SyntaxKinds.CommaToken)) {
    this.nextToken();
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
export function parseNewTarget(this: Parser): MetaProperty {
  const { start, end } = this.expect(SyntaxKinds.NewKeyword);
  this.expect(SyntaxKinds.DotOperator);
  this.staticSematicForNewTarget(start);
  const targetStart = this.getStartPosition();
  const targetEnd = this.getEndPosition();
  this.nextToken();
  return Factory.createMetaProperty(
    Factory.createIdentifier("new", start, end, undefined, undefined),
    Factory.createIdentifier("target", targetStart, targetEnd, undefined, undefined),
    start,
    targetEnd,
  );
}
export function staticSematicForNewTarget(this: Parser, start: SourcePosition) {
  if (!this.isContextKeyword("target")) {
    // recoverable error
    throw this.createUnexpectError();
  }
  if (!this.config.allowNewTargetOutsideFunction && this.isTopLevel() && !this.isInClassScope()) {
    // recoverable error
    this.raiseError(
      ErrorMessageMap.babel_error_new_target_can_only_be_used_in_class_or_function_scope,
      start,
    );
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
export function parseNewExpression(this: Parser): Expression {
  const { start } = this.expect(SyntaxKinds.NewKeyword);
  // maybe is new.target
  if (this.match(SyntaxKinds.NewKeyword) && this.lookahead().kind !== SyntaxKinds.DotOperator) {
    return this.parseNewExpression();
  }
  let base = this.parsePrimaryExpression();
  this.staticSematicForBaseInNewExpression(base);
  base = this.parseNewExpressionCallee(base);
  const typeArgument = this.tryParseTSTypeParameterInstantiationForNewExpression();
  if (!this.match(SyntaxKinds.ParenthesesLeftPunctuator)) {
    // accpect New XXX -> No argument
    return Factory.createNewExpression(base, [], typeArgument, start, cloneSourcePosition(base.end));
  }
  const { end, nodes } = this.parseArguments();
  return Factory.createNewExpression(base, nodes, typeArgument, start, end);
}
/**
 * The base of new expression can not be a import call expression, if must be a import
 * call expression, it must be have a paran.
 * @param {Expression} base
 */
export function staticSematicForBaseInNewExpression(this: Parser, base: Expression) {
  if (!base.parentheses && isCallExpression(base) && base.callee.kind === SyntaxKinds.Import) {
    // recoverable error
    this.raiseError(ErrorMessageMap.babel_error_cannot_use_new_with_import, base.start);
  }
}
/**
 * Parse the callee of new expression, base of new expression can not
 * be a call expression or a qustion dot expression.
 * @param {Expression} base
 * @returns
 */
export function parseNewExpressionCallee(this: Parser, base: Expression): Expression {
  while (
    this.match(SyntaxKinds.DotOperator) ||
    this.match(SyntaxKinds.BracketLeftPunctuator) ||
    this.match(SyntaxKinds.QustionDotOperator)
  ) {
    if (this.match(SyntaxKinds.QustionDotOperator)) {
      // recoverable error
      this.raiseError(
        ErrorMessageMap.babel_error_constructors_in_after_an_optional_chain_are_not_allowed,
        this.getStartPosition(),
      );
      this.nextToken();
      base = this.parseMemberExpression(base, true);
      continue;
    }
    base = this.parseMemberExpression(base, false);
  }
  return base;
}
export function tryParseTSTypeParameterInstantiationForNewExpression(this: Parser) {
  if (this.match(SyntaxKinds.LtOperator) || this.match(SyntaxKinds.BitwiseLeftShiftOperator)) {
    const result = this.tryParse(() => this.tryParseTSTypeParameterInstantiation(false));
    if (
      this.match([
        SyntaxKinds.ParenthesesLeftPunctuator,
        SyntaxKinds.TemplateNoSubstitution,
        SyntaxKinds.TemplateHead,
      ])
    ) {
      return result?.[0];
    }
    if (
      this.match([
        SyntaxKinds.LtOperator,
        SyntaxKinds.GtOperator,
        SyntaxKinds.MinusOperator,
        SyntaxKinds.MinusOperator,
      ]) ||
      !(this.getLineTerminatorFlag() || this.isBinaryOps(this.getToken()) || !this.canStartExpression())
    ) {
      if (result) this.abortTryParseResult(result[1], result[2], result[3]);
      return;
    }
    return result?.[0];
  }
}
// TODO: finish all possible
// reference: https://github.com/oxc-project/oxc/blob/eac34b676f473f79bcb4a55d6322d0b02a15d6fa/crates/oxc_parser/src/ts/types.rs#L1382
export function canStartExpression(this: Parser) {
  switch (this.getToken()) {
    case SyntaxKinds.Identifier:
    case SyntaxKinds.PlusOperator:
    case SyntaxKinds.MinusOperator:
      return true;
    case SyntaxKinds.TrueKeyword:
    case SyntaxKinds.FalseKeyword:
    case SyntaxKinds.NullKeyword:
    case SyntaxKinds.UndefinedKeyword:
    case SyntaxKinds.StringLiteral:
      return true;
    default:
      return false;
  }
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
export function parseSuper(this: Parser): Expression {
  if (!this.isCurrentClassExtend()) {
    // recoverable error
    this.raiseError(
      ErrorMessageMap.syntax_error_super_is_only_valid_in_derived_class_constructors,
      this.getStartPosition(),
    );
  }
  const { start: keywordStart, end: keywordEnd } = this.expect([SyntaxKinds.SuperKeyword]);
  if (this.match(SyntaxKinds.ParenthesesLeftPunctuator)) {
    if (!this.lexicalScopeRecorder.isInCtor()) {
      // recoverable error
      this.raiseError(ErrorMessageMap.babel_error_call_super_outside_of_ctor, keywordStart);
    }
    const typeArguments = this.tryParseTSTypeParameterInstantiation(false);
    const { nodes, end: argusEnd } = this.parseArguments();
    return Factory.createCallExpression(
      Factory.createSuper(keywordStart, keywordEnd),
      nodes,
      typeArguments,
      false,
      cloneSourcePosition(keywordStart),
      argusEnd,
    );
  }
  let property: Expression;
  let isComputed = false;
  let end: SourcePosition;
  switch (this.getToken()) {
    case SyntaxKinds.QustionDotOperator:
      // recoverable error.
      this.raiseError(ErrorMessageMap.babel_invalid_usage_of_super_call, this.getStartPosition());
    // eslint-disable-next-line no-fallthrough
    case SyntaxKinds.DotOperator: {
      this.nextToken();
      if (this.match(SyntaxKinds.PrivateName)) {
        property = this.parsePrivateName();
        // recoverable error
        this.raiseError(ErrorMessageMap.babel_error_private_fields_cant_be_accessed_on_super, property.start);
      } else {
        property = this.parseIdentifierName();
      }
      end = cloneSourcePosition(property.end);
      break;
    }
    case SyntaxKinds.BracketLeftPunctuator: {
      this.nextToken();
      property = this.parseExpressionAllowIn();
      isComputed = true;
      ({ end } = this.expect(SyntaxKinds.BracketRightPunctuator));
      break;
    }
    default:
      throw this.createUnexpectError();
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
export function parseThisExpression(this: Parser): ThisExpression {
  const { start, end } = this.expect([SyntaxKinds.ThisKeyword]);
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
export function parseObjectExpression(this: Parser): Expression {
  const { start } = this.expect(SyntaxKinds.BracesLeftPunctuator);
  let isStart = true;
  const propertyDefinitionList: Array<PropertyDefinition> = [];
  let trailingComma = false;
  const protoPropertyNames: Array<PropertyName> = [];
  while (!this.match(SyntaxKinds.BracesRightPunctuator) && !this.match(SyntaxKinds.EOFToken)) {
    if (isStart) {
      propertyDefinitionList.push(this.parsePropertyDefinition(protoPropertyNames));
      isStart = false;
      continue;
    }
    this.expect(SyntaxKinds.CommaToken);
    if (this.match(SyntaxKinds.BracesRightPunctuator) || this.match(SyntaxKinds.EOFToken)) {
      trailingComma = true;
      break;
    }
    propertyDefinitionList.push(this.parsePropertyDefinition(protoPropertyNames));
  }
  this.staticSematicEarlyErrorForObjectExpression(protoPropertyNames);
  const { end } = this.expect(SyntaxKinds.BracesRightPunctuator);
  return Factory.createObjectExpression(propertyDefinitionList, trailingComma, start, end);
}
/**
 * Adding `__proto__` property key to duplication set, if object expression transform to pattern
 * duplication of `__proto__` is ok, but when is not pattern, it not a correct syntax.
 * @param {Array<PropertyName>} protoPropertyNames
 * reference: 13.2.5.1
 */
export function staticSematicEarlyErrorForObjectExpression(
  this: Parser,
  protoPropertyNames: Array<PropertyName>,
) {
  if (protoPropertyNames.length > 1) {
    for (let index = 1; index < protoPropertyNames.length; ++index)
      this.context.propertiesProtoDuplicateSet.add(protoPropertyNames[index]);
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
export function staticSematicHelperRecordPropertyNameForEarlyError(
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
export function parsePropertyDefinition(
  this: Parser,
  protoPropertyNameLocations: Array<PropertyName>,
): PropertyDefinition {
  // semantics check for private
  if (this.match(SyntaxKinds.PrivateName)) {
    // TODO: make it recoverable
    throw this.createMessageError(ErrorMessageMap.extra_error_private_field_in_object_expression);
  }
  // spreadElement
  if (this.match(SyntaxKinds.SpreadOperator)) {
    const spreadElementStart = this.getStartPosition();
    this.nextToken();
    const expr = this.parseAssignmentExpressionAllowIn();
    return Factory.createSpreadElement(expr, spreadElementStart, cloneSourcePosition(expr.end));
  }
  // start with possible method modifier
  if (this.checkIsMethodStartWithModifier()) {
    return this.parseMethodDefintion() as ObjectMethodDefinition;
  }
  // otherwise, it would be Property start with PropertyName or MethodDeinftion start with PropertyName
  const isComputedRef = { isComputed: false };
  const propertyName = this.parsePropertyName(isComputedRef);
  if (this.match(SyntaxKinds.ParenthesesLeftPunctuator)) {
    return this.parseMethodDefintion(false, [
      propertyName,
      isComputedRef.isComputed,
    ]) as ObjectMethodDefinition;
  }
  if (isComputedRef.isComputed || this.match(SyntaxKinds.ColonPunctuator)) {
    staticSematicHelperRecordPropertyNameForEarlyError(
      protoPropertyNameLocations,
      propertyName,
      isComputedRef.isComputed,
    );
    this.nextToken();
    const expr = this.parseAssignmentExpressionAllowIn();
    return Factory.createObjectProperty(
      propertyName,
      expr,
      isComputedRef.isComputed,
      false,
      cloneSourcePosition(propertyName.start),
      cloneSourcePosition(expr.end),
    );
  }
  this.recordIdentifierValue(propertyName);
  if (this.match(SyntaxKinds.AssginOperator)) {
    staticSematicHelperRecordPropertyNameForEarlyError(
      protoPropertyNameLocations,
      propertyName,
      isComputedRef.isComputed,
    );
    this.nextToken();
    const expr = this.parseAssignmentExpressionAllowIn();
    const property = Factory.createObjectProperty(
      propertyName,
      expr,
      isComputedRef.isComputed,
      false,
      cloneSourcePosition(propertyName.start),
      cloneSourcePosition(expr.end),
    );
    this.context.propertiesInitSet.add(property);
    return property;
  }
  this.staticSematicForShortedPropertyNameInObjectLike(propertyName);
  this.staticSematicForShortedPropertyNameInObjectExpression(propertyName as Identifier);
  return Factory.createObjectProperty(
    propertyName,
    undefined,
    isComputedRef.isComputed,
    true,
    cloneSourcePosition(propertyName.start),
    cloneSourcePosition(propertyName.end),
  );
}
export function recordIdentifierValue(this: Parser, propertyName: ModuleItem) {
  if (isIdentifer(propertyName)) {
    if (propertyName.name === "await") {
      this.recordScope(ExpressionScopeKind.AwaitIdentifier, propertyName.start);
    }
    if (propertyName.name === "yield") {
      this.recordScope(ExpressionScopeKind.YieldIdentifier, propertyName.start);
    }
    if (propertyName.name === "arguments") {
      this.recordScope(ExpressionScopeKind.ArgumentsIdentifier, propertyName.start);
    }
    if (propertyName.name === "eval") {
      this.recordScope(ExpressionScopeKind.EvalIdentifier, propertyName.start);
    }
    if (propertyName.name === "let") {
      this.recordScope(ExpressionScopeKind.LetIdentifiier, propertyName.start);
    }
    if (PreserveWordSet.has(propertyName.name)) {
      this.recordScope(ExpressionScopeKind.PresveredWordIdentifier, propertyName.start);
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
export function parsePropertyName(this: Parser, isComputedRef: { isComputed: boolean }): PropertyName {
  this.expectButNotEat([
    SyntaxKinds.BracketLeftPunctuator,
    SyntaxKinds.StringLiteral,
    ...IdentiferWithKeyworArray,
    ...NumericLiteralKinds,
  ]);
  switch (this.getToken()) {
    case SyntaxKinds.StringLiteral: {
      return this.parseStringLiteral();
    }
    case SyntaxKinds.BracketLeftPunctuator: {
      this.nextToken();
      this.lexicalScopeRecorder.enterPropertyName();
      const expr = this.parseAssignmentExpressionAllowIn();
      this.lexicalScopeRecorder.exitPropertyName();
      this.expect(SyntaxKinds.BracketRightPunctuator);
      isComputedRef.isComputed = true;
      return expr;
    }
    default: {
      if (this.match(NumericLiteralKinds)) {
        return this.parseNumericLiteral();
      }
      // propty name is a spical test of binding identifier.
      // if `await` and `yield` is propty name with colon (means assign), it dose not affected by scope.
      if (this.match(IdentiferWithKeyworArray)) {
        const identifer = this.parseIdentifierName();
        return identifer;
      }
      throw this.createUnexpectError();
    }
  }
}
/**
 * Sematic check when a property name is shorted property
 * @param {PropertyName} propertyName
 * @returns
 */
export function staticSematicForShortedPropertyNameInObjectLike(this: Parser, propertyName: PropertyName) {
  if (isStringLiteral(propertyName) || isNumnerLiteral(propertyName)) {
    // recoverable error.
    this.raiseError(
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
export function staticSematicForShortedPropertyNameInObjectExpression(
  this: Parser,
  propertyName: Identifier,
) {
  if (propertyName.name === "await") {
    if (this.isCurrentScopeParseAwaitAsExpression() || this.config.sourceType === "module") {
      this.raiseError(
        ErrorMessageMap.babel_error_can_not_use_await_as_identifier_inside_an_async_function,
        propertyName.start,
      );
    }
    return;
  }
  if (propertyName.name === "yield") {
    if (this.isCurrentScopeParseYieldAsExpression() || this.isInStrictMode()) {
      this.raiseError(ErrorMessageMap.babel_error_invalid_yield, propertyName.start);
    }
    return;
  }
  if (KeywordSet.has(propertyName.name)) {
    // recoverable error
    this.raiseError(ErrorMessageMap.babel_error_unexpected_keyword, propertyName.start);
  }
  if (PreserveWordSet.has(propertyName.name) && this.isInStrictMode()) {
    // recoverable error
    this.raiseError(ErrorMessageMap.babel_error_unexpected_reserved_word, propertyName.start);
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
export function parseMethodDefintion(
  this: Parser,
  inClass: boolean = false,
  withPropertyName: [PropertyName | PrivateName, boolean] | undefined = undefined,
  isStatic: boolean = false,
  decorators: Decorator[] | null = null,
): ObjectMethodDefinition | ClassMethodDefinition | ObjectAccessor | ClassAccessor | ClassConstructor {
  if (!this.checkIsMethodStartWithModifier() && !withPropertyName) {
    throw this.createUnreachError([SyntaxKinds.MultiplyAssignOperator, SyntaxKinds.Identifier]);
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
    if (this.isContextKeyword("set")) {
      type = "set";
      start = this.getStartPosition();
      this.nextToken();
    } else if (this.isContextKeyword("get")) {
      type = "get";
      start = this.getStartPosition();
      this.nextToken();
    }
    // second, parser async and generator
    const { kind } = this.lookahead();
    if (this.isContextKeyword("async") && kind !== SyntaxKinds.ParenthesesLeftPunctuator) {
      start = this.getStartPosition();
      isAsync = true;
      this.nextToken();
      if (this.match(SyntaxKinds.MultiplyOperator)) {
        this.nextToken();
        generator = true;
      }
    } else if (this.match(SyntaxKinds.MultiplyOperator)) {
      start = this.getStartPosition();
      generator = true;
      this.nextToken();
    }
    if (this.match(SyntaxKinds.PrivateName)) {
      propertyName = this.parsePrivateName();
      this.defPrivateName(
        propertyName.name,
        propertyName.start,
        type === "method" ? "other" : isStatic ? `static-${type}` : type,
      );
    } else {
      const isComputedRef = { isComputed: false };
      propertyName = this.parsePropertyName(isComputedRef);
      computed = isComputedRef.isComputed;
    }
    if (!start) start = cloneSourcePosition(propertyName.start);
  } else {
    start = cloneSourcePosition(withPropertyName[0].start);
    propertyName = withPropertyName[0];
  }
  const isCtor = inClass && !isStatic && !computed && helperIsPropertyNameIsCtor(propertyName);
  if (isCtor) {
    this.lexicalScopeRecorder.enterCtor();
    if (this.lexicalScopeRecorder.testAndSetCtor()) {
      this.raiseError(ErrorMessageMap.v8_error_a_class_may_only_have_one_constructor, propertyName.start);
    }
  }
  const typeParameters = this.tryParseTSTypeParameterDeclaration(false);
  this.enterFunctionScope(isAsync, generator);
  const [parmas, scope] = this.parseWithCatpureLayer(() => this.parseFunctionParam());
  const returnType = this.tryParseTSReturnTypeOrTypePredicate(SyntaxKinds.ColonPunctuator);
  const body = this.parseFunctionBody();
  this.postStaticSematicEarlyErrorForStrictModeOfFunction(null, scope);
  this.exitFunctionScope(true);
  if (isCtor) this.lexicalScopeRecorder.exitCtor();
  /**
   * Step 2: semantic and more concise syntax check instead just throw a unexpect
   * token error.
   */
  this.staticSematicEarlyErrorForClassMethodDefinition(
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
        this.raiseError(
          ErrorMessageMap.babel_error_decorators_can_not_be_used_with_a_constructor,
          decorators[0].start,
        );
      }
      return Factory.createClassConstructor(
        propertyName as ClassConstructor["key"],
        body,
        parmas,
        returnType,
        start as SourcePosition,
        cloneSourcePosition(body.end),
      );
    }
    if (type === "set" || type === "get") {
      return Factory.createClassAccessor(
        propertyName,
        body,
        parmas,
        typeParameters,
        returnType,
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
      typeParameters,
      returnType,
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
      typeParameters,
      returnType,
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
    typeParameters,
    returnType,
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
export function checkIsMethodStartWithModifier(this: Parser): boolean {
  if (this.match(SyntaxKinds.MultiplyOperator)) {
    return true;
  }
  const { kind, lineTerminatorFlag: flag } = this.lookahead();
  const isLookAheadValidatePropertyNameStart =
    Keywords.find((keyword) => keyword === kind) ||
    kind === SyntaxKinds.Identifier ||
    kind === SyntaxKinds.PrivateName ||
    kind === SyntaxKinds.StringLiteral ||
    NumericLiteralKinds.includes(kind) ||
    kind === SyntaxKinds.BracketLeftPunctuator ||
    kind === SyntaxKinds.MultiplyOperator;
  if (this.isContextKeyword("set") && isLookAheadValidatePropertyNameStart) {
    return true;
  }
  if (this.isContextKeyword("get") && isLookAheadValidatePropertyNameStart) {
    return true;
  }
  if (this.isContextKeyword("async") && isLookAheadValidatePropertyNameStart && !flag) {
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
export function staticSematicEarlyErrorForClassMethodDefinition(
  this: Parser,
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
    this.raiseError(ErrorMessageMap.syntax_error_getter_functions_must_have_no_arguments, propertyName.start);
  }
  if (type === "set") {
    if (params.length !== 1) {
      this.raiseError(ErrorMessageMap.syntax_error_setter_functions_must_have_one_argument, params[0].start);
    }
    for (const param of params) {
      if (isRestElement(param)) {
        this.raiseError(
          ErrorMessageMap.syntax_error_setter_functions_must_have_one_argument_not_rest,
          param.start,
        );
      }
    }
  }
  if (type === "get" && (isAsync || isGenerator)) {
    this.raiseError(ErrorMessageMap.extra_error_getter_can_not_be_async_or_generator, propertyName.start);
  }
  if (type === "set" && (isAsync || isGenerator)) {
    this.raiseError(ErrorMessageMap.extra_error_setter_can_not_be_async_or_generator, propertyName.start);
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
        this.raiseError(
          ErrorMessageMap.v8_error_class_constructor_may_not_be_an_async_method,
          propertyName.start,
        );
      }
      if (isGenerator) {
        this.raiseError(
          ErrorMessageMap.v8_error_class_constructor_may_not_be_a_generator,
          propertyName.start,
        );
      }
      if (type === "get" || type === "set") {
        this.raiseError(
          ErrorMessageMap.v8_error_class_constructor_may_not_be_an_accessor,
          propertyName.start,
        );
      }
      if (isPrivate) {
        this.raiseError(
          ErrorMessageMap.v8_error_class_may_not_have_a_private_field_named_constructor,
          propertyName.start,
        );
      }
    }
    if (valueOfName === "prototype" && !isPrivate && type === "method" && isStatic) {
      this.raiseError(
        ErrorMessageMap.v8_error_class_may_not_have_static_property_named_prototype,
        propertyName.start,
      );
    }
  }
}
export function parseArrayExpression(this: Parser) {
  const { start } = this.expect(SyntaxKinds.BracketLeftPunctuator);
  const elements: Array<Expression | null> = [];
  let tralingComma = false;
  let isStart = true;
  while (!this.match(SyntaxKinds.BracketRightPunctuator) && !this.match(SyntaxKinds.EOFToken)) {
    if (isStart) {
      isStart = false;
    } else {
      this.expect(SyntaxKinds.CommaToken);
    }
    if (this.match([SyntaxKinds.BracketRightPunctuator, SyntaxKinds.EOFToken])) {
      tralingComma = true;
      break;
    }
    if (this.match(SyntaxKinds.CommaToken)) {
      elements.push(null);
      continue;
    }
    if (this.match(SyntaxKinds.SpreadOperator)) {
      const start = this.getStartPosition();
      this.nextToken();
      const expr = this.parseAssignmentExpressionAllowIn();
      elements.push(Factory.createSpreadElement(expr, start, cloneSourcePosition(expr.end)));
    } else {
      const expr = this.parseAssignmentExpressionAllowIn();
      elements.push(expr);
    }
  }
  const { end } = this.expect(SyntaxKinds.BracketRightPunctuator);
  return Factory.createArrayExpression(elements, start, end, tralingComma);
}
export function parseFunctionExpression(this: Parser, isAsync: boolean) {
  this.enterFunctionScope(isAsync);
  const funcExpr = this.parseFunction(true);
  this.exitFunctionScope(false);
  return Factory.transFormFunctionToFunctionExpression(funcExpr);
}
export function parseClassExpression(this: Parser, decoratorList: Decorator[] | null) {
  return Factory.transFormClassToClassExpression(this.parseClass(decoratorList));
}
export function parseCoverExpressionORArrowFunction(this: Parser) {
  const possibleBeArrow = this.canParseAsArrowFunction();
  this.expectButNotEat(SyntaxKinds.ParenthesesLeftPunctuator);
  const [[{ start, end, nodes, trailingComma, typeAnnotations }, strictModeScope], arrowExprScope] =
    this.parseWithArrowExpressionScope(() => this.parseWithCatpureLayer(() => this.parseArgumentsWithType()));
  const returnType = this.tryParseTSReturnTypeOrTypePredicateForArrowExpression(possibleBeArrow, nodes);
  const notArrowExpression = !possibleBeArrow || !this.match(SyntaxKinds.ArrowOperator);

  if (notArrowExpression) {
    // transfor to sequence or signal expression
    for (const element of nodes) {
      if (isSpreadElement(element)) {
        // recoverable error
        this.raiseError(ErrorMessageMap.extra_error_rest_element_invalid, element.start);
      }
    }
    if (trailingComma) {
      // recoverable error
      this.raiseError(ErrorMessageMap.extra_error_sequence_expression_can_not_have_trailing_comma, end);
    }
    if (nodes.length === 1) {
      nodes[0].parentheses = true;
      return nodes[0];
    }
    if (nodes.length === 0) {
      // recoverable error
      this.raiseError(ErrorMessageMap.extra_error_empty_parentheses_expression, start);
    }
    const seq = Factory.createSequenceExpression(nodes, start, end);
    seq.parentheses = true;
    return seq;
  }
  this.enterArrowFunctionBodyScope();
  const arrowExpr = this.parseArrowFunctionExpression(
    { start, end, nodes, trailingComma, typeAnnotations },
    undefined,
    strictModeScope,
    arrowExprScope,
  );
  this.exitArrowFunctionBodyScope();
  arrowExpr.returnType = returnType;
  return arrowExpr;
}
export function tryParseTSReturnTypeOrTypePredicateForArrowExpression(
  this: Parser,
  possibleBeArrow: boolean,
  functionArguments: Expression[],
) {
  let returnType: undefined | ArrorFunctionExpression["returnType"] = undefined;
  if (
    possibleBeArrow &&
    simpleCheckIsArgumentCanBeAssignable(functionArguments) &&
    this.match(SyntaxKinds.ColonPunctuator) &&
    this.requirePlugin(ParserPlugin.TypeScript)
  ) {
    const result = this.tryParse(() => this.parseTSReturnTypeOrTypePredicate(SyntaxKinds.ColonPunctuator));
    if (!this.match(SyntaxKinds.ArrowOperator)) {
      if (!result) throw this.createUnreachError();
      this.lexer.restoreState(result[1], result[2]);
      this.errorHandler.restoreTryFail(result[3]);
    } else {
      returnType = result?.[0];
    }
  }
  return returnType;
}
export function simpleCheckIsArgumentCanBeAssignable(functionArguments: Array<Expression>) {
  for (const argu of functionArguments) {
    switch (argu.kind) {
      case SyntaxKinds.ObjectExpression:
      case SyntaxKinds.ArrayExpression:
      case SyntaxKinds.Identifier:
      case SyntaxKinds.SpreadElement:
        continue;
      case SyntaxKinds.AssigmentExpression:
        if (argu.operator === SyntaxKinds.AssginOperator) {
          continue;
        }
        return false;
      default:
        return false;
    }
  }
  return true;
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
export function parseArrowFunctionExpression(
  this: Parser,
  metaData: ASTArrayWithMetaData<Expression> & {
    trailingComma: boolean;
    typeAnnotations: Array<[TSTypeAnnotation | undefined, boolean]> | undefined;
  },
  typeParameters: ArrorFunctionExpression["typeParameters"],
  strictModeScope: StrictModeScope,
  arrowExprScope: AsyncArrowExpressionScope,
): ArrorFunctionExpression {
  if (this.getLineTerminatorFlag()) {
    // recoverable error
    this.raiseError(
      ErrorMessageMap.extra_error_no_line_break_is_allowed_before_arrow,
      this.getStartPosition(),
    );
  }
  this.expect(SyntaxKinds.ArrowOperator);
  const functionArguments = this.argumentToFunctionParams(
    metaData.nodes,
    metaData.trailingComma,
    strictModeScope,
    arrowExprScope,
  );
  let body: Expression | FunctionBody;
  let isExpression = false;
  if (this.match(SyntaxKinds.BracesLeftPunctuator)) {
    body = this.parseFunctionBody();
  } else {
    body = this.parseAssignmentExpressionInheritIn();
    isExpression = true;
  }
  this.postStaticSematicEarlyErrorForStrictModeOfFunction(null, strictModeScope);
  this.attachTypeToPattern(functionArguments, metaData.typeAnnotations);
  return Factory.createArrowExpression(
    isExpression,
    body,
    functionArguments,
    typeParameters,
    undefined,
    this.isCurrentScopeParseAwaitAsExpression(),
    cloneSourcePosition(metaData.start),
    cloneSourcePosition(body.end),
  );
}
export function attachTypeToPattern(
  this: Parser,
  patterns: Array<Pattern>,
  typeAnnotations: Array<[TSTypeAnnotation | undefined, boolean]> | undefined,
) {
  if (!typeAnnotations || !this.requirePlugin(ParserPlugin.TypeScript)) {
    return;
  }
  let index = 0;
  for (const pat of patterns) {
    if (isAssignmentPattern(pat)) {
      const tsPat = pat.left as TSParameter;
      tsPat.typeAnnotation = typeAnnotations[index][0];
      tsPat.optional = typeAnnotations[index][1];
      continue;
    }
    (pat as TSParameter).typeAnnotation = typeAnnotations[index][0];
    (pat as TSParameter).optional = typeAnnotations[index][1];
    index++;
  }
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
export function argumentToFunctionParams(
  this: Parser,
  functionArguments: Array<Expression>,
  trailingComma: boolean,
  strictModeScope: StrictModeScope,
  arrowExprScope: AsyncArrowExpressionScope,
): Array<Pattern> {
  const params = functionArguments.map((node) => this.exprToPattern(node, true)) as Array<Pattern>;
  if (
    this.isCurrentScopeParseAwaitAsExpression() ||
    this.isParentFunctionAsync() ||
    this.isParentFunctionGenerator()
  ) {
    this.checkAsyncArrowExprScopeError(arrowExprScope);
  }
  if (this.isInStrictMode()) {
    this.checkStrictModeScopeError(strictModeScope);
  }
  const isMultiSpread = this.postStaticSematicForArrowParamAfterTransform(params);
  if (isMultiSpread && trailingComma)
    // recoverable error
    this.raiseError(
      ErrorMessageMap.babel_error_unexpected_trailing_comma_after_rest_element,
      this.lexer.getLastTokenEndPositon(),
    );
  // check as function params
  this.setContextIfParamsIsSimpleParameterList(params);
  return params;
}
export function postStaticSematicForArrowParamAfterTransform(this: Parser, params: Array<Pattern>) {
  let flag = false;
  params.forEach((param) => {
    if (flag && isRestElement(param)) {
      // recoverable error
      this.raiseError(ErrorMessageMap.babel_error_unexpected_trailing_comma_after_rest_element, param.start);
      return;
    }
    if (flag) {
      // recoverable error
      this.raiseError(ErrorMessageMap.babel_error_unexpected_trailing_comma_after_rest_element, param.start);
      return;
    }
    if (!flag && isRestElement(param)) {
      flag = true;
    }
  });
  return flag;
}
