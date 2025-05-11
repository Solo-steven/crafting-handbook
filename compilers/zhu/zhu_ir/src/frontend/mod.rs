use lexer::Lexer;
use parser::Parser;
use token::{Token, TokenKind};
use crate::entities::module::Module;

pub mod lexer;
pub mod parser;
pub mod token;
pub mod utils;

/// Tokenize given program into tokens
pub fn to_tokens(code: &str) -> Vec<Token> {
    let mut lexer = Lexer::new(code);
    let mut tokens = Vec::new();
    loop {
        let tk = lexer.get_token_kind();
        if tk == TokenKind::EOF {
            break;
        } else {
            tokens.push(lexer.get_token());
            lexer.next_token();
        }
    }
    tokens
}
/// Parse given program to module
pub fn parse(source: &str) -> Module {
    let mut parser = Parser::new(source);
    parser.parse()
}