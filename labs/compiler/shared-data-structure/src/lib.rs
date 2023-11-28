pub mod create_graph;
use serde::{Serialize, Deserialize};
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ControlFlow {
    pub basic_block: Vec<BasicBlock>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BasicBlock {
    pub id: usize,
    pub instructions: Vec<Instruction>,
    pub successor: Vec<usize>, 
    pub predecessor: Vec<usize>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Instruction {
    BinInst(BinaryInstruction),
    UnaryInst(UnaryInstruction),
    Label(Label),
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Hash, Eq)]
pub enum IdentifierOrConst {
    Identifier(Identifier),
    Const(usize)
}
pub type Identifier = String;
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct UnaryInstruction {
    pub src: IdentifierOrConst,
    pub dst: Identifier,
    pub ops: UnaryOps,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize,  Hash, Eq)]
pub enum UnaryOps {
    Neg,
    Positve,
    LogicalNot,
    Copy,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Label (pub String);
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BinaryInstruction {
    pub src1: IdentifierOrConst,
    pub src2: IdentifierOrConst,
    pub dst: Identifier,
    pub ops: BinaryOps
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Hash, Eq)]
pub enum BinaryOps {
    Add,
    Sub,
    Mul,
    Divide,
    Mod,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct JumpInstruction {
    dst: Label,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BrInstruction {
    pub src1: IdentifierOrConst,
    pub src2: IdentifierOrConst,
    pub flag: BrFlag,
    pub conseq: Label,
    pub alter: Label
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum BrFlag {
    Eq,
    Neq,
    Gt,
    Lt,
    Gteq,
    Lteq
}