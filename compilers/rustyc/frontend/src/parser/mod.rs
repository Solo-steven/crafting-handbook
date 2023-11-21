mod expr;
mod declar;
mod stmt;
use std::borrow::Cow;
use crate::lexer::Lexer;
use crate::token::*;
pub struct Parser<'a> {
    lexer: Lexer<'a>
}

type ParserResult<T> = Result<T, String>;

impl<'a> Parser<'a> {
    pub fn new(source: &'a str)  -> Self {
        Self {
            lexer: Lexer::new(source),
        }
    }
    pub fn parse(&mut self) {
        self.parse_program();
    }
    fn get_token(&self) -> TokenKind {
        self.lexer.get_token()
    }
    fn next_token(&mut self) -> TokenKind {
        self.lexer.next_token()
    }
    fn get_raw_value(&self) -> Cow<'a, str> {
        self.lexer.get_raw_value()
    }
    fn parse_program(&mut self) {
        // let body = Vec::new();
        loop {
            match self.get_token() {
                TokenKind::EOFToken => {
                    break;
                }
                TokenKind::Struct => {
                    let s = self.parse_struct_type();
                    println!("{:?}", s);
                }
                TokenKind::Enum => {
                    let s = self.parse_enum_type();
                    println!("{:?}", s);
                }
                TokenKind::Union => {
                    let s = self.parse_union_type();
                    println!("{:?}",s);
                }
                TokenKind::Unsigned | TokenKind::Signed |
                TokenKind::Char | 
                TokenKind::Int |
                TokenKind::Long |
                TokenKind::Short |
                TokenKind::Float |
                TokenKind::Double => {
                    let s = self.parse_function_type();
                    println!("{:?}",s);
                }
                _ => {
                    let s = self.parse_expr_statement();
                    println!("{:?}", s);
                }
            }
        }
    }
}