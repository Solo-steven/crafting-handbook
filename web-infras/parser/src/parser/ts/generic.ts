import {
  Factory,
  SyntaxKinds,
  cloneSourcePosition,
  TSTypeParameterDeclaration,
  TSTypeParameter,
  TSTypeNode,
  TSTypeParameterInstantiation,
} from "web-infra-common";
import { LexerState, LexerContext } from "@/src/lexer/type";
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
