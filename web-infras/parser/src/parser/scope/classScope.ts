
export type PrivateNameDefKind = "get" | "set" | "other" | "static-get" | "static-set";
interface ClassScope {
  isExtend: boolean;
  isInCtor: boolean;
  isInDelete: boolean;
  undefinedPrivateName: Set<string>;
  undefinedPrivateNameKinds: Map<string, Set<PrivateNameDefKind>>,
  definiedPrivateName: Set<string>;
  definedPrivateNameKinds: Map<string, Set<PrivateNameDefKind>>
  duplicatePrivateName: Set<string>;
}


function isPrivateNameExist(scope: ClassScope, name: string, type: PrivateNameDefKind) {
    if(scope.definiedPrivateName.has(name)) {
        switch(type) {
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


export function createClassScopeRecorder() {
  const classScopes: Array<ClassScope> = [];

  function enterClassScope(isExtend: boolean) {
    classScopes.push({
      isExtend,
      isInCtor: false,
      isInDelete: false,
      undefinedPrivateName: new Set(),
      undefinedPrivateNameKinds: new Map(),
      definiedPrivateName: new Set(),
      definedPrivateNameKinds: new Map(),
      duplicatePrivateName: new Set(),
    });
  }
  function exitClassScope() {
    const currentScope = classScopes.pop();
    const parentScope = classScopes[classScopes.length - 1];
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
  function isInClassScope() {
    return classScopes.length > 0;
  }
  function isCurrentClassExtend() {
    const scope = helperGetCurrentClassScope();
    return !!scope && scope.isExtend;
  }
  function enterDelete() {
    const scope = helperGetCurrentClassScope();
    if (scope) {
      scope.isInDelete = true;
    }
  }
  function exitDelete() {
    const scope = helperGetCurrentClassScope();
    if (scope) {
      scope.isInDelete = false;
    }
  }
  function enterCtor() {
    const scope = helperGetCurrentClassScope();
    if (scope) {
      scope.isInCtor = true;
    }
  }
  function exitCtor() {
    const scope = helperGetCurrentClassScope();
    if (scope) {
      scope.isInCtor = false;
    }
  }
  function isInCtor() {
    const scope = helperGetCurrentClassScope();
    if (scope) {
      return scope.isInCtor;
    }
    return false;
  }
  function defPrivateName(name: string, type: PrivateNameDefKind = "other") {
    const scope = helperGetCurrentClassScope();
    let isDuplicate = false;
    if (scope) {
      if(isPrivateNameExist(scope,name, type)) {
        scope.duplicatePrivateName.add(name);
        isDuplicate = true;
      }
      scope.definiedPrivateName.add(name);
      if(scope.definedPrivateNameKinds.has(name)) {
        const kinds = scope.definedPrivateNameKinds.get(name)!;
        kinds.add(type);
      }else {
        scope.definedPrivateNameKinds.set(name, new Set([type]));
      }
      if(scope.undefinedPrivateName.has(name)) {
        const kinds = scope.undefinedPrivateNameKinds.get(name)!;
        if(kinds.has(type)) {
            if(kinds.size == 1) {
                scope.undefinedPrivateName.delete(name);
                scope.undefinedPrivateNameKinds.delete(name);
            }else {
                kinds.delete(type);
            }
        }
      }
    }
    return isDuplicate;
  }
  function usePrivateName(name: string, type: PrivateNameDefKind = "other") {
    let scope: ClassScope | null = null;
    for (scope of classScopes) {
      if (isPrivateNameExist(scope, name, type)) {
        return;
      }
    }
    if (scope) {
        scope.undefinedPrivateName.add(name);
        if(scope.undefinedPrivateNameKinds.has(name)) {
            const kinds = scope.undefinedPrivateNameKinds.get(name)!;
            kinds.add(type);
        }else {
            scope.undefinedPrivateNameKinds.set(name, new Set([type]))
        }
    }
  }
  function helperGetCurrentClassScope(): ClassScope | undefined {
    return classScopes[classScopes.length - 1];
  }
  function isDuplicatePrivateName() {
    const scope = helperGetCurrentClassScope();
    if (scope && scope.duplicatePrivateName.size > 0) {
      return scope.duplicatePrivateName;
    }
    return null;
  }
  function isUndeinfedPrivateName() {
    const scope = helperGetCurrentClassScope();
    const parentScope = classScopes[classScopes.length - 2];

    if (scope && scope.undefinedPrivateName.size > 0) {
      if (parentScope) {
        return null;
      }
      return scope.undefinedPrivateName;
    }
    return null;
  }
  function isCurrentInDelete() {
    const scope = helperGetCurrentClassScope();
    if (scope) {
      return scope.isInDelete;
    }
    return false;
  }
  return {
    enterClassScope,
    exitClassScope,
    isInClassScope,
    isCurrentClassExtend,
    defPrivateName,
    usePrivateName,
    isDuplicatePrivateName,
    isUndeinfedPrivateName,
    isCurrentInDelete,
    enterDelete,
    exitDelete,
    enterCtor,
    exitCtor,
    isInCtor,
  };
}
