#[macro_export]
macro_rules! finish_token_with_eat {
    ( $item: expr, $lexer: expr) => {
        $lexer.eat_char();
        $lexer.cur_token = $item;
        $lexer.finish_token();
        return Ok(());
    };
}
#[macro_export]
macro_rules! finish_token {
    ( $item: expr, $lexer: expr) => {
        $lexer.cur_token = $item;
        $lexer.finish_token();
        return Ok(());
    };
}
#[macro_export]
macro_rules! expect {
    ($item: expr, $parser: expr) => {
        if($parser.get_token_ref() == &$item) {
            $parser.next_token();
        }else {
            return Err(())
        }
    }
}
#[macro_export]
macro_rules! expect_but_not_eat {
    ($item: expr, $parser: expr) => {
        if($parser.get_token_ref() != &$item) {
            return Err(())
        }
    }
}
#[macro_export]
macro_rules! expect_with_start_span {
    ($item: expr, $parser: expr) => {
        if($parser.get_token_ref() == &$item) {
            let start_span = $parser.get_start_span();
            $parser.next_token();
            start_span
        }else {
            return Err(())
        }
    }
}
#[macro_export]
macro_rules! expect_with_finish_span {
    ($item: expr, $parser: expr) => {
        if($parser.get_token_ref() == &$item) {
            let finish_span = $parser.get_finish_span();
            $parser.next_token();
            finish_span
        }else {
            return Err(())
        }
    }
}
#[macro_export]
macro_rules! match_token {
    ($item: pat, $parser: expr) => {
        match $parser.get_token_ref() {
            $item => true,
            _ => false
        }
    };
}
#[macro_export]
macro_rules! is_assignment_op_token {
    ($parser: expr) => {
        match $parser.get_token_ref() {
            TokenKind::AssginOperator |  // =
            TokenKind::PlusAssignOperator |     // +=
            TokenKind::MinusAssignOperator |    // -=
            TokenKind::ModAssignOperator |      // %=
            TokenKind::DivideAssignOperator |   // /=
            TokenKind::MultiplyAssignOperator | // *=
            TokenKind::ExponAssignOperator |    // **=
            TokenKind::BitwiseORAssginOperator |    // |=
            TokenKind::BitwiseANDAssginOperator |   // &=
            TokenKind::BitwiseNOTAssginOperator |   // ~=
            TokenKind::BitwiseXORAssginOperator |   // ^=
            TokenKind::LogicalORAssignOperator |    // ||=
            TokenKind::LogicalAndassginOperator |   // &&=
            TokenKind::BitwiseLeftShiftAssginOperator |     // <<=
            TokenKind::BitwiseRightShiftAssginOperator |    // >>=
            TokenKind::BitwiseRightShiftFillAssginOperator // >>>=
             => true,
            _ => false
        }
    };
}
#[macro_export]
macro_rules! map_token_to_assignment_op {
    ($parser: expr) => {
        match $parser.get_token_ref() {
            TokenKind::AssginOperator => AssignmentOperatorKinds::AssginOperator,
            TokenKind::PlusAssignOperator => AssignmentOperatorKinds::PlusAssignOperator,
            TokenKind::MinusAssignOperator => AssignmentOperatorKinds::MinusAssignOperator,
            TokenKind::ModAssignOperator => AssignmentOperatorKinds:: ModAssignOperator,
            TokenKind::DivideAssignOperator => AssignmentOperatorKinds::DivideAssignOperator,
            TokenKind::MultiplyAssignOperator => AssignmentOperatorKinds::MultiplyAssignOperator,
            TokenKind::ExponAssignOperator => AssignmentOperatorKinds::ExponAssignOperator,
            TokenKind::BitwiseORAssginOperator => AssignmentOperatorKinds::BitwiseORAssginOperator,
            TokenKind::BitwiseANDAssginOperator => AssignmentOperatorKinds::BitwiseANDAssginOperator,
            TokenKind::BitwiseNOTAssginOperator => AssignmentOperatorKinds::BitwiseNOTAssginOperator,
            TokenKind::BitwiseXORAssginOperator => AssignmentOperatorKinds::BitwiseXORAssginOperator,
            TokenKind::LogicalORAssignOperator => AssignmentOperatorKinds::LogicalORAssignOperator,
            TokenKind::LogicalAndassginOperator => AssignmentOperatorKinds::LogicalAndassginOperator,
            TokenKind::BitwiseLeftShiftAssginOperator => AssignmentOperatorKinds::BitwiseLeftShiftAssginOperator,
            TokenKind::BitwiseRightShiftAssginOperator => AssignmentOperatorKinds::BitwiseRightShiftAssginOperator,
            TokenKind::BitwiseRightShiftFillAssginOperator => AssignmentOperatorKinds::BitwiseRightShiftFillAssginOperator,
            _ => unreachable!(),
        }
    };
}
#[macro_export]
macro_rules! is_binary_op_token {
    ($parser: expr) => {
        match $parser.get_token_ref() {
            TokenKind::PlusOperator |       // +
            TokenKind::MinusOperator |      // -
            TokenKind::DivideOperator |     // /
            TokenKind::MultiplyOperator |   // *
            TokenKind::ModOperator |    // %
            TokenKind::ExponOperator |  // **
            TokenKind::GtOperator |     // >
            TokenKind::LtOperator |     // <
            TokenKind::EqOperator |     // ==
            TokenKind::NotEqOperator |  // !=
            TokenKind::GeqtOperator |   // >=
            TokenKind::LeqtOperator |   // <=
            TokenKind::StrictEqOperator |       // ===
            TokenKind::StrictNotEqOperator |    // !==
            TokenKind::BitwiseOROperator |      // |
            TokenKind::BitwiseANDOperator |     // &
            TokenKind::BitwiseXOROperator |     // ^
            TokenKind::BitwiseLeftShiftOperator |      // <<
            TokenKind::BitwiseRightShiftOperator |     // >>
            TokenKind::BitwiseRightShiftFillOperator |  // >>>
            TokenKind::LogicalANDOperator | // &&
            TokenKind::LogicalOROperator | // ||
            TokenKind::InstanceofKeyword |
            TokenKind::NullishOperator // ??
             => true,
             TokenKind::InKeyword  => {
                $parser.get_current_in_operator_stack()
             }
            _ => false
        }
    };
}
#[macro_export]
macro_rules! map_token_to_binary_op {
    ($parser: expr) => {
        match $parser.get_token_ref() {
            TokenKind::PlusOperator => BinaryOperatorKinds::PlusOperator,
            TokenKind::MinusOperator  => BinaryOperatorKinds::MinusOperator,
            TokenKind::DivideOperator  => BinaryOperatorKinds::DivideOperator,
            TokenKind::MultiplyOperator  => BinaryOperatorKinds::MultiplyOperator,
            TokenKind::ModOperator  => BinaryOperatorKinds::ModOperator,
            TokenKind::ExponOperator  => BinaryOperatorKinds::ExponOperator,
            TokenKind::GtOperator  => BinaryOperatorKinds::GtOperator,
            TokenKind::LtOperator  => BinaryOperatorKinds::LtOperator,
            TokenKind::EqOperator  => BinaryOperatorKinds::EqOperator,
            TokenKind::NotEqOperator  => BinaryOperatorKinds::NotEqOperator,
            TokenKind::GeqtOperator  => BinaryOperatorKinds::GeqtOperator,
            TokenKind::LeqtOperator  => BinaryOperatorKinds::LeqtOperator,
            TokenKind::StrictEqOperator  => BinaryOperatorKinds:: StrictEqOperator,
            TokenKind::StrictNotEqOperator  => BinaryOperatorKinds::StrictNotEqOperator,
            TokenKind::BitwiseOROperator  => BinaryOperatorKinds::BitwiseOROperator,
            TokenKind::BitwiseANDOperator  => BinaryOperatorKinds::BitwiseANDOperator,
            TokenKind::BitwiseXOROperator  => BinaryOperatorKinds::BitwiseXOROperator,
            TokenKind::BitwiseLeftShiftOperator  => BinaryOperatorKinds::BitwiseLeftShiftOperator,
            TokenKind::BitwiseRightShiftOperator  => BinaryOperatorKinds::BitwiseRightShiftOperator,
            TokenKind::BitwiseRightShiftFillOperator  => BinaryOperatorKinds::BitwiseRightShiftFillOperator,
            TokenKind::LogicalANDOperator  => BinaryOperatorKinds::LogicalANDOperator,
            TokenKind::LogicalOROperator  => BinaryOperatorKinds::LogicalOROperator,
            TokenKind::InKeyword  => BinaryOperatorKinds::InKeyword,
            TokenKind::InstanceofKeyword  => BinaryOperatorKinds::InstanceofKeyword,
            TokenKind::NullishOperator => BinaryOperatorKinds::NullishOperator,
            _ => unreachable!()
        }
    };
}
#[macro_export]
macro_rules! get_binary_op_precedence {
    ($item: expr) => {
        match $item {
            BinaryOperatorKinds::NullishOperator | BinaryOperatorKinds::LogicalOROperator => 4,
            BinaryOperatorKinds::LogicalANDOperator => 5,
            BinaryOperatorKinds::BitwiseOROperator  => 6,
            BinaryOperatorKinds::BitwiseXOROperator  => 7,
            BinaryOperatorKinds::BitwiseANDOperator  => 8,
            BinaryOperatorKinds::StrictEqOperator | BinaryOperatorKinds::StrictNotEqOperator |
            BinaryOperatorKinds::EqOperator | BinaryOperatorKinds::NotEqOperator => 9,
            BinaryOperatorKinds::GtOperator  | BinaryOperatorKinds::LtOperator | 
            BinaryOperatorKinds::GeqtOperator | BinaryOperatorKinds::LeqtOperator |
            BinaryOperatorKinds::InKeyword | BinaryOperatorKinds::InstanceofKeyword  => 10,
            BinaryOperatorKinds::BitwiseLeftShiftOperator | BinaryOperatorKinds::BitwiseRightShiftOperator | 
            BinaryOperatorKinds::BitwiseRightShiftFillOperator => 11,
            BinaryOperatorKinds::PlusOperator | BinaryOperatorKinds::MinusOperator  =>  12,
            BinaryOperatorKinds::DivideOperator | BinaryOperatorKinds::MultiplyOperator |
            BinaryOperatorKinds::ModOperator  => 13,
            BinaryOperatorKinds::ExponOperator => 14,
        }
    };
}
#[macro_export]
macro_rules! is_unary_op_token {
    ($parser: expr) => {
        match $parser.get_token_ref() {
            TokenKind::LogicalNOTOperator | // !
            TokenKind::BitwiseNOTOperator | // ~
            TokenKind::BitwiseXOROperator | // ^
            TokenKind::PlusOperator |       // +
            TokenKind::MinusOperator |      // -
            TokenKind::DeleteKeyword |      // delete
            TokenKind::VoidKeyword |        // void
            TokenKind::TypeofKeyword       // typeof
            => true,
            _ => false
        }
    };
}
#[macro_export]
macro_rules! map_token_to_unary_op {
    ($parser: expr) => {
        match $parser.get_token_ref() {
            TokenKind::LogicalNOTOperator => UnaryOperatorKinds::LogicalNOTOperator,  // !
            TokenKind::BitwiseNOTOperator=> UnaryOperatorKinds::BitwiseNOTOperator, // ~
            TokenKind::BitwiseXOROperator => UnaryOperatorKinds::BitwiseXOROperator, // ^
            TokenKind::PlusOperator => UnaryOperatorKinds::PlusOperator,       // +
            TokenKind::MinusOperator => UnaryOperatorKinds::MinusOperator,     // -
            TokenKind::DeleteKeyword => UnaryOperatorKinds::DeleteKeyword,      // delete
            TokenKind::VoidKeyword  => UnaryOperatorKinds::VoidKeyword,        // void
            TokenKind::TypeofKeyword => UnaryOperatorKinds::TypeofKeyword,      // typeof
            _ => unreachable!()
        }
    };
}
#[macro_export]
macro_rules! is_update_op_token {
    ($parser: expr) => {
        match $parser.get_token_ref() {
            TokenKind::IncreOperator | TokenKind::DecreOperator => true,
            _ => false
        }
    };
}
#[macro_export]
macro_rules! map_token_to_update_op {
    ($parser: expr) => {
        match $parser.get_token_ref() {
            TokenKind::DecreOperator => UpdateOperatorKinds::DecreOperator,  // !
            TokenKind::IncreOperator => UpdateOperatorKinds::IncreOperator,
            _ => unreachable!()
        }
    };
}