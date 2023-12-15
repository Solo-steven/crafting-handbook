use std::collections::HashMap;
use crate::ir_converter::function::FunctionCoverter;
use crate::ir::instructions::CmpFlag;
use crate::ir::value::*;
use crate::ir_converter::symbol_table::*;
use rustyc_frontend::ast::expr::*;
use rustyc_frontend::ast::declar::*;
use rustyc_frontend::token::{IntLiteralBase, FloatLiteralBase};

#[derive(Debug, Clone)]
enum CallSequnceType {
    Member(String),
    Derefer(String),
    Subscript((Vec<Value>, usize)), // (offset of linear array format, access level)
}

impl<'a> FunctionCoverter<'a> {
    /// ## Accept a expression ast and generate instruction for ast.
    /// this function just perform a pattern match, call another function just like visitor pattern
    /// of ast traversal.
    pub (super) fn accept_expr(&mut self, expr: &Expression) -> Value {
        match expr {
            Expression::AssignmentExpr(assign_expr) => self.accept_assignment_expr(assign_expr),
            Expression::ConditionalExpr(condition_expr) => todo!(),
            Expression::BinaryExpr(binary_expr) => self.accept_binary_expr(binary_expr),
            Expression::UnaryExpr(unary_expr) => self.accept_unary_expr(unary_expr),
            Expression::MemberExpr(_) | Expression::DereferenceExpr(_) | Expression::SubscriptExpr(_) => self.accept_chain_expr(expr),
            Expression::CallExpr(call_expr) => self.accept_call_expr(call_expr),
            Expression::Identifier(id) => self.accept_identifier(id),
            Expression::IntLiteral(int_literal) => self.accept_int_literal(int_literal),
            Expression::FloatLiteral(float_literal) => self.accept_float_literal(float_literal),
            Expression::ParenthesesExpr(para_expr) => self.accept_expr(&para_expr.expr),
            Expression::CastExpr(cast_expr) => todo!(),
            _ => {
                println!("{:?}", expr);
                todo!()
            }
        }
    }
    /// ## Accept a assignment expression
    /// Generate assignment expression, when a expression in left hand side, it should return a value contain address
    /// of expression and symbol type of expresion, in the other side, when a expression in right hand side, return value
    /// would be a virtual register contain value of expression.
    fn accept_assignment_expr(&mut self, assign_expr: &AssignmentExpression ) -> Value {
        let (left_value,  data_type) = self.accept_as_lefthand_expr(&assign_expr.left);
        let right_value = self.accept_expr(&assign_expr.right);
        match &assign_expr.ops {
            AssignmentOps::Assignment => {},
            AssignmentOps::BitwiseOrAssignment => {}
            AssignmentOps::BitwiseAndAssignment => {},
            AssignmentOps::BitwiseLeftShiftAssignment => {},
            AssignmentOps::BitwiseRightShiftAssignment => {},
            AssignmentOps::BitwiseXorAssignment => {},
            AssignmentOps::DiffAssignment => {},
            AssignmentOps::ProductAssignment => {},
            AssignmentOps::QuotientAssignment => {},
            AssignmentOps::RemainderAssignment => {},
            AssignmentOps::SumAssignment => {},
        }
        match &data_type {
            SymbolType::PointerType(_) => {
                let offset = self.function.create_u8_const(0);
                self.function.build_store_register_inst(right_value, left_value, offset, IrValueType::Address);
                right_value
            }
            SymbolType::BasicType(ir_type) => {
                let offset = self.function.create_u8_const(0);
                self.function.build_store_register_inst(right_value, left_value, offset, ir_type.clone());
                right_value
            }
            SymbolType::StructalType(struct_type_name) => {
                self.copy_struct_layout(left_value, right_value, struct_type_name);
                right_value
            }
            SymbolType::ArrayType(_) => {
                // in C99, we can not assign a array. this should be check by type checker
                unreachable!("{}", self.error_map.unreach_assignment_expr_left_value_is_array_type);
            }
        }
    }
    /// ## Accept a binary expression in right hand side
    /// Generate binary expression is simple, just using posfix-order dfs to traversal child frist then generate
    /// instruction by binary operator.
    fn accept_binary_expr(&mut self, binary_expr: &BinaryExpression) -> Value {
        let mut left_value = self.accept_expr(&binary_expr.left);
        let mut right_value = self.accept_expr(&binary_expr.right);
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
        let is_float = match target_type {
            IrValueType::F32 | IrValueType::F64 => true,
            _ => false
        };
        match binary_expr.ops {
            BinaryOps::BitwiseAnd => self.function.build_bitwise_and_inst(left_value, right_value),
            BinaryOps::BitwiseOr => self.function.build_bitwise_or_inst(left_value, right_value),
            BinaryOps::Plus => if is_float { 
                self.function.build_fadd_inst(left_value, right_value) 
            } else { 
                self.function.build_add_inst(left_value, right_value) 
            }, 
            BinaryOps::Minus => if is_float {
                self.function.build_fsub_inst(left_value, right_value)
            }else {
                self.function.build_sub_inst(left_value, right_value)
            }
            BinaryOps::Multiplication => if is_float {
                self.function.build_fmul_inst(left_value, right_value)
            }else {
                self.function.build_mul_inst(left_value, right_value)
            }
            BinaryOps::Gt => if is_float {
                self.function.build_fcmp_inst(left_value, right_value, CmpFlag::Gt)
            }else {
                self.function.build_icmp_inst(left_value, right_value, CmpFlag::Gt)
            }
            _ => todo!(),
        }
    }
    /// Helper function for `accept_assignment_expr`
    /// when assign a struct data type, we need to copy the memory from src to dst (right hand side to 
    /// left hand side). this function implement copy struct by struct layout.
    /// ### Memory copy
    /// memory copy is a big issue, since i can not find there is any memory copy instruction in assembly 
    /// level, and llvm just using memcpy of c standard lib to performance the memory copy.
    /// 
    /// The implementation of memcpy seems using a `word` to copy memory no matter what type the memory 
    /// address is point to. So there we follow the footstep of gcc lib, just copy size of memory by 
    /// unsigned int.
    pub (super) fn copy_struct_layout(&mut self, dst: Value, src: Value, name: &String) {
        let layout = self.function_struct_layout_table.get(name).unwrap();
        let mut index: usize = 0;
        for layout_entry in layout.values() {
            match &layout_entry.data_type {
                SymbolType::BasicType(ir_type) => {
                    let offset_value = self.function.create_u32_const(layout_entry.offset as u32);
                    let register_value = self.function.build_load_register_inst(src, offset_value, ir_type.clone());
                    self.function.build_store_register_inst(register_value, dst, offset_value, ir_type.clone());
                }
                SymbolType::PointerType(_) => {
                    let offset_value = self.function.create_u32_const(layout_entry.offset as u32);
                    let register_value = self.function.build_load_register_inst(src, offset_value, IrValueType::U32);
                    self.function.build_store_register_inst(register_value, dst, offset_value, IrValueType::U32);
                }
                SymbolType::StructalType(next_name) => {
                    let struct_size = self.function_struct_size_table.get(next_name).unwrap().clone();
                    let mut offset = layout_entry.offset;
                    // TODO: size of word might not be 32bit
                    for _i in 0..struct_size / 4  {
                        let offset_value = self.function.create_u32_const(offset as u32);
                        let register_value = self.function.build_load_register_inst(src, offset_value, IrValueType::U32);
                        self.function.build_store_register_inst(register_value, dst, offset_value, IrValueType::U32);
                        offset += 4;
                    }
                }
                SymbolType::ArrayType(_array_symbol_type) => {
                    // NOTE: by C99 spec, array in a struct type and only be const expression, so we know 
                    // exactly how length this array is. we can just using loop to copy memory
                    let array_size = if index == layout.len() -1 {
                        let struc_size = self.function_struct_size_table.get(name).unwrap().clone();
                        struc_size - layout_entry.offset
                    }else {
                        let layout_values_vec: Vec<_> = layout.values().collect();
                        let next_entry_offset = layout_values_vec[index+1].offset;
                        next_entry_offset - layout_entry.offset
                    };
                    let mut offset = layout_entry.offset;
                    // TODO: size of word might not be 32bit (4 byte)
                    for _i in 0..array_size/4  {
                        let offset_value = self.function.create_u32_const(offset as u32);
                        let register_value = self.function.build_load_register_inst(src, offset_value, IrValueType::U32);
                        self.function.build_store_register_inst(register_value, dst, offset_value, IrValueType::U32);
                        offset += 4;
                    }
                }
            }
            index += 1;
        }
    }
    /// ## Accept a unary expression in right hand side
    /// most of unary expression op is simple to generate. there are three op need to handle with sub-function.
    /// - address of 
    /// - dereference
    /// - sizeof
    fn accept_unary_expr(&mut self, unary_expr: &UnaryExpression) -> Value {
        match &unary_expr.ops {
            UnaryOps::BitwiseNot => { 
                let src = self.accept_expr(&unary_expr.expr);
                self.function.build_bitwise_not(src)
             },
            UnaryOps::LogicalNot => {
                let src = self.accept_expr(&unary_expr.expr);
                self.function.build_logical_not(src)
            },
            UnaryOps::Minus => {
                let src = self.accept_expr(&unary_expr.expr);
                self.function.build_neg_inst(src)
            },
            UnaryOps::Plus => {
                self.accept_expr(&unary_expr.expr)
            },
            UnaryOps::AddressOf => self.accept_address_of_unary_expr(unary_expr),
            UnaryOps::Dereference => self.accept_dereference_unary_expr(unary_expr),
            UnaryOps::Sizeof => {
                todo!();
            }
        }
    }
    /// ## Accept a right hand side unary expression where op is a address of (&)
    /// By type checker, we can ensure that the oprand of address of operator is only some addressable oprand
    /// and address of operand is actually just get address of those addressable operand. it is same as accept 
    /// it as left hand side.
    /// ## Pointer Table
    /// please reference to the `Pointer Table` section of `accept_dereference_unary_expr`. because we might need
    /// load a value contain address, we need data type of value, as the result. there insert value to `pointer_table`
    /// to cache the type of pointer point to.
    fn accept_address_of_unary_expr(&mut self, unary_expr: &UnaryExpression) -> Value {
        let (value, data_type) = self.accept_as_lefthand_expr(&unary_expr.expr);
        let pointer_type = match data_type {
            SymbolType::BasicType(bast_type) => PointerSymbolType { level: 1, pointer_to: Box::new(SymbolType::BasicType(bast_type)) },
            SymbolType::PointerType(pointer_type) => PointerSymbolType { level:  pointer_type.level + 1, pointer_to: pointer_type.pointer_to.clone() },
            SymbolType::StructalType(struct_type) => PointerSymbolType { level: 1, pointer_to: Box::new(SymbolType::StructalType(struct_type)) },
            SymbolType::ArrayType(array_type) => PointerSymbolType { level: 0, pointer_to: array_type.array_of }
        };
        self.pointer_table.insert(value, pointer_type);
        value
    }
    /// ## Accept a right hand side unary expression where op is dereference(*)
    /// By the type checker, we can ensure dereference operator only operate on pointer to a type 
    /// or function pointer
    /// 
    /// - pointer (pointer to a type)
    /// - result of address of operator (pointer to a type)
    /// - dereference a pointer to other pointer (pointer to a type)
    /// - array (pointer to a type)
    /// - function (function pointer)
    /// 
    /// this constraint is reference to the C99 spec 6.5.3.2's number 4. dereference operator
    /// can only work on function pointer or pointer to a type, otherwise, it would result a
    /// undefined behavior.
    /// 
    /// When dereference a pointer, just load it's address and return the value that address point to.
    /// ### Pointer Table
    /// Because of there might be a pointer to a pointer, or more deep pointer. we will need a cache to store
    /// the type that pointer point to, so we need use a cache to store a type pointer point to for temp register.
    fn accept_dereference_unary_expr(&mut self, unary_expr: &UnaryExpression) -> Value {
        let value = self.accept_expr(&unary_expr.expr);
        let PointerSymbolType { level, pointer_to} = self.pointer_table.remove(&value).unwrap();
        if let SymbolType::ArrayType(array_symbol_type) = pointer_to.as_ref(){
            if level == array_symbol_type.dims - 1 {
                let offset = self.function.create_u8_const(0);
                let next_value = self.function.build_load_register_inst(
                    value, offset, 
                    match array_symbol_type.array_of.as_ref() {
                        SymbolType::BasicType(ir_type) => ir_type.clone(),
                        _ => IrValueType::Address
                    }
                );
                next_value
            }else {
                self.pointer_table.insert(value, PointerSymbolType { level: level + 1, pointer_to });
                value
            }
        }else if level == 1 {
            let offset = self.function.create_u8_const(0);
            match pointer_to.as_ref() {
                SymbolType::BasicType(ir_type) => self.function.build_load_register_inst(value, offset, ir_type.clone()),
                SymbolType::StructalType(_) => self.function.build_load_register_inst(value, offset, IrValueType::Address),
                // when is array type, it has already handled above, 
                // there is not nested pointer type for symbol.
                _ => unreachable!()
            }
        }else {
            let offset = self.function.create_u8_const(0);
            let next_value = self.function.build_load_register_inst(value, offset, IrValueType::Address);
            self.pointer_table.insert(next_value, PointerSymbolType { level: level - 1, pointer_to });
            next_value
        }
    }
    fn accept_call_expr(&mut self, call_expr: &CallExpression) -> Value {
        let callee_name = match call_expr.callee.as_ref() {
            Expression::Identifier(id) => id.name.to_string(),
            _ => todo!(),
        };
        let signature = self.function_signature_table.get(&callee_name).unwrap();
        let mut arugments: Vec<Value> = call_expr
            .arguments
            .iter()
            .map(|argu_expr| self.accept_expr(argu_expr))
            .collect();
        if let Some(return_symbol_type) = &signature.return_type {
            if let SymbolType::StructalType(struct_name) = return_symbol_type {
                let struct_size = self.function_struct_size_table.get(struct_name).unwrap().clone();
                let struct_size_value = self.function.create_u32_const(struct_size as u32);
                let ret_value = self.function.build_stack_alloc_inst(struct_size_value, 8, None);
                arugments.push(ret_value);
            };
        }
        let ir_return_type = match &signature.return_type {
            Some(symbol_type) => {
                match symbol_type {
                    SymbolType::BasicType(ir_type) => Some(ir_type.clone()),
                    SymbolType::PointerType(_) => Some(IrValueType::Address),
                    SymbolType::StructalType(_) => None,
                    SymbolType::ArrayType(_) => unreachable!(),
                }
            }
            None => None,
        };
        self.function.build_call_inst(callee_name, arugments, ir_return_type);
        Value(1)
    }
    /// ## Accept a chain expr, in right hand side
    /// this function this just a simple extenstion of `accept_chain_expr_base`, just thr base and offset returned
    /// by this `accept_chain_expr_base`, we load this value that address is pointing to 
    /// 
    /// - If type is basic type or pointer type, just load the value.
    /// - If type is not basic type or pointer type, it is meanless to load the value, we just return the address.
    /// 
    /// Actually, the struct type value can only be appeared in right hand side when it is a assignment, so we return 
    /// the address of struct to left assignment expression do the copy job.
    fn accept_chain_expr(&mut self, expr: &Expression) -> Value {
        let (base, offset, current_data_type, array_access_level) = self.accept_chain_expr_base(expr);
        match current_data_type {
            SymbolType::StructalType(_) => {
                // right hand side of assign a struct to anthoer struct, just return the address, let `accept_assign_expr`
                // to performan copy.
                let offset_const = self.function.create_i32_const(offset as i32);
                self.function.build_add_inst(base, offset_const)
            }
            SymbolType::PointerType(pointer_type) => {
                // struct_pointer = nested_struct.some_pointer_to_struct;
                let offset_const = self.function.create_i32_const(offset as i32);
                let pointer_value = self.function.build_load_register_inst(base, offset_const, IrValueType::Address);
                self.pointer_table.insert(pointer_value, pointer_type);
                pointer_value
            }
            SymbolType::BasicType(ir_type) => {
                let offset_const = self.function.create_i32_const(offset as i32);
                self.function.build_load_register_inst(base, offset_const, ir_type)
            }
            SymbolType::ArrayType(array_type) => {
                // rarely used, something like `&two_dims[10]` or `*two_dim[10]`;
                let offset_const = self.function.create_i32_const(offset as i32);
                let array_pointer_value = self.function.build_add_inst(base, offset_const);
                self.pointer_table.insert(array_pointer_value, PointerSymbolType { level:  array_access_level , pointer_to: Box::new(SymbolType::ArrayType(array_type)) } );
                array_pointer_value
            }
        }
    }
    /// ## Accept a Chain expression as base (Can apply to left or right hand side)
    /// To access a chain expression (combination of subscription, dereference and member select expression). we need
    /// to figure the position that this chain expression, then the differents of accept it as right hand side or left
    /// hand side just should we load this address's value or just return the address.
    /// 
    /// This function is pretty complex, this function can be divide into two part
    /// 
    /// - access by direct or indirect member select.
    /// - access by subscript a pointer or a array.
    /// 
    /// Frist part is access by memeber select or pointer member select. In this situation, we just need to calculate the
    /// base and offset of what entry this chain expression try to access. By the `get_access_sequnce_from_chain_expr`, we 
    /// can get the identifier of this chain expression, if identifier is struct type, we can get the layout. By the layout
    /// we can simple move offset to get the correct offset and based. There we used there variable `base`, `offset` and 
    /// `symbol_layout` to calculate.
    /// 
    /// - `base` and `offset` : last property's address and be caluate by the (base + offset)
    /// - `symbol_layout` : last property's layout.
    /// 
    /// So when we access the property by member select, we simple add the offset, and switch to next symbol layout if next
    /// property also is struct type. when we access the property by pointer member select, we can know that current (base+offset)'s
    /// value is a address, so we need to load it as new base, and replace offset to current entry's offset. 
    fn accept_chain_expr_base(&mut self, expr: &Expression) -> (Value, usize, SymbolType, usize) {
        // Get the chain sequnce, name is the identifier of chain expression
        let (name, callseqnce) = self.get_access_sequnce_from_chain_expr(expr);
        // Get base virtual register and layout of struct if possible.
        let empty_map = HashMap::new();
        let (mut base, mut symbol_layout) = match self.symbol_table.get(&name) {
            Some(entry) => {
                match &entry.data_type {
                    SymbolType::StructalType(struct_type_name) => {
                        (entry.reg, self.function_struct_layout_table.get(struct_type_name).unwrap())
                    }
                    SymbolType::PointerType(pointer_type) => {
                        match pointer_type.pointer_to.as_ref() {
                            SymbolType::StructalType(name) => {
                                (entry.reg, self.function_struct_layout_table.get(name).unwrap())
                            }
                            SymbolType::BasicType(_) => {
                                (entry.reg, &empty_map)
                            }
                            _ => unreachable!("{}", self.error_map.unreach_in_accpet_chain_expr_base_identifier_is_not_strutual_type),
                        }
                    }
                    SymbolType::ArrayType(_) => {
                        (entry.reg, &empty_map)
                    }
                    SymbolType::BasicType(_) => unreachable!("{}", self.error_map.unreach_in_accpet_chain_expr_base_identifier_is_not_strutual_type),
                }
            },
            None => unreachable!("{}", self.error_map.unreach_chain_expression_identifier_must_being_in_the_symbol_table)
        };
        // iterate call sequnce to get the base and offset of struct property.
        let mut offset = 0;
        let mut current_data_type = &self.symbol_table.get(&name).unwrap().data_type;
        let mut array_access_level = 0;
        let mut is_end_of_array_access = false;
        for item in callseqnce {
            // if access by array subscription.
            if let CallSequnceType::Subscript((values, level)) = item {
                // Create now base
                is_end_of_array_access = true;
                let offset_value = self.function.create_i32_const(offset as i32);
                base = self.function.build_add_inst(base, offset_value);
                if let SymbolType::ArrayType(array_symbol_type) = current_data_type {
                    // access_index = sum ( n_i * (h_(i-1) *.. (h_0)) )
                    let mut index: usize = 0;
                    let mut array_access_index = self.function.create_i32_const(0);
                    for value in values {
                        let mut cur_row_base = self.function.create_i32_const(1); 
                        for i in 0..(array_symbol_type.dims - index - 1) {
                            cur_row_base = self.function.build_mul_inst(cur_row_base, array_symbol_type.value_of_dims[i]);
                        }
                        let cur_row_index = self.function.build_mul_inst(value, cur_row_base);
                        array_access_index = self.function.build_add_inst(array_access_index, cur_row_index);
                        index += 1;
                    }
                    // mul access index by the size of array type
                    let size_of_array_element = self.get_size_from_symbol_type(array_symbol_type.array_of.as_ref());
                    let value_of_size_of_array_element = self.function.create_i32_const(size_of_array_element as i32);
                    let mul_value = self.function.build_mul_inst(array_access_index, value_of_size_of_array_element);
                    base = self.function.build_add_inst(base, mul_value);
                    offset = 0;
                    // if access to end, we maybe need to change strucy layout if array of type is struct 
                    if array_symbol_type.dims == level {
                        match array_symbol_type.array_of.as_ref() {
                            SymbolType::StructalType(struct_type_name) => {
                                current_data_type = array_symbol_type.array_of.as_ref();
                                symbol_layout = self.function_struct_layout_table.get(struct_type_name).unwrap()
                            }
                            SymbolType::PointerType(pointer_type) => {
                                current_data_type = array_symbol_type.array_of.as_ref();
                                let struct_type_name = match pointer_type.pointer_to.as_ref() {
                                    SymbolType::StructalType(name) => name,
                                    _ => unreachable!()
                                };
                                symbol_layout = self.function_struct_layout_table.get(struct_type_name).unwrap()
                            }
                            SymbolType::BasicType(_) | SymbolType::ArrayType(_)  => {
                                current_data_type =  array_symbol_type.array_of.as_ref();
                            }
                        }
                    }
                    array_access_level = level;
                    continue;
                }else if let SymbolType::PointerType(pointer_symbol_type) = current_data_type  {
                    for value in &values {
                        let value_of_size_of_array_element = self.function.create_i32_const(4 as i32);
                        let value_offset = self.function.build_mul_inst(value.clone(), value_of_size_of_array_element);
                        base = self.function.build_load_register_inst(base, value_offset,IrValueType::Address);
                    }
                    offset = 0;
                    if pointer_symbol_type.level >= level - 1 {
                        match pointer_symbol_type.pointer_to.as_ref() {
                            SymbolType::StructalType(struct_type_name) => {
                                current_data_type = pointer_symbol_type.pointer_to.as_ref();
                                symbol_layout = self.function_struct_layout_table.get(struct_type_name).unwrap()
                            },
                            SymbolType::BasicType(_) | SymbolType::ArrayType(_)  => {
                                current_data_type =  pointer_symbol_type.pointer_to.as_ref();
                            },
                            SymbolType::PointerType(_) => {
                                unreachable!();
                            }
                        }
                    }
                    array_access_level = level;
                } else {
                    unreachable!("{}", self.error_map.unreach_subscription_object_is_not_a_pointer_or_array);
                }
                continue;
            }
            is_end_of_array_access = false;
            let (property_name, is_pointer) = match item {
                CallSequnceType::Derefer(name) => (name, true),
                CallSequnceType::Member(name) => (name, false),
                _ => unreachable!(),
            };
            let entry = symbol_layout.get(&property_name).unwrap();
            if is_pointer {
                let offset_zero = self.function.create_u64_const(offset as u64);
                base = self.function.build_load_register_inst(base, offset_zero, IrValueType::Address); 
                offset = entry.offset;
            }else {
                offset += entry.offset;
            }
            current_data_type = &entry.data_type;
            match &entry.data_type {
                SymbolType::StructalType(struct_type_name) => {
                    symbol_layout = self.function_struct_layout_table.get(struct_type_name).unwrap();
                }
                SymbolType::PointerType(pointer_type) => {
                    if let SymbolType::StructalType(name) = pointer_type.pointer_to.as_ref() {
                        symbol_layout = self.function_struct_layout_table.get(name).unwrap();
                    }
                }
                SymbolType::BasicType(_)| SymbolType::ArrayType(_) => {},
            }
        }
        (base, offset, current_data_type.clone(), if is_end_of_array_access { 0 } else  {array_access_level})
    }
    /// ## Helper function for `accept_chain_expr_base`
    /// There we do not using recursion visitor to unwind a chain expression to build the instructions, instead
    /// we frist iterative over chain expression to find how this expression is access memory, this by member 
    /// select (both dot operator and dereference member select) or subscription access.
    fn get_access_sequnce_from_chain_expr(&mut self, expr: &Expression) -> (String, Vec<CallSequnceType>) {
        let mut cur = expr;
        let mut sequence = Vec::new();
        loop {
            match cur {
                Expression::DereferenceExpr(derefer_expr) => {
                    cur = derefer_expr.pointer.as_ref();
                    sequence.push(CallSequnceType::Derefer(derefer_expr.property.name.to_string()));
                },
                Expression::MemberExpr(member_expr) => {
                    cur = member_expr.object.as_ref();
                    sequence.push(CallSequnceType::Member(member_expr.property.name.to_string()))
                },
                Expression::SubscriptExpr(ref subscript_expr_base) => { 
                    let mut subscript_expr = subscript_expr_base;
                    let mut level = 0;
                    let mut values = Vec::new();
                    loop {
                        level += 1;
                        values.push(self.accept_expr(&subscript_expr.index));
                        if let Expression::SubscriptExpr(next_expr) = subscript_expr.object.as_ref() {
                            subscript_expr = next_expr;
                        }else {
                            break;
                        }
                    }
                    values.reverse();
                    sequence.push(CallSequnceType::Subscript((values, level)));
                    cur = subscript_expr.object.as_ref()
                }
                Expression::Identifier(identifier) => {
                    sequence.reverse();
                    return (
                        identifier.name.to_string(),
                        sequence,
                    )
                }
                _ => unreachable!()
            }
        }
    }
    /// ## Accept a identifier as right hand side expression.
    /// 
    fn accept_identifier(&mut self, id: &Identifier) -> Value {
        if let Some(symbol) = self.symbol_table.get(id.name.as_ref()) {
            match &symbol.data_type {
                SymbolType::BasicType(ir_type) => {
                    let offset = self.function.create_u8_const(0);
                    self.function.build_load_register_inst(symbol.reg , offset, ir_type.clone())
                }
                SymbolType::PointerType(pointer_type) => {
                    // return the virtual register that contain the address that pointer point to.
                    let offset = self.function.create_u8_const(0);
                    let pointer_value = self.function.build_load_register_inst(symbol.reg, offset, IrValueType::Address);
                    self.pointer_table.insert(pointer_value, pointer_type.clone());
                    pointer_value
                }
                SymbolType::StructalType(_) | SymbolType::ArrayType(_) => {
                    // when struct identifier can show in right hand side, it only can be a simple assignment, 
                    // which need two assgin a struct to a another.
                    symbol.reg
                },
            }
        }else {
            unreachable!("the identifier should exised in symbol table");
        }
    }
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
            IrValueType::U8 => self.function.create_u8_const(value as u8),
            IrValueType::U16 => self.function.create_u16_const(value as u16),
            IrValueType::U32 => self.function.create_u32_const(value as u32),
            IrValueType::U64 => self.function.create_u64_const(value as u64),
            IrValueType::I16 => self.function.create_i16_const(value as i16),
            IrValueType::I32 => self.function.create_i32_const(value as i32),
            IrValueType::I64 => self.function.create_i64_const(value as i64),
            _ => unreachable!(),
        }
    }
    /// Accept a 
    fn accept_float_literal(&mut self, float_literal: &FloatLiteral) -> Value {
        let value = match float_literal.base {
            FloatLiteralBase::Decimal => {
                float_literal.raw_value.parse::<f64>().unwrap()
            }
            _ => todo!()
        };
        let ir_type =  match float_literal.value_type {
            ValueType::Float => IrValueType::F32,
            ValueType::Double => IrValueType::F64,
            ValueType::LongDouble => IrValueType::F64,
            _ => unreachable!(),
        };
        match ir_type {
            IrValueType::F32 => self.function.create_f32_const(value as f32),
            IrValueType::F64 => self.function.create_f64_const(value as f64),
            _ => unreachable!(),
        }
    }
    /// ## Accept a expression that treat as left value.
    /// Different from `accept_expr`, which will return a virtual register contain the value of expression. `accept_as_lefthand_expr` 
    /// will return the virtual register that contain the address of that expression, and the symbol type of expression.
    /// 
    /// Not every expression can be left hand side value. By type checker, we can ensure the lefthandside expression 
    /// only contain as below:
    /// - identifier
    /// - member-select expression 
    /// - subscription expression
    /// - deference expression
    /// - unary expression with deference operator
    fn accept_as_lefthand_expr(&mut self, expr: &Expression) -> (Value, SymbolType) {
        match expr {
            Expression::Identifier(id) => {
                let SymbolEntry { reg, data_type } = self.symbol_table.get(id.name.as_ref()).unwrap();
                (reg.clone(), data_type.clone())
            }
            Expression::DereferenceExpr(_) | Expression::MemberExpr(_) | Expression::SubscriptExpr(_) => self.accept_chain_expr_as_leftvalue(expr),
            Expression::UnaryExpr(unary_expr) => self.accept_deference_unary_expr_as_leftvalue(unary_expr),
            _ => panic!(),
        }
    }
    fn accept_deference_unary_expr_as_leftvalue(&mut self,unary_expr: &UnaryExpression) -> (Value, SymbolType) {
        match unary_expr.ops {
            UnaryOps::Dereference => {
                let value= self.accept_expr(&unary_expr.expr);
                let pointer_info = self.pointer_table.remove(&value).unwrap();
                if pointer_info.level == 1 {
                    (value,*pointer_info.pointer_to)
                }else {
                    unreachable!();
                }
            }
            _ => unreachable!(),
        }
    }
    fn accept_chain_expr_as_leftvalue(&mut self, expr: &Expression) -> (Value, SymbolType) {
        let (base, offset, current_data_type, access_level) = self.accept_chain_expr_base(expr);
        match current_data_type {
            SymbolType::BasicType(_) | SymbolType::StructalType(_) => {
                let offset_const = self.function.create_u32_const(offset as u32);
                (self.function.build_add_inst(base, offset_const), current_data_type.clone())
            }
            SymbolType::PointerType(pointer_type) => {
                if access_level < pointer_type.level {
                    let offset_const = self.function.create_i32_const(offset as i32);
                    let pointer_value = self.function.build_add_inst(base, offset_const);
                    self.pointer_table.insert(pointer_value, pointer_type.clone());
                    (pointer_value, SymbolType::BasicType(IrValueType::Address) )
                }else if let SymbolType::BasicType(ir_type) = pointer_type.pointer_to.as_ref() {
                    let offset_const = self.function.create_i32_const(offset as i32);
                    let pointer_value = self.function.build_add_inst(base, offset_const);
                    self.pointer_table.insert(pointer_value, pointer_type.clone());
                    (pointer_value, SymbolType::BasicType(ir_type.clone()) )
                } else {
                    let offset_const = self.function.create_i32_const(offset as i32);
                    let pointer_value = self.function.build_add_inst(base, offset_const);
                    self.pointer_table.insert(pointer_value, pointer_type.clone());
                    (pointer_value, pointer_type.pointer_to.as_ref().clone())      
                }
            }
            SymbolType::ArrayType(_) => {
                // When array type accept as a left value, the only situation allowed by type checker is 
                // using as operand of address of operator.
                let offset_const = self.function.create_u32_const(offset as u32);
                (self.function.build_add_inst(base, offset_const), current_data_type.clone())
            }
        }
    }   
}