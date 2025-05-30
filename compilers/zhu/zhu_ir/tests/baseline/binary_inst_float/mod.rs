use zsh_ir::builder::FunctionBuilder;
use zsh_ir::entities::module::Module;
use zsh_ir::entities::r#type::ValueType;

pub fn build_module() -> Module {
    let mut module = Module::new();
    let func_id = module.declar_function("binary_inst_float");
    let func_mut_refernece = module.get_mut_function(func_id).unwrap();

    let reg0 = func_mut_refernece.def_func_param(ValueType::F32);
    let reg1 = func_mut_refernece.def_func_param(ValueType::F32);

    let bb = func_mut_refernece.create_block();

    let mut builder = FunctionBuilder::new(func_mut_refernece);
    builder.switch_to_block(bb);
    let reg2 = builder.fadd_inst([reg1, reg0]);
    let reg3 = builder.fsub_inst([reg2, reg1]);
    let reg4 = builder.fmul_inst([reg3, reg2]);
    let reg5 = builder.fdivide_inst([reg4, reg3]);
    let _reg6 = builder.freminder_inst([reg5, reg4]);
    builder.ret_inst(None);
    module
}
