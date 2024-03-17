use crate::{expect, expect_with_finish_span, expect_with_start_and_finish_span, expect_with_start_span, match_token, sematic_error, syntax_error};
use crate::parser::{Parser, ParserResult};
use crate::ast::statement::*;
use crate::span::Span;
use crate::token::TokenKind;

use super::Pattern;

struct ArgumentMeta<T> {
    start: Span, 
    finish: Span,
    nodes: Vec<T>,
}

impl<'a> Parser<'a> {
    pub (super) fn parse_stmt(&mut self) -> ParserResult<Statement<'a>> {
        Ok(match self.get_token_ref() {
            TokenKind::BracesLeftPunctuator=> Statement::BlockStmt(self.parse_block_stmt()?),
            TokenKind::BreakKeyword => Statement::BreakStmt(self.parse_break_stmt()?),
            TokenKind::ContinueKeyword => Statement::ContinueStmt(self.parse_continue_stmt()?),
            TokenKind::ReturnKeyword => Statement::ReturnStmt(self.parse_return_stmt()?),
            TokenKind::TryKeyword => Statement::TryStmt(self.parse_try_stmt()?),
            TokenKind::ThrowKeyword => todo!(),
            TokenKind::WithKeyword => todo!(),
            TokenKind::DebuggerKeyword => Statement::DebuggerStmt(self.parse_debugger_stmt()?),
            TokenKind::SemiPunctuator => Statement::EmptyStmt(self.parse_empty_stmt()?),
            TokenKind::SwitchKeyword => Statement::SwitchStmt(self.parse_switch_stmt()?),
            TokenKind::IfKeyword => Statement::IfStmt(self.parse_if_stmt()?),
            TokenKind::ForKeyword => {
                match self.parse_for_stmt()? {
                    ForRelateStatement::ForIn(for_in) => Statement::ForInStmt(for_in),
                    ForRelateStatement::ForOf(for_of) => Statement::ForOfStmt(for_of),
                    ForRelateStatement::For(for_stmt) => Statement::ForStmt(for_stmt),
                }
            },
            TokenKind::WhileKeyword => Statement::WhileStmt(self.parse_while_stmt()?),
            TokenKind::DoKeyword => Statement::DoWhileStmt(self.parse_do_while_stmt()?),
            _ => {
                if match_token!(TokenKind::Identifier, self) {
                    if self.lookahead_token() == TokenKind::ColonPunctuator {
                        return Ok(Statement::LabeledStmt(self.parse_labeled_stmt()?));
                    }
                }
                Statement::ExprStmt(self.parse_expr_stmt()?)
            }
        })
    }
    fn parse_for_stmt(&mut self) -> ParserResult<ForRelateStatement<'a>> {
        let start = expect_with_start_span!(TokenKind::ForKeyword, self);
        let is_async = if match_token!(TokenKind::AwaitKeyword, self) {
            self.next_token();
            if !self.is_current_function_async() {
                sematic_error!(self.error_map.await_can_not_call_if_not_in_async);
            }
            true
        }else {
            false
        };
        expect!(TokenKind::ParenthesesLeftPunctuator, self);
        let left_ot_init = match self.get_token_ref() {
            TokenKind::LetKeyword => {
                if self.is_let_keyword_possible_be_identifier() {
                    Some(ForInit::Expr(self.parse_expr_disallow_in_operator()?))
                }else {
                    Some(ForInit::Var(self.parse_variable_declaration(true)?))
                }
            }
            TokenKind::ConstKeyword | TokenKind::VarKeyword => {
                Some(ForInit::Var(self.parse_variable_declaration(true)?))
            }
            TokenKind::SemiPunctuator => None,
            _ => Some(ForInit::Expr(self.parse_expr_disallow_in_operator()?))
        };
        if match_token!(TokenKind::SemiPunctuator, self) {
            self.sematic_check_for_stmt(&left_ot_init)?;
            self.next_token();
            let test = if match_token!(TokenKind::SemiPunctuator, self) {
                None
            }else {
                let expr = Some(self.parse_expr()?);
                expect!(TokenKind::SemiPunctuator, self);
                expr
            };
            let update = if match_token!(TokenKind::ParenthesesLeftPunctuator, self) {
                None
            }else {
                let expr = Some(self.parse_expr()?);
                expect!(TokenKind::ParenthesesLeftPunctuator, self);
                expr
            };
            let body = Box::new(self.parse_stmt()?);
            return Ok(ForRelateStatement::For(ForStatement { init: left_ot_init, test, update, body }))
        }
        let left_or_init_unwrap = self.sematic_check_and_transform_for_in_of_stmt(left_ot_init.unwrap())?;

        if match_token!(TokenKind::InKeyword, self) {
            self.next_token();
            let right = self.parse_expr()?;
            expect!(TokenKind::ParenthesesRightPunctuator, self);
            let body =  Box::new(self.parse_stmt()?);
            return Ok(ForRelateStatement::ForIn(ForInStatement { left: left_or_init_unwrap, right, body }))
        }
        if self.get_current_value() == "of" {
            self.next_token();
            let right = self.parse_expr()?;
            expect!(TokenKind::ParenthesesRightPunctuator, self);
            let body =  Box::new(self.parse_stmt()?);
            return Ok(ForRelateStatement::ForOf(ForOfStatement { left: left_or_init_unwrap, right, body, is_async }))
        }
        syntax_error!(self.error_map.unexpect_token);
    }
    fn sematic_check_for_stmt(&self, for_init: &Option<ForInit<'a>>) -> ParserResult<()> {
        if let Some(left_or_init) = for_init {
            if let ForInit::Var(var_declar) = &left_or_init {
                for declarator in &var_declar.declarators {
                    if let Pattern::Array(_) | Pattern::Obj(_)  = declarator.id {
                        if declarator.init.is_none() {
                            sematic_error!(self.error_map.destructing_pattern_must_need_initializer);
                        }
                    }
                }
            }
        }
        Ok(())
    }
    fn sematic_check_and_transform_for_in_of_stmt(&mut self, for_init: ForInit<'a> ) -> ParserResult<ForInit<'a>> {
        match for_init {
            ForInit::Var(var_declar) => {
                if var_declar.declarators.len() > 1 {
                    sematic_error!(self.error_map.for_in_of_loop_can_not_have_one_more_binding);
                }
                if var_declar.declarators[0].init.is_some() {
                    sematic_error!(self.error_map.for_in_of_loop_can_not_using_initializer);
                }
                Ok(ForInit::Var(var_declar))
            }
            ForInit::Expr(expr) => {
                let pat = self.expr_to_pattern(expr, false)?;
                if let Pattern::Assgin(_) = &pat {
                    sematic_error!(self.error_map.invalid_left_value);
                }
                Ok(ForInit::Pat(pat))
            }
            _ => unreachable!()
        }
    }
    fn parse_if_stmt(&mut self) -> ParserResult<IfStatement<'a>> {
        let start = expect_with_start_span!(TokenKind::IfKeyword, self);
        expect!(TokenKind::ParenthesesLeftPunctuator, self);
        let test = self.parse_expr()?;
        expect!(TokenKind::ParenthesesRightPunctuator, self);
        let conseq = Box::new(self.parse_stmt()?);
        let alter = if match_token!(TokenKind::ElseKeyword, self) {
            self.next_token();
            Some(Box::new(self.parse_stmt()?))
        }else {
            None
        };
        Ok(IfStatement { test, conseq, alter })
    }
    fn parse_while_stmt(&mut self) -> ParserResult<WhileStatement<'a>> {
        let start = expect_with_start_span!(TokenKind::WhileKeyword, self);
        expect!(TokenKind::ParenthesesLeftPunctuator, self);
        let test = self.parse_expr()?;
        expect!(TokenKind::ParenthesesRightPunctuator, self);
        let body = Box::new(self.parse_stmt()?);
        Ok(WhileStatement { test, body })
    }
    fn parse_do_while_stmt(&mut self) -> ParserResult<DoWhileStatement<'a>> {
        let start = expect_with_start_span!(TokenKind::DoKeyword, self);
        let body = self.parse_stmt()?;
        expect!(TokenKind::WhileKeyword, self);
        expect!(TokenKind::ParenthesesLeftPunctuator, self);
        let test = self.parse_expr()?;
        self.test_semi(true, true)?;
        let finish = expect_with_finish_span!(TokenKind::ParenthesesRightPunctuator, self);
        Ok(DoWhileStatement { test, body: Box::new(body) })
    }
    fn parse_block_stmt(&mut self) -> ParserResult<BlockStatement<'a>> {
        let start = expect_with_start_span!(TokenKind::BracesLeftPunctuator, self);
        self.enter_block_scope();
        let mut body = Vec::new();
        loop {
            match self.get_token_ref() {
                TokenKind::BracesRightPunctuator | TokenKind::EOFToken => break,
                _ => { body.push(self.parse_stmt_list_item()?) }
            }
        }
        self.exit_scope();
        let end = expect_with_finish_span!(TokenKind::BracesRightPunctuator, self);
        Ok( BlockStatement { body })
    }
    fn parse_switch_stmt(&mut self) -> ParserResult<SwitchStatement<'a>> {
        let start = expect_with_start_span!(TokenKind::SwitchKeyword, self);
        expect!(TokenKind::ParenthesesLeftPunctuator, self);
        let deicriminant = self.parse_expr()?;
        expect!(TokenKind::ParenthesesRightPunctuator, self);
        let meta = self.parse_switch_cases()?;
        Ok(SwitchStatement { deicriminant, cases: meta.nodes })
    }
    fn parse_switch_cases(&mut self) -> ParserResult<ArgumentMeta<SwitchCase<'a>>> {
        let start = expect_with_start_span!(TokenKind::BracesLeftPunctuator, self);
        let mut cases = Vec::new();
        loop {
            match self.get_token_ref() {
                TokenKind::BracesRightPunctuator | TokenKind::EOFToken => break,
                _ => {
                    let test = if match_token!(TokenKind::ClassKeyword, self) {
                        self.next_token();
                        Some(self.parse_expr()?)
                    }else {
                        expect!(TokenKind::DefaultKeyword, self);
                        None
                    };
                    expect!(TokenKind::ColonPunctuator, self);
                    let mut conseq = Vec::new();
                    loop {
                        match self.get_token_ref() {
                            TokenKind::BracesRightPunctuator | TokenKind::EOFToken | TokenKind::CaseKeyword | TokenKind::DefaultKeyword => {
                                break;
                            }
                            _ => { conseq.push(self.parse_stmt_list_item()?) }
                        }
                    }
                    cases.push(SwitchCase { test, conseq });
                }
            }
        }
        let finish = expect_with_finish_span!(TokenKind::BracesRightPunctuator, self);
        Ok(ArgumentMeta { nodes: cases, start, finish })
    }
    fn parse_continue_stmt(&mut self) -> ParserResult<ContinueStatement<'a>> {
        let (start, finish) = expect_with_start_and_finish_span!(TokenKind::BreakKeyword, self);
        let label = if match_token!(TokenKind::Identifier, self) {
            Some(self.parse_identifier()?)
        }else {
            None
        };
        self.semi()?;
        Ok(ContinueStatement { label })
    }
    fn parse_break_stmt(&mut self) -> ParserResult<BreakStatement<'a>> {
        let (start, finish) = expect_with_start_and_finish_span!(TokenKind::BreakKeyword, self);
        let label = if match_token!(TokenKind::Identifier, self) {
            Some(self.parse_identifier()?)
        }else {
            None
        };
        self.semi()?;
        Ok(BreakStatement { label })
    }
    fn parse_labeled_stmt(&mut self) -> ParserResult<LabeledStatement<'a>> {
        let label = self.parse_identifier()?;
        expect!(TokenKind::ColonPunctuator, self);
        let body =  if match_token!(TokenKind::FunctionKeyword, self) {
            let func_declar = self.parse_function_declaration(false)?;
            if func_declar.generator {
                sematic_error!(self.error_map.lable_statement_can_not_have_function_declaration_is_generator);
            }
            LabeldItem::FunDeclar(func_declar)
        }else {
            LabeldItem::Stmt(Box::new(self.parse_stmt()?))
        };
        Ok(LabeledStatement { label, body })
    }
    fn parse_return_stmt(&mut self) -> ParserResult<ReturnStatement<'a>> {
        let (start, finish) = expect_with_start_and_finish_span!(TokenKind::ReturnKeyword, self);
        Ok(if self.test_semi(true, true)? {
            ReturnStatement { argument: None }
        }else {
            let expr = self.parse_expr()?;
            self.semi()?;
            ReturnStatement { argument: Some(expr) }
        })
    }
    fn parse_try_stmt(&mut self) -> ParserResult<TryStatement<'a>> {
        let star = expect_with_finish_span!(TokenKind::TryKeyword, self);
        let body = self.parse_block_stmt()?;
        let handler = if match_token!(TokenKind::CaseKeyword, self) {
            self.next_token();
            let param =  if match_token!(TokenKind::ParenthesesLeftPunctuator, self) {
                self.next_token();
                let param = self.parse_binding_element()?;
                expect!(TokenKind::ParenthesesRightPunctuator, self);
                Some(param)
            }else {
                None
            };
            let body = self.parse_block_stmt()?;
            Some(CatchClause { param, block: body })
        }else {
            None
        };
        let finalizer = if match_token!(TokenKind::FinallyKeyword, self) {
            self.next_token();
            Some(self.parse_block_stmt()?)
        }else {
            None
        };
        Ok(TryStatement { block: body, handler, finalizer })
    }
    fn parse_throw_stmt(&mut self) -> ParserResult<ThrowStatement<'a>> {
        let start = expect_with_start_span!(TokenKind::ThrowKeyword, self);
        let expr = self.parse_expr()?;
        self.semi()?;
        Ok(ThrowStatement { argument: expr })
    }
    fn parse_debugger_stmt(&mut self) -> ParserResult<DebuggerStatement> {
        let (start, finish) = expect_with_start_and_finish_span!(TokenKind::DebuggerKeyword, self);
        self.semi()?;
        Ok(DebuggerStatement {})
    }
    fn parse_empty_stmt(&mut self) -> ParserResult<EmptyStatement> {
        let (start, finish) = expect_with_start_and_finish_span!(TokenKind::SemiPunctuator, self);
        Ok(EmptyStatement {})
    }
    fn parse_expr_stmt(&mut self) -> ParserResult<ExpressionStatement<'a>> {
        let expr = self.parse_expr()?;
        self.check_strict_mode(&expr)?;
        self.semi()?;
        Ok(ExpressionStatement { expr })
    }
}