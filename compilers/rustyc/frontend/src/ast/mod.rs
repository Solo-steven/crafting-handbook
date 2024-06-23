pub mod declar;
pub mod expr;
pub mod stmt;

use crate::ast::declar::Declaration;
use crate::ast::stmt::Statement;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Program<'a> {
    pub body: Vec<BlockItem<'a>>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum BlockItem<'a> {
    Stmt(Statement<'a>),
    Declar(Declaration<'a>),
}
