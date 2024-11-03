import {
  TSEnumDeclaration,
  Factory,
  TSEnumBody,
  SyntaxKinds,
  TSEnumMember,
  Expression,
  cloneSourcePosition,
  TSTypeAliasDeclaration,
  TSInterfaceDeclaration,
  TSInterfaceHeritage,
  TSTypeAnnotation,
  SourcePosition,
  TSParameter,
  TSTypeElement,
  Declaration,
  ArrorFunctionExpression,
  TSTypeParameterDeclaration,
} from "web-infra-common";
import { ParserPlugin } from "@/src/parser/config";
import { Parser } from "@/src/parser";
import { ErrorMessageMap } from "@/src/parser/error";
import { AsyncArrowExpressionScope } from "../scope/arrowExprScope";
import { StrictModeScope } from "../scope/strictModeScope";
import { ASTArrayWithMetaData } from "../type";

export function tryParseDeclarationWithIdentifierStart(this: Parser): Declaration | undefined {
  if (this.match(SyntaxKinds.EnumKeyword)) {
    return this.parseTSEnumDeclaration(false);
  }
  if (this.getEscFlag()) {
    return;
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
    case "abstract": {
      if (!(lookaheadToken === SyntaxKinds.ClassKeyword && !lineTerminatorFlag)) {
        return;
      }
      this.nextToken();
      return this.parseClassDeclaration(null, true);
    }
    default: {
      return;
    }
  }
}

export function parseTSEnumDeclaration(this: Parser, isConst: boolean): TSEnumDeclaration {
  const start = this.getStartPosition();
  this.nextToken(); // eat `enum`
  const id = this.parseIdentifierReference();
  const body = this.parseTSEnumBody();
  return Factory.createTSEnumDeclaration(id, body, isConst, start, this.getLastTokenEndPositon());
}
export function parseTSEnumBody(this: Parser): TSEnumBody {
  const { start } = this.expect(SyntaxKinds.BracesLeftPunctuator);
  const members = [];
  let isStart = true;
  while (!this.match([SyntaxKinds.BracesRightPunctuator, SyntaxKinds.EOFToken])) {
    if (isStart) {
      isStart = false;
    } else {
      this.expect(SyntaxKinds.CommaToken);
    }
    // allow trailing comma
    if (this.match([SyntaxKinds.BracesRightPunctuator, SyntaxKinds.EOFToken])) {
      break;
    }
    members.push(this.parseTSEnumMember());
  }
  const { end } = this.expect(SyntaxKinds.BracesRightPunctuator);
  return Factory.createTSEnumBody(members, start, end);
}
export function parseTSEnumMember(this: Parser): TSEnumMember {
  const name = this.parseIdentifierName();
  let init: Expression | undefined = undefined;
  if (this.match(SyntaxKinds.AssginOperator)) {
    this.nextToken();
    init = this.parseAssignmentExpressionAllowIn();
  }
  return Factory.createTSEnumMember(
    name,
    false,
    init,
    cloneSourcePosition(name.start),
    this.getLastTokenEndPositon(),
  );
}
export function parseTSTypeAlias(this: Parser): TSTypeAliasDeclaration {
  // TODO: TS garud
  const start = this.getStartPosition();
  this.nextToken(); // eat `type`
  const name = this.parseIdentifierReference();
  const typeParameters = this.tryParseTSTypeParameterDeclaration(true);
  this.expect(SyntaxKinds.AssginOperator);
  const typeNode = this.parseTSTypeNode();
  this.shouldInsertSemi();
  return Factory.createTSTypeAliasDeclaration(
    name,
    typeNode,
    typeParameters,
    start,
    this.getLastTokenEndPositon(),
  );
}
export function parseTSInterfaceDeclaration(this: Parser): TSInterfaceDeclaration {
  // TODO: TS garud
  const start = this.getStartPosition();
  this.nextToken(); // eat `interface`
  const id = this.parseIdentifierReference();
  const typeParameters = this.tryParseTSTypeParameterDeclaration(false);
  const extendTypes = this.tryParseTSInterfaceDeclarationExtends();
  const body = this.parseTSInterfaceBody();
  this.shouldInsertSemi();
  return Factory.createTSInterface(
    id,
    typeParameters,
    extendTypes,
    body,
    start,
    this.getLastTokenEndPositon(),
  );
}
export function tryParseTSInterfaceDeclarationExtends(this: Parser): Array<TSInterfaceHeritage> {
  if (this.match(SyntaxKinds.ExtendsKeyword)) {
    this.nextToken();
    const extendsInterfaces = [this.parseTSInterfaceHeritage()];
    while (this.match(SyntaxKinds.CommaToken)) {
      this.nextToken();
      extendsInterfaces.push(this.parseTSInterfaceHeritage());
    }
    return extendsInterfaces;
  }
  return [];
}
export function parseTSInterfaceHeritage(this: Parser) {
  const name = this.parseTSEntityName();
  const typeArguments = this.tryParseTSTypeParameterInstantiation(false);
  return Factory.createTSInterfaceHeritage(
    name,
    typeArguments,
    cloneSourcePosition(name.start),
    this.getLastTokenEndPositon(),
  );
}
export function parseTSInterfaceBody(this: Parser) {
  const { start } = this.expect(SyntaxKinds.BracesLeftPunctuator);
  const members: Array<TSTypeElement> = [];
  while (!this.match([SyntaxKinds.EOFToken, SyntaxKinds.BracesRightPunctuator])) {
    members.push(this.parseTSTypeElment());
    this.parseTSInterTypeElement();
  }
  const { end } = this.expect(SyntaxKinds.BracesRightPunctuator);
  return Factory.createTSInterfaceBody(members, start, end);
}
export function parseTSTypeElment(this: Parser): TSTypeElement {
  switch (this.getToken()) {
    case SyntaxKinds.ParenthesesLeftPunctuator:
    case SyntaxKinds.LtOperator: {
      // TSCallSignatureDeclaration
      const start = this.getStartPosition();
      const { parameters, returnType, typeParameters } = this.parseTSFunctionSingnature(
        SyntaxKinds.ColonPunctuator,
        true,
      );
      return Factory.createTSCallSignatureDeclaration(
        parameters,
        returnType,
        typeParameters,
        start,
        this.getLastTokenEndPositon(),
      );
    }
    case SyntaxKinds.NewKeyword: {
      // TSConstructSignatureDeclaration
      const start = this.getStartPosition();
      this.nextToken();
      const { parameters, returnType, typeParameters } = this.parseTSFunctionSingnature(
        SyntaxKinds.ColonPunctuator,
        true,
      );
      return Factory.createTSConstructSignatureDeclaration(
        parameters,
        returnType,
        typeParameters,
        start,
        this.getLastTokenEndPositon(),
      );
    }
    default: {
      // TSMethodSignature
      // TSPropertySignature
      const isComputedRef = { isComputed: false };
      const key = this.parsePropertyName(isComputedRef);
      let optional = false;
      if (this.match(SyntaxKinds.QustionOperator)) {
        optional = true;
        this.nextToken();
      }
      if (this.match(SyntaxKinds.ParenthesesLeftPunctuator) || this.match(SyntaxKinds.LtOperator)) {
        const { parameters, returnType, typeParameters } = this.parseTSFunctionSingnature(
          SyntaxKinds.ColonPunctuator,
          true,
        );
        return Factory.createTSMethodSignature(
          key,
          isComputedRef.isComputed,
          optional,
          parameters,
          returnType,
          typeParameters,
          cloneSourcePosition(key.start),
          this.getLastTokenEndPositon(),
        );
      }
      const typeAnnotation = this.tryParseTypeAnnotation();
      return Factory.createTSPropertySignature(
        key,
        isComputedRef.isComputed,
        optional,
        typeAnnotation,
        cloneSourcePosition(key.start),
        this.getLastTokenEndPositon(),
      );
    }
  }
}
export function parseTSInterTypeElement(this: Parser) {
  if (this.match([SyntaxKinds.SemiPunctuator, SyntaxKinds.CommaToken])) {
    this.nextToken();
    return;
  }
  if (this.match(SyntaxKinds.BracesRightPunctuator)) {
    return;
  }
  if (this.getLineTerminatorFlag()) {
    return;
  }
  // TODO: should error
}

/**
 * Try parse type annotation, optional mark and default vakue
 * for function param, parse pattern :
 * ```
 * (`?`)? (`:` TypeNode )? (`=` expression)?
 * ```
 * This function will create a assignment pattern if default
 * value exist.
 * @param {TSParameter} param
 * @returns
 */
export function parseFunctionParamType(this: Parser, param: TSParameter, shouldParseDefaultValue: boolean) {
  if (!this.requirePlugin(ParserPlugin.TypeScript)) return param;
  const optional = this.tryParseOptionalTypeParam();
  const type = this.tryParseTypeAnnotation();
  param.typeAnnotation = type;
  param.optional = optional;
  if (this.match(SyntaxKinds.AssginOperator) && shouldParseDefaultValue) {
    return this.parseDefaultValueForBindingElement(param);
  }
  return param;
}
/**
 * First helper of parse possible type annotation for argument. parse
 * expect pattern
 * ```
 * (`?`)? (`:` TypeNode)?
 * ```
 * return binary tuple, optional TypeAnnotation Node and is optional value.
 *
 * NOTE: This function only used to parse type of argument for possible arrow
 * expression.
 *
 * @returns {[TSTypeAnnotation | undefined, boolean]}
 */
export function parsePossibleArugmentType(this: Parser): [TSTypeAnnotation | undefined, boolean] {
  const optional = this.tryParseOptionalTypeParam();
  const type = this.tryParseTypeAnnotation();
  return [type, optional];
}
/**
 * Second helper for parse possible default value for type argument, expect
 * parse pattern:
 * ```
 * (`=` Expression)?
 * ```
 * If assignment operator is exist, will create a assignment expression
 * which wrap left expression as left value, so it gonna transform left
 * expression into pattern.
 *
 * NOTE: This function only used to parse type of argument for possible arrow
 * expression.
 *
 * @param {Expression} left
 * @returns
 */
export function parsePossibleArugmentDefaultValue(this: Parser, left: Expression) {
  if (this.match(SyntaxKinds.AssginOperator)) {
    this.nextToken();
    const leftPat = this.exprToPattern(left, false);
    const right = this.parseAssignmentExpressionInheritIn();
    return Factory.createAssignmentExpression(
      leftPat,
      right,
      SyntaxKinds.AssginOperator,
      cloneSourcePosition(left.start),
      cloneSourcePosition(right.end),
    );
  }
  return left;
}
/**
 * Util helper for parse qustion mark for function param type
 * - return true when token is `?`
 * - return false when token is not `?`.
 * @returns
 */
export function tryParseOptionalTypeParam(this: Parser) {
  let optional = false;
  if (this.match(SyntaxKinds.QustionOperator)) {
    optional = true;
    this.nextToken();
  }
  return optional;
}
export function parseTSFunctionSingnature(this: Parser, expectToken: SyntaxKinds, optional: boolean) {
  const typeParameters = this.tryParseTSTypeParameterDeclaration(false);
  const parameters = this.parseInType(() => this.parseFunctionParam()) as TSParameter[];
  const matchToken = this.match(expectToken);
  if (optional && !matchToken) {
    return {
      typeParameters,
      parameters: parameters,
      returnType: undefined,
    };
  }
  const returnType = this.parseTSReturnTypeOrTypePredicate(expectToken);
  return {
    parameters,
    returnType,
    typeParameters,
  };
}
/**
 * try parse return type or type predicate, expect syntax is
 * ```
 * <expect-token> TypeNode
 * <expect-token> TypePredicate
 * ```
 * @param {SyntaxKinds} expectToken
 * @returns
 */
export function tryParseTSReturnTypeOrTypePredicate(this: Parser, expectToken: SyntaxKinds) {
  if (!this.match(expectToken)) {
    return;
  }
  return this.parseTSReturnTypeOrTypePredicate(expectToken);
}
/**
 * Parse return type, start token indicate the token start return type, in typescript,
 * it should only be `:` or `=>` token. expect parsing pattern
 * ```
 * <expect-token> TypeNode
 * <expect-token> TypePredicate
 *
 * TypePredicate := <Idenifier> `is` <TypeNode>
 *               := asserts <Identifer>
 *               := asserts <Identifier> `is` <TypeNode>
 * ```
 * @param this
 * @param expectToken
 * @returns
 */
export function parseTSReturnTypeOrTypePredicate(
  this: Parser,
  expectToken: SyntaxKinds,
): TSTypeAnnotation | undefined {
  // parse type or type predication
  const { start } = this.expect(expectToken);
  const assertion = this.parseTSAssertionInReturnType();
  const typePredicatePrefix = this.parseTypePredicatePrefixInReturnType();
  if (!typePredicatePrefix) {
    if (!assertion) {
      // : type
      const returnType = this.parseTypeAnnoationWithoutColon(start);
      return returnType;
    }
    // : asserts type
    const name = this.parseIdentifierReference();
    const typePredicate = Factory.createTSTypePredicate(
      name,
      true,
      undefined,
      start,
      cloneSourcePosition(name.end),
    );
    const returnType = Factory.createTSTypeAnnotation(
      typePredicate,
      cloneSourcePosition(typePredicate.start),
      cloneSourcePosition(typePredicate.end),
    );
    return returnType;
  }
  // : asserts type is otherType
  const name = this.parseIdentifierReference();
  this.nextToken(); // eat `is`
  const typeAnnotation = this.parseTypeAnnoationWithoutColon(this.getStartPosition());
  const typePredicate = Factory.createTSTypePredicate(
    name,
    assertion,
    typeAnnotation,
    start,
    cloneSourcePosition(typeAnnotation.end),
  );
  const returnType = Factory.createTSTypeAnnotation(
    typePredicate,
    cloneSourcePosition(typePredicate.start),
    cloneSourcePosition(typePredicate.end),
  );
  return returnType;
}
/**
 * Is return type or type predicate have `asserts` contextual keyword ?
 * - There is some condition we need to consider:
 * ```
 * `asserts`
 * `asserts` <identifier>
 * `asserts` `is` <TypeNode>
 * ```
 * - case 1: `asserts` serve as Type.
 * - case 2: `asserts` is contextual keyword
 * - case 3: `asserts` is a identifier (should be in param).
 * @param this
 * @returns
 */
export function parseTSAssertionInReturnType(this: Parser): boolean {
  if (this.isContextKeyword("asserts")) {
    const { kind: lookaheadToken, value, lineTerminatorFlag } = this.lookahead();
    if (lookaheadToken === SyntaxKinds.Identifier && value !== "is" && !lineTerminatorFlag) {
      this.nextToken();
      return true;
    }
  }
  return false;
}
/**
 * Is return type is TypeRedicate ?
 *
 * This function must used after `parseTSAssertionInReturnType` since which will
 * eat `asserts` token, this function return true when pattern is type predicate
 * ```
 * <identifier> `is` <TypeNode>
 * <idenifier>
 * ```
 * @param this
 * @returns
 */
export function parseTypePredicatePrefixInReturnType(this: Parser) {
  return this.match(SyntaxKinds.Identifier) && this.lookahead().value === "is";
}
export function tryParseTypeAnnotation(this: Parser): TSTypeAnnotation | undefined {
  if (this.match(SyntaxKinds.ColonPunctuator)) {
    return this.parseTypeAnnoation();
  }
  return undefined;
}
export function parseTypeAnnoation(this: Parser): TSTypeAnnotation {
  const { start } = this.expect(SyntaxKinds.ColonPunctuator);
  const typeNode = this.parseTSTypeNode();
  return Factory.createTSTypeAnnotation(typeNode, start, cloneSourcePosition(typeNode.end));
}
export function parseTypeAnnoationWithoutColon(this: Parser, start: SourcePosition): TSTypeAnnotation {
  const typeNode = this.parseTSTypeNode();
  return Factory.createTSTypeAnnotation(typeNode, start, cloneSourcePosition(typeNode.end));
}

/**
 *
 * @param this
 * @returns
 */
export function parseTSGenericArrowFunctionExpression(this: Parser): ArrorFunctionExpression | undefined {
  const result = this.tryParse(
    (): [
      TSTypeParameterDeclaration | undefined,
      [
        ASTArrayWithMetaData<Expression> & {
          trailingComma: boolean;
          typeAnnotations: Array<[TSTypeAnnotation | undefined, boolean]> | undefined;
        },
        StrictModeScope,
        AsyncArrowExpressionScope,
      ],
      TSTypeAnnotation | undefined,
    ] => {
      const typeParameters = this.tryParseTSTypeParameterDeclaration(false);
      const [[meta, strictModeScope], arrowExprScope] = this.parseWithArrowExpressionScope(() =>
        this.parseWithCatpureLayer(() => this.parseArgumentsWithType()),
      );
      meta.start = typeParameters?.start || meta.start;
      const returnType = this.tryParseTSReturnTypeOrTypePredicate(SyntaxKinds.ColonPunctuator);
      return [typeParameters, [meta, strictModeScope, arrowExprScope], returnType];
    },
  );
  if (!result) {
    return;
  }
  const [[typeParameters, [meta, strictModeScope, arrowExprScope], returnType], state, context, index] =
    result;
  if (!this.match(SyntaxKinds.ArrowOperator)) {
    this.abortTryParseResult(state, context, index);
    return;
  }
  this.enterArrowFunctionBodyScope();
  const arrowExpr = this.parseArrowFunctionExpression(meta, typeParameters, strictModeScope, arrowExprScope);
  this.exitArrowFunctionBodyScope();
  arrowExpr.returnType = returnType;
  return arrowExpr;
}
