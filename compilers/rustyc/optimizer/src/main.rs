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
use ir::function;
use ir_optimizer::anaylsis::post_domtree::PostDomAnaylsier;
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
    let fun = create_diamond_dom_graph();
    let mut anaylsiser = PostDomAnaylsier::new();
    let table = anaylsiser.anaylsis(&fun);
    let output = anaylsiser.debugger(&fun, &table);
    write_string_to_file(output);
}

#[allow(dead_code)]
fn optimizer_example() {
    let mut fun = Function::new(String::from("test_fun"));
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
/// ## Generate Simple Diamond shape IR graph for post dom
/// ```markdown
///       | -> b2 -|
///  b1 - |        | -> b4
///       | -> b3 -|
/// ```
fn create_diamond_dom_graph() -> Function {
    let mut function = Function::new(String::from("test_fun"));
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

    function
}
/// ## Generate Simple Diamond-Like shape IR graph for post dom
/// ```markdown
///       | -> b2 --> b4
///  b1 - |
///       | -> b3
/// ```
fn create_diamond_like_dom_graph() -> Function {
    let mut function = Function::new(String::from("test_fun"));
    let header = function.create_block();
    let left_exit = function.create_block();
    let right = function.create_block();
    let exit = function.create_block();
    function.mark_as_entry(header);
    function.mark_as_exit(exit);
    function.mark_as_exit(left_exit);
    function.connect_block(header, left_exit);
    function.connect_block(header, right);
    function.connect_block(right, exit);

    function
}
fn main() {
    // converter_example();
    // optimizer_example();
    anaylsiser_example();
}
