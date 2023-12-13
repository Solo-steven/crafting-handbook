/// This module will take ast as input and covert ast into ir instructions.
mod symbol_table;
mod function;

use crate::ir_converter::function::FunctionCoverter;
use std::collections::HashMap;
use crate::ir::function::*;
use crate::ir_converter::symbol_table::*;
use rustyc_frontend::ast::*;
use rustyc_frontend::ast::declar::*;
/// Convert AST to IR blocks
pub struct Converter {
    pub functions: Vec<Function>,
    /// storage information about struct layout 
    pub struct_layout_table: StructLayoutTable,
    /// storage informatiob abour size of struct
    pub struct_size_table: StructSizeTable,
}
impl Converter {
    pub fn new() -> Self {
        Self {
            functions: Vec::new(),
            struct_layout_table: HashMap::new(),
            struct_size_table: HashMap::new(),
        }
    }
    pub fn convert(&mut self, program: &Program) {
        self.accept_program(program);
    }
    fn accept_program(&mut self, program: &Program) {
        for item in &program.body {
            self.accept_block_item(item);
        }
    }
    fn accept_block_item(&mut self, block_item: &BlockItem) {
        match block_item {
            BlockItem::Declar(declar) => self.accept_declar(declar),
            BlockItem::Stmt(stmt) => {}
        }
    }
    fn accept_declar(&mut self, declar: &Declaration) {
        match declar {
            Declaration::DelcarList(declar_list) => self.accept_declar_list(declar_list),
            Declaration::FunType(func_type) => self.accept_function_type(func_type),
            Declaration::ValueType(value_type) => {}
        }
    }
    fn accept_declar_list(&mut self, declar_list: &DeclarationList) {

    }
    fn accept_function_type(&mut self, func_type: &FunctionType) {
        match func_type {
            FunctionType::Declar(func_declar) => self.accpet_function_declar(func_declar),
            FunctionType::Def(func_def) => self.accept_function_def(func_def),
        }
    }
    fn accpet_function_declar(&mut self, func_declar: &FunctionDeclaration)   {
        todo!();
    }
    fn accept_function_def(&mut self, func_def: &FunctionDefinition) {
        self.functions.push(FunctionCoverter::new().convert(func_def));
    }
    
}

