export enum SymbolType {
  Var,
  Const,
  Let,
  Function,
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

export type SymbolScope = ProgramSymbolScope | FunctionSymbolScope | BlockSymbolScope;

export type SymbolScopeRecorderContext = {
  lastTokenIndex: number;
};

export function createSymbolScopeRecorderContext(): SymbolScopeRecorderContext {
  return {
    lastTokenIndex: -1,
  };
}
