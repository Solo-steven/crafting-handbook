import {
  FunctionSymbolScope,
  ProgramSymbolScope,
  SymbolScope,
  SymbolType,
  createSymbolScopeRecorderContext,
} from "./type";
/**
 * Symbol recorder is used to check the duplicate identifier, it should work the the lexical
 * scope recorder for position relate context in program.
 * @returns
 */
export function createSymbolScopeRecorder() {
  const symbolScopes: Array<SymbolScope> = [];
  const context = createSymbolScopeRecorderContext();
  /**
   * Enter Pre block, which mean the head of forStatement
   * and the catch paran of catch statement.
   */
  function enterPreBlockScope() {
    symbolScopes.push({
      kind: "BlockSymbolScope",
      symbol: new Map(),
    });
  }
  function setIndexOfEndTokenOfPreBlockScope(index: number) {
    context.lastTokenIndex = index;
  }
  /**
   * Enter program scope
   */
  function enterProgramSymbolScope() {
    symbolScopes.push({
      kind: "ProgramSumbolScope",
      exportDefaultSymbol: false,
      exportSymbol: new Set(),
      duplicateExportSymbols: new Set(),
      symbol: new Map(),
      //undefinedSymbol: new Map,
    });
  }
  /**
   * Enter function  scope
   */
  function enterFunctionSymbolScope() {
    symbolScopes.push({
      kind: "FunctionSymbolScope",
      symbol: new Map(),
      params: new Set(),
      duplicateParams: new Set(),
    });
  }
  /**
   * Enter block scope
   */
  function enterBlockSymbolScope(lastTokenIndex: number) {
    if (context.lastTokenIndex === lastTokenIndex) {
      return;
    }
    symbolScopes.push({
      kind: "BlockSymbolScope",
      symbol: new Map(),
    });
  }
  /**
   * Exit scope
   */
  function exitSymbolScope() {
    return symbolScopes.pop();
  }
  /**
   * Helper to get the closed functional scope, which could possible be function or global scope.
   * since the programSymbolScope will be the last one of scope, this function will always find a
   * scope.
   *
   */
  function helperFindClosedFunctionalScope(): FunctionSymbolScope | ProgramSymbolScope {
    for (let index = symbolScopes.length - 1; index >= 0; --index) {
      const scope = symbolScopes[index];
      if (scope.kind === "FunctionSymbolScope" || scope.kind === "ProgramSumbolScope") {
        return scope;
      }
    }
    // unreach part
    throw new Error();
  }
  /**
   * Helper to get the last scope.
   * @returns {SymbolScope}
   */
  function helperFindClosedSymbolScope(): SymbolScope {
    return symbolScopes[symbolScopes.length - 1]!;
  }
  /**
   * Helper to try insert a symbol to scope, return true if sucess
   * return false if failed(duplicate).
   */
  function helperTryInsertSymbolToScope(scope: SymbolScope, name: string, type: SymbolType) {
    const existedSymbols = scope.symbol.get(name);
    const isDeclarateInParam = scope.kind === "FunctionSymbolScope" && scope.params.has(name);
    switch (type) {
      case SymbolType.Const:
      case SymbolType.Let: {
        if (existedSymbols || isDeclarateInParam) {
          return false;
        }
        scope.symbol.set(name, [type]);
        return true;
      }
      case SymbolType.Var: {
        if (!existedSymbols) {
          scope.symbol.set(name, [type]);
          return true;
        }
        // for VariableDeclarationStatement, it is ok to duplicate a identifier, if the identifier is
        // also declarate under VariableDeclarationStatement or in param, otherwise, it should be a error
        return type === SymbolType.Var && existedSymbols.length === 1 && existedSymbols[0] === SymbolType.Var;
      }
    }
  }
  /**
   * Public API to declarate a identifier as export identifier, which
   * also is  a local variable.
   * @param {string} name
   */
  function declarateExportSymbol(name: string) {
    const programScope = symbolScopes[0] as ProgramSymbolScope;
    if (programScope.exportSymbol.has(name)) {
      programScope.duplicateExportSymbols.add(name);
    } else {
      programScope.exportSymbol.add(name);
    }
  }
  /**
   * Public API to declarate a identifier from `VarableDeclarationStatement`.
   * return a bool to indicate success or not (the identifier is duplicate is failed)
   * @param {string} name
   * @returns {boolean}
   */
  function declarateVarSymbol(name: string): boolean {
    const functionalScope = helperFindClosedFunctionalScope();
    return helperTryInsertSymbolToScope(functionalScope, name, SymbolType.Var);
  }
  /**
   * Public API to declarate a identifier in `LexicalDeclaration` with let binding
   * return a bool to indicate success or not (the identifier is duplicate is failed)
   * @param {string} name
   * @returns {boolean}
   */
  function declarateLetSymbol(name: string): boolean {
    const symbolScope = helperFindClosedSymbolScope();
    return helperTryInsertSymbolToScope(symbolScope, name, SymbolType.Let);
  }
  /**
   * Public API to declarate a identifier in `LexicalDeclaration` with const binding
   * return a bool to indicate success or not (the identifier is duplicate is failed)
   * @param {string} name
   * @returns {boolean}
   */
  function declarateConstSymbol(name: string): boolean {
    const symbolScope = helperFindClosedSymbolScope();
    return helperTryInsertSymbolToScope(symbolScope, name, SymbolType.Const);
  }
  /**
   * Declarate a param in function scope, it will not check the duplication or not.
   * since not all JavaScript context need to check the duplication.
   * @param {string} name
   */
  function declarateParam(name: string) {
    const functionalScope = helperFindClosedFunctionalScope();
    if (functionalScope.kind === "FunctionSymbolScope") {
      if (functionalScope.params.has(name)) {
        functionalScope.duplicateParams.add(name);
      } else {
        functionalScope.params.add(name);
      }
    }
  }
  /**
   *
   */
  function isFunctionParamDuplicate() {
    const functionalScope = helperFindClosedFunctionalScope();
    return functionalScope.kind === "FunctionSymbolScope" && functionalScope.duplicateParams.size > 0;
  }
  return {
    // enter and exsit scope
    enterPreBlockScope,
    enterProgramSymbolScope,
    enterFunctionSymbolScope,
    enterBlockSymbolScope,
    exitSymbolScope,
    // set the pre scope context
    setIndexOfEndTokenOfPreBlockScope,
    // declarate symbol.
    declarateVarSymbol,
    declarateConstSymbol,
    declarateLetSymbol,
    declarateParam,
    declarateExportSymbol,
    isFunctionParamDuplicate,
  };
}
