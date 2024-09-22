pub mod ir;
pub mod ir_converter;
pub mod ir_optimizer;

use crate::ir::function::Function;
use crate::ir_converter::Converter;
use ir::value::IrValueType;
use ir_optimizer::anaylsis::dfs_ordering::DFSOrdering;
use ir_optimizer::anaylsis::{DebuggerAnaylsis, OptimizerAnaylsis};
use ir_optimizer::pass::{DebuggerPass, OptimizerPass};
use rustyc_frontend::parser::Parser;
use std::fs::File;
use std::io::Write;

use crate::ir_optimizer::anaylsis::domtree::DomAnaylsier;
use crate::ir_optimizer::anaylsis::use_def_chain::*;
use crate::ir_optimizer::pass::copy_propagation::CopyPropagationPass;
use crate::ir_optimizer::pass::gvn::GVNPass;
use crate::ir_optimizer::pass::lcm::LCMPass;
use crate::ir_optimizer::pass::mem2reg::Mem2RegPass;
use crate::ir_optimizer::pass::value_numbering::ValueNumberingPass;

fn main() {
    // let program = Parser::new("

    // int a = 10;
    // int *p = &a;
    // int** return_pointer() {
    //     return &p;
    // }

    // int main() {
    //     return_pointer();
    //     **return_pointer() = 10;
    //     **return_pointer() + 10;
    //     **return_pointer() = **return_pointer() + 100;
    //     int c = 10;
    //     **return_pointer() = **return_pointer() + c;
    //     return 0;
    // }
    // ").parse().unwrap();
    // println!("{:#?}", program);
    // let mut converter = Converter::new();
    // let module = converter.convert(&program);
    let func = create_gvn_graph_from_conrnell();
    let mut use_def_anaylsier = DFSOrdering::new();
    let table = use_def_anaylsier.anaylsis(&func);
    let out = use_def_anaylsier.debugger(&func, &table);
    // let mut lcm_pass = LCMPass::new();
    // lcm_pass.process(&mut func);
    // let mut file = File::create("./test1.txt").unwrap();
    // write!(file,"{}", func.print_to_string()).unwrap();
    // let out = lcm_pass.debugger(&func);
    let mut file1 = File::create("./test.txt").unwrap();
    write!(file1, "{}", out).unwrap();
    // lcm_pass.process(&mut func);

    // let mut dom = DomAnaylsier::new();
    // let dom_table = dom.anaylsis(&mut func);

    // let mut use_def = UseDefAnaylsier::new();
    // let use_def_table =  use_def.anaylsis(&mut func);
    // let mut pass = Mem2RegPass::new();
    // pass.process(&mut func, &use_def_table, &dom_table);
    // let mut copy_pass = CopyPropagationPass::new();
    // copy_pass.process(&mut func);
    // let mut value_numbering_pass = ValueNumberingPass::new();
    // value_numbering_pass.process(&mut func);
    // copy_pass.process(&mut func);
    // let mut lazey_code_motion = LazyCodeMotionPass::new();
    // lazey_code_motion.process(&mut func, &dom_table);
    // print_lazy_code_motion_table(&lazey_code_motion, &func);

    // let mut file = File::create("./test.txt").unwrap();
    // write!(file, "{}", module.print_to_string()).unwrap();
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
    let t1 = func.build_stack_alloc_inst(size_const, 8, IrValueType::U32);
    {
        let const10 = func.create_i32_const(10);
        let offset = func.create_u32_const(0);
        func.build_store_register_inst(const10, t1, offset, IrValueType::I32);
    }
    size_const = func.create_u32_const(32 as u32);
    let t2 = func.build_stack_alloc_inst(size_const, 8, IrValueType::U32);
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
/// ```markdown
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
    // mark entry exit
    func.mark_as_exit(b2);
    func.mark_as_entry(b0);
    // connect
    func.connect_block(b0, b1);
    func.connect_block(b1, b2);
    func
}

fn create_gvn_graph_from_conrnell() -> Function {
    let mut function = Function::new(String::from("test_fun"));
    let b1 = function.create_block();
    let b2 = function.create_block();
    let b3 = function.create_block();
    let b4 = function.create_block();

    function.mark_as_entry(b1);
    function.mark_as_exit(b4);

    function.connect_block(b1, b2);
    function.connect_block(b2, b4);
    function.connect_block(b2, b3);
    function.connect_block(b3, b4);

    let mut add_to_param = || {
        let temp = function.add_register(IrValueType::I16);
        function.params_value.push(temp);
        temp
    };
    let a0 = add_to_param();
    let b0 = add_to_param();
    let c0 = add_to_param();
    let d0 = add_to_param();
    let e0 = add_to_param();
    let f0 = add_to_param();

    function.switch_to_block(b1);
    let u0 = function.build_add_inst(a0, b0);
    let v0 = function.build_add_inst(c0, d0);
    let w0 = function.build_add_inst(e0, f0);
    let cond = function.build_icmp_inst(u0, v0, ir::instructions::CmpFlag::Eq);
    function.build_brif_inst(cond, b2, b3);

    function.switch_to_block(b2);
    let x0 = function.build_add_inst(c0, d0);
    let y0 = function.build_add_inst(c0, d0);
    function.build_jump_inst(b4);

    function.switch_to_block(b3);
    let u1 = function.build_add_inst(a0, b0);
    let x1 = function.build_add_inst(e0, f0);
    let y1 = function.build_add_inst(e0, f0);
    function.build_jump_inst(b4);

    function.switch_to_block(b4);
    let u2 = function.build_phi_inst(vec![(b2, u0), (b3, u1)]);
    let x2 = function.build_phi_inst(vec![(b2, x0), (b3, x1)]);
    let y2 = function.build_phi_inst(vec![(b2, y0), (b3, y1)]);
    function.build_add_inst(u2, y2);
    function.build_add_inst(a0, b0);
    function.build_ret_inst(None);

    let result = function.print_to_string();

    let mut file = File::create("./test.txt").unwrap();
    write!(file, "{}", result).unwrap();

    function
}

/// ## Generate Test function for DOM
/// This function is reference from the book `Engineering a Compiler 2/e` p499
pub fn create_dom_graph_example() -> Function {
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

    function.mark_as_entry(b0);
    function.mark_as_exit(b4);

    function
}
