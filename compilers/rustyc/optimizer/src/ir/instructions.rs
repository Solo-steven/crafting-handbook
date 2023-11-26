
#[derive(Debug, PartialEq, Clone)]
pub struct  Identifier(String);
#[derive(Debug, PartialEq, Clone)]
pub enum IdentifierOrConst {
    Id(Identifier),
    Const(ImmiConst),
}
#[derive(Debug, PartialEq, Clone)]
pub enum ImmiConst {
    U8(u8),
    U16(u16),
    I32(i32),
    I64(i64),
    F32(f32),
    F64(f64),   
}
#[derive(Debug, PartialEq, Clone)]
pub enum DataType {
    U8,
    U16,
    I32,
    I64,
    F32,
    F64,
}
#[derive(Debug, PartialEq, Clone)]
pub enum Instruction {
    // arthmatic instructions
    Add(AddInstruction),
    Sub(SubInstruction),
    Mul(MulInstruction),
    Divide(DivInstruction),
    Reminder(ReminderInstruction),
    BitwiseNot(BitwiseNotInstruction),
    BitwiseOR(BitwiseORInstruction),
    BitwiseAnd(BitwiseAndInstruction),
    ShiftLeft(ShiftLeftInstruction),
    ShiftRight(ShiftRightInstruction),
    Copy(CopyInstruction),
    Neg(NegInstruction),
    Eq(EqInstruction),
    NotEq(NotEqInstruction),
    Gt(GtInstruction),
    Gteq(GteqInstruction),
    Lt(LtInstruction),
    LtEq(LteqInstruction),
    Call(CallInstruction),
    // memory instruction
    Load,
    Store,
    LoadIndirect,
    StoreIndirect,
    // Control instructions
    Br,
    Brneq,
    Jump,
}
/// Internal marco to create binary instruction like below format
/// - `op <dst-reg> <src-reg1> <src-reg2>`
macro_rules! BinaryInstruction {
    ($($name: ident),*) => {
        $(
            #[derive(Debug, PartialEq, Clone)]
            pub struct $name {
                pub src1: IdentifierOrConst,
                pub src2: IdentifierOrConst,
                pub dst: Identifier,
            }
        )*
    };
}
BinaryInstruction!{
    AddInstruction,
    SubInstruction,
    MulInstruction,
    DivInstruction,
    ReminderInstruction,
    BitwiseAndInstruction,
    BitwiseORInstruction,
    ShiftLeftInstruction,
    ShiftRightInstruction,
    GtInstruction,
    GteqInstruction,
    LtInstruction,
    LteqInstruction,
    EqInstruction,
    NotEqInstruction
}
/// Internal marco to create unary instruction like below format
/// - `op <dst-reg> <src-reg>`
macro_rules! UnaryInstruction {
    ($($name: ident),*) => {
        $(
            #[derive(Debug, PartialEq, Clone)]
            pub struct $name {
                pub src: IdentifierOrConst,
                pub dst: Identifier,
            }
        )*
    };
}
UnaryInstruction!{
    BitwiseNotInstruction,
    CopyInstruction,
    NegInstruction
}
#[derive(Debug, PartialEq, Clone)]
pub struct CallInstruction {
    pub callee: Identifier,
    pub argus: Vec<IdentifierOrConst>,
}
#[derive(Debug, PartialEq, Clone)]
pub struct LoadInstruction {
    base: IdentifierOrConst,
    offset: IdentifierOrConst,
    dst: Identifier,
}
#[derive(Debug, PartialEq, Clone)]
pub struct StoreInstruction {
    base: IdentifierOrConst,
    offset: IdentifierOrConst,
    src: Identifier,
}
#[derive(Debug, PartialEq, Clone)]
pub struct BrInstruction {
    src: Identifier,
    conseq: usize,
    alter: usize,
}
#[derive(Debug, PartialEq, Clone)]
pub struct JumpInstruction {
    address: usize,
}