mod lexer;
mod parser;
mod span;
mod token;
mod marco;
mod ast;

use crate::token::TokenKind;
use crate::parser::ParserResult;

use serde_json::to_string_pretty;
use std::io::Write;
use std::fs;

fn main(){
    let source = "
            int main() {
                int sum = 0;
                for(int i =0 ; i < 10; ++i) {
                    sum += i;
                }
            }
    ";
    let source2 = "
        person->computeSome(a, b, 10);
    ";
    let mut lexer = lexer::Lexer::new(source);
    loop {
        let tok = lexer.next_token();
        match tok {
            TokenKind::EOFToken => {
                println!("kind: {:?}, value: {:?}, start : {:?}, finish: {:?}", tok, lexer.get_raw_value(), lexer.get_start_span(), lexer.get_finish_span());
                break;
            }
            _ => {
                println!("kind: {:?}, value: {:?}, start : {:?}, finish: {:?}", tok, lexer.get_raw_value(), lexer.get_start_span(), lexer.get_finish_span());
            }
        }
    }
    let mut parser = parser::Parser::new(source);
    let result = parser.parse();
    match result  {
        ParserResult::Ok(program) => {
            let mut file = fs::File::create("./test.json").unwrap();
            let _ = write!(file, "{}",to_string_pretty(&program).unwrap().as_str());
        }
        ParserResult::Err(err) => {
            println!("Error : {}", err);
        }
    }
}