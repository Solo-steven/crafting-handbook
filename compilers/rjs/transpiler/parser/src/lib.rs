pub mod span;
pub mod token;
pub mod ast;
pub mod lexer;
pub mod parser;
pub mod marco;

use lexer::{Lexer, LexerStateCache};
use token::TokenKind;

pub fn to_tokens<'a>(code: &'a str) -> Vec<LexerStateCache> {
    let mut lexer = Lexer::new(code);
    let mut tokens = Vec::new();
    loop {
        let token = lexer.get_token();
        let start_span = lexer.get_start_span();
        let finish_span = lexer.get_finish_span();
        let start_offset = start_span.offset;
        let finish_offset = finish_span.offset;
        let token_with_span = LexerStateCache {
            token: token.clone(),
            raw_value: lexer.get_value(start_offset,finish_offset),
            start_span: lexer.get_start_span(),
            finish_span: lexer.get_finish_span(),  
            last_finish_span: lexer.get_last_token_finish_span(),
            line_terminator_flag: lexer.get_line_terminator_flag(),
        };
        tokens.push(token_with_span);
        if token ==TokenKind::EOFToken {
            break;
        }
        lexer.next_token()
        
    }
    tokens
}