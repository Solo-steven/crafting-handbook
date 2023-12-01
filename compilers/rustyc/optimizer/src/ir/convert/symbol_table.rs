use std::collections::HashMap;
use crate::ir::value::{Value, IrValueType};

pub type SymbolTable = HashMap<String, SymbolEntry>;
#[derive(Debug)]
/// A symbol entry contain the virtual register store the address of that symbol.
/// and the data type of that symbol.
pub struct SymbolEntry {
    pub reg: Value,
    pub data_type: SymbolType,
}
#[derive(Debug,Clone)]
pub enum SymbolType {
    BasicType(IrValueType),
    PointerType(PointerSymbolType),
    StructalType(String),
}
#[derive(Debug, Clone)]
pub struct PointerSymbolType {
    pub level: usize,
    pub pointer_to: Box<SymbolType>
}

/// 
pub type StructLayoutTable = HashMap<String, StructLayout>;

pub type StructLayout = HashMap<String, StructLayoutEntry>;
#[derive(Debug, Clone)]
pub struct StructLayoutEntry {
    pub offset: usize,
    pub data_type: SymbolType
}


pub type StructSizeTable = HashMap<String,usize>;