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
  haveCtor: boolean;
  isInDelete: boolean;
  isInPropertyName: boolean;
  undefinedPrivateName: Set<string>;
  undefinedPrivateNameKinds: Map<string, Set<PrivateNameDefKind>>;
  definiedPrivateName: Set<string>;
  definedPrivateNameKinds: Map<string, Set<PrivateNameDefKind>>;
  duplicatePrivateName: Set<string>;
}

export type BlockType = "Loop" | "Switch" | "Label";

export interface VirtualLexicalScope {
  readonly type: "VirtualLexicalScope";
  blockType: BlockType;
  labelName?: string;
}

export interface BlockLexicalScope {
  readonly type: "BlockLexicalScope";
}

export type LexicalScope = ClassLexicalScope | FunctionLexicalScope | BlockLexicalScope | VirtualLexicalScope;

export function isPrivateNameExist(scope: ClassLexicalScope, name: string, type: PrivateNameDefKind) {
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
