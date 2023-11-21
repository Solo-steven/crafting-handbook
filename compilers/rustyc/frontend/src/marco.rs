#[macro_export]
macro_rules! lexer_panic {
    ($msg: expr) => {
        panic!($msg)
    };
}
#[macro_export]
macro_rules! expect_token {
    ($token_kind: pat, $parser: expr) => {
        match $parser.get_token() {
            $token_kind => {
                $parser.next_token();
            }
            _ => {
                // should be return a Error variant of ParserrResult 
                panic!();
            }
        }
    };
}
#[macro_export]
macro_rules! is_token {
    ($token_kind: pat, $parser: expr) => {
        match $parser.get_token() {
            $token_kind => {
                true
            }
            _ => {
                false
            }
        }
    };
}
#[macro_export]
macro_rules! is_binary_ops_token {
    ($parser: expr) => {
        match $parser.get_token() {
            TokenKind::Plus | TokenKind::Minus |
            TokenKind::Multiplication |TokenKind::Division | TokenKind::Remainder |
            TokenKind::LogicalNot | TokenKind::LogicalAnd | TokenKind::LogicalOr |
            TokenKind::BitwiseAnd | TokenKind::BitwiseOr |
            TokenKind::BitwiseXor | TokenKind::BitwiseLeftShift | TokenKind::BitwiseRightShift | 
            TokenKind::Equal | TokenKind::NotEqual |
            TokenKind::Gt | TokenKind::Geqt | TokenKind::Lt | TokenKind::Leqt => true,
            _ => false,
        }
    };
}
#[macro_export]
macro_rules! is_assignment_ops_token {
    ($parser: expr) => {
        match $parser.get_token() {
            TokenKind::Assignment | 
            TokenKind::SumAssignment |
            TokenKind::DiffAssignment |
            TokenKind::ProductAssignment |
            TokenKind::QuotientAssignment |
            TokenKind::RemainderAssignment |
            TokenKind::BitwiseLeftShiftAssignment |
            TokenKind::BitwiseRightShiftAssignment |
            TokenKind::BitwiseAndAssignment |
            TokenKind::BitwiseOrAssignment |
            TokenKind::BitwiseXorAssignment => true,
            _ => false
        }
    };
}
#[macro_export]
macro_rules! is_unary_ops_token {
    ($parser: expr) => {
        match $parser.get_token() {
            TokenKind::Plus | TokenKind::Minus |
            TokenKind::BitwiseNot | TokenKind::LogicalNot |
            TokenKind::Multiplication | TokenKind::BitwiseAnd |
            TokenKind::Sizeof => true,
            _ => false
        }
    };
}
#[macro_export]
macro_rules! is_update_ops_token {
    ($parser: expr) => {
        match $parser.get_token() {
            TokenKind::Increment | TokenKind::Decrement => true,
            _ => false
        }
    };
}

#[macro_export]
/// Function-like macro helper for mapping assignment token to assignment operator ast
macro_rules! map_assignment_token_to_assignment_ops {
    ($kind: expr) => {
        match $kind {
            TokenKind::Assignment => AssignmentOps::Assignment,
            TokenKind::SumAssignment => AssignmentOps::SumAssignment,
            TokenKind::DiffAssignment => AssignmentOps::DiffAssignment,
            TokenKind::ProductAssignment => AssignmentOps::ProductAssignment,
            TokenKind::QuotientAssignment => AssignmentOps::QuotientAssignment,
            TokenKind::RemainderAssignment => AssignmentOps::RemainderAssignment,
            TokenKind::BitwiseLeftShiftAssignment => AssignmentOps::BitwiseLeftShiftAssignment,
            TokenKind::BitwiseRightShiftAssignment => AssignmentOps::BitwiseRightShiftAssignment,
            TokenKind::BitwiseAndAssignment => AssignmentOps::BitwiseAndAssignment,
            TokenKind::BitwiseOrAssignment  => AssignmentOps::BitwiseOrAssignment,
            TokenKind::BitwiseXorAssignment => AssignmentOps::BitwiseXorAssignment,
            _ => panic!("unreachable code when mapping assignment token to assignment ops"),
        }
    };
}
#[macro_export]
/// Function-like macor helper for mapping binary token to binary operator ast
macro_rules! map_binary_token_to_binary_ops {
    ($kind: expr) => {
        match $kind {
            TokenKind::Plus => BinaryOps::Plus,
            TokenKind::Minus => BinaryOps::Minus,
            TokenKind::Multiplication => BinaryOps::Multiplication,
            TokenKind::Division => BinaryOps::Division,
            TokenKind::Remainder => BinaryOps::Remainder, 
            TokenKind::LogicalAnd => BinaryOps::LogicalAnd,
            TokenKind::LogicalOr => BinaryOps::LogicalOr,
            TokenKind::BitwiseAnd => BinaryOps::BitwiseAnd,
            TokenKind::BitwiseOr => BinaryOps::BitwiseOr,
            TokenKind::BitwiseXor => BinaryOps::BitwiseXor,
            TokenKind::BitwiseLeftShift => BinaryOps::BitwiseLeftShift,
            TokenKind::BitwiseRightShift => BinaryOps::BitwiseRightShift,
            TokenKind::Equal => BinaryOps::Equal,
            TokenKind::NotEqual => BinaryOps::NotEqual,
            TokenKind::Gt => BinaryOps::Gt,
            TokenKind::Geqt => BinaryOps::Geqt,
            TokenKind::Lt => BinaryOps::Lt, 
            TokenKind::Leqt => BinaryOps::Leqt,
            _ => panic!("unreachable code when mapping binary token to binary ops"),
        }
    };
}
#[macro_export]
/// Function-like macro helper for get prioroty of binary ops 
macro_rules! get_binary_op_priority {
    ($op: expr) => {
        match $op {
            BinaryOps::Multiplication | BinaryOps::Division | BinaryOps::Remainder => 13,
            BinaryOps::Plus | BinaryOps::Minus => 12,
            BinaryOps::BitwiseRightShift | BinaryOps::BitwiseLeftShift => 11,
            BinaryOps::Leqt | BinaryOps::Lt | BinaryOps::Geqt | BinaryOps::Gt => 10,
            BinaryOps::Equal | BinaryOps::NotEqual => 9,
            BinaryOps::BitwiseAnd => 8,
            BinaryOps::BitwiseXor => 7,
            BinaryOps::BitwiseOr => 6,
            BinaryOps::LogicalAnd => 5,
            BinaryOps::LogicalOr => 4,
        }
    };
}
#[macro_export]
/// Function like macro helper for mapping unary ops token to unary ops ast
macro_rules! map_unary_token_to_unary_ops {
    ($kind: expr) => {
        match $kind {
            TokenKind::Plus => UnaryOps::Plus,
            TokenKind::Minus => UnaryOps::Minus,
            TokenKind::BitwiseNot => UnaryOps::BitwiseNot,
            TokenKind::LogicalNot => UnaryOps::LogicalNot,
            TokenKind::Multiplication => UnaryOps::Dereference,
            TokenKind::BitwiseAnd => UnaryOps::AddressOf,
            TokenKind::Sizeof => UnaryOps::Sizeof,
            _ => panic!("unreachable code when mapping unary token to unary ops"),
        }
    };
}
#[macro_export]
/// Function-like macro helper for mapping update ops token to update ops
macro_rules! map_update_token_to_update_ops {
    ($kind: expr) => {
        match $kind {
            TokenKind::Increment => UpdateOps::Increment,
            TokenKind::Decrement => UpdateOps::Decrement,
            _ => panic!("unreachable code when mapping unary token to unary ops"),
        }
    };
}