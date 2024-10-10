mod build_ir_graph;

use build_ir_graph::*;
use rustyc_optimizer::ir::function::Function;
use rustyc_optimizer::ir_optimizer::anaylsis::dfs_ordering::DFSOrdering;
use rustyc_optimizer::ir_optimizer::anaylsis::domtree::DomAnaylsier;
use rustyc_optimizer::ir_optimizer::anaylsis::post_domtree::PostDomAnaylsier;
use rustyc_optimizer::ir_optimizer::anaylsis::use_def_chain::UseDefAnaylsier;
use rustyc_optimizer::ir_optimizer::anaylsis::{DebuggerAnaylsis, OptimizerAnaylsis};
use rustyc_optimizer::ir_optimizer::pass::gvn::GVNPass;
use rustyc_optimizer::ir_optimizer::pass::lcm::LCMPass;
use rustyc_optimizer::ir_optimizer::pass::licm::LICMPass;
use rustyc_optimizer::ir_optimizer::pass::sscp::SSCPPass;
use rustyc_optimizer::ir_optimizer::pass::{DebuggerPass, OptimizerPass};
use std::{env, fs::read_to_string, path::PathBuf};

fn get_root_path() -> PathBuf {
    env::current_dir().unwrap().join("./tests/fixtures/ir_optimizer")
}

fn run_ir_pass_test_case_old<F>(suffix_path: &'static str, get_result: F)
where
    F: FnOnce() -> String,
{
    let table_path = get_root_path().join(suffix_path).join("output.txt");
    let expect_table = read_to_string(table_path).expect("[Internal Error]: Pass Table is not exist.");
    let result_string = get_result();
    assert_eq!(expect_table, result_string);
}

fn compare_expect_string_and_result_string(expect_file: PathBuf, result: String) {
    let error_msg = format!(
        "[Internal Error]: Unexpect Error Happeneded When Read File({:?})",
        expect_file
    );
    let expect_string = read_to_string(expect_file).expect(&error_msg);
    assert_eq!(expect_string, result);
}

fn run_ir_pass_test_case<F>(suffix_path: &'static str, get_result: F)
where
    F: FnOnce() -> (String, String, String),
{
    let table_path = get_root_path().join(suffix_path).join("output.txt");
    let before_ir_path = get_root_path().join(suffix_path).join("before.txt");
    let after_ir_path = get_root_path().join(suffix_path).join("after.txt");
    let (before_result, table_result, after_result) = get_result();
    compare_expect_string_and_result_string(before_ir_path, before_result);
    compare_expect_string_and_result_string(table_path, table_result);
    compare_expect_string_and_result_string(after_ir_path, after_result);
}

fn run_ir_anaylsis_test_case<T>(
    suffix_path: &'static str,
    mut function: Function,
    mut anaylsis: impl OptimizerAnaylsis<T> + DebuggerAnaylsis<T>,
) {
    let table_path = get_root_path().join(suffix_path).join("output.txt");
    let expect_table = read_to_string(table_path).expect("[Internal Error]: Pass Table is not exist.");
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

generate_pass_cases!(
    // TODO: LCM can not rewrite now, make it rewrite.
    // (
    //     test_lcm_pass_cmu_example,
    //     "./lcm/cmu_example",
    //     || {
    //         let mut func = create_lcm_test_graph();
    //         let mut pass = LCMPass::new();
    //         pass.process(&mut func);
    //         pass.debugger(&func)
    //     }
    // ),
    (test_gvn_pass_conrnell_example, "./gvn/conrnell_example", || {
        let mut dom_anaylsier = DomAnaylsier::new();
        let mut func = create_gvn_graph_from_conrnell();
        let before = func.print_to_string();
        let table = dom_anaylsier.anaylsis(&func);
        let mut pass = GVNPass::new(&table);
        pass.process(&mut func);
        let table = pass.debugger(&func);
        let after = func.print_to_string();
        (before, table, after)
    }),
    (test_licm_pass_cmu_example, "./licm/cmu_example", || {
        let mut fun = create_licm_graph_example_from_cmu();
        let before = fun.print_to_string();
        let mut dom = DomAnaylsier::new();
        let dom_table = dom.anaylsis(&fun);
        let mut use_def = UseDefAnaylsier::new();
        let use_def_table = use_def.anaylsis(&fun);
        let mut pass = LICMPass::new(&use_def_table, &dom_table);
        pass.process(&mut fun);
        let table = pass.debugger(&fun);
        let after = fun.print_to_string();
        (before, table, after)
    }),
    (test_licm_pass_cmu_example_2, "./licm/cmu_example_2", || {
        let mut fun = create_licm_graph_simple_example_from_cmu();
        let before = fun.print_to_string();
        let mut dom = DomAnaylsier::new();
        let dom_table = dom.anaylsis(&fun);
        let mut use_def = UseDefAnaylsier::new();
        let use_def_table = use_def.anaylsis(&fun);
        let mut pass = LICMPass::new(&use_def_table, &dom_table);
        pass.process(&mut fun);
        let table = pass.debugger(&fun);
        let after = fun.print_to_string();
        (before, table, after)
    }),
    (test_sscp_pass_book_example_1, "./sscp/book_example_1", || {
        let mut fun = create_simple_loop_const_propagation_graph_1();
        let before = fun.print_to_string();
        let mut use_def = UseDefAnaylsier::new();
        let use_def_table = use_def.anaylsis(&fun);
        let mut pass = SSCPPass::new(&use_def_table);
        pass.process(&mut fun);
        let table = pass.debugger(&fun);
        let after = fun.print_to_string();
        (before, table, after)
    }),
    (test_sscp_pass_book_example_2, "./sscp/book_example_2", || {
        let mut fun = create_simple_loop_const_propagation_graph_2();
        let before = fun.print_to_string();
        let mut use_def = UseDefAnaylsier::new();
        let use_def_table = use_def.anaylsis(&fun);
        let mut pass = SSCPPass::new(&use_def_table);
        pass.process(&mut fun);
        let table = pass.debugger(&fun);
        let after = fun.print_to_string();
        (before, table, after)
    }),
    (test_sscp_pass_simple_example, "./sscp/simple_example", || {
        let mut fun = create_simple_const_propagation_graph();
        let before = fun.print_to_string();
        let mut use_def = UseDefAnaylsier::new();
        let use_def_table = use_def.anaylsis(&fun);
        let mut pass = SSCPPass::new(&use_def_table);
        pass.process(&mut fun);
        let table = pass.debugger(&fun);
        let after = fun.print_to_string();
        (before, table, after)
    })
);

#[test]
fn test_lcm_pass_cmu_example() {
    run_ir_pass_test_case_old("./lcm/cmu_example", || {
        let mut func = create_lcm_test_graph();
        let mut pass = LCMPass::new();
        pass.process(&mut func);
        pass.debugger(&func)
    });
}
generate_anaylsis_cases!(
    (
        test_dom_pass_conrnell_example,
        "./dom/gvn_conrnell",
        create_gvn_graph_from_conrnell(),
        DomAnaylsier::new()
    ),
    (
        test_dom_pass_dom_example,
        "./dom/dom_example",
        create_dom_graph_example(),
        DomAnaylsier::new()
    ),
    (
        test_dom_pass_simple_loop_example,
        "./dom/simple_loop",
        create_simple_loop(),
        DomAnaylsier::new()
    ),
    (
        test_dom_pass_complex_loop_example,
        "./dom/complex_loop",
        create_backward_edge_example(),
        DomAnaylsier::new()
    ),
    (
        test_use_def_anaylsis_simple_example,
        "./use_def/simple_example",
        create_use_def_graph(),
        UseDefAnaylsier::new()
    ),
    (
        test_dfs_ordering_conrnell_example,
        "./dfs_ordering/conrnell_example",
        create_gvn_graph_from_conrnell(),
        DFSOrdering::new()
    ),
    (
        test_dfs_ordering_dom_example,
        "./dfs_ordering/dom_example",
        create_dom_graph_example(),
        DFSOrdering::new()
    ),
    (
        test_dfs_ordering_simple_example,
        "./dfs_ordering/simple_example",
        create_use_def_graph(),
        DFSOrdering::new()
    ),
    (
        test_diamond_shape_example,
        "./post_dom/diamond_example",
        create_diamond_dom_graph(),
        PostDomAnaylsier::new()
    ),
    (
        test_diamond_shape_like_example,
        "./post_dom/diamond_like_example",
        create_diamond_like_dom_graph(),
        PostDomAnaylsier::new()
    )
);
