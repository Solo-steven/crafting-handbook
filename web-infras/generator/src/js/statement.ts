import {
  SyntaxKinds,
  BlockStatement,
  IfStatement,
  SwitchStatement,
  ForInStatement,
  ForOfStatement,
  BreakStatement,
  ContinueStatement,
  ReturnStatement,
  LabeledStatement,
  WhileStatement,
  DoWhileStatement,
  TryStatement,
  ThrowStatement,
  WithStatement,
  CatchClause,
  ExpressionStatement,
  SwitchCase,
  DebuggerStatement,
} from "web-infra-common";
import { Generaotr } from "@/src/index";

export function genIfStatement(this: Generaotr, ifStatement: IfStatement) {
  this.writeToken(SyntaxKinds.IfKeyword);
  this.writeWithParan(() => {
    this.genModuleItem(ifStatement.test);
  });
  this.genModuleItem(ifStatement.conseqence);
  if (ifStatement.alternative) {
    this.writeToken(SyntaxKinds.ElseKeyword);
    this.genModuleItem(ifStatement.alternative);
  }
}
export function genBlockStatement(this: Generaotr, blockStatement: BlockStatement) {
  this.writeWithBraces(true, () => {
    for (const item of blockStatement.body) {
      this.writePrefixSpace();
      this.genModuleItem(item);
    }
  });
}
export function genSwitchStatement(this: Generaotr, switchStatement: SwitchStatement) {
  this.writeToken(SyntaxKinds.SwitchKeyword);
  this.writeWithParan(() => {
    this.genModuleItem(switchStatement.discriminant);
  });
  this.writeWithBraces(true, () => {
    for (const singleCase of switchStatement.cases) {
      this.writePrefixSpace();
      this.genModuleItem(singleCase);
    }
  });
  this.writeLineTerminator();
}
export function genSwitchCase(this: Generaotr, switchCase: SwitchCase) {
  if (switchCase.test) {
    this.writeToken(SyntaxKinds.CaseKeyword);
    this.genModuleItem(switchCase.test);
    this.writeToken(SyntaxKinds.ColonPunctuator);
  } else {
    this.writeToken(SyntaxKinds.DefaultKeyword);
    this.writeToken(SyntaxKinds.ColonPunctuator);
  }
  for (const item of switchCase.consequence) {
    this.genModuleItem(item);
  }
}
export function genForInStatement(this: Generaotr, forInStatement: ForInStatement) {
  this.writeToken(SyntaxKinds.ForKeyword);
  this.writeWithParan(() => {
    this.genModuleItem(forInStatement.left);
    this.writeRawString("of");
    this.genModuleItem(forInStatement.right);
  });
  this.genModuleItem(forInStatement.body);
  this.writeLineTerminator();
}
export function genForOfStatement(this: Generaotr, forOfStatement: ForOfStatement) {
  this.writeToken(SyntaxKinds.ForKeyword);
  this.writeWithParan(() => {
    this.genModuleItem(forOfStatement.left);
    this.writeRawString("in");
    this.genModuleItem(forOfStatement.right);
  });
  this.genModuleItem(forOfStatement.body);
  this.writeLineTerminator();
}
export function genBreakStatement(this: Generaotr, breakStatement: BreakStatement) {
  this.writeToken(SyntaxKinds.BreakKeyword);
  if (breakStatement.label) {
    this.genModuleItem(breakStatement.label);
  }
  this.writeLineTerminator();
}
export function genContinueStatement(this: Generaotr, continueStatement: ContinueStatement) {
  this.writeToken(SyntaxKinds.ContinueKeyword);
  if (continueStatement.label) {
    this.genModuleItem(continueStatement.label);
  }
  this.writeLineTerminator();
}
export function genReturnStatement(this: Generaotr, returnStatement: ReturnStatement) {
  this.writeToken(SyntaxKinds.ReturnKeyword);
  if (returnStatement.argu) this.genModuleItem(returnStatement.argu);
  this.writeLineTerminator();
}
export function genLabeledStatement(this: Generaotr, labeledStatement: LabeledStatement) {
  this.genModuleItem(labeledStatement.label);
  this.writeToken(SyntaxKinds.CommaToken);
  this.genModuleItem(labeledStatement.body);
}
export function genWhileStatment(this: Generaotr, whileStatement: WhileStatement) {
  this.writeToken(SyntaxKinds.WhileKeyword);
  this.writeWithParan(() => {
    this.genModuleItem(whileStatement.test);
  });
  this.genModuleItem(whileStatement.body);
}
export function genDoWhileStatement(this: Generaotr, doWhileStatement: DoWhileStatement) {
  this.writeToken(SyntaxKinds.DoKeyword);
  this.genModuleItem(doWhileStatement.body);
  this.writeToken(SyntaxKinds.WhileKeyword);
  this.writeWithParan(() => {
    this.genModuleItem(doWhileStatement.test);
  });
}
export function genTryStatement(this: Generaotr, tryStatement: TryStatement) {
  this.writeToken(SyntaxKinds.TrueKeyword);
  this.genBlockStatement(tryStatement.block);
  this.writeToken(SyntaxKinds.CatchKeyword);
  if (tryStatement.handler) {
    this.genCatchClause(tryStatement.handler);
  }
  if (tryStatement.finalizer) {
    this.writeToken(SyntaxKinds.FinallyKeyword);
    this.writeWithBraces(true, () => {
      for (const item of tryStatement.finalizer!.body) {
        this.writePrefixSpace();
        this.genModuleItem(item);
      }
    });
  }
}
export function genCatchClause(this: Generaotr, catchClause: CatchClause) {
  this.writeToken(SyntaxKinds.CatchKeyword);
  if (catchClause.param) {
    this.writeWithParan(() => {
      this.genModuleItem(catchClause.param!);
    });
  }
  this.genBlockStatement(catchClause.body);
}
export function genThrowStatment(this: Generaotr, throwStatement: ThrowStatement) {
  this.writeToken(SyntaxKinds.ThrowKeyword);
  this.genModuleItem(throwStatement.argu);
  this.writeLineTerminator();
}
export function genWithStatement(this: Generaotr, withStatement: WithStatement) {
  this.writeToken(SyntaxKinds.WithKeyword);
  this.writeWithParan(() => {
    this.genModuleItem(withStatement.object);
  });
  this.writeToken(SyntaxKinds.ColonPunctuator);
  this.genModuleItem(withStatement.body);
}
export function genDebugerStatement(this: Generaotr, _debuggerStatement: DebuggerStatement) {
  this.writeToken(SyntaxKinds.DebuggerKeyword);
  this.writeToken(SyntaxKinds.ColonPunctuator);
  this.writeLineTerminator();
}
export function genExpressionStatement(this: Generaotr, exprStatement: ExpressionStatement) {
  this.genModuleItem(exprStatement.expr);
  this.writeToken(SyntaxKinds.SemiPunctuator);
  this.writeLineTerminator();
}
