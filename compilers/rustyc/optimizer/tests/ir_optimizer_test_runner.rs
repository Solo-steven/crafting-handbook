mod build_ir_graph;

use build_ir_graph::*;
use rustyc_optimizer::ir::function::Function;
use rustyc_optimizer::ir_optimizer::anaylsis::dfs_ordering::DFSOrdering;
use rustyc_optimizer::ir_optimizer::anaylsis::domtree::DomAnaylsier;
use rustyc_optimizer::ir_optimizer::anaylsis::use_def_chain::UseDefAnaylsier;
use rustyc_optimizer::ir_optimizer::anaylsis::{DebuggerAnaylsis, OptimizerAnaylsis};
use rustyc_optimizer::ir_optimizer::pass::gvn::GVNPass;
use rustyc_optimizer::ir_optimizer::pass::lcm::LCMPass;
use rustyc_optimizer::ir_optimizer::pass::{DebuggerPass, OptimizerPass};
use std::{env, fs::read_to_string, path::PathBuf};

fn get_root_path() -> PathBuf {
    env::current_dir()
        .unwrap()
        .join("./tests/fixtures/ir_optimizer")
}

fn run_ir_pass_test_case<F>(suffix_path: &'static str, get_result: F)
where
    F: FnOnce() -> String,
{
    let table_path = get_root_path().join(suffix_path).join("output.txt");
    let expect_table =
        read_to_string(table_path).expect("[Internal Error]: Pass Table is not exist.");
    let result_string = get_result();
    assert_eq!(expect_table, result_string);
}

fn run_ir_anaylsis_test_case<T>(
    suffix_path: &'static str,
    mut function: Function,
    mut anaylsis: impl OptimizerAnaylsis<T> + DebuggerAnaylsis<T>,
) {
    let table_path = get_root_path().join(suffix_path).join("output.txt");
    let expect_table =
        read_to_string(table_path).expect("[Internal Error]: Pass Table is not exist.");
    let table = anaylsis.anaylsis(&mut function);
    let result_string = anaylsis.debugger(&function, &table);
    assert_eq!(expect_table, result_string);
}
macro_rules! generate_pass_cases {
    (
        $(
            ($func_name: ident, $suffix_path: expr, $get_result: expr)
        ),*
    ) => {
        $(
            #[test]
            fn $func_name() {
                run_ir_pass_test_case($suffix_path, $get_result)
            }
        )*
    };
}
macro_rules! generate_anaylsis_cases {
    (
        $(
            ($func_name: ident, $suffix_path: expr, $function: expr, $pass: expr)
        ),*
    ) => {
        $(
            #[test]
            fn $func_name() {
                run_ir_anaylsis_test_case($suffix_path, $function, $pass )
            }
        )*
    };
}

generate_pass_cases!((test_lcm_pass_cmu_example, "./lcm/cmu_example", || {
    let mut func = create_lcm_test_graph();
    let mut pass = LCMPass::new();
    pass.process(&mut func);

    pass.debugger(&func)
}));

generate_pass_cases!((
    test_gvn_pass_conrnell_example,
    "./gvn/conrnell_example",
    || {
        let mut dom_anaylsier = DomAnaylsier::new();
        let mut func = create_gvn_graph_from_conrnell();
        let table = dom_anaylsier.anaylsis(&func);
        let mut pass = GVNPass::new(&table);
        pass.process(&mut func);
        pass.debugger(&func)
    }
));

generate_anaylsis_cases!((
    test_dom_pass_conrnell_example,
    "./dom/gvn_conrnell",
    create_gvn_graph_from_conrnell(),
    DomAnaylsier::new()
));

generate_anaylsis_cases!((
    test_dom_pass_dom_example,
    "./dom/dom_example",
    create_dom_graph_example(),
    DomAnaylsier::new()
));

generate_anaylsis_cases!((
    test_use_def_anaylsis_simple_example,
    "./use_def/simple_example",
    create_use_def_graph(),
    UseDefAnaylsier::new()
));

generate_anaylsis_cases!((
    test_dfs_ordering_conrnell_example,
    "./dfs_ordering/conrnell_example",
    create_gvn_graph_from_conrnell(),
    DFSOrdering::new()
));

generate_anaylsis_cases!((
    test_dfs_ordering_dom_example,
    "./dfs_ordering/dom_example",
    create_dom_graph_example(),
    DFSOrdering::new()
));

generate_anaylsis_cases!((
    test_dfs_ordering_simple_example,
    "./dfs_ordering/simple_example",
    create_use_def_graph(),
    DFSOrdering::new()
));
