export interface FunctionLexicalScope {
  readonly type: "FunctionLexicalScope";
  readonly isArrow: boolean;
  isAsync: boolean;
  isGenerator: boolean;
  inParameter: boolean;
  isSimpleParameter: boolean;
  inStrict: boolean;
}

export interface BlockLexicalScope {
  readonly type: "BlockLexicalScope";
}

export type LexicalScope = FunctionLexicalScope | BlockLexicalScope;

export type LexicalScopeHander = {};

function createLexicalScopeRecorder() {
  const lexicalScopes: Array<LexicalScope> = [];
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
    const lastScope = helperFindLastFunctionContext();
    lexicalScopes.push({
      type: "FunctionLexicalScope",
      isArrow: false,
      isAsync,
      isGenerator,
      inParameter: false,
      inStrict: lastScope.inStrict,
      isSimpleParameter: true,
    });
  }
  function exitFunctionLexicalScope() {}
  /**
   * Helper function for other context Private API to get this closest
   * function scope structure in scopeContext.
   * @returns {FunctionContext}
   */
  function helperFindLastFunctionContext(): FunctionLexicalScope {
    for (let index = lexicalScopes.length - 1; index >= 0; --index) {
      const scopeContext = lexicalScopes[index];
      if (scopeContext.type === "FunctionLexicalScope") {
        return scopeContext;
      }
    }
    // TODO: better error
    throw new Error();
  }
  return {};
}
