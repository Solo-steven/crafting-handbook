use crate::ir::value::{IrValueType, Value};
/// This module provide four kind of table
use std::collections::{BTreeMap, HashMap};
/// ## Symbol Table For Function Scope
/// when enter a function scope, we need to create this table and provide
/// global table as root table. since block scope in C can only exit in
/// function, so every time we enter a block scope we will create a sub-table
/// for current symbol table.
#[derive(Debug, Clone)]
pub struct SymbolTable<'a> {
    pub table_list: Vec<HashMap<String, SymbolEntry>>,
    pub root_table: Option<&'a SymbolTable<'a>>,
}
impl<'a> SymbolTable<'a> {
    pub fn new(root_table: Option<&'a SymbolTable<'a>>) -> Self {
        Self {
            table_list: vec![HashMap::new()],
            root_table,
        }
    }
    /// Insert a symbol in current symbol table
    pub fn insert(&mut self, name: String, entry: SymbolEntry) {
        let len = self.table_list.len() - 1;
        self.table_list[len].insert(name, entry);
    }
    /// Get a symbol by looking up table
    pub fn get(&self, name: &str) -> Option<&SymbolEntry> {
        for index in (0..self.table_list.len()).rev() {
            let current_table = &self.table_list[index];
            if let Some(entry) = current_table.get(name) {
                return Some(entry);
            }
        }
        match self.root_table {
            Some(table) => table.get(name),
            None => None,
        }
    }
    pub fn clear(&mut self) {
        let len = self.table_list.len() - 1;
        self.table_list[len].clear();
    }
    // enter a scope, create a new table.
    pub fn enter_scope(&mut self) {
        self.table_list.push(Default::default());
    }
    // eixt a scope, pop a table.
    pub fn exit_scope(&mut self) {
        self.table_list.pop();
    }
}
/// A symbol entry contain the virtual register store the address of that symbol.
/// and the data type of that symbol.
#[derive(Debug, Clone)]
pub struct SymbolEntry {
    pub reg: Value,
    pub symbol_type: SymbolType,
}
#[derive(Debug, Clone)]
pub enum SymbolType {
    BasicType(IrValueType),
    PointerType(PointerSymbolType),
    StructalType(String),
    ArrayType(ArraySymbolType),
}
/// level of pointer symbol mean this pointer type
/// is how many `pointer to` anther non-pointer type
/// ex: int**p, is pointer to pointer to int. so the
/// level will be 2.
#[derive(Debug, Clone)]
pub struct PointerSymbolType {
    pub level: usize,
    pub pointer_to: PointerToSymbolType,
}
#[derive(Debug, Clone)]
pub enum PointerToSymbolType {
    BasicType(IrValueType),
    StructalType(String),
    ArrayType(ArraySymbolType),
    FunctionType {
        id: String,
        return_type: Box<SymbolType>,
        params_type: Vec<SymbolType>,
    },
}
pub fn map_pointer_to_symbol_to_symbol_type(pointer_to_symbol: PointerToSymbolType) -> SymbolType {
    match pointer_to_symbol {
        PointerToSymbolType::ArrayType(array_sumbol_type) => SymbolType::ArrayType(array_sumbol_type),
        PointerToSymbolType::BasicType(ir_type) => SymbolType::BasicType(ir_type),
        PointerToSymbolType::StructalType(struct_name) => SymbolType::StructalType(struct_name),
        PointerToSymbolType::FunctionType { .. } => panic!(),
    }
}

#[derive(Debug, Clone)]
pub struct ArraySymbolType {
    pub array_of: Box<SymbolType>,
    /// for example if access `array[2][4]` then the
    /// `value_of_dims` will be `[Value(2), Value(4)]`.
    pub value_of_dims: Vec<Value>,
}

#[derive(Debug, Clone)]
pub struct StructLayoutTable<'a> {
    table_list: Vec<HashMap<String, StructLayout>>,
    root_table: Option<&'a StructLayoutTable<'a>>,
}
pub type StructLayout = BTreeMap<String, StructLayoutEntry>;
#[derive(Debug, Clone)]
pub struct StructLayoutEntry {
    pub offset: usize,
    pub data_type: SymbolType,
}
impl<'a> StructLayoutTable<'a> {
    pub fn new(root_table: Option<&'a StructLayoutTable<'a>>) -> Self {
        Self {
            table_list: vec![HashMap::new()],
            root_table,
        }
    }
    pub fn insert(&mut self, name: String, entry: StructLayout) {
        let len = self.table_list.len() - 1;
        self.table_list[len].insert(name, entry);
    }
    pub fn get(&self, name: &str) -> Option<&StructLayout> {
        for index in (0..self.table_list.len()).rev() {
            let current_table = &self.table_list[index];
            if let Some(entry) = current_table.get(name) {
                return Some(entry);
            }
        }
        match self.root_table {
            Some(table) => table.get(name),
            None => None,
        }
    }
    pub fn enter_scope(&mut self) {
        self.table_list.push(Default::default());
    }
    pub fn exit_scope(&mut self) {
        self.table_list.pop();
    }
}

#[derive(Debug, Clone)]
pub struct StructSizeTable<'a> {
    table_list: Vec<HashMap<String, usize>>,
    root_table: Option<&'a StructSizeTable<'a>>,
}
impl<'a> StructSizeTable<'a> {
    pub fn new(root_table: Option<&'a StructSizeTable<'a>>) -> Self {
        Self {
            table_list: vec![HashMap::new()],
            root_table,
        }
    }
    pub fn insert(&mut self, name: String, entry: usize) {
        let len = self.table_list.len() - 1;
        self.table_list[len].insert(name, entry);
    }
    pub fn get(&self, name: &str) -> Option<&usize> {
        for index in (0..self.table_list.len()).rev() {
            let current_table = &self.table_list[index];
            if let Some(entry) = current_table.get(name) {
                return Some(entry);
            }
        }
        match self.root_table {
            Some(table) => table.get(name),
            None => None,
        }
    }
    pub fn enter_scope(&mut self) {
        self.table_list.push(Default::default());
    }
    pub fn exit_scope(&mut self) {
        self.table_list.pop();
    }
}
///
pub type FunctionSignatureTable = HashMap<String, FunctionSignature>;
#[derive(Debug, Clone)]
pub struct FunctionSignature {
    pub return_type: SymbolType,
    pub params: Vec<SymbolType>,
}
