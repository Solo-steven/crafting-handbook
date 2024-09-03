export enum SymbolType {
  Var,
  Const,
  Let,
  Function,
}
export type PrivateNameDefKind = "get" | "set" | "other" | "static-get" | "static-set";
export interface ClassSymbolScope {
  kind: "ClassSymbolScope";
  // for private name
  undefinedPrivateName: Set<string>;
  undefinedPrivateNameKinds: Map<string, Set<PrivateNameDefKind>>;
  definiedPrivateName: Set<string>;
  definedPrivateNameKinds: Map<string, Set<PrivateNameDefKind>>;
  duplicatePrivateName: Set<string>;
}

interface BasicSymbolScope {
  symbol: Map<string, [SymbolType]>;
  // undefinedSymbol: Set<string>
}

export interface ProgramSymbolScope extends BasicSymbolScope {
  kind: "ProgramSumbolScope";
  exportSymbol: Set<string>;
  duplicateExportSymbols: Set<string>;
  exportDefaultSymbol: string | boolean;
  haveDefaultExport: boolean;
}

export interface FunctionSymbolScope extends BasicSymbolScope {
  kind: "FunctionSymbolScope";
  params: Set<string>;
  duplicateParams: Set<string>;
}

export interface BlockSymbolScope extends BasicSymbolScope {
  kind: "BlockSymbolScope";
}

export type SymbolScope = ProgramSymbolScope | FunctionSymbolScope | BlockSymbolScope | ClassSymbolScope;
export type DeclaratableScope = ProgramSymbolScope | FunctionSymbolScope | BlockSymbolScope;

export type SymbolScopeRecorderContext = {
  lastTokenIndex: number;
};

export function createSymbolScopeRecorderContext(): SymbolScopeRecorderContext {
  return {
    lastTokenIndex: -1,
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
