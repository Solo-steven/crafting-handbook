import { SourcePosition } from "web-infra-common";
import { ExpressionScopeKind } from "./type";

export type AsyncArrowExpressionScope = {
  yieldExpressionInParameter: Array<SourcePosition>;
  awaitExpressionInParameter: Array<SourcePosition>;
  awaitIdentifier: Array<SourcePosition>;
};

function mergeScope(target: AsyncArrowExpressionScope, source: AsyncArrowExpressionScope) {
  target.awaitExpressionInParameter = target.awaitExpressionInParameter.concat(
    source.awaitExpressionInParameter,
  );
  target.awaitIdentifier = target.awaitIdentifier.concat(source.awaitIdentifier);
  target.yieldExpressionInParameter = target.yieldExpressionInParameter.concat(
    source.yieldExpressionInParameter,
  );
}

export function createAsyncArrowExpressionScopeRecorder() {
  const asyncArrowExpressionScopes: Array<AsyncArrowExpressionScope | null> = [];

  function enterAsyncArrowExpressionScope() {
    asyncArrowExpressionScopes.push({
      awaitExpressionInParameter: [],
      yieldExpressionInParameter: [],
      awaitIdentifier: [],
    });
  }
  function enterFunctionScope() {
    asyncArrowExpressionScopes.push(null);
  }
  function helperFindParentScope() {
    for (let i = asyncArrowExpressionScopes.length - 1; i >= 0; --i) {
      const scope = asyncArrowExpressionScopes[i];
      if (scope) {
        return scope;
      }
      if (!scope) {
        return null;
      }
    }
    return null;
  }
  function exitAsyncArrowExpressionScope() {
    const current = asyncArrowExpressionScopes.pop();
    if (!current) return;
    const target: AsyncArrowExpressionScope | null = helperFindParentScope();
    if (target) {
      mergeScope(target, current);
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
    }
  }

  return {
    record,
    isAsyncArrowExpressionScopeHaveError,
    getCurrentAsyncArrowExpressionScope,
    enterAsyncArrowExpressionScope,
    enterFunctionScope,
    exitAsyncArrowExpressionScope,
  };
}
