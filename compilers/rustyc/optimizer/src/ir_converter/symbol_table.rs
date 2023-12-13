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
    ArrayType(ArraySymbolType)
}
#[derive(Debug, Clone)]
pub struct PointerSymbolType {
    pub level: usize,
    pub pointer_to: Box<SymbolType>
}
#[derive(Debug, Clone)]
pub struct  ArraySymbolType {
    pub dims: usize,
    pub array_of: Box<SymbolType>,
    /// for example if access `array[2][4]`,
    /// output will be `[Value(2), Value(4)]`.
    pub value_of_dims: Vec<Value>,
}

/// 
pub type StructLayoutTable = HashMap<String, StructLayout>;

pub type StructLayout = HashMap<String, StructLayoutEntry>;
#[derive(Debug, Clone)]
pub struct StructLayoutEntry {
    pub offset: usize,
    pub data_type: SymbolType
}

/// 
pub type StructSizeTable = HashMap<String,usize>;