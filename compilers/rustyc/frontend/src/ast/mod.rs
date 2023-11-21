pub mod declar;
pub mod stmt;
pub mod expr;

use crate::span::Span;
use crate::ast::declar::Declaration;
use crate::ast::stmt::Statement;

#[derive(Debug, Clone, PartialEq)]
pub struct Program<'a> {
    body: Vec<BlockItem<'a>>
}
#[derive(Debug, Clone, PartialEq)]
pub enum BlockItem<'a>{
   Stmt(Statement),
   Declar(Declaration<'a>),
}
