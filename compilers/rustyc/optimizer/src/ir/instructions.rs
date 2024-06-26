use crate::ir::function::BasicBlock;
use crate::ir::value::{IrValueType, Value};
use std::collections::HashMap;
#[derive(Debug, PartialEq, Clone, Hash, Eq, Copy)]
pub struct Instruction(pub usize);
#[derive(Debug, PartialEq, Clone)]
pub enum InstructionData {
    Add {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    Sub {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    Mul {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    Divide {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    Reminder {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    FAdd {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    FSub {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    FMul {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    FDivide {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    FReminder {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    BitwiseNot {
        opcode: OpCode,
        src: Value,
        dst: Value,
    },
    BitwiseOR {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    BitwiseAnd {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    ShiftLeft {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    ShiftRight {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    LogicalAnd {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    LogicalOR {
        opcode: OpCode,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    LogicalNot {
        opcode: OpCode,
        src: Value,
        dst: Value,
    },
    Move {
        opcode: OpCode,
        src: Value,
        dst: Value,
    },
    Neg {
        opcode: OpCode,
        src: Value,
        dst: Value,
    },
    Icmp {
        opcode: OpCode,
        flag: CmpFlag,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    Fcmp {
        opcode: OpCode,
        flag: CmpFlag,
        src1: Value,
        src2: Value,
        dst: Value,
    },
    // function call
    Call {
        opcode: OpCode,
        dst: Option<Value>,
        name: CalleeKind,
        params: Vec<Value>,
    },
    Ret {
        opcode: OpCode,
        value: Option<Value>,
    },
    // data type convert
    ToU8 {
        opcode: OpCode,
        src: Value,
        dst: Value,
    },
    ToU16 {
        opcode: OpCode,
        src: Value,
        dst: Value,
    },
    ToU32 {
        opcode: OpCode,
        src: Value,
        dst: Value,
    },
    ToU64 {
        opcode: OpCode,
        src: Value,
        dst: Value,
    },
    ToI16 {
        opcode: OpCode,
        src: Value,
        dst: Value,
    },
    ToI32 {
        opcode: OpCode,
        src: Value,
        dst: Value,
    },
    ToI64 {
        opcode: OpCode,
        src: Value,
        dst: Value,
    },
    ToF32 {
        opcode: OpCode,
        src: Value,
        dst: Value,
    },
    ToF64 {
        opcode: OpCode,
        src: Value,
        dst: Value,
    },
    ToAddress {
        opcode: OpCode,
        src: Value,
        dst: Value,
    },
    // stack related
    StackAlloc {
        opcode: OpCode,
        size: Value,
        align: usize,
        dst: Value,
        ir_type: IrValueType,
    },
    // memory instruction
    LoadRegister {
        opcode: OpCode,
        base: Value,
        offset: Value,
        dst: Value,
        data_type: IrValueType,
    },
    StoreRegister {
        opcode: OpCode,
        base: Value,
        offset: Value,
        src: Value,
        data_type: IrValueType,
    },
    // Control instructions
    BrIf {
        opcode: OpCode,
        test: Value,
        conseq: BasicBlock,
        alter: BasicBlock,
    },
    Jump {
        opcode: OpCode,
        dst: BasicBlock,
    },
    // Phi
    Phi {
        opcode: OpCode,
        dst: Value,
        from: Vec<(BasicBlock, Value)>,
    },
    // comment,
    Comment(String),
}

#[derive(Debug, PartialEq, Clone)]
pub enum CalleeKind {
    Id(String),
    Reg(Value),
}

pub type InstructionMap = HashMap<Instruction, InstructionData>;
#[derive(Debug, PartialEq, Clone, Eq, Hash)]
pub enum OpCode {
    Add,
    Sub,
    Mul,
    Divide,
    Reminder,
    FAdd,
    FSub,
    FMul,
    FDivide,
    FReminder,
    BitwiseNot,
    BitwiseOR,
    BitwiseAnd,
    ShiftLeft,
    ShiftRight,
    LogicalNot,
    LogicalOR,
    LogicalAnd,
    Mov,
    Neg,
    Icmp,
    Fcmp,
    // call
    Call,
    Ret,
    // convert
    ToU8,
    ToU16,
    ToU32,
    ToU64,
    ToI16,
    ToI32,
    ToI64,
    ToF32,
    ToF64,
    ToAddress,
    // stack relate
    StackAlloc,
    StackAddr,
    // memory instruction
    LoadRegister,
    StoreRegister,
    // Control instructions
    BrIf,
    Jump,
    // Phi Node
    Phi,
}
#[derive(Debug, PartialEq, Clone, Eq, Hash)]
pub enum CmpFlag {
    Eq,
    NotEq,
    Gt,
    Gteq,
    Lt,
    LtEq,
    Call,
}
