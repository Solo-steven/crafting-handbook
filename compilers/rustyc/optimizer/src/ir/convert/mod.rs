mod strcut_layout;
/// This module will take ast as input and covert
/// ast into ir instructions.
use std::collections::HashMap;
use std::mem::replace;
use crate::ir::function::*;
use crate::ir::value::*;
use rustyc_frontend::ast::*;
use rustyc_frontend::ast::declar::*;
use rustyc_frontend::ast::expr::*;
use rustyc_frontend::ast::stmt::*;
use rustyc_frontend::token::{IntLiteralBase, FloatLiteralBase};
/// Convert AST to IR blocks
pub struct Converter {
    pub functions: Vec<Function>,
}
#[derive(Debug,Clone)]
enum SymbolType {
    BasicType(IrValueType),
    StructalType(HashMap<String, StructalSymbolTypeEntry>),
    PointerType(PointerSymbolType),
}
#[derive(Debug, Clone)]
struct PointerSymbolType {
    pub level: usize,
    pub pointer_to: Box<SymbolType>
}
#[derive(Debug, Clone)]
struct StructalSymbolTypeEntry {
    pub offset: usize,
    pub data_type: Box<SymbolType>,
}
#[derive(Debug)]
struct SymbolEntry {
    reg: Value,
    data_type: SymbolType,
}
type SymbolTable = HashMap<String, SymbolEntry>;


impl Converter {
    pub fn new() -> Self {
        Self {
            functions: Vec::new(),
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

struct FunctionCoverter {
    pub function: Function,
    pub symbol_table: SymbolTable,
    pub pointer_table: HashMap<Value, PointerSymbolType>
}

impl FunctionCoverter {
    pub fn new() -> Self {
        Self {
            function: Function::new(String::from("")),
            symbol_table: HashMap::new(),
            pointer_table: HashMap::new(),
        }
    }
    pub fn convert(&mut self, func_def: &FunctionDefinition) -> Function {
        self.accept_function_def(func_def);
        //println!("{:?}", self.symbol_table);
        replace(&mut self.function, Function::new(String::new()))
    }
    fn accept_function_def(&mut self, func_def: &FunctionDefinition) {
        self.function.name = func_def.id.name.to_string();
        let block = self.function.create_block();
        self.function.switch_to_block(block);
        for block_item in &func_def.compound.body {
            self.accept_block_item(block_item);
        }
    }
    fn accept_block_item(&mut self, block_item: &BlockItem) {
        match block_item {
            BlockItem::Declar(declar) => self.accept_declar(declar),
            BlockItem::Stmt(stmt) => self.accept_statement(stmt),
        }
    }
    fn accept_statement(&mut self, statement: &Statement ) {
        match statement {
            Statement::ExprStmt(expr_stmt) => {
                self.accept_expr(&expr_stmt.expr);
            }
            _ => todo!()
        }
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
            let symbol_type = map_ast_type_to_symbol_type(&declarator.value_type);
            let ir_type = get_ir_type_from_symbol_type(&symbol_type);
            let pointer = self.function.build_stack_alloc_inst(10, 8);
            self.symbol_table.insert(declarator.id.name.to_string(), SymbolEntry { reg: pointer, data_type: symbol_type });
            if let Some(expr) = &declarator.init_value {
                let init_value = self.accept_expr(expr);
                let offset = self.function.create_u8_const(0);
                self.function.build_store_register_inst(init_value, pointer, offset, ir_type.clone());
            }
        }
    }
    fn accept_value_type(&mut self, value_type: &ValueType) {
        match value_type {
            ValueType::Struct(struct_type) => {
                match struct_type.as_ref() {
                    StructType::Declar(declar) => {},
                    StructType::Def(def) => {},
                }
            },
            _ => {/* skip basic type  */}
        }
    }
    fn accept_expr(&mut self, expr: &Expression) -> Value {
        match expr {
            Expression::AssignmentExpr(assign_expr) => self.accept_assignment_expr(assign_expr),
            Expression::ConditionalExpr(condition_expr) => todo!(),
            Expression::BinaryExpr(binary_expr) => self.accept_binary_expr(binary_expr),
            Expression::UnaryExpr(unary_expr) => self.accept_unary_expr(unary_expr),

            Expression::Identifier(id) => self.accept_identifier(id),
            Expression::IntLiteral(int_literal) => self.accept_int_literal(int_literal),
            Expression::FloatLiteral(float_literal) => self.accept_float_literal(float_literal),
            _ => {
                println!("{:?}", expr);
                todo!()
            }
        }
    }
    fn accept_assignment_expr(&mut self, assign_expr: &AssignmentExpression ) -> Value {
        match &assign_expr.ops {
            AssignmentOps::Assignment => {
                let (left_value,  data_type) = self.accept_as_lefthand_expr(&assign_expr.left);
                let right_value = self.accept_expr(&assign_expr.right);
                let offset = self.function.create_u8_const(0);
                self.function.build_store_register_inst(right_value, left_value, offset, get_ir_type_from_symbol_type(&data_type));
                right_value
            }
            _ => {
                todo!()
            }
        }
    }
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
                    let pointer_value = self.function.build_load_register_inst(symbol.reg, offset, IrValueType::U32);
                    self.pointer_table.insert(pointer_value, pointer_type.clone());
                    pointer_value
                }
                SymbolType::StructalType(_) => todo!(),
            }
        }else {
            panic!("the identifier should exised in symbol table");
        }
    }
    fn accept_int_literal(&mut self, int_literal: &IntLiteral) -> Value {
        let value = match int_literal.base {
            IntLiteralBase::Decimal => {
                int_literal.raw_value.parse::<i128>().unwrap()
            }
            _ => todo!()
        };
        let ir_type =  map_ast_type_to_ir_type(&int_literal.value_type);
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
    fn accept_float_literal(&mut self, float_literal: &FloatLiteral) -> Value {
        let value = match float_literal.base {
            FloatLiteralBase::Decimal => {
                float_literal.raw_value.parse::<f64>().unwrap()
            }
            _ => todo!()
        };
        let ir_type = map_ast_type_to_ir_type(&float_literal.value_type);
        match ir_type {
            IrValueType::F32 => self.function.create_f32_const(value as f32),
            IrValueType::F64 => self.function.create_f64_const(value as f64),
            _ => unreachable!(),
        }
    }
    fn accept_unary_expr(&mut self, unary_expr: &UnaryExpression) -> Value {
        match &unary_expr.ops {
            UnaryOps::AddressOf => {
                self.accept_as_lefthand_expr(&unary_expr.expr).0
            },
            UnaryOps::Dereference => {
                // return the value that a pointer point to.
                let value = self.accept_expr(&unary_expr.expr);
                let pointer_info = self.pointer_table.get(&value).unwrap();
                if pointer_info.level == 1 {
                    let offset = self.function.create_u8_const(0);
                    self.function.build_load_register_inst(value, offset, get_ir_type_from_symbol_type(&pointer_info.pointer_to))
                }else {
                    let PointerSymbolType { level, pointer_to    } = self.pointer_table.remove(&value).unwrap();
                    let offset = self.function.create_u8_const(0);
                    let next_value = self.function.build_load_register_inst(value, offset, IrValueType::U32);
                    self.pointer_table.insert(next_value, PointerSymbolType { level: level - 1, pointer_to });
                    next_value
                }
            },
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
            UnaryOps::Sizeof => {
                todo!();
            }
        }
    }
    /// Generate instruction for binary expression, 
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
                self.function.build_sub_inst(left_value, right_value)
            }else {
                self.function.build_fadd_inst(left_value, right_value)
            }
            _ => todo!(),
        }
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
            _ => todo!(),
        }
    }
    /// Accept a expression that treat as left value, different from accept_expr, there will return the virtual register 
    /// that contain the address of that expression, instead of the virtual register contain the value of expression.
    /// not every expression can be left hand side value.
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
            Expression::UnaryExpr(unary_expr) => {
                match unary_expr.ops {
                    UnaryOps::Dereference => {
                        let value= self.accept_expr(&unary_expr.expr);
                        let pointer_info = self.pointer_table.get(&value).unwrap();
                        if pointer_info.level == 1 {
                            let offset = self.function.create_u8_const(0);
                            (
                                self.function.build_load_register_inst(value, offset, get_ir_type_from_symbol_type(&pointer_info.pointer_to)), 
                                *pointer_info.pointer_to.clone()
                            )
                        }else {
                            let PointerSymbolType { level, pointer_to    } = self.pointer_table.remove(&value).unwrap();
                            let offset = self.function.create_u8_const(0);
                            let next_value = self.function.build_load_register_inst(value, offset, IrValueType::U32);
                            self.pointer_table.insert(next_value, PointerSymbolType { level: level - 1, pointer_to: pointer_to.clone() });
                            (next_value, *pointer_to.clone())
                        }
                    }
                    _ => unreachable!(),
                }
            }
            _ => panic!(),
        }
    }
}



fn get_ir_type_from_symbol_type(symbol_type: &SymbolType) -> IrValueType {
    match symbol_type {
        SymbolType::BasicType(basic_type) => {
            basic_type.clone()
        }
        SymbolType::PointerType(_) => {
            IrValueType::U32
        }
        _ => todo!()
    }
}

fn map_ast_type_to_symbol_type(value_type: &ValueType) -> SymbolType {
    match value_type  {
        ValueType::Char | 
        ValueType::Shorted | ValueType::UnsignedShort |
        ValueType::Int | ValueType::Unsigned |
        ValueType::Long | ValueType::UnsignedLong |
        ValueType::LongLong | ValueType::UnsignedLongLong |
        ValueType::Float | ValueType::Double  => {
            SymbolType::BasicType(map_ast_type_to_ir_type(value_type))
        }
        ValueType::PointerType(pointer_type) => {
            SymbolType::PointerType(PointerSymbolType { 
                level: pointer_type.level, 
                pointer_to: Box::new(map_ast_type_to_symbol_type(&pointer_type.pointer_to))
            })
        }
        ValueType::Struct(struct_type) => {
            match struct_type.as_ref() {
                StructType::Def(struct_def) => {
                    let mut properties = HashMap::new();
                    let mut offset = 0;
                    for declarator in &struct_def.declarator {
                        let data_type = map_ast_type_to_symbol_type(&declarator.value_type);
                        let entry = StructalSymbolTypeEntry {
                            offset,
                            data_type: Box::new(data_type),
                        };
                        properties.insert(declarator.id.name.to_string(),entry);
                    }
                    SymbolType::StructalType(properties)

                },
                StructType::Declar(declar) => todo!(),
            }
        }
        _ => todo!(),
    }
}
fn map_ast_type_to_ir_type(value_type: &ValueType) -> IrValueType {
    match value_type {
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
        ValueType::PointerType(_) => IrValueType::U32,
        _ => todo!()
    }
}

fn get_size_of_ast_type() {

}

pub fn construct_structal_layout_from_ast(struct_def: &StructDefinition) {
    let mut map = HashMap::new();
    for declarator in &struct_def.declarator {
        map.insert(declarator.id.name.to_string(), map_ast_type_to_symbol_type(&declarator.value_type));
    }
}