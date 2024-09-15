use rustyc_optimizer::ir::{self, function::Function, value::IrValueType};

/// ## Generate Test Function For LCM 1
/// This function graph is reference from CMU lecture in Page 21
/// - ref: https://www.cs.cmu.edu/afs/cs/academic/class/15745-s16/www/lectures/L12-Lazy-Code-Motion.pdf
pub fn create_lcm_test_graph() -> Function {
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
/// This function is reference from dragon book lazy code motion section.
pub fn create_lcm_test_graph_2() {}

/// ## Generate Test Function For GVN
/// This function is reference from conrnell course example
/// - ref: https://www.cs.cornell.edu/courses/cs6120/2019fa/blog/global-value-numbering/
pub fn create_gvn_graph_from_conrnell() -> Function {
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
    let w0: ir::value::Value = function.build_add_inst(e0, f0);
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

    function
}
