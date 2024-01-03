use std::collections::HashMap;
use crate::ir::function::*;
use crate::ir::instructions::*;

pub struct CopyPropagationPass;

impl CopyPropagationPass {
    pub fn new() -> Self {
        Self {}
    }

    pub fn process(&mut self, function: &mut Function) {
        let mut copy_insts = Vec::new();
        let mut replace_value_map = HashMap::new();
        for (block_id, block) in function.blocks.iter() {
            for inst_id in &block.instructions {
                let inst = function.instructions.get(inst_id).unwrap();
                if let InstructionData::Move { dst, src, .. } = inst {
                    replace_value_map.insert(dst.clone(), src.clone());
                    copy_insts.push((block_id.clone(), inst_id.clone(),));
                }
            }
        }
        for (block, inst) in copy_insts {
            function.remove_inst_from_block(&block, &inst);
        }
        for inst in function.instructions.values_mut() {
            match inst {
                InstructionData::Add { src1, src2, .. } |
                InstructionData::Sub { src1, src2, .. } |
                InstructionData::Mul { src1, src2, .. } |
                InstructionData::Divide { src1, src2, .. } |
                InstructionData::Reminder {  src1, src2, .. } |
                InstructionData::FAdd {  src1, src2, .. } |
                InstructionData::FSub {  src1, src2, .. } |
                InstructionData::FMul { src1, src2, .. } |
                InstructionData::FDivide { src1, src2, .. } |
                InstructionData::FReminder {  src1, src2, .. } |
                InstructionData::BitwiseAnd {  src1, src2, .. } |
                InstructionData::BitwiseOR {  src1, src2, .. } |
                InstructionData::LogicalAnd {  src1, src2, .. } |
                InstructionData::LogicalOR {  src1, src2, .. }  |
                InstructionData::ShiftLeft {  src1, src2, .. } |
                InstructionData::ShiftRight {  src1, src2, .. } |
                InstructionData::Icmp { src1, src2, .. }  | 
                InstructionData::Fcmp { src1, src2, .. } => {
                    if let Some(src) = replace_value_map.get(src1) {
                        *src1 = src.clone()
                    };
                    if let Some(src) = replace_value_map.get(src2) {
                        *src2 = src.clone()
                    };
                },
                InstructionData::Neg { src, .. } |
                InstructionData::BitwiseNot {  src, .. } |
                InstructionData::LogicalNot { src, .. } |
                InstructionData::ToU8 {  src, .. } |
                InstructionData::ToU16 {  src, .. } |
                InstructionData::ToU32 { src, .. } |
                InstructionData::ToU64 {  src, .. } |
                InstructionData::ToI16 {  src, .. } |
                InstructionData::ToI32 {  src, .. } |
                InstructionData::ToI64 {  src, .. } |
                InstructionData::ToF32 {  src, .. } |
                InstructionData::ToF64 {  src, .. } | 
                InstructionData::ToAddress {  src, .. } => {
                    if let Some(replace_src) = replace_value_map.get(src) {
                        *src = replace_src.clone()
                    };
                }
                InstructionData::BrIf { test, ..} => {
                    if let Some(src) = replace_value_map.get(test) {
                        *test = src.clone()
                    };
                }
                InstructionData::Call { params , ..} => {
                    for param in params {
                        if let Some(src) = replace_value_map.get(param) {
                            *param = src.clone()
                        };
                    }
                }
                InstructionData::Ret { value, .. } => {
                    if let Some(val) = value {
                        if let Some(src) = replace_value_map.get(val) {
                            *val = src.clone();
                        }
                    }
                }
                InstructionData::Phi{ from, ..  } => {
                    for (_, value) in from {
                        if let Some(src) = replace_value_map.get(value) {
                            *value = src.clone()
                        }
                    }
                }
                InstructionData::Comment(_)  | 
                InstructionData::Move { .. } | 
                InstructionData::LoadRegister { .. } |
                InstructionData::StoreRegister { .. } |
                InstructionData::StackAlloc { .. } |
                InstructionData::Jump {..} 
                => {}
            }
        }
    }
}