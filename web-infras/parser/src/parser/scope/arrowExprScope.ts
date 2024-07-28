import { SourcePosition } from "web-infra-common";
import { ExpressionScopeKind } from "./type";

export type AsyncArrowExpressionScope = {
  yieldExpressionInParameter: Array<SourcePosition>;
  awaitExpressionInParameter: Array<SourcePosition>;
  awaitIdentifier: Array<SourcePosition>;
  yieldIdentifier: Array<SourcePosition>;
};

export function createAsyncArrowExpressionScopeRecorder() {
  const asyncArrowExpressionScopes: Array<AsyncArrowExpressionScope | null> = [];

  function enterAsyncArrowExpressionScope() {
    asyncArrowExpressionScopes.push({
      awaitExpressionInParameter: [],
      yieldExpressionInParameter: [],
      awaitIdentifier: [],
      yieldIdentifier: [],
    });
  }
  function enterBlankAsyncArrowExpressionScope() {
    asyncArrowExpressionScopes.push(null);
  }
  function exitAsyncArrowExpressionScope() {
    const current = asyncArrowExpressionScopes.pop();
    if (!current) return;
    let target: AsyncArrowExpressionScope | null = null;
    for (let i = asyncArrowExpressionScopes.length - 1; i >= 0; --i) {
      const scope = asyncArrowExpressionScopes[i];
      if (scope) {
        target = scope;
      }
      if (!scope) {
        break;
      }
    }
    if (target) {
      target.awaitExpressionInParameter = target.awaitExpressionInParameter.concat(
        current.awaitExpressionInParameter,
      );
      target.awaitIdentifier = target.awaitIdentifier.concat(current.awaitIdentifier);
      target.yieldExpressionInParameter = target.yieldExpressionInParameter.concat(
        current.yieldExpressionInParameter,
      );
      target.yieldIdentifier = target.yieldIdentifier.concat(current.yieldIdentifier);
    }
  }
  function isAsyncArrowExpressionScopeHaveError(scope: AsyncArrowExpressionScope) {
    return (
      scope.awaitExpressionInParameter.length ||
      scope.yieldExpressionInParameter.length ||
      scope.awaitIdentifier.length
    );
  }
  function getCurrentAsyncArrowExpressionScope() {
    return asyncArrowExpressionScopes[asyncArrowExpressionScopes.length - 1];
  }
  function record(kind: ExpressionScopeKind, position: SourcePosition) {
    const scope = asyncArrowExpressionScopes[asyncArrowExpressionScopes.length - 1];
    if (!scope) {
      return;
    }
    switch (kind) {
      case ExpressionScopeKind.AwaitExpressionImParameter: {
        scope.awaitExpressionInParameter.push(position);
        break;
      }
      case ExpressionScopeKind.YieldExpressionInParameter: {
        scope.yieldExpressionInParameter.push(position);
        break;
      }
      case ExpressionScopeKind.AwaitIdentifier: {
        scope.awaitIdentifier.push(position);
        break;
      }
      case ExpressionScopeKind.YieldIdentifier: {
        scope.yieldIdentifier.push(position);
        break;
      }
    }
  }

  return {
    record,
    isAsyncArrowExpressionScopeHaveError,
    getCurrentAsyncArrowExpressionScope,
    enterAsyncArrowExpressionScope,
    enterBlankAsyncArrowExpressionScope,
    exitAsyncArrowExpressionScope,
  };
}
