use zsh_ir::entities::module::Module;
use zsh_ir::entities::r#type::ValueType;
use zsh_ir::builder::FunctionBuilder;

pub fn build_module() -> Module {
    let mut module = Module::new();
    let func_id = module.declar_function("unary_inst"); 
    let func_mut_refernece = module.get_mut_function(func_id).unwrap();

    let reg0 = func_mut_refernece.def_func_param(ValueType::I16);
    let reg1 = func_mut_refernece.def_func_param(ValueType::I16);

    let bb =func_mut_refernece.create_block();

    let mut builder = FunctionBuilder::new(func_mut_refernece);
    builder.switch_to_block(bb);
    let _reg2 = builder.mov_inst(reg0);
    let _reg3 = builder.neg_inst(reg1);
    builder.ret_inst(None);
    module
}