use rustyc_frontend::ast::declar::StructDefinition;
use crate::ir::value::IrValueType;
use std::collections::HashMap;

pub type StructLayoutMap = HashMap<String, StructLayout>;
pub type StructLayout = HashMap<String, StructalEntry>;
#[derive(Debug, Clone)]
pub enum StructalEntry {
    BasicType {
        offset: usize,
        data_type: IrValueType,
    },
    Reference {
        offset: usize,
        id: usize,
    }
}
