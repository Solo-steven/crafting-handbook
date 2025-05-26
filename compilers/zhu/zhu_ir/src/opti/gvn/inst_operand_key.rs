use crate::entities::instruction::opcode::{CmpFlag, OpCode};
use crate::entities::instruction::InstructionData;
use crate::entities::value::Value;

#[derive(Debug, PartialEq, Clone, Eq, Hash)]
pub enum InstOperandKey {
    Unary(OpCode, Value),
    Binary(OpCode, Value, Value),
    Cmp(OpCode, CmpFlag, Value, Value),
}

impl InstructionData {
    pub fn to_inst_operand_key(&self) -> Option<InstOperandKey> {
        match self.clone() {
            InstructionData::Unary { opcode, value } | InstructionData::BinaryI { opcode, value, .. } => {
                Some(InstOperandKey::Unary(opcode, value))
            }
            InstructionData::Convert { opcode, src } => Some(InstOperandKey::Unary(opcode, src)),
            InstructionData::Binary { opcode, args } => Some(InstOperandKey::Binary(opcode, args[0], args[1])),
            InstructionData::Icmp { opcode, flag, args } => Some(InstOperandKey::Cmp(opcode, flag, args[0], args[1])),
            InstructionData::Fcmp { opcode, flag, args } => Some(InstOperandKey::Cmp(opcode, flag, args[0], args[1])),
            _ => None,
        }
    }
}
