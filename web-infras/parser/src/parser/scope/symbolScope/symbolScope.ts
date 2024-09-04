import {
  ClassSymbolScope,
  DeclaratableScope,
  FunctionSymbolScope,
  NonFunctionalSymbolType,
  PrivateNameDefKind,
  ProgramSymbolScope,
  SymbolScope,
  SymbolType,
  createSymbolScopeRecorderContext,
  isPrivateNameExist,
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
   * Enter program scope
   */
  function enterProgramSymbolScope() {
    symbolScopes.push({
      kind: "ProgramSumbolScope",
      exportSymbol: new Set(),
      undefExportSymbols: new Set(),
      duplicateExportSymbols: new Set(),
      haveDefaultExport: false,
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
  function enterBlockSymbolScope() {
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
  function enterClassSymbolScope() {
    symbolScopes.push({
      kind: "ClassSymbolScope",
      undefinedPrivateName: new Set(),
      undefinedPrivateNameKinds: new Map(),
      definiedPrivateName: new Set(),
      definedPrivateNameKinds: new Map(),
      duplicatePrivateName: new Set(),
    });
  }
  function exitClassSymbolScope() {
    const currentScope = symbolScopes.pop() as ClassSymbolScope;
    const parentScope = helperFindLastClassScope();
    if (currentScope && parentScope) {
      parentScope.undefinedPrivateName = new Set([
        ...parentScope.undefinedPrivateName.values(),
        ...currentScope.undefinedPrivateName.values(),
      ]);
      parentScope.undefinedPrivateNameKinds = new Map([
        ...parentScope.undefinedPrivateNameKinds.entries(),
        ...currentScope.undefinedPrivateNameKinds.entries(),
      ]);
    }
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
  function helperFindClosedDeclaratableSymbolScope(): DeclaratableScope {
    for (let index = symbolScopes.length - 1; index >= 0; --index) {
      const scope = symbolScopes[index];
      if (scope.kind === "ClassSymbolScope") {
        continue;
      }
      return scope;
    }
    throw new Error("unreach");
  }
  /**
   *
   * @returns
   */
  function helperFindLastClassScope(): ClassSymbolScope | null {
    for (let index = symbolScopes.length - 1; index >= 0; --index) {
      const scope = symbolScopes[index];
      if (scope.kind === "ClassSymbolScope") {
        return scope;
      }
    }
    return null;
  }
  function helperIsOnlySymbolKind(existedSymbols: [SymbolType], expectType: SymbolType) {
    return existedSymbols.length === 1 && existedSymbols[0] === expectType;
  }
  /**
   * Helper to try insert a symbol to scope, return true if sucess
   * return false if failed(duplicate).
   */
  function helperTryInsertDeclaratableSymbolToScope(
    scope: DeclaratableScope,
    name: string,
    type: SymbolType,
  ): boolean {
    const existedSymbols = scope.symbol.get(name);
    const isDeclarateInParam = scope.kind === "FunctionSymbolScope" && scope.params.has(name);
    switch (type) {
      case SymbolType.Const:
      case SymbolType.Let: {
        if (isDeclarateInParam) {
          return false;
        }

        if (existedSymbols) {
          // if (!helperIsOnlySymbolKind(existedSymbols, SymbolType.Function)) {
          //   return false;
          // }
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
        return (
          helperIsOnlySymbolKind(existedSymbols, SymbolType.Var) ||
          (helperIsOnlySymbolKind(existedSymbols, SymbolType.Function) &&
            (scope.kind === "FunctionSymbolScope" || scope.kind === "ProgramSumbolScope"))
        );
      }
      default: {
        throw new Error("Unreach");
      }
    }
  }
  /**
   * Public API to declarate a identifier as export identifier, which
   * also is  a local variable.
   * @param {string} name
   */
  function declarateExportSymbol(name: string): boolean {
    const programScope = symbolScopes[0] as ProgramSymbolScope;
    if (programScope.exportSymbol.has(name)) {
      programScope.duplicateExportSymbols.add(name);
      return false;
    } else {
      programScope.exportSymbol.add(name);
      return true;
    }
  }
  /**
   * Public API for check is identifier is already def the
   */
  function isVariableDeclarated(name: string): boolean {
    const scope = helperFindClosedDeclaratableSymbolScope();
    return scope.symbol.has(name);
  }
  function addToUndefExportSource(name: string) {
    const programScope = symbolScopes[0] as ProgramSymbolScope;
    programScope.undefExportSymbols.add(name);
  }
  function isProgramContainUndefSymbol(): boolean {
    const programScope = symbolScopes[0] as ProgramSymbolScope;
    for (const symbol of programScope.undefExportSymbols) {
      if (!programScope.symbol.has(symbol)) {
        return true;
      }
    }
    return false;
  }
  function enterCatchParam() {
    context.isCatchParam = true;
  }
  function setCatchParamTo(type: SymbolType.Let | SymbolType.Var) {
    let isSucess = true;
    for (const name of context.cahcheNames) {
      const scope = helperFindClosedDeclaratableSymbolScope();
      isSucess = helperTryInsertDeclaratableSymbolToScope(scope, name, type) && isSucess;
    }
    context.cahcheNames = [];
    context.isCatchParam = false;
    return isSucess;
  }
  /**
   * Test is default export already exist, if yes return false
   * otherwise set flag and return true
   * @returns {bool} isSuccess
   */
  function testAndSetDefaultExport(): boolean {
    const programScope = symbolScopes[0] as ProgramSymbolScope;
    const result = programScope.haveDefaultExport;
    programScope.haveDefaultExport = true;
    return !result;
  }
  /**
   * Public API to declarate a identifier from `VarableDeclarationStatement`.
   * return a bool to indicate success or not (the identifier is duplicate is failed)
   * @param {string} name
   * @returns {boolean}
   */
  function declarateVarSymbol(name: string): boolean {
    const functionalScope = helperFindClosedFunctionalScope();
    const symbolScope = helperFindClosedDeclaratableSymbolScope();
    if (functionalScope === symbolScope) {
      return helperTryInsertDeclaratableSymbolToScope(functionalScope, name, SymbolType.Var);
    }
    const scopeNeedDeclarate: DeclaratableScope[] = [];
    for (let index = symbolScopes.length - 1; index >= 0; --index) {
      const scope = symbolScopes[index];
      if (scope === functionalScope) {
        scopeNeedDeclarate.push(scope);
        break;
      }
      if (scope === symbolScope) {
        scopeNeedDeclarate.push(scope);
        continue;
      }
      if (scopeNeedDeclarate.length > 0) {
        if (scope.kind !== "ClassSymbolScope") {
          scopeNeedDeclarate.push(scope);
        }
      }
    }
    const boolRef = { value: true };
    scopeNeedDeclarate.reduce((ref, scope) => {
      ref.value = helperTryInsertDeclaratableSymbolToScope(scope, name, SymbolType.Var) && ref.value;
      return ref;
    }, boolRef);
    return boolRef.value;
  }
  /**
   * Public API to declarate a identifier in `LexicalDeclaration` with let binding
   * return a bool to indicate success or not (the identifier is duplicate is failed)
   * @param {string} name
   * @returns {boolean}
   */
  function declarateLetSymbol(name: string): boolean {
    if (context.isCatchParam) {
      context.cahcheNames.push(name);
      return true;
    }
    const symbolScope = helperFindClosedDeclaratableSymbolScope();
    return helperTryInsertDeclaratableSymbolToScope(symbolScope, name, SymbolType.Let);
  }
  /**
   * Public API to declarate a identifier in `LexicalDeclaration` with const binding
   * return a bool to indicate success or not (the identifier is duplicate is failed)
   * @param {string} name
   * @returns {boolean}
   */
  function declarateConstSymbol(name: string): boolean {
    if (context.isCatchParam) {
      context.cahcheNames.push(name);
      return true;
    }
    const symbolScope = helperFindClosedDeclaratableSymbolScope();
    return helperTryInsertDeclaratableSymbolToScope(symbolScope, name, SymbolType.Const);
  }
  /**
   * Public API to declarate a identifier as function name.
   * @param {string} name
   */
  function declarateFuncrtionSymbol(name: string) {
    if (context.isCatchParam) {
      context.cahcheNames.push(name);
      return null;
    }
    const scope = helperFindClosedDeclaratableSymbolScope();
    const existedSymbols = scope.symbol.get(name);
    // const isDeclarateInParam = scope.kind === "FunctionSymbolScope" && scope.params.has(name);
    if (!existedSymbols) {
      scope.symbol.set(name, [SymbolType.Function]);
      return null;
    }
    return existedSymbols[0];
  }
  function declarateSymbol(name: string) {
    if (context.isCatchParam) {
      context.cahcheNames.push(name);
      return true;
    }
    switch (context.symbolType) {
      case SymbolType.Let: {
        return declarateLetSymbol(name);
      }
      case SymbolType.Const: {
        return declarateConstSymbol(name);
      }
      case SymbolType.Var: {
        return declarateVarSymbol(name);
      }
      // case SymbolType.Function: {
      //   return declarateFuncrtionSymbol(name);
      // }
    }
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
  /**=============================================
   * Class Scope private name
   * =============================================
   */
  function defPrivateName(name: string, type: PrivateNameDefKind = "other") {
    const scope = helperFindLastClassScope();
    let isDuplicate = false;
    if (scope) {
      if (isPrivateNameExist(scope, name, type)) {
        scope.duplicatePrivateName.add(name);
        isDuplicate = true;
      }
      scope.definiedPrivateName.add(name);
      if (scope.definedPrivateNameKinds.has(name)) {
        const kinds = scope.definedPrivateNameKinds.get(name)!;
        kinds.add(type);
      } else {
        scope.definedPrivateNameKinds.set(name, new Set([type]));
      }
      if (scope.undefinedPrivateName.has(name)) {
        const kinds = scope.undefinedPrivateNameKinds.get(name)!;
        if (kinds.has(type)) {
          if (kinds.size == 1) {
            scope.undefinedPrivateName.delete(name);
            scope.undefinedPrivateNameKinds.delete(name);
          } else {
            kinds.delete(type);
          }
        }
      }
    }
    return isDuplicate;
  }
  function usePrivateName(name: string, type: PrivateNameDefKind = "other") {
    let scope: ClassSymbolScope | null = null;
    for (const s of symbolScopes) {
      if (s.kind === "ClassSymbolScope") {
        scope = s;
        if (isPrivateNameExist(scope, name, type)) {
          return;
        }
      }
    }
    if (scope) {
      scope.undefinedPrivateName.add(name);
      if (scope.undefinedPrivateNameKinds.has(name)) {
        const kinds = scope.undefinedPrivateNameKinds.get(name)!;
        kinds.add(type);
      } else {
        scope.undefinedPrivateNameKinds.set(name, new Set([type]));
      }
    }
  }
  function isUndeinfedPrivateName() {
    const scope = helperFindLastClassScope();
    let parentScope: ClassSymbolScope | null = null,
      flag = false;
    for (let index = symbolScopes.length - 1; index >= 0; --index) {
      const scope = symbolScopes[index];
      if (scope.kind === "ClassSymbolScope") {
        if (flag) {
          parentScope = scope;
          break;
        } else {
          flag = true;
        }
      }
    }
    if (scope && scope.undefinedPrivateName.size > 0) {
      if (parentScope) {
        return null;
      }
      return scope.undefinedPrivateName;
    }
    return null;
  }
  function isDuplicatePrivateName() {
    const scope = helperFindLastClassScope();
    if (scope && scope.duplicatePrivateName.size > 0) {
      return scope.duplicatePrivateName;
    }
    return null;
  }
  function setSymbolType(symbolType: NonFunctionalSymbolType) {
    context.symbolType = symbolType;
  }
  function getSymbolType(): SymbolType {
    return context.symbolType;
  }
  return {
    // enter and exsit scope
    enterProgramSymbolScope,
    enterFunctionSymbolScope,
    enterBlockSymbolScope,
    exitSymbolScope,
    enterClassSymbolScope,
    exitClassSymbolScope,
    // for catch scope
    enterCatchParam,
    setCatchParamTo,
    // declarate symbol.
    declarateVarSymbol,
    declarateConstSymbol,
    declarateLetSymbol,
    declarateFuncrtionSymbol,
    declarateSymbol,
    declarateParam,
    isFunctionParamDuplicate,
    isVariableDeclarated,
    addToUndefExportSource,
    isProgramContainUndefSymbol,
    setSymbolType,
    getSymbolType,
    // export declarate
    declarateExportSymbol,
    testAndSetDefaultExport,
    // private name
    defPrivateName,
    usePrivateName,
    isDuplicatePrivateName,
    isUndeinfedPrivateName,
  };
}
