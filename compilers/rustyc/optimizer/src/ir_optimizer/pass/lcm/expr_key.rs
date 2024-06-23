use std::collections::HashSet;
use crate::ir::instructions::{InstructionData, OpCode, CmpFlag};
use crate::ir::value::Value;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum ExpreKey {
    Binary((Value, Value, OpCode)),
    Unary((Value, OpCode)),
    Cmp((Value, Value, CmpFlag)),
}

pub type ExprValueNumber = u64;
pub type ExprValueNumberSet = HashSet<ExprValueNumber>;

pub fn get_expr_key_and_values(instruction: &InstructionData) -> Option<(ExpreKey, Vec<Value>)> {
    match instruction {
        InstructionData::Add { opcode, src1, src2, .. } |
        InstructionData::Sub { opcode, src1, src2, .. } |
        InstructionData::Mul { opcode, src1, src2, .. } |
        InstructionData::Divide { opcode, src1, src2, .. } |
        InstructionData::Reminder { opcode , src1, src2, .. } |
        InstructionData::FAdd { opcode , src1, src2, .. } |
        InstructionData::FSub { opcode , src1, src2, .. } |
        InstructionData::FMul { opcode, src1, src2, .. } |
        InstructionData::FDivide { opcode, src1, src2, .. } |
        InstructionData::FReminder { opcode , src1, src2, .. } |
        InstructionData::BitwiseAnd { opcode , src1, src2, .. } |
        InstructionData::BitwiseOR { opcode , src1, src2, .. } |
        InstructionData::LogicalAnd { opcode , src1, src2, .. } |
        InstructionData::LogicalOR { opcode , src1, src2, .. }  |
        InstructionData::ShiftLeft { opcode , src1, src2, .. } |
        InstructionData::ShiftRight { opcode , src1, src2, .. } => {
            Some((ExpreKey::Binary((src1.clone(), src2.clone(), opcode.clone())), vec![src1.clone(), src2.clone()]))
        },
        InstructionData::Neg { opcode, src, .. } |
        InstructionData::BitwiseNot { opcode , src, .. } |
        InstructionData::LogicalNot { opcode, src, .. } |
        InstructionData::ToU8 { opcode , src, .. } |
        InstructionData::ToU16 { opcode , src, .. } |
        InstructionData::ToU32 { opcode, src, .. } |
        InstructionData::ToU64 { opcode , src, .. } |
        InstructionData::ToI16 { opcode , src, .. } |
        InstructionData::ToI32 { opcode , src, .. } |
        InstructionData::ToI64 { opcode , src, .. } |
        InstructionData::ToF32 { opcode , src, .. } |
        InstructionData::ToF64 { opcode , src, .. } |
        InstructionData::ToAddress { opcode, src, .. } => {
            Some((ExpreKey::Unary((src.clone(), opcode.clone())), vec![src.clone()] ))
        },
        InstructionData::Icmp { opcode: _, flag, src1, src2, .. } |
        InstructionData::Fcmp { opcode: _, flag, src1, src2, .. }=> {
            Some((ExpreKey::Cmp((src1.clone(), src2.clone(), flag.clone())), vec![src1.clone(), src2.clone()]))
        }
        _ => None
    }
}
pub fn get_content_ref_of_set<'a>(hash_set: &'a ExprValueNumberSet ) -> HashSet<&'a ExprValueNumber> {
    hash_set.into_iter().map(|key| { key }).collect()
}
pub fn intersection_content_ref_sets<'a>(target_set: HashSet<&'a ExprValueNumber> , other_set: HashSet<&'a ExprValueNumber> ) -> HashSet<&'a ExprValueNumber>{
    target_set
        .intersection(&other_set)
        .into_iter()
        .map(|key| { *key })
        .collect()
}
pub fn union_content_ref_sets<'a>(target_set: HashSet<&'a ExprValueNumber> , other_set: HashSet<&'a ExprValueNumber> ) -> HashSet<&'a ExprValueNumber>{
    target_set
        .union(&other_set)
        .into_iter()
        .map(|key| { *key })
        .collect()
}
pub fn different_content_ref_sets<'a>(target_set: HashSet<&'a ExprValueNumber> , other_set: HashSet<&'a ExprValueNumber> ) -> HashSet<&'a ExprValueNumber>{
    target_set
        .difference(&other_set)
        .into_iter()
        .map(|key| { *key })
        .collect()
}

pub fn content_ref_set_to_own(hash_set: HashSet<&ExprValueNumber>) -> ExprValueNumberSet {
    hash_set
        .into_iter()
        .map(|key| { key.clone() })
        .collect()
}

pub fn get_dst_value(instruction: &InstructionData) -> Option<Value>{
    match instruction {
        InstructionData::Add { dst, .. } |
        InstructionData::Sub {  dst, .. } |
        InstructionData::Mul {  dst, .. } |
        InstructionData::Divide {  dst, .. } |
        InstructionData::Reminder { dst, .. } |
        InstructionData::FAdd { dst ,..} |
        InstructionData::FSub { dst ,..} |
        InstructionData::FMul {dst ,..} |
        InstructionData::FDivide {dst ,..} |
        InstructionData::FReminder { dst ,..} |
        InstructionData::BitwiseAnd { dst ,..} |
        InstructionData::BitwiseOR { dst ,..} |
        InstructionData::LogicalAnd { dst ,..} |
        InstructionData::LogicalOR { dst ,..}  |
        InstructionData::ShiftLeft { dst ,..} |
        InstructionData::ShiftRight { dst ,..} |
        InstructionData::Icmp { dst, .. } |
        InstructionData::Fcmp { dst, .. } |
        InstructionData::Move {  dst, .. } | 
        InstructionData::Phi { dst, .. }  |
        InstructionData::LoadRegister { dst, ..} |
        InstructionData::Neg { dst, .. } |
        InstructionData::BitwiseNot {  dst, .. } |
        InstructionData::LogicalNot { dst , ..} |
        InstructionData::ToU8 { dst , ..} |
        InstructionData::ToU16 { dst , ..} |
        InstructionData::ToU32 { dst , ..} |
        InstructionData::ToU64 { dst , ..} |
        InstructionData::ToI16 { dst , ..} |
        InstructionData::ToI32 { dst , ..} |
        InstructionData::ToI64 { dst , ..} |
        InstructionData::ToF32 { dst , ..} |
        InstructionData::ToF64 { dst , ..} |
        InstructionData::ToAddress { dst , ..} => {
            Some(dst.clone())
        },
        _ => None
    }
}