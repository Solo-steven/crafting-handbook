
interface ClassScope {
    isExtend: boolean,
    isInCtor: boolean,
    isInDelete: boolean,
    undefinedPrivateName: Set<string>,
    definiedPrivateName: Set<string>,
    duplicatePrivateName: Set<string>,
}

export function createClassScopeRecorder() {
    const classScopes: Array<ClassScope> = [];

    function enterClassScope(isExtend: boolean) {
        classScopes.push({
            isExtend,
            isInCtor: false,
            isInDelete: false,
            undefinedPrivateName: new Set(),
            definiedPrivateName: new Set(),
            duplicatePrivateName: new Set(),
        })
    }
    function exitClassScope() {
        const currentScope = classScopes.pop();
        const parentScope = classScopes[classScopes.length-1];
        if(currentScope && parentScope) {
            parentScope.undefinedPrivateName = new Set([...parentScope.undefinedPrivateName.values(), ...currentScope.undefinedPrivateName.values()])
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
        if(scope) {
            scope.isInDelete = true;
        }
    }
    function exitDelete() {
        const scope = helperGetCurrentClassScope();
        if(scope) {
            scope.isInDelete = false;
        }
    }
    function enterCtor() {
        const scope = helperGetCurrentClassScope();
        if(scope) {
            scope.isInCtor = true;
        }
    }
    function exitCtor() {
        const scope = helperGetCurrentClassScope();
        if(scope) {
            scope.isInCtor = false;
        }
    }
    function isInCtor() {
        const scope = helperGetCurrentClassScope();
        if(scope) {
           return  scope.isInCtor;
        }
        return false;
    }
    function recordDefiniedPrivateName(name: string) {
        const scope = helperGetCurrentClassScope();
        if(scope) {
            scope.undefinedPrivateName.delete(name);
            if(scope.definiedPrivateName.has(name)) {
                scope.duplicatePrivateName.add(name);
                return true;
            }
            scope.definiedPrivateName.add(name);
        }
        return false;
    }
    function recordUndefinedPrivateName(name: string) {
        let scope: ClassScope | null = null;
        for(scope of classScopes) {
            if(scope.definiedPrivateName.has(name)) {
                return;
            }
        }
        if(scope) scope.undefinedPrivateName.add(name);
    }
    function helperGetCurrentClassScope(): ClassScope | undefined {
        return classScopes[classScopes.length-1];
    }
    function isDuplicatePrivateName() {
        const scope = helperGetCurrentClassScope();
        if(scope && scope.duplicatePrivateName.size > 0) {
            return scope.duplicatePrivateName;
        }
        return null;
    }
    function isUndeinfedPrivateName() {
        const scope = helperGetCurrentClassScope();
        const parentScope = classScopes[classScopes.length-2];

        if(scope && scope.undefinedPrivateName.size > 0) {
            if(parentScope) {
                return null
            }
            return scope.undefinedPrivateName;
        }
        return null;
    }
    function isCurrentInDelete() {
        const scope= helperGetCurrentClassScope();
        if(scope) {
            return scope.isInDelete;
        }
        return false;
    }
    return {
        enterClassScope,
        exitClassScope,
        isInClassScope,
        isCurrentClassExtend,
        recordDefiniedPrivateName,
        recordUndefinedPrivateName,
        isDuplicatePrivateName,
        isUndeinfedPrivateName,
        isCurrentInDelete,
        enterDelete,
        exitDelete,
        enterCtor,
        exitCtor,
        isInCtor,
    }
}