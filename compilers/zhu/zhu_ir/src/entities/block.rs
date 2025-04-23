use super::instruction::Instruction;
use std::collections::HashSet;
#[derive(Debug, PartialEq, Clone, Eq, Hash, Copy)]
pub struct Block(pub u32);
#[derive(Debug, PartialEq, Clone, Eq)]
pub struct BlockData {
    pub phis: HashSet<Instruction>,
    pub insts: HashSet<Instruction>,
}
