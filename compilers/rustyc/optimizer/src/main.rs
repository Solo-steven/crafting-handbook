
pub mod ir;
pub mod ir_converter;
pub mod ir_optimizer;

use ir::value::IrValueType;
use rustyc_frontend::parser::Parser;
use rustyc_optimizer::ir::function::{self, BasicBlock};
use crate::ir::function::Function;
use crate::ir_converter::Converter;
use crate::ir_optimizer::liveness_anaylsis::{LivenessAnaylsier, print_set};
use crate::ir_optimizer::use_def_chain::{print_use_def_table, UseDefAnaylsier};
use crate::ir_optimizer::value_numbering::local_value_numbering;
use std::backtrace::Backtrace;
use std::collections::{HashSet, HashMap};
use std::fs::File;
use std::io::Write;


pub fn create_mock_graph() {
    let mut func = Function::new(String::from("test_fun"));
    let b0 = func.create_block();
    func.switch_to_block(b0);
    let t1 = func.build_stack_alloc_inst(32, 8);
}

pub fn create_reducnt_expr_graph() -> Function {
    let mut func = Function::new(String::from("test_fun"));
    let b0 = func.create_block();
    func.switch_to_block(b0);
    let t1 = func.build_stack_alloc_inst(32, 8);
    {
        let const10 = func.create_i32_const(10);
        let offset = func.create_u32_const(0);
        func.build_store_register_inst(const10, t1, offset, IrValueType::I32);
    }
    let t2 = func.build_stack_alloc_inst(32, 8);
    {
        let const10 = func.create_i32_const(10);
        let offset = func.create_u32_const(0);
        func.build_store_register_inst(const10, t1, offset, IrValueType::I32);
    }
    let offset_0 = func.create_i32_const(10);
    let t3 = func.build_load_register_inst(t1, offset_0.clone(), IrValueType::I32);
    let t4 = func.build_load_register_inst(t2, offset_0.clone(), IrValueType::I32);
    let _t5 = func.build_add_inst(t3, t4);
    let _t6 = func.build_add_inst(t3, t4);
    func
}

/// t0 = 10;
/// t1 = 1000;
/// --------
/// t2 = t1 + t0;
/// t3 = t1 + t2;
/// ----------
/// t4 = t1 + t3;
pub fn create_use_def_graph() -> Function {
    let mut func = Function::new(String::from("test_fun"));
    // block 0
    let b0 = func.create_block();
    func.switch_to_block(b0);
    let const10 = func.create_u32_const(10);
    let t0 = func.build_mov_inst(const10);
    let const1000 = func.create_u32_const(10000);
    let t1 = func.build_mov_inst(const1000);
    // block1
    let b1 = func.create_block();
    func.switch_to_block(b1);
    let t2 = func.build_add_inst(t0, t1);
    let t3 = func.build_add_inst(t1, t2);
    // block 2
    let b2 = func.create_block();
    func.switch_to_block(b2);
    let _t4 = func.build_add_inst(t1, t3);
    func   
}

fn main() {
    let program = Parser::new("
        int main() {
            int a = 10, b = 100, c, d;
            c = a + b ;
            d = a + b;
        }
    ").parse().unwrap();
     println!("{:#?}", program);
    let mut converter = Converter::new();
    converter.convert(&program);
    // let mut liveness = LivenessAnaylsier::new();
    let mut use_def = UseDefAnaylsier::new();
    let func =create_use_def_graph();
    println!("{:?}", func.print_to_string());
    let table = use_def.anaylsis(&func);
    print_use_def_table(&table, &func);
    println!("{:?}", func.print_to_string());


    for func in &converter.functions {
        let mut file = File::create("./test.txt").unwrap();
        write!(file, "{}", func.print_to_string().as_str());
    }
}