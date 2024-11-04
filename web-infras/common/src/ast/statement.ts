import { ModuleItem } from "@/src/ast/base";
import { SyntaxKinds } from "@/src/kind";
import { StatementListItem } from "@/src/ast/program";
import { Expression, Identifier } from "@/src/ast/expression";
import { VariableDeclaration, FunctionDeclaration } from "@/src/ast/declaration";
import { Pattern } from "@/src/ast/pattern";

export interface IfStatement extends ModuleItem {
  kind: SyntaxKinds.IfStatement;
  test: Expression;
  conseqence: Statement;
  alternative: Statement | null;
}
export interface BlockStatement extends ModuleItem {
  kind: SyntaxKinds.BlockStatement;
  body: Array<StatementListItem>;
}
export interface SwitchStatement extends ModuleItem {
  kind: SyntaxKinds.SwitchStatement;
  discriminant: Expression;
  cases: Array<SwitchCase>;
}
export interface SwitchCase extends ModuleItem {
  kind: SyntaxKinds.SwitchCase;
  test: Expression | null;
  consequence: Array<StatementListItem>;
}
export interface ContinueStatement extends ModuleItem {
  kind: SyntaxKinds.ContinueStatement;
  label: Identifier | null;
}
export interface BreakStatement extends ModuleItem {
  kind: SyntaxKinds.BreakStatement;
  label: Identifier | null;
}
export interface ReturnStatement extends ModuleItem {
  kind: SyntaxKinds.ReturnStatement;
  argu: Expression | null;
}
export interface LabeledStatement extends ModuleItem {
  kind: SyntaxKinds.LabeledStatement;
  label: Identifier;
  body: Statement | FunctionDeclaration;
}
export interface WhileStatement extends ModuleItem {
  kind: SyntaxKinds.WhileStatement;
  test: Expression;
  body: Statement;
}
export interface DoWhileStatement extends ModuleItem {
  kind: SyntaxKinds.DoWhileStatement;
  test: Expression;
  body: Statement;
}
export interface TryStatement extends ModuleItem {
  kind: SyntaxKinds.TryStatement;
  block: BlockStatement;
  handler: CatchClause | null;
  finalizer: BlockStatement | null;
}
export interface CatchClause extends ModuleItem {
  kind: SyntaxKinds.CatchClause;
  param: Pattern | null;
  body: BlockStatement;
}
export interface ThrowStatement extends ModuleItem {
  kind: SyntaxKinds.ThrowStatement;
  argu: Expression;
}
export interface WithStatement extends ModuleItem {
  kind: SyntaxKinds.WithStatement;
  object: Expression;
  body: Statement;
}
export interface DebuggerStatement extends ModuleItem {
  kind: SyntaxKinds.DebuggerStatement;
}
export interface EmptyStatement extends ModuleItem {
  kind: SyntaxKinds.EmptyStatement;
}
export interface ForStatement extends ModuleItem {
  kind: SyntaxKinds.ForStatement;
  init: Expression | VariableDeclaration | null;
  test: Expression | null;
  update: Expression | null;
  body: Statement;
}
export interface ForOfStatement extends ModuleItem {
  kind: SyntaxKinds.ForOfStatement;
  left: Expression | VariableDeclaration;
  right: Expression;
  await: boolean;
  body: Statement;
}
// TODO. better Type
// type ForOfInStatementLeft = VariableDeclaration | Pattern | TSAsExpression | TSTypeAssertionExpression;
export interface ForInStatement extends ModuleItem {
  kind: SyntaxKinds.ForInStatement;
  left: Expression | VariableDeclaration;
  right: Expression;
  body: Statement;
}

export interface ExpressionStatement extends ModuleItem {
  kind: SyntaxKinds.ExpressionStatement;
  expr: Expression;
}

export type Statement =
  | IfStatement
  | BlockStatement
  | SwitchStatement
  | ForInStatement
  | ForOfStatement
  | ForStatement
  | BreakStatement
  | ContinueStatement
  | ReturnStatement
  | LabeledStatement
  | WhileStatement
  | DoWhileStatement
  | TryStatement
  | ThrowStatement
  | WithStatement
  | DebuggerStatement
  | EmptyStatement
  | ExpressionStatement
  | VariableDeclaration /** when is `var` */;
