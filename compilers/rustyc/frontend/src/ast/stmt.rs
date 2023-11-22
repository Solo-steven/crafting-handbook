use serde::{Deserialize, Serialize};
use crate::ast::expr::Expression;
use crate::ast::BlockItem;

/** ==========================
 *  Statements
 * ==========================
 */
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Statement<'a> {
    CompoundStmt(CompoundStatement<'a>),
    ExprStmt(ExpressionStatement<'a>)

}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CompoundStatement<'a> {
    pub body: Vec<BlockItem<'a>>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ExpressionStatement<'a> {
    pub expr: Expression<'a>
}