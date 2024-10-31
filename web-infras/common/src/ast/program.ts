import { ModuleItem } from "@/src/ast/base";
import { SyntaxKinds } from "@/src/kind";
import { Statement } from "@/src/ast/statement";
import { Declaration } from "@/src/ast/declaration";

export type StatementListItem = Statement | Declaration;
export interface Program extends ModuleItem {
  kind: SyntaxKinds.Program;
  body: Array<ModuleItem>; //TODO: using StatementListItem
}
