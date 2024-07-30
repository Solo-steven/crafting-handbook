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
    lexicalScopes.pop();
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

  return {
    // enter and exit scope
    enterProgramLexicalScope,
    exitProgramLexicalScope,
    enterFunctionLexicalScope,
    exitFunctionLexicalScope,
    enterArrowFunctionBodyScope,
    exitArrowFunctionBodyScope,
    enterFunctionLexicalScopeParamemter,
    exitFunctionLexicalScopeParamemter,
    enterClassLexicalScope,
    exitClassLexicalScope,
    enterPropertyName,
    exitPropertyName,
    enterBlockLexicalScope,
    exitBlockLexicalScope,
    // scope condition
    isInParameter,
    isInStrictMode,
    isInTopLevel,
    isDirectToFunctionContext,
    isCurrentFunctionLexicalScopeParameterSimple,
    isParentFunctionAsync,
    isParentFunctionGenerator,
    // await yield condition
    canAwaitParseAsExpression,
    canAwaitParseAsIdentifier,
    canYieldParseAsExpression,
    // setter of scope attribute
    setCurrentFunctionLexicalScopeAsGenerator,
    setCurrentFunctionLexicalScopeAsStrictMode,
    setCurrentFunctionLexicalScopeParameterAsNonSimple,
  };
}
