pub mod builder;
pub mod entities;
pub mod opti;
pub mod frontend;
pub mod formatter;

use builder::FunctionBuilder;
use entities::immediate::Offset;
use entities::module::{DataDescription, Module, ModuleLevelId};
use entities::r#type::ValueType;
use entities::function::Function;
use formatter::Formatter;
use opti::cfg::ControlFlowGraph;
use opti::domtree::DomTree;
use frontend::parser::Parser;
use serde::{Deserialize, Serialize};

use frontend::to_tokens;

fn build_test_cfg() {
    let mut fun = Function::new();
    let v1 = fun.def_func_param(ValueType::U8);
    let v2 = fun.def_func_param(ValueType::I16);
    let v3 = fun.def_func_param(ValueType::I16);

    let entry = fun.create_block();
    let bb1 = fun.create_block();
    let bb2 = fun.create_block();
    let exit = fun.create_block();

    let mut builder = FunctionBuilder::new(&mut fun);
    builder.switch_to_block(entry);
    builder.brif_inst(v1, bb1, bb2);
    builder.switch_to_block(bb1);
    builder.jump_inst(exit);
    builder.switch_to_block(bb2);
    builder.jump_inst(exit);
    builder.switch_to_block(exit);
    builder.ret_inst(None);

    let mut cfg = ControlFlowGraph::new();
    cfg.process(&fun);

    let mut dom = DomTree::new();
    dom.process(&cfg);

    println!("{:?}", cfg);
    println!("{:?}", dom);
}

fn build_test_df() {
    let mut fun = Function::new();
    let v1 = fun.def_func_param(ValueType::U8);
    let v2 = fun.def_func_param(ValueType::I16);
    let v3 = fun.def_func_param(ValueType::I16);

    let entry = fun.create_block();
    let bb1 = fun.create_block();
    let bb2 = fun.create_block();
    let exit = fun.create_block();

    let mut builder = FunctionBuilder::new(&mut fun);
    builder.switch_to_block(entry);
    builder.brif_inst(v1, bb1, bb2);
    builder.switch_to_block(bb1);
    builder.brif_inst(v2, exit, entry);
    builder.switch_to_block(bb2);
    builder.brif_inst(v3, exit, entry);
    builder.switch_to_block(exit);
    builder.ret_inst(None);

    let mut cfg = ControlFlowGraph::new();
    cfg.process(&fun);

    let mut dom = DomTree::new();
    dom.process(&cfg);

    println!("{:?}", cfg);
    println!("{:?}", dom);
}

fn test_fomratter() {
    let mut module = Module::new();
    let data_desce = DataDescription {};
    let data_id = module.define_data("test_global", data_desce);
    let func_id = module.declar_function("test_func");
    let global = module.declar_data_in_function(data_id, func_id);
    let func = module.get_mut_function(func_id).unwrap();

    let bb = func.create_block();
    let mut builder = FunctionBuilder::new(func);
    builder.switch_to_block(bb);
    builder.global_load_inst(global, Offset(0), ValueType::F32);

    let formatter = Formatter::new();

    println!("{}", formatter.fmt_module(&module))
}

fn main() {
    // let mut fun = Function::new();
    // fun.def_func_param(ValueType::F32);
    // fun.set_return_type(ValueType::Void);
    // let bb = fun.create_block();
    // let mut builder = FunctionBuilder::new(&mut fun);
    // builder.switch_to_block(bb);
    // let a = builder.iconst_inst(vec![10, 10], ValueType::F32);
    // let b = builder.iconst_inst(vec![10, 10], ValueType::F32);
    // builder.add_inst([a, b]);
    // println!("{}", fun);
    // build_test_df();

    // let mut ds = DS {
    //     hash: Default::default()
    // };
    // ds.hash.insert(1, 1);
    // println!("{:?}", serde_json::to_string(&ds).unwrap());
    // build_test_df();
    let source = "
func binary_immi_inst(reg0: u16, reg1: u16) {
block100:
    reg4 = add reg1 reg2
}
    ";
    println!("{:?}", to_tokens(source));
    let mut parser = Parser::new(source);
    let mut module = parser.parse();
    let func_name = "binary_immi_inst";

    let id = match module.get_module_id_by_symbol(func_name).unwrap() {
        ModuleLevelId::Func(func) => func.clone(),
        _ => panic!()
    };

    let func = module.get_mut_function(id).unwrap();
    let bb = func.create_block();
    let mut builder = FunctionBuilder::new(func);
    builder.switch_to_block(bb);
    builder.iconst_inst(vec![0], ValueType::I32);

    let formatter = Formatter::new();

    println!("{}", formatter.fmt_module(&module));

}
