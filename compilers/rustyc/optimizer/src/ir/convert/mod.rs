/// This module will take ast as input and covert ast into ir instructions.
mod symbol_table;
use std::collections::HashMap;
use std::mem::replace;
use crate::ir::function::*;
use crate::ir::value::*;
use crate::ir::convert::symbol_table::*;
use rustyc_frontend::ast::*;
use rustyc_frontend::ast::declar::*;
use rustyc_frontend::ast::expr::*;
use rustyc_frontend::ast::stmt::*;
use rustyc_frontend::token::{IntLiteralBase, FloatLiteralBase};
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

struct FunctionCoverter {
    pub function: Function,
    /// for store struct-related info 
    pub struct_layout_table: StructLayoutTable,
    pub struct_size_table: StructSizeTable,
    /// 
    pub symbol_table: SymbolTable,
    /// 
    pub pointer_table: HashMap<Value, PointerSymbolType>,
}

#[derive(Debug, Clone)]
enum CallSequnceType {
    Member(String),
    Derefer(String),
}
enum LeftRighValueEnum {
    LeftValue(Value, SymbolType),
    RightValue(Value),
}

impl FunctionCoverter {
    pub fn new() -> Self {
        Self {
            function: Function::new(String::from("")),
            struct_layout_table: HashMap::new(),
            struct_size_table: HashMap::new(),
            symbol_table: HashMap::new(),
            pointer_table: HashMap::new(),
        }
    }
    pub fn convert(&mut self, func_def: &FunctionDefinition) -> Function {
        self.accept_function_def(func_def);
        println!("{:#?}", self.symbol_table);
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
            let symbol_type = self.map_ast_type_to_symbol_type(&declarator.value_type);
            let size = self.get_size_form_ast_type(&declarator.value_type);
            let pointer = self.function.build_stack_alloc_inst(size, 8);
            self.symbol_table.insert(declarator.id.name.to_string(), SymbolEntry { reg: pointer, data_type: symbol_type.clone() });
            if let Some(expr) = &declarator.init_value {
                let init_value = self.accept_expr(expr);
                let offset = self.function.create_u8_const(0);
                let ir_type = get_ir_type_from_symbol_type(&symbol_type);
                self.function.build_store_register_inst(init_value, pointer, offset, ir_type.clone());
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
    fn accept_expr(&mut self, expr: &Expression) -> Value {
        match expr {
            Expression::AssignmentExpr(assign_expr) => self.accept_assignment_expr(assign_expr),
            Expression::ConditionalExpr(condition_expr) => todo!(),
            Expression::BinaryExpr(binary_expr) => self.accept_binary_expr(binary_expr),
            Expression::UnaryExpr(unary_expr) => self.accept_unary_expr(unary_expr),
            Expression::MemberExpr(_) | Expression::DereferenceExpr(_) => self.accept_chain_expr(expr),
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
    /// Accept a chain expr,
    fn accept_chain_expr(&mut self, expr: &Expression) -> Value {
        // get the chain sequnce.
        let (name, callseqnce) = self.get_access_sequnce_from_chain_expr(expr);
        // get base virtual register and layout of struct.
        let (mut base, mut symbol_layout) = match self.symbol_table.get(&name) {
            Some(entry) => {
                match &entry.data_type {
                    SymbolType::StructalType(struct_type_name) => {
                        (entry.reg, self.struct_layout_table.get(struct_type_name).unwrap())
                    }
                    SymbolType::PointerType(pointer_type) => {
                        let struct_type_name = match pointer_type.pointer_to.as_ref() {
                            SymbolType::StructalType(name) => name,
                            _ => unreachable!()
                        };
                        (entry.reg, self.struct_layout_table.get(struct_type_name).unwrap())
                    }
                    SymbolType::BasicType(_) => unreachable!(),
                }
            },
            None => unreachable!("{:?}, {:?} {:?}", name, self.symbol_table, self.symbol_table.get(&name))
        };
        // iterate call sequnce to get the base and offset of struct property.
        let mut offset = 0;
        for item in callseqnce {
            let (property_name, is_pointer) = match item {
                CallSequnceType::Derefer(name) => (name, true),
                CallSequnceType::Member(name) => (name, false)
            };
            let entry = symbol_layout.get(&property_name).unwrap();
            if is_pointer {
                let offset_zero = self.function.create_u64_const(offset as u64);
                base = self.function.build_load_register_inst(base, offset_zero, IrValueType::U32); 
                offset = entry.offset;
            }else {
                offset += entry.offset;
            }
            match &entry.data_type {
                SymbolType::StructalType(struct_type_name) => {
                    symbol_layout = self.struct_layout_table.get(struct_type_name).unwrap();
                }
                SymbolType::PointerType(pointer_type) => {
                    let struct_type_name = match pointer_type.pointer_to.as_ref() {
                        SymbolType::StructalType(name) => name,
                        _ => unreachable!()
                    };
                    symbol_layout = self.struct_layout_table.get(struct_type_name).unwrap();
                }
                SymbolType::BasicType(ir_type) => {
                    let offset_const = self.function.create_u64_const(offset as u64);
                    return self.function.build_load_register_inst(base, offset_const, ir_type.clone());
                },
            }
        }
        unreachable!();
        
    }
    fn get_access_sequnce_from_chain_expr(&self, expr: &Expression) -> (String, Vec<CallSequnceType>) {
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
                Expression::SubscriptExpr(subscript_expr) => { todo!()}
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
    fn accept_dereference_expr(&mut self, derefer_expr: &DereferenceExpression) {

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
                            let PointerSymbolType { level, pointer_to } = self.pointer_table.remove(&value).unwrap();
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
    /// Mapping the ast type to symbol table, used when 
    /// - in declaration list, we need to get the symbol type of a declarator's value type.
    fn map_ast_type_to_symbol_type(&mut self, value_type: &ValueType) -> SymbolType {
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
                    pointer_to: Box::new(self.map_ast_type_to_symbol_type(&pointer_type.pointer_to))
                })
            }
            ValueType::Struct(struct_type) => {
                // if is 
                match struct_type.as_ref() {
                    StructType::Declar(declar) => {
                        if self.struct_layout_table.get(declar.id.name.as_ref()).is_some() {
                            SymbolType::StructalType(declar.id.name.to_string())
                        }else {
                            unreachable!("[Unreach Error]:")
                        }
                    },
                    StructType::Def(def) => {
                        let name = def.id.as_ref().unwrap().name.to_string();
                        self.struct_layout_table.insert(name.clone(), HashMap::new());
                        let mut layout = HashMap::new();
                        let mut offset = 0;
                        for declarator in &def.declarator {
                            layout.insert(declarator.id.name.to_string(), StructLayoutEntry{ offset, data_type: self.map_ast_type_to_symbol_type(&declarator.value_type)  });
                            offset += self.get_size_form_ast_type(&declarator.value_type);
                        }
                        self.struct_layout_table.insert(name, layout);
                        SymbolType::StructalType(def.id.as_ref().unwrap().name.to_string())
                    }
                }
            }
            _ => todo!(),
        }
    }
    /// Get the size byte of a ast type.
    fn get_size_form_ast_type(&mut self, value_type: &ValueType) -> usize {
        match value_type {
            ValueType::Char => 8,
            ValueType::Shorted =>16,
            ValueType::UnsignedShort => 16,
            ValueType::Int => 32,
            ValueType::Unsigned => 32,
            ValueType::Long => 64,
            ValueType::UnsignedLong => 64,
            ValueType::LongLong => 64,
            ValueType::UnsignedLongLong => 64,
            ValueType::Float => 32,
            ValueType::Double => 64,
            ValueType::PointerType(_) => 32,
            ValueType::Struct(struct_type) => {
                match struct_type.as_ref() {
                    StructType::Declar(declar) => {
                        match self.struct_size_table.get(declar.id.name.as_ref()) {
                            Some(size) => size.clone(),
                            None => unreachable!("[Unreach Error]: when get a size from a struct type declar, there must be struct already declar, it ensure by typechecker"),
                        }
                    },
                    StructType::Def(def) => {
                        if let Some(size) = self.struct_size_table.get(def.id.as_ref().unwrap().name.as_ref())  {
                            size.clone()
                        }else {
                            let mut size = 0;
                            for declarator in &def.declarator {
                                size += self.get_size_form_ast_type(&declarator.value_type);
                            }
                            self.struct_size_table.insert(def.id.as_ref().unwrap().name.to_string(), size);
                            size
                        }
                    }
                }
            }
            _ => todo!()
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
        _ => panic!()
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
