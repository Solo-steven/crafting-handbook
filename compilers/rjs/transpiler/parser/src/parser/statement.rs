use crate::parser::{Parser, ParserResult};
use crate::ast::statement::*;
use crate::token::TokenKind;

impl<'a> Parser<'a> {
    pub (super) fn parse_stmt(&mut self) -> ParserResult<Statement<'a>> {
        Ok(match self.get_token_ref() {
            TokenKind::BracketLeftPunctuator => Statement::BlockStmt(self.parse_block_stmt()?),
            TokenKind::BreakKeyword => Statement::BreakStmt(self.parse_break_stmt()?),
            TokenKind::ContinueKeyword => Statement::ContinueStmt(self.parse_continue_stmt()?),
            TokenKind::ReturnKeyword => Statement::ReturnStmt(self.parse_return_stmt()?),
            TokenKind::TryKeyword => Statement::TryStmt(self.parse_try_stmt()?),
            TokenKind::ThrowKeyword => todo!(),
            TokenKind::WithKeyword => todo!(),
            TokenKind::DebuggerKeyword => Statement::DebuggerStmt(self.parse_debugger_stmt()?),
            TokenKind::SemiPunctuator => Statement::EmptyStmt(self.parse_empty_stmt()?),
            TokenKind::IfKeyword => Statement::IfStmt(self.parse_if_stmt()?),
            TokenKind::ForKeyword => Statement::ForStmt(self.parse_for_stmt()?),
            TokenKind::WhileKeyword => Statement::WhileStmt(self.parse_while_stmt()?),
            TokenKind::DoKeyword => Statement::DoWhileStmt(self.parse_do_while_stmt()?),
            _ => {
                Statement::ExprStmt(self.parse_expr_stmt()?)
            }
        })
    }
    fn parse_block_stmt(&mut self) -> ParserResult<BlockStatement<'a>> {
        todo!()
    }
    fn parse_break_stmt(&mut self) -> ParserResult<BreakStatement<'a>> {
        todo!()
    }
    fn parse_continue_stmt(&mut self) -> ParserResult<ContinueStatement<'a>> {
        todo!()
    }
    fn parse_return_stmt(&mut self) -> ParserResult<ReturnStatement<'a>> {
        todo!()
    }
    fn parse_try_stmt(&mut self) -> ParserResult<TryStatement<'a>> {
        todo!()
    }
    fn parse_debugger_stmt(&mut self) -> ParserResult<DebuggerStatement> {
        todo!()
    }
    fn parse_empty_stmt(&mut self) -> ParserResult<EmptyStatement> {
        todo!()
    }
    fn parse_if_stmt(&mut self) -> ParserResult<IfStatement<'a>> {
        todo!()
    }
    fn parse_for_stmt(&mut self) -> ParserResult<ForStatement<'a>> {
        todo!()
    }
    fn parse_while_stmt(&mut self) -> ParserResult<WhileStatement<'a>> {
        todo!()
    }
    fn parse_do_while_stmt(&mut self) -> ParserResult<DoWhileStatement<'a>> {
        todo!()
    }
    fn parse_expr_stmt(&mut self) -> ParserResult<ExpressionStatement<'a>> {
        todo!()
    }
}