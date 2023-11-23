mod expr;
mod declar;
mod stmt;

use std::borrow::Cow;

use crate::ast::declar::ValueType;
use crate::ast::stmt::*;
use crate::ast::*;
use crate::lexer::*;
use crate::token::*;
pub struct Parser<'a> {
    lexer: Lexer<'a>,
    cache_type_name: Option<ValueType<'a>>,
}

pub type ParserResult<T> = Result<T, String>;

impl<'a> Parser<'a> {
    pub fn new(source: &'a str)  -> Self {
        Self {
            lexer: Lexer::new(source),
            cache_type_name: None,
        }
    }
    /// parse source into program ast.
    pub fn parse(&mut self) -> ParserResult<Program<'a>> {
        self.parse_program()
    }
    /// Composition method for `lexer.get_token`.
    fn get_token(&self) -> TokenKind {
        self.lexer.get_token()
    }
    /// Composition method for `lexer.next_token`.
    fn next_token(&mut self) -> TokenKind {
        self.lexer.next_token()
    }
    /// Composition method for `lexer.get_raw_value`.
    fn get_raw_value(&self) -> Cow<'a, str> {
        self.lexer.get_raw_value()
    }
    /// Composition method for `lexer.lookahead`.
    fn lookahead(&mut self) -> TokenWithSpan {
        self.lexer.lookahead()
    }
    /// entry method for parse a program (top-level ast element).
    fn parse_program(&mut self) -> ParserResult<Program<'a>> {
        let mut body = Vec::new();
        loop {
            match self.get_token() {
                TokenKind::EOFToken => break,
                _ => body.push(self.parse_block_item()?)
            }
        }
        ParserResult::Ok(Program { body })
    }
    /// 
    fn parse_block_item(&mut self) -> ParserResult<BlockItem<'a>> {
        match self.get_token() {
            TokenKind::Struct | TokenKind::Enum | TokenKind::Union | 
            TokenKind::Char | TokenKind::Unsigned | TokenKind::Signed |
            TokenKind::Int | TokenKind::Long | TokenKind::Short |
            TokenKind::Float | TokenKind::Double  => ParserResult::Ok(BlockItem::Declar(self.parse_declaration()?)),
            TokenKind::Typedef  => {
                todo!();
            }
            TokenKind::Auto | TokenKind::Register | TokenKind::Extern => {
                todo!();
            }
            _ => ParserResult::Ok(BlockItem::Stmt( Statement::ExprStmt(self.parse_expr_statement()?))),
        }
    }
}