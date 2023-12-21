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

/// ## Helper Marco for getting a size from a symbol type.
/// Using a marco instead of function for avoid some borrowing problem. and this marco 
/// will return a value as the size of symbol type
#[macro_export]
macro_rules! get_size_from_symbol_type {
    ($converter: expr, $symbol_type: expr) => {
        match $symbol_type {
            SymbolType::BasicType(ir_type) => {
                match ir_type {
                    IrValueType::Void => $converter.function.create_u8_const(0),
                    IrValueType::U8 => $converter.function.create_u8_const(1),
                    IrValueType::U16 => $converter.function.create_u8_const(2),
                    IrValueType::U32 => $converter.function.create_u8_const(4),
                    IrValueType::U64 => $converter.function.create_u8_const(8),
                    IrValueType::I16 => $converter.function.create_u8_const(2),
                    IrValueType::I32 => $converter.function.create_u8_const(4),
                    IrValueType::I64 => $converter.function.create_u8_const(8),
                    IrValueType::Address => $converter.function.create_u8_const(4),
                    IrValueType::F32 => $converter.function.create_u8_const(4),
                    IrValueType::F64 => $converter.function.create_u8_const(8),
                }
            }
            SymbolType::PointerType(_) => $converter.function.create_u8_const(4),
            SymbolType::StructalType(struct_name) => {
                let size_usize =$converter.struct_size_table.get(struct_name).unwrap().clone();
                $converter.function.create_u8_const(size_usize as u8)
            }
            SymbolType::ArrayType(array_symbol_type) => {
                let mut array_size_value = match array_symbol_type.array_of.as_ref() {
                    SymbolType::BasicType(ir_type) => {
                        match ir_type {
                            IrValueType::Void => $converter.function.create_u8_const(0),
                            IrValueType::U8 => $converter.function.create_u8_const(1),
                            IrValueType::U16 => $converter.function.create_u8_const(2),
                            IrValueType::U32 => $converter.function.create_u8_const(4),
                            IrValueType::U64 => $converter.function.create_u8_const(8),
                            IrValueType::I16 => $converter.function.create_u8_const(2),
                            IrValueType::I32 => $converter.function.create_u8_const(4),
                            IrValueType::I64 => $converter.function.create_u8_const(8),
                            IrValueType::Address => $converter.function.create_u8_const(4),
                            IrValueType::F32 => $converter.function.create_u8_const(4),
                            IrValueType::F64 => $converter.function.create_u8_const(8),
                        }
                    }
                    SymbolType::PointerType(_) => $converter.function.create_u8_const(4),
                    SymbolType::StructalType(struct_name) => {
                        let size_usize =$converter.struct_size_table.get(struct_name).unwrap().clone();
                        $converter.function.create_u8_const(size_usize as u8)
                    }
                    _ => unreachable!(),
                };
                for val in &array_symbol_type.value_of_dims {
                    array_size_value = $converter.function.build_mul_inst(array_size_value, val.clone());
                }
                array_size_value  
            }
        }  
    };
}
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
    /// error map for function convert.
    pub error_map: IrFunctionConvertErrorMap,
}
impl<'a> FunctionCoverter<'a> {
    /// ## Create a function converter
    /// constructor for create a new function converter.
    pub fn new(
        signature_table: &'a mut FunctionSignatureTable, 
        global_struct_layout_table: Option<&'a StructLayoutTable>,
        global_struct_size_table:Option<&'a StructSizeTable>,
        global_symbol_table: Option<&'a SymbolTable<'a>>, 
        const_strings: HashMap<String, usize>,
    ) -> Self {
        Self {
            // function info
            function_signature_table: signature_table,
            function: Function::new(String::from(""), const_strings),
            // struct info
            struct_layout_table: StructLayoutTable::new(global_struct_layout_table),
            struct_size_table: StructSizeTable::new(global_struct_size_table),
            // symbol info
            symbol_table: SymbolTable::new(global_symbol_table),
            // error map
            error_map: IrFunctionConvertErrorMap::new(),
        }
    }
    /// ## Convert function to IR
    /// convert a ast function to a function ir instance
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
        replace(&mut self.function, Function::new(String::new(), Default::default()))
    }
    /// ## Accept function param 
    /// This function shell not perform type checker because that stage should be done
    /// by type checker, this function only perform generate instruction and record
    /// all this value 
    pub fn accept_function_param(&mut self, params: &Vec<ParamDeclar>) {
        for param in params {
            let name = param.id.name.to_string();
            let symbol_type = self.map_ast_type_to_symbol_type(&param.value_type);
            let reg = match self.map_ast_type_to_symbol_type(&param.value_type) {
                SymbolType::BasicType(ir_type) => {
                    self.function.add_register(ir_type)
                }
                SymbolType::ArrayType(_array_type) => {
                    self.function.add_register(IrValueType::Address)
                }
                SymbolType::PointerType(_pointer_type) => {
                    self.function.add_register(IrValueType::Address)
                }
                SymbolType::StructalType(_) => {
                    self.function.add_register(IrValueType::Address)
                }
            };
            self.function.params_value.push(reg);
            self.symbol_table.insert(name, SymbolEntry { reg, symbol_type })
        }
    }
    /// ## Helper function when return type of is a struct type
    /// By our IR design, we can not return a structal type in our ir function. To solve this problem
    /// we push a extra pointer to perform copy struct.
    pub fn create_symbol_for_return_type(&mut self) {
        let signature = self.function_signature_table.get(&self.function.name).unwrap();
        let return_symbol_type = &signature.return_type;
        if let SymbolType::StructalType(_) = return_symbol_type {
            let reg = self.function.add_register(IrValueType::Address);
            self.function.params_value.push(reg);
            self.symbol_table.insert(String::from("__rustyc_return_strcut"), SymbolEntry { reg, symbol_type:return_symbol_type.clone() })
        }
    }
    /// ## Accept function definition
    /// Just generate function signature in symbol and insertting it into function signature table.  
    fn accept_function_def(&mut self, func_def: &FunctionDefinition) {
        self.function.name = func_def.id.name.to_string();
        let block = self.function.create_block();
        self.function.mark_as_entry(block.clone());
        self.function.switch_to_block(block);
        self.accept_compound_stmt(&func_def.compound);
    }
    /// ## Accept a block item
    /// Simple match pattern function match block item as declarator or statement.
    fn accept_block_item(&mut self, block_item: &BlockItem) {
        match block_item {
            BlockItem::Declar(declar) => self.accept_declar(declar),
            BlockItem::Stmt(stmt) => self.accept_statement(stmt),
        }
    }
    /// ## Accept a Statement
    /// Just a Simple match pattern function for statement variants.
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
    /// ## Accpet a return statement
    /// build ret instruction with value if needed. An important expection is return a struct type
    /// since we can not return a struct type in ir, we need to push a new argument to function and 
    /// copy return struct to that argument.
    fn accpet_return_stmt(&mut self, return_stmt: &ReturnStatement) {
        if let Some(expr) = &return_stmt.value {
            let return_value = self.accept_expr_with_value(expr);
            let self_signature = self.function_signature_table.get(&self.function.name).unwrap();
            let return_symbol_type = &self_signature.return_type;
            if let SymbolType::StructalType(struct_name) = &return_symbol_type {
                let dst = self.symbol_table.get("__rustyc_return_strcut").unwrap();
                let size = self.struct_size_table.get(struct_name).unwrap().clone();
                self.copy_memory(dst.reg, return_value, size, 4);
                self.function.build_ret_inst(None);
                return;
            }
            self.function.build_ret_inst(Some(return_value));
        }else {
            self.function.build_ret_inst(None);
        }
        self.function.mark_as_exit(self.function.current_block.unwrap());
    }
    /// ## Accept a compound statement, control scope
    /// accept a compound stmt, control leave and enter the scope, pushing 
    /// and poping out scope-level table.
    fn accept_compound_stmt(&mut self, compound_stmt: &CompoundStatement) {
        self.enter_scope();
        for item in &compound_stmt.body {
            self.accept_block_item(item);
        }
        self.exit_scope();
    }
    /// ## Helper function called when enter scope
    /// Poping out all tables need to pop.
    fn enter_scope(&mut self) {
        self.symbol_table.enter_scope();
        self.struct_layout_table.enter_scope();
        self.struct_size_table.enter_scope();
    }
    /// ## Helper function called when exit scope
    /// Poping out all tables need to pop.
    fn exit_scope(&mut self ) {
        self.symbol_table.exit_scope();
        self.struct_layout_table.exit_scope();
        self.struct_size_table.exit_scope();
    }
    /// ## Accept a if statement
    /// Build blocks for if statement.
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
    /// ## Accpet a for statement
    /// Create blocks for building for-loop.
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
    /// ## Accept a declaration in function 
    /// Just a match pattern function for declaration enum.
    fn accept_declar(&mut self, declar: &Declaration) {
        match declar {
            Declaration::DelcarList(declar_list) => self.accept_declar_list(declar_list),
            Declaration::ValueType(value_type) => self.accept_value_type(value_type),
            Declaration::FunType(_)=> { unreachable!() /* this  */ }
        }
    }
    /// ## Accpet A declaration list
    /// Mapping ast type to symbol type and insert a new symbol into symbol table.
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
                    SymbolType::ArrayType(array_symbol_type) => {
                        let src = self.accept_expr_with_value(expr);
                        let mut usize_of_dims = Vec::new();
                        for value in &array_symbol_type.value_of_dims {
                            if let ValueData::Immi(immi) = self.function.values.get(value).unwrap() {
                                let usize_dim = immi.get_data_as_i128() as usize;
                                usize_of_dims.push(usize_dim);
                            }else {
                                unreachable!();
                            }
                        }
                        let size = get_size_from_symbol_type!(self, array_symbol_type.array_of.as_ref());
                        if let ValueData::Immi(immi) = self.function.values.get(&size).unwrap() {
                            let base = immi.get_data_as_i128() as usize;
                            let mut total = base ;
                            for usize_val in usize_of_dims {
                                total *= usize_val;
                            };
                            self.copy_memory(pointer, src, total, 4);
                        }else {
                            unreachable!();
                        }
                    }
                    // TODO: if symbol table is structral type, init must handle extra.
                    _ => todo!(),
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
                        let (next_size, next_value, _) = self.function.align_two_base_type_value_to_same_type(size, value, Some(IrValueType::U32));
                        size = self.function.build_mul_inst(next_size, next_value);
                    }
                    return size;
                }else {
                    // if symbol type is array type, ast type must be an array type ast
                    unreachable!()
                }
            }
        }
        let size_usize = get_size_form_ast_type(&value_type, &mut self.struct_size_table);
        self.function.create_u32_const(size_usize as u32)
    }
}

