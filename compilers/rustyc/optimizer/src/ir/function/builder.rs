/// This moudle implement the instruction builder for the function
use crate::ir::instructions::*;
use crate::ir::function::*;
use crate::ir::value::*;

impl Function {
    /// Private method of add a register value
    pub fn add_register(&mut self, value_type: IrValueType) -> Value {
        let value_id = Value(self.next_temp_register_index);
        self.values.insert(value_id, ValueData::VirRegister(format!("t{}", self.next_temp_register_index)));
        self.value_types.insert(value_id, value_type);
        self.next_temp_register_index += 1;
        value_id
    }
    /// Private method for add inst id to block.
    fn add_inst_id_to_current_block(&mut self, inst_id: Instruction) {
        if let Some(block) = self.current_block {
            self.inst_map_block.insert(inst_id.clone(), block.clone());
            self.blocks.get_mut(&block).unwrap().instructions.push_back(inst_id);
        }else {
            panic!("Current block not set");
        }
    }
    fn check_value_pair_type_equal(&self, src1: Value, src2: Value, opcode: &OpCode) -> IrValueType {
        let type1 = self.get_value_ir_type(src1);
        let type2 = self.get_value_ir_type(src2);
        if type1 == type2{
            match opcode {
                OpCode::FAdd | OpCode::FDivide | OpCode::FReminder | OpCode::FMul | OpCode::Fcmp => {
                    match &type1 {
                        IrValueType::F32 | IrValueType::F64 => {}
                        _ => {panic!("float operation can not used in int") }
                    }
                }
                OpCode::Add | OpCode::Divide | OpCode::Reminder | OpCode::Mul | OpCode::Icmp => {
                    match &type1 {
                        IrValueType::F32 | IrValueType::F64 => {panic!("int operation can not used in float") }
                        _ => {}
                    }
                },
                _ => {}
            };
            type1    
        }else {
            panic!("instruction on two type value is not equal {}({:?}), {}({:?})", src1.0, type1,  src2.0, type2);
        }
    }
    #[inline]
    /// make binary instruction base on given opcode
    fn make_binary_inst(&mut self, opecode: OpCode, left: Value, right: Value) -> Value {
        let inst_id = Instruction(self.instructions.len());
        let value_type = self.check_value_pair_type_equal(left, right, &opecode);
        let dst = self.add_register(value_type);
        let inst = match opecode {
            OpCode::Add => InstructionData::Add { opcode: OpCode::Add, src1: left, src2: right, dst },
            OpCode::Sub => InstructionData::Sub { opcode: OpCode::Sub, src1: left, src2: right, dst },
            OpCode::Divide => InstructionData::Divide { opcode: OpCode::Mul, src1: left, src2: right, dst },
            OpCode::Mul => InstructionData::Mul { opcode: OpCode::Mul, src1: left, src2: right, dst },
            OpCode::Reminder => InstructionData::Reminder { opcode: OpCode::Reminder, src1: left, src2: right, dst },
            OpCode::FAdd => InstructionData::Add { opcode: OpCode::FAdd, src1: left, src2: right, dst },
            OpCode::FSub => InstructionData::Sub { opcode: OpCode::FSub, src1: left, src2: right, dst },
            OpCode::FDivide => InstructionData::Divide { opcode: OpCode::FDivide, src1: left, src2: right, dst },
            OpCode::FMul => InstructionData::Mul { opcode: OpCode::FMul, src1: left, src2: right, dst },
            OpCode::FReminder => InstructionData::Reminder { opcode: OpCode::Reminder, src1: left, src2: right, dst },
            OpCode::BitwiseAnd => InstructionData::BitwiseAnd { opcode: OpCode::BitwiseAnd, src1: left, src2: right, dst },
            OpCode::BitwiseOR => InstructionData::BitwiseOR { opcode: OpCode::BitwiseOR, src1: left, src2: right, dst },
            OpCode::ShiftLeft => InstructionData::ShiftLeft { opcode: OpCode::ShiftLeft, src1: left, src2: right, dst },
            OpCode::ShiftRight => InstructionData::ShiftRight { opcode: OpCode::ShiftRight, src1: left, src2: right, dst },
            OpCode::LogicalAnd => InstructionData::LogicalAnd { opcode: OpCode::LogicalAnd, src1: left, src2: right, dst },
            OpCode::LogicalOR => InstructionData::LogicalOR { opcode: OpCode::LogicalOR, src1: left, src2: right, dst },
            _ => {panic!()}
        };
        self.instructions.insert(inst_id, inst);
        self.add_inst_id_to_current_block(inst_id);
        dst
    }
    #[inline]
    /// make a unary instruction based on unary opcode.
    fn make_unary_inst(&mut self, opecode: OpCode, src: Value) -> Value {
        let inst_id = Instruction(self.instructions.len());
        let dst = self.add_register(self.get_value_ir_type(src));
        let inst =match opecode {
            OpCode::Neg => InstructionData::Neg { opcode: OpCode::Neg, src, dst },
            OpCode::LogicalNot => InstructionData::BitwiseNot { opcode: OpCode::BitwiseNot, src, dst },
            OpCode::BitwiseNot => InstructionData::LogicalNot { opcode: OpCode::LogicalNot, src, dst },
            _ => unreachable!(),
        };
        self.instructions.insert(inst_id, inst);
        self.add_inst_id_to_current_block(inst_id);
        dst
    }
    /// make convert instruction base on opcode
    fn make_convert_inst(&mut self, opecode: OpCode, src: Value) -> Value {
        let inst_id = Instruction(self.instructions.len());
        let target_type = match opecode.clone() {
            OpCode::ToU8 => IrValueType::U8,
            OpCode::ToU16 => IrValueType::I16,
            OpCode::ToU32 => IrValueType::U32,
            OpCode::ToU64 => IrValueType::U64,
            OpCode::ToI16 => IrValueType::I16,
            OpCode::ToI32 => IrValueType::I32,
            OpCode::ToI64 => IrValueType::I64,
            OpCode::ToF32 => IrValueType::F32,
            OpCode::ToF64 => IrValueType::F64,
            _ => {unreachable!()}
        };
        let dst = self.add_register(target_type.clone());
        let inst = match opecode {
            OpCode::ToU8 => InstructionData::ToU8 { opcode: OpCode::ToU8, src, dst },
            OpCode::ToU16 => InstructionData::ToU16 { opcode: OpCode::ToU16, src, dst },
            OpCode::ToU32 => InstructionData::ToU32 { opcode: OpCode::ToU32, src, dst },
            OpCode::ToU64 => InstructionData::ToU64 { opcode: OpCode::ToU64, src, dst },
            OpCode::ToI16 => InstructionData::ToI16 { opcode: OpCode::ToI16, src, dst },
            OpCode::ToI32 => InstructionData::ToI32 { opcode: OpCode::ToI32, src, dst },
            OpCode::ToI64 => InstructionData::ToI64 { opcode: OpCode::ToI64, src, dst },
            OpCode::ToF32 => InstructionData::ToF32 { opcode: OpCode::ToF32, src, dst },
            OpCode::ToF64 => InstructionData::ToF64 { opcode: OpCode::ToF64, src, dst },
            _ => unreachable!()
        };
        self.instructions.insert(inst_id, inst);
        self.add_inst_id_to_current_block(inst_id);
        dst
    }
    pub fn get_value_ir_type(&self, src: Value) -> IrValueType {
        match self.values.get(&src) {
            Some(node) => {
                match node {
                    ValueData::Immi(immi) => {
                        match immi {
                            Immi::U8(_) => IrValueType::U8,
                            Immi::U16(_) => IrValueType::U16,
                            Immi::U32(_) => IrValueType::U32,
                            Immi::U64(_) => IrValueType::U64,
                            Immi::I16(_) => IrValueType::I16,
                            Immi::I32(_) => IrValueType::I32,
                            Immi::I64(_) => IrValueType::I64,
                            Immi::F32(_) => IrValueType::F32,
                            Immi::F64(_) => IrValueType::F64,
                        }
                    }
                    ValueData::VirRegister(_) => {
                        self.value_types.get(&src).unwrap().clone()
                    }
                }
            }
            None => {unreachable!()}
        }
    }
    /// Create u8 const and insert into value list.
    pub fn create_u8_const(&mut self, data: u8) -> Value {
        let value_id =  Value(self.next_temp_register_index);
        self.next_temp_register_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::U8(data)));
        value_id
    }
    /// Create u16 const and insert into value list.
    pub fn create_u16_const(&mut self, data: u16) -> Value {
        let value_id =  Value(self.next_temp_register_index);
        self.next_temp_register_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::U16(data)));
        value_id
    }    
    /// Create u32 const and insert into value list.
    pub fn create_u32_const(&mut self, data: u32) -> Value {
        let value_id =  Value(self.next_temp_register_index);
        self.next_temp_register_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::U32(data)));
        value_id
    }
    /// Create u64 const and insert into value list.
    pub fn create_u64_const(&mut self, data: u64)-> Value {
        let value_id =  Value(self.next_temp_register_index);
        self.next_temp_register_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::U64(data)));
        value_id
    }
    /// Create i16 const and insert into value list.
    pub fn create_i16_const(&mut self, data: i16) -> Value {
        let value_id =  Value(self.next_temp_register_index);
        self.next_temp_register_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::I16(data)));
        value_id
    }   
    /// Create i32 const and insert into value list.
    pub fn create_i32_const(&mut self, data: i32) -> Value {
        let value_id =  Value(self.next_temp_register_index);
        self.next_temp_register_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::I32(data)));
        value_id
    }
    /// Create i64 const and insert into value list.
    pub fn create_i64_const(&mut self, data: i64) -> Value {
        let value_id =  Value(self.next_temp_register_index);
        self.next_temp_register_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::I64(data)));
        value_id
    }
    /// Create f32 const and insert into value list.
    pub fn create_f32_const(&mut self, data: f32) -> Value {
        let value_id =  Value(self.next_temp_register_index);
        self.next_temp_register_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::F32(data)));
        value_id
    }
    /// Create f64 const and insert into value list.
    pub fn create_f64_const(&mut self, data: f64) -> Value {
        let value_id = Value(self.next_temp_register_index);
        self.next_temp_register_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::F64(data)));
        value_id
    }
    /// Create add instruction with existed value.
    pub fn build_add_inst(&mut self, left: Value, right: Value) -> Value {
        self.make_binary_inst(OpCode::Add, left, right )
    }
    /// Create a sub instruction with existed value.
    pub fn build_sub_inst(&mut self, left: Value, right: Value) -> Value {
        self.make_binary_inst(OpCode::Sub, left, right )
    }
    /// Create a mul instruction with existed value.
    pub fn build_mul_inst(&mut self, left: Value, right: Value) -> Value {
        self.make_binary_inst(OpCode::Mul, left, right )
    }
    /// Create a divide instrcution with existed value.
    pub fn build_divide_inst(&mut self, left: Value, right: Value) -> Value {
        self.make_binary_inst(OpCode::Divide, left, right )
    }
    /// Create a reminder inst with existed value.
    pub fn build_reminder_inst(&mut self, left: Value, right: Value) -> Value {
        self.make_binary_inst(OpCode::Reminder, left, right )
    }
    /// Create fadd instruction with existed value.
    pub fn build_fadd_inst(&mut self, left: Value, right: Value) -> Value {
        self.make_binary_inst(OpCode::FAdd, left, right )
    }
    /// Create a fsub instruction with existed value.
    pub fn build_fsub_inst(&mut self, left: Value, right: Value) -> Value {
        self.make_binary_inst(OpCode::FSub, left, right )
    }
    /// Create a fmul instruction with existed value.
    pub fn build_fmul_inst(&mut self, left: Value, right: Value) -> Value {
        self.make_binary_inst(OpCode::FMul, left, right )
    }
    /// Create a fdivide instrcution with existed value.
    pub fn build_fdivide_inst(&mut self, left: Value, right: Value) -> Value {
        self.make_binary_inst(OpCode::FDivide, left, right )
    }
    /// Create a freminder inst with existed value.
    pub fn build_freminder_inst(&mut self, left: Value, right: Value) -> Value {
        self.make_binary_inst(OpCode::FReminder, left, right )
    }
    pub fn build_bitwise_and_inst(&mut self, left: Value, right: Value) -> Value  {
        self.make_binary_inst(OpCode::BitwiseAnd, left, right )
    }
    pub fn build_bitwise_or_inst(&mut self, left: Value, right: Value) -> Value  {
        self.make_binary_inst(OpCode::BitwiseOR, left, right )
    }
    pub fn build_shiftleft_inst(&mut self, left: Value, right: Value) -> Value  {
        self.make_binary_inst(OpCode::ShiftLeft, left, right )
    }
    pub fn build_shiftright_inst(&mut self, left: Value, right: Value) -> Value  {
        self.make_binary_inst(OpCode::ShiftRight, left, right )
    }
    pub fn build_logical_and_inst(&mut self, left: Value, right: Value) -> Value  {
        self.make_binary_inst(OpCode::LogicalAnd, left, right )
    }
    pub fn build_logical_or_inst(&mut self, left: Value, right: Value) -> Value  {
        self.make_binary_inst(OpCode::LogicalAnd, left, right )
    }
    pub fn build_bitwise_not(&mut self, src: Value) -> Value {
        self.make_unary_inst(OpCode::BitwiseNot, src )
    }
    pub fn build_logical_not(&mut self, src: Value) -> Value {
        self.make_unary_inst(OpCode::LogicalNot, src )
    }
    pub fn build_neg_inst(&mut self, src: Value) -> Value {
        self.make_unary_inst(OpCode::Neg, src )
    }
    pub fn build_to_u8_inst(&mut self, src: Value) -> Value {
        self.make_convert_inst(OpCode::ToU8, src )
    }
    pub fn build_to_u16_inst(&mut self, src: Value) -> Value {
        self.make_convert_inst(OpCode::ToU16, src)
    }
    pub fn build_to_u32_inst(&mut self, src: Value) -> Value {
        self.make_convert_inst(OpCode::ToU32, src )
    }
    pub fn build_to_u64_inst(&mut self, src: Value) -> Value {
        self.make_convert_inst(OpCode::ToU64, src )
    }
    pub fn build_to_i16_inst(&mut self, src: Value) -> Value {
        self.make_convert_inst(OpCode::ToI16, src)
    }
    pub fn build_to_i32_inst(&mut self, src: Value) -> Value {
        self.make_convert_inst(OpCode::ToI32, src )
    }
    pub fn build_to_i64_inst(&mut self, src: Value) -> Value {
        self.make_convert_inst(OpCode::ToI64, src )
    }
    pub fn build_to_f32_inst(&mut self, src: Value) -> Value {
        self.make_convert_inst(OpCode::ToF32, src )
    }
    pub fn build_to_f64_inst(&mut self, src: Value) -> Value {
        self.make_convert_inst(OpCode::ToF64, src )
    }
    pub fn build_mov_inst(&mut self, src: Value) -> Value  {
        let inst_id = Instruction(self.instructions.len());
        // TODO, dst can not be immi
        let dst = self.add_register(self.get_value_ir_type(src.clone()));
        self.instructions.insert(inst_id, InstructionData::Move { opcode: OpCode::Mov, src , dst  });
        self.add_inst_id_to_current_block(inst_id);
        dst 
    }
    pub fn build_icmp_inst(&mut self, src1: Value, src2: Value, flag: CmpFlag) -> Value {
        let inst_id = Instruction(self.instructions.len());
        let value_type = self.check_value_pair_type_equal(src1, src2, &OpCode::Icmp);
        let dst = self.add_register(value_type);
        self.instructions.insert(inst_id, InstructionData::Icmp { opcode: OpCode::Icmp, flag, src1, src2, dst});
        self.add_inst_id_to_current_block(inst_id);
        dst
    }
    pub fn build_fcmp_inst(&mut self, src1: Value, src2: Value, flag: CmpFlag) -> Value {
        let inst_id = Instruction(self.instructions.len());
        let value_type = self.check_value_pair_type_equal(src1, src2, &OpCode::Fcmp);
        let dst = self.add_register(value_type);
        self.instructions.insert(inst_id, InstructionData::Fcmp { opcode: OpCode::Fcmp, flag, src1, src2, dst});
        self.add_inst_id_to_current_block(inst_id);
        dst
    }
    pub fn build_stack_alloc_inst(&mut self, size: usize, align: usize) -> Value {
        let inst_id = Instruction(self.instructions.len());
        let dst = self.add_register(IrValueType::U32);
        self.instructions.insert(
            inst_id, 
            InstructionData::StackAlloc { 
                opcode: OpCode::StackAlloc, 
                size, align,
                dst,
            }
        );
        self.add_inst_id_to_current_block(inst_id);
        dst
    }
    pub fn build_load_register_inst(&mut self, base: Value, offset: Value, data_type: IrValueType) -> Value {
        let inst_id = Instruction(self.instructions.len());
        let dst = self.add_register(data_type.clone());
        self.instructions.insert(
            inst_id, 
            InstructionData::LoadRegister { opcode: OpCode::LoadRegister, base, offset, dst,data_type }
        );
        self.add_inst_id_to_current_block(inst_id);
        dst
    }
    pub fn build_store_register_inst(&mut self, src: Value, base: Value, offset: Value, data_type: IrValueType) {
        let inst_id = Instruction(self.instructions.len());
        self.instructions.insert(
            inst_id, 
            InstructionData::StoreRegister { opcode: OpCode::StoreRegister , base, offset, src, data_type },
        );
        self.add_inst_id_to_current_block(inst_id);
    }
    pub fn build_brif_inst(&mut self, test: Value, conseq: BasicBlock, alter: BasicBlock) {
        let inst_id = Instruction(self.instructions.len());
        self.instructions.insert(inst_id, InstructionData::BrIf { opcode: OpCode::BrIf, test, conseq, alter });
        self.add_inst_id_to_current_block(inst_id);
    }
    pub fn build_jump_inst(&mut self, dst: BasicBlock) {
        let inst_id = Instruction(self.instructions.len());
        self.instructions.insert(inst_id, InstructionData::Jump { opcode: OpCode::Jump, dst });
        self.add_inst_id_to_current_block(inst_id);
    }
}
