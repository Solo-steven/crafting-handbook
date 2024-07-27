import { SourcePosition } from "web-infra-common";
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
  PresveredWordIdentifier,
}

export type ArrowExpressionErrorScope = {
  yieldExpressionInParameter: Array<SourcePosition>;
  awaitExpressionInParameter: Array<SourcePosition>;
  awaitIdentifier: Array<SourcePosition>;
  yieldIdentifier: Array<SourcePosition>;
};

export type StrictModeExpressionErrorScope =
  | {
      kind: "LHSLayer" | "CatpureLayer";
      yieldIdentifier: Array<SourcePosition>;
      evalIdentifier: Array<SourcePosition>;
      argumentsIdentifier: Array<SourcePosition>;
      letIdentifier: Array<SourcePosition>;
      preservedWordIdentifier: Array<SourcePosition>;
    }
  | {
      kind: "RHSLayer";
    };

export function createExpressionErrorRecorder() {
  let arrowExpressionErrorScopes: Array<ArrowExpressionErrorScope | null> = [];

  let strictModeExpressionScopes: Array<StrictModeExpressionErrorScope> = [];

  function enterArrowExpressionScope() {
    arrowExpressionErrorScopes.push({
      awaitExpressionInParameter: [],
      yieldExpressionInParameter: [],
      awaitIdentifier: [],
      yieldIdentifier: [],
    });
  }
  function enterBlankArrowExpressionScope() {
    arrowExpressionErrorScopes.push(null);
  }
  function exitArrowExpressionScope() {
    const current = arrowExpressionErrorScopes.pop();
    if (!current) return;
    let target: ArrowExpressionErrorScope | null = null;
    for (let i = arrowExpressionErrorScopes.length - 1; i >= 0; --i) {
      const scope = arrowExpressionErrorScopes[i];
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
  function isArrowExpressionScopeHaveError(scope: ArrowExpressionErrorScope) {
    return (
      scope.awaitExpressionInParameter.length ||
      scope.yieldExpressionInParameter.length ||
      scope.awaitIdentifier.length
    );
  }
  function getCurrentArrowExpressionScope() {
    return arrowExpressionErrorScopes[arrowExpressionErrorScopes.length - 1]!;
  }

  function record(kind: ExpressionErrorKind, position: SourcePosition) {
    recordForArrowFunctionScope(kind, position);
    recordForStrictModeFunctionScope(kind, position);
  }
  function recordForArrowFunctionScope(kind: ExpressionErrorKind, position: SourcePosition) {
    const scope = arrowExpressionErrorScopes[arrowExpressionErrorScopes.length - 1];
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
  function recordForStrictModeFunctionScope(kind: ExpressionErrorKind, position: SourcePosition) {
    const scope = strictModeExpressionScopes[strictModeExpressionScopes.length - 1];
    if (!scope || scope.kind === "RHSLayer") {
      return;
    }
    switch (kind) {
      case ExpressionErrorKind.EvalIdentifier:
        scope.evalIdentifier.push(position);
        break;
      case ExpressionErrorKind.ArgumentsIdentifier:
        scope.argumentsIdentifier.push(position);
        break;
      case ExpressionErrorKind.YieldIdentifier:
        scope.yieldIdentifier.push(position);
        break;
      case ExpressionErrorKind.LetIdentifiier:
        scope.letIdentifier.push(position);
        break;
      case ExpressionErrorKind.PresveredWordIdentifier:
        scope.preservedWordIdentifier.push(position);
        break;
    }
  }
  function isStrictModeScopeViolateStrictMode(scope: StrictModeExpressionErrorScope) {
    return (
      scope.kind !== "RHSLayer" &&
      (scope.argumentsIdentifier.length ||
        scope.evalIdentifier.length ||
        scope.yieldIdentifier.length ||
        scope.letIdentifier.length ||
        scope.preservedWordIdentifier.length)
    );
  }
  function isCurrentStrictModeScopeViolateStrictMode(): boolean {
    const scope = strictModeExpressionScopes[strictModeExpressionScopes.length - 1];
    if (!scope) return false;
    return Boolean(
      scope.kind !== "RHSLayer" &&
        (scope.argumentsIdentifier.length ||
          scope.evalIdentifier.length ||
          scope.yieldIdentifier.length ||
          scope.letIdentifier.length ||
          scope.preservedWordIdentifier.length),
    );
  }

  function enterLHSStrictModeScope() {
    strictModeExpressionScopes.push({
      kind: "LHSLayer",
      evalIdentifier: [],
      yieldIdentifier: [],
      argumentsIdentifier: [],
      letIdentifier: [],
      preservedWordIdentifier: [],
    });
  }
  function enterRHSStrictModeScope() {
    strictModeExpressionScopes.push({
      kind: "RHSLayer",
    });
  }
  function enterCatpureStrictModeScope() {
    strictModeExpressionScopes.push({
      kind: "CatpureLayer",
      evalIdentifier: [],
      yieldIdentifier: [],
      argumentsIdentifier: [],
      letIdentifier: [],
      preservedWordIdentifier: [],
    });
  }
  function isInLHS() {
    const scope = strictModeExpressionScopes[strictModeExpressionScopes.length - 1];
    if (!scope) return false;
    return scope.kind === "LHSLayer";
  }
  function exitStrictModeScope() {
    const source = strictModeExpressionScopes.pop();
    if (source?.kind === "RHSLayer") {
      return;
    }
    let target: StrictModeExpressionErrorScope | null = null;
    for (const scope of strictModeExpressionScopes.reverse()) {
      if (scope.kind === "CatpureLayer") {
        target = scope;
        break;
      }
      if (scope.kind === "RHSLayer") {
        break;
      }
    }
    strictModeExpressionScopes.reverse();
    if (target && source) {
      target.argumentsIdentifier = target.argumentsIdentifier.concat(source.argumentsIdentifier);
      target.evalIdentifier = target.evalIdentifier.concat(source.evalIdentifier);
      target.letIdentifier = target.letIdentifier.concat(source.letIdentifier);
      target.yieldIdentifier = target.yieldIdentifier.concat(source.yieldIdentifier);
      target.preservedWordIdentifier = target.preservedWordIdentifier.concat(source.preservedWordIdentifier);
    }
  }

  function getCurrentStrictModeScope(): StrictModeExpressionErrorScope {
    const scope = strictModeExpressionScopes[strictModeExpressionScopes.length - 1];
    if (!scope) throw new Error();
    return structuredClone(scope);
  }

  return {
    record,

    enterArrowExpressionScope,
    enterBlankArrowExpressionScope,
    exitArrowExpressionScope,
    getCurrentArrowExpressionScope,
    isArrowExpressionScopeHaveError,

    enterLHSStrictModeScope,
    enterRHSStrictModeScope,
    enterCatpureStrictModeScope,
    exitStrictModeScope,

    getCurrentStrictModeScope,
    isCurrentStrictModeScopeViolateStrictMode,
    isStrictModeScopeViolateStrictMode,
    isInLHS,

    debug() {
      return strictModeExpressionScopes;
    },
    debugArrow() {
      return arrowExpressionErrorScopes;
    },
  };
}
