
pub mod ir;
use rustyc_frontend::parser::Parser;
use crate::ir::function::Function;
use crate::ir::convert::Converter;
use std::fs::File;
use std::io::Write;
fn main() {
    let program = Parser::new("
        int main() {
            int base = 10;
            int *p = &base;
            *base = 100;
        }
    ").parse().unwrap();
    // println!("{:#?}", program);
    let mut converter = Converter::new();
    converter.convert(&program);
    for func in &converter.functions {
        let mut file = File::create("./test.txt").unwrap();
        write!(file, "{}", func.print_to_string().as_str());
    }
}