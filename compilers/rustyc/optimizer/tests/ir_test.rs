/// This test moudle test ir builder and ir and type checker for ir.
use rustyc_optimizer::ir::function::Function;
#[test]
fn test_build_add_inst() {
    let mut function = Function::new(String::from("test_build_add_inst"));
    let enter_block = function.create_block();
    function.switch_to_block(enter_block);
    let src1 = function.create_i32_const(10);
    let src2 = function.create_i32_const(10);
    function.build_add_inst(src1, src2);
}