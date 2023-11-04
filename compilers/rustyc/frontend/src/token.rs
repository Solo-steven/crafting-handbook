#[derive(Debug, Clone, PartialEq)]
pub enum TokenKind {
    StartToken, // start state for lexer.
    Keyword(KeywordKind),
    Identifier,
    Operators(OperatorKind),
    Punctuators(PunctuatorKind),
    LiteralValue,
    EOFToken,
}
#[derive(Debug, Clone, PartialEq)]
pub enum KeywordKind {
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
}
#[derive(Debug, Clone, PartialEq)]
pub enum OperatorKind {
    Increment, // ++
    Decrement, // --
    Plus,      // +
    Minus,     // -
    Multiplication, // *
    Division,   // /
    Remainder,  // %
    LogicalNot, // !
    LogicalAnd, // &&
    LogicalOr, // ||
    BitwiseNot, // ~
    BitwiseAnd, // & (same as adress of operator)
    BitwiseOr, // |
    BitwiseXor, // ^
    BitwiseLeftShift,  // <<
    BitwiseRightShift, // >>
    Equal,    // ==
    NotEqual, // !=
    Gt,     // >
    Geqt,    // >=
    Lt,     // <
    Leqt,   // <=
    Arrow, // ->
    Qustion, // ?
    Assignment, // =,
    SumAssignment, // +=
    DiffAssignment, // -=
    ProductAssignment, // *= 
    QuotientAssignment, // /= 
    RemainderAssignment, // %=
    BitwiseLeftShiftAssignment, // <<=
    BitwiseRightShiftAssignment, // >>=
    BitwiseAndAssignment, // &=
    BitwiseOrAssignment, // |=
    BitwiseXorAssignment, // ^=
    Sizeof, // sizeof
}
#[derive(Debug, Clone, PartialEq)]
pub enum PunctuatorKind {
    Comma,  // ,
    Semi,   // ;
    Colon, // :
    BracesLeft,   // {
    BracesRight,  // }
    BracketLeft,  // [
    BracketRight, // ]
    ParenthesesLeft,  // (
    ParenthesesRight, // )
}