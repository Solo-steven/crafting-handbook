use crate::ir::function::Function;
use crate::ir::instructions::{InstructionData, OpCode};
use crate::ir::value::{Immi, IrValueType, Value, ValueData};

pub(super) fn get_lhs_value(inst: &InstructionData) -> Option<Value> {
    match inst {
        #[rustfmt::skip]
        InstructionData::Add { dst, .. } |
        InstructionData::Sub { dst, .. } |
        InstructionData::Mul { dst, .. } |
        InstructionData::Divide { dst, .. } |
        InstructionData::Reminder { dst, .. } |
        InstructionData::FAdd { dst, .. } |
        InstructionData::FSub { dst, .. } |
        InstructionData::FMul { dst, .. } |
        InstructionData::FDivide { dst, .. } |
        InstructionData::FReminder { dst, .. } |
        InstructionData::BitwiseAnd { dst, .. } |
        InstructionData::BitwiseOR { dst, .. } |
        InstructionData::LogicalAnd { dst, .. } |
        InstructionData::LogicalOR { dst, .. } |
        InstructionData::ShiftLeft { dst, .. } |
        InstructionData::ShiftRight { dst, .. }|
        InstructionData::Fcmp {  dst, .. } |
        InstructionData::Icmp { dst,  .. } |
        InstructionData::Move { dst, .. } |
        InstructionData::Neg {  dst, .. } |
        InstructionData::BitwiseNot { dst, .. } |
        InstructionData::LogicalNot { dst, .. } |
        InstructionData::ToU8 { dst, .. } |
        InstructionData::ToU16 { dst, .. } |
        InstructionData::ToU32 { dst, .. } |
        InstructionData::ToU64 { dst, .. } |
        InstructionData::ToI16 { dst, .. } |
        InstructionData::ToI32 { dst, .. } |
        InstructionData::ToI64 { dst, .. } |
        InstructionData::ToF32 { dst, .. } |
        InstructionData::ToF64 { dst, .. } |
        InstructionData::ToAddress { dst, .. } |
        InstructionData::Phi { dst, .. } |
        InstructionData::LoadRegister { dst, .. } |
        InstructionData::StackAlloc { dst, .. } => {
            Some(dst.clone())
        }
        // call function might have side effect (ex: include load and store)
        InstructionData::Call { dst, .. }  => {
            dst.clone()
        }
        // branch relate instruction should not be code motion
        InstructionData::Jump {  .. } |
        InstructionData::BrIf { .. } |
        InstructionData::Ret { .. } |
        // side effect of memory should not be code motion
        InstructionData::StoreRegister { .. } |
        // comment 
        InstructionData::Comment(_) => None,
    }
}

pub fn unwrap_to_immi(value: &Value, function: &Function) -> Immi {
    if let ValueData::Immi(immi) = &function.values.get(value).unwrap() {
        immi.clone()
    } else {
        unreachable!();
    }
}

pub fn compute_unary_immi(immi: Immi, opcode: &OpCode) -> Immi {
    match *opcode {
        OpCode::Mov => immi,
        OpCode::Neg => match immi {
            Immi::F32(f32_immi) => Immi::F32(-f32_immi),
            Immi::F64(f64_immi) => Immi::F64(-f64_immi),
            Immi::I16(i16_immi) => Immi::I16(-i16_immi),
            Immi::I32(i32_immi) => Immi::I32(-i32_immi),
            Immi::I64(i64_immi) => Immi::I64(-i64_immi),
            _ => unreachable!(),
        },
        OpCode::BitwiseNot => match immi {
            Immi::I16(i16_immi) => Immi::I16(!i16_immi),
            Immi::I32(i32_immi) => Immi::I32(!i32_immi),
            Immi::I64(i64_immi) => Immi::I64(!i64_immi),
            Immi::U8(u8_immi) => Immi::U8(!u8_immi),
            Immi::U16(u16_immi) => Immi::U16(!u16_immi),
            Immi::U32(u32_immi) => Immi::U32(!u32_immi),
            Immi::U64(u64_immi) => Immi::U64(!u64_immi),
            _ => unreachable!(),
        },
        OpCode::LogicalNot => {
            todo!()
        }
        _ => unreachable!("[Unreach case]"),
    }
}

pub fn compute_binary_immi(immi_1: Immi, immi_2: Immi, opcode: &OpCode, ir_type: &IrValueType) -> Immi {
    match *opcode {
        OpCode::Add => {
            let result = immi_1.get_data_as_i128() + immi_2.get_data_as_i128();
            convert_i128_to_target_ir_type_immi(result, ir_type)
        }
        OpCode::Sub => {
            let result = immi_1.get_data_as_i128() - immi_2.get_data_as_i128();
            convert_i128_to_target_ir_type_immi(result, ir_type)
        }
        OpCode::Mul => {
            let result = immi_1.get_data_as_i128() * immi_2.get_data_as_i128();
            convert_i128_to_target_ir_type_immi(result, ir_type)
        }
        OpCode::Divide => {
            let result = immi_1.get_data_as_i128() / immi_2.get_data_as_i128();
            convert_i128_to_target_ir_type_immi(result, ir_type)
        }
        OpCode::Reminder => {
            let result = immi_1.get_data_as_i128() % immi_2.get_data_as_i128();
            convert_i128_to_target_ir_type_immi(result, ir_type)
        }
        OpCode::FAdd => {
            let result = immi_1.get_data_as_f64() + immi_2.get_data_as_f64();
            convert_f64_to_target_ir_type_immi(result, ir_type)
        }
        OpCode::FSub => {
            let result = immi_1.get_data_as_f64() - immi_2.get_data_as_f64();
            convert_f64_to_target_ir_type_immi(result, ir_type)
        }
        OpCode::FMul => {
            let result = immi_1.get_data_as_f64() * immi_2.get_data_as_f64();
            convert_f64_to_target_ir_type_immi(result, ir_type)
        }
        OpCode::FDivide => {
            let result = immi_1.get_data_as_f64() / immi_2.get_data_as_f64();
            convert_f64_to_target_ir_type_immi(result, ir_type)
        }
        OpCode::FReminder => {
            let result = immi_1.get_data_as_f64() % immi_2.get_data_as_f64();
            convert_f64_to_target_ir_type_immi(result, ir_type)
        }
        OpCode::BitwiseAnd => {
            let result = immi_1.get_data_as_i128() & immi_2.get_data_as_i128();
            convert_i128_to_target_ir_type_immi(result, ir_type)
        }
        OpCode::BitwiseOR => {
            let result = immi_1.get_data_as_i128() | immi_2.get_data_as_i128();
            convert_i128_to_target_ir_type_immi(result, ir_type)
        }
        OpCode::LogicalAnd => {
            todo!()
        }
        OpCode::LogicalOR => {
            todo!()
        }
        OpCode::ShiftLeft => {
            let result = immi_1.get_data_as_i128() << immi_2.get_data_as_i128();
            convert_i128_to_target_ir_type_immi(result, ir_type)
        }
        OpCode::ShiftRight => {
            let result = immi_1.get_data_as_i128() >> immi_2.get_data_as_i128();
            convert_i128_to_target_ir_type_immi(result, ir_type)
        }
        OpCode::Fcmp => {
            todo!()
        }
        OpCode::Icmp => {
            todo!()
        }
        _ => unreachable!(),
    }
}

fn convert_i128_to_target_ir_type_immi(val: i128, ir_type: &IrValueType) -> Immi {
    match ir_type {
        IrValueType::U8 => Immi::U8(val as u8),
        IrValueType::U16 => Immi::U16(val as u16),
        IrValueType::U32 => Immi::U32(val as u32),
        IrValueType::U64 => Immi::U64(val as u64),
        IrValueType::I16 => Immi::I16(val as i16),
        IrValueType::I32 => Immi::I32(val as i32),
        IrValueType::I64 => Immi::I64(val as i64),
        _ => unreachable!(),
    }
}

fn convert_f64_to_target_ir_type_immi(val: f64, ir_type: &IrValueType) -> Immi {
    match ir_type {
        IrValueType::F32 => Immi::F32(val as f32),
        IrValueType::F64 => Immi::F64(val as f64),
        _ => unreachable!(),
    }
}
