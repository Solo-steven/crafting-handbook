use crate::ir::{instructions::InstructionData, value::Value};

pub(super) fn get_rhs_values(inst: &InstructionData) -> Vec<Value> {
    match inst {
        #[rustfmt::skip]
        InstructionData::Add { src1, src2, .. } |
        InstructionData::Sub { src1, src2, .. } |
        InstructionData::Mul { src1, src2, .. } |
        InstructionData::Divide { src1, src2, .. } |
        InstructionData::Reminder { src1, src2, .. } |
        InstructionData::FAdd { src1, src2, .. } |
        InstructionData::FSub { src1, src2, .. } |
        InstructionData::FMul { src1, src2, .. } |
        InstructionData::FDivide { src1, src2, .. } |
        InstructionData::FReminder { src1, src2, .. } |
        InstructionData::BitwiseAnd { src1, src2, .. } |
        InstructionData::BitwiseOR { src1, src2, .. } |
        InstructionData::LogicalAnd { src1, src2, .. } |
        InstructionData::LogicalOR { src1, src2, .. } |
        InstructionData::ShiftLeft { src1, src2, .. } |
        InstructionData::ShiftRight { src1, src2, .. }|
        InstructionData::Fcmp {  src1, src2, .. } |
        InstructionData::Icmp { src1, src2,  .. } => {
            vec![src1.clone(), src2.clone()]
        }
        InstructionData::Move { src, .. }
        | InstructionData::Neg { src, .. }
        | InstructionData::BitwiseNot { src, .. }
        | InstructionData::LogicalNot { src, .. }
        | InstructionData::ToU8 { src, .. }
        | InstructionData::ToU16 { src, .. }
        | InstructionData::ToU32 { src, .. }
        | InstructionData::ToU64 { src, .. }
        | InstructionData::ToI16 { src, .. }
        | InstructionData::ToI32 { src, .. }
        | InstructionData::ToI64 { src, .. }
        | InstructionData::ToF32 { src, .. }
        | InstructionData::ToF64 { src, .. }
        | InstructionData::ToAddress { src, .. } => vec![src.clone()],
        InstructionData::Phi { from, .. } => from.iter().map(|f| f.1.clone()).collect::<Vec<_>>(),
        InstructionData::Call { params, .. } => params.clone(),
        // branch relate instruction should not be code motion
        InstructionData::Jump { .. } => vec![],
        InstructionData::BrIf { test, .. } => vec![test.clone()],
        InstructionData::Ret { value, .. } => {
            if let Some(val) = value {
                vec![val.clone()]
            } else {
                vec![]
            }
        }
        InstructionData::LoadRegister { base, offset, .. } => vec![base.clone(), offset.clone()],
        InstructionData::StoreRegister { base, offset, src, .. } => vec![src.clone(), offset.clone(), base.clone()],
        InstructionData::StackAlloc { size, .. } => vec![size.clone()],
        // comment
        InstructionData::Comment(_) => vec![],
    }
}
