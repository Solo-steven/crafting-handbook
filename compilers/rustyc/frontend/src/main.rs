mod ast;
mod lexer;
mod marco;
mod parser;
mod span;
mod token;

use crate::parser::ParserResult;
use crate::token::TokenKind;

use serde_json::to_string_pretty;
use std::fs;
use std::io::Write;

fn main() {
    let source = "
    struct Test {
        int value;
        int (*getter)();
    };
    
    int mock() {
        return 11;
    }
    
    int main() {
        struct Test test;
        test.getter = mock;
        test.getter();
        return 0;
    }
    ";
    // let source2 = "
    //     person->computeSome(a, b, 10);
    // ";
    let mut lexer = lexer::Lexer::new(source);
    loop {
        let tok = lexer.get_token();
        match tok {
            TokenKind::EOFToken => {
                println!(
                    "kind: {:?}, value: {:?}, start : {:?}, finish: {:?}",
                    tok,
                    lexer.get_raw_value(),
                    lexer.get_start_span(),
                    lexer.get_finish_span()
                );
                break;
            }
            _ => {
                println!(
                    "kind: {:?}, value: {:?}, start : {:?}, finish: {:?}",
                    tok,
                    lexer.get_raw_value(),
                    lexer.get_start_span(),
                    lexer.get_finish_span()
                );
            }
        }
        lexer.next_token();
    }
    let mut parser = parser::Parser::new(source);
    let result = parser.parse();
    match result {
        ParserResult::Ok(program) => {
            let mut file = fs::File::create("./test.json").unwrap();
            let _ = write!(file, "{}", to_string_pretty(&program).unwrap().as_str());
        }
        ParserResult::Err(err) => {
            println!("Error : {}", err);
        }
    }
}
