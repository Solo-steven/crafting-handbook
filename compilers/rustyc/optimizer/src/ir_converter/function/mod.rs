mod expr;
mod error_map;

use std::collections::HashMap;
use std::mem::replace;
use crate::ir::function::*;
use crate::ir::value::*;
use crate::ir_converter::symbol_table::*;
use crate::ir_converter::function::error_map::IrFunctionConvertErrorMap;
use rustyc_frontend::ast::*;
use rustyc_frontend::ast::declar::*;
use rustyc_frontend::ast::expr::*;
use rustyc_frontend::ast::stmt::*;
pub struct FunctionCoverter<'a> {
    ///
    pub function_signature_table: &'a FunctionSignatureTable,
    /// function ir instance of this function convert
    pub function: Function,
    /// for store struct-related info 
    pub function_struct_layout_table: FunctionStructLayoutTable<'a>,
    pub function_struct_size_table: FunctionStructSizeTable<'a>, 
    /// symbol table for function scope
    pub symbol_table: SymbolTable<'a>,
    /// record extra info for the address ir type
    pub pointer_table: HashMap<Value, PointerSymbolType>,
    /// error map for function convert, developer can access error msg
    pub error_map: IrFunctionConvertErrorMap,
}
impl<'a> FunctionCoverter<'a> {
    pub fn new(
        signature_table: &'a mut FunctionSignatureTable, 
        global_struct_layout_table: &'a StructLayoutTable,
        global_function_struct_size_table: &'a StructSizeTable,
        global_symbol_table: Option<&'a SymbolTable<'a>>, 
    ) -> Self {
        Self {
            // function info
            function_signature_table: signature_table,
            function: Function::new(String::from("")),
            // struct info
            function_struct_layout_table: FunctionStructLayoutTable::new(global_struct_layout_table),
            function_struct_size_table: FunctionStructSizeTable::new(global_function_struct_size_table),
            // symbol info
            symbol_table: SymbolTable::new(global_symbol_table),
            // extra info for value
            pointer_table: HashMap::new(),
            // error map
            error_map: IrFunctionConvertErrorMap::new(),
        }
    }
    pub fn convert(&mut self, func_def: &FunctionDefinition) -> Function {
        // init function name, param, return_type
        self.function.name = func_def.id.name.to_string();
        self.function.return_type = match self.map_ast_type_to_symbol_type(&func_def.return_type) {
            SymbolType::BasicType(ir_type) => Some(ir_type),
            SymbolType::PointerType(_) => Some(IrValueType::Address),
            SymbolType::StructalType(_) => None,
            SymbolType::ArrayType(_) => unreachable!(),
        };
        self.accept_function_param(&func_def.params);
        self.create_symbol_for_return_type();
        // start convert by visitor pattern.
        self.accept_function_def(func_def);
        replace(&mut self.function, Function::new(String::new()))
    }
    pub fn accept_function_param(&mut self, params: &Vec<ParamDeclar>) {
        for param in params {
            let name = param.id.name.to_string();
            let symbol_type = self.map_ast_type_to_symbol_type(&param.value_type);
            let reg = match self.map_ast_type_to_symbol_type(&param.value_type) {
                SymbolType::BasicType(ir_type) => {
                    self.function.add_register(ir_type)
                }
                SymbolType::ArrayType(array_type) => {
                    let reg = self.function.add_register(IrValueType::Address);
                    self.pointer_table.insert(reg, PointerSymbolType { level: 0, pointer_to: Box::new(SymbolType::ArrayType(array_type)) });
                    reg
                }
                SymbolType::PointerType(pointer_type) => {
                    let reg = self.function.add_register(IrValueType::Address);
                    self.pointer_table.insert(reg, pointer_type);
                    reg
                }
                SymbolType::StructalType(_) => {
                    self.function.add_register(IrValueType::Address)
                }
            };
            self.function.params_value.push(reg);
            self.symbol_table.insert(name, SymbolEntry { reg, data_type: symbol_type })
        }
    }
    pub fn create_symbol_for_return_type(&mut self) {
        println!("{:?}, {}", self.function_signature_table, &self.function.name);
        let signature = self.function_signature_table.get(&self.function.name).unwrap();
        if let Some(return_symbol_type) = &signature.return_type {
            if let SymbolType::StructalType(_) = return_symbol_type {
                let reg = self.function.add_register(IrValueType::Address);
                self.function.params_value.push(reg);
                self.symbol_table.insert(String::from("__rustyc_return_strcut"), SymbolEntry { reg, data_type:return_symbol_type.clone() })
            }
        }
    }
    fn accept_function_def(&mut self, func_def: &FunctionDefinition) {
        self.function.name = func_def.id.name.to_string();
        let block = self.function.create_block();
        self.function.mark_as_entry(block.clone());
        self.function.switch_to_block(block);
        self.accept_compound_stmt(&func_def.compound);
    }
    fn accept_block_item(&mut self, block_item: &BlockItem) {
        match block_item {
            BlockItem::Declar(declar) => self.accept_declar(declar),
            BlockItem::Stmt(stmt) => self.accept_statement(stmt),
        }
    }
    fn accept_statement(&mut self, statement: &Statement ) {
        match statement {
            Statement::CompoundStmt(compound_stmt) => self.accept_compound_stmt(compound_stmt),
            Statement::IfStmt(if_stmt) => self.accept_if_stmt(if_stmt),
            Statement::ExprStmt(expr_stmt) => {self.accept_expr(&expr_stmt.expr);},
            Statement::ReturnStmt(return_stmt) => { self. accpet_return_stmt(return_stmt)}
            _ => todo!()
        };
    }
    fn accpet_return_stmt(&mut self, return_stmt: &ReturnStatement) {
        if let Some(expr) = &return_stmt.value {
            let return_value = self.accept_expr(expr);
            let self_signature = self.function_signature_table.get(&self.function.name).unwrap();
            if let Some(return_symbol_type) = &self_signature.return_type  {
                if let SymbolType::StructalType(struct_name) = &return_symbol_type {
                    let dst = self.symbol_table.get("__rustyc_return_strcut").unwrap();
                    self.copy_struct_layout(dst.reg, return_value, struct_name);
                    self.function.build_ret_inst(None);
                    return;
                }
            }
            self.function.build_ret_inst(Some(return_value));
        }else {
            self.function.build_ret_inst(None);
        };
    }
    fn accept_compound_stmt(&mut self, compound_stmt: &CompoundStatement) {
        for item in &compound_stmt.body {
            self.accept_block_item(item);
        }
    }
    fn accept_if_stmt(&mut self, if_stmt: &IfStatement) {
        let value = self.accept_expr(&if_stmt.test);
        let last_block = self.function.current_block.unwrap().clone();
        let conseq_block = self.function.create_block();
        self.function.connect_block(last_block,conseq_block);
        let end_block = self.function.create_block();
        self.function.connect_block(conseq_block, end_block);
        self.function.switch_to_block(conseq_block);
        self.accept_statement(if_stmt.conseq.as_ref());
        self.function.build_jump_inst(end_block);
        if let Some(stmt) = &if_stmt.alter {
            let alter_block = self.function.create_block();
            self.function.connect_block(last_block,alter_block);
            self.function.connect_block(alter_block, end_block);
            self.function.switch_to_block(alter_block);
            self.accept_statement(&stmt);
            self.function.build_jump_inst(end_block);

            self.function.switch_to_block(last_block);
            self.function.build_brif_inst(value, conseq_block, alter_block);
        }else {
            self.function.connect_block(last_block, end_block);
            self.function.switch_to_block(last_block);
            self.function.build_brif_inst(value, conseq_block, end_block);
        }
        self.function.switch_to_block(end_block);
    }
    fn accept_declar(&mut self, declar: &Declaration) {
        match declar {
            Declaration::DelcarList(declar_list) => self.accept_declar_list(declar_list),
            Declaration::ValueType(value_type) => self.accept_value_type(value_type),
            Declaration::FunType(_)=> { unreachable!() /* this  */ }
        }
    }
    fn accept_declar_list(&mut self, declar_list: &DeclarationList) {
        for declarator in &declar_list.declarators {
            let mut symbol_type = self.map_ast_type_to_symbol_type(&declarator.value_type);
            let pointer;
            if let SymbolType::ArrayType(array_symbol_type) = &mut symbol_type {
                if let ValueType::ArrayType(array_value_type) = &declarator.value_type {
                    let mut values = Vec::new();
                    for expr in &array_value_type.dims {
                        values.push(self.accept_expr(expr));
                    }
                    let const_size = self.get_size_form_ast_type(&array_value_type.array_of) as i32;
                    let mut size = self.function.create_i32_const(const_size);
                    for index in 0..values.len() {
                        let value = values[index];
                        let (next_size, next_value, _) = self.align_two_base_type_value_to_same_type(size, value);
                        size = self.function.build_mul_inst(next_size, next_value);
                    }
                    values.reverse();
                    array_symbol_type.value_of_dims = values;
                    pointer = self.function.build_stack_alloc_inst(size, 8, None);
                }else {
                    unreachable!()
                }
            }else {
                let size_usize = self.get_size_form_ast_type(&declarator.value_type);
                let size = self.function.create_u32_const(size_usize as u32);
                let ir_type = match symbol_type {
                    SymbolType::BasicType(ref basic_ir_type) => Some(basic_ir_type.clone()),
                    SymbolType::PointerType(_) => Some(IrValueType::Address),
                    _ => None
                };
                pointer = self.function.build_stack_alloc_inst(size, 8,ir_type);
            }
            self.symbol_table.insert(declarator.id.name.to_string(), SymbolEntry { reg: pointer, data_type: symbol_type.clone() });
            // TODO: if symbol table is struct type, init must handle extra.
            if let Some(expr) = &declarator.init_value {
                match &symbol_type {
                    SymbolType::BasicType(ref basic_ir_type) => {
                        let init_value = self.accept_expr(expr);
                        let offset = self.function.create_u8_const(0);
                        self.function.build_store_register_inst(init_value, pointer, offset, basic_ir_type.clone());
                    }
                    SymbolType::PointerType(_) => {
                        let init_value = self.accept_expr(expr);
                        let offset = self.function.create_u8_const(0);
                        self.function.build_store_register_inst(init_value, pointer, offset, IrValueType::Address);
                    }
                    // TODO: if symbol table is structral type, init must handle extra.
                    _ => todo!()
                }
            }
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
    /// ## Helper function to get the size from a as type
    /// Get the size of a ast type in byte, please note that this function can not get a size of variable 
    /// length array, it would panic.
    fn get_size_form_ast_type(&mut self, value_type: &ValueType) -> usize {
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
                let mut size = self.get_size_form_ast_type(array_type.array_of.as_ref());
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
                        match self.function_struct_size_table.get(declar.id.name.as_ref()) {
                            Some(size) => size.clone(),
                            None => unreachable!("[Unreach Error]: when get a size from a struct type declar, there must be struct already declar, it ensure by typechecker"),
                        }
                    },
                    StructType::Def(def) => {
                        if let Some(size) = self.function_struct_size_table.get(def.id.as_ref().unwrap().name.as_ref())  {
                            size.clone()
                        }else {
                            let mut size = 0;
                            for declarator in &def.declarator {
                                size += self.get_size_form_ast_type(&declarator.value_type);
                            }
                            self.function_struct_size_table.insert(def.id.as_ref().unwrap().name.to_string(), size);
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
    fn get_size_from_symbol_type(&self, symbol_type: &SymbolType) -> usize {
        match symbol_type {
            SymbolType::BasicType(ir_type) => {
                match ir_type {
                    IrValueType::U8 => 1,
                    IrValueType::U16 => 2,
                    IrValueType::U32 => 4,
                    IrValueType::U64 => 8,
                    IrValueType::I16 => 2,
                    IrValueType::I32 => 4,
                    IrValueType::I64 => 8,
                    IrValueType::Address => 4,
                    IrValueType::F32 => 4,
                    IrValueType::F64 => 8,
                }
            }
            SymbolType::PointerType(_) => 32,
            SymbolType::StructalType(struct_name) => {
                self.function_struct_size_table.get(struct_name).unwrap().clone()
            }
            SymbolType::ArrayType(array_type) => {
                self.get_size_from_symbol_type(array_type.array_of.as_ref())
            }
        }
    }
    /// Mapping the ast type to symbol table, used when 
    /// - in declaration list, we need to get the symbol type of a declarator's value type.
    fn map_ast_type_to_symbol_type(&mut self, value_type: &ValueType) -> SymbolType {
        match value_type  {
            ValueType::Char | ValueType::UnSignedChar |
            ValueType::Shorted | ValueType::UnsignedShort |
            ValueType::Int | ValueType::Unsigned |
            ValueType::Long | ValueType::UnsignedLong |
            ValueType::LongLong | ValueType::UnsignedLongLong |
            ValueType::Float | ValueType::Double | ValueType::LongDouble   => {
                SymbolType::BasicType(match value_type {
                    ValueType::Char => IrValueType::U8,
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
                    ValueType::PointerType(_) => IrValueType::Address,
                    _ => unreachable!()
                })
            }
            ValueType::PointerType(pointer_type) => {
                SymbolType::PointerType(PointerSymbolType { 
                    level: pointer_type.level, 
                    pointer_to: Box::new(self.map_ast_type_to_symbol_type(&pointer_type.pointer_to))
                })
            }
            ValueType::ArrayType(array_type) => {
                SymbolType::ArrayType(ArraySymbolType { 
                    dims: array_type.dims.len(), 
                    array_of: Box::new(self.map_ast_type_to_symbol_type(&array_type.array_of)),
                    value_of_dims: Vec::new(),
                })
            }
            ValueType::Struct(struct_type) => {
                // if is 
                match struct_type.as_ref() {
                    StructType::Declar(declar) => {
                        if self.function_struct_layout_table.get(declar.id.name.as_ref()).is_some() {
                            SymbolType::StructalType(declar.id.name.to_string())
                        }else {
                            unreachable!("[Unreach Error]:")
                        }
                    },
                    StructType::Def(def) => {
                        let name = def.id.as_ref().unwrap().name.to_string();
                        self.function_struct_layout_table.insert(name.clone(), HashMap::new());
                        let mut layout = HashMap::new();
                        let mut offset = 0;
                        for declarator in &def.declarator {
                            layout.insert(declarator.id.name.to_string(), StructLayoutEntry{ offset, data_type: self.map_ast_type_to_symbol_type(&declarator.value_type)  });
                            offset += self.get_size_form_ast_type(&declarator.value_type);
                        }
                        self.function_struct_layout_table.insert(name, layout);
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
    fn align_two_base_type_value_to_same_type(&mut self, mut left_value: Value, mut right_value: Value) -> (Value, Value, IrValueType) {
        let left_type = self.function.get_value_ir_type(left_value);
        let right_type = self.function.get_value_ir_type(right_value);
        let target_type;
        // Get final type. Generate promot type if need, 
        if left_type > right_type {
            right_value = self.generate_type_convert(right_value, &left_type);
            target_type = &left_type;
        }else if left_type < right_type {
            left_value = self.generate_type_convert(left_value, &right_type);
            target_type = &right_type;
        }else {
            target_type = &left_type
        }
        (left_value, right_value, target_type.clone())
    }
        /// helper function for `accept_binary_expr`, generate type convert when we need to
    /// convert the src to certain ir type.
    fn generate_type_convert(&mut self, src: Value, ir_type: &IrValueType) -> Value {
        match ir_type {
            IrValueType::U8 => self.function.build_to_u8_inst(src),
            IrValueType::U16 => self.function.build_to_u16_inst(src),
            IrValueType::U32 => self.function.build_to_u32_inst(src),
            IrValueType::U64 => self.function.build_to_u64_inst(src),
            IrValueType::I16 => self.function.build_to_i16_inst(src),
            IrValueType::I32 => self.function.build_to_i32_inst(src),
            IrValueType::I64 => self.function.build_to_i64_inst(src),
            IrValueType::F32 => self.function.build_to_f32_inst(src),
            IrValueType::F64 => self.function.build_to_f64_inst(src),
            IrValueType::Address => self.function.build_to_address_inst(src),
        }
    }
}

