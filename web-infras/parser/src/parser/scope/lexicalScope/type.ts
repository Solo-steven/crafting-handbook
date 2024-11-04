export type PrivateNameDefKind = "get" | "set" | "other" | "static-get" | "static-set";

export enum ExportContext {
  NotInExport,
  InExport,
  InExportBinding,
}

export type ProgramLexicalScope = {
  readonly type: "ProgramLexicalScope";
  isAsync: boolean;
  inStrict: boolean;
  exportContext: ExportContext;
};
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
  isAbstract: boolean;
  isInCtor: boolean;
  haveCtor: boolean;
  isInDelete: boolean;
  isInPropertyName: boolean;
}

export type BlockType = "Loop" | "Switch" | "Label";

export interface VirtualLexicalScope {
  readonly type: "VirtualLexicalScope";
  blockType: BlockType;
  labelName?: string;
}

export interface BlockLexicalScope {
  readonly type: "BlockLexicalScope";
  isCatch: boolean;
}

export type LexicalScope =
  | ProgramLexicalScope
  | ClassLexicalScope
  | FunctionLexicalScope
  | BlockLexicalScope
  | VirtualLexicalScope;
