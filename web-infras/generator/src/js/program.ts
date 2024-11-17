import { Generator } from "@/src/generator";
import {
  SyntaxKinds,
  ModuleItem,
  Program,
  IfStatement,
  BlockStatement,
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
  DebuggerStatement,
  WithStatement,
  ExpressionStatement,
  Super,
  Import,
  ThisExpression,
  Identifier,
  PrivateName,
  StringLiteral,
  NumberLiteral,
  SpreadElement,
  AwaitExpression,
  NewExpression,
  MemberExpression,
  CallExpression,
  ChainExpression,
  UpdateExpression,
  UnaryExpression,
  ConditionalExpression,
  YieldExpression,
  AssigmentExpression,
  SequenceExpression,
  BinaryExpression,
  FunctionDeclaration,
  FunctionBody,
  VariableDeclaration,
  BoolLiteral,
  NullLiteral,
  UndefinbedLiteral,
  RegexLiteral,
  ObjectExpression,
  ArrayExpression,
  FunctionExpression,
  ArrorFunctionExpression,
  ObjectPattern,
  ObjectProperty,
  ObjectMethodDefinition,
  ObjectAccessor,
} from "web-infra-common";

export function genProgram(this: Generator, program: Program) {
  for (const item of program.body) {
    this.genModuleItem(item);
  }
}

export function genModuleItem(this: Generator, item: ModuleItem) {
  switch (item.kind) {
    /**
     * Declaration
     */
    case SyntaxKinds.VariableDeclaration:
      this.genVariableDeclaration(item as VariableDeclaration);
      break;
    case SyntaxKinds.FunctionDeclaration:
      this.genFunctionDeclaration(item as FunctionDeclaration);
      break;
    case SyntaxKinds.FunctionBody:
      this.genFunctionBody(item as FunctionBody);
      break;
    /**
     * Statement
     */
    case SyntaxKinds.IfStatement:
      this.genIfStatement(item as IfStatement);
      break;
    case SyntaxKinds.BlockStatement:
      this.genBlockStatement(item as BlockStatement);
      break;
    case SyntaxKinds.SwitchStatement:
      this.genSwitchStatement(item as SwitchStatement);
      break;
    case SyntaxKinds.ForInStatement:
      this.genForInStatement(item as ForInStatement);
      break;
    case SyntaxKinds.ForOfStatement:
      this.genForOfStatement(item as ForOfStatement);
      break;
    case SyntaxKinds.BreakStatement:
      this.genBreakStatement(item as BreakStatement);
      break;
    case SyntaxKinds.ContinueStatement:
      this.genContinueStatement(item as ContinueStatement);
      break;
    case SyntaxKinds.ReturnStatement:
      this.genReturnStatement(item as ReturnStatement);
      break;
    case SyntaxKinds.LabeledStatement:
      this.genLabeledStatement(item as LabeledStatement);
      break;
    case SyntaxKinds.WhileStatement:
      this.genWhileStatment(item as WhileStatement);
      break;
    case SyntaxKinds.DoWhileStatement:
      this.genDoWhileStatement(item as DoWhileStatement);
      break;
    case SyntaxKinds.TryStatement:
      this.genTryStatement(item as TryStatement);
      break;
    case SyntaxKinds.ThrowStatement:
      this.genThrowStatment(item as ThrowStatement);
      break;
    case SyntaxKinds.WithStatement:
      this.genWithStatement(item as WithStatement);
      break;
    case SyntaxKinds.DebuggerKeyword:
      this.genDebugerStatement(item as DebuggerStatement);
      break;
    case SyntaxKinds.ExpressionStatement:
      this.genExpressionStatement(item as ExpressionStatement);
      break;
    /**
     * Expression
     */
    case SyntaxKinds.Super:
      this.genSuper(item as Super);
      break;
    case SyntaxKinds.Import:
      this.genImport(item as Import);
      break;
    case SyntaxKinds.ThisExpression:
      this.genThisExpression(item as ThisExpression);
      break;
    case SyntaxKinds.Identifier:
      this.genIdentifier(item as Identifier);
      break;
    case SyntaxKinds.PrivateName:
      this.genPrivateName(item as PrivateName);
      break;
    case SyntaxKinds.DecimalLiteral:
    case SyntaxKinds.NonOctalDecimalLiteral:
    case SyntaxKinds.BinaryIntegerLiteral:
    case SyntaxKinds.OctalIntegerLiteral:
    case SyntaxKinds.HexIntegerLiteral:
    case SyntaxKinds.LegacyOctalIntegerLiteral:
    case SyntaxKinds.BinaryBigIntegerLiteral:
    case SyntaxKinds.HexBigIntegerLiteral:
    case SyntaxKinds.OctalBigIntegerLiteral:
    case SyntaxKinds.DecimalBigIntegerLiteral:
      this.genNumberLiteral(item as NumberLiteral);
      break;
    case SyntaxKinds.StringLiteral:
      this.genStringLiteral(item as StringLiteral);
      break;
    case SyntaxKinds.BooleanLiteral:
      this.genBoolLiteral(item as BoolLiteral);
      break;
    case SyntaxKinds.NullLiteral:
      this.genNullLiteral(item as NullLiteral);
      break;
    case SyntaxKinds.UndefinedKeyword:
      this.genUndefiniedLiteral(item as UndefinbedLiteral);
      break;
    case SyntaxKinds.RegexLiteral:
      this.genRegexLiteral(item as RegexLiteral);
      break;
    case SyntaxKinds.ObjectExpression:
      this.genObjectExpression(item as ObjectExpression);
      break;
    case SyntaxKinds.ObjectProperty:
      this.genObjectProperty(item as ObjectProperty);
      break;
    case SyntaxKinds.ObjectMethodDefintion:
      this.genObjectMethod(item as ObjectMethodDefinition);
      break;
    case SyntaxKinds.ObjectAccessor:
      this.genObjectAccessor(item as ObjectAccessor);
      break;
    case SyntaxKinds.ArrayExpression:
      this.genArrayExpression(item as ArrayExpression);
      break;
    case SyntaxKinds.FunctionExpression:
      this.genFunctionExpression(item as FunctionExpression);
      break;
    case SyntaxKinds.ArrowFunctionExpression:
      this.genArrowFunctionExpression(item as ArrorFunctionExpression);
      break;
    case SyntaxKinds.SpreadElement:
      this.genSpreadElement(item as SpreadElement);
      break;
    case SyntaxKinds.AwaitExpression:
      this.genAwaitExpression(item as AwaitExpression);
      break;
    case SyntaxKinds.NewExpression:
      this.genNewExpression(item as NewExpression);
      break;
    case SyntaxKinds.MemberExpression:
      this.genMemberExpression(item as MemberExpression);
      break;
    case SyntaxKinds.CallExpression:
      this.genCallExpression(item as CallExpression);
      break;
    case SyntaxKinds.ChainExpression:
      this.genChainExpression(item as ChainExpression);
      break;
    case SyntaxKinds.UpdateExpression:
      this.genUpdateExpression(item as UpdateExpression);
      break;
    case SyntaxKinds.UnaryExpression:
      this.genUnaryExpression(item as UnaryExpression);
      break;
    case SyntaxKinds.BinaryExpression:
      this.genBinaryExpression(item as BinaryExpression);
      break;
    case SyntaxKinds.ConditionalExpression:
      this.genConditionalExpression(item as ConditionalExpression);
      break;
    case SyntaxKinds.YieldExpression:
      this.genYieldExpression(item as YieldExpression);
      break;
    case SyntaxKinds.AssigmentExpression:
      this.genAssignmentExpression(item as AssigmentExpression);
      break;
    case SyntaxKinds.SequenceExpression:
      this.genSequenceExpression(item as SequenceExpression);
      break;
    /**
     * Pattern
     */
    case SyntaxKinds.ObjectPattern:
      this.genObjectPattern(item as ObjectPattern);
      break;
  }
}
