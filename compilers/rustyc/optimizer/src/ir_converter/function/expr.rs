use std::collections::BTreeMap;
use crate::ir_converter::function::FunctionCoverter;
use crate::ir::instructions::CmpFlag;
use crate::ir::value::*;
use crate::ir_converter::symbol_table::*;
use rustyc_frontend::ast::expr::*;
use rustyc_frontend::ast::declar::*;
use rustyc_frontend::token::{IntLiteralBase, FloatLiteralBase};

#[derive(Debug, Clone)]
enum ChainSequnceType {
    Member(String),
    Derefer(String),
    Subscript((Vec<Value>, usize)), // (offset of linear array format, access level)
}

enum ChainBase {
    Identifier(String),
    CallExprReturnStruct(Value, String),
    CallExprReturnPointer(Value, PointerSymbolType),
}

/// ## Helper Marco for getting a size from a symbol type.
/// Using a marco instead of function for avoid some borrowing problem. and this marco 
/// will return a value as the size of symbol type
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
/// ## Helper marco for unreachable error
/// By typecheck, we can ensure that some sematic error, will not be happend, so
/// those sematic error case.
macro_rules! unreachable_error {
    ($string: expr) => {
        panic!("{}", $string)
    };
}

impl<'a> FunctionCoverter<'a> {
    /// ## Accept a expression ast and generate instruction for ast.
    /// this function just perform a pattern match, call other function just like visitor pattern
    /// of ast traversal. please note that since call expression might not return value. so this 
    /// function return a option of value.
    pub (super) fn accept_expr(&mut self, expr: &Expression) -> Option<Value> {
        match expr {
            Expression::SequentialExpr(seq_expr) => self.accept_sequement_expr(seq_expr),
            Expression::AssignmentExpr(assign_expr) => Some(self.accept_assignment_expr(assign_expr)),
            Expression::ConditionalExpr(condition_expr) => Some(self.accept_condition_expr(condition_expr)),
            Expression::BinaryExpr(binary_expr) => Some(self.accept_binary_expr(binary_expr)),
            Expression::UnaryExpr(unary_expr) => Some(self.accept_unary_expr(unary_expr)),
            Expression::UpdateExpr(update_expr) => Some(self.accept_update_expr(update_expr)),
            Expression::MemberExpr(_) | Expression::DereferenceExpr(_) | Expression::SubscriptExpr(_) => Some(self.accept_chain_expr(expr)),
            Expression::CallExpr(call_expr) => self.accept_call_expr(call_expr),
            Expression::Identifier(id) => Some(self.accept_identifier(id)),
            Expression::IntLiteral(int_literal) => Some(self.accept_int_literal(int_literal)),
            Expression::FloatLiteral(float_literal) => Some(self.accept_float_literal(float_literal)),
            Expression::ParenthesesExpr(para_expr) => self.accept_expr(&para_expr.expr),
            Expression::CastExpr(cast_expr) => Some(self.accpet_cast_expr(cast_expr)),
            Expression::SizeOfTypeExpr(size_of_type_expr) => Some(self.accept_size_of_type_expr(size_of_type_expr)),
            Expression::SizeOfValueExpr(size_of_value_expr) => Some(self.accept_size_of_value_expr(size_of_value_expr)),
            _ => {
                println!("{:?}", expr);
                todo!()
            }
        }
    }
    /// ## Accept a expression ast and generate instruction for ast.
    /// Since call expression might not return a value, but should a call expression is sematic 
    /// correct is checked by typechecker, in most situation, we need return value. so we can using
    /// this function to unwarp the return value of `accept_value`.
    pub (super) fn accept_expr_with_value(&mut self, expr: &Expression) -> Value {
        self.accept_expr(expr).unwrap()
    }
    /// ## Accpet Sequential Expression
    /// Just using loop to accept vec of expression and return the last value;
    fn accept_sequement_expr(&mut self, seq_expr: &SequentialExpression) -> Option<Value> {
        let mut last_value = None;
        for expr in &seq_expr.exprs {
            last_value = self.accept_expr(expr);
        }
        last_value
    }
    /// ## Accept a assignment expression
    /// Generate assignment expression, when a expression in left hand side, it should return a value contain address
    /// of expression and symbol type of expresion, in the other side, when a expression in right hand side, return value
    /// would be a virtual register contain value of expression.
    fn accept_assignment_expr(&mut self, assign_expr: &AssignmentExpression ) -> Value {
        let (left_value,  data_type) = self.accept_as_lefthand_expr(&assign_expr.left);
        let right_value = self.accept_expr_with_value(&assign_expr.right);
        match &assign_expr.ops {
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
            AssignmentOps::Assignment => {},
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
                unreachable_error!(self.error_map.unreach_assignment_expr_left_value_is_array_type);
            }
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
        let layout = self.struct_layout_table.get(name).unwrap();
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
                    let struct_size = self.struct_size_table.get(next_name).unwrap().clone();
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
                        let struc_size = self.struct_size_table.get(name).unwrap().clone();
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
    /// ## Accept a condition expression in right hand side
    /// condition expr can be convert by phi instruction with two branch basic block.
    fn accept_condition_expr(&mut self, cond_expr: &ConditionalExpression) -> Value {
        // build branch
        let test_value = self.accept_expr_with_value(cond_expr.condi.as_ref());
        let cond_conseq_block = self.function.create_block();
        let cond_alter_block = self.function.create_block();
        let cond_final_block = self.function.create_block();
        self.function.build_brif_inst(test_value, cond_conseq_block, cond_alter_block);
        // conseq
        self.function.connect_block(self.function.current_block.unwrap(), cond_conseq_block);
        self.function.connect_block(cond_conseq_block, cond_final_block);
        self.function.switch_to_block(cond_conseq_block);
        let conseq_value = self.accept_expr_with_value(cond_expr.conseq.as_ref());
        self.function.build_jump_inst(cond_final_block);
        // alter
        self.function.connect_block(self.function.current_block.unwrap(), cond_alter_block);
        self.function.connect_block(cond_alter_block, cond_final_block);
        self.function.switch_to_block(cond_alter_block);
        let alter_value = self.accept_expr_with_value(cond_expr.alter.as_ref());
        self.function.build_jump_inst(cond_final_block);
        // final
        let cond_final_block = self.function.create_block();
        self.function.switch_to_block(cond_final_block);
        self.function.build_phi_inst(vec![(cond_conseq_block, conseq_value), (cond_alter_block, alter_value)])
    }
    /// ## Accept a binary expression in right hand side
    /// Generate binary expression is simple, just using posfix-order dfs to traversal child frist then generate
    /// instruction by binary operator.
    fn accept_binary_expr(&mut self, binary_expr: &BinaryExpression) -> Value {
        let left_value = self.accept_expr_with_value(&binary_expr.left);
        let right_value = self.accept_expr_with_value(&binary_expr.right);
        let (left_value, right_value, target_type) = self.align_two_base_type_value_to_same_type(left_value, right_value, None);
        let is_float = match target_type {
            IrValueType::F32 | IrValueType::F64 => true,
            _ => false
        };
        match binary_expr.ops {
            BinaryOps::BitwiseAnd => self.function.build_bitwise_and_inst(left_value, right_value),
            BinaryOps::BitwiseOr => self.function.build_bitwise_or_inst(left_value, right_value),
            BinaryOps::BitwiseXor => { todo!() }
            BinaryOps::BitwiseLeftShift => self.function.build_shiftleft_inst(left_value, right_value),
            BinaryOps::BitwiseRightShift => self.function.build_shiftright_inst(left_value, right_value),
            BinaryOps::LogicalAnd => self.function.build_logical_and_inst(left_value, right_value),
            BinaryOps::LogicalOr => self.function.build_logical_or_inst(left_value, right_value),
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
            BinaryOps::Division => if is_float {
                self.function.build_fdivide_inst(left_value, right_value)
            }else {
                self.function.build_divide_inst(left_value, right_value)
            }
            BinaryOps::Remainder => if is_float {
                self.function.build_freminder_inst(left_value, right_value)
            }else {
                self.function.build_reminder_inst(left_value, right_value)
            }
            BinaryOps::Gt => if is_float {
                self.function.build_fcmp_inst(left_value, right_value, CmpFlag::Gt)
            }else {
                self.function.build_icmp_inst(left_value, right_value, CmpFlag::Gt)
            }
            BinaryOps::Lt => if is_float {
                self.function.build_fcmp_inst(left_value, right_value, CmpFlag::Lt)
            }else {
                self.function.build_icmp_inst(left_value, right_value, CmpFlag::Lt)
            }
            BinaryOps::Geqt => if is_float {
                self.function.build_fcmp_inst(left_value, right_value, CmpFlag::Gteq)
            }else {
                self.function.build_icmp_inst(left_value, right_value, CmpFlag::Gteq)
            }
            BinaryOps::Leqt => if is_float {
                self.function.build_fcmp_inst(left_value, right_value, CmpFlag::LtEq)
            }else {
                self.function.build_icmp_inst(left_value, right_value, CmpFlag::LtEq)
            }
            BinaryOps::Equal => if is_float {
                self.function.build_fcmp_inst(left_value, right_value, CmpFlag::Eq)
            }else {
                self.function.build_icmp_inst(left_value, right_value, CmpFlag::Eq)
            }
            BinaryOps::NotEqual => if is_float {
                self.function.build_fcmp_inst(left_value, right_value, CmpFlag::NotEq)
            }else {
                self.function.build_icmp_inst(left_value, right_value, CmpFlag::NotEq)
            }
        }
    }
    
    /// ## Accept a cast expression base
    /// If cast type is basic type, just build a convert instruction.
    fn accpet_cast_expr(&mut self, cast_expr: &CastExpression) -> Value {
        let to_symbol_type = self.map_ast_type_to_symbol_type(&cast_expr.type_name);
        let src = self.accept_expr_with_value(&cast_expr.expr);
        match to_symbol_type {
            SymbolType::BasicType(ir_type) => {
                self.generate_type_convert(src, &ir_type)
            }   
            SymbolType::PointerType(_pointer_type) => {
                let cast_value = self.generate_type_convert(src, &IrValueType::Address);
                cast_value
            }
            SymbolType::StructalType(_) => {
                // C99 forbiden cast object to struct
                // you can only convert a struc pointer.
                unreachable_error!(self.error_map.unreach_convert_a_struct_type);
            }
            SymbolType::ArrayType(_) => {
                // C99 forbiden cast to array type
                unreachable_error!(self.error_map.unreach_convert_a_array_type);
            }
        }
    }
    /// ## Accept size of type expression
    /// Calling `get_size_from_ast_type` to return a value of size. if it is a variable length array
    /// we need to create symbol and passing it as extra info,
    fn accept_size_of_type_expr(&mut self, size_of_type_expr: &SizeOfTypeExpression) -> Value {
        let temp_symbol_type = self.map_ast_type_to_symbol_type(&size_of_type_expr.value_type);
        self.get_size_form_ast_type(&size_of_type_expr.value_type, Some(&temp_symbol_type))
    }
    /// ## Accept a size of expression
    /// If expression is a identifier, return size according to symbol type. if is a expression, it have to
    /// be a basic type, just return a size of basic type.
    fn accept_size_of_value_expr(&mut self, size_of_value_expr: &SizeOfValueExpression) -> Value {
        if let Expression::Identifier(id) = size_of_value_expr.expr.as_ref() {
            let symbol = self.symbol_table.get(&id.name).unwrap();
            get_size_from_symbol_type!(self, &symbol.symbol_type)
        }else {
            let value  = self.accept_expr(&size_of_value_expr.expr);
            match value {
                Some(val) => {
                    let ir_type = self.function.get_value_ir_type(val);
                    let size_usize = match ir_type {
                        IrValueType::Void => 0,
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
                    };
                    self.function.create_u8_const(size_usize as u8)
                }
                None => self.function.create_u8_const(0)
            }
        }
    }
    /// ## Accept a unary expression in right hand side
    /// most of unary expression op is simple to generate. there are three op need to handle with sub-function.
    /// - address of 
    /// - dereference
    fn accept_unary_expr(&mut self, unary_expr: &UnaryExpression) -> Value {
        match &unary_expr.ops {
            UnaryOps::BitwiseNot => { 
                let src = self.accept_expr_with_value(&unary_expr.expr);
                self.function.build_bitwise_not(src)
             },
            UnaryOps::LogicalNot => {
                let src = self.accept_expr_with_value(&unary_expr.expr);
                self.function.build_logical_not(src)
            },
            UnaryOps::Minus => {
                let src = self.accept_expr_with_value(&unary_expr.expr);
                self.function.build_neg_inst(src)
            },
            UnaryOps::Plus => {
                self.accept_expr_with_value(&unary_expr.expr)
            },
            UnaryOps::AddressOf => self.accept_address_of_unary_expr(unary_expr),
            UnaryOps::Dereference => self.accept_dereference_unary_expr(unary_expr),
            _ => unreachable_error!(self.error_map.unreach_size_of_operator_in_unary_expr),
        }
    }
    /// ## Accept a right hand side unary expression where op is a address of (&)
    /// - TODO: depercate
    /// By type checker, we can ensure that the oprand of address of operator is only some addressable oprand
    /// and address of operand is actually just get address of those addressable operand. it is same as accept 
    /// it as left hand side.
    /// ## Pointer Table
    /// please reference to the `Pointer Table` section of `accept_dereference_unary_expr`. because we might need
    /// load a value contain address, we need data type of value, as the result. there insert value to `pointer_table`
    /// to cache the type of pointer point to.
    fn accept_address_of_unary_expr(&mut self, unary_expr: &UnaryExpression) ->Value {
        self.accept_as_lefthand_expr(&unary_expr.expr).0
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
        let (value, symbol_type) = self.accept_as_lefthand_expr(&unary_expr.expr);
        match symbol_type {
            SymbolType::ArrayType(array_symbol_type) => {
                if array_symbol_type.value_of_dims.len() == 1 {
                    let offset_0 = self.function.create_u8_const(0);
                    let array_of_type = match *array_symbol_type.array_of {
                        SymbolType::BasicType(basic_type) => basic_type, 
                        _ => unreachable!(),
                    };
                    self.function.build_load_register_inst(value, offset_0, array_of_type)
                }else {
                    unreachable!();
                }
            }
            SymbolType::PointerType(pointer_type) => {
                let offset_0 = self.function.create_u8_const(0);
                let address = self.function.build_load_register_inst(value, offset_0, IrValueType::Address);
                let pointer_to_type = match *pointer_type.pointer_to {
                    SymbolType::BasicType(basic_type) => basic_type, 
                    _ => unreachable!(),
                };
                self.function.build_load_register_inst(address, offset_0, pointer_to_type)
            }
            SymbolType::StructalType(_) | SymbolType::BasicType(_) => unreachable!(),
        }
    }
    fn accept_update_expr(&mut self, update_expr: &UpdateExpression) -> Value {
        let (reg, symbol_type) = self.accept_as_lefthand_expr(&update_expr.expr);
        let ir_type = match symbol_type {
            SymbolType::BasicType(ir_type) => ir_type,
            SymbolType::PointerType(_) => IrValueType::Address, 
            SymbolType::ArrayType(_) | SymbolType::StructalType(_) => unreachable!(),
        };
        if update_expr.posfix {
            todo!()
        }else {
            let offset_0 = self.function.create_u32_const(0);
            let value = self.function.build_load_register_inst(reg, offset_0,ir_type.clone());
            let const_one = self.function.create_u32_const(1);
            let (next_value, next_const, target_type) = self.align_two_base_type_value_to_same_type(value, const_one, None);
            let is_float = match target_type {
                IrValueType::F32 | IrValueType::F64 => true,
                _ => false,
            };
            let prefix_value = match update_expr.ops {
                UpdateOps::Decrement => if is_float {
                    self.function.build_fsub_inst(next_value, next_const)
                }else {
                    self.function.build_sub_inst(next_value, next_const)
                }
                UpdateOps::Increment => if is_float {
                    self.function.build_fadd_inst(next_value, next_const)
                }else {
                    self.function.build_add_inst(next_value, next_const)
                }
            };
            self.function.build_store_register_inst(prefix_value, reg, const_one, ir_type.clone());
            prefix_value
        }
    }
    /// Accept a call expression 
    /// build proper call instruction for function call, when callee return type is a struct type, we need to 
    /// alloc a struct in current scope and pass to function, and callee function will perform copy by value to
    /// the pointer we passed into.
    fn accept_call_expr(&mut self, call_expr: &CallExpression) -> Option<Value> {
        let callee_name = match call_expr.callee.as_ref() {
            Expression::Identifier(id) => id.name.to_string(),
            _ => todo!(),
        };
        let signature = self.function_signature_table.get(&callee_name).unwrap();
        let mut arugments: Vec<Value> = call_expr
            .arguments
            .iter()
            .map(|argu_expr| self.accept_expr_with_value(argu_expr))
            .collect();
        let mut ret_value: Option<Value> = None;
        let return_symbol_type = &signature.return_type;
        if let SymbolType::StructalType(struct_name) = return_symbol_type {
            let struct_size = self.struct_size_table.get(struct_name).unwrap().clone();
            let struct_size_value = self.function.create_u32_const(struct_size as u32);
            ret_value = Some(self.function.build_stack_alloc_inst(struct_size_value, 8, None));
            arugments.push(ret_value.as_ref().unwrap().clone());
        };
        let ir_return_type = match &signature.return_type {
                SymbolType::BasicType(ir_type) => Some(ir_type.clone()),
                SymbolType::PointerType(_) => Some(IrValueType::Address),
                SymbolType::StructalType(_) => None,
                SymbolType::ArrayType(_) => unreachable!(),
        };
        let call_inst_value = self.function.build_call_inst(callee_name, arugments, ir_return_type);
        if let Some(ret_val) = ret_value {
            if let Some(_call_inst_val) = call_inst_value.clone() {
                unreachable!();
            }else {
                return Some(ret_val);
            }
        }
        return call_inst_value;
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
        let (base, offset, current_data_type, _) = self.accept_chain_expr_base(expr);
        match current_data_type {
            SymbolType::StructalType(_) => {
                // right hand side of assign a struct to anthoer struct, just return the address, let `accept_assign_expr`
                // to performan copy.
                let offset_const = self.function.create_i32_const(offset as i32);
                self.function.build_add_inst(base, offset_const)
            }
            SymbolType::PointerType(_pointer_type) => {
                // struct_pointer = nested_struct.some_pointer_to_struct;
                let offset_const = self.function.create_i32_const(offset as i32);
                let pointer_value = self.function.build_load_register_inst(base, offset_const, IrValueType::Address);
                pointer_value
            }
            SymbolType::BasicType(ir_type) => {
                let offset_const = self.function.create_i32_const(offset as i32);
                self.function.build_load_register_inst(base, offset_const, ir_type)
            }
            SymbolType::ArrayType(_array_type) => {
                // rarely used, something like `&two_dims[10]` or `*two_dim[10]`;
                let offset_const = self.function.create_i32_const(offset as i32);
                let array_pointer_value = self.function.build_add_inst(base, offset_const);
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
        let (chain_base, callseqnce) = self.get_access_sequnce_from_chain_expr(expr);
        let mut base: Value;
        let mut symbol_layout: &BTreeMap<String, StructLayoutEntry>;
        let mut current_data_type: &SymbolType;
        let empty_map = BTreeMap::new();
        let empty_symbol: SymbolType;
        match chain_base {
            ChainBase::Identifier(name) => {
                let (base_reg, symbol_layout_ref) = match self.symbol_table.get(&name) {
                    Some(entry) => {
                        match &entry.symbol_type {
                            SymbolType::StructalType(struct_type_name) => {
                                (entry.reg, self.struct_layout_table.get(struct_type_name).unwrap())
                            }
                            SymbolType::PointerType(pointer_type) => {
                                match pointer_type.pointer_to.as_ref() {
                                    SymbolType::StructalType(name) => {
                                        (entry.reg, self.struct_layout_table.get(name).unwrap())
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
                base = base_reg;
                symbol_layout = symbol_layout_ref;
                current_data_type = &self.symbol_table.get(&name).unwrap().symbol_type;

            }
            ChainBase::CallExprReturnStruct(base_reg, struct_name) => {
                base = base_reg;
                symbol_layout = self.struct_layout_table.get(&struct_name).unwrap();
                empty_symbol = SymbolType::StructalType(struct_name);
                current_data_type = &empty_symbol;
            }
            ChainBase::CallExprReturnPointer(base_reg,pointer_symbol_type) => {
                base = base_reg;
                match pointer_symbol_type.pointer_to.as_ref() {
                    SymbolType::BasicType(_) => {
                        symbol_layout = &empty_map;
                    }
                    SymbolType::StructalType(struct_name) => {
                        symbol_layout = self.struct_layout_table.get(struct_name).unwrap();
                    }
                    SymbolType::ArrayType(_) => todo!(),
                    SymbolType::PointerType(_) => unimplemented!(),
                }
                empty_symbol = SymbolType::PointerType(pointer_symbol_type);
                current_data_type = &empty_symbol;
            }
        }
        // Get base virtual register and layout of struct if possible.
        // iterate call sequnce to get the base and offset of struct property.
        let mut offset = 0;
        let mut array_access_level = 0;
        let mut is_end_of_array_access = false;
        for item in callseqnce {
            // if access by array subscription.
            if let ChainSequnceType::Subscript((values, level)) = item {
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
                        for i in 0..(array_symbol_type.value_of_dims.len() - index - 1) {
                            cur_row_base = self.function.build_mul_inst(cur_row_base, array_symbol_type.value_of_dims[i]);
                        }
                        let cur_row_index = self.function.build_mul_inst(value, cur_row_base);
                        array_access_index = self.function.build_add_inst(array_access_index, cur_row_index);
                        index += 1;
                    }
                    // mul access index by the size of array type
                    let value_of_array_element = get_size_from_symbol_type!(self, array_symbol_type.array_of.as_ref());
                    let mul_value = self.function.build_mul_inst(array_access_index, value_of_array_element);
                    base = self.function.build_add_inst(base, mul_value);
                    offset = 0;
                    // if access to end, we maybe need to change strucy layout if array of type is struct 
                    if array_symbol_type.value_of_dims.len() == level {
                        match array_symbol_type.array_of.as_ref() {
                            SymbolType::StructalType(struct_type_name) => {
                                current_data_type = array_symbol_type.array_of.as_ref();
                                symbol_layout = self.struct_layout_table.get(struct_type_name).unwrap()
                            }
                            SymbolType::PointerType(pointer_type) => {
                                current_data_type = array_symbol_type.array_of.as_ref();
                                let struct_type_name = match pointer_type.pointer_to.as_ref() {
                                    SymbolType::StructalType(name) => name,
                                    _ => unreachable!()
                                };
                                symbol_layout = self.struct_layout_table.get(struct_type_name).unwrap()
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
                    if pointer_symbol_type.level == level  {
                        match pointer_symbol_type.pointer_to.as_ref() {
                            SymbolType::StructalType(struct_type_name) => {
                                current_data_type = pointer_symbol_type.pointer_to.as_ref();
                                symbol_layout = self.struct_layout_table.get(struct_type_name).unwrap()
                            },
                            SymbolType::BasicType(_) | SymbolType::ArrayType(_)  => {
                                current_data_type = pointer_symbol_type.pointer_to.as_ref();
                            },
                            SymbolType::PointerType(_) => {
                                unreachable!();
                            }
                        }
                    }
                    array_access_level = level;
                } else {
                    unreachable_error!(self.error_map.unreach_subscription_object_is_not_a_pointer_or_array);
                }
                continue;
            }
            is_end_of_array_access = false;
            let (property_name, is_pointer) = match item {
                ChainSequnceType::Derefer(name) => (name, true),
                ChainSequnceType::Member(name) => (name, false),
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
                    symbol_layout = self.struct_layout_table.get(struct_type_name).unwrap();
                }
                SymbolType::PointerType(pointer_type) => {
                    if let SymbolType::StructalType(name) = pointer_type.pointer_to.as_ref() {
                        symbol_layout = self.struct_layout_table.get(name).unwrap();
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
    fn get_access_sequnce_from_chain_expr(&mut self, expr: &Expression) -> (ChainBase, Vec<ChainSequnceType>) {
        let mut cur = expr;
        let mut sequence = Vec::new();
        loop {
            match cur {
                Expression::DereferenceExpr(derefer_expr) => {
                    cur = derefer_expr.pointer.as_ref();
                    sequence.push(ChainSequnceType::Derefer(derefer_expr.property.name.to_string()));
                },
                Expression::MemberExpr(member_expr) => {
                    cur = member_expr.object.as_ref();
                    sequence.push(ChainSequnceType::Member(member_expr.property.name.to_string()))
                },
                Expression::SubscriptExpr(ref subscript_expr_base) => { 
                    let mut subscript_expr = subscript_expr_base;
                    let mut level = 0;
                    let mut values = Vec::new();
                    loop {
                        level += 1;
                        values.push(self.accept_expr_with_value(&subscript_expr.index));
                        if let Expression::SubscriptExpr(next_expr) = subscript_expr.object.as_ref() {
                            subscript_expr = next_expr;
                        }else {
                            break;
                        }
                    }
                    values.reverse();
                    sequence.push(ChainSequnceType::Subscript((values, level)));
                    cur = subscript_expr.object.as_ref()
                }
                Expression::Identifier(identifier) => {
                    sequence.reverse();
                    return (
                        ChainBase::Identifier(identifier.name.to_string()),
                        sequence,
                    )
                }
                Expression::CallExpr(call_expr) => {
                    let base = self.accept_call_expr(call_expr).unwrap();
                    let callee_name = match call_expr.callee.as_ref() {
                        Expression::Identifier(id) => id.name.to_string(),
                        _ => todo!(),
                    };
                    let signature = self.function_signature_table.get(&callee_name).unwrap();
                    sequence.reverse();
                    match &signature.return_type {
                        SymbolType::StructalType(struct_name) => {
                            return (
                                ChainBase::CallExprReturnStruct(base, struct_name.clone()),
                                sequence,
                            );
                        }
                        SymbolType::PointerType(pointer_symbol_type) => {
                            return (
                                ChainBase::CallExprReturnPointer(base, pointer_symbol_type.clone()),
                                sequence,
                            );
                        }
                        SymbolType::BasicType(_) | SymbolType::ArrayType(_) => unreachable!(),
                    }
                }
                _ => unreachable!()
            }
        }
    }
    /// ## Accept a identifier as right hand side expression.
    /// When right hand side expression accept a identifier, just load it's value.
    fn accept_identifier(&mut self, id: &Identifier) -> Value {
        if let Some(symbol) = self.symbol_table.get(id.name.as_ref()) {
            match &symbol.symbol_type {
                SymbolType::BasicType(ir_type) => {
                    let offset = self.function.create_u8_const(0);
                    self.function.build_load_register_inst(symbol.reg , offset, ir_type.clone())
                }
                SymbolType::PointerType(_pointer_type) => {
                    // return the virtual register that contain the address that pointer point to.
                    let offset = self.function.create_u8_const(0);
                    let pointer_value = self.function.build_load_register_inst(symbol.reg, offset, IrValueType::Address);
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
    /// ## Accept a float literal
    /// Just create const for literal.
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
                let SymbolEntry { reg, symbol_type } = self.symbol_table.get(id.name.as_ref()).unwrap();
                (reg.clone(), symbol_type.clone())
            }
            Expression::DereferenceExpr(_) | Expression::MemberExpr(_) | Expression::SubscriptExpr(_) => self.accept_chain_expr_as_leftvalue(expr),
            Expression::UnaryExpr(unary_expr) => self.accept_deference_unary_expr_as_leftvalue(unary_expr),
            _ => panic!(),
        }
    }
    /// ## Accpet a deference unary expression as left hand side value
    /// when deference is left hand side, the operand must be a indirect expressioon, it should be 
    /// ensure by type checker.
    fn accept_deference_unary_expr_as_leftvalue(&mut self,unary_expr: &UnaryExpression) -> (Value, SymbolType) {
        match &unary_expr.ops {
            UnaryOps::Dereference => {
                let (value, symbol_type) = self.accept_as_lefthand_expr(&unary_expr.expr);
                match symbol_type {
                    // |-------|     |---|---------|
                    // | value | ------> | addrsss |
                    // |-------|     |---|---------|
                    SymbolType::PointerType(mut pointer_symbol_type) => {
                        let offset_0 = self.function.create_u8_const(0);
                        let next_value = self.function.build_load_register_inst(value, offset_0, IrValueType::Address);
                        if pointer_symbol_type.level == 1 {
                            (next_value, *pointer_symbol_type.pointer_to)
                        }else {
                            pointer_symbol_type.level -= 1;
                            (next_value, SymbolType::PointerType(pointer_symbol_type))
                        }
                    }
                    SymbolType::ArrayType(mut array_symbol_type) => {
                        let offset_0 = self.function.create_u8_const(0);
                        let next_value = self.function.build_load_register_inst(value, offset_0, IrValueType::Address);
                        array_symbol_type.value_of_dims.pop();
                        (next_value, SymbolType::ArrayType(array_symbol_type))
                    }
                    SymbolType::BasicType(_) | SymbolType::StructalType(_) => unreachable!(), 
                }
            }
            _ => unreachable!(),
        }
    }
    fn accept_chain_expr_as_leftvalue(&mut self, expr: &Expression) -> (Value, SymbolType) {
        let (base, offset,current_data_type, access_level) = self.accept_chain_expr_base(expr);
        match current_data_type {
            SymbolType::BasicType(_) | SymbolType::StructalType(_) => {
                let offset_const = self.function.create_u32_const(offset as u32);
                (self.function.build_add_inst(base, offset_const), current_data_type.clone())
            }
            SymbolType::PointerType(pointer_type) => {
                let offset_const = self.function.create_i32_const(offset as i32);
                let pointer_value = self.function.build_add_inst(base, offset_const);
                if access_level > 0 {
                    if access_level == pointer_type.level {
                        (pointer_value, *pointer_type.pointer_to)
                    }else {
                        (pointer_value,SymbolType::PointerType(pointer_type))
                    }
                }else {
                    (pointer_value, SymbolType::PointerType(pointer_type))
                }
            }
            SymbolType::ArrayType(mut array_symbol_type) => {
                for _i in 0..access_level {
                    array_symbol_type.value_of_dims.pop();
                }
                let offset_const = self.function.create_u32_const(offset as u32);
                (self.function.build_add_inst(base, offset_const), SymbolType::ArrayType(array_symbol_type))
            }
        }
    }   
}