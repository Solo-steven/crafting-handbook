import * as AST from "@/src/ast/index";
import { SyntaxKinds } from "@/src/kind";
import { SourcePosition } from "@/src/position";

export function createExpressionStatement(
  expr: AST.ExpressionStatement["expr"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ExpressionStatement {
  return {
    kind: SyntaxKinds.ExpressionStatement,
    expr,
    start,
    end,
  };
}
export function createIfStatement(
  test: AST.IfStatement["test"],
  conseqence: AST.IfStatement["conseqence"],
  alter: AST.IfStatement["alternative"],
  start: SourcePosition,
  end: SourcePosition,
): AST.IfStatement {
  return {
    kind: SyntaxKinds.IfStatement,
    test,
    conseqence,
    alternative: alter,
    start,
    end,
  };
}
export function createBlockStatement(
  body: AST.BlockStatement["body"],
  start: SourcePosition,
  end: SourcePosition,
): AST.BlockStatement {
  return {
    kind: SyntaxKinds.BlockStatement,
    body,
    start,
    end,
  };
}
export function createSwitchStatement(
  discriminant: AST.SwitchStatement["discriminant"],
  cases: AST.SwitchStatement["cases"],
  start: SourcePosition,
  end: SourcePosition,
): AST.SwitchStatement {
  return {
    kind: SyntaxKinds.SwitchStatement,
    discriminant,
    cases,
    start,
    end,
  };
}
export function createSwitchCase(
  test: AST.SwitchCase["test"],
  consequence: AST.SwitchCase["consequence"],
  start: SourcePosition,
  end: SourcePosition,
): AST.SwitchCase {
  return {
    kind: SyntaxKinds.SwitchCase,
    test,
    consequence,
    start,
    end,
  };
}
export function createBreakStatement(
  label: AST.BreakStatement["label"],
  start: SourcePosition,
  end: SourcePosition,
): AST.BreakStatement {
  return {
    kind: SyntaxKinds.BreakStatement,
    label,
    start,
    end,
  };
}
export function createContinueStatement(
  label: AST.ContinueStatement["label"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ContinueStatement {
  return {
    kind: SyntaxKinds.ContinueStatement,
    label,
    start,
    end,
  };
}
export function createLabeledStatement(
  label: AST.LabeledStatement["label"],
  body: AST.LabeledStatement["body"],
  start: SourcePosition,
  end: SourcePosition,
): AST.LabeledStatement {
  return {
    kind: SyntaxKinds.LabeledStatement,
    label,
    body,
    start,
    end,
  };
}
export function createReturnStatement(
  argu: AST.ReturnStatement["argu"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ReturnStatement {
  return {
    kind: SyntaxKinds.ReturnStatement,
    argu,
    start,
    end,
  };
}
export function createWhileStatement(
  test: AST.WhileStatement["test"],
  body: AST.WhileStatement["body"],
  start: SourcePosition,
  end: SourcePosition,
): AST.WhileStatement {
  return {
    kind: SyntaxKinds.WhileStatement,
    test,
    body,
    start,
    end,
  };
}
export function createDoWhileStatement(
  test: AST.DoWhileStatement["test"],
  body: AST.DoWhileStatement["body"],
  start: SourcePosition,
  end: SourcePosition,
): AST.DoWhileStatement {
  return {
    kind: SyntaxKinds.DoWhileStatement,
    test,
    body,
    start,
    end,
  };
}
export function createTryStatement(
  block: AST.TryStatement["block"],
  handler: AST.TryStatement["handler"],
  finalizer: AST.TryStatement["finalizer"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TryStatement {
  return {
    kind: SyntaxKinds.TryStatement,
    block,
    handler,
    finalizer,
    start,
    end,
  };
}
export function createCatchClause(
  param: AST.CatchClause["param"],
  body: AST.CatchClause["body"],
  start: SourcePosition,
  end: SourcePosition,
): AST.CatchClause {
  return {
    kind: SyntaxKinds.CatchClause,
    param,
    body,
    start,
    end,
  };
}
export function createThrowStatement(
  argu: AST.ThrowStatement["argu"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ThrowStatement {
  return {
    kind: SyntaxKinds.ThrowStatement,
    argu,
    start,
    end,
  };
}
export function createWithStatement(
  object: AST.WithStatement["object"],
  body: AST.WithStatement["body"],
  start: SourcePosition,
  end: SourcePosition,
): AST.WithStatement {
  return {
    kind: SyntaxKinds.WithStatement,
    body,
    object,
    start,
    end,
  };
}
export function createDebuggerStatement(start: SourcePosition, end: SourcePosition): AST.DebuggerStatement {
  return {
    kind: SyntaxKinds.DebuggerStatement,
    start,
    end,
  };
}
export function createEmptyStatement(start: SourcePosition, end: SourcePosition): AST.EmptyStatement {
  return {
    kind: SyntaxKinds.EmptyStatement,
    start,
    end,
  };
}
export function createForStatement(
  body: AST.ForStatement["body"],
  init: AST.ForStatement["init"],
  test: AST.ForStatement["test"],
  update: AST.ForStatement["update"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ForStatement {
  return {
    kind: SyntaxKinds.ForStatement,
    init,
    test,
    update,
    body,
    start,
    end,
  };
}
export function createForInStatement(
  left: AST.ForInStatement["left"],
  right: AST.ForInStatement["right"],
  body: AST.ForInStatement["body"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ForInStatement {
  return {
    kind: SyntaxKinds.ForInStatement,
    left,
    right,
    body,
    start,
    end,
  };
}
export function createForOfStatement(
  isAwait: boolean,
  left: AST.ForOfStatement["left"],
  right: AST.ForOfStatement["right"],
  body: AST.ForOfStatement["body"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ForOfStatement {
  return {
    kind: SyntaxKinds.ForOfStatement,
    await: isAwait,
    left,
    right,
    body,
    start,
    end,
  };
}
