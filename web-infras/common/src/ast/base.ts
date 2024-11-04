import { SourcePosition } from "@/src/position";
import { SyntaxKinds } from "@/src/kind";

/**
 * Base interface for any syntax node.
 * NOTE: term `ModuleItem` is from ECMA spec.
 */
export interface ModuleItem {
  kind: SyntaxKinds;
  start: SourcePosition;
  end: SourcePosition;
  parent?: ModuleItem;
}
/**
 * Base interface for expression syntax node. just add
 * the parentheses to `ModuleItem`.
 */
export interface ExpressionModuleItem extends ModuleItem {
  parentheses?: boolean;
}
