use crate::ir::{instructions::InstructionData, value::Value};

/// ## Helper function To Get Definition Value of Instruction
/// return a option vec of value,
/// - if the instruction can not be code motion, this function will return None.
/// - otherwise, it will return a vec of def value, the def value might contain const,
/// which is not in use-def table.
pub(super) fn get_rhs_values(inst: &InstructionData) -> Option<Vec<Value>> {
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
            Some(vec![src1.clone(), src2.clone()])
        },
        InstructionData::Move { src, .. } |
        InstructionData::Neg {  src, .. } |
        InstructionData::BitwiseNot { src, .. } |
        InstructionData::LogicalNot { src, .. } |
        InstructionData::ToU8 { src, .. } |
        InstructionData::ToU16 { src, .. } |
        InstructionData::ToU32 { src, .. } |
        InstructionData::ToU64 { src, .. } |
        InstructionData::ToI16 { src, .. } |
        InstructionData::ToI32 { src, .. } |
        InstructionData::ToI64 { src, .. } |
        InstructionData::ToF32 { src, .. } |
        InstructionData::ToF64 { src, .. } |
        InstructionData::ToAddress { src, .. } => Some(vec![src.clone()]),
        InstructionData::Phi { from, .. } => {
            Some(from.iter().map(|f| f.1.clone()).collect::<Vec<_>>())
        }
        // call function might have side effect (ex: include load and store)
        InstructionData::Call { .. } |
        // branch relate instruction should not be code motion
        InstructionData::Jump { .. } |
        InstructionData::BrIf { .. } |
        InstructionData::Ret { .. } |
        // side effect of memory should not be code motion
        InstructionData::LoadRegister { .. } |
        InstructionData::StoreRegister { .. } |
        InstructionData::StackAlloc { .. } |
        // comment 
        InstructionData::Comment(_) => None,
    }
}

/// ## Helper function to get left hand side of instruction
/// return a option of value
/// - Some, if instruction could be code motion
/// - None, if instruction could not be code motion.
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
        InstructionData::Phi { dst, .. } => {
            Some(dst.clone())
        }
        // call function might have side effect (ex: include load and store)
        InstructionData::Call { .. } |
        // branch relate instruction should not be code motion
        InstructionData::Jump { .. } |
        InstructionData::BrIf { .. } |
        InstructionData::Ret { .. } |
        // side effect of memory should not be code motion
        InstructionData::LoadRegister { .. } |
        InstructionData::StoreRegister { .. } |
        InstructionData::StackAlloc { .. } |
        // comment 
        InstructionData::Comment(_) => None,
    }
}
