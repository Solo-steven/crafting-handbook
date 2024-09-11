import { SourcePosition } from "web-infra-common";

export type DuplicateSymbolResult = SourcePosition | null;

export enum SymbolType {
  Var = "Var",
  Const = "Const",
  Let = "Let",
  Function = "Function",
  GenFunction = "GenFunction",
}

export type NonFunctionalSymbolType = SymbolType.Var | SymbolType.Let | SymbolType.Const;

export type PrivateNameDefKind = "get" | "set" | "other" | "static-get" | "static-set";
export interface ClassSymbolScope {
  kind: "ClassSymbolScope";
  // for private name
  undefinedPrivateName: Map<string, SourcePosition>;
  undefinedPrivateNameKinds: Map<string, Set<PrivateNameDefKind>>;
  definiedPrivateName: Set<string>;
  definedPrivateNameKinds: Map<string, Set<PrivateNameDefKind>>;
  duplicatePrivateName: Map<string, SourcePosition>;
}

interface BasicSymbolScope {
  symbol: Map<string, [SymbolType]>;
  // undefinedSymbol: Set<string>
}

export interface ProgramSymbolScope extends BasicSymbolScope {
  kind: "ProgramSumbolScope";
  exportSymbol: Set<string>;
  undefExportSymbols: Map<string, SourcePosition>;
  duplicateExportSymbols: Set<SourcePosition>;
  haveDefaultExport: boolean;
}

export interface FunctionSymbolScope extends BasicSymbolScope {
  kind: "FunctionSymbolScope";
  params: Set<string>;
  duplicateParams: Set<SourcePosition>;
}

export interface BlockSymbolScope extends BasicSymbolScope {
  kind: "BlockSymbolScope";
}

export type SymbolScope = ProgramSymbolScope | FunctionSymbolScope | BlockSymbolScope | ClassSymbolScope;
export type DeclaratableSymbolScope = ProgramSymbolScope | FunctionSymbolScope | BlockSymbolScope;
export type FunctionalSymbolScope = ProgramSymbolScope | FunctionSymbolScope;

export type SymbolScopeRecorderContext = {
  symbolType: NonFunctionalSymbolType;
  isCatchParam: boolean;
  cahcheNames: Array<string>;
};

export function createSymbolScopeRecorderContext(): SymbolScopeRecorderContext {
  return {
    symbolType: SymbolType.Var,
    isCatchParam: false,
    cahcheNames: [],
  };
}

export function isPrivateNameExist(scope: ClassSymbolScope, name: string, type: PrivateNameDefKind) {
  if (scope.definiedPrivateName.has(name)) {
    switch (type) {
      case "other": {
        const kinds = scope.definedPrivateNameKinds.get(name)!;
        return kinds.size > 0;
      }
      case "set": {
        const kinds = scope.definedPrivateNameKinds.get(name)!;
        return !(kinds.size === 0 || (kinds.size === 1 && kinds.has("get")));
      }
      case "get": {
        const kinds = scope.definedPrivateNameKinds.get(name)!;
        return !(kinds.size === 0 || (kinds.size === 1 && kinds.has("set")));
      }
      case "static-get": {
        const kinds = scope.definedPrivateNameKinds.get(name)!;
        return !(kinds.size === 0 || (kinds.size === 1 && kinds.has("static-set")));
      }
      case "static-set": {
        const kinds = scope.definedPrivateNameKinds.get(name)!;
        return !(kinds.size === 0 || (kinds.size === 1 && kinds.has("static-get")));
      }
    }
  }
  return false;
}
