use crate::ast::expression::{Expression, Identifier, Pattern};
use crate::ast::declaration::VariableDeclaration;
use crate::ast::StatementListItem;
use serde::{Deserialize, Serialize};

use super::declaration::FunctionDeclaration;

#[derive(Debug, Clone, PartialEq, Deserialize, Serialize,)]
pub struct IfStatement<'a> {
    pub test: Expression<'a>,
    pub conseq: Box<Statement<'a>>,
    pub alter: Option<Box<Statement<'a>>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct BlockStatement<'a> {
    pub body: Vec<StatementListItem<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct SwitchStatement<'a> {
    pub deicriminant: Expression<'a>,
    pub cases: Vec<SwitchCase<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct SwitchCase<'a> {
    pub test: Option<Expression<'a>>,
    pub conseq: Vec<StatementListItem<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize )]
pub struct ContinueStatement<'a> {
    pub label: Option<Identifier<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct BreakStatement<'a> {
    pub label: Option<Identifier<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ReturnStatement<'a> {
    pub argument: Option<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct LabeledStatement<'a> {
    pub label: Identifier<'a>,
    pub body: LabeldItem<'a>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
#[serde(untagged)]
pub enum LabeldItem<'a> {
    Stmt(Box<Statement<'a>>),
    FunDeclar(FunctionDeclaration<'a>),
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct WhileStatement<'a> {
    pub test: Expression<'a>,
    pub body: Box<Statement<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct DoWhileStatement<'a> {
    pub test: Expression<'a>,
    pub body: Box<Statement<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct TryStatement<'a> {
    pub block: BlockStatement<'a>,
    pub handler: Option<CatchClause<'a>>,
    pub finalizer: Option<BlockStatement<'a>>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ThrowStatement<'a> {
    pub argument: Expression<'a>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct CatchClause<'a> {
    pub param: Option<Pattern<'a>>,
    pub block: BlockStatement<'a>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ExpressionStatement<'a> {
    pub expr: Expression<'a>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct DebuggerStatement;
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct EmptyStatement;
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ForStatement<'a> {
    pub init: Option<ForInit<'a>>,
    pub test: Option<Expression<'a>>,
    pub update: Option<Expression<'a>>,
    pub body: Box<Statement<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ForOfStatement<'a> {
    pub left: ForInit<'a>,
    pub right: Expression<'a>,
    pub is_async: bool,
    pub body: Box<Statement<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ForInStatement<'a> {
    pub left: ForInit<'a>,
    pub right: Expression<'a>,
    pub body: Box<Statement<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub enum ForInit<'a> {
    Expr(Expression<'a>),
    Var(VariableDeclaration<'a>),
    Pat(Pattern<'a>),
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub enum ForRelateStatement<'a> {
    For(ForStatement<'a>),
    ForIn(ForInStatement<'a>),
    ForOf(ForOfStatement<'a>)
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
#[serde(tag="type")]
pub enum Statement<'a> {
    #[serde(rename="IfStatement")]
    IfStmt(IfStatement<'a>),
    #[serde(rename="BlockStatement")]
    BlockStmt(BlockStatement<'a>),
    #[serde(rename="SwitchStatement")]
    SwitchStmt(SwitchStatement<'a>),
    #[serde(rename="ContinueStatement")]
    ContinueStmt(ContinueStatement<'a>),
    #[serde(rename="BreakStatement")]
    BreakStmt(BreakStatement<'a>),
    #[serde(rename="ReturnStatement")]
    ReturnStmt(ReturnStatement<'a>),
    #[serde(rename="LabeledStatement")]
    LabeledStmt(LabeledStatement<'a>),
    #[serde(rename="WhileStatement")]
    WhileStmt(WhileStatement<'a>),
    #[serde(rename="DoWhileStatement")]
    DoWhileStmt(DoWhileStatement<'a>),
    #[serde(rename="TryStatement")]
    TryStmt(TryStatement<'a>),
    #[serde(rename="DebuggerStatement")]
    DebuggerStmt(DebuggerStatement),
    #[serde(rename="EmptyStatement")]
    EmptyStmt(EmptyStatement),
    #[serde(rename="ExpressionStatement")]
    ExprStmt(ExpressionStatement<'a>),
    #[serde(rename="ForStatement")]
    ForStmt(ForStatement<'a>),
    #[serde(rename="ForInStatement")]
    ForInStmt(ForInStatement<'a>),
    #[serde(rename="ForOfStatement")]
    ForOfStmt(ForOfStatement<'a>),
}