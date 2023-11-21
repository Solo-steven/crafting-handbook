use crate::ast::expr::Expression;

/** ==========================
 *  Statements
 * ==========================
 */
#[derive(Debug, Clone, PartialEq)]
pub enum Statement {
    CompoundStmt(CompoundStatement),
    ExprStmt

}
#[derive(Debug, Clone, PartialEq)]
pub struct CompoundStatement {

}
#[derive(Debug, Clone, PartialEq)]
pub struct ExpressionStatement<'a> {
    pub expr: Expression<'a>
}