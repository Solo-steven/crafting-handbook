use crate::entities::block::Block;
use crate::entities::function::FunctionRef;
use crate::entities::immediate::{Immediate, Offset};
use crate::entities::instruction::opcode::CmpFlag;
use crate::entities::instruction::opcode::OpCode;
use crate::entities::value::Value;

use super::constant::Constant;
use super::global_value::GlobalValue;

pub mod opcode;
/// ## Instruction
/// A reference to instruction in a function.
#[derive(Debug, PartialEq, Clone, Eq, Hash, Copy)]
pub struct Instruction(pub u32);
#[derive(Debug, PartialEq, Clone)]
pub enum InstructionData {
    // Const instruction
    UnaryConst {
        opcode: OpCode,
        constant: Constant,
    },
    Unary {
        opcode: OpCode,
        value: Value,
    },
    Binary {
        opcode: OpCode,
        args: [Value; 2],
    },
    BinaryI {
        opcode: OpCode,
        value: Value,
        imm: Immediate,
    },
    Move {
        opcode: OpCode,
        src: Value,
    },
    Icmp {
        opcode: OpCode,
        flag: CmpFlag,
        args: [Value; 2],
    },
    Fcmp {
        opcode: OpCode,
        flag: CmpFlag,
        args: [Value; 2],
    },
    // function call
    Call {
        opcode: OpCode,
        name: FunctionRef,
        params: Vec<Value>,
    },
    Ret {
        opcode: OpCode,
        value: Option<Value>,
    },
    // data type convert
    Convert {
        opcode: OpCode,
        src: Value,
    },
    // stack related
    StackAlloc {
        opcode: OpCode,
        size: Immediate,
        align: Immediate,
    },
    // memory instruction
    LoadRegister {
        opcode: OpCode,
        base: Value,
        offset: Offset,
    },
    StoreRegister {
        opcode: OpCode,
        base: Value,
        offset: Offset,
        src: Value,
    },
    GlobalLoad {
        opcode: OpCode,
        base: GlobalValue,
        offset: Offset,
    },
    GlobalStore {
        opcode: OpCode,
        base: GlobalValue,
        offset: Offset,
        src: Value,
    },
    // Control instructions
    BrIf {
        opcode: OpCode,
        test: Value,
        conseq: Block,
        alter: Block,
    },
    Jump {
        opcode: OpCode,
        dst: Block,
    },
    // Phi
    Phi {
        opcode: OpCode,
        from: Vec<(Block, Value)>,
    },
    // comment,
    Comment(String),
}

impl InstructionData {
    pub fn get_operands(&self) -> Vec<Value> {
        match self {
            InstructionData::UnaryConst { .. } => vec![],
            InstructionData::Unary { value, .. } => vec![value.clone()],
            InstructionData::Binary { args, .. } => args.to_vec(),
            InstructionData::BinaryI { value, .. } => vec![value.clone()],
            InstructionData::Move { src, .. } => vec![src.clone()],
            InstructionData::Icmp { args, .. } | InstructionData::Fcmp { args, .. } => args.to_vec(),
            InstructionData::Call { params, .. } => params.clone(),
            InstructionData::Ret { value, .. } => value.iter().cloned().collect(),
            InstructionData::Convert { src, .. } => vec![src.clone()],
            InstructionData::StackAlloc { .. } => vec![],
            InstructionData::LoadRegister { base, .. } | InstructionData::StoreRegister { base, .. } => {
                vec![base.clone()]
            }
            InstructionData::GlobalLoad { .. } | InstructionData::GlobalStore { .. } => vec![],
            InstructionData::BrIf { test, .. } => vec![test.clone()],
            InstructionData::Jump { .. } => vec![],
            InstructionData::Phi { from, .. } => from.iter().map(|(_, v)| v.clone()).collect(),
            InstructionData::Comment(_) => vec![],
        }
    }
    pub fn contain_operand(&self, operand: Value) -> bool {
        match self {
            InstructionData::UnaryConst { .. } => false,
            InstructionData::Unary { value, .. } => (*value) == operand,
            InstructionData::Binary { args, .. } => args.iter().any(|arg| *arg == operand),
            InstructionData::BinaryI { value, .. } => *value == operand,
            InstructionData::Move { src, .. } => *src == operand,
            InstructionData::Icmp { args, .. } | InstructionData::Fcmp { args, .. } => {
                args.iter().any(|arg| *arg == operand)
            }
            InstructionData::Call { params, .. } => params.iter().any(|param| *param == operand),
            InstructionData::Ret { value, .. } => value.iter().any(|value| *value == operand),
            InstructionData::Convert { src, .. } => *src == operand,
            InstructionData::StackAlloc { .. } => false,
            InstructionData::LoadRegister { base, .. } | InstructionData::StoreRegister { base, .. } => {
                *base == operand
            }
            InstructionData::GlobalLoad { .. } | InstructionData::GlobalStore { .. } => false,
            InstructionData::BrIf { test, .. } => *test == operand,
            InstructionData::Jump { .. } => false,
            InstructionData::Phi { from, .. } => from.iter().any(|(_, value)| *value == operand),
            InstructionData::Comment(_) => false,
        }
    }
    pub fn is_const(&self) -> bool {
        matches!(self, InstructionData::UnaryConst { .. })
    }
    pub fn is_branch(&self) -> bool {
        matches!(self, InstructionData::BrIf { .. } | InstructionData::Jump { .. })
    }
    pub fn has_side_effect(&self) -> bool {
        matches!(
            self,
            InstructionData::BrIf { .. }
                | InstructionData::Jump { .. }
                | InstructionData::Ret { .. }
                | InstructionData::Call { .. }
                | InstructionData::Comment(_)
                | InstructionData::Phi { .. }
                | InstructionData::LoadRegister { .. }
                | InstructionData::GlobalLoad { .. }
                | InstructionData::StoreRegister { .. }
                | InstructionData::GlobalStore { .. }
                | InstructionData::StackAlloc { .. }
        )
    }
}
