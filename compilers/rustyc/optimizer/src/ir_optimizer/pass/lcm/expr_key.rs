use std::collections::{HashMap, HashSet};
use crate::ir::function::{BasicBlock, Function};
use crate::ir::instructions::{Instruction, InstructionData, OpCode, CmpFlag};
use crate::ir::module::get_text_format_of_value;
use crate::ir_optimizer::anaylsis::dfs_ordering::DFSOrdering;
use crate::ir::value::Value;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum RightHandSideInst {
    Binary((Value, Value, OpCode)),
    Unary((Value, OpCode)),
    Cmp((Value, Value, CmpFlag)),
}

impl RightHandSideInst {
    pub fn get_value_ref(&self) -> Vec<&Value> {
        match self {
            RightHandSideInst::Binary((src1, src2, _)) | 
            RightHandSideInst::Cmp((src1, src2, _)) => {
                vec![src1, src2]
            }
            RightHandSideInst::Unary((src, _)) => {
                vec![src]
            }
        }  
    }
}
/// ## Right-Hand-Side-Expression Inst
/// Right hand side expression instruction set is used to storage 
/// hash of right hand side expression.
pub type RightHandSideInstructionSet = HashSet<RightHandSideInst>;

pub fn get_right_hand_side_inst_key(instruction: &InstructionData) -> (Option<RightHandSideInst> , Option<Value>){
    match instruction {
        InstructionData::Add { opcode, src1, src2, dst } |
        InstructionData::Sub { opcode, src1, src2, dst } |
        InstructionData::Mul { opcode, src1, src2, dst } |
        InstructionData::Divide { opcode, src1, src2, dst } |
        InstructionData::Reminder { opcode , src1, src2, dst } |
        InstructionData::FAdd { opcode , src1, src2, dst } |
        InstructionData::FSub { opcode , src1, src2, dst } |
        InstructionData::FMul { opcode, src1, src2, dst } |
        InstructionData::FDivide { opcode, src1, src2, dst } |
        InstructionData::FReminder { opcode , src1, src2, dst } |
        InstructionData::BitwiseAnd { opcode , src1, src2, dst } |
        InstructionData::BitwiseOR { opcode , src1, src2, dst } |
        InstructionData::LogicalAnd { opcode , src1, src2, dst } |
        InstructionData::LogicalOR { opcode , src1, src2, dst }  |
        InstructionData::ShiftLeft { opcode , src1, src2, dst } |
        InstructionData::ShiftRight { opcode , src1, src2, dst } => {
            
            (Some(RightHandSideInst::Binary((src1.clone(), src2.clone(), opcode.clone()))) , Some(dst.clone()))
        },
        InstructionData::Neg { opcode, src, dst } |
        InstructionData::BitwiseNot { opcode , src, dst } |
        InstructionData::LogicalNot { opcode, src, dst } |
        InstructionData::ToU8 { opcode , src, dst } |
        InstructionData::ToU16 { opcode , src, dst } |
        InstructionData::ToU32 { opcode, src, dst } |
        InstructionData::ToU64 { opcode , src, dst } |
        InstructionData::ToI16 { opcode , src, dst } |
        InstructionData::ToI32 { opcode , src, dst } |
        InstructionData::ToI64 { opcode , src, dst } |
        InstructionData::ToF32 { opcode , src, dst } |
        InstructionData::ToF64 { opcode , src, dst } |
        InstructionData::ToAddress { opcode, src, dst } => {
            (Some(RightHandSideInst::Unary((src.clone(), opcode.clone()))), Some(dst.clone()))
        },
        InstructionData::Icmp { opcode: _, flag, src1, src2, dst } |
        InstructionData::Fcmp { opcode: _, flag, src1, src2, dst }=> {
            (Some(RightHandSideInst::Cmp((src1.clone(), src2.clone(), flag.clone()))), Some(dst.clone()))
        }
        InstructionData::Move {  dst, .. } | 
        InstructionData::Phi { dst, .. }  |
        InstructionData::LoadRegister { dst, ..} => {
            (None, Some(dst.clone()))
        }
        _ => (None, None)
    }
}
pub fn get_all_right_hand_expr_set(function: &Function) -> RightHandSideInstructionSet {
    let mut set = HashSet::new();
    for (_, data) in &function.instructions {
        let tuple = get_right_hand_side_inst_key(data);
        if let Some(key) = tuple.0 {
            set.insert(key);   
        };
    }
    set
}