pub mod span;
pub mod token;
pub mod ast;
pub mod lexer;
pub mod parser;
pub mod marco;

use serde_json::to_string_pretty;
use std::fs::{read_to_string, File};
use std::io::Write;

use lexer::{Lexer, TokenWithSpanAndValue};
use token::TokenKind;

pub fn to_tokens<'a>(code: &'a str) -> Vec<TokenWithSpanAndValue> {
    let mut lexer = Lexer::new(code);
    let mut tokens = Vec::new();
    loop {
        let token = lexer.get_token();
        let start_span = lexer.get_start_span();
        let finish_span = lexer.get_finish_span();
        let start_offset = start_span.offset;
        let finish_offset = finish_span.offset;
        let token_with_span = TokenWithSpanAndValue {
            token: token.clone(),
            raw_value: lexer.get_value(start_offset,finish_offset),
            start_span: lexer.get_start_span(),
            finish_span: lexer.get_finish_span(),  
        };
        tokens.push(token_with_span);
        if token ==TokenKind::EOFToken {
            break;
        }
        lexer.next_token()
    }
    tokens
}


fn main() {
    let code = read_to_string("./test.js").unwrap();
    let tokens = to_tokens(code.as_str());
    println!("{:?}", to_string_pretty(&tokens).unwrap().as_str());
    let mut file = File::create("./test.json").unwrap();
    let result_string = to_string_pretty(&tokens).unwrap();
    write!(file, "{}", result_string).unwrap();
}