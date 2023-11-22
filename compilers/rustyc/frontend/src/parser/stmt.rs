use crate::parser::{Parser, ParserResult};
use crate::ast::stmt::*;
use crate::token::*;
use crate::{expect_token, is_token};

impl<'a> Parser<'a> {
    pub (super) fn parse_statement(&mut self) {
        match self.get_token() {
            TokenKind::ParenthesesLeft => {},
            TokenKind::While => {},
            TokenKind::Do => {},
            TokenKind::If => {},
            TokenKind::Switch => {},
            _ => {}
        }
    }
    pub (super) fn parse_compound_statement(&mut self) -> ParserResult<CompoundStatement<'a>> {
        expect_token!(TokenKind::BracesLeft, self);
        let mut body = Vec::new();
        loop {
            // break loop if meeted  `}`
            if is_token!(TokenKind::BracesRight, self) {
                self.next_token();
                break;
            }
            // parse item
            loop {
                match self.get_token() {
                    TokenKind::BracesRight => break,
                    _ => body.push(self.parse_block_item()?)
                }
            }
        }
        Ok(CompoundStatement {  body })
    }
    pub (super) fn parse_expr_statement(&mut self) -> ParserResult<ExpressionStatement<'a>>{
        let expr = self.parse_expr()?;
        expect_token!(TokenKind::Semi, self);
        ParserResult::Ok(ExpressionStatement{ expr })
    }
}