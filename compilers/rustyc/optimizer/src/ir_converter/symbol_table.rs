use std::collections::HashMap;
use crate::ir::value::{Value, IrValueType};

pub struct SymbolTable<'a> {
    table_list: Vec<HashMap<String, SymbolEntry>>,
    root_table: Option<&'a SymbolTable<'a>>,
}
impl<'a> SymbolTable<'a> {
    pub fn new(root_table: Option<&'a SymbolTable<'a>>) -> Self {
        Self {
            table_list: vec![HashMap::new()],
            root_table,
        }
    }
    pub fn insert(&mut self, name: String, entry: SymbolEntry) {
        let len = self.table_list.len()-1; 
        self.table_list[len].insert(name, entry);
    }
    pub fn get(&self, name: &str) -> Option<&SymbolEntry> {
        let mut index = self.table_list.len()-1;
        for _i in 0..self.table_list.len() {
            let current_table = &self.table_list[index];
            if let Some(entry) = current_table.get(name) {
                return Some(entry);
            }
            index -=1;
        }
        match self.root_table {
            Some(table) => {
                table.get(name)
            }
            None => None
        }
    }
    pub fn remove(&mut self) {
        self.table_list.pop();
    }
}
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
///
pub type StructLayout = HashMap<String, StructLayoutEntry>;
///
#[derive(Debug, Clone)]
pub struct StructLayoutEntry {
    pub offset: usize,
    pub data_type: SymbolType
}
/// 
pub type StructSizeTable = HashMap<String,usize>;

#[derive(Debug, Clone)]
pub struct FunctionStructLayoutTable<'a> {
    pub struct_layout_table: StructLayoutTable,
    pub global_struct_layout_table: &'a StructLayoutTable,
}

impl<'a> FunctionStructLayoutTable<'a> {
    pub fn new(global_struct_layout_table: &'a StructLayoutTable) -> Self {
        Self {
            struct_layout_table: HashMap::new(),
            global_struct_layout_table,
        }
    }
    pub fn get(&self, name: &str) -> Option<&HashMap<String, StructLayoutEntry>> {
        if let Some(entry) = self.struct_layout_table.get(name) {
            return Some(entry)
        }
        if let Some(entry) = self.global_struct_layout_table.get(name) {
            return Some(entry)
        }
        return None
    }
    pub fn insert(&mut self, name: String, layout:HashMap<String, StructLayoutEntry> ) {
        self.struct_layout_table.insert(name, layout);
    }
}
#[derive(Debug, Clone)]
pub struct FunctionStructSizeTable<'a> {
    pub struct_size_table: StructSizeTable,
    pub global_function_struct_size_table: &'a StructSizeTable,
}

impl <'a> FunctionStructSizeTable<'a> {
    pub fn new(global_function_struct_size_table: &'a StructSizeTable) -> Self {
        Self {
            struct_size_table: HashMap::new(),
            global_function_struct_size_table,
        }
    }
    pub fn get(&self, name: &str) -> Option<&usize> {
        if let Some(entry) = self.struct_size_table.get(name) {
            return Some(entry);
        }
        if let Some(entry) = self.global_function_struct_size_table.get(name) {
            return Some(entry);
        }
        return None;
    }
    pub fn insert(&mut self, name: String, size: usize) {
        self.struct_size_table.insert(name, size);
    }
}

pub type FunctionSignatureTable = HashMap<String, FunctionSignature>;
#[derive(Debug, Clone)]
pub struct FunctionSignature {
    pub return_type: Option<SymbolType>,
    pub params: Vec<SymbolType>
}