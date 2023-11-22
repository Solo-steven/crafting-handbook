pub mod declar;
pub mod stmt;
pub mod expr;

use serde::{Deserialize, Serialize};
use crate::ast::declar::Declaration;
use crate::ast::stmt::Statement;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Program<'a> {
    pub body: Vec<BlockItem<'a>>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum BlockItem<'a>{
   Stmt(Statement<'a>),
   Declar(Declaration<'a>),
}
