/**
 *  This mod create basic data structure for
 *  every arrch64 instruction set we need for
 *  generate basic arrch64 instruction.
 */
use rustyc_optimizer::ir::value::*;
pub struct Arrch64Instruction {
    pub opcode: Arrch64OpCode,
    pub srcs: Vec<Value>,
    pub dst: Value,
    pub next: Option<Box<Arrch64Instruction>>,
}

pub struct Arrch64OpCode {}

pub struct Arrch64Module {}

pub struct Arrch64Function {}

pub struct Arrch64BasicBlock {
    pub precessors: usize,
    pub sucessors: usize,
    pub head: Arrch64Instruction,
    pub len: usize,
}
