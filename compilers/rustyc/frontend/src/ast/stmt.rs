use serde::{Deserialize, Serialize};
use crate::ast::expr::Expression;
use crate::ast::BlockItem;

use super::declar::Declaration;
use super::expr::Identifier;
/** ==========================
 *  Statements
 * ==========================
 */
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Statement<'a> {
    CompoundStmt(CompoundStatement<'a>),
    ExprStmt(ExpressionStatement<'a>),
    IfStmt(IfStatement<'a>),
    WhileStmt(WhileStatement<'a>),
    DoWhileStmt(DoWhileStatement<'a>),
    ForStmt(ForStatement<'a>),
    ReturnStmt(ReturnStatement<'a>),
    BreakStmt(BreakStatement),
    ContinueStmt(ContinueStatement),
    GotoStmt(GotoStatement<'a>),
    LabeledStmt(LabeledStatement<'a>),
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CompoundStatement<'a> {
    pub body: Vec<BlockItem<'a>>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct IfStatement<'a> {
    pub test: Expression<'a>,
    pub conseq: Box<Statement<'a>>,
    pub alter: Option<Box<Statement<'a>>>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct WhileStatement<'a> {
    pub test: Expression<'a>,
    pub body: Box<Statement<'a>>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DoWhileStatement<'a> {
    pub test: Expression<'a>,
    pub body: Box<Statement<'a>>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BreakStatement;
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ContinueStatement;
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ReturnStatement<'a> {
    pub value: Option<Expression<'a>>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ExpressionStatement<'a> {
    pub expr: Expression<'a>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ForStatement<'a> {
    pub init: Option<DeclarationOrExpression<'a>>,
    pub test: Option<Expression<'a>>,
    pub update: Option<Expression<'a>>,
    pub body: Box<Statement<'a>>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum DeclarationOrExpression<'a> {
    Declar(Declaration<'a>),
    Expr(Expression<'a>)
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GotoStatement<'a> {
    pub label: Identifier<'a>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct LabeledStatement<'a> {
    pub label: Identifier<'a>,
    pub body: Box<Statement<'a>>
}