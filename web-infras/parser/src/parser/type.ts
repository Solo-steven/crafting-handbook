import { SourcePosition } from "web-infra-common";
import { Token } from "../lexer/type";

export type ExpectToken = Omit<Token, "kind" | "startPosition" | "endPosition"> & {
  start: SourcePosition;
  end: SourcePosition;
};
/**
 * Function Scope structure, Being used for determinate
 * current structure context for async, generator, in-
 * parameter and in strict mode.
 * @member {"FunctionContext"} type - type enum string.
 * @member {boolean} isAsync
 * @member {boolean} isGenerator
 * @member {boolean} inParameter
 * @member {boolean} inStrict
 */
export interface FunctionContext {
  readonly type: "FunctionContext";
  readonly isArrow: boolean;
  isAsync: boolean;
  isGenerator: boolean;
  inParameter: boolean;
  isSimpleParameter: boolean;
  inStrict: boolean;
}
/**
 * Simple scope structure for block statement.
 * @member {"BlockStatement"} type - type enum string.
 */
export interface BlockContext {
  readonly type: "BlockContext";
}
/**
 * Scope structure for function body and block statement,
 * just a conbinmation of function scope and block scope.
 */
export type ScopeContext = FunctionContext | BlockContext;
/**
 * Inspirt by V8's ExpressionScope
 */
export enum ExpressionErrorKind {
  YieldExpressionInParameter,
  AwaitExpressionImParameter,
  AwaitIdentifier,

  YieldIdentifier,

  LetIdentifiier,
  EvalIdentifier,
  ArgumentsIdentifier,
}

type ArrowExpressionErrorScope = {
  yieldExpressionInParameter: Array<SourcePosition>;
  awaitExpressionInParameter: Array<SourcePosition>;
  awaitIdentifier: Array<SourcePosition>;
  yieldIdentifier: Array<SourcePosition>;
};

export function createExpressionErrorRecorder() {
  let arrowExpressionErrorScopesIndex = -1;
  let arrowExpressionErrorScopes: Array<ArrowExpressionErrorScope | null> = [];

  function enterArrowExpressionScope() {
    arrowExpressionErrorScopesIndex++;
    arrowExpressionErrorScopes.push({
      awaitExpressionInParameter: [],
      yieldExpressionInParameter: [],
      awaitIdentifier: [],
      yieldIdentifier: [],
    });
  }

  function enterBlankArrowExpressionScope() {
    arrowExpressionErrorScopesIndex++;
    arrowExpressionErrorScopes.push(null);
  }

  function exitArrowExpressionScope() {
    const currentIndex = arrowExpressionErrorScopesIndex;
    const currentScope = arrowExpressionErrorScopes[currentIndex];
    arrowExpressionErrorScopesIndex--;
    if (arrowExpressionErrorScopesIndex < 0) {
      arrowExpressionErrorScopesIndex = 0;
      arrowExpressionErrorScopes = [];
    }
    if (currentScope === null) {
      arrowExpressionErrorScopes = arrowExpressionErrorScopes.slice(0, currentIndex);
    }
  }

  function record(kind: ExpressionErrorKind, position: SourcePosition) {
    const scope = arrowExpressionErrorScopes[arrowExpressionErrorScopesIndex];
    if (!scope) {
      return;
    }
    switch (kind) {
      case ExpressionErrorKind.AwaitExpressionImParameter: {
        scope.awaitExpressionInParameter.push(position);
        break;
      }
      case ExpressionErrorKind.YieldExpressionInParameter: {
        scope.yieldExpressionInParameter.push(position);
        break;
      }
      case ExpressionErrorKind.AwaitIdentifier: {
        scope.awaitIdentifier.push(position);
        break;
      }
      case ExpressionErrorKind.YieldIdentifier: {
        scope.yieldIdentifier.push(position);
        break;
      }
    }
  }
  function isArrowExpressionScopeHaveError(scope: ArrowExpressionErrorScope) {
    return (
      scope.awaitExpressionInParameter.length ||
      scope.yieldExpressionInParameter.length ||
      scope.awaitIdentifier.length
    );
  }
  function getCurrentArrowExpressionScope() {
    for (let index = arrowExpressionErrorScopesIndex; index < arrowExpressionErrorScopes.length; ++index) {
      const scope = arrowExpressionErrorScopes[index];
      if (scope && isArrowExpressionScopeHaveError(scope)) {
        return true;
      }
    }
    return false;
  }

  return {
    record,
    enterArrowExpressionScope,
    enterBlankArrowExpressionScope,
    exitArrowExpressionScope,
    getCurrentArrowExpressionScope,
  };
}
