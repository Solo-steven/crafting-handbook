use std::fmt;
#[derive(Debug, PartialEq, Clone, Eq, Hash)]
pub enum OpCode {
    // const instruction
    UConst,
    Iconst,
    F32Const,
    F64Const,
    // int opcodes
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
            OpCode::AddI => "addI",
            OpCode::UConst => "uconst",
            OpCode::Iconst => "iconst",
            OpCode::F32Const => "f32const",
            OpCode::F64Const => "f64const",
            OpCode::Sub => "sub",
            OpCode::SubI => "subi",
            OpCode::Mul => "mul",
            OpCode::MulI => "mulI",
            OpCode::Divide => "divide",
            OpCode::DivideI => "divideI",
            OpCode::Reminder => "reminder",
            OpCode::ReminderI => "reminderI",
            OpCode::FAdd => "fadd",
            OpCode::FSub => "fsub",
            OpCode::FMul => "fmul",
            OpCode::FDivide => "fdivide",
            OpCode::FReminder => "freminder",
            OpCode::BitwiseNot => "not",
            OpCode::BitwiseOR => "or",
            OpCode::BitwiseAnd => "and",
            OpCode::ShiftLeft => "Sleft",
            OpCode::ShiftRight => "Sright",
            OpCode::Mov => "mov",
            OpCode::Neg => "neg",
            OpCode::Icmp => "icmp",
            OpCode::Fcmp => "fcmp",
            OpCode::Call => "call",
            OpCode::Ret => "ret",
            OpCode::ToU8 => "toU8",
            OpCode::ToU16 => todo!(),
            OpCode::ToU32 => todo!(),
            OpCode::ToU64 => todo!(),
            OpCode::ToI16 => todo!(),
            OpCode::ToI32 => todo!(),
            OpCode::ToI64 => todo!(),
            OpCode::ToF32 => todo!(),
            OpCode::ToF64 => todo!(),
            OpCode::ToAddress => todo!(),
            OpCode::StackAlloc => "stackalloc",
            OpCode::StackAddr => "stackaddr",
            OpCode::LoadRegister => "load",
            OpCode::StoreRegister => "store",
            OpCode::GlobalLoad => todo!(),
            OpCode::GlobalStore => todo!(),
            OpCode::BrIf => todo!(),
            OpCode::Jump => todo!(),
            OpCode::Phi => todo!(),
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
