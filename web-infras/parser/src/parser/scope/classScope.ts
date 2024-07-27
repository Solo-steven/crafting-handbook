
interface ClassScope {
    isExtend: boolean,
    undefinedPrivateName: Set<string>,
    definiedPrivateName: Set<string>,
}

function createClassScopeRecorder() {
    const classScopes: Array<ClassScope> = [];

    function enterClassScope(isExtend: boolean) {
        classScopes.push({
            isExtend,
            undefinedPrivateName: new Set(),
            definiedPrivateName: new Set(),
        })
    }
    function exitClassScope() {
        classScopes.pop();
    }
    function isInClassScope() {
        return classScopes.length > 0;
    }
    function isCurrentClassExtend() {
        const scope = helperGetCurrentClassScope();
        return scope && scope.isExtend;
    }
    function recordDefiniedPrivateName(name: string) {
        const scope = helperGetCurrentClassScope();
        if(scope) {
            scope.undefinedPrivateName.delete(name);
            if(scope.definiedPrivateName.has(name)) {
                return true;
            }
            scope.definiedPrivateName.add(name);
        }
        return false;
    }
    function recordUndefinedPrivateName(name: string) {
        const scope = helperGetCurrentClassScope();
        if(scope) {
            scope.undefinedPrivateName.add(name);
        }
    }
    function helperGetCurrentClassScope(): ClassScope | undefined {
        return classScopes[classScopes.length-1];
    }
    return {
        enterClassScope,
        exitClassScope,
        isInClassScope,
        isCurrentClassExtend,
        recordDefiniedPrivateName,
        recordUndefinedPrivateName,
    }
}