use crate::parser::Parser;
use crate::ast::expression::{Expression, ExprORPat};

impl<'a> Parser<'a> {
    pub (super) fn to_assignment_pattern(&mut self,  node: Expression<'a>) -> ExprORPat<'a> {
        todo!();
    }
}