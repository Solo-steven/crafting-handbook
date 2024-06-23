use serde::{Deserialize, Serialize};
#[derive(Debug, Clone, PartialEq)]
pub enum TokenKind {
    // Start Token State
    StartToken,
    // Keywords
    Auto,
    Break,
    Case,
    Char,
    Const,
    Continue,
    Default,
    Do,
    Double,
    Else,
    Enum,
    Extern,
    Float,
    For,
    Goto,
    If,
    Inline,
    Int,
    Long,
    Register,
    Restrict,
    Return,
    Short,
    Signed,
    Static,
    Struct,
    Switch,
    Typedef,
    Union,
    Unsigned,
    Void,
    Volatile,
    While,
    _Bool,
    _Complex,
    _Imaginary,
    Identifier,
    // Operators
    Dot,                         // .
    Increment,                   // ++
    Decrement,                   // --
    Plus,                        // +
    Minus,                       // -
    Multiplication,              // *
    Division,                    // /
    Remainder,                   // %
    LogicalNot,                  // !
    LogicalAnd,                  // &&
    LogicalOr,                   // ||
    BitwiseNot,                  // ~
    BitwiseAnd,                  // & (same as adress of operator)
    BitwiseOr,                   // |
    BitwiseXor,                  // ^
    BitwiseLeftShift,            // <<
    BitwiseRightShift,           // >>
    Equal,                       // ==
    NotEqual,                    // !=
    Gt,                          // >
    Geqt,                        // >=
    Lt,                          // <
    Leqt,                        // <=
    Arrow,                       // ->
    Qustion,                     // ?
    Assignment,                  // =,
    SumAssignment,               // +=
    DiffAssignment,              // -=
    ProductAssignment,           // *=
    QuotientAssignment,          // /=
    RemainderAssignment,         // %=
    BitwiseLeftShiftAssignment,  // <<=
    BitwiseRightShiftAssignment, // >>=
    BitwiseAndAssignment,        // &=
    BitwiseOrAssignment,         // |=
    BitwiseXorAssignment,        // ^=
    Sizeof,                      // sizeof
    // Punctuators
    Comma,            // ,
    Semi,             // ;
    Colon,            // :
    BracesLeft,       // {
    BracesRight,      // }
    BracketLeft,      // [
    BracketRight,     // ]
    ParenthesesLeft,  // (
    ParenthesesRight, // )
    // Literals
    IntLiteral(IntLiteralBase, (Option<LongIntSuffix>, bool)),
    FloatLiteral(FloatLiteralBase, bool),
    CharLiteral,
    StringLiteral,
    // EOF token
    EOFToken,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub enum IntLiteralBase {
    Octal,
    Hex,
    Decimal,
}
#[derive(Debug, Clone, PartialEq)]
pub enum LongIntSuffix {
    Long,
    LongLong,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub enum FloatLiteralBase {
    Hex,
    Decimal,
}
