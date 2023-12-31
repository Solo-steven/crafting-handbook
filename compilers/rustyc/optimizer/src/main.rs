
pub mod ir;
pub mod ir_converter;
pub mod ir_optimizer;

use ir::value::IrValueType;
use rustyc_frontend::parser::Parser;
use crate::ir::function::Function;
use crate::ir_converter::Converter;
use std::fs::File;
use std::io::Write;

use crate::ir_optimizer::anaylsis::domtree::DomAnaylsier;
use crate::ir_optimizer::anaylsis::use_def_chain::*;
use crate::ir_optimizer::pass::mem2reg::Mem2RegPass;
use crate::ir_optimizer::pass::copy_propagation::CopyPropagationPass;
use crate::ir_optimizer::pass::value_numbering::ValueNumberingPass;

fn main() {
    let program = Parser::new("
    int main() {
        int a;
        a = 10;
        int *cc = &a;
        int b = 100;
        int c = a + b;
        b = a + b;
        int d = a + b;
        if (d > 0) {
            d = a +b;
        } else {
            d = a + b + a;
        }
        return 0;
    }
    ").parse().unwrap();
    // println!("{:#?}", program);
    let mut converter = Converter::new();
    let module = converter.convert(&program);
    let mut func = module.functions[0].clone();
    let mut dom = DomAnaylsier::new();
    let dom_table = dom.anaylsis(&mut func);

    let mut use_def = UseDefAnaylsier::new();
    let use_def_table =  use_def.anaylsis(&mut func);
    let mut pass = Mem2RegPass::new();
    println!("{:#?}",func.print_to_string().as_str());
    pass.process(&mut func, &use_def_table, &dom_table);
    println!("{:#?}",func.print_to_string().as_str());
    let mut copy_pass = CopyPropagationPass::new();
    copy_pass.process(&mut func);
    let mut value_numbering_pass = ValueNumberingPass::new();
    value_numbering_pass.process(&mut func);
    copy_pass.process(&mut func);
    let mut file = File::create("./test.txt").unwrap();
    write!(file, "{}", func.print_to_string().as_str()).unwrap();
    // let mut liveness = LivenessAnaylsier::new();
    // let func =create_use_def_graph();
    // println!("{:?}", func.print_to_string());
    // let table = use_def.anaylsis(&func);
    // print_use_def_table(&table, &func);
    // println!("{:?}", func.print_to_string());


    // for func in &converter.functions {
    // }
}

pub fn create_reducnt_expr_graph() -> Function {
    let mut func = Function::new(String::from("test_fun"));
    let b0 = func.create_block();
    func.switch_to_block(b0);
    let mut size_const = func.create_u32_const(32 as u32);
    let t1 = func.build_stack_alloc_inst(size_const, 8, Some(IrValueType::U32));
    {
        let const10 = func.create_i32_const(10);
        let offset = func.create_u32_const(0);
        func.build_store_register_inst(const10, t1, offset, IrValueType::I32);
    }
    size_const = func.create_u32_const(32 as u32);
    let t2 = func.build_stack_alloc_inst(size_const, 8, Some(IrValueType::U32));
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


/// Create simple graph to test use-def information:
/// ```
/// t0 = 10;
/// t1 = 1000;
/// --------
/// t2 = t1 + t0;
/// t3 = t1 + t2;
/// ----------
/// t4 = t1 + t3;
/// ```
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

/// Create simple graph for test dom data flow anaylsis.
/// struct of graph please reference to 
pub fn create_dom_graph() -> Function {
    let mut function = Function::new(String::from("test_fun"));
    let b0 = function.create_block();
    let b1 = function.create_block();
    let b2 = function.create_block();
    let b3 = function.create_block();
    let b4 = function.create_block();
    let b5 = function.create_block();
    let b6 = function.create_block();
    let b7 = function.create_block();
    let b8 = function.create_block();
    
    function.connect_block(b0, b1);
    function.connect_block(b1, b2);
    function.connect_block(b2, b3);
    function.connect_block(b3, b4);
    function.connect_block(b3, b1);

    function.connect_block(b1, b5);
    function.connect_block(b5, b6);
    function.connect_block(b5, b8);
    function.connect_block(b6, b7);
    function.connect_block(b8, b7);
    function.connect_block(b7, b3);
    function
}
