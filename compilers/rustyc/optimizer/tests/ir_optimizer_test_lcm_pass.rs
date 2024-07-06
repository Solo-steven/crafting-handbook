mod test_utils;
use rustyc_optimizer::ir::function::Function;
use rustyc_optimizer::ir_optimizer::pass::lcm::LCMPass;
use test_utils::{get_tests_folder_root_path, test_pass};
fn get_pass() -> LCMPass {
    LCMPass::new()
}
fn get_table_path() -> String {
    String::from(
        get_tests_folder_root_path().join("ir_optimizer/lcm/").as_os_str().to_str().unwrap()
    )
}
generate_pass_cases!(
    (lcm_graph_from_cmu, "lcm_graph_from_cmu", &mut create_lcm_test_graph())
);

/// ## Generate Test Function For LCM 1
/// This function graph is reference from CMU lecture in Page 21
/// - ref: https://www.cs.cmu.edu/afs/cs/academic/class/15745-s16/www/lectures/L12-Lazy-Code-Motion.pdf
fn create_lcm_test_graph() -> Function {
    let mut function = Function::new(String::from("test_lcm_from_cmu"));
    // create blocks
    let entry = function.create_block();
    function.mark_as_entry(entry);
    let b1 = function.create_block();
    let b2 = function.create_block();
    let b3 = function.create_block();
    let b4 = function.create_block();
    let b5 = function.create_block();
    let b6 = function.create_block();
    let b7 = function.create_block();
    let b8 = function.create_block();
    let b9 = function.create_block();
    let b10 = function.create_block();
    let exit = function.create_block();
    function.mark_as_exit(exit);

    // connect
    function.connect_block(entry, b1);
    function.connect_block(b1, b2);

    function.connect_block(b2, b3);
    function.connect_block(b3, b4);
    function.connect_block(b4, b3);
    function.connect_block(b4, b5);
    function.connect_block(b5, b6);
    function.connect_block(b6, b10);

    function.connect_block(b2, b7);
    function.connect_block(b7, b8);
    function.connect_block(b8, b9);
    function.connect_block(b9, b10);

    function.connect_block(b10, exit);

    // inst
    function.switch_to_block(b1);
    let u8_const = function.create_u8_const(1);
    let b = function.build_mov_inst(u8_const);
    let u8_const_1 = function.create_u8_const(1);
    let c = function.build_mov_inst(u8_const_1);
    function.switch_to_block(b7);
    function.build_add_inst(b, c);
    function.switch_to_block(b10);
    function.build_add_inst(b, c);

    function
}
/// ## Generate Test Function For LCM 2
/// This function is reference from dragon book lazy code motion section
fn create_lcm_test_graph_2() {}
