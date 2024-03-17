pub mod statement;
pub mod expression;
pub mod declaration;

use crate::ast::statement::Statement;
use crate::ast::declaration::{Declaration, ImportDeclaration, ExportDeclaration};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq,Deserialize, Serialize)]
#[serde(untagged)]
pub enum StatementListItem<'a> {
    Stmt(Statement<'a>),
    Declar(Declaration<'a>)
}
#[derive(Debug, Clone, PartialEq,Deserialize, Serialize)]
#[serde(untagged)]
pub enum ModuleItem<'a> {
    StmtItem(StatementListItem<'a>),
    Import(ImportDeclaration<'a>),
    Export(ExportDeclaration<'a>)
}
#[derive(Debug, Clone, PartialEq,Deserialize, Serialize)]
pub struct Program<'a> {
    pub body: Vec<ModuleItem<'a>>
}