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
    let _w0: ir::value::Value = function.build_add_inst(e0, f0);
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
    let _x2 = function.build_phi_inst(vec![(b2, x0), (b3, x1)]);
    let y2 = function.build_phi_inst(vec![(b2, y0), (b3, y1)]);
    function.build_add_inst(u2, y2);
    function.build_add_inst(a0, b0);
    function.build_ret_inst(None);

    function
}

/// ## Generate Test function for DOM
/// This function is reference from the book `Engineering a Compiler 2/e` p499
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
/// ## Create simple graph to test use-def information:
/// ```markdown
/// t0 = 10;
/// t1 = 1000;
/// --------
/// t2 = t1 + t0;
/// t3 = t1 + t2;
/// ----------
/// t4 = t1 + t3;
/// ```
pub fn create_use_def_graph() -> Function {
    let mut func = Function::new(String::from("test_fun"));
    // block 0
    let b0 = func.create_block();
    func.switch_to_block(b0);
    let const10 = func.create_u32_const(10);
    let t0 = func.build_mov_inst(const10);
    let const1000 = func.create_u32_const(10000);
    let t1 = func.build_mov_inst(const1000);
    // block1
    let b1 = func.create_block();
    func.switch_to_block(b1);
    let t2 = func.build_add_inst(t0, t1);
    let t3 = func.build_add_inst(t1, t2);
    // block 2
    let b2 = func.create_block();
    func.switch_to_block(b2);
    let _t4 = func.build_add_inst(t1, t3);
    // mark entry exit
    func.mark_as_exit(b2);
    func.mark_as_entry(b0);
    // connect
    func.connect_block(b0, b1);
    func.connect_block(b1, b2);
    func
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
    // exit
    function.switch_to_block(b3);
    function.build_ret_inst(None);

    function
}

pub fn create_simple_loop() -> Function {
    let mut function = Function::new(String::from("test_fun"));
    let b1 = function.create_block();
    function.mark_as_entry(b1);
    let b2 = function.create_block();
    function.mark_as_exit(b2);
    function.connect_block(b1, b2);
    function.connect_block(b2, b1);

    function
}

pub fn create_backward_edge_example() -> Function {
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
