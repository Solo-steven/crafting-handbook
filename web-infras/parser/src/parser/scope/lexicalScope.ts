export type PrivateNameDefKind = "get" | "set" | "other" | "static-get" | "static-set";
export interface FunctionLexicalScope {
  readonly type: "FunctionLexicalScope";
  readonly isArrow: boolean;
  isAsync: boolean;
  isGenerator: boolean;
  inParameter: boolean;
  isSimpleParameter: boolean;
  inStrict: boolean;
}
export interface ClassLexicalScope {
  readonly type: "ClassLexicalScope";
  isExtend: boolean;
  isInCtor: boolean;
  isInDelete: boolean;
  isInPropertyName: boolean;
  undefinedPrivateName: Set<string>;
  undefinedPrivateNameKinds: Map<string, Set<PrivateNameDefKind>>;
  definiedPrivateName: Set<string>;
  definedPrivateNameKinds: Map<string, Set<PrivateNameDefKind>>;
  duplicatePrivateName: Set<string>;
}

export interface BlockLexicalScope {
  readonly type: "BlockLexicalScope";
}

export type LexicalScope = ClassLexicalScope | FunctionLexicalScope | BlockLexicalScope;


function isPrivateNameExist(scope: ClassLexicalScope, name: string, type: PrivateNameDefKind) {
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


export function createLexicalScopeRecorder() {
  const lexicalScopes: Array<LexicalScope> = [];

  function helperFindParentClassOrFunctionLexicalScope(): FunctionLexicalScope | ClassLexicalScope | null {
    let flag = false;
    for (let index = lexicalScopes.length - 1; index >= 0; --index) {
      const scope = lexicalScopes[index];
      switch (scope.type) {
        case "FunctionLexicalScope":
        case "ClassLexicalScope": {
          if (flag) {
            return scope;
          } else {
            flag = true;
          }
          break;
        }
      }
    }
    return null;
  }
  /**
   * Helper function for other context Private API to get this closest
   * function scope structure in scopeContext.
   * @returns {FunctionContext}
   */
  function helperFindLastFunctionLexicalScope(): FunctionLexicalScope {
    for (let index = lexicalScopes.length - 1; index >= 0; --index) {
      const scopeContext = lexicalScopes[index];
      if (scopeContext.type === "FunctionLexicalScope") {
        return scopeContext;
      }
    }
    // TODO: better error
    throw new Error();
  }
  function helperFindLastClassScope() {
    for (let index = lexicalScopes.length - 1; index >= 0; --index) {
      const scope = lexicalScopes[index];
      if (scope.type === "ClassLexicalScope") {
        return scope;
      }
    }
    return null;
  }
  function helperFindLastClassOrFunctionLexicalScope(): FunctionLexicalScope | ClassLexicalScope {
    for (let index = lexicalScopes.length - 1; index >= 0; --index) {
      const scope = lexicalScopes[index];
      if (scope.type === "ClassLexicalScope") {
        return scope;
      }
      if (scope.type === "FunctionLexicalScope") {
        return scope;
      }
    }
    // TODO: better error
    throw new Error();
  }

  function enterProgramLexicalScope() {
    lexicalScopes.push({
      type: "FunctionLexicalScope",
      isArrow: false,
      isAsync: false,
      isGenerator: false,
      inParameter: false,
      inStrict: false,
      isSimpleParameter: true,
    });
  }
  function exitProgramLexicalScope() {
    lexicalScopes.pop();
  }
  /**
   * Private API called when enter function scope. when parse
   * - **Function delcaration or expression** : called`parseFunction` api, which is called by
   * `parseFunctionDeclaration` and `parseFunctionExpression`
   * - **method of class or object** : parseMethodDefintion.
   *
   * need to call this function and give this flag of is this function
   * a async or generator
   * @param {boolean} isAsync
   * @param {boolean} isGenerator
   */
  function enterFunctionLexicalScope(isAsync: boolean, isGenerator: boolean) {
    const lastFunctionScope = helperFindLastFunctionLexicalScope();
    const lastClassScope = helperFindLastClassScope();
    lexicalScopes.push({
      type: "FunctionLexicalScope",
      isArrow: false,
      isAsync,
      isGenerator,
      inParameter: false,
      inStrict: lastClassScope ? true : lastFunctionScope.inStrict,
      isSimpleParameter: true,
    });
  }
  function exitFunctionLexicalScope() {
    lexicalScopes.pop();
  }
  function enterArrowFunctionBodyScope(isAsync: boolean) {
    const lastFunctionScope = helperFindLastFunctionLexicalScope();
    const lastClassScope = helperFindLastClassScope();
    lexicalScopes.push({
      type: "FunctionLexicalScope",
      isArrow: true,
      isAsync,
      isGenerator: false,
      inParameter: false,
      inStrict: lastClassScope ? true : lastFunctionScope.inStrict,
      isSimpleParameter: true,
    });
  }
  function exitArrowFunctionBodyScope() {
    lexicalScopes.pop();
  }
  function enterFunctionLexicalScopeParamemter() {
    const scope = helperFindLastFunctionLexicalScope();
    scope.inParameter = true;
  }
  function exitFunctionLexicalScopeParamemter() {
    const scope = helperFindLastFunctionLexicalScope();
    scope.inParameter = false;
  }
  function setCurrentFunctionLexicalScopeAsGenerator() {
    const scope = helperFindLastFunctionLexicalScope();
    scope.isGenerator = true;
  }
  function setCurrentFunctionLexicalScopeAsStrictMode() {
    const scope = helperFindLastFunctionLexicalScope();
    scope.inStrict = true;
  }
  /**
   * Private API called when parse function, since `function` keyword is argument lisr,
   * so when we called `parseFunction` parser api, we not know is this function's argument
   * is simple or not, this api is design to solve this problem, set current function param
   * is not simple.
   */
  function setCurrentFunctionLexicalScopeParameterAsNonSimple() {
    const scope = helperFindLastFunctionLexicalScope();
    scope.isSimpleParameter = false;
  }
  /**
   * Private API to know is current function's param is simple.
   * @returns {boolean}
   */
  function isCurrentFunctionLexicalScopeParameterSimple(): boolean {
    const scope = helperFindLastFunctionLexicalScope();
    return scope.isSimpleParameter;
  }
  function isInTopLevel() {
    for (let index = lexicalScopes.length - 1; index >= 0; --index) {
      const scope = lexicalScopes[index];
      if (scope.type === "FunctionLexicalScope" && scope.isArrow === false) {
        return scope === lexicalScopes[0];
      }
    }
    // TODO: better unreach error
    throw new Error();
  }

  function enterBlockLexicalScope() {
    lexicalScopes.push({ type: "BlockLexicalScope" });
  }
  function exitBlockLexicalScope() {
    lexicalScopes.pop();
  }
  function enterClassLexicalScope(isExtend: boolean) {
    lexicalScopes.push({
      type: "ClassLexicalScope",
      isExtend,
      isInCtor: false,
      isInDelete: false,
      isInPropertyName: false,
      undefinedPrivateName: new Set(),
      undefinedPrivateNameKinds: new Map(),
      definiedPrivateName: new Set(),
      definedPrivateNameKinds: new Map(),
      duplicatePrivateName: new Set(),
    });
  }
  function exitClassLexicalScope() {
    const currentScope = lexicalScopes.pop() as ClassLexicalScope;
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
  function enterPropertyName() {
    const scope = helperFindLastClassScope();
    if (scope) {
      scope.isInPropertyName = true;
    }
  }
  function exitPropertyName() {
    const scope = helperFindLastClassScope();
    if (scope) {
      scope.isInPropertyName = false;
    }
  }
  function enterCtor() {
    const scope = helperFindLastClassScope();
    if (scope) {
      scope.isInCtor = true;
    }
  }
  function exitCtor() {
    const scope = helperFindLastClassScope();
    if (scope) {
      scope.isInCtor = false;
    }
  }
  function enterDelete() {
    const scope = helperFindLastClassScope();
    if (scope) {
      scope.isInDelete = true;
    }
  }
  function exitDelete() {
    const scope = helperFindLastClassScope();
    if (scope) {
      scope.isInDelete = false;
    }
  }
  /**
   *
   */
  function canAwaitParseAsExpression() {
    const scope = helperFindLastClassOrFunctionLexicalScope();
    switch (scope.type) {
      case "FunctionLexicalScope":
        return scope.isAsync;
      case "ClassLexicalScope": {
        if (!scope.isInPropertyName) {
          return false;
        }
        const parentScope = helperFindParentClassOrFunctionLexicalScope();
        if (!parentScope) return false;
        switch (parentScope.type) {
          case "ClassLexicalScope":
            return false;
          case "FunctionLexicalScope":
            return parentScope.isAsync;
        }
      }
    }
  }

  function canYieldParseAsExpression() {
    const scope = helperFindLastClassOrFunctionLexicalScope();
    switch (scope.type) {
      case "FunctionLexicalScope":
        return scope.isGenerator;
      case "ClassLexicalScope": {
        if (!scope.isInPropertyName) {
          return false;
        }
        const parentScope = helperFindParentClassOrFunctionLexicalScope();
        if (!parentScope) return false;
        switch (parentScope.type) {
          case "ClassLexicalScope":
            return false;
          case "FunctionLexicalScope":
            return parentScope.isGenerator;
        }
      }
    }
  }

  function canAwaitParseAsIdentifier() {
    const scope = helperFindLastClassOrFunctionLexicalScope();
    switch (scope.type) {
      case "FunctionLexicalScope":
        return scope.isAsync;
      case "ClassLexicalScope": {
        if (!scope.isInPropertyName) {
          return false;
        }
        const parentScope = helperFindParentClassOrFunctionLexicalScope();
        if (!parentScope) return false;
        switch (parentScope.type) {
          case "ClassLexicalScope":
            return false;
          case "FunctionLexicalScope":
            return parentScope.isAsync;
        }
      }
    }
  }

  /**
   * Private API to know is current recursion parse in the
   * function param or not (used by yeild and await)
   * @returns
   */
  function isInParameter(): boolean {
    const scope = lexicalScopes[lexicalScopes.length - 1];
    return scope.type === "FunctionLexicalScope" && scope.inParameter;
  }

  function isInStrictMode() {
    for (let index = lexicalScopes.length - 1; index >= 0; --index) {
      const scope = lexicalScopes[index];
      switch (scope.type) {
        case "ClassLexicalScope":
          return true;
        case "FunctionLexicalScope":
          return scope.inStrict;
        default:
          continue;
      }
    }
    throw new Error("[Unreach]");
  }
  function isDirectToFunctionContext(): boolean {
    return lexicalScopes[lexicalScopes.length - 1].type === "FunctionLexicalScope";
  }
  /**
   * Private API to know is parent function scope
   * is async, used by parse function name.
   * @returns {boolean}
   */
  function isParentFunctionAsync(): boolean {
    const parentScope = helperFindParentClassOrFunctionLexicalScope();
    if (!parentScope) return false;
    switch (parentScope.type) {
      case "FunctionLexicalScope":
        return parentScope.isAsync;
      case "ClassLexicalScope":
        return false;
    }
  }
  /**
   * Private API to know is parent function scope
   * is generator, used by parse function name.
   * @returns {boolean}
   */
  function isParentFunctionGenerator(): boolean {
    const parentScope = helperFindParentClassOrFunctionLexicalScope();
    if (!parentScope) return false;
    switch (parentScope.type) {
      case "FunctionLexicalScope":
        return parentScope.isGenerator;
      case "ClassLexicalScope":
        return false;
    }
  }
  function isInCtor() {
    const scope = helperFindLastClassScope();
    if (scope) {
      return scope.isInCtor;
    }
    return false;
  }
  function isInClassScope() {
    const scope = helperFindLastClassScope();
    return !!scope
  }
  function isCurrentClassExtend() {
    const scope = helperFindLastClassScope();
    return !!scope && scope.isExtend;
  }
  function isCurrentInDelete() {
    const scope = helperFindLastClassScope();
    if (scope) {
      return scope.isInDelete;
    }
    return false;
  }
  function isDuplicatePrivateName() {
    const scope = helperFindLastClassScope();
    if (scope && scope.duplicatePrivateName.size > 0) {
      return scope.duplicatePrivateName;
    }
    return null;
  }
  function isUndeinfedPrivateName() {
    const scope = helperFindLastClassScope();
    let parentScope: ClassLexicalScope | null = null, flag = false;
    for(let index = lexicalScopes.length-1; index >= 0 ; --index) {
      const scope = lexicalScopes[index];
      if(scope.type === "ClassLexicalScope") {
        if(flag) {
          parentScope = scope;
          break;
        }else {
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
    let scope: ClassLexicalScope | null = null;
    for (const s of lexicalScopes) {
      if(s.type === "ClassLexicalScope") {
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
  return {
    /**
     * Enter and Exit Scope or Scope attribute
     */
    // for functions
    enterProgramLexicalScope,
    exitProgramLexicalScope,
    enterFunctionLexicalScope,
    exitFunctionLexicalScope,
    enterArrowFunctionBodyScope,
    exitArrowFunctionBodyScope,
    enterFunctionLexicalScopeParamemter,
    exitFunctionLexicalScopeParamemter,
    // for blocks
    enterBlockLexicalScope,
    exitBlockLexicalScope,
    // for class
    enterClassLexicalScope,
    exitClassLexicalScope,
    enterPropertyName,
    exitPropertyName,
    enterCtor,
    exitCtor,
    enterDelete,
    exitDelete,
    /**
     * Scope condition
     */
    // for function
    isInStrictMode,
    isInTopLevel,
    isDirectToFunctionContext,
    isInParameter,
    isCurrentFunctionLexicalScopeParameterSimple,
    isParentFunctionAsync,
    isParentFunctionGenerator,
    // for class
    isInCtor,
    isInClassScope,
    isCurrentClassExtend,
    isCurrentInDelete,
    /**
     * Await and Yield condition
     */
    canAwaitParseAsExpression,
    canAwaitParseAsIdentifier,
    canYieldParseAsExpression,
    /**
     * Setter for function scope
     */
    setCurrentFunctionLexicalScopeAsGenerator,
    setCurrentFunctionLexicalScopeAsStrictMode,
    setCurrentFunctionLexicalScopeParameterAsNonSimple,
    /**
     * Private useage for class scope
     */
    defPrivateName,
    usePrivateName,
    isDuplicatePrivateName,
    isUndeinfedPrivateName,
  };
}
