#[derive(Debug, Clone, PartialEq)]
pub enum TokenKind {
    // <RegTk>
    Reg,
    GReg,
    // <TyTk>
    U8Keyword,
    U16Keyword,
    I8Keyword,
    I16Keyword,
    I32Keyword,
    I64Keyword,
    F32Keyword,
    F64Keyword,
    StructKeyword,
    // Literal
    DecimalString,
    HexString,
    // Punctuator <PTk>
    BracesLeft,   // {
    BraceRight,   // }
    BracketLeft,  // [
    BracketRight, // ]
    ParanLeft,    // (
    ParanRight,   // )
    Comma,        // ,
    Colon,        // :
    Assign,       // =
    At,           // @
    // Keywords
    Eq,
    NotEq,
    Gt,
    Gteq,
    Lt,
    LtEq,
    Uconst,
    Iconst,
    Fconst,
    Add,
    AddI,
    Sub,
    SubI,
    Mul,
    MulI,
    Divide,
    DivideI,
    Reminder,
    ReminderI,
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
    Mov,
    Neg,
    Icmp,
    Fcmp,
    Call,
    Ret,
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
    StackAlloc,
    StackAddr,
    LoadRegister,
    StoreRegister,
    GlobalLoad,
    GlobalStore,
    BrIf,
    Jump,
    Phi,
    GlobalKeyword,
    SymbolKeyword,
    FuncKeyword,
    DataKeyword,
    BlockLabel,
    MemKeyword,
    // Identifier
    Identifier,
    // Other
    Comment,
    EOF,
}
#[derive(Debug, Clone, PartialEq)]
pub struct Token {
    pub kind: TokenKind,
    pub start: usize,
    pub end: usize,
}
