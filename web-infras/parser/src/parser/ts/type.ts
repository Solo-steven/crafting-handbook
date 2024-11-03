/**
 * Parse a TypeNode : parse a basic unit of type.
 * this file should only expose `parseTypeNode` api for parse type.
 */
import {
  Factory,
  SyntaxKinds,
  cloneSourcePosition,
  TSTypeNode,
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
  TSTypeReference,
  TSEntityName,
  TSTypeLiteral,
  TSTypeElement,
  SourcePosition,
  TSFunctionType,
  TSTypeOperator,
} from "web-infra-common";
import { Parser } from "@/src/parser";

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
 * Parse TS Type Reference, expect pattern:
 * ```
 * TSTypeReference := <TSEntityName>(<TSTypeParameterInstantiation>)?
 * ```
 * @param this
 * @returns
 */
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
/**
 * Parse TS Entity name, expect pattern:
 * ```
 * TSEntityName = <Identifier>[`.`<Identifier>]
 * ```
 * @param this
 * @returns
 */
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
