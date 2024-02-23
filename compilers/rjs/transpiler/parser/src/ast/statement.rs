use crate::ast::expression::{Expression, Identifier, Pattern};
use crate::ast::declaration::VariableDeclaration;
use crate::ast::StatementListItem;

#[derive(Debug, Clone, PartialEq)]
pub struct IfStatement<'a> {
    pub test: Expression<'a>,
    pub conseq: Box<Statement<'a>>,
    pub alter: Box<Statement<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct BlockStatement<'a> {
    pub body: Vec<StatementListItem<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct SwitchStatement<'a> {
    pub deicriminant: Expression<'a>,
    pub cases: Vec<SwitchCase<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct SwitchCase<'a> {
    pub test: Option<Expression<'a>>,
    pub conseq: Vec<StatementListItem<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct ContinueStatement<'a> {
    pub label: Identifier<'a>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct BreakStatement<'a> {
    pub label: Identifier<'a>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct ReturnStatement<'a> {
    pub argument: Option<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct LabeledStatement<'a> {
    pub label: Identifier<'a>,
    pub body: Box<Statement<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct WhileStatement<'a> {
    pub test: Expression<'a>,
    pub body: Box<Statement<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct DoWhileStatement<'a> {
    pub test: Expression<'a>,
    pub body: Box<Statement<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct TryStatement<'a> {
    pub block: BlockStatement<'a>,
    pub handler: Option<CatchClause<'a>>,
    pub finalizer: Option<BlockStatement<'a>>
}
#[derive(Debug, Clone, PartialEq)]
pub struct CatchClause<'a> {
    pub param: Option<Pattern<'a>>,
    pub block: BlockStatement<'a>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct ExpressionStatement<'a> {
    pub expr: Expression<'a>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct DebuggerStatement;
#[derive(Debug, Clone, PartialEq)]
pub struct EmptyStatement;
#[derive(Debug, Clone, PartialEq)]
pub struct ForStatement<'a> {
    pub init: ForInit<'a>,
    pub test: Option<Expression<'a>>,
    pub update: Option<Expression<'a>>,
    pub body: Box<Statement<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct ForOfStatement<'a> {
    pub left: ForInit<'a>,
    pub right: Expression<'a>,
    pub is_async: bool,
    pub body: Box<Statement<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct ForInStatement<'a> {
    pub left: ForInit<'a>,
    pub right: Expression<'a>,
    pub body: Box<Statement<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub enum ForInit<'a> {
    Expr(Expression<'a>),
    Var(VariableDeclaration<'a>)
}
#[derive(Debug, Clone, PartialEq)]
pub enum Statement<'a> {
    IfStmt(IfStatement<'a>),
    BlockStmt(BlockStatement<'a>),
    SwitchStmt(SwitchStatement<'a>),
    ContinueStmt(ContinueStatement<'a>),
    BreakStmt(BreakStatement<'a>),
    ReturnStmt(ReturnStatement<'a>),
    LabeledStmt(LabeledStatement<'a>),
    WhileStmt(WhileStatement<'a>),
    DoWhileStmt(DoWhileStatement<'a>),
    TryStmt(TryStatement<'a>),
    DebuggerStmt(DebuggerStatement),
    EmptyStmt(EmptyStatement),
    ExprStmt(ExpressionStatement<'a>),
    ForStmt(ForStatement<'a>),
    ForInStmt(ForInStatement<'a>),
    ForOfStmt(ForOfStatement<'a>),
}