#[derive(Debug, Clone, PartialEq)]
pub enum TokenKind {
    // ============ Start State =======
    Start,
    // ============= Keyword ===========
    AwaitKeyword = 10010,
    BreakKeyword,
    CaseKeyword,
    CatchKeyword,
    ClassKeyword,
    ConstKeyword,
    ContinueKeyword,
    DebuggerKeyword,
    DefaultKeyword,
    DoKeyword,
    ElseKeyword,
    EnumKeyword,
    ExportKeyword,
    ExtendsKeyword,
    FinallyKeyword,
    ForKeyword,
    FunctionKeyword,
    IfKeyword,
    ImportKeyword,
    LetKeyword,
    NewKeyword,
    ReturnKeyword,
    SuperKeyword,
    SwitchKeyword,
    ThisKeyword,
    ThrowKeyword,
    TryKeyword,
    VarKeyword,
    WithKeyword,
    WhileKeyword,
    YieldKeyword,
    DeleteKeyword,
    VoidKeyword,
    TypeofKeyword,
    InKeyword,
    InstanceofKeyword,
    // ========== Operators ==========
    PlusOperator,       // +
    MinusOperator,      // -
    DivideOperator,     // /
    MultiplyOperator,   // *
    ModOperator,    // %
    IncreOperator,  // ++
    DecreOperator,  // --
    ExponOperator,  // **
    GtOperator,     // >
    LtOperator,     // <
    EqOperator,     // ==
    NotEqOperator,  // !=
    GeqtOperator,   // >=
    LeqtOperator,   // <=
    ArrowOperator, //  =>
    StrictEqOperator,       // ===
    StrictNotEqOperator,    // !==
    BitwiseOROperator,      // |
    BitwiseANDOperator,     // &
    BitwiseNOTOperator,     // ~
    BitwiseXOROperator,     // ^
    BitwiseLeftShiftOperator,   // <<
    BitwiseRightShiftOperator,  // >>
    BitwiseRightShiftFillOperator,  // >>>
    LogicalOROperator,      // ||
    LogicalANDOperator,     // &&
    LogicalNOTOperator,     // !
    SpreadOperator,         // ...
    QustionOperator,        // ?
    QustionDotOperator,     // ?.
    NullishOperator,        // ??
    DotOperator,            // .
    AssginOperator,         // =
    PlusAssignOperator,     // +=
    MinusAssignOperator,    // -=
    ModAssignOperator,      // %=
    DivideAssignOperator,   // /=
    MultiplyAssignOperator, // *=
    ExponAssignOperator,    // **=
    BitwiseORAssginOperator,    // |=
    BitwiseANDAssginOperator,   // &=
    BitwiseNOTAssginOperator,   // ~=
    BitwiseXORAssginOperator,   // ^=
    LogicalORAssignOperator,    // ||=
    LogicalAndassginOperator,   // &&=
    BitwiseLeftShiftAssginOperator,     // <<=
    BitwiseRightShiftAssginOperator,    // >>=
    BitwiseRightShiftFillAssginOperator,// >>>=
    // ========= Token (Maybe Punctuator and Operator) =====
    CommaToken,
    // ========== Punctuator ===========
    BracesLeftPunctuator,   // {
    BracesRightPunctuator,  // }
    BracketLeftPunctuator,  // [
    BracketRightPunctuator, // ]
    ParenthesesLeftPunctuator,  // (
    ParenthesesRightPunctuator, // )
    SingleQuotationPunctuator,  // '
    DoubleQuotationPunctuator,  // "
    SemiPunctuator, // ;
    ColonPunctuator,    // :
    HashTagPunctuator,  // #
    // ========== Template ===========
    TemplateHead,
    TemplateTail,
    TemplateMiddle,
    TemplateNoSubstitution,
    // ========== Literal ===========
    TrueKeyword,
    FalseKeyword,
    NullKeyword,
    UndefinedKeyword,
    StringLiteral,
    NumberLiteral,
    RegexLiteral,
    // =========== Comment =============
    Comment,
    BlockComment,
    // ========= Identifier ===========
    Identifier,
    PrivateName,
    // ========== EOF ==========
    EOFToken,
}