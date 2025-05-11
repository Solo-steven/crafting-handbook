use crate::entities::instruction::opcode::{CmpFlag, OpCode};
use crate::frontend::TokenKind;

/// Map token kind to opcode, need to make sure given
/// token kind is Opcode, otherwise it will panic.
pub fn map_token_to_opcode(tk: TokenKind) -> OpCode {
    match tk {
        TokenKind::Iconst => OpCode::Iconst,
        TokenKind::Uconst => OpCode::Uconst,
        TokenKind::Fconst => OpCode::Fconst,
        TokenKind::Add => OpCode::Add,
        TokenKind::AddI => OpCode::Addi,
        TokenKind::Sub => OpCode::Sub,
        TokenKind::SubI => OpCode::Subi,
        TokenKind::Mul => OpCode::Mul,
        TokenKind::MulI => OpCode::Muli,
        TokenKind::Divide => OpCode::Divide,
        TokenKind::DivideI => OpCode::Dividei,
        TokenKind::Reminder => OpCode::Reminder,
        TokenKind::ReminderI => OpCode::Reminderi,
        TokenKind::FAdd => OpCode::FAdd,
        TokenKind::FSub => OpCode::FSub,
        TokenKind::FMul => OpCode::FMul,
        TokenKind::FDivide => OpCode::FDivide,
        TokenKind::FReminder => OpCode::FReminder,
        TokenKind::BitwiseNot => OpCode::BitwiseNot,
        TokenKind::BitwiseOR => OpCode::BitwiseOR,
        TokenKind::BitwiseAnd => OpCode::BitwiseAnd,
        TokenKind::ShiftLeft => OpCode::ShiftLeft,
        TokenKind::ShiftRight => OpCode::ShiftRight,
        TokenKind::Mov => OpCode::Mov,
        TokenKind::Neg => OpCode::Neg,
        TokenKind::Icmp => OpCode::Icmp,
        TokenKind::Fcmp => OpCode::Fcmp,
        TokenKind::Call => OpCode::Call,
        TokenKind::Ret => OpCode::Ret,
        TokenKind::ToU8 => OpCode::ToU8,
        TokenKind::ToU16 => OpCode::ToU16,
        TokenKind::ToU32 => OpCode::ToU32,
        TokenKind::ToU64 => OpCode::ToU64,
        TokenKind::ToI16 => OpCode::ToI16,
        TokenKind::ToI32 => OpCode::ToI32,
        TokenKind::ToI64 => OpCode::ToI64,
        TokenKind::ToF32 => OpCode::ToF32,
        TokenKind::ToF64 => OpCode::ToF64,
        TokenKind::ToAddress => OpCode::ToAddress,
        TokenKind::StackAlloc => OpCode::StackAlloc,
        TokenKind::StackAddr => OpCode::StackAddr,
        TokenKind::LoadRegister => OpCode::LoadRegister,
        TokenKind::StoreRegister => OpCode::StoreRegister,
        TokenKind::GlobalLoad => OpCode::GlobalLoad,
        TokenKind::GlobalStore => OpCode::GlobalStore,
        TokenKind::BrIf => OpCode::BrIf,
        TokenKind::Jump => OpCode::Jump,
        TokenKind::Phi => OpCode::Phi,
        _ => panic!("[Error]: token kind {:?} can not map to opcode.", tk),
    }
}

pub fn map_token_to_cmp(tk: TokenKind) -> CmpFlag {
    match tk {
        TokenKind::Eq => CmpFlag::Eq,
        TokenKind::NotEq => CmpFlag::NotEq,
        TokenKind::Gt => CmpFlag::Gt,
        TokenKind::Gteq => CmpFlag::Gteq,
        TokenKind::Lt => CmpFlag::Lt,
        TokenKind::LtEq => CmpFlag::LtEq,
        _ => panic!("[Error]: token kind {:?} can not map to cmp flag.", tk),
    }
}
