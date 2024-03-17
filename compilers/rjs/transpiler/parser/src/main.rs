pub mod span;
pub mod token;
pub mod ast;
pub mod lexer;
pub mod parser;
pub mod marco;

use serde_json::to_string_pretty;
use std::fs::{read_to_string, File};
use std::io::Write;

use parser::Parser;

use rjs_parser::to_tokens;


fn main() {
    let code = read_to_string("./test.js").unwrap();
    let mut parser = Parser::new(code.as_str());
    println!("{:?}", to_tokens(code.as_str()));
    let mut ast = parser.parse().unwrap();
    println!("{:?}", to_string_pretty(&ast).unwrap().as_str());
    let mut file = File::create("./test.json").unwrap();
    let result_string = to_string_pretty(&ast).unwrap();
    write!(file, "{}", result_string).unwrap();
}