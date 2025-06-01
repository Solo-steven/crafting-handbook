#![feature(macro_metavar_expr_concat)]
use std::env::current_dir;
use std::fs::read_to_string;
use std::path::PathBuf;
use zsh_ir::entities::module::Module;
use zsh_ir::formatter::format;
use zsh_ir::frontend::parse;

use zsh_ir::opti::cfg::cfg_anylysis;
use zsh_ir::opti::domtree::domtree_analysis;
use zsh_ir::opti::licm::natural_loop::natural_loop_analysis;
use zsh_ir::opti::post_domtree::post_domtree_analysis;
use zsh_ir::opti::rpo::revrese_post_order_analysis;

use zsh_ir::opti::dce::dce_pass;
use zsh_ir::opti::gvn::gvn_pass;
use zsh_ir::opti::licm::licm_pass;

fn get_folder_path_by_case_name(name: &str) -> PathBuf {
    current_dir().unwrap().join("tests/fixtures").join(name)
}

fn read_original_file_from_case_name(case_name: &str) -> String {
    let path_buf = get_folder_path_by_case_name(case_name).join("original.zhu");
    read_to_string(path_buf)
        .unwrap_or_else(|_| panic!("[Error]: test file can not read. path. test case is {:?}.", case_name))
}

fn read_expected_file_from_namespec(test_case: &str, namespace: &str) -> String {
    let path_buf = get_folder_path_by_case_name(test_case).join(format!("expect_{}.zhu", namespace));
    read_to_string(path_buf).unwrap_or_else(|_| {
        panic!(
            "[Error]: test file can not read. path. test case is {:?}, namespace is {:?}",
            test_case, namespace
        )
    })
}

fn compare_test_case(test_case: &str, namespace: &str, process: impl FnOnce(Module) -> Module) {
    let original_source = read_original_file_from_case_name(test_case);
    let expected_source = read_expected_file_from_namespec(test_case, namespace);
    let result = process(parse(&original_source));
    let result_string = format(&result);
    assert_eq!(
        result_string, expected_source,
        "Test case {} failed for namespace {}",
        test_case, namespace
    );
}

macro_rules! generate_test_case {
    ( $ (
        ($namespace: ident, $case_name: ident, $process: expr)
    ),* ) => {
        $(
            #[test]
            fn ${concat(opti_, $case_name, _, $namespace)}() {
                compare_test_case(stringify!($case_name), stringify!($namespace), $process);
            }
        )*
    };
}

fn licm_pass_wrapper(module: &mut Module, func_name: &str) {
    let module_id = module.get_module_id_by_symbol(func_name).unwrap();
    let func_id = module_id.to_func_id();
    let func = module.get_mut_function(func_id).unwrap();
    let cfg = cfg_anylysis(func);
    let dom = domtree_analysis(&cfg);
    let natural_loops = natural_loop_analysis(&dom, &cfg);
    licm_pass(func, &cfg, &dom, &natural_loops);
}

generate_test_case! {
    (
        licm, do_while_loop, |mut module| {
            licm_pass_wrapper(&mut module, "do_while_loop");
            module
        }
    ),
    (
        licm, for_loop, |mut module| {
            licm_pass_wrapper(&mut module, "for_loop_func");
            module
        }
    )
}

fn gvn_pass_wrapper(module: &mut Module, func_name: &str) {
    let module_id = module.get_module_id_by_symbol(func_name).unwrap();
    let func_id = module_id.to_func_id();
    let func = module.get_mut_function(func_id).unwrap();
    let cfg = cfg_anylysis(func);
    let dom = domtree_analysis(&cfg);
    let rpo = revrese_post_order_analysis(&cfg);
    gvn_pass(func, &dom, &cfg, &rpo);
}

generate_test_case! {
    (
        gvn, gvn_diamond, |mut module| {
            gvn_pass_wrapper(&mut module, "gvn_func");
            module
        }
    ),
    (
        gvn, gvn_do_while_loop, |mut module| {
            gvn_pass_wrapper(&mut module, "gvn_do_while_loop");
            module
        }
    )
}

fn dce_pass_wrapper(module: &mut Module, func_name: &str) {
    let module_id = module.get_module_id_by_symbol(func_name).unwrap();
    let func_id = module_id.to_func_id();
    let func = module.get_mut_function(func_id).unwrap();
    let cfg = cfg_anylysis(func);
    let post_dom = post_domtree_analysis(&cfg);
    dce_pass(func, &post_dom);
}

generate_test_case!(
    (dce, dce_diamond_return_void, |mut module| {
        dce_pass_wrapper(&mut module, "dce_diamond_return_void");
        module
    }),
    (dce, dce_diamond_return_i16, |mut module| {
        dce_pass_wrapper(&mut module, "dce_diamond_return_i16");
        module
    }),
    (dce, dce_diamond_like_return_void, |mut module| {
        dce_pass_wrapper(&mut module, "dce_diamond_like_return_void");
        module
    }),
    (dce, dce_mem_oneline, |mut module| {
        dce_pass_wrapper(&mut module, "dce_mem_oneline");
        module
    }),
    (dce, dce_wihtout_mem_oneline, |mut module| {
        dce_pass_wrapper(&mut module, "dce_wihtout_mem_oneline");
        module
    })
);
