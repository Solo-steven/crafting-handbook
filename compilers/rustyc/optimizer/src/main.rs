
pub mod ir;
pub mod ir_converter;
pub mod ir_optimizer;

use rustyc_frontend::parser::Parser;
use rustyc_optimizer::ir::function;
use crate::ir::function::Function;
use crate::ir_converter::Converter;
use crate::ir_optimizer::liveness_anaylsis::{LivenessAnaylsier, print_set};
use std::collections::HashSet;
use std::fs::File;
use std::io::Write;


pub fn create_mock_graph() {
    let mut func = Function::new(String::from("test_fun"));
    let b0 = func.create_block();
    func.switch_to_block(b0);
    let t1 = func.build_stack_alloc_inst(32, 8);
}

fn main() {
    let program = Parser::new("
        int main() {
            int a = 0, b = 8;
            a = a +b ;
            if (a > 2) {
                b = a;
            }else {
                a =b;
            }
            int c = a;
        }
    ").parse().unwrap();
     println!("{:#?}", program);
    let mut converter = Converter::new();
    converter.convert(&program);
    let mut liveness = LivenessAnaylsier::new();
    for fun in &converter.functions {
        println!("{:#?}", fun);
        let table = liveness.anaylsis(fun);
        for item in &table {
            //print!("block: {:?}", item.0);
            //print_set(item.1, fun, "liveout");

        }
    } 


    for func in &converter.functions {
        let mut file = File::create("./test.txt").unwrap();
        write!(file, "{}", func.print_to_string().as_str());
    }
}