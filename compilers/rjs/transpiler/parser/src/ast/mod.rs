pub mod statement;
pub mod expression;
pub mod declaration;

use crate::ast::statement::Statement;
use crate::ast::declaration::{Declaration, ImportDeclaration, ExportDeclaration};
#[derive(Debug, Clone, PartialEq)]
pub enum StatementListItem<'a> {
    Stmt(Statement<'a>),
    Declar(Declaration<'a>)
}
#[derive(Debug, Clone, PartialEq)]
pub enum ModuleItem<'a> {
    Stmt(Statement<'a>),
    Declar(Declaration<'a>),
    Export(ExportDeclaration<'a>),
    Import(ImportDeclaration<'a>),
}
#[derive(Debug, Clone, PartialEq)]
pub struct Program<'a> {
    pub body: Vec<ModuleItem<'a>>
}