import type {
  LexicalScope,
  FunctionLexicalScope,
  ClassLexicalScope,
  BlockType,
  PrivateNameDefKind,
} from "./type";
import { isPrivateNameExist } from "./type";

/**
 * Lexical Scope Recorder is focus on the position of the current
 * parse position, is it in function, what kind of function ?, is in
 * class ? ...etc.
 * @returns
 */
export function createLexicalScopeRecorder() {
  const lexicalScopes: Array<LexicalScope> = [];
  const labelSet = new Set<string>();
  /**=============================================
   * Helper function
   * =============================================
   */
  /**
   *
   * @returns
   */
  function helperFindParentClassOrFunctionLexicalScope(): FunctionLexicalScope | ClassLexicalScope {
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
    throw new Error();
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
  /**
   *
   * @returns
   */
  function helperFindLastClassScope() {
    for (let index = lexicalScopes.length - 1; index >= 0; --index) {
      const scope = lexicalScopes[index];
      if (scope.type === "ClassLexicalScope") {
        return scope;
      }
    }
    return null;
  }
  /**
   *
   * @returns
   */
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
  /**=============================================
   * Enter and Exit functions
   * =============================================
   */
  /**
   * Private API called when start parse moduleItem in `parseProgram`, different from
   * `enterFunctionScope`, it will not find parent scope, since it not exist.
   */
  function enterProgramLexicalScope(isAsync: boolean, inStrict: boolean) {
    lexicalScopes.push({
      type: "FunctionLexicalScope",
      isArrow: false,
      isAsync,
      isGenerator: false,
      inParameter: false,
      inStrict,
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
  /**
   * Private API called  when exist a function scope, refer to
   * `enterFunctionScope` comment
   */
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
  /**
   * Private API called when parse function param, since we should ban
   * await expression and yeild expression in function param, event if
   * function is async or generator.
   */
  function enterFunctionLexicalScopeParamemter() {
    const scope = helperFindLastFunctionLexicalScope();
    scope.inParameter = true;
  }
  /**
   * Private API called when finish parse function param, reason please
   * refer to `enterFunctionParameter`
   */
  function exitFunctionLexicalScopeParamemter() {
    const scope = helperFindLastFunctionLexicalScope();
    scope.inParameter = false;
  }
  /**
   * Private API called when enter this block scope.
   * this function only called when `parseBlockStatement`.
   */
  function enterBlockLexicalScope() {
    lexicalScopes.push({ type: "BlockLexicalScope" });
  }
  /**
   * Private APII called when enter this block scope.
   * this function only called when `parseBlockStatement`.
   */
  function exitBlockLexicalScope() {
    lexicalScopes.pop();
  }
  // return boolean to indicate is label exist.
  function enterVirtualBlockScope(blockType: BlockType, labelName?: string): boolean {
    let isLabelAlreadyExist = false;
    if (labelName) {
      isLabelAlreadyExist = labelSet.has(labelName);
      labelSet.add(labelName);
    }
    lexicalScopes.push({ type: "VirtualLexicalScope", blockType, labelName });
    return isLabelAlreadyExist;
  }
  function exitVirtualBlockScope() {
    const virtualScope = lexicalScopes.pop();
    if (virtualScope?.type === "VirtualLexicalScope" && virtualScope.blockType === "Label") {
      const labelName = virtualScope.labelName as string;
      labelSet.delete(labelName);
    }
  }
  function isBreakValidate() {
    for (let index = lexicalScopes.length - 1; index >= 0; --index) {
      const scope = lexicalScopes[index];
      switch (scope.type) {
        case "FunctionLexicalScope":
        case "ClassLexicalScope":
          return false;
        case "BlockLexicalScope":
          continue;
        case "VirtualLexicalScope": {
          return true;
        }
      }
    }
    return false;
  }
  function isContinueValidate() {
    for (let index = lexicalScopes.length - 1; index >= 0; --index) {
      const scope = lexicalScopes[index];
      switch (scope.type) {
        case "FunctionLexicalScope":
        case "ClassLexicalScope":
          return false;
        case "BlockLexicalScope":
          continue;
        case "VirtualLexicalScope": {
          if (scope.blockType === "Loop") return true;
          continue;
        }
      }
    }
    return false;
  }
  function canLabelReach(name: string) {
    for (let index = lexicalScopes.length - 1; index >= 0; --index) {
      const scope = lexicalScopes[index];
      switch (scope.type) {
        case "FunctionLexicalScope":
        case "ClassLexicalScope":
          return false;
        case "BlockLexicalScope":
          continue;
        case "VirtualLexicalScope": {
          if (scope.blockType === "Label" && scope.labelName === name) return true;
          continue;
        }
      }
    }
    return false;
  }
  /**
   * Private API called when start parse class scope.
   * @param {boolean} isExtend
   */
  function enterClassLexicalScope(isExtend: boolean) {
    lexicalScopes.push({
      type: "ClassLexicalScope",
      isExtend,
      isInCtor: false,
      haveCtor: false,
      isInDelete: false,
      isInPropertyName: false,
      undefinedPrivateName: new Set(),
      undefinedPrivateNameKinds: new Map(),
      definiedPrivateName: new Set(),
      definedPrivateNameKinds: new Map(),
      duplicatePrivateName: new Set(),
    });
  }
  /**
   * Private API called when finish parse class scope.
   */
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
  /**=============================================
   * Await and Yield Condition
   * =============================================
   */
  /**
   * Private API to know is current function is async.
   * @returns {boolean}
   */
  function canAwaitParseAsExpression(): boolean {
    const scope = helperFindLastClassOrFunctionLexicalScope();
    switch (scope.type) {
      case "FunctionLexicalScope":
        return scope.isAsync;
      case "ClassLexicalScope": {
        if (!scope.isInPropertyName) {
          return false;
        }
        const parentScope = helperFindParentClassOrFunctionLexicalScope();
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
   * Private API to know is current function is generator.
   * @returns {boolean}
   */
  function canYieldParseAsExpression(): boolean {
    const scope = helperFindLastClassOrFunctionLexicalScope();
    switch (scope.type) {
      case "FunctionLexicalScope":
        return scope.isGenerator;
      case "ClassLexicalScope": {
        if (!scope.isInPropertyName) {
          return false;
        }
        const parentScope = helperFindParentClassOrFunctionLexicalScope();
        switch (parentScope.type) {
          case "ClassLexicalScope":
            return false;
          case "FunctionLexicalScope":
            return parentScope.isGenerator;
        }
      }
    }
  }

  // function canAwaitParseAsIdentifier() {
  //   const scope = helperFindLastClassOrFunctionLexicalScope();
  //   switch (scope.type) {
  //     case "FunctionLexicalScope":
  //       return scope.isAsync;
  //     case "ClassLexicalScope": {
  //       if (!scope.isInPropertyName) {
  //         return false;
  //       }
  //       const parentScope = helperFindParentClassOrFunctionLexicalScope();
  //       switch (parentScope.type) {
  //         case "ClassLexicalScope":
  //           return false;
  //         case "FunctionLexicalScope":
  //           return parentScope.isAsync;
  //       }
  //     }
  //   }
  // }
  /**=============================================
   * Scope Attribute condition
   * =============================================
   */
  /**
   * Private API to know is current recursion parse in the
   * function param or not (used by yeild and await)
   * @returns
   */
  function isInParameter(): boolean {
    const scope = lexicalScopes[lexicalScopes.length - 1];
    return scope.type === "FunctionLexicalScope" && scope.inParameter;
  }
  /**
   * Private API to know is current function's param is simple.
   * @returns {boolean}
   */
  function isCurrentFunctionLexicalScopeParameterSimple(): boolean {
    const scope = helperFindLastFunctionLexicalScope();
    return scope.isSimpleParameter;
  }
  /**
   * Private API to know is current scope is top level, some syntax item
   * can not show in top level (like new.target)
   * @returns {boolean}
   */
  function isInTopLevel(): boolean {
    for (let index = lexicalScopes.length - 1; index >= 0; --index) {
      const scope = lexicalScopes[index];
      if (scope.type === "FunctionLexicalScope" && scope.isArrow === false) {
        return scope === lexicalScopes[0];
      }
    }
    // TODO: better unreach error
    throw new Error();
  }
  /**
   * Private API to know is current function scope is in strict mode,
   * according to ECMA spec, in class declaration and class expression, is
   * always strict mode.
   * @returns {boolean}
   */
  function isInStrictMode(): boolean {
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
  /**
   * Helper function only used by `checkStrictMode`, because
   * "use strict" directive only meansful when `ExpressionStatement`
   * is directive to function context, so we need is current
   * `ExpressionStatement` is in functionContext or not.
   * @returns {boolean}
   */
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
  /**
   * Private API to know is current scope under class scope.
   * @returns {boolean}
   */
  function isInClassScope(): boolean {
    const scope = helperFindLastClassScope();
    return !!scope;
  }
  /**
   * Private API to know is current class scope have extend.
   * @returns {boolean}
   */
  function isCurrentClassExtend(): boolean {
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
  function isDirectToClassScope(): boolean {
    return lexicalScopes[lexicalScopes.length - 1].type === "ClassLexicalScope";
  }
  function isReturnValidate() {
    const scope = helperFindLastClassOrFunctionLexicalScope();
    return (
      scope.type === "FunctionLexicalScope" &&
      /** Is not toplevel, there we not calling the function isInTopLevel is
       *  because we have already find the target scope, there is no need to
       * find a possible closet function scope again
       * */
      scope !== lexicalScopes[0]
    );
  }
  function isEncloseInFunction() {
    const scope = helperFindLastClassOrFunctionLexicalScope();
    return scope.type === "FunctionLexicalScope";
  }
  function isInPropertyName(): boolean {
    const scope = helperFindLastClassScope();
    return !!scope && scope.isInPropertyName;
  }
  function testAndSetCtor(): boolean {
    const scope = helperFindLastClassScope();
    const isExist = scope ? scope.haveCtor : false;
    if (scope) {
      scope.haveCtor = true;
    }
    return isExist;
  }
  /**=============================================
   * Setter to Function scope attribute
   * =============================================
   */
  /**
   * Private API called when parse `*` after parse function, since `function`
   * keyword is before `*`, so when we called `parseFunction` parser api, we
   * not know is this function is generator or not, this api is design to solve
   * this problem, set current function as generator.
   */
  function setCurrentFunctionLexicalScopeAsGenerator() {
    const scope = helperFindLastFunctionLexicalScope();
    scope.isGenerator = true;
  }
  /**
   * Private API called when parse `'use strict';` after parse function, since `function`
   * keyword is before directive, so when we called `parseFunction` parser api, we
   * not know is this function in strict mode or not, this api is design to solve
   * this problem, set current function strict mode.
   */
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
    let scope: ClassLexicalScope | null = null;
    for (const s of lexicalScopes) {
      if (s.type === "ClassLexicalScope") {
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
    let parentScope: ClassLexicalScope | null = null,
      flag = false;
    for (let index = lexicalScopes.length - 1; index >= 0; --index) {
      const scope = lexicalScopes[index];
      if (scope.type === "ClassLexicalScope") {
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
    enterVirtualBlockScope,
    exitVirtualBlockScope,
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
    isEncloseInFunction,
    isInParameter,
    isCurrentFunctionLexicalScopeParameterSimple,
    isParentFunctionAsync,
    isParentFunctionGenerator,
    isReturnValidate,
    isBreakValidate,
    isContinueValidate,
    canLabelReach,
    // for class
    isInCtor,
    isInPropertyName,
    isInClassScope,
    isCurrentClassExtend,
    isCurrentInDelete,
    isDirectToClassScope,
    testAndSetCtor,
    /**
     * Await and Yield condition
     */
    canAwaitParseAsExpression,
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
