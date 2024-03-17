use std::borrow::Cow;
use crate::token::TokenKind;
use crate::span::Span;
use crate::lexer::Lexer;
use crate::ast::{Program, StatementListItem, ModuleItem};
use crate::ast::declaration::*;
use crate::ast::expression::*;
use crate::parser::context::{ScopeContext, FunctionContext};
use crate::parser::error::ErrorMap;

mod declaration;
mod statement;
mod expression;
mod pattern;
mod context;
mod error;

pub struct Parser<'a> {
    lexer: Lexer<'a>,
    scope_context: Vec<ScopeContext>,
    class_context: Vec<bool>,
    in_operator_stack: Vec<bool>,
    maybe_arrow: bool,
    error_map: ErrorMap,
}

pub type ParserResult<T> = Result<T, &'static str>;

impl <'a> Parser<'a> {
    pub fn new(code: &'a str) -> Self {
        Self {
            lexer: Lexer::new(code),
            scope_context: Vec::with_capacity(10),
            class_context: Vec::with_capacity(10),
            in_operator_stack: Vec::with_capacity(10),
            maybe_arrow: false,
            error_map: ErrorMap::new(),
        }
    }
    /// Compsition method of lexer `lookahead_token`
    fn lookahead_token(&mut self) -> TokenKind {
        self.lexer.lookahead_token()
    }
    /// Composition method od lexer `next_token`
    fn next_token(&mut self) {
        self.lexer.next_token();
    }
    fn get_token(&self) -> TokenKind {
        self.lexer.get_token()
    }
    fn get_token_ref(&self) -> &TokenKind {
        self.lexer.get_token_ref()
    }
    /// Get start span of current token
    fn get_start_span(&self) -> Span {
        self.lexer.get_start_span()
    }
    /// Get start span ref 
    fn get_start_span_ref(&self) -> &Span {
        self.lexer.get_start_span_ref()
    }
    /// Get finish span of current token
    fn get_finish_span(&self) -> Span {
        self.lexer.get_finish_span()
    }
    fn get_finish_span_ref(&self) -> &Span {
        self.lexer.get_finish_span_ref()
    }
    fn get_value(&self, start_offset: usize, finish_offset: usize) -> Cow<'a, str> {
        self.lexer.get_value(start_offset, finish_offset)
    }
    fn get_current_value(&self) -> Cow<'a, str> {
        self.lexer.get_current_value()
    }
    fn get_last_finish_span(&self) -> Span {
        self.lexer.get_last_token_finish_span()
    }
    pub fn parse(&mut self) -> ParserResult<Program<'a>> {
        self.parse_program()
    }
    fn parse_program(&mut self) -> ParserResult<Program<'a>>  {
        let mut body = Vec::new();
        self.enter_function_scope(false, false);
        loop {
            if self.get_token_ref() == &TokenKind::EOFToken {
                break;
            }
            body.push(self.parse_module_item()?);
        }
        self.exit_scope();
        Ok(Program { body })
    }
    fn parse_module_item(&mut self) -> ParserResult<ModuleItem<'a>> {
        Ok(match self.get_token_ref() {
            &TokenKind::ImportKeyword => {
                todo!()
            }
            &TokenKind::ExportKeyword => {
                todo!()
            }
            _ => ModuleItem::StmtItem(self.parse_stmt_list_item()?)
        })
    }
    fn parse_stmt_list_item(&mut self) -> ParserResult<StatementListItem<'a>> {
        Ok(match self.get_token_ref() {
            TokenKind::ConstKeyword | TokenKind::FunctionKeyword | TokenKind::ClassKeyword | TokenKind::VarKeyword => {
               StatementListItem::Declar(self.parse_declaration()?)
            }
            TokenKind::Identifier => {
                if self.get_current_value() == "async" {
                    let token = self.lookahead_token();
                    if token == TokenKind::FunctionKeyword {
                        // TODO: line terminator case
                        StatementListItem::Declar(self.parse_declaration()?)
                    }else {
                        StatementListItem::Stmt(self.parse_stmt()?)
                    }
                }else {
                    StatementListItem::Stmt(self.parse_stmt()?)
                }
            }
            TokenKind::LetKeyword => {
                if self.is_let_keyword_possible_be_identifier() {
                    StatementListItem::Stmt(self.parse_stmt()?)
                }else {
                    StatementListItem::Declar(self.parse_declaration()?)
                }
            }
            _ =>  StatementListItem::Stmt(self.parse_stmt()?)
        })
    }
    fn is_let_keyword_possible_be_identifier(&mut self) -> bool {
        let token= self.lookahead_token();
        match token {
            TokenKind::BracesLeftPunctuator | 
            TokenKind::BracesRightPunctuator |
            TokenKind::Identifier | 
            TokenKind::AwaitKeyword | 
            TokenKind::YieldKeyword  => {
                false
            }
            _ => true
        }
    }
    fn enter_function_scope(&mut self, is_async: bool, is_generator: bool) {
        let in_strict = match self.get_last_function_context_ref() {
            Some(context_ref) => context_ref.in_strict,
            None => false
        };
        self.scope_context.push(ScopeContext::FunctionContext(FunctionContext {
            is_async,
            is_generator,
            in_strict,
            is_simple_parameter: true,
            in_parameter: false,

        }));
    }
    fn enter_block_scope(&mut self) {
        self.scope_context.push(ScopeContext::BlockContext);
    }
    fn exit_scope(&mut self) {
        self.scope_context.pop();
    }
    fn enter_function_parameter(&mut self) {
        if let Some(context_ref) = self.get_last_function_context_ref_mut() {
            context_ref.in_parameter = true;
        }
    }
    fn exist_function_parameter(&mut self) {
        if let Some(context_ref) = self.get_last_function_context_ref_mut() {
            context_ref.in_parameter = false;
        }
    }
    fn set_current_function_context_generator(&mut self) {
        if let Some(context_ref) = self.get_last_function_context_ref_mut() {
            context_ref.is_generator = true;
        }
    }
    fn set_current_function_context_strict_mode(&mut self) {
        if let Some(context_ref) = self.get_last_function_context_ref_mut() {
            context_ref.in_strict = true;
        }
    }
    fn set_current_function_parameter_is_not_simple(&mut self) {
        if let Some(context_ref) = self.get_last_function_context_ref_mut() {
            context_ref.is_simple_parameter = false;
        }    
    }
    fn is_top_level(&mut self) -> bool {
        match self.get_last_function_context_ref() {
            Some(context) => {
                match &self.scope_context[0] {
                    ScopeContext::FunctionContext(top_ref) =>  context == top_ref,
                    _ => false,
                }
            }
            _ => unreachable!()
        }
    }
    fn is_current_function_async(&self) -> bool  {
        match self.get_last_function_context_ref() {
            Some(context_ref) => context_ref.is_async,
            _ => unreachable!()
        }
    }
    fn is_current_function_generator(&self) -> bool  {
        match self.get_last_function_context_ref() {
            Some(context_ref) => context_ref.is_generator,
            _ => unreachable!()
        }
    }
    fn is_in_parameter(&self)-> bool  {
        match self.get_last_function_context_ref() {
            Some(context_ref) => context_ref.in_parameter,
            _ => unreachable!()
        }
    }
    fn is_in_strict_mode(&self) -> bool {
        match self.get_last_function_context_ref() {
            Some(context_ref) => context_ref.in_strict,
            _ => unreachable!()
        }
    }
    fn is_simple_parameter(&self) -> bool {
        match self.get_last_function_context_ref() {
            Some(context_ref) => context_ref.is_simple_parameter,
            _ => unreachable!()
        }
    }
    fn is_parent_function_generator(&self) -> bool {
        match self.get_parent_function_context_ref() {
            Some(context_ref) => context_ref.is_generator, 
            None => false,
        }
    }
    fn is_parent_function_async(&self) -> bool {
        match self.get_parent_function_context_ref() {
            Some(context_ref) => context_ref.is_async,
            None => false,
        }
    }
    fn is_direct_to_function_context(&self) -> bool {
        if let Some(context_ref) = self.scope_context.last() {
            return match context_ref {
                ScopeContext::FunctionContext(_) => true,
                _ => false
            }
        }
        unreachable!();
    }
    fn enter_class_scope(&mut self, is_extend: bool) {
        self.class_context.push(is_extend);
    }
    fn exist_class_scope(&mut self) {
        self.class_context.pop();
    }
    fn is_in_class_context(&self) -> bool {
        self.class_context.last().is_some()
    }
    fn is_current_class_extend(&self) -> bool {
        if let Some(context) = self.class_context.last() {
            context.clone()
        }else {
            false
        }
    }
    fn semi(&mut self) -> ParserResult<()> {
        match self.get_token_ref() {
            TokenKind::SemiPunctuator => {
                self.next_token();
                Ok(())
            }
            TokenKind::BracketRightPunctuator | TokenKind::EOFToken => {
                Ok(())
            }
            _ => {
                if self.lexer.get_line_terminator_flag() {
                    Ok(())
                }else {
                    Err(self.error_map.missing_semicolon)
                }
            }
        }
    }
    fn test_semi(&mut self, can_ignore: bool, should_eat: bool) -> ParserResult<bool> {
        match self.get_token_ref() {
            TokenKind::SemiPunctuator => {
                if should_eat {
                    self.next_token();
                }
                Ok(true)
            }
            TokenKind::BracketRightPunctuator | TokenKind::EOFToken => {
                Ok(true)
            }
            _ => {
                if self.lexer.get_line_terminator_flag() {
                    Ok(true)
                }else {
                    if can_ignore {
                        Ok(false)
                    }else {
                        Err(self.error_map.unexpect_token)
                    }
                }
            }
        }
    }
    fn get_current_in_operator_stack(&self) -> bool {
        self.in_operator_stack.last().unwrap_or(&true).clone()
    }
    fn get_parent_function_context_ref(&self) -> Option<&FunctionContext> {
        let mut len =  if self.scope_context.len() == 0 { return None } else { self.scope_context.len() - 1 };
        let mut flag = false;
        loop {
            if let ScopeContext::FunctionContext(fun_context) = &self.scope_context[len] {
                if flag {
                    return Some(fun_context);
                }
                flag = true;
            }
            if len == 0 {
                break;
            }
            len -= 1;
        }
        None
    }
    fn get_last_function_context_ref(&self) -> Option<&FunctionContext> {
        let mut len =  if self.scope_context.len() == 0 { return None } else { self.scope_context.len() - 1 };
        loop {
            if let ScopeContext::FunctionContext(fun_context) = &self.scope_context[len] {
                return Some(fun_context);
            }
            if len == 0 {
                break;
            }
            len -= 1;
        }
        None
    }
    fn get_last_function_context_ref_mut(&mut self) -> Option<&mut FunctionContext> {
        let mut len =  if self.scope_context.len() == 0 { return None } else { self.scope_context.len() - 1 };
        let mut index = 0;
        let mut is_find = false;
        loop {
            if let ScopeContext::FunctionContext(fun_context) = &self.scope_context[len] {
                is_find = true;
                index = len;
                break;
            }
            if len == 0 {
                break;
            }
            len -= 1;
        }

        if is_find {
            Some(match &mut self.scope_context[index] {
                ScopeContext::FunctionContext(context_ref) => context_ref,
                _ => unreachable!(),
            })
        }else {
            None
        }
    }
}