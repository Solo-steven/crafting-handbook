import { SourcePosition } from "web-infra-common";
import { ExpressionScopeKind } from "./type";

export type StrictModeScope =
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

    export function createStrictModeScopeRecorder() {
      
        const strictModeScopes: Array<StrictModeScope> = [];
      
        function record(kind: ExpressionScopeKind, position: SourcePosition) {
          recordForStrictModeFunctionScope(kind, position);
        }
        function recordForStrictModeFunctionScope(kind: ExpressionScopeKind, position: SourcePosition) {
          const scope = strictModeScopes[strictModeScopes.length - 1];
          if (!scope || scope.kind === "RHSLayer") {
            return;
          }
          switch (kind) {
            case ExpressionScopeKind.EvalIdentifier:
              scope.evalIdentifier.push(position);
              break;
            case ExpressionScopeKind.ArgumentsIdentifier:
              scope.argumentsIdentifier.push(position);
              break;
            case ExpressionScopeKind.YieldIdentifier:
              scope.yieldIdentifier.push(position);
              break;
            case ExpressionScopeKind.LetIdentifiier:
              scope.letIdentifier.push(position);
              break;
            case ExpressionScopeKind.PresveredWordIdentifier:
              scope.preservedWordIdentifier.push(position);
              break;
          }
        }
        function isStrictModeScopeViolateStrictMode(scope: StrictModeScope) {
          return (
            scope.kind !== "RHSLayer" &&
            (scope.argumentsIdentifier.length ||
              scope.evalIdentifier.length ||
              scope.yieldIdentifier.length ||
              scope.letIdentifier.length ||
              scope.preservedWordIdentifier.length)
          );
        }
      
        function enterLHSStrictModeScope() {
          strictModeScopes.push({
            kind: "LHSLayer",
            evalIdentifier: [],
            yieldIdentifier: [],
            argumentsIdentifier: [],
            letIdentifier: [],
            preservedWordIdentifier: [],
          });
        }
        function enterRHSStrictModeScope() {
          strictModeScopes.push({
            kind: "RHSLayer",
          });
        }
        function enterCatpureStrictModeScope() {
          strictModeScopes.push({
            kind: "CatpureLayer",
            evalIdentifier: [],
            yieldIdentifier: [],
            argumentsIdentifier: [],
            letIdentifier: [],
            preservedWordIdentifier: [],
          });
        }
        function isInLHS() {
          const scope = strictModeScopes[strictModeScopes.length - 1];
          if (!scope) return false;
          return scope.kind === "LHSLayer";
        }
        function exitStrictModeScope() {
          const source = strictModeScopes.pop();
          if (source?.kind === "RHSLayer") {
            return;
          }
          let target: StrictModeScope | null = null;
          for (const scope of strictModeScopes.reverse()) {
            if (scope.kind === "CatpureLayer") {
              target = scope;
              break;
            }
            if (scope.kind === "RHSLayer") {
              break;
            }
          }
          strictModeScopes.reverse();
          if (target && source) {
            target.argumentsIdentifier = target.argumentsIdentifier.concat(source.argumentsIdentifier);
            target.evalIdentifier = target.evalIdentifier.concat(source.evalIdentifier);
            target.letIdentifier = target.letIdentifier.concat(source.letIdentifier);
            target.yieldIdentifier = target.yieldIdentifier.concat(source.yieldIdentifier);
            target.preservedWordIdentifier = target.preservedWordIdentifier.concat(source.preservedWordIdentifier);
          }
        }
      
        function getCurrentStrictModeScope(): StrictModeScope {
          const scope = strictModeScopes[strictModeScopes.length - 1];
          if (!scope) throw new Error();
          return structuredClone(scope);
        }
      
        return {
          record,
      
          enterLHSStrictModeScope,
          enterRHSStrictModeScope,
          enterCatpureStrictModeScope,
          exitStrictModeScope,
      
          getCurrentStrictModeScope,
          isStrictModeScopeViolateStrictMode,
          isInLHS,
        };
}
      
