mod expr;
mod declar;
mod stmt;

use std::borrow::Cow;

use crate::ast::declar::*;
use crate::ast::*;
use crate::lexer::*;
use crate::token::*;
pub struct Parser<'a> {
    lexer: Lexer<'a>,
    cache_type_name: Option<ValueType<'a>>,
    storage_class_specifier: Option<StorageClassSpecifier>,
}

pub type ParserResult<T> = Result<T, String>;

impl<'a> Parser<'a> {
    pub fn new(source: &'a str)  -> Self {
        Self {
            lexer: Lexer::new(source),
            storage_class_specifier: None,
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
            TokenKind::Float | TokenKind::Double | TokenKind::Void  => ParserResult::Ok(BlockItem::Declar(self.parse_declaration()?)),
            TokenKind::Typedef  => {
                todo!();
            }
            TokenKind::Auto | TokenKind::Register | TokenKind::Extern => {
                if self.storage_class_specifier.is_none() {
                    self.storage_class_specifier = Some(
                        match self.get_token() {
                            TokenKind::Auto => StorageClassSpecifier::Auto,
                            TokenKind::Register => StorageClassSpecifier::Register,
                            TokenKind::Extern => StorageClassSpecifier::Extern,
                            _ => unreachable!(),
                        }
                    );
                    Ok(BlockItem::Declar(self.parse_declaration()?))
                }else {
                    panic!();
                }
            }
            _ => ParserResult::Ok(BlockItem::Stmt(self.parse_statement()?)),
        }
    }
    // fn get_storage_class_specifier(&mut self) -> StorageClassSpecifier {
    //     match &self.storage_class_specifier {
    //         Some(specifier) => {
    //             let specifier = specifier.clone();
    //             self.storage_class_specifier = None;
    //             specifier
    //         },
    //         _ => StorageClassSpecifier::Auto,
    //     }
    // }
}