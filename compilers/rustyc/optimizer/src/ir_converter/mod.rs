/// This module will take ast as input and covert ast into ir instructions.
mod symbol_table;
mod function;

use crate::ir_converter::function::FunctionCoverter;
use std::collections::HashMap;
use crate::ir::function::*;
use crate::ir::value::*;
use crate::ir_converter::symbol_table::*;
use rustyc_frontend::ast::*;
use rustyc_frontend::ast::declar::*;
use rustyc_frontend::ast::expr::*;
/// Convert AST to IR blocks
pub struct Converter<'a> {
    pub functions: Vec<Function>,

    pub symbol_table: SymbolTable<'a>,
    /// storage information about struct layout 
    pub struct_layout_table: StructLayoutTable<'a>,
    /// storage informatiob abour size of struct
    pub struct_size_table: StructSizeTable<'a>,
    /// function signature table, store function name mapping to return type and param type
    pub function_signature_table: FunctionSignatureTable,
}
impl<'a> Converter<'a> {
    pub fn new() -> Self {
        Self {
            functions: Vec::new(),
            struct_layout_table: StructLayoutTable::new(None),
            symbol_table: SymbolTable::new(None),
            struct_size_table: StructSizeTable::new(None),
            function_signature_table: HashMap::new(),
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
            BlockItem::Stmt(_stmt) => {}
        }
    }
    fn accept_declar(&mut self, declar: &Declaration) {
        match declar {
            Declaration::DelcarList(declar_list) => self.accept_declar_list(declar_list),
            Declaration::FunType(func_type) => self.accept_function_type(func_type),
            Declaration::ValueType(value_type) => self.accept_value_type(value_type)
        }
    }
    /// When accept a value type ast, mean there may be declar of def of a struct enum or union.
    /// - if is struct, we need generate it's struct layout, struct size and store it to tables.
    fn accept_value_type(&mut self, value_type: &ValueType) {
        match value_type {
            ValueType::Struct(_) => {
                self.map_ast_type_to_symbol_type(value_type);
                self.get_size_form_ast_type(value_type);
            }
            _ => {}
        }
    }
    fn accept_declar_list(&mut self, _declar_list: &DeclarationList) {

    }
    fn accept_function_type(&mut self, func_type: &FunctionType) {
        match func_type {
            FunctionType::Declar(func_declar) => self.accpet_function_declar(func_declar),
            FunctionType::Def(func_def) => self.accept_function_def(func_def),
        }
    }
    fn accpet_function_declar(&mut self, func_declar: &FunctionDeclaration)   {
        let return_symbol_type = self.map_ast_type_to_symbol_type(&func_declar.return_type);
        let params_symbol_type: Vec<SymbolType> = 
            func_declar.params
            .iter()
            .map(|param_declar| self.map_ast_type_to_symbol_type(&param_declar.value_type))
            .collect();
        self.function_signature_table.insert(
            func_declar.id.name.to_string(), 
            FunctionSignature { return_type: Some(return_symbol_type), params: params_symbol_type}
        );
    }
    fn accept_function_def(&mut self, func_def: &FunctionDefinition) {
        let return_symbol_type = self.get_signature_return_symbol_type_from_ast_type(&func_def.return_type);
        let params_symbol_type: Vec<SymbolType> = 
            func_def.params
            .iter()
            .map(|param_declar| self.map_ast_type_to_symbol_type(&param_declar.value_type))
            .collect();
        self.function_signature_table.insert(
            func_def.id.name.to_string(), 
            FunctionSignature { return_type: return_symbol_type, params: params_symbol_type}
        );
        self.functions.push(
            FunctionCoverter::new(
                &mut self.function_signature_table,
                Some(&self.struct_layout_table),
                Some(&self.struct_size_table),
                Some(&self.symbol_table)
            ).convert(func_def));
    }
    fn get_signature_return_symbol_type_from_ast_type(&mut self, value_type: &ValueType) -> Option<SymbolType> {
        match value_type {
            ValueType::Void => None,
            _ => Some(self.map_ast_type_to_symbol_type(value_type))
        }
    }
    fn map_ast_type_to_symbol_type(&mut self, value_type: &ValueType) -> SymbolType {
       let mut symbol_type = map_ast_type_to_symbol_type(value_type, &mut self.struct_layout_table, &mut self.struct_size_table);
       if let SymbolType::ArrayType(array_symbol_type) = &mut symbol_type {
            if let ValueType::ArrayType(array_value_type) = value_type {
                for expr in &array_value_type.dims {
                    array_symbol_type.value_of_dims.push(self.accpet_expr_const(expr));
                }
            }
       }
       symbol_type
    }
    fn get_size_form_ast_type(&mut self, value_type: &ValueType) -> usize {
        get_size_form_ast_type(value_type, &mut self.struct_size_table)
    }
    fn accpet_expr_const(&mut self, _expr: &Expression) -> Value {
        todo!();
    }
}

/// Mapping the ast type to symbol table, used when 
/// - in declaration list, we need to get the symbol type of a declarator's value type.
fn map_ast_type_to_symbol_type(value_type: &ValueType, struct_layout_table: &mut StructLayoutTable, struct_size_table: &mut StructSizeTable) -> SymbolType {
    match value_type  {
        ValueType::Char | ValueType::UnSignedChar |
        ValueType::Shorted | ValueType::UnsignedShort |
        ValueType::Int | ValueType::Unsigned |
        ValueType::Long | ValueType::UnsignedLong |
        ValueType::LongLong | ValueType::UnsignedLongLong |
        ValueType::Float | ValueType::Double | ValueType::LongDouble => {
            SymbolType::BasicType(match value_type {
                ValueType::Char => IrValueType::U8,
                ValueType::UnSignedChar => IrValueType::U8,
                ValueType::Shorted => IrValueType::I16,
                ValueType::UnsignedShort => IrValueType::U16,
                ValueType::Int => IrValueType::I32,
                ValueType::Unsigned => IrValueType::U32,
                ValueType::Long => IrValueType::I64,
                ValueType::UnsignedLong => IrValueType::U64,
                ValueType::LongLong => IrValueType::I64,
                ValueType::UnsignedLongLong => IrValueType::U64,
                ValueType::Float => IrValueType::F32,
                ValueType::Double => IrValueType::F64,
                ValueType::LongDouble => IrValueType::F64,
                _ => unreachable!(),
            })
        }
        ValueType::PointerType(pointer_type) => {
            SymbolType::PointerType(PointerSymbolType { 
                level: pointer_type.level, 
                pointer_to: Box::new(map_ast_type_to_symbol_type(&pointer_type.pointer_to, struct_layout_table, struct_size_table))
            })
        }
        ValueType::ArrayType(array_type) => {
            SymbolType::ArrayType(ArraySymbolType { 
                array_of: Box::new(map_ast_type_to_symbol_type(&array_type.array_of, struct_layout_table, struct_size_table)),
                value_of_dims: Vec::new(),
            })
        }
        ValueType::Struct(struct_type) => {
            // if is 
            match struct_type.as_ref() {
                StructType::Declar(declar) => {
                    if struct_layout_table.get(declar.id.name.as_ref()).is_some() {
                        SymbolType::StructalType(declar.id.name.to_string())
                    }else {
                        unreachable!("[Unreach Error]:")
                    }
                },
                StructType::Def(def) => {
                    let name = def.id.as_ref().unwrap().name.to_string();
                    struct_layout_table.insert(name.clone(), HashMap::new());
                    let mut layout = HashMap::new();
                    let mut offset = 0;
                    for declarator in &def.declarator {
                        layout.insert(
                            declarator.id.name.to_string(), 
                            StructLayoutEntry{ 
                                offset, data_type: 
                                map_ast_type_to_symbol_type(&declarator.value_type, struct_layout_table, struct_size_table)  
                            }
                        );
                        offset += get_size_form_ast_type(&declarator.value_type, struct_size_table);
                    }
                    struct_layout_table.insert(name, layout);
                    SymbolType::StructalType(def.id.as_ref().unwrap().name.to_string())
                }
            }
        }
        ValueType::Union(_) => todo!(),
        ValueType::Enum(_) => todo!(),
        // not gonna to implement
        ValueType::LongDoubleComplex => todo!(),
        ValueType::FloatComplex => todo!(),
        ValueType::DoubleComplex => todo!(),
        ValueType::Void => todo!(),
    }
}
/// ## Helper function to get the size from a as type
/// Get the size of a ast type in byte, please note that this function can not get a size of variable 
/// length array, it would panic.
fn get_size_form_ast_type(value_type: &ValueType, struct_size_table: &mut StructSizeTable) -> usize {
    match value_type {
        ValueType::Char => 1,
        ValueType::UnSignedChar => 1,
        ValueType::Shorted => 2,
        ValueType::UnsignedShort => 2,
        ValueType::Int => 4,
        ValueType::Unsigned => 4,
        ValueType::Long => 8,
        ValueType::UnsignedLong => 8,
        ValueType::LongLong => 8,
        ValueType::UnsignedLongLong => 8,
        ValueType::Float => 4,
        ValueType::Double => 8,
        ValueType::LongDouble => 8,
        ValueType::PointerType(_) => 4,
        ValueType::ArrayType(array_type) => {
            let mut size = get_size_form_ast_type(array_type.array_of.as_ref(), struct_size_table);
            for dim in &array_type.dims {
                match dim {
                    Expression::IntLiteral(int_literal) => {
                        size *= int_literal.raw_value.parse::<usize>().unwrap();
                    }
                    _ => unreachable!()
                }
            }
            size
        }
        ValueType::Struct(struct_type) => {
            match struct_type.as_ref() {
                StructType::Declar(declar) => {
                    match struct_size_table.get(declar.id.name.as_ref()) {
                        Some(size) => size.clone(),
                        None => unreachable!("[Unreach Error]: when get a size from a struct type declar, there must be struct already declar, it ensure by typechecker"),
                    }
                },
                StructType::Def(def) => {
                    if let Some(size) = struct_size_table.get(def.id.as_ref().unwrap().name.as_ref())  {
                        size.clone()
                    }else {
                        let mut size = 0;
                        for declarator in &def.declarator {
                            size += get_size_form_ast_type(&declarator.value_type, struct_size_table);
                        }
                        struct_size_table.insert(def.id.as_ref().unwrap().name.to_string(), size);
                        size
                    }
                }
            }
        }
        ValueType::Union(_) => todo!(),
        ValueType::Enum(_) => todo!(),
        // not gonna to implement
        ValueType::LongDoubleComplex => todo!(),
        ValueType::FloatComplex => todo!(),
        ValueType::DoubleComplex => todo!(),
        ValueType::Void => todo!(),
    }
}