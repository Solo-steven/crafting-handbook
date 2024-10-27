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
  TSTypeParameterDeclaration,
  TSTypeParameter,
  TSTypeNode,
  TSTypeParameterInstantiation,
  TSFunctionType,
  ArrorFunctionExpression,
  TSTypeAnnotation,
  SourcePosition,
  TSTypeOperator,
  TSStringKeyword,
  TSNumberKeyword,
  TSBigIntKeyword,
  TSBooleanKeyword,
  TSNullKeyword,
  TSUndefinedKeyword,
  TSSymbolKeyword,
  TSAnyKeyword,
  TSUnknowKeyword,
  TSVoidKeyword,
  TSTypeQuery,
  TSTupleType,
  TSLiteralType,
  TSParameter,
  TSTypeReference,
  TSEntityName,
  TSTypeLiteral,
  TSTypeElement,
} from "web-infra-common";
import { LexerState, LexerContext } from "@/src/lexer/type";
import { ParserPlugin } from "@/src/parser/config";
import { ASTArrayWithMetaData } from "@/src/parser/type";
import { AsyncArrowExpressionScope } from "@/src/parser/scope/arrowExprScope";
import { StrictModeScope } from "@/src/parser/scope/strictModeScope";
import { Parser } from "@/src/parser";

/**
 *
 * @param tryFunc
 * @returns
 */
export function tryParse<T>(
  this: Parser,
  tryFunc: () => T,
): [T, LexerState, LexerContext, number] | undefined {
  const [state, context] = this.lexer.forkState();
  const errorIndex = this.errorHandler.markAsTry();
  try {
    return [tryFunc(), state, context, errorIndex];
  } catch {
    this.lexer.restoreState(state, context);
    this.errorHandler.restoreTryFail(errorIndex);
  }
  return;
}
export function abortTryParseResult(this: Parser, state: LexerState, context: LexerContext, index: number) {
  this.lexer.restoreState(state, context);
  this.errorHandler.restoreTryFail(index);
}
export function parseInType<T>(this: Parser, worker: () => T): T {
  this.context.isInType = true;
  let result;
  try {
    result = worker();
  } catch (e) {
    this.context.isInType = false;
    throw e;
  }
  return result;
}
export function parseTSEnumDeclaration(this: Parser): TSEnumDeclaration {
  const start = this.getStartPosition();
  this.nextToken(); // eat `enum`
  const id = this.parseIdentifierReference();
  const body = this.parseTSEnumBody();
  return Factory.createTSEnumDeclaration(id, body, start, this.getLastTokenEndPositon());
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
export function tryParseTSTypeParameterDeclaration(this: Parser, allowAssign: boolean) {
  // TODO: TS garud
  if (this.match(SyntaxKinds.LtOperator)) {
    return this.parseTSTypeParameterDeclaration(allowAssign);
  }
}
export function parseTSTypeParameterDeclaration(
  this: Parser,
  allowAssign: boolean,
): TSTypeParameterDeclaration {
  const { start } = this.expect(SyntaxKinds.LtOperator);
  const params = [this.parseTSTypeParameter()];
  while (this.match(SyntaxKinds.CommaToken)) {
    this.nextToken();
    params.push(this.parseTSTypeParameter());
  }
  this.parseGtTokenAsEndOfTypeParameters(allowAssign);
  return Factory.createTSTypeParameterDeclaration(params, start, this.getLastTokenEndPositon());
}
export function parseTSTypeParameter(this: Parser): TSTypeParameter {
  const name = this.parseIdentifierReference();
  let constraint: TSTypeNode | undefined = undefined;
  if (this.match(SyntaxKinds.ExtendsKeyword)) {
    this.nextToken();
    constraint = this.parseTSTypeNode();
  }
  let defaultType: TSTypeNode | undefined = undefined;
  if (this.match(SyntaxKinds.AssginOperator)) {
    this.nextToken();
    defaultType = this.parseTSTypeNode();
  }
  return Factory.createTSTypeParameter(
    constraint,
    defaultType,
    name,
    cloneSourcePosition(name.start),
    this.getLastTokenEndPositon(),
  );
}
export function tryParseTSTypeParameterInstantiation(
  this: Parser,
  allowAssign: boolean,
): TSTypeParameterInstantiation | undefined {
  if (this.match(SyntaxKinds.LtOperator)) {
    return this.parseTSTypeParameterInstantiation(allowAssign);
  }
  if (this.match(SyntaxKinds.BitwiseLeftShiftOperator)) {
    this.lexer.reLexLtRelateToken();
    return this.parseTSTypeParameterInstantiation(allowAssign);
  }
}
export function parseTSTypeParameterInstantiation(
  this: Parser,
  allowAssign: boolean,
): TSTypeParameterInstantiation {
  const { start } = this.expect(SyntaxKinds.LtOperator);
  const params = [this.parseTSTypeNode()];
  while (this.match(SyntaxKinds.CommaToken)) {
    this.nextToken();
    params.push(this.parseTSTypeNode());
  }
  this.parseGtTokenAsEndOfTypeParameters(allowAssign);
  return Factory.createTSTypeParameterInstantiation(params, start, this.getLastTokenEndPositon());
}
export function parseGtTokenAsEndOfTypeParameters(this: Parser, allowAssign: boolean) {
  if (
    this.match([
      SyntaxKinds.GeqtOperator,
      SyntaxKinds.BitwiseLeftShiftOperator,
      SyntaxKinds.BitwiseLeftShiftAssginOperator,
      SyntaxKinds.BitwiseRightShiftFillOperator,
      SyntaxKinds.BitwiseRightShiftFillAssginOperator,
    ])
  ) {
    this.lexer.reLexGtRelateToken(allowAssign);
  }
  this.expect(SyntaxKinds.GtOperator);
}
export function parseTSTypeNode(this: Parser): TSTypeNode {
  const checkType = this.parseTSNonConditionalType();
  if (!this.match(SyntaxKinds.ExtendsKeyword)) {
    return checkType;
  }
  this.nextToken();
  const extendType = this.parseTSNonConditionalType();
  this.expect(SyntaxKinds.QustionOperator);
  const trueType = this.parseTSTypeNode();
  this.expect(SyntaxKinds.ColonPunctuator);
  const falseType = this.parseTSTypeNode();
  return Factory.createTSConditionType(
    checkType,
    extendType,
    trueType,
    falseType,
    cloneSourcePosition(checkType.start),
    this.getLastTokenEndPositon(),
  );
}
export function parseTSNonConditionalType(this: Parser): TSTypeNode {
  if (this.isTSFunctionTypeStart()) {
    return this.parseTSFunctionType();
  }
  if (this.match(SyntaxKinds.NewKeyword)) {
    const start = this.getStartPosition();
    this.nextToken();
    const { typeParameters, parameters, returnType } = this.parseTSFunctionSingnature(
      SyntaxKinds.ArrowOperator,
      false,
    );
    return Factory.createTSConstrcutorType(
      returnType,
      parameters,
      typeParameters,
      start,
      this.getLastTokenEndPositon(),
    );
  }
  if (this.isContextKeyword("abstract")) {
    const start = this.getStartPosition();
    this.nextToken();
    this.expect(SyntaxKinds.NewKeyword);
    const { typeParameters, parameters, returnType } = this.parseTSFunctionSingnature(
      SyntaxKinds.ArrowOperator,
      false,
    );
    return Factory.createTSConstrcutorType(
      returnType,
      parameters,
      typeParameters,
      start,
      this.getLastTokenEndPositon(),
    );
  }
  return this.parseTSUnionType();
}
export function parseTSFunctionType(this: Parser): TSFunctionType {
  const start = this.getStartPosition();
  const { parameters, returnType, typeParameters } = this.parseTSFunctionSingnature(
    SyntaxKinds.ArrowOperator,
    false,
  );
  return Factory.createTSFunctionType(
    returnType,
    parameters,
    typeParameters,
    start,
    this.getLastTokenEndPositon(),
  );
}
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
export function isTSFunctionTypeStart(this: Parser) {
  if (this.match(SyntaxKinds.LtOperator)) {
    return true;
  }
  return this.match(SyntaxKinds.ParenthesesLeftPunctuator);
}

export function parseTSUnionType(this: Parser): TSTypeNode {
  if (this.match(SyntaxKinds.BitwiseANDOperator)) {
    return this.parseTSIntersectionType();
  }
  let leadingOperator = false;
  const start: SourcePosition = this.getStartPosition();
  if (this.match(SyntaxKinds.BitwiseOROperator)) {
    this.nextToken();
    leadingOperator = true;
  }
  const types: Array<TSTypeNode> = [this.parseTSIntersectionType()];
  while (this.match(SyntaxKinds.BitwiseOROperator)) {
    this.nextToken();
    types.push(this.parseTSIntersectionType());
  }
  if (types.length === 1 && !leadingOperator) {
    return types[0];
  }
  return Factory.createTSUnionType(types, start, this.getLastTokenEndPositon());
}
export function parseTSIntersectionType(this: Parser): TSTypeNode {
  let leadingOperator = false;
  const start: SourcePosition = this.getStartPosition();
  if (this.match(SyntaxKinds.BitwiseANDOperator)) {
    this.nextToken();
    leadingOperator = true;
  }
  const types: Array<TSTypeNode> = [this.parseTSTypeOperator()];
  while (this.match(SyntaxKinds.BitwiseANDOperator)) {
    this.nextToken();
    types.push(this.parseTSTypeOperator());
  }
  if (types.length === 1 && !leadingOperator) {
    return types[0];
  }
  return Factory.createTSUnionType(types, start, this.getLastTokenEndPositon());
}
export function parseTSTypeOperator(this: Parser): TSTypeNode {
  let operator: TSTypeOperator["operator"] | undefined = undefined;
  let start: SourcePosition | undefined = undefined;
  if (!this.getEscFlag()) {
    const sourceValue = this.getSourceValue();
    switch (sourceValue) {
      case "unique": {
        operator = "unique";
        start = this.getStartPosition();
        this.nextToken();
        break;
      }
      case "keyof": {
        operator = "keyof";
        start = this.getStartPosition();
        this.nextToken();
        break;
      }
      case "readonly": {
        operator = "readonly";
        start = this.getStartPosition();
        this.nextToken();
        break;
      }
    }
  }
  if (operator && start) {
    const typeNode = this.parseTSTypeOperator();
    return Factory.createTSTypeOperator(typeNode, operator, start, this.getLastTokenEndPositon());
  }
  return this.parseTSArrayType();
}
export function parseTSArrayType(this: Parser) {
  let base = this.parseTSNonArrayType();
  while (this.match(SyntaxKinds.BracketLeftPunctuator)) {
    this.nextToken();
    if (this.match(SyntaxKinds.BracketRightPunctuator)) {
      this.nextToken();
      base = Factory.createTSArrayType(base, cloneSourcePosition(base.start), this.getLastTokenEndPositon());
    } else {
      const indexedType = this.parseTSTypeNode();
      base = Factory.createTSIndexedAccessType(
        indexedType,
        base,
        cloneSourcePosition(base.start),
        this.getLastTokenEndPositon(),
      );
      this.expect(SyntaxKinds.BracketRightPunctuator);
    }
  }
  return base;
}
export function parseTSNonArrayType(this: Parser): TSTypeNode {
  switch (this.getToken()) {
    case SyntaxKinds.BracesLeftPunctuator: {
      return this.parseTSTypeLiteral();
    }
    case SyntaxKinds.BracketLeftPunctuator: {
      return this.parseTSTupleType();
    }
    case SyntaxKinds.TypeofKeyword: {
      return this.parseTypeQuery();
    }
    case SyntaxKinds.NullKeyword:
    case SyntaxKinds.UndefinedKeyword:
    case SyntaxKinds.TrueKeyword:
    case SyntaxKinds.FalseKeyword:
    case SyntaxKinds.DecimalLiteral:
    case SyntaxKinds.DecimalBigIntegerLiteral:
    case SyntaxKinds.NonOctalDecimalLiteral:
    case SyntaxKinds.BinaryIntegerLiteral:
    case SyntaxKinds.BinaryBigIntegerLiteral:
    case SyntaxKinds.OctalIntegerLiteral:
    case SyntaxKinds.OctalBigIntegerLiteral:
    case SyntaxKinds.HexIntegerLiteral:
    case SyntaxKinds.HexBigIntegerLiteral:
    case SyntaxKinds.LegacyOctalIntegerLiteral:
    case SyntaxKinds.StringLiteral: {
      return this.parseTSLiteralType();
    }
    case SyntaxKinds.VoidKeyword: {
      return this.parseTSVoidKeyword();
    }
    default: {
      const currentValue = this.getSourceValue();
      switch (currentValue) {
        case "string": {
          return this.parseTSStringKeyword();
        }
        case "number": {
          return this.parseTSNunberKeyword();
        }
        case "bigint": {
          return this.parseTSBigIntKeyword();
        }
        case "boolean": {
          return this.parseTSBoolKeyword();
        }
        case "null": {
          return this.parseTSNullKeyword();
        }
        case "undefined": {
          return this.parseTSUndefiniedKeyword();
        }
        case "symbol": {
          return this.parseTSSymbolKeyword();
        }
        case "any": {
          return this.parseTSAnyKeyword();
        }
        case "never": {
          return this.parseTSNeverKeyword();
        }
        case "unknown": {
          return this.parseTSUnknownKeyword();
        }
        default: {
          return this.parseTSTypeReference();
        }
      }
    }
  }
}
export function parseTSStringKeyword(this: Parser): TSStringKeyword {
  const { start, end } = this.expect(SyntaxKinds.Identifier);
  return Factory.createTSStringKeyword(start, end);
}
export function parseTSNunberKeyword(this: Parser): TSNumberKeyword {
  const { start, end } = this.expect(SyntaxKinds.Identifier);
  return Factory.createTSNumberKeyword(start, end);
}
export function parseTSBigIntKeyword(this: Parser): TSBigIntKeyword {
  const { start, end } = this.expect(SyntaxKinds.Identifier);
  return Factory.createTSBigintKeyword(start, end);
}
export function parseTSBoolKeyword(this: Parser): TSBooleanKeyword {
  const { start, end } = this.expect(SyntaxKinds.Identifier);
  return Factory.createTSBoolKeyword(start, end);
}
export function parseTSNullKeyword(this: Parser): TSNullKeyword {
  const { start, end } = this.expect(SyntaxKinds.Identifier);
  return Factory.createTSNullKeyword(start, end);
}
export function parseTSUndefiniedKeyword(this: Parser): TSUndefinedKeyword {
  const { start, end } = this.expect(SyntaxKinds.Identifier);
  return Factory.createTSUndefinedKeyword(start, end);
}
export function parseTSSymbolKeyword(this: Parser): TSSymbolKeyword {
  const { start, end } = this.expect(SyntaxKinds.Identifier);
  return Factory.createTSSymbolKeyword(start, end);
}
export function parseTSAnyKeyword(this: Parser): TSAnyKeyword {
  const { start, end } = this.expect(SyntaxKinds.Identifier);
  return Factory.createTSAnyKeyword(start, end);
}
export function parseTSNeverKeyword(this: Parser): TSUndefinedKeyword {
  const { start, end } = this.expect(SyntaxKinds.Identifier);
  return Factory.createTSNeverKeyword(start, end);
}
export function parseTSUnknownKeyword(this: Parser): TSUnknowKeyword {
  const { start, end } = this.expect(SyntaxKinds.Identifier);
  return Factory.createTSUnknowKeyword(start, end);
}
export function parseTSVoidKeyword(this: Parser): TSVoidKeyword {
  const { start, end } = this.expect(SyntaxKinds.VoidKeyword);
  return Factory.createTSVoidKeyword(start, end);
}
export function parseTypeQuery(this: Parser): TSTypeQuery {
  const { start } = this.expect(SyntaxKinds.TypeofKeyword);
  const exprName = this.parseTSEntityName();
  return Factory.createTSTypeQuery(exprName, start, this.getLastTokenEndPositon());
}
export function parseTSTupleType(this: Parser): TSTupleType {
  const { start } = this.expect(SyntaxKinds.BracketLeftPunctuator);
  const elementTypes: Array<TSTypeNode> = [this.parseTSTypeNode()];
  while (!this.match([SyntaxKinds.BracketRightPunctuator, SyntaxKinds.EOFToken])) {
    this.expect(SyntaxKinds.CommaToken);
    if (this.match([SyntaxKinds.BracketRightPunctuator, SyntaxKinds.EOFToken])) {
      break;
    }
    elementTypes.push(this.parseTSTypeNode());
  }
  this.expect(SyntaxKinds.BracketRightPunctuator);
  return Factory.createTSTupleType(elementTypes, start, this.getLastTokenEndPositon());
}
export function parseTSLiteralType(this: Parser): TSLiteralType {
  const start = this.getStartPosition();
  const literal = this.parsePrimaryExpression();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Factory.createTSLiteralType(literal as unknown as any, start, this.getLastTokenEndPositon());
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
export function parseTSTypeReference(this: Parser): TSTypeReference {
  // TODO: TS garud
  const typeName = this.parseTSEntityName();
  const typeArguments = this.tryParseTSTypeParameterInstantiation(false);
  return Factory.createTSTypeReference(
    typeName,
    typeArguments,
    cloneSourcePosition(typeName.start),
    cloneSourcePosition(typeName.end),
  );
}
export function parseTSEntityName(this: Parser): TSEntityName {
  let left: TSEntityName = this.parseIdentifierReference();
  while (this.match(SyntaxKinds.DotOperator)) {
    this.nextToken();
    const right = this.parseIdentifierName();
    left = Factory.createTSQualifiedName(
      left,
      right,
      cloneSourcePosition(left.start),
      cloneSourcePosition(right.end),
    );
  }
  return left;
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
export function parseTSAssertionInReturnType(this: Parser): boolean {
  if (this.isContextKeyword("asserts")) {
    const { kind: lookaheadToken, value, lineTerminatorFlag } = this.lookahead();
    if ((lookaheadToken === SyntaxKinds.Identifier || value === "is") && !lineTerminatorFlag) {
      this.nextToken();
      return true;
    }
  }
  return false;
}
export function parseTypePredicatePrefixInReturnType(this: Parser) {
  return this.match(SyntaxKinds.Identifier) && this.lookahead().value === "is";
}
export function parseTSTypeLiteral(this: Parser): TSTypeLiteral {
  const { start } = this.expect(SyntaxKinds.BracesLeftPunctuator);
  const members: Array<TSTypeElement> = [];
  while (!this.match([SyntaxKinds.EOFToken, SyntaxKinds.BracesRightPunctuator])) {
    members.push(this.parseTSTypeElment());
    this.parseTSInterTypeElement();
  }
  const { end } = this.expect(SyntaxKinds.BracesRightPunctuator);
  return {
    kind: SyntaxKinds.TSTypeLiteral,
    members,
    start,
    end,
  };
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
