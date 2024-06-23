use crate::ir::function::BasicBlock;
use crate::ir::instructions::{CmpFlag, InstructionData, OpCode};
use crate::ir::value::Value;
use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum RightHandSideInst {
    Binary((Value, Value, OpCode)),
    Unary((Value, OpCode)),
    Cmp((Value, Value, CmpFlag)),
    Phi(Vec<(BasicBlock, Value)>),
}

pub fn get_right_hand_side_inst_key(
    instruction: &InstructionData,
) -> Option<(RightHandSideInst, Value)> {
    match instruction {
        InstructionData::Add {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::Sub {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::Mul {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::Divide {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::Reminder {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::FAdd {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::FSub {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::FMul {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::FDivide {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::FReminder {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::BitwiseAnd {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::BitwiseOR {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::LogicalAnd {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::LogicalOR {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::ShiftLeft {
            opcode,
            src1,
            src2,
            dst,
        }
        | InstructionData::ShiftRight {
            opcode,
            src1,
            src2,
            dst,
        } => Some((
            RightHandSideInst::Binary((src1.clone(), src2.clone(), opcode.clone())),
            dst.clone(),
        )),
        InstructionData::Neg { opcode, src, dst }
        | InstructionData::BitwiseNot { opcode, src, dst }
        | InstructionData::LogicalNot { opcode, src, dst }
        | InstructionData::ToU8 { opcode, src, dst }
        | InstructionData::ToU16 { opcode, src, dst }
        | InstructionData::ToU32 { opcode, src, dst }
        | InstructionData::ToU64 { opcode, src, dst }
        | InstructionData::ToI16 { opcode, src, dst }
        | InstructionData::ToI32 { opcode, src, dst }
        | InstructionData::ToI64 { opcode, src, dst }
        | InstructionData::ToF32 { opcode, src, dst }
        | InstructionData::ToF64 { opcode, src, dst }
        | InstructionData::ToAddress { opcode, src, dst } => Some((
            RightHandSideInst::Unary((src.clone(), opcode.clone())),
            dst.clone(),
        )),
        InstructionData::Icmp {
            opcode: _,
            flag,
            src1,
            src2,
            dst,
        }
        | InstructionData::Fcmp {
            opcode: _,
            flag,
            src1,
            src2,
            dst,
        } => Some((
            RightHandSideInst::Cmp((src1.clone(), src2.clone(), flag.clone())),
            dst.clone(),
        )),
        InstructionData::Phi { from, dst, .. } => {
            Some((RightHandSideInst::Phi(from.clone()), dst.clone()))
        }
        _ => None,
    }
}

pub struct ScopeCacheTable {
    current_index: usize,
    table: Vec<HashMap<RightHandSideInst, Value>>,
}

impl ScopeCacheTable {
    pub fn new() -> Self {
        Self {
            current_index: 0,
            table: vec![HashMap::new()],
        }
    }
    pub fn insert(&mut self, key: RightHandSideInst, value: Value) {
        let table = &mut self.table[self.current_index];
        table.insert(key, value);
    }
    pub fn get(&self, key: &RightHandSideInst) -> Option<&Value> {
        for table in &self.table {
            if let Some(val) = table.get(key) {
                return Some(val);
            }
        }
        return None;
    }
    pub fn enter_scope(&mut self) {
        self.current_index += 1;
        self.table.push(HashMap::new());
    }
    pub fn exit_scope(&mut self) {
        self.current_index -= 1;
        self.table.pop();
    }
}
