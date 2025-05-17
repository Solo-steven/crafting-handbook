use std::fmt;
#[derive(Debug, PartialEq, Clone, Eq, Hash)]
pub enum OpCode {
    // const instruction
    Uconst, // uconst
    Iconst, // iconst
    Fconst,
    // int opcodes
    Add,
    Addi,
    Sub,
    Subi,
    Mul,
    Muli,
    Divide,
    Dividei,
    Reminder,
    Reminderi,
    // float opcode
    FAdd,
    FSub,
    FMul,
    FDivide,
    FReminder,
    // bit operation
    BitwiseNot,
    BitwiseOR,
    BitwiseAnd,
    ShiftLeft,
    ShiftRight,
    // other
    Mov,
    Neg,
    // compare
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
    GlobalLoad,
    GlobalStore,
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
}

impl fmt::Display for OpCode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let display_text = match *self {
            OpCode::Add => "add",
            OpCode::Addi => "addi",
            OpCode::Uconst => "uconst",
            OpCode::Iconst => "iconst",
            OpCode::Fconst => "fconst",
            OpCode::Sub => "sub",
            OpCode::Subi => "subi",
            OpCode::Mul => "mul",
            OpCode::Muli => "muli",
            OpCode::Divide => "divide",
            OpCode::Dividei => "dividei",
            OpCode::Reminder => "reminder",
            OpCode::Reminderi => "reminderi",
            OpCode::FAdd => "fadd",
            OpCode::FSub => "fsub",
            OpCode::FMul => "fmul",
            OpCode::FDivide => "fdivide",
            OpCode::FReminder => "freminder",
            OpCode::BitwiseNot => "bnot",
            OpCode::BitwiseOR => "bor",
            OpCode::BitwiseAnd => "band",
            OpCode::ShiftLeft => "shl",
            OpCode::ShiftRight => "shr",
            OpCode::Mov => "mov",
            OpCode::Neg => "neg",
            OpCode::Icmp => "icmp",
            OpCode::Fcmp => "fcmp",
            OpCode::Call => "call",
            OpCode::Ret => "ret",
            OpCode::ToU8 => "to.u8",
            OpCode::ToU16 => "to.u16",
            OpCode::ToU32 => "to.u32",
            OpCode::ToU64 => "to.u64",
            OpCode::ToI16 => "to.i16",
            OpCode::ToI32 => "to.i32",
            OpCode::ToI64 => "to.i64",
            OpCode::ToF32 => "to.f32",
            OpCode::ToF64 => "to.f64",
            OpCode::ToAddress => "to.addr",
            OpCode::StackAlloc => "stackalloc",
            OpCode::StackAddr => "stackaddr",
            OpCode::LoadRegister => "load",
            OpCode::StoreRegister => "store",
            OpCode::GlobalLoad => "gload",
            OpCode::GlobalStore => "gstore",
            OpCode::BrIf => "brif",
            OpCode::Jump => "jump",
            OpCode::Phi => "phi",
        };
        write!(f, "{}", display_text)
    }
}

impl fmt::Display for CmpFlag {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let display_text = match *self {
            CmpFlag::Eq => "eq",
            CmpFlag::NotEq => "noteq",
            CmpFlag::Gt => "gt",
            CmpFlag::Gteq => "gteq",
            CmpFlag::Lt => "lt",
            CmpFlag::LtEq => "lteq",
        };
        write!(f, "{}", display_text)
    }
}
