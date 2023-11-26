use crate::parser::{Parser, ParserResult};
use crate::ast::stmt::*;
use crate::token::*;
use crate::{expect_token, is_token, is_type_name_token};

impl<'a> Parser<'a> {
    pub (super) fn parse_statement(&mut self) -> ParserResult<Statement<'a>> {
        match self.get_token() {
            TokenKind::BracesLeft => ParserResult::Ok(Statement::CompoundStmt(self.parse_compound_statement()?)),
            TokenKind::If => ParserResult::Ok(Statement::IfStmt(self.parse_if_statement()?)),
            TokenKind::While => ParserResult::Ok(Statement::WhileStmt(self.parse_while_statement()?)),
            TokenKind::Do => ParserResult::Ok(Statement::DoWhileStmt(self.parse_do_while_statement()?)),
            TokenKind::Return => ParserResult::Ok(Statement::ReturnStmt(self.parse_return_statement()?)),
            TokenKind::Break => ParserResult::Ok(Statement::BreakStmt(self.parse_break_statement()?)),
            TokenKind::For => ParserResult::Ok(Statement::ForStmt(self.parse_for_statement()?)),
            TokenKind::Goto => ParserResult::Ok(Statement::GotoStmt(self.parse_goto_statement()?)),
            TokenKind::Continue => ParserResult::Ok(Statement::ContinueStmt(self.parse_continue_statement()?)),
            TokenKind::Identifier => {
                if self.lookahead().kind == TokenKind::Colon {
                    ParserResult::Ok(Statement::LabeledStmt(self.parse_labeled_statement()?))
                }else {
                    ParserResult::Ok(Statement::ExprStmt(self.parse_expr_statement()?))
                }
            }
            _ => ParserResult::Ok(Statement::ExprStmt(self.parse_expr_statement()?)),
        }
    }
    fn parse_if_statement(&mut self) -> ParserResult<IfStatement<'a>> {
        expect_token!(TokenKind::If, self);
        expect_token!(TokenKind::ParenthesesLeft, self);
        let test = self.parse_expr()?;
        expect_token!(TokenKind::ParenthesesRight, self);
        let conseq = self.parse_statement()?;
        if is_token!(TokenKind::Else, self) {
            ParserResult::Ok(IfStatement { test, conseq: Box::new(conseq), alter: Some(Box::new(self.parse_statement()?)) })
        }else {
            ParserResult::Ok(IfStatement{test, conseq: Box::new(conseq), alter: None })
        }
    }
    fn parse_while_statement(&mut self) -> ParserResult<WhileStatement<'a>> {
        expect_token!(TokenKind::While, self);
        expect_token!(TokenKind::ParenthesesLeft, self);
        let test = self.parse_expr()?;
        expect_token!(TokenKind::ParenthesesRight, self);
        let body = self.parse_statement()?;
        ParserResult::Ok(WhileStatement { test, body: Box::new(body) })
    }
    fn parse_do_while_statement(&mut self) -> ParserResult<DoWhileStatement<'a>> {
        expect_token!(TokenKind::Do, self);
        let body = self.parse_statement()?;
        expect_token!(TokenKind::While, self);
        expect_token!(TokenKind::ParenthesesLeft, self);
        let test = self.parse_expr()?;
        expect_token!(TokenKind::ParenthesesRight, self);
        ParserResult::Ok(DoWhileStatement { test, body: Box::new(body) })
    }
    fn parse_break_statement(&mut self) -> ParserResult<BreakStatement> {
        expect_token!(TokenKind::Break, self);
        expect_token!(TokenKind::Semi, self);
        ParserResult::Ok(BreakStatement{})
    }
    fn parse_return_statement(&mut self) -> ParserResult<ReturnStatement<'a>> {
        expect_token!(TokenKind::Return, self);
        if is_token!(TokenKind::Semi, self) {
            self.next_token();
            ParserResult::Ok(ReturnStatement { value: None })
        }else {
            let value = self.parse_expr()?;
            expect_token!(TokenKind::Semi, self);
            ParserResult::Ok(ReturnStatement { value: Some(value)})
        }
    }
    fn parse_for_statement(&mut self) -> ParserResult<ForStatement<'a>> {
        expect_token!(TokenKind::For, self);
        expect_token!(TokenKind::ParenthesesLeft, self);
        let mut init = None;
        let mut test = None;
        let mut update = None;
        // for init.
        if is_token!(TokenKind::Semi, self) {
            self.next_token();
        }else {
            if is_type_name_token!(self) {
                init = Some(DeclarationOrExpression::Declar(self.parse_declaration()?));
            }else {
                init = Some(DeclarationOrExpression::Expr(self.parse_expr()?));
                expect_token!(TokenKind::Semi, self);
            }
        }
        // for test
        if is_token!(TokenKind::Semi, self) {
            self.next_token();
        }else {
            test = Some(self.parse_expr()?);
            expect_token!(TokenKind::Semi, self);
        }
        // for uodate
        if is_token!(TokenKind::ParenthesesRight, self) {
            self.next_token();
        }else {
            update = Some(self.parse_expr()?);
            expect_token!(TokenKind::ParenthesesRight, self);
        }
        let body = self.parse_statement()?;
        ParserResult::Ok(ForStatement { init, test, update, body: Box::new(body) })
    }
    fn parse_continue_statement(&mut self) -> ParserResult<ContinueStatement> {
        expect_token!(TokenKind::Continue, self);
        expect_token!(TokenKind::Semi, self);
        ParserResult::Ok(ContinueStatement{})
    }
    fn parse_goto_statement(&mut self) -> ParserResult<GotoStatement<'a>> {
        expect_token!(TokenKind::Goto, self);
        let label = self.parse_identifier()?;
        expect_token!(TokenKind::Semi, self);
        ParserResult::Ok(GotoStatement { label })
    }
    fn parse_labeled_statement(&mut self) -> ParserResult<LabeledStatement<'a>> {
        let label = self.parse_identifier()?;
        expect_token!(TokenKind::Colon, self);
        let body = self.parse_statement()?;
        ParserResult::Ok(LabeledStatement { label, body: Box::new(body) })
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
    fn parse_expr_statement(&mut self) -> ParserResult<ExpressionStatement<'a>>{
        let expr = self.parse_expr()?;
        expect_token!(TokenKind::Semi, self);
        ParserResult::Ok(ExpressionStatement{ expr })
    }
}