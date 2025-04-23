pub mod builder;
pub mod entities;
pub mod opti;

use builder::FunctionBuilder;
use entities::function::Function;
use entities::r#type::ValueType;
fn main() {
    let mut fun = Function::new();
    fun.def_func_param(ValueType::F32);
    fun.set_return_type(ValueType::Void);
    let bb = fun.create_block();
    let mut builder = FunctionBuilder::new(&mut fun);
    builder.switch_to_block(bb);
    let a = builder.iconst_inst(vec![10, 10], ValueType::F32);
    let b = builder.iconst_inst(vec![10, 10], ValueType::F32);
    builder.add_inst([a, b]);
    println!("{}", fun);
}
