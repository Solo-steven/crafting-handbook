use crate::lexer::TokenKind;
use crate::{finish_token, finish_token_with_eat};
use crate::lexer::LexerResult;
use super::Lexer;

impl <'a> Lexer<'a> {
    /// ## Read Token Start With Plus
    /// - `+`
    /// - `++`
    /// - `+=`
    pub (super) fn read_plus(&mut self) -> LexerResult {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '+' => {
                    finish_token_with_eat!(TokenKind::IncreOperator, self);
                }
                '=' => {
                    finish_token_with_eat!(TokenKind::PlusAssignOperator, self);
                }
                _ => {}
            }
        }
        finish_token!(TokenKind::PlusOperator, self);
    }
    /// ## Read Token Start With `-`
    ///  `-` 
    /// 
    pub (super) fn read_minus(&mut self) -> LexerResult {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '-' => {
                    finish_token_with_eat!(TokenKind::DecreOperator, self);
                }
                '=' => {
                    finish_token_with_eat!(TokenKind::MinusAssignOperator, self);
                }
                _ => {}
            }
        }
        finish_token!(TokenKind::MinusOperator, self);
    }
    ///
    pub (super) fn read_multi(&mut self) -> LexerResult {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '*' => {
                    self.eat_char();
                    if let Some(ch) = self.get_char() {
                        if ch == '=' {
                            finish_token_with_eat!(TokenKind::ExponAssignOperator, self);
                        }
                    }
                    self.cur_token = TokenKind::ExponOperator;
                    self.finish_token();
                }
                '=' => {
                    finish_token_with_eat!(TokenKind::MinusAssignOperator, self);
                }
                _ => {}
            }
        }
        finish_token!(TokenKind::MinusOperator, self);
    }
    /// ### Read Token Start With `%`
    /// - `%` : 
    /// - `%=` :
    pub (super) fn read_mod(&mut self) -> LexerResult {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            if ch == '=' {
                finish_token_with_eat!(TokenKind::ModAssignOperator, self);
            }
        }
        finish_token!(TokenKind::ModOperator, self);
    }
    /// ### Read Operator or Comment Start With `/` 
    pub (super) fn read_divide(&mut self) -> LexerResult {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    finish_token_with_eat!(TokenKind::DivideAssignOperator, self);
                }
                '/' => {
                    self.eat_char();
                    return self.read_comment();
                }
                _ => {}
            }
        }
        finish_token!(TokenKind::DivideOperator, self);
    }
    /// ### Sub function of `read_divide`, read comment
    fn read_comment(&mut self) -> LexerResult {
        if Some('*') == self.get_char() {
            return self.read_block_comment();
        }
        loop {
            if let Some(ch) = self.get_char() {
                if ch == '\n' {
                    break;
                }
                self.eat_char();
            }else {
                break;
            }
        }
        finish_token!(TokenKind::Comment, self);
    }
    /// ### Sub function of 
    fn read_block_comment(&mut self) -> LexerResult {
        loop {
            if let Some(ch) = self.get_char() {
                match ch {
                    '*' => {
                        self.eat_char();
                        if Some('/') == self.get_char() {
                            finish_token_with_eat!(TokenKind::BlockComment, self);
                        }
                    }
                    '\n' => {
                        self.eat_char();
                        self.cur_line_start = self.cur_offset;
                        self.cur_line += 1;
                    }
                    _ => self.eat_char(),
                }
            }else {
                // TODO: Non-end block comment
                panic!();
            }
        }
    }
    /// ## Read Token Start with '>'
    /// - `>`
    /// - `>=`
    /// - `>>`
    /// - '>>='
    /// - '>>>'
    /// - '>>>='
    pub (super) fn read_gt_then(&mut self) -> LexerResult {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch  {
                '>' => {
                    self.eat_char();
                    if let Some(ch_next) = self.get_char() {
                        match ch_next {
                            '>' => {
                                self.eat_char();
                                if Some('=') == self.get_char() {
                                    // >>>=
                                    finish_token_with_eat!(TokenKind::BitwiseRightShiftFillAssginOperator, self);
                                }
                                // >>>
                                finish_token!(TokenKind::BitwiseRightShiftFillOperator, self);
                            }
                            '=' => {
                                // >>=
                                finish_token_with_eat!(TokenKind::BitwiseRightShiftOperator, self);
                            }
                            _ => {}
                        }
                    }
                    // >>
                    finish_token!(TokenKind::BitwiseRightShiftOperator, self);
                }
                '=' => {
                    // >=
                    finish_token_with_eat!(TokenKind::GeqtOperator, self);
                }
                _ => {}
            }
        }
        // >
        finish_token!(TokenKind::GtOperator, self);
    }
    /// ## Read Token Start With '<'
    /// - `<`
    /// - `<=`
    /// - `<<`
    /// - '<<='
    pub (super) fn read_lt_then(&mut self) -> LexerResult {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    // <=
                    finish_token_with_eat!(TokenKind::LeqtOperator, self);
                }
                '<' => {
                    self.eat_char();
                    if Some('=') == self.get_char() {
                        // <<=
                        finish_token_with_eat!(TokenKind::BitwiseLeftShiftAssginOperator, self);
                    }
                    // <<
                    finish_token!(TokenKind::BitwiseLeftShiftOperator, self);
                }
                _ => {}
            }
        }
        // <
        finish_token!(TokenKind::LtOperator, self);
    }
    /// ## Read Token Start With `=`
    /// - `=`
    /// - `==`
    /// - `===`
    /// - `=>`
    pub (super) fn read_equal(&mut self) -> LexerResult {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    if Some('=') == self.get_char() {
                        finish_token_with_eat!(TokenKind::StrictEqOperator, self);
                    }
                    finish_token!(TokenKind::EqOperator, self);
                }
                '>' => {
                    finish_token_with_eat!(TokenKind::ArrowOperator, self);
                }
                _ => {}
            }
        }
        finish_token!(TokenKind::AssginOperator, self);
    }
    /// ## Read Token Start With `!`
    /// - `!`
    /// - `!=`
    /// - `!==`
    pub (super) fn read_logical_not(&mut self) -> LexerResult {
        self.eat_char();
        if let Some(ch) = self.get_char()  {
            if ch == '=' {
                self.eat_char();
                if Some('=') == self.get_char() {
                    // !==
                    finish_token_with_eat!(TokenKind::StrictNotEqOperator, self);
                }
                // !=
                finish_token!(TokenKind::NotEqOperator, self);
            }
        }
        // !=
        finish_token!(TokenKind::LogicalNOTOperator, self);
    }
    /// ## Read Operator Start With `&`
    /// - `&`
    /// - `&&`
    /// - `&=`
    /// - `&&=`
    pub (super) fn read_bitwise_and(&mut self) -> LexerResult {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '&' => {
                    self.eat_char();
                    if Some('=') == self.get_char() {
                        finish_token_with_eat!(TokenKind::LogicalAndassginOperator, self);
                    }
                    finish_token!(TokenKind::LogicalANDOperator, self);
                }
                '=' => {
                    finish_token_with_eat!(TokenKind::BitwiseANDAssginOperator, self);
                }
                _ => {}
            }
        }
        finish_token!(TokenKind::BitwiseANDOperator, self);
    }
    /// ## Read Operator Start With `|`
    /// 
    pub (super) fn read_bitwise_or(&mut self) -> LexerResult {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '|' => {
                    self.eat_char();
                    if Some('=') == self.get_char() {
                        finish_token_with_eat!(TokenKind::LogicalORAssignOperator, self);
                    }
                    finish_token!(TokenKind::LogicalOROperator, self);
                }
                '=' => {
                    finish_token_with_eat!(TokenKind::BitwiseORAssginOperator, self);
                }
                _ => {}
            }
        }
        finish_token!(TokenKind::BitwiseOROperator, self);
    }
    /// ## Read Operator Start With `?`
    /// - `?`
    /// - `??` : (TODO)
    /// - `?.`
    pub (super) fn read_question(&mut self) -> LexerResult {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '?' => {
                    todo!()
                }
                '.' => {
                    finish_token_with_eat!(TokenKind::QustionDotOperator, self);
                }
                _ => {}
            }
        }
        finish_token!(TokenKind::QustionOperator, self);
    }
    /// ## Read Operator Start With `^`
    pub (super) fn read_bitwisexor(&mut self) -> LexerResult {
        self.eat_char();
        if Some('=') == self.get_char() {
            finish_token_with_eat!(TokenKind::BitwiseXORAssginOperator, self);
        }
        finish_token!(TokenKind::BitwiseXOROperator, self);
    }
    /// ## Read Operator Start With `~`
    pub (super) fn read_bitwisenot(&mut self) -> LexerResult {
        self.eat_char();
        if Some('=') == self.get_char() {
            finish_token_with_eat!(TokenKind::BitwiseNOTAssginOperator, self);
        }
        finish_token!(TokenKind::BitwiseNOTOperator, self);
    }
}