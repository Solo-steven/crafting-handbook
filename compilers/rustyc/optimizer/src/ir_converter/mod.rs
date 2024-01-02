/// This module will take ast as input and covert ast into ir instructions.
mod symbol_table;
mod function;

use std::collections::BTreeMap;
use std::collections::HashMap;
use std::mem::replace;
use crate::ir::module::*;
use crate::ir::value::*;
use crate::ir_converter::function::FunctionCoverter;
use crate::ir_converter::symbol_table::*;
use rustyc_frontend::ast::*;
use rustyc_frontend::ast::declar::*;
use rustyc_frontend::ast::expr::*;
use rustyc_frontend::token::*;
/// Convert AST to IR blocks
pub struct Converter<'a> {
    /// module ir
    pub module: Module,
    /// cache for storage global value symbol
    pub global_symbol_cache: HashMap<String, SymbolType>,
    /// symbol table for current program
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
            module: Module::new(),
            global_symbol_cache: HashMap::new(),
            struct_layout_table: StructLayoutTable::new(None),
            symbol_table: SymbolTable::new(None),
            struct_size_table: StructSizeTable::new(None),
            function_signature_table: HashMap::new(),
        }
    }
    pub fn convert(&mut self, program: &Program) -> Module {
        self.accept_program(program);
        replace(&mut self.module, Module::new())
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
    fn accept_declar_list(&mut self, declar_list: &DeclarationList) {
        for declarator in &declar_list.declarators {
            let name = declarator.id.name.to_string();
            let symbol_type = self.map_ast_type_to_symbol_type(&declarator.value_type);
            let size = self.get_size_form_ast_type(&declarator.value_type);
            let ir_type = match symbol_type {
                SymbolType::BasicType(ref basic_ir_type) => Some(basic_ir_type.clone()),
                SymbolType::PointerType(_) => Some(IrValueType::Address),
                _ => None
            };
            self.global_symbol_cache.insert(name.clone(), symbol_type);
            if let Some(init_expr) = &declarator.init_value {
                let value = self.accpet_expr_const(init_expr);
                self.module.globals.insert(name, GloablValue { size, align: 8, ir_type, init_value: Some(value) });
            }else {
                self.module.globals.insert(name, GloablValue { size, align: 8, ir_type, init_value: None });
            }
            // self.symbol_table.insert(declarator.id.name.to_string(), SymbolEntry { reg: pointer, symbol_type: symbol_type.clone() });
            // TODO: init
        }
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
            FunctionSignature { return_type: return_symbol_type, params: params_symbol_type}
        );
    }
    fn accept_function_def(&mut self, func_def: &FunctionDefinition) {
        let return_symbol_type = self.map_ast_type_to_symbol_type(&func_def.return_type);
        let params_symbol_type: Vec<SymbolType> = 
            func_def.params
            .iter()
            .map(|param_declar| self.map_ast_type_to_symbol_type(&param_declar.value_type))
            .collect();
        self.function_signature_table.insert(
            func_def.id.name.to_string(), 
            FunctionSignature { return_type: return_symbol_type, params: params_symbol_type}
        );
        let mut func_convert = FunctionCoverter::new(
            &mut self.function_signature_table,
            &mut self.module.const_string,
            Some(&self.struct_layout_table),
            Some(&self.struct_size_table),
            None,
        );
        // insert global value as symbol
        for (name, _data) in &self.module.globals {
            let pointer =func_convert.function.create_global_variable_ref(name.clone());
            let mut symbol_type = self.global_symbol_cache.get(name).unwrap().clone();
            if let SymbolType::ArrayType(array_symbol_type) = &mut symbol_type {
                let mut next_value_of_dims: Vec<Value> = Vec::with_capacity(array_symbol_type.value_of_dims.len());
                for value in &array_symbol_type.value_of_dims {
                   let next_value = func_convert.function.insert_value_data_and_type(self.module.values.get(value).unwrap().clone(), None);
                   next_value_of_dims.push(next_value);
                }
                array_symbol_type.value_of_dims = next_value_of_dims;
            }
            self.symbol_table.insert(name.clone(), SymbolEntry { reg: pointer, symbol_type });
        }
        func_convert.symbol_table = SymbolTable { table_list: vec![Default::default()], root_table: Some(&self.symbol_table) };
        // convert with global value
        let func_ir = func_convert.convert(func_def);
        self.module.functions.push(func_ir);
        // clear global value from symbol table
        self.symbol_table.clear();
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
    /// ## Helper Function for getting size of a ast type
    /// 
    fn get_size_form_ast_type(&mut self, value_type: &ValueType) -> usize {
        get_size_form_ast_type(value_type, &mut self.struct_size_table)
    }
    fn accpet_expr_const(&mut self, expr: &Expression) -> Value {
        match expr {
            Expression::IntLiteral(int_literal) => self.accept_int_literal(int_literal),
            Expression::StringLiteral(string_literal) => self.accept_string_literal(string_literal),
            _ => todo!()
        }
    }
    /// ## Accept a Int literal
    /// Just create const for literal.
    fn accept_int_literal(&mut self, int_literal: &IntLiteral) -> Value {
        let value = match int_literal.base {
            IntLiteralBase::Decimal => {
                int_literal.raw_value.parse::<i128>().unwrap()
            }
            _ => todo!()
        };
        let ir_type =  match int_literal.value_type {
            ValueType::Char => IrValueType::U8,
            ValueType::Shorted => IrValueType::I16,
            ValueType::UnsignedShort => IrValueType::U16,
            ValueType::Int => IrValueType::I32,
            ValueType::Unsigned => IrValueType::U32,
            ValueType::Long => IrValueType::I64,
            ValueType::UnsignedLong => IrValueType::U64,
            ValueType::LongLong => IrValueType::I64,
            ValueType::UnsignedLongLong => IrValueType::U64,
            _ => unreachable!(),
        };
        match ir_type {
            IrValueType::U8 => self.module.create_u8_const(value as u8),
            IrValueType::U16 => self.module.create_u16_const(value as u16),
            IrValueType::U32 => self.module.create_u32_const(value as u32),
            IrValueType::U64 => self.module.create_u64_const(value as u64),
            IrValueType::I16 => self.module.create_i16_const(value as i16),
            IrValueType::I32 => self.module.create_i32_const(value as i32),
            IrValueType::I64 => self.module.create_i64_const(value as i64),
            _ => unreachable!(),
        }
    }
    fn accept_string_literal(&mut self, string_literal: &StringLiteral) -> Value {
        let index = self.module.const_string.get(string_literal.raw_value.as_ref());
        match index {
            Some(i) => {
                self.module.create_global_variable_ref(format!("str{}", i))
            }
            None => {
                let len_index = self.module.const_string.len() + 1;
                self.module.const_string.insert(string_literal.raw_value.to_string(), len_index);
                self.module.create_global_variable_ref(format!("str{}", len_index))
            }
        }
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
                pointer_to: 
                    match map_ast_type_to_symbol_type(&pointer_type.pointer_to, struct_layout_table, struct_size_table) {
                        SymbolType::BasicType(basic_type) => PointerToSymbolType::BasicType(basic_type),
                        SymbolType::ArrayType(array_type) => PointerToSymbolType::ArrayType(array_type),
                        SymbolType::StructalType(struct_name) => PointerToSymbolType::StructalType(struct_name),
                        
                        _ => unreachable!()
                    }
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
                    struct_layout_table.insert(name.clone(), BTreeMap::new());
                    let mut layout = BTreeMap::new();
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
        ValueType::Void => SymbolType::BasicType(IrValueType::Void),
        ValueType::Union(_) => todo!(),
        ValueType::Enum(_) => todo!(),
        ValueType::FunctionPointer { id, return_type, param_types } => {
            SymbolType::PointerType(
                PointerSymbolType { 
                    level: 1,
                    pointer_to: PointerToSymbolType::FunctionType{
                        id: id.name.to_string(),
                        return_type: Box::new(map_ast_type_to_symbol_type(return_type.as_ref(), struct_layout_table, struct_size_table)),
                        params_type: param_types.iter()
                        .map(
                            |param_type | 
                            map_ast_type_to_symbol_type(param_type, struct_layout_table, struct_size_table)
                        ).collect()
                        
                    }
                })
        }
        // not gonna to implement
        ValueType::LongDoubleComplex => todo!(),
        ValueType::FloatComplex => todo!(),
        ValueType::DoubleComplex => todo!(),
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
        ValueType::FunctionPointer { .. } => 4,
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
        ValueType::Void => 0,
        ValueType::Union(_) => todo!(),
        ValueType::Enum(_) => todo!(),
        // not gonna to implement
        ValueType::LongDoubleComplex => todo!(),
        ValueType::FloatComplex => todo!(),
        ValueType::DoubleComplex => todo!(),
    }
}