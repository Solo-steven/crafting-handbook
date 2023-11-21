use crate::parser::{Parser, ParserResult};
use crate::ast::stmt::*;
use crate::token::*;
use crate::{expect_token, is_token};


impl<'a> Parser<'a> {
    pub (super) fn parse_compound_statement(&mut self) -> ParserResult<CompoundStatement> {
        expect_token!(TokenKind::BracesLeft, self);
        loop {
            // break loop if meeted  `}`
            if is_token!(TokenKind::BracesRight, self) {
                self.next_token();
                break;
            }
            // parse item
        }
        Ok(CompoundStatement {  })
    }
    pub (super) fn parse_expr_statement(&mut self) -> ParserResult<ExpressionStatement> {
        let expr = self.parse_expr()?;
        println!("{:?}", expr);
        expect_token!(TokenKind::Semi, self);
        ParserResult::Ok(ExpressionStatement{ expr })
    }
}