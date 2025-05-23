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
        size: Value,
        align: usize,
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
