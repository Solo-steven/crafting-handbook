mod expr;
mod error_map;

use std::collections::HashMap;
use std::mem::replace;
use crate::ir::function::*;
use crate::ir::value::*;
use crate::ir_converter::{map_ast_type_to_symbol_type, get_size_form_ast_type};
use crate::ir_converter::symbol_table::*;
use crate::ir_converter::function::error_map::IrFunctionConvertErrorMap;
use rustyc_frontend::ast::*;
use rustyc_frontend::ast::declar::*;
use rustyc_frontend::ast::stmt::*;
/// Convert function ast into function ir instance
pub struct FunctionCoverter<'a> {
    /// signature of outer function, type of function signature has been
    /// converted into Symbol Type.
    pub function_signature_table: &'a FunctionSignatureTable,
    /// function ir instance of this function convert
    pub function: Function,
    /// for store struct-related info 
    pub struct_layout_table: StructLayoutTable<'a>,
    pub struct_size_table: StructSizeTable<'a>, 
    /// symbol table for function scope
    pub symbol_table: SymbolTable<'a>,
    /// record extra info for the address ir type
    pub address_cache: AddressCache,
    /// error map for function convert.
    pub error_map: IrFunctionConvertErrorMap,
}
impl<'a> FunctionCoverter<'a> {
    pub fn new(
        signature_table: &'a mut FunctionSignatureTable, 
        global_struct_layout_table: Option<&'a StructLayoutTable>,
        global_struct_size_table:Option<&'a StructSizeTable>,
        global_symbol_table: Option<&'a SymbolTable<'a>>, 
    ) -> Self {
        Self {
            // function info
            function_signature_table: signature_table,
            function: Function::new(String::from("")),
            // struct info
            struct_layout_table: StructLayoutTable::new(global_struct_layout_table),
            struct_size_table: StructSizeTable::new(global_struct_size_table),
            // symbol info
            symbol_table: SymbolTable::new(global_symbol_table),
            // extra info for value
            address_cache: HashMap::new(),
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
        // return function ir instance
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
                    self.address_cache.insert(reg, AddressCacheEntry::ArrayAccessType { access_level: 0, array_symbol_type: array_type });
                    reg
                }
                SymbolType::PointerType(pointer_type) => {
                    let reg = self.function.add_register(IrValueType::Address);
                    self.address_cache.insert(reg, AddressCacheEntry::PointerSymbolType(pointer_type));
                    reg
                }
                SymbolType::StructalType(_) => {
                    self.function.add_register(IrValueType::Address)
                }
            };
            self.function.params_value.push(reg);
            self.symbol_table.insert(name, SymbolEntry { reg, symbol_type })
        }
    }
    pub fn create_symbol_for_return_type(&mut self) {
        let signature = self.function_signature_table.get(&self.function.name).unwrap();
        if let Some(return_symbol_type) = &signature.return_type {
            if let SymbolType::StructalType(_) = return_symbol_type {
                let reg = self.function.add_register(IrValueType::Address);
                self.function.params_value.push(reg);
                self.symbol_table.insert(String::from("__rustyc_return_strcut"), SymbolEntry { reg, symbol_type:return_symbol_type.clone() })
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
            Statement::ForStmt(for_stmt) => self.accpet_for_stmt(for_stmt),
            Statement::ExprStmt(expr_stmt) => {self.accept_expr(&expr_stmt.expr);},
            Statement::ReturnStmt(return_stmt) => { self. accpet_return_stmt(return_stmt)}
            _ => todo!()
        };
    }
    fn accpet_return_stmt(&mut self, return_stmt: &ReturnStatement) {
        if let Some(expr) = &return_stmt.value {
            let return_value = self.accept_expr_with_value(expr);
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
        }
        self.function.mark_as_exit(self.function.current_block.unwrap());
    }
    fn accept_compound_stmt(&mut self, compound_stmt: &CompoundStatement) {
        self.enter_scope();
        for item in &compound_stmt.body {
            self.accept_block_item(item);
        }
        self.exit_scope();
    }
    fn enter_scope(&mut self) {
        self.symbol_table.enter_scope();
        self.struct_layout_table.enter_scope();
        self.struct_size_table.enter_scope();
    }
    fn exit_scope(&mut self ) {
        self.symbol_table.exit_scope();
        self.struct_layout_table.exit_scope();
        self.struct_size_table.exit_scope();
    }
    fn accept_if_stmt(&mut self, if_stmt: &IfStatement) {
        let value = self.accept_expr_with_value(&if_stmt.test);
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
    fn accpet_for_stmt(&mut self, for_stmt: &ForStatement) {
        match &for_stmt.init {
            Some(declar_for_expr) => {
                match &declar_for_expr {
                    DeclarationOrExpression::Declar(declar) => self.accept_declar(&declar),
                    DeclarationOrExpression::Expr(expr) => { self.accept_expr(expr); },
                }
            }
            None => {}
        }
        let test_block = self.function.create_block();
        let body_block = self.function.create_block();
        let final_block = self.function.create_block();
        self.function.build_jump_inst(test_block);
        self.function.connect_block(self.function.current_block.unwrap(), test_block);
        self.function.connect_block(test_block, final_block);
        self.function.connect_block(test_block, body_block);
        self.function.connect_block(body_block, test_block);
        self.function.connect_block(body_block, final_block);
        self.function.switch_to_block(test_block);
        match &for_stmt.test {
            Some(test_expr) => {
                let test_value = self.accept_expr_with_value(test_expr);
                self.function.build_brif_inst(test_value, body_block, final_block);
            }
            None => {}
        }
        self.function.switch_to_block(body_block);
        self.accept_statement(for_stmt.body.as_ref());
        match &for_stmt.update {
            Some(update_expr) => { self.accept_expr(update_expr); }
            None => {}
        }
        self.function.build_jump_inst(test_block);

        self.function.switch_to_block(final_block);
    }
    fn accept_declar(&mut self, declar: &Declaration) {
        match declar {
            Declaration::DelcarList(declar_list) => self.accept_declar_list(declar_list),
            Declaration::ValueType(value_type) => self.accept_value_type(value_type),
            Declaration::FunType(_)=> { unreachable!() /* this  */ }
        }
    }
    /// ## Accpet A declaration list
    /// 
    fn accept_declar_list(&mut self, declar_list: &DeclarationList) {
        for declarator in &declar_list.declarators {
            let symbol_type = self.map_ast_type_to_symbol_type(&declarator.value_type);
            let size = self.get_size_form_ast_type(&declarator.value_type, Some(&symbol_type));
            let ir_type = match symbol_type {
                SymbolType::BasicType(ref basic_ir_type) => Some(basic_ir_type.clone()),
                SymbolType::PointerType(_) => Some(IrValueType::Address),
                _ => None
            };
            let pointer = self.function.build_stack_alloc_inst(size, 8,ir_type);
            self.symbol_table.insert(declarator.id.name.to_string(), SymbolEntry { reg: pointer, symbol_type: symbol_type.clone() });
            // TODO: if symbol table is struct type, init must handle extra.
            if let Some(expr) = &declarator.init_value {
                match &symbol_type {
                    SymbolType::BasicType(ref basic_ir_type) => {
                        let init_value = self.accept_expr_with_value(expr);
                        let offset = self.function.create_u8_const(0);
                        self.function.build_store_register_inst(init_value, pointer, offset, basic_ir_type.clone());
                    }
                    SymbolType::PointerType(_) => {
                        let init_value = self.accept_expr_with_value(expr);
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
                self.get_size_form_ast_type(value_type, None);
            }
            _ => {}
        }
    }
    /// ## Helper function For Getting symbol type from variable AST type
    /// This function is a wrapper function for util function `map_ast_type_to_symbol_type`.
    /// Because util function can not get the value of array dim. so this wrapper function 
    /// is fill up dims of array by calling `accept_expr` function.
    fn map_ast_type_to_symbol_type(&mut self, value_type: &ValueType) -> SymbolType {
        let mut symbol_type = map_ast_type_to_symbol_type(value_type, &mut self.struct_layout_table, &mut self.struct_size_table);
        if let SymbolType::ArrayType(array_symbol_type) = &mut symbol_type {
             if let ValueType::ArrayType(array_value_type) = value_type {
                 for expr in &array_value_type.dims {
                    array_symbol_type.value_of_dims.push(self.accept_expr_with_value(expr));
                 }
                 array_symbol_type.value_of_dims.reverse();
             }else {
                unreachable!();
             }
        }
        symbol_type
    }
    /// ## Helpr function for getting value of ast type size
    /// This function is a wrapper function for util function `get_size_from_ast_type`,
    /// Since util function can not get the size of variable arry. so this wrapper function 
    /// will get size of variable array by the help of `accept_expr` and givn symbol type.
    fn get_size_form_ast_type(&mut self, value_type: &ValueType, helper_symbol_type: Option<&SymbolType>) -> Value {
        if let Some(symbol_type) = helper_symbol_type {
            if let SymbolType::ArrayType(array_symbol_type) = &symbol_type {
                if let ValueType::ArrayType(array_value_type) = value_type {
                    let values = &array_symbol_type.value_of_dims;
                    let const_size = get_size_form_ast_type(&array_value_type.array_of, &mut self.struct_size_table) as u32;
                    let mut size = self.function.create_u32_const(const_size);
                    for index in 0..values.len() {
                        let value = values[values.len() - index -1];
                        let (next_size, next_value, _) = self.align_two_base_type_value_to_same_type(size, value, Some(IrValueType::U32));
                        size = self.function.build_mul_inst(next_size, next_value);
                    }
                    return size;
                }else {
                    unreachable!()
                }
            }
        }
        let size_usize = get_size_form_ast_type(&value_type, &mut self.struct_size_table);
        self.function.create_u32_const(size_usize as u32)
    }
    /// ## Helper function to Align two value with same type.
    /// when performance some instuction, we maybe need to prompt or narrow data type for instruction.
    /// so we this helper function will generate convert instruction if need, you can givn this `target_type`
    /// or pass `None` to make prompt to highest type of two value.
    fn align_two_base_type_value_to_same_type(&mut self, mut left_value: Value, mut right_value: Value, target_type: Option<IrValueType>) -> (Value, Value, IrValueType) {
        let left_type = self.function.get_value_ir_type(left_value);
        let right_type = self.function.get_value_ir_type(right_value);
        match target_type {
            Some(target) => {
                if left_type != target {
                    left_value = self.generate_type_convert(left_value, &target);
                }
                if right_type != target {
                    right_value = self.generate_type_convert(right_value, &target);
                }
                (left_value, right_value, target)
            },
            None => {
                let target;
                // Get final type. Generate promot type if need, 
                if left_type > right_type {
                    right_value = self.generate_type_convert(right_value, &left_type);
                    target = &left_type;
                }else if left_type < right_type {
                    left_value = self.generate_type_convert(left_value, &right_type);
                    target = &right_type;
                }else {
                    target = &left_type
                }
                (left_value, right_value, target.clone())
            }
        }
    }
    /// ## Helper functin to generate type convert
    /// this function will generate type convert instruction to target ir type.
    /// this function will not check is src value and target type is same.
    fn generate_type_convert(&mut self, src: Value, ir_type: &IrValueType) -> Value {
        match ir_type {
            IrValueType::Void => panic!(),
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

