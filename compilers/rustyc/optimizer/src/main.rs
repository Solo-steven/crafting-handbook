pub mod ir;
pub mod ir_converter;
pub mod ir_optimizer;

use crate::ir::function::Function;
use crate::ir_converter::Converter;
use crate::ir_optimizer::anaylsis::domtree::DomAnaylsier;
use crate::ir_optimizer::anaylsis::use_def_chain::UseDefAnaylsier;
use crate::ir_optimizer::pass::licm;
use ir_optimizer::anaylsis::{DebuggerAnaylsis, OptimizerAnaylsis};
use ir_optimizer::pass::licm::LICMPass;
use ir_optimizer::pass::OptimizerPass;
use rustyc_frontend::parser::Parser;
use std::fs::File;
use std::io::Write;

fn write_string_to_file(file_string: String) {
    let mut file1 = File::create("./test.txt").unwrap();
    write!(file1, "{}", file_string).unwrap();
}

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

fn optimizer_example() {
    let mut fun = create_licm_graph_example_from_cmu();
    write_string_to_file(fun.print_to_string());
    let mut dom = DomAnaylsier::new();
    let dom_table = dom.anaylsis(&fun);

    let mut use_def = UseDefAnaylsier::new();
    let use_def_table = use_def.anaylsis(&fun);
    let mut pass = LICMPass::new(&use_def_table, &dom_table);
    pass.process(&mut fun);

    let mut file1 = File::create("./test1.txt").unwrap();
    write!(file1, "{}", fun.print_to_string()).unwrap();
}

fn create_simple_loop() -> Function {
    let mut function = Function::new(String::from("test_fun"));
    let b1 = function.create_block();
    function.mark_as_entry(b1);
    let b2 = function.create_block();
    function.mark_as_exit(b2);
    function.connect_block(b1, b2);
    function.connect_block(b2, b1);

    function
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

fn create_licm_graph_example_from_cmu() -> Function {
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

fn main() {
    // converter_example();
    optimizer_example();
}
