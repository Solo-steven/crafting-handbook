import {
  ArrayExpression,
  ArrayPattern,
  AssigmentExpression,
  AssignmentPattern,
  cloneSourcePosition,
  Expression,
  Factory,
  Identifier,
  isArrayPattern,
  isAssignmentPattern,
  isIdentifer,
  isMemberExpression,
  isObjectPattern,
  isObjectPatternProperty,
  isPattern,
  isRestElement,
  isSpreadElement,
  ModuleItem,
  ObjectExpression,
  ObjectPattern,
  ObjectPatternProperty,
  ObjectProperty,
  Pattern,
  PropertyName,
  RestElement,
  SourcePosition,
  SpreadElement,
  SyntaxKinds,
} from "web-infra-common";
import { Parser } from "..";
import { ErrorMessageMap } from "@/src/parser/error";
import { ExpressionScopeKind } from "@/src/parser/scope/type";
import {
  BindingIdentifierSyntaxKindArray,
  IdentiferWithKeyworArray,
  KeywordSet,
  PreserveWordSet,
} from "@/src/parser/type";

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
export function exprToPattern(this: Parser, expr: Expression, isBinding: boolean): Pattern {
  // TODO, remove impl function.
  return this.exprToPatternImpl(expr, isBinding);
}
export function exprToPatternImpl(this: Parser, node: Expression, isBinding: boolean): Pattern {
  /**
   * parentheses in pattern only allow in Assignment Pattern
   * for MemberExpression and Identifier
   */
  if (node.parentheses) {
    if (!isParanValidationInPattern(isBinding, node))
      // recoverable error
      this.raiseError(ErrorMessageMap.babel_error_invalid_parenthesized_pattern, node.start);
  }
  switch (node.kind) {
    case SyntaxKinds.TSAsExpression:
    case SyntaxKinds.TSTypeAssertionExpression:
    case SyntaxKinds.TSSatisfiesExpression:
    case SyntaxKinds.TSNonNullExpression:
      if (!isBinding) {
        // only accept id, member expression and nested TS expression.
        node.expression = this.exprToPattern(node.expression, isBinding) as Expression;
        return node;
      } else {
        throw this.createMessageError(ErrorMessageMap.syntax_error_invalid_assignment_left_hand_side);
      }
    case SyntaxKinds.AssigmentExpression: {
      return this.assignmentExpressionToAssignmentPattern(node, isBinding);
    }
    case SyntaxKinds.SpreadElement: {
      return this.spreadElementToFunctionRestParameter(node);
    }
    case SyntaxKinds.ArrayExpression: {
      return this.arrayExpressionToArrayPattern(node, isBinding);
    }
    case SyntaxKinds.ObjectExpression: {
      return this.objectExpressionToObjectPattern(node, isBinding);
    }
    case SyntaxKinds.Identifier:
      this.declarateSymbolInBindingPatternAsParam(node.name, isBinding, node.start);
      return node as Identifier;
    case SyntaxKinds.MemberExpression:
      if (!isBinding) {
        return node as Pattern;
      }
    // fall to error
    // eslint-disable-next-line no-fallthrough
    default:
      throw this.createMessageError(ErrorMessageMap.syntax_error_invalid_assignment_left_hand_side);
  }
}
export function isParanValidationInPattern(isBinding: boolean, expr: Expression): boolean {
  if (isBinding) return false;
  return isAssignable(expr);
}
/**
 * Is a node match the DestructuringAssignmentTarget in ECMA spec.
 * @param node
 * @returns
 */
export function isAssignable(node: ModuleItem) {
  switch (node.kind) {
    case SyntaxKinds.Identifier:
    case SyntaxKinds.MemberExpression:
      return true;
    case SyntaxKinds.TSAsExpression:
    case SyntaxKinds.TSTypeAssertionExpression:
    case SyntaxKinds.TSSatisfiesExpression:
    case SyntaxKinds.TSNonNullExpression:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return isAssignable((node as any).expression);
    default:
      return false;
  }
}
/**
 * ## Transform Assignment Expression
 * @param expr
 * @param isBinding
 * @returns
 */
export function assignmentExpressionToAssignmentPattern(
  this: Parser,
  expr: AssigmentExpression,
  isBinding: boolean,
) {
  const left = isBinding ? this.helperCheckPatternWithBinding(expr.left) : expr.left;
  if (expr.operator !== SyntaxKinds.AssginOperator) {
    this.raiseError(ErrorMessageMap.syntax_error_invalid_assignment_left_hand_side, expr.start);
  }
  return Factory.createAssignmentPattern(
    left as Pattern,
    expr.right,
    undefined,
    undefined,
    expr.start,
    expr.end,
  );
}
/**
 * Transform a assignment pattern to a binding assignment pattern
 * @param leftValue
 * @returns
 */
export function helperCheckPatternWithBinding(this: Parser, leftValue: Pattern): Pattern {
  if (isObjectPattern(leftValue)) {
    for (const property of leftValue.properties) {
      if (isObjectPatternProperty(property)) {
        if (property.value && isMemberExpression(property.value)) {
          this.raiseError(ErrorMessageMap.babel_error_binding_member_expression, property.start);
        }
        if (property.value && isAssignable(property.value) && (property.value as Expression).parentheses) {
          // recoverable error
          this.raiseError(ErrorMessageMap.babel_error_invalid_parenthesized_pattern, leftValue.start);
        }
      }
    }
    return leftValue;
  }
  if (isAssignmentPattern(leftValue)) {
    this.helperCheckPatternWithBinding(leftValue.left);
    return leftValue;
  }
  if (isRestElement(leftValue)) {
    this.helperCheckPatternWithBinding(leftValue.argument);
    return leftValue;
  }
  if (isArrayPattern(leftValue)) {
    for (const pat of leftValue.elements) {
      if (pat) {
        this.helperCheckPatternWithBinding(pat);
      }
    }
  }
  if (isAssignable(leftValue)) {
    const expr = leftValue as Expression;
    if (expr.parentheses) {
      // recoverable error
      this.raiseError(ErrorMessageMap.babel_error_invalid_parenthesized_pattern, leftValue.start);
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
export function spreadElementToFunctionRestParameter(this: Parser, spreadElement: SpreadElement) {
  return this.spreadElementToArrayRestElement(spreadElement, true);
}
/**
 * ## Transform `ArrayExpression` to `ArrayPattern`
 * @param elements
 * @param isBinding
 * @returns
 */
export function arrayExpressionToArrayPattern(
  this: Parser,
  expr: ArrayExpression,
  isBinding: boolean,
): ArrayPattern {
  const arrayPatternElements: Array<Pattern | null> = [];
  const restElementIndexs = [];
  for (let index = 0; index < expr.elements.length; ++index) {
    const element = expr.elements[index];
    if (!element) {
      arrayPatternElements.push(null);
      continue;
    }
    if (isSpreadElement(element)) {
      arrayPatternElements.push(this.spreadElementToArrayRestElement(element, isBinding));
      restElementIndexs.push(index);
      continue;
    }
    arrayPatternElements.push(this.exprToPattern(element, isBinding));
  }
  if (
    restElementIndexs.length > 1 ||
    (restElementIndexs.length === 1 &&
      (restElementIndexs[0] !== arrayPatternElements.length - 1 || expr.trailingComma))
  ) {
    this.raiseError(ErrorMessageMap.syntax_error_parameter_after_rest_parameter, expr.end);
  }
  return Factory.createArrayPattern(arrayPatternElements, undefined, undefined, expr.start, expr.end);
}
/**
 * ## Transform `SpreadElement` in ArrayPattern
 * This function transform spread element to following two production rule AST:
 *
 * - `BindingRestElement` in  `ArrayBindingPattern`
 * - `AssignmentRestElement` in `ArrayAssignmentPattern`
 *
 * According to production rule, `BindingRestElement`'s argument can only be identifier or ObjectPattern
 * or ArrayPattern, and argument of `AssignmentRestElement` can only be identifier or memberExpression.
 * ```
 * BindingRestElement := ... BindingIdentifier
 *                    := ... BindingPattern
 * AssignmentRestElement :=... DestructuringAssignmentTarget
 * ```
 * @param spreadElement
 * @param isBinding
 */
export function spreadElementToArrayRestElement(
  this: Parser,
  spreadElement: SpreadElement,
  isBinding: boolean,
): RestElement {
  const argument = this.exprToPattern(spreadElement.argument, isBinding);
  if (isAssignmentPattern(argument)) {
    // recoverable error
    this.raiseError(
      ErrorMessageMap.v8_error_rest_assignment_property_must_be_followed_by_an_identifier_in_declaration_contexts,
      argument.start,
    );
  }
  return Factory.createRestElement(argument, undefined, undefined, spreadElement.start, argument.end);
}
/**
 * ## Transform `ObjectExpression` To `ObjectPattern`
 * @param properties
 * @param isBinding
 * @returns
 */
export function objectExpressionToObjectPattern(
  this: Parser,
  expr: ObjectExpression,
  isBinding: boolean,
): ObjectPattern {
  const objectPatternProperties: Array<ObjectPatternProperty | AssignmentPattern | RestElement> = [];
  const restElementIndexs = [];
  for (let index = 0; index < expr.properties.length; ++index) {
    const property = expr.properties[index];
    switch (property.kind) {
      case SyntaxKinds.ObjectProperty:
        objectPatternProperties.push(this.ObjectPropertyToObjectPatternProperty(property, isBinding));
        break;
      case SyntaxKinds.SpreadElement:
        restElementIndexs.push(index);
        objectPatternProperties.push(this.spreadElementToObjectRestElement(property, isBinding));
        break;
      default:
        throw this.createMessageError(ErrorMessageMap.invalid_left_value);
    }
  }
  if (
    restElementIndexs.length > 1 ||
    (restElementIndexs.length === 1 &&
      (restElementIndexs[0] !== objectPatternProperties.length - 1 || expr.trailingComma))
  ) {
    this.raiseError(ErrorMessageMap.syntax_error_parameter_after_rest_parameter, expr.end);
  }
  return Factory.createObjectPattern(objectPatternProperties, undefined, undefined, expr.start, expr.end);
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
export function spreadElementToObjectRestElement(
  this: Parser,
  spreadElement: SpreadElement,
  isBinding: boolean,
): RestElement {
  const argument = this.exprToPattern(spreadElement.argument, isBinding);
  if (isBinding) {
    if (!isIdentifer(argument)) {
      // recoverable error
      this.raiseError(
        ErrorMessageMap.v8_error_rest_binding_property_must_be_followed_by_an_identifier_in_declaration_contexts,
        argument.start,
      );
    }
  } else {
    if (!isAssignable(argument)) {
      // recoverable error
      this.raiseError(
        ErrorMessageMap.v8_error_rest_assignment_property_must_be_followed_by_an_identifier_in_declaration_contexts,
        argument.start,
      );
    }
  }
  return Factory.createRestElement(argument, undefined, undefined, spreadElement.start, argument.end);
}
export function ObjectPropertyToObjectPatternProperty(
  this: Parser,
  objectPropertyNode: ObjectProperty,
  isBinding = false,
): ObjectPatternProperty | AssignmentPattern {
  // object property's value can not has parentheses.
  if (objectPropertyNode.value && objectPropertyNode.value.parentheses && isBinding) {
    // recoverable error
    this.raiseError(ErrorMessageMap.babel_error_invalid_parenthesized_pattern, objectPropertyNode.start);
  }
  if (this.context.propertiesProtoDuplicateSet.has(objectPropertyNode.key)) {
    this.context.propertiesProtoDuplicateSet.delete(objectPropertyNode.key);
  }
  // When a property name is a CoverInitializedName, we need to cover to assignment pattern
  if (this.context.propertiesInitSet.has(objectPropertyNode) && !objectPropertyNode.shorted) {
    this.context.propertiesInitSet.delete(objectPropertyNode);
    if (objectPropertyNode.computed || !isIdentifer(objectPropertyNode.key)) {
      // property name of assignment pattern can not use computed propertyname or literal
      throw this.createMessageError(
        ErrorMessageMap.assignment_pattern_left_value_can_only_be_idenifier_or_pattern,
      );
    }
    this.declarateSymbolInBindingPatternAsParam(
      objectPropertyNode.key.name,
      isBinding,
      objectPropertyNode.start,
    );
    return Factory.createAssignmentPattern(
      objectPropertyNode.key,
      objectPropertyNode.value as Expression,
      undefined,
      undefined,
      objectPropertyNode.start,
      objectPropertyNode.end,
    );
  }
  const patternValue = !objectPropertyNode.value
    ? objectPropertyNode.value
    : this.exprToPatternImpl(objectPropertyNode.value, isBinding);
  // for binding pattern, member expression is not allow
  //  - for assignment pattern: value production rule is `DestructuringAssignmentTarget`, which just a LeftHandSideExpression
  //  - for binding pattern: value production rule is `BindingElement`, which only can be object-pattern, array-pattern, id.
  if (isBinding && patternValue && isMemberExpression(patternValue)) {
    this.raiseError(ErrorMessageMap.babel_error_binding_member_expression, patternValue.start);
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
export function declarateSymbolInBindingPatternAsParam(
  this: Parser,
  name: string,
  isBinding: boolean,
  position: SourcePosition,
) {
  if (isBinding) {
    this.declarateParam(name, position);
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
export function parseBindingElement(this: Parser, shouldParseAssignment = true): Pattern {
  this.expectButNotEat([
    ...IdentiferWithKeyworArray,
    SyntaxKinds.BracesLeftPunctuator,
    SyntaxKinds.BracketLeftPunctuator,
  ]);
  let left: Pattern | undefined;
  if (this.match(BindingIdentifierSyntaxKindArray)) {
    left = this.parseBindingIdentifier();
  } else {
    left = this.parseBindingPattern();
  }
  if (this.match(SyntaxKinds.AssginOperator) && shouldParseAssignment) {
    return this.parseDefaultValueForBindingElement(left);
  }
  return left;
}
export function parseDefaultValueForBindingElement(this: Parser, left: Pattern) {
  this.expect(SyntaxKinds.AssginOperator);
  const right = this.parseWithRHSLayer(() => this.parseAssignmentExpressionAllowIn());
  return Factory.createAssignmentPattern(
    left,
    right,
    undefined,
    undefined,
    cloneSourcePosition(left.start),
    cloneSourcePosition(right.end),
  );
}
export function parseRestElement(this: Parser, allowPattern: boolean): RestElement {
  const { start } = this.expect([SyntaxKinds.SpreadOperator]);
  let id: Pattern | null = null;
  if (this.match(BindingIdentifierSyntaxKindArray)) {
    id = this.parseBindingIdentifier();
  }
  if (this.match([SyntaxKinds.BracesLeftPunctuator, SyntaxKinds.BracketLeftPunctuator])) {
    if (allowPattern) {
      id = this.parseBindingPattern();
    }
    if (!allowPattern) {
      // recoverable error ?
      throw this.createUnexpectError();
    }
  }
  if (!id) {
    throw this.createUnexpectError();
  }
  return Factory.createRestElement(id, undefined, undefined, start, cloneSourcePosition(id.end));
}
export function parseBindingIdentifier(this: Parser) {
  const id = this.parseWithLHSLayer(() => this.parseIdentifierReference());
  this.declarateNonFunctionalSymbol(id.name, id.start);
  return id;
}
/**
 * Parse BindingPattern
 * ```
 * BindingPattern := ObjectPattern
 *                := ArrayPattern
 * ```
 */
export function parseBindingPattern(this: Parser): ObjectPattern | ArrayPattern {
  return this.parseWithLHSLayer(() => {
    this.expectButNotEat([SyntaxKinds.BracesLeftPunctuator, SyntaxKinds.BracketLeftPunctuator]);
    if (this.match(SyntaxKinds.BracesLeftPunctuator)) {
      return this.parseObjectPattern();
    }
    return this.parseArrayPattern();
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
export function parseObjectPattern(this: Parser): ObjectPattern {
  const { start } = this.expect(SyntaxKinds.BracesLeftPunctuator);
  if (this.match(SyntaxKinds.BracesRightPunctuator)) {
    const end = this.getEndPosition();
    this.nextToken();
    const objectPattern = Factory.createObjectPattern([], undefined, undefined, start, end);
    return objectPattern;
  }
  const properties: Array<ObjectPatternProperty | RestElement | AssignmentPattern> = [
    this.parseObjectPatternPossibelProperty(),
  ];
  while (!this.match([SyntaxKinds.BracesRightPunctuator, SyntaxKinds.EOFToken])) {
    this.expect(SyntaxKinds.CommaToken);
    if (this.match(SyntaxKinds.BracesRightPunctuator) || this.match(SyntaxKinds.EOFToken)) {
      continue;
    }
    properties.push(this.parseObjectPatternPossibelProperty());
  }
  const { end } = this.expect(SyntaxKinds.BracesRightPunctuator);
  const objectPattern = Factory.createObjectPattern(properties, undefined, undefined, start, end);
  return objectPattern;
}
export function parseObjectPatternPossibelProperty(
  this: Parser,
): ObjectPatternProperty | RestElement | AssignmentPattern {
  // parse Rest property
  if (this.match(SyntaxKinds.SpreadOperator)) {
    const rest = this.parseRestElement(false);
    this.staticSematicForRestElementInObjectPattern();
    return rest;
  }
  // parse Object pattern property (rename)
  const isComputedRef = { isComputed: false };
  const propertyName = this.parsePropertyName(isComputedRef);
  if (isComputedRef.isComputed || this.match(SyntaxKinds.ColonPunctuator)) {
    this.nextToken();
    const pattern = this.parseBindingElement();
    return Factory.createObjectPatternProperty(
      propertyName,
      pattern,
      isComputedRef.isComputed,
      false,
      cloneSourcePosition(propertyName.start),
      cloneSourcePosition(pattern.end),
    );
  }
  this.staticCheckForPropertyNameAsSingleBinding(propertyName);
  // parse object pattern as Assignment pattern
  if (this.match(SyntaxKinds.AssginOperator)) {
    this.nextToken();
    const expr = this.parseWithRHSLayer(() => this.parseAssignmentExpressionAllowIn());
    this.staticSematicForAssignmentPatternInObjectPattern(propertyName);
    this.declarateNonFunctionalSymbol((propertyName as Identifier).name, propertyName.start);
    return Factory.createAssignmentPattern(
      propertyName as Pattern,
      expr,
      undefined,
      undefined,
      cloneSourcePosition(propertyName.start),
      cloneSourcePosition(expr.end),
    );
  }
  // parse object pattern as shorted property.
  this.staticSemanticForNameOfObjectLikePropertyShorted(propertyName);
  this.declarateNonFunctionalSymbol((propertyName as Identifier).name, propertyName.start);
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
export function staticSematicForRestElementInObjectPattern(this: Parser) {
  if (
    !this.match(SyntaxKinds.BracesRightPunctuator) ||
    (this.match(SyntaxKinds.CommaToken) && this.lookahead().kind === SyntaxKinds.BracesRightPunctuator)
  ) {
    // recoverable error
    this.raiseError(
      ErrorMessageMap.babel_error_unexpected_trailing_comma_after_rest_element,
      this.getStartPosition(),
    );
  }
}
/**
 * Ban some usage like `{ "string-key" = "name" }` in onject pattern
 * @param propertyName
 */
export function staticSematicForAssignmentPatternInObjectPattern(this: Parser, propertyName: PropertyName) {
  if (!isPattern(propertyName)) {
    throw this.createMessageError("assignment pattern left value can only allow identifier or pattern");
  }
}
/**
 * As for shorted and assignment patern in object pattern, the property name should be
 * a bidning identifier, so we need to check and record the property name.
 * @param propertyName
 * @returns
 */
export function staticCheckForPropertyNameAsSingleBinding(this: Parser, propertyName: PropertyName) {
  if (isIdentifer(propertyName)) {
    switch (propertyName.name) {
      case "await": {
        if (this.isCurrentScopeParseAwaitAsExpression() || this.config.sourceType === "module") {
          this.raiseError(
            ErrorMessageMap.babel_error_can_not_use_await_as_identifier_inside_an_async_function,
            propertyName.start,
          );
        }
        return;
      }
      case "yield": {
        if (this.isCurrentScopeParseYieldAsExpression() || this.isInStrictMode()) {
          this.raiseError(ErrorMessageMap.babel_error_invalid_yield, propertyName.start);
        }
        return;
      }
      case "arguments": {
        if (this.isInStrictMode() && this.strictModeScopeRecorder.isInLHS()) {
          this.raiseError(ErrorMessageMap.syntax_error_bad_strict_arguments_eval, propertyName.start);
        }
        this.recordScope(ExpressionScopeKind.ArgumentsIdentifier, propertyName.start);
        return;
      }
      case "eval": {
        if (this.isInStrictMode() && this.strictModeScopeRecorder.isInLHS()) {
          this.raiseError(ErrorMessageMap.syntax_error_bad_strict_arguments_eval, propertyName.start);
        }
        this.recordScope(ExpressionScopeKind.EvalIdentifier, propertyName.start);
        return;
      }
      case "let": {
        if (this.isInStrictMode()) {
          this.raiseError(ErrorMessageMap.babel_error_unexpected_keyword, propertyName.start);
        }
        this.recordScope(ExpressionScopeKind.LetIdentifiier, propertyName.start);
        return;
      }
      default: {
        if (KeywordSet.has(propertyName.name)) {
          // recoverable error
          this.raiseError(ErrorMessageMap.babel_error_unexpected_keyword, propertyName.start);
        }
        if (PreserveWordSet.has(propertyName.name) && this.isInStrictMode()) {
          // recoverable error
          this.raiseError(ErrorMessageMap.babel_error_unexpected_reserved_word, propertyName.start);
        }
        return;
      }
    }
  }
}
export function parseArrayPattern(this: Parser): ArrayPattern {
  const { start } = this.expect(SyntaxKinds.BracketLeftPunctuator);
  let isStart = true;
  const elements: Array<Pattern | null> = [];
  while (!this.match(SyntaxKinds.BracketRightPunctuator) && !this.match(SyntaxKinds.EOFToken)) {
    if (isStart) {
      isStart = false;
    } else {
      this.expect(SyntaxKinds.CommaToken);
    }
    if (this.match(SyntaxKinds.BracketRightPunctuator) || this.match(SyntaxKinds.EOFToken)) {
      continue;
    }
    if (this.match(SyntaxKinds.CommaToken)) {
      elements.push(null);
      continue;
    }
    if (this.match(SyntaxKinds.SpreadOperator)) {
      elements.push(this.parseRestElement(true));
      if (!this.match(SyntaxKinds.BracketRightPunctuator)) {
        // recoverable error
        this.raiseError(
          ErrorMessageMap.babel_error_unexpected_trailing_comma_after_rest_element,
          this.getStartPosition(),
        );
      }
      break;
    }
    const pattern = this.parseBindingElement();
    elements.push(pattern);
  }
  const { end } = this.expect(SyntaxKinds.BracketRightPunctuator);
  const arrayPattern = Factory.createArrayPattern(elements, undefined, undefined, start, end);
  return arrayPattern;
}
