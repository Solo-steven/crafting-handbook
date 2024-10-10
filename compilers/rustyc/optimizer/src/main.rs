pub mod ir;
pub mod ir_converter;
pub mod ir_optimizer;

use crate::ir::function::Function;
use crate::ir::instructions::InstructionData;
use crate::ir::instructions::OpCode;
use crate::ir::value::IrValueType;
use crate::ir_converter::Converter;
use crate::ir_optimizer::anaylsis::domtree::DomAnaylsier;
use crate::ir_optimizer::anaylsis::use_def_chain::UseDefAnaylsier;
use ir_optimizer::anaylsis::{DebuggerAnaylsis, OptimizerAnaylsis};
use ir_optimizer::pass::licm::LICMPass;
use ir_optimizer::pass::sscp::SSCPPass;
use ir_optimizer::pass::{DebuggerPass, OptimizerPass};
use rustyc_frontend::parser::Parser;
use std::fs::File;
use std::io::Write;

fn write_string_to_file(file_string: String) {
    let mut file1 = File::create("./output.txt").unwrap();
    write!(file1, "{}", file_string).unwrap();
}
#[allow(dead_code)]
fn converter_example() {
    let program = Parser::new(
        "
        int test() {
            return 10;
        }

        int with_argu(int a) {
            return 10 + a;
        }

        int main() {
            test();
            int a = test();
            a = test() + 1;
            a = test() + test() + a;
            a = test() + a;

            with_argu(1);
            int b = with_argu(4);
            b = with_argu(a) + 10;
            b = with_argu (6) + a;
            b = with_argu(a) + with_argu(b) + 100;

            return 0;
        }
    ",
    )
    .parse()
    .unwrap();
    let mut converter = Converter::new();
    let module = converter.convert(&program);
    write_string_to_file(module.print_to_string());
}

#[allow(dead_code)]
fn anaylsiser_example() {
    let fun = create_backward_edge_example();
    let mut anaylsiser = DomAnaylsier::new();
    let table = anaylsiser.anaylsis(&fun);
    let output = anaylsiser.debugger(&fun, &table);
    write_string_to_file(output);
}

#[allow(dead_code)]
fn optimizer_example() {
    let mut fun = create_licm_graph_simple_example_from_cmu();
    let mut file1 = File::create("./before.txt").unwrap();
    write!(file1, "{}", fun.print_to_string()).unwrap();
    let mut dom = DomAnaylsier::new();
    let dom_table = dom.anaylsis(&fun);
    let mut use_def = UseDefAnaylsier::new();
    let use_def_table = use_def.anaylsis(&fun);
    let mut pass = LICMPass::new(&use_def_table, &dom_table);
    pass.process(&mut fun);

    write_string_to_file(pass.debugger(&fun));
    let mut file1 = File::create("./after.txt").unwrap();
    write!(file1, "{}", fun.print_to_string()).unwrap();
}

fn create_backward_edge_example() -> Function {
    let mut function = Function::new(String::from("test_fun"));
    // create blocks
    let b1 = function.create_block();
    function.mark_as_entry(b1);
    let b2 = function.create_block();
    let b3 = function.create_block();
    let b4 = function.create_block();
    let b5 = function.create_block();
    let b6 = function.create_block();
    let b7 = function.create_block();
    let b8 = function.create_block();
    function.mark_as_exit(b6);
    // connect
    function.connect_block(b1, b2);
    function.connect_block(b2, b3);
    function.connect_block(b3, b4);
    function.connect_block(b4, b5);
    function.connect_block(b5, b6);

    function.connect_block(b2, b7);
    function.connect_block(b7, b8);
    function.connect_block(b8, b5);
    function.connect_block(b8, b6);

    function.connect_block(b4, b1);
    function.connect_block(b5, b2);
    function.connect_block(b8, b7);
    function.connect_block(b6, b5);

    function
}

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

fn main() {
    // converter_example();
    optimizer_example();
    // anaylsiser_example();
}

/// ## Generate Simple Graph for Testing LICM
/// Modify example from CMU ptt, page 9.
/// ref: https://www.cs.cmu.edu/afs/cs/academic/class/15745-s19/www/lectures/L9-LICM.pdf
/// adding empty block for entry, header and exit.
pub fn create_licm_graph_simple_example_from_cmu() -> Function {
    let mut function = Function::new(String::from("test_fun"));
    // create blocks
    let b0 = function.create_block(); // entry
    function.mark_as_entry(b0);
    let b1 = function.create_block(); // header
    let b2 = function.create_block();
    let b3 = function.create_block();
    function.mark_as_exit(b3);
    // connect blocks
    function.connect_block(b0, b1);
    function.connect_block(b1, b2);
    function.connect_block(b2, b3);
    function.connect_block(b2, b2);
    // instruction
    function.switch_to_block(b0);
    // entry
    let i16_10 = function.create_i16_const(10);
    let a = function.build_mov_inst(i16_10);
    let b = function.build_mov_inst(i16_10);
    let c = function.build_mov_inst(i16_10);
    function.build_jump_inst(b1);
    // header
    function.switch_to_block(b1);
    function.build_jump_inst(b2);
    function.switch_to_block(b2);
    let a_inner = function.build_add_inst(b, c);
    let e = function.add_register(IrValueType::I16);
    function.insert_inst_to_block_front(
        &b2,
        ir::instructions::InstructionData::Phi {
            opcode: ir::instructions::OpCode::Phi,
            dst: e,
            from: vec![(b2, a_inner), (b1, a)],
        },
    );
    function.build_brif_inst(a_inner, b3, b2);
    // exit
    function.switch_to_block(b3);
    function.build_ret_inst(None);

    function
}

pub fn create_licm_graph_example_from_cmu() -> Function {
    let mut function = Function::new(String::from("test_fun"));
    // create blocks
    let b0 = function.create_block(); // entry
    function.mark_as_entry(b0);
    let b1 = function.create_block(); // header
    let b2 = function.create_block();
    let b3 = function.create_block();
    let b4 = function.create_block(); // tail
    let b5 = function.create_block(); // exit of loop
    let b6 = function.create_block(); // exit
    function.mark_as_exit(b6);
    // connect
    function.connect_block(b0, b1);
    function.connect_block(b1, b2);
    function.connect_block(b2, b4);
    function.connect_block(b4, b1);
    function.connect_block(b1, b3);
    function.connect_block(b3, b5);
    function.connect_block(b3, b4);
    function.connect_block(b5, b6);
    // instructions
    // entry
    function.switch_to_block(b0);
    let i16_10 = function.create_i16_const(10);
    let a = function.build_mov_inst(i16_10);
    let b = function.build_mov_inst(i16_10);
    let c = function.build_mov_inst(i16_10);
    function.build_jump_inst(b1);
    // header
    function.switch_to_block(b1);
    function.build_brif_inst(i16_10, b2, b3);
    function.switch_to_block(b2);
    let a_1 = function.build_add_inst(b, c);
    let i16_2 = function.create_i16_const(2);
    let _f = function.build_add_inst(a_1, i16_2);
    function.build_jump_inst(b4);
    function.switch_to_block(b3);
    let e = function.build_mov_inst(i16_10);
    function.build_brif_inst(e, b4, b5);
    function.switch_to_block(b4);
    let a_in_b4 = function.build_phi_inst(vec![(b2, a_1), (b0, a)]);
    let i16_1 = function.create_i16_const(1);
    let _d = function.build_add_inst(a_in_b4, i16_1);
    function.build_jump_inst(b1);
    function.switch_to_block(b5);
    function.build_jump_inst(b6);
    function.switch_to_block(b6);
    function.build_ret_inst(None);

    function
}
