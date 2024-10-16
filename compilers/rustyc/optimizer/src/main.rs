pub mod ir;
pub mod ir_converter;
pub mod ir_optimizer;

use crate::ir::function::Function;
use crate::ir::value::IrValueType;
use crate::ir_converter::Converter;
use crate::ir_optimizer::anaylsis::domtree::DomAnaylsier;
use crate::ir_optimizer::anaylsis::use_def_chain::UseDefAnaylsier;
use ir_optimizer::anaylsis::post_domtree::PostDomAnaylsier;
use ir_optimizer::anaylsis::{DebuggerAnaylsis, OptimizerAnaylsis};
use ir_optimizer::pass::dce::DCEPass;
use ir_optimizer::pass::licm::LICMPass;
use ir_optimizer::pass::sscp::SSCPPass;
use ir_optimizer::pass::{DebuggerPass, OptimizerPass};
use rustyc_frontend::parser::Parser;
use std::fs::File;
use std::io::Write;

fn write_string_to_file(file_string: String, file_name: &'static str) {
    let mut file1 = File::create(format!("./{}", file_name).as_str()).unwrap();
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
    write_string_to_file(module.print_to_string(), "output.txt");
}

#[allow(dead_code)]
fn anaylsiser_example() {
    let fun = create_diamond_like_dom_graph();
    let mut anaylsiser = PostDomAnaylsier::new();
    let table = anaylsiser.anaylsis(&fun);
    let output = anaylsiser.debugger(&fun, &table);
    write_string_to_file(output, "output.txt");
}

#[allow(dead_code)]
fn optimizer_example() {
    // before
    let mut fun = create_diamond_like_dom_graph();
    write_string_to_file(fun.print_to_string(), "before.txt");
    // pre-requirement
    let mut dom = PostDomAnaylsier::new();
    let dom_table = dom.anaylsis(&fun);
    let mut use_def = UseDefAnaylsier::new();
    let use_def_table = use_def.anaylsis(&fun);
    // process
    let mut pass = DCEPass::new(&use_def_table, &dom_table, true);
    pass.process(&mut fun);
    write_string_to_file(pass.debugger(&fun), "output.txt");
    // after
    write_string_to_file(fun.print_to_string(), "after.txt");
}
fn main() {
    // converter_example();
    optimizer_example();
    // anaylsiser_example();
}

/// ## Generate Simple Diamond shape IR graph for post dom
/// Need to remove t_2.
/// ```markdown
///       | -> b2 -|
///  b1 - |        | -> b4
///       | -> b3 -|
/// ```
/// ```markdown
/// --- b1
/// t1 = 10
/// t2 = t1 + 10
/// brif t1 block 2, block 3
/// --- b2
/// t3 = 10
/// jump b4
/// --- b3
/// t4 = 10
/// jump b4
/// --- b4
/// t5 = phi b3 t4, b2 t3
/// t6 = t5 + 10
/// ret t5
/// ```
fn create_diamond_dom_graph() -> Function {
    let mut function = Function::new(String::from("test_fun"));
    function.return_type = Some(IrValueType::I16);
    let header = function.create_block();
    let left = function.create_block();
    let right = function.create_block();
    let exit = function.create_block();
    function.mark_as_entry(header);
    function.mark_as_exit(exit);
    function.connect_block(header, left);
    function.connect_block(left, exit);
    function.connect_block(header, right);
    function.connect_block(right, exit);

    function.switch_to_block(header);
    let i10_const = function.create_i16_const(10);
    let t_1 = function.build_mov_inst(i10_const);
    let _t_2 = function.build_add_inst(t_1, i10_const);
    function.build_brif_inst(t_1, left, right);

    function.switch_to_block(left);
    let t_3 = function.build_mov_inst(i10_const);
    function.build_jump_inst(exit);

    function.switch_to_block(right);
    let t_4 = function.build_mov_inst(i10_const);
    function.build_jump_inst(exit);

    function.switch_to_block(exit);
    let t_5 = function.build_phi_inst(vec![(left, t_3), (right, t_4)]);
    let t_5 = function.build_add_inst(t_5, i10_const);
    function.build_ret_inst(Some(t_5));

    function
}
/// ## Generate Simple Diamond-Like shape IR graph for post dom
/// ```markdown
///       | -> b2 --> b4
///  b1 - |
///       | -> b3
/// ```
/// ```markdown
/// --- b1
/// t1 = 10
/// t2 = t1 + 10
/// brif t1 block 2, block 3
/// --- b2
/// t3 = 10
/// ret t3
/// --- b3
/// t4 = 10
/// jump b4
/// --- b4
/// t5 = t4 + 10
/// ret t5
/// ```
fn create_diamond_like_dom_graph() -> Function {
    let mut function = Function::new(String::from("test_fun"));
    function.return_type = Some(IrValueType::I16);
    let header = function.create_block();
    let left = function.create_block();
    let right = function.create_block();
    let exit = function.create_block();
    function.mark_as_entry(header);
    function.mark_as_exit(exit);
    function.mark_as_exit(left);
    function.connect_block(header, left);
    function.connect_block(header, right);
    function.connect_block(right, exit);

    function.switch_to_block(header);
    let i10_const = function.create_i16_const(10);
    let t_1 = function.build_mov_inst(i10_const);
    let _t_2 = function.build_add_inst(t_1, i10_const);
    function.build_brif_inst(t_1, left, right);

    function.switch_to_block(left);
    let t_3 = function.build_mov_inst(i10_const);
    function.build_ret_inst(Some(t_3));

    function.switch_to_block(right);
    let t_4 = function.build_mov_inst(i10_const);
    function.build_jump_inst(exit);

    function.switch_to_block(exit);
    let t_5 = function.build_add_inst(t_4, i10_const);
    function.build_ret_inst(Some(t_5));

    function
}
/// ## Generate Simple Diamond-Like shape IR graph for post dom
/// ```markdown
///       | -> b2--|
///  b1 - |        |--> |-----|
///       |             |  b3 |
///       | ----------> |-----|
/// ```
/// ```markdown
/// --- b1
/// t1 = 10
/// t2 = t1 + 10
/// brif t1 block 2, block 3
/// --- b2
/// t3 = 10
/// t4 = 10
/// store t_4, t_3, 10, i16
/// jump b3
/// --- b3
/// t5 = 10
/// ret t5
/// ```
fn create_simple_if_like_graph() -> Function {
    let mut function = Function::new(String::from("test_fun"));
    function.return_type = Some(IrValueType::I16);
    let header = function.create_block();
    let right = function.create_block();
    let exit = function.create_block();
    function.mark_as_entry(header);
    function.mark_as_exit(exit);
    function.connect_block(header, right);
    function.connect_block(right, exit);
    function.connect_block(header, exit);

    function.switch_to_block(header);
    let i10_const = function.create_i16_const(10);
    let t_1 = function.build_mov_inst(i10_const);
    let _t_2 = function.build_add_inst(t_1, i10_const);
    function.build_brif_inst(t_1, exit, right);

    function.switch_to_block(right);
    let t_3 = function.build_mov_inst(i10_const);
    let t_4 = function.build_mov_inst(i10_const);
    function.build_store_register_inst(t_4, t_3, i10_const, IrValueType::I16);
    function.build_jump_inst(exit);

    function.switch_to_block(exit);
    let t_5 = function.build_mov_inst(i10_const);
    function.build_ret_inst(Some(t_5));

    function
}

/// ## Generate Simple Diamond-Like shape IR graph for post dom
/// ```markdown
///       | -> b2--|
///  b1 - |        |--> |-----|
///       |             |  b3 |
///       | ----------> |-----|
/// ```
/// ```markdown
/// --- b1
/// t1 = 10
/// t2 = t1 + 10
/// brif t1 block 2, block 3
/// --- b2
/// t3 = 10
/// t4 = 10
/// jump b3
/// --- b3
/// t5 = 10
/// ret t5
/// ```
fn create_simple_if_like_cfg_change_graph() -> Function {
    let mut function = Function::new(String::from("test_fun"));
    function.return_type = Some(IrValueType::I16);
    let header = function.create_block();
    let right = function.create_block();
    let exit = function.create_block();
    function.mark_as_entry(header);
    function.mark_as_exit(exit);
    function.connect_block(header, right);
    function.connect_block(right, exit);
    function.connect_block(header, exit);

    function.switch_to_block(header);
    let i10_const = function.create_i16_const(10);
    let t_1 = function.build_mov_inst(i10_const);
    let _t_2 = function.build_add_inst(t_1, i10_const);
    function.build_brif_inst(t_1, exit, right);

    function.switch_to_block(right);
    let _t_3 = function.build_mov_inst(i10_const);
    let _t_4 = function.build_mov_inst(i10_const);
    function.build_jump_inst(exit);

    function.switch_to_block(exit);
    let t_5 = function.build_mov_inst(i10_const);
    function.build_ret_inst(Some(t_5));

    function
}
