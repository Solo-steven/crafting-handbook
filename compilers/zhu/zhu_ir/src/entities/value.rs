use crate::entities::instruction::Instruction;
use crate::entities::r#type::ValueType;
#[derive(Debug, PartialEq, Clone, Eq, Hash, Copy)]
pub struct Value(pub u32);
#[derive(Debug, PartialEq, Clone, Eq)]
pub enum ValueData {
    Inst { inst: Instruction, ty: ValueType },
    Param { ty: ValueType, index: usize },
}
