use std::collections::HashSet;

use crate::entities::function::Function;
use crate::entities::immediate::Immediate;
use crate::entities::instruction::opcode::{CmpFlag, OpCode};
use crate::entities::instruction::Instruction;
use crate::entities::instruction::InstructionData;
use crate::entities::r#type::ValueType;
use crate::entities::value::Value;

#[derive(Debug, PartialEq, Clone, Eq, Hash)]
pub enum InstOperandKey {
    Unary(OpCode, Value),
    BinaryI(OpCode, Value, ValueType, [u8; 8]),
    Binary(OpCode, Value, Value),
    Cmp(OpCode, CmpFlag, Value, Value),
}

macro_rules! convert_to_immi {
    ($value_type:expr, $bytes:expr) => {
        match $value_type {
            ValueType::U8 => {
                // U8 is just the first byte
                Immediate::U8($bytes[0])
            }
            ValueType::U16 => {
                // Take the first 2 bytes in little‐endian order
                let arr: [u8; 2] = [$bytes[0], $bytes[1]];
                Immediate::U16(u16::from_le_bytes(arr))
            }
            ValueType::U32 => {
                // Take the first 4 bytes in little‐endian order
                let arr: [u8; 4] = [$bytes[0], $bytes[1], $bytes[2], $bytes[3]];
                Immediate::U32(u32::from_le_bytes(arr))
            }
            ValueType::U64 => {
                // $bytes is assumed to be [u8; 8]
                Immediate::U64(u64::from_le_bytes($bytes))
            }
            ValueType::I16 => {
                // Take the first 2 bytes in little‐endian order
                let arr: [u8; 2] = [$bytes[0], $bytes[1]];
                Immediate::I16(i16::from_le_bytes(arr))
            }
            ValueType::I32 => {
                // Take the first 4 bytes in little‐endian order
                let arr: [u8; 4] = [$bytes[0], $bytes[1], $bytes[2], $bytes[3]];
                Immediate::I32(i32::from_le_bytes(arr))
            }
            ValueType::I64 => {
                // $bytes is [u8; 8]
                Immediate::I64(i64::from_le_bytes($bytes))
            }
            ValueType::F32 => {
                // Take the first 4 bytes as a little‐endian IEEE‐754 float32
                let arr: [u8; 4] = [$bytes[0], $bytes[1], $bytes[2], $bytes[3]];
                Immediate::F32(f32::from_le_bytes(arr))
            }
            ValueType::F64 => {
                // $bytes is [u8; 8]
                Immediate::F64(f64::from_le_bytes($bytes))
            }
            _ => panic!("Unsupported ValueType for immediate conversion"),
        }
    };
}
impl InstOperandKey {
    pub fn contain_operand(&self, operand: Value) -> bool {
        match self {
            InstOperandKey::Unary(_op_code, value) => *value == operand,
            InstOperandKey::Binary(_op_code, value, value1) => *value == operand || *value1 == operand,
            InstOperandKey::BinaryI(_op_code, value, ..) => *value == operand,
            InstOperandKey::Cmp(_op_code, _cmp_flag, value, value1) => *value == operand || *value1 == operand,
        }
    }
    pub fn to_inst_data(&self) -> InstructionData {
        match self {
            InstOperandKey::Unary(op_code, value) => InstructionData::Unary {
                opcode: *op_code,
                value: *value,
            },
            InstOperandKey::BinaryI(op_code, value, value_type, bytes) => InstructionData::BinaryI {
                opcode: *op_code,
                value: *value,
                imm: convert_to_immi!(value_type, *bytes),
            },
            InstOperandKey::Binary(op_code, value, value1) => InstructionData::Binary {
                opcode: *op_code,
                args: [*value, *value1],
            },
            InstOperandKey::Cmp(op_code, cmp_flag, value, value1) => match *op_code {
                OpCode::Fcmp => InstructionData::Fcmp {
                    opcode: *op_code,
                    flag: *cmp_flag,
                    args: [*value, *value1],
                },
                OpCode::Icmp => InstructionData::Icmp {
                    opcode: *op_code,
                    flag: *cmp_flag,
                    args: [*value, *value1],
                },
                _ => unreachable!(),
            },
        }
    }
    pub fn fmt_key(&self) -> String {
        match self {
            InstOperandKey::Unary(op_code, value) => {
                format!("{} reg{}", op_code, value.0)
            }
            InstOperandKey::BinaryI(op_code, value, value_type, bytes) => {
                format!("{} reg{} {}", op_code, value.0, convert_to_immi!(value_type, *bytes))
            }
            InstOperandKey::Binary(op_code, value, value1) => {
                format!("{} reg{} reg{}", op_code, value.0, value1.0)
            }
            InstOperandKey::Cmp(op_code, cmp_flag, value, value1) => {
                format!("{} {} reg{} reg{}", op_code, cmp_flag, value.0, value1.0)
            }
        }
    }
    pub fn get_value_type(&self, function: &Function) -> ValueType {
        match self {
            InstOperandKey::Unary(_op_code, value) => function.value_type(*value).clone(),
            InstOperandKey::BinaryI(_op_code, _value, value_type, _bytes) => value_type.clone(),
            InstOperandKey::Binary(_op_code, value, _value1) => function.value_type(*value).clone(),
            InstOperandKey::Cmp(_op_code, _cmp_flag, value, _value1) => function.value_type(*value).clone(),
        }
    }
}

impl InstructionData {
    pub fn to_inst_operand_key(&self) -> Option<InstOperandKey> {
        match self.clone() {
            InstructionData::Unary { opcode, value } => Some(InstOperandKey::Unary(opcode, value)),
            InstructionData::BinaryI { opcode, value, imm } => Some(InstOperandKey::BinaryI(
                opcode,
                value,
                imm.get_value_type(),
                imm.get_bytes(),
            )),
            InstructionData::Convert { opcode, src } => Some(InstOperandKey::Unary(opcode, src)),
            InstructionData::Binary { opcode, args } => Some(InstOperandKey::Binary(opcode, args[0], args[1])),
            InstructionData::Icmp { opcode, flag, args } => Some(InstOperandKey::Cmp(opcode, flag, args[0], args[1])),
            InstructionData::Fcmp { opcode, flag, args } => Some(InstOperandKey::Cmp(opcode, flag, args[0], args[1])),
            _ => None,
        }
    }
    pub fn match_inst_operand_key(&self, inst_operand_key: &InstOperandKey) -> bool {
        let self_key = self.to_inst_operand_key().unwrap();
        self_key == *inst_operand_key
    }
}

pub fn insts_to_keys(insts: Vec<Instruction>, function: &Function) -> HashSet<InstOperandKey> {
    let mut keys = HashSet::new();
    for inst in insts {
        let inst_data = function.get_inst_data(inst);
        if let Some(key) = inst_data.to_inst_operand_key() {
            keys.insert(key);
        }
    }
    keys
}
