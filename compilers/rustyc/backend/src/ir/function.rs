use crate::ir::instructions::*;
#[derive(Debug, PartialEq, Clone)]
pub struct  Param {
    data_type: DataType,
    name: Identifier, 
}
#[derive(Debug, PartialEq, Clone)]
pub struct Function {
    params: Vec<Param>,
    body: Vec<Instruction>,
}
