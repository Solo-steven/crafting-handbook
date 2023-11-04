#[derive(Debug, Clone, PartialEq)]
pub enum Instruction {
    // Arithmetic instructions
    Immi(ImmiInstruction),
    Add(AddInstruction),
    Addi(AddImmiInstruction),
    Sub,
    Subi,
    Mul,
    Muli,
    Div,
    Divi,
    Mod,
    Modi,
    And,
    Andi,
    Or,
    Ori,
    Xor,
    Xori,
    Shl,
    Shli,
    Shr,
    Shri,
    // Relation instructions
    Gt(GreaterThanInstruction),
    Gti(GreaterThanImmiInstruction),
    Gq(GreaterEqualInstruction),
    Gqi(GreaterEqualImmiInstruction),
    Lt(LessThanInstruction),
    Lti(LessThanImmiInstruction),
    Lq(LessEqualInstruction),
    Lqi(LessEqualImmiInstruction),
    Eq(EqualInstruction),
    Eqi(EqualImmiInstruction),
    Neq(NonEqualInstruction),
    Neqi(NonEqualImmiInstruction),
    // Control instruction
    Jsr(JSRInstruction),
    Ret(RetInstruction),
    Jump(JumpInstruction),
    Br(BranchInstruction),
    // Memory-related instruction
    Str(StoreRegisterInstruction),
    Ldr(LoadRegisterInstruction),
}
/// Unconditional jump to address
/// - format: `JMP <address>`
#[derive(Debug, Clone, PartialEq)]
pub struct JumpInstruction {
    pub address: u32,
}
/// Uncondition branch based on condition property 
/// to determinate
#[derive(Debug, Clone, PartialEq)]
pub struct  BranchInstruction {
    pub address: u32,
    pub condition: i8,
}
/// `JSR` instruction, jump to some sub routine, it would store program
/// counter to `return address` register and change program counter to 
/// address that JSR point to.
/// - format: `JSR <sub-routine>`
#[derive(Debug, Clone, PartialEq)]
pub struct JSRInstruction {
    pub adress: u32,
}
/// `RET` instruction, return from subrountine, it will get the value store 
/// in `return_address` register and seem it as a address of instruction.
#[derive(Debug, Clone, PartialEq)]
pub struct  RetInstruction;
/// `LSR` instruction, load value from base register + offset address 
/// from memory to target register (dst) register.
#[derive(Debug, Clone, PartialEq)]
pub struct LoadRegisterInstruction {
    pub base: u32,
    pub offset: u32,
    pub dst: u32,
}
/// `STR` instruction, store src register value (src) in memory address
/// base register + offset
/// format: `str <base> offset <src>`
#[derive(Debug, Clone, PartialEq)]
pub struct StoreRegisterInstruction {
    pub base: u32,
    pub offset: u32,
    pub src: u32,
}
/// `IMM` instruction load a const value to target register
/// - format: `IMM <dst> <value>`
#[derive(Debug, Clone, PartialEq)]
pub struct ImmiInstruction {
    pub value: u32,
    pub dst: u32,
}
#[derive(Debug, Clone, PartialEq)]
pub struct AddInstruction {
    pub src1: u32,
    pub src2: u32,
    pub dst: u32,
}
#[derive(Debug, Clone, PartialEq)]
pub struct AddImmiInstruction {
    pub src: u32,
    pub dst: u32,
    pub value: u32,
}
/// `GT` instruction, compare two register and store the result in 
/// condition flag. 
/// format: `GT <src1> <src2>` (src1 > src2)
#[derive(Debug, Clone, PartialEq)]
pub struct GreaterThanInstruction {
    pub src1: u32,
    pub src2: u32,
}
/// `GTI` instruction, compare  register with const and store the result in 
/// condition flag. 
/// format: `GTI <src> <const>` (src1 > const)
#[derive(Debug, Clone, PartialEq)]
pub struct GreaterThanImmiInstruction {
    pub src: u32,
    pub value: u32,
}
/// `Gq` instruction. compare two register and store the result in 
/// condition flag
/// format: `Gq <src1> <src2>` (src1 >= src2)
#[derive(Debug, Clone, PartialEq)]
pub struct  GreaterEqualInstruction {
    pub src1: u32,
    pub src2: u32,
}
/// `GQI` instruction. register with const and store the result in 
/// condition flag. 
/// format: `Gqi <src1> <const>` (src1 >= const)
#[derive(Debug, Clone, PartialEq)]
pub struct  GreaterEqualImmiInstruction {
    pub src: u32,
    pub value: u32,
}
/// `LT` instruction, compare two register and store the result in 
/// condition flag. 
/// format: `LT <src1> <src2>` (src1 < src2)
#[derive(Debug, Clone, PartialEq)]
pub struct LessThanInstruction {
    pub src1: u32,
    pub src2: u32,
}
/// `LTI` instruction, compare register with const and store the 
/// result in conditional flag.
/// format: `LTI <src1> <const>` (src1 < const)
#[derive(Debug, Clone, PartialEq)]
pub struct LessThanImmiInstruction {
    pub src: u32,
    pub value: u32,
}
/// `Lq` instruction. compare two register and store the result in 
/// condition flag
/// format: `Lq <src1> <src2>` (src1 <= src2)
#[derive(Debug, Clone, PartialEq)]
pub struct  LessEqualInstruction {
    pub src1: u32,
    pub src2: u32,
}
/// `Lqi` instruction.  compare register with const and store the 
/// result in conditional flag.
/// format: `Lqi <src1> <const>` (src1 <= const)
#[derive(Debug, Clone, PartialEq)]
pub struct  LessEqualImmiInstruction {
    pub src: u32,
    pub value: u32
}
/// `Eq` instruction, compare two register and store the result in 
/// condition flag. 
/// format: `eq <src1> <src2>` (src1 == src2)
#[derive(Debug, Clone, PartialEq)]
pub struct EqualInstruction {
    pub src1: u32,
    pub src2: u32,
}
/// `Eqi` instruction, compare register with const and store the 
/// result in condition flag.
/// format: `eqi <src1> <const>` (src1 == const)
#[derive(Debug, Clone, PartialEq)]
pub struct EqualImmiInstruction {
    pub src: u32,
    pub value: u32,
}
/// `Neq` instruction. compare two register and store the result in 
/// condition flag
/// format: `neq <src1> <src2>` (src1 != src2)
#[derive(Debug, Clone, PartialEq)]
pub struct  NonEqualInstruction {
    pub src1: u32,
    pub src2: u32,
}
/// `Neqi` instruction. compare register with const and store
/// the result in conditional flag.
/// format: `Neqi <src1> <const>` (src != const)
#[derive(Debug, Clone, PartialEq)]
pub struct  NonEqualImmiInstruction {
    pub src: u32,
    pub value: u32,
}
