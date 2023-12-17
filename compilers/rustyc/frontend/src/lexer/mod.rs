pub mod error;

use std::borrow::Cow;
use std::str::CharIndices;

// use crate::lexer::error::LexerPanicError;
use crate::span::Span;
use crate::token::{FloatLiteralBase, IntLiteralBase, LongIntSuffix, TokenKind};
use crate::lexer_panic;

#[derive(Debug, Clone, PartialEq)]
pub struct TokenWithSpan {
    pub kind: TokenKind,
    pub start_span: Span,
    pub finish_span: Span,
}

// const lexer_error_map: LexerPanicError = LexerPanicError::new();

/// C99 spec-matched tokenizer (lexer).
pub struct Lexer<'a> {
    source: &'a str,
    iter: CharIndices<'a>,
    lookahead_buffer: Vec<TokenWithSpan>,

    current_kind: TokenKind,
    current_char: Option<char>,
    current_line_start: usize, // line start offset of current index,
    current_line: usize,
    current_offset: usize, 

    start_span: Span,
    finish_span: Span,
}

impl<'a> Lexer<'a> {
    pub fn new(source: &'a str) -> Self {
        let mut iter = source.char_indices();
        let tuple = iter.next();
        let (offset, ch, start_token) =  match tuple {
            Some((offset, ch) ) => {
                (offset, Some(ch), TokenKind::StartToken)
            }
            None => {
                (0, None, TokenKind::EOFToken)
            }
        };
        let mut lexer = Self {
            source,
            iter,
            lookahead_buffer: Vec::with_capacity(10),
            current_kind: start_token.clone(),
            current_char: ch,
            current_line_start: offset,
            current_offset: offset,
            current_line: 0,
            start_span: Span::new(),
            finish_span: Span::new(),
        };
        if start_token == TokenKind::StartToken {
            lexer.scan();
        }
        lexer
    }
    pub fn get_token(&self) -> TokenKind {
        self.current_kind.clone()
    }
    pub fn next_token(&mut self) -> TokenKind {
        if let Some(tok_with_span) = self.lookahead_buffer.pop() {
            self.current_kind = tok_with_span.kind;
            self.start_span = tok_with_span.start_span;
            self.finish_span = tok_with_span.finish_span;
        }else {
            self.scan();
        }
        self.get_token()
    }
    pub fn lookahead(&mut self) -> TokenWithSpan {
        let cache_kind = self.current_kind.clone();
        let cache_start = self.start_span.clone();
        let cache_finish = self.finish_span.clone();
        self.scan();
        let tok_with_span =  TokenWithSpan {
            kind: self.current_kind.clone(),
            start_span: self.start_span.clone(),
            finish_span: self.finish_span.clone()
        };
        self.lookahead_buffer.push(tok_with_span.clone());
        self.current_kind = cache_kind;
        self.start_span = cache_start;
        self.finish_span = cache_finish;
        tok_with_span
    }
    pub fn get_raw_value(&self) -> Cow<'a, str> {
        Cow::Borrowed(&self.source[self.start_span.offset..self.finish_span.offset])
    }
    pub fn get_start_span(&self) -> Span {
        self.start_span.clone()
    }
    pub fn get_finish_span(&self) -> Span {
        self.finish_span.clone()
    }
    /// Like common method `peek` in some compiler, this method return current char.
    fn get_char(&self) -> Option<char> {
        self.current_char
    }
    /// Like common method `advance` in some compiler, this method move to next char
    /// please seem lexer itself as a utf-8 reader,
    fn eat_char(&mut self) {
         match self.iter.next() {
            Some((offset, ch)) => {
                self.current_offset = offset;
                self.current_char = Some(ch);
            }
            None => {
                self.current_offset = self.source.len();
                self.current_char = None;
            }
         }
    }
    /// Mark start token state
    fn start_token(&mut self) {
        self.start_span = Span {
            offset: self.current_offset,
            row: self.current_line,
            col: self.current_offset - self.current_line_start
        }
    }
    /// Mark finish token state
    fn finish_token(&mut self) {
        self.finish_span = Span {
            offset: self.current_offset,
            row: self.current_line,
            col: self.current_offset - self.current_line_start
        }   
    }
    /// Skip ignoreable char for lexer. this method need to maintain the 
    /// `current_line` and `current_line_start` property if meet change-line 
    /// char is meet.
    fn skip_changeline_and_spaces(&mut self) {
        loop {
            if let Some(ch) = self.get_char() {
                match ch {
                    '\t' | ' '   => {
                        self.eat_char();
                    }
                    '\n' => {
                        self.eat_char();
                        self.current_line += 1;
                        self.current_line_start = self.current_offset;
                    }
                    _ => break
                }
            }else {
                break;
            }
        }
    }
    /// Main lexer state machine logical
    fn scan(&mut self) {
        self.skip_changeline_and_spaces();
        self.start_token();
        match self.get_char() {
            None => {
                self.finish_token();
                self.current_kind = TokenKind::EOFToken;
            }
            Some(ch) => {
                match ch {
                    '.' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::Dot;
                    }
                    ',' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::Comma;
                    }
                    ';' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::Semi;
                    }
                    '{' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::BracesLeft;
                    }
                    '}' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::BracesRight;
                    }
                    '[' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::BracketLeft;
                    }
                    ']' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::BracketRight;
                    }
                    '(' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::ParenthesesLeft;
                    }
                    ')' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::ParenthesesRight;
                    }
                    ':' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::Colon;
                    }
                    '*' => {
                        self.read_multiple_start();
                    }
                    'L' => {
                        // this is safe because 'l' and 'L' just have one byte so next utf-8 char 
                        // start must be offset +1.
                        let next_char = self.source[self.current_offset + 1..].chars().next();
                        if let Some(ch) = next_char {
                            match ch {
                                '\'' => {
                                    self.eat_char();
                                    self.read_char_or_string_literal('\'');
                                    return;
                                }
                                '\"' => {
                                    self.eat_char();
                                    self.read_char_or_string_literal('\"');
                                    return;
                                }
                                _ => {}
                            }
                        }
                        self.read_word();
                    }
                    '/' => {
                        self.eat_char();
                        if let Some(ch) = self.get_char() {
                            match ch {
                                '/' => {},
                                '*' => {}
                                '=' => {
                                    self.eat_char();
                                    self.finish_token();
                                    self.current_kind = TokenKind::QuotientAssignment;
                                }
                                _ => {
                                    self.finish_token();
                                    self.current_kind = TokenKind::Division;
                                }
                            }
                        }
                    }
                    '%' => {
                        self.read_reminder_start();
                    }
                    '?' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::Qustion;
                    }
                    '!' => {
                        self.read_not_start();
                    }
                    '+' => {
                        self.read_plus_start();
                    }
                    '-' => {
                        self.read_minus_start();
                    }
                    '>' => {
                        self.read_gt_start();
                    }
                    '<' => {
                        self.read_lt_start();
                    }
                    '=' => {
                        self.read_eq_start();
                    }
                    '&' => {
                        self.read_and_start();
                    }
                    '|' => {
                        self.read_or_start();
                    }
                    '^' => {
                        self.read_xor_start();
                    }
                    '~' => {
                        self.read_bitwise_not_start();
                    }
                    '\'' => {
                        self.read_char_or_string_literal('\'');
                    }
                    '\"' => {
                        self.read_char_or_string_literal('\"');
                    }
                    '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'  => {
                        self.read_number();
                    } 
                    _ => {
                        self.read_word();
                    }
                }
            }
        }
    }
    /// Read token when start with '+', it possible can be '+', '++', '+='
    fn read_plus_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '+' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Increment;
                    return;
                }
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::SumAssignment;
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Plus;
    }
    /// Read token when start with '-', it possible can be '-', '--', '-=', '->'
    fn read_minus_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '-' => {
                    self.eat_char();
                    self.current_kind = TokenKind::Decrement;
                    return;
                }
                '=' => {
                    self.eat_char();
                    self.current_kind = TokenKind::DiffAssignment;
                    return;
                }
                '>' => {
                    self.eat_char();
                    self.current_kind = TokenKind::Arrow;
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Minus;
    }
    /// Read token when start with '*' char, is possible can be '*' or '*='
    fn read_multiple_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::ProductAssignment;
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Multiplication;
    }
    /// Read token when start with '%', it possible can be '%', '%='
    fn read_reminder_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::RemainderAssignment;
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Remainder;
    }
    /// Read token when start with '>', it possible can be '>', '>>', '>=', '>>='
    fn read_gt_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Geqt;
                    return;
                }
                '>' => {
                    self.eat_char();
                    if let Some(ch) = self.get_char() {
                        match ch {
                            '=' => {
                                self.eat_char();
                                self.finish_token();
                                self.current_kind = TokenKind::BitwiseRightShiftAssignment;
                                return;
                            }
                            _ => {}
                        }
                    }
                    self.finish_token();
                    self.current_kind = TokenKind::BitwiseRightShift;
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Gt;
    }
    // Read token when start with '<', it possible can be '>', '>=', '>>', '>>='
    fn read_lt_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Leqt;
                    return;
                }
                '<' => {
                    self.eat_char();
                    if let Some(ch) = self.get_char() {
                        match ch {
                            '=' => {
                                self.eat_char();
                                self.finish_token();
                                self.current_kind = TokenKind::BitwiseLeftShiftAssignment;
                                return;
                            }
                            _ => {}
                        }
                    }
                    self.finish_token();
                    self.current_kind = TokenKind::BitwiseLeftShift;
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Lt;
    }
    /// Read token start with '=', it possible can be '=', '==' 
    fn read_eq_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Equal;
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Assignment;
    }
    /// Read token when start with '&', it possible can be '&', '&=', '&&'
    fn read_and_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::BitwiseAndAssignment;
                    return;
                }
                '&' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::LogicalAnd;
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::BitwiseAnd;
    }
    /// Read token when start with '|', it possible can be '|', '|=', '||'
    fn read_or_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::BitwiseOrAssignment;
                    return;
                }
                '&' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::LogicalOr;
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::BitwiseOr;
    }
    /// Read token when start with '!', it possible can be '!', '!='
    fn read_not_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::NotEqual;
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::LogicalNot;
    }
    /// Read token when start with '~', it possible can be '~'
    fn read_bitwise_not_start(&mut self) {
        self.eat_char();
        self.finish_token();
        self.current_kind = TokenKind::BitwiseNot;
    }
    /// Read token when start with '~', it possible can be '^', '^='
    fn read_xor_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::BitwiseXorAssignment;
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::BitwiseXor;
    }
    /// Read a identifier or keyword. frist start reading string until
    /// meet some punctuator or ignoreable char, and see if it is a keyword
    /// by string match, if not a keyword, it must be a identifier.
    fn read_word(&mut self) {
        self.eat_char();
        loop {
            if let Some(ch) = self.get_char() {
                match ch {
                    '+' | '-' | '*' | '%' | '/' | '&' | '\'' | '"' | 
                    '<' | '>' | '=' | '?' | '#' | '~' | '^' | '!' |
                    '{' | '}' | '[' | ']' | '(' | ')'  | ';' | ',' | '.'=> break,
                    '\t' | ' '| '\n' => break,
                    '\\' => {
                        let next_char = self.source[self.current_offset + 1..].chars().next();
                        if let Some(ch) = next_char {
                            match ch {
                                'u' => {
                                    self.eat_char();
                                    self.eat_char();
                                    let start = self.current_offset;
                                    self.read_hex_sequence();
                                    if self.current_offset - start != 4 {
                                        panic!();
                                    }
                                }
                                'U' => {
                                    self.eat_char();
                                    self.eat_char();
                                    let start = self.current_offset;
                                    self.read_hex_sequence();
                                    if self.current_offset - start != 8 {
                                        panic!();
                                    }
                                }
                                _ => {}
                            }
                        }
                        // TODO: should panic
                        panic!("lexical panic");
                    }
                    _ => self.eat_char()
                }
            }
        }
        self.finish_token();
        let word = &self.source[self.start_span.offset..self.current_offset];
        self.current_kind = match word  {
            "auto" => TokenKind::Auto,
            "break" => TokenKind::Break, 
            "case" => TokenKind::Case,
            "char" => TokenKind::Char,
            "const" => TokenKind::Const,
            "continue" => TokenKind::Continue,
            "default" => TokenKind::Default,
            "Do" => TokenKind::Do,
            "double" => TokenKind::Double,
            "else" => TokenKind::Else,
            "enum" => TokenKind::Enum,
            "extern" => TokenKind::Extern,
            "float" => TokenKind::Float,
            "for" => TokenKind::For,
            "goto" => TokenKind::Goto,
            "if" => TokenKind::If,
            "inline" => TokenKind::Inline,
            "int" => TokenKind::Int,
            "long" => TokenKind::Long,
            "register" => TokenKind::Register,
            "restrict" => TokenKind::Restrict,
            "return" => TokenKind::Return,
            "short" => TokenKind::Short,
            "signed" => TokenKind::Signed, 
            "sizeof" => TokenKind::Sizeof,
            "static" => TokenKind::Static,
            "struct" => TokenKind::Struct,
            "switch" => TokenKind::Switch,
            "typedef" => TokenKind::Typedef,
            "union" => TokenKind::Union,
            "unsigned" => TokenKind::Unsigned,
            "void" => TokenKind::Void,
            "volatile" => TokenKind::Volatile,
            "while" => TokenKind::While,
            "_Bool" => TokenKind::_Bool,
            "_Complex" => TokenKind::_Complex,
            "_Imaginary" => TokenKind::_Imaginary,
            _ => TokenKind::Identifier,
        };
    }
    fn read_char_or_string_literal(&mut self, mode: char) {
        // eat mode
        self.eat_char();
        let mut escap = false;
        loop {
            if let Some(ch) = self.get_char() {
                if escap {
                    match ch {
                        '\\' | 'a' | 'b' | '?' | '\'' | '\"' | 'f' | 'n' | 'r' | 't' | 'v' | '\n' => {
                            self.eat_char();
                            escap = false;
                        }
                        'u' => {
                            self.eat_char();
                            self.eat_char();
                            let start = self.current_offset;
                            self.read_hex_sequence();
                            if self.current_offset - start != 4 {
                                panic!();
                            }
                        }
                        'U' => {
                            self.eat_char();
                            self.eat_char();
                            let start = self.current_offset;
                            self.read_hex_sequence();
                            if self.current_offset - start != 8 {
                                panic!();
                            }
                        }
                        'x' => { 
                            self.eat_char();
                            let start = self.current_offset;
                            self.read_hex_sequence();
                            if self.current_offset - start > 1 {
                                panic!();
                            }
                            escap = false; 
                        }
                        '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'  => {
                            let start = self.current_offset;
                            self.read_oct_sequence();
                            if self.current_offset - start > 3 {
                                panic!();
                            }
                            escap = false;
                        }
                        _ => {
                            /* TODO: invalid escap */
                        }
                    }
                }else {
                    match ch {
                        '\'' | '\"' | '\n' => break,
                        '\\' => {
                            escap = true;
                        }
                        _ => self.eat_char()
                    }
                }
            }
        }
        if let Some(ch) = self.get_char() {
            if ch == mode {
                self.eat_char();
                self.finish_token();
                self.current_kind = if mode == '\'' {
                        TokenKind::CharLiteral
                    } else {
                        TokenKind::StringLiteral
                    }
                ;
                return;
            }
        }
        // TODO: error of unclose char string
    }
    fn read_number(&mut self) {
        match self.get_char() {
            Some(ch) => {
                match ch {
                    '1' | '2' | '3' | '4' | '5' | '6' |'7' | '8' | '9' => self.read_non_zero_decimal_start_number(),
                    '0' => {
                        if let Some(next_char) = self.source[self.current_offset + 1 ..].chars().next() {
                            if next_char == 'X' || next_char == 'x' {
                                self.read_hex_prefix_start_number();
                                return;
                            }
                        }
                        self.read_zero_start_number();
                    }
                    '.' => self.read_dot_start_number(),
                    _ => unreachable!(),
                }
            }
            None => {
                unreachable!();
            }
        };
    }
    /// Read number literal when start with non-zero decimal.
    /// - decimal integer : `non-zero(decimal)*`
    /// - decimal float :  `(decimal)*.(decimal)`
    fn read_non_zero_decimal_start_number(&mut self) {
        self.read_decimal_sequence();
        if let Some(ch_1) = self.get_char() {
            if ch_1 == '.' {
                self.eat_char();
                self.read_decimal_sequence();
                if let Some(ch_2) = self.get_char() {
                    if ch_2 == 'e' || ch_2 == 'E' {
                        self.eat_char();
                        if let Some(ch_3) = self.get_char() {
                            if ch_3 == '+' || ch_3 == '-' {
                                self.eat_char();
                            }
                        }
                        self.read_decimal_sequence();
                    }
                }
                let suffix = self.read_float_suffix();
                self.finish_token();
                self.current_kind = TokenKind::FloatLiteral(FloatLiteralBase::Decimal, suffix);
                return;
            }
        }
        let suffix_tuple = self.read_int_suffix();
        self.finish_token();
        self.current_kind = TokenKind::IntLiteral(IntLiteralBase::Decimal, suffix_tuple);
    }
    /// Read number literal when start with 0 but not hex number.
    /// - decimal float
    /// - octal integer
    fn read_zero_start_number(&mut self) {
        // eat 0
        self.eat_char();
        let mark = self.current_offset;
        let mut have_decimal = false;
        loop {
            match self.get_char() {
                Some(ch) => {
                    match ch {
                        '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' => self.eat_char(),
                        '8' | '9' => {
                            have_decimal = true;
                            self.eat_char();
                        }
                        _ => break,
                    }
                }
                None => break,
            }
        }
        let len = self.current_offset - mark;
        if let Some(ch) = self.get_char() {
            if ch == '.' {
                self.eat_char();
                self.read_decimal_sequence();
                if let Some(ch_1) = self.get_char() {
                    if ch_1 == 'e' || ch_1 == 'E' {
                        self.eat_char();
                        if let Some(ch_2) = self.get_char() {
                            if ch_2 == '+' || ch_2 == '-' {
                                self.eat_char();
                            }
                        }
                        self.read_decimal_sequence();
                    }
                }
                let suffix = self.read_float_suffix();
                self.finish_token();
                self.current_kind = TokenKind::FloatLiteral(FloatLiteralBase::Decimal, suffix);
                return;
            }
        }
        if have_decimal {
            lexer_panic!("octal number can not have 8 or 9 decimal");
        }
        let suffix_tuple = self.read_int_suffix();
        self.finish_token();
        if len == 0 {
            self.current_kind = TokenKind::IntLiteral(IntLiteralBase::Decimal, suffix_tuple);
        }else {
            self.current_kind = TokenKind::IntLiteral(IntLiteralBase::Octal, suffix_tuple);
        }
    }
    /// Read number literal when start with hex prefix like `0x` or `0X`
    /// 
    fn read_hex_prefix_start_number(&mut self) {
        // eat 0x | 0X
        self.eat_char();
        self.eat_char();
        self.read_hex_sequence();
        if let Some(ch) = self.get_char() {
            if ch == '.' {
                self.eat_char();
                self.read_hex_sequence();
                if let Some(ch_1) = self.get_char() {
                    if ch_1 == 'p' || ch_1 == 'P' {
                        self.eat_char();
                        if let Some(ch_2) = self.get_char() {
                            if ch_2 == '+' || ch_2 == '-' {
                                self.eat_char();
                            }
                        }
                        self.read_decimal_sequence();
                    }
                }
                let suffix = self.read_float_suffix();
                self.finish_token();
                self.current_kind = TokenKind::FloatLiteral(FloatLiteralBase::Hex,suffix);
                return;
            }
        }
        let suffix_tuple = self.read_int_suffix();
        self.finish_token();
        self.current_kind = TokenKind::IntLiteral(IntLiteralBase::Hex, suffix_tuple);

    }
    fn read_dot_start_number(&mut self) {
        self.eat_char();
        let start = self.current_offset;
        self.read_decimal_sequence();
        let len = self.current_offset - start;
        if let Some(ch_1) = self.get_char() {
            if ch_1 == 'e' || ch_1 == 'E' {
                self.eat_char();
                if let Some(ch_2) = self.get_char() {
                    if ch_2 == '+' || ch_2 == '-' {
                        self.eat_char();
                    }
                }
                self.read_decimal_sequence();
            }
        }
        if len == 0 {
            lexer_panic!("float number start with dot can not have no decimal following");
        }
        let suffix = self.read_float_suffix();
        self.finish_token();
        // decimal float literal
        self.current_kind = TokenKind::FloatLiteral(FloatLiteralBase::Decimal,suffix);
    }
    /// (Maybe) Read integer number suffix
    /// - unsigned-suffix long-suffix(opt)
    /// - unsigned-suffix long-long-suffix(opt)
    /// - long-suffix unsigned-suffix(opt)
    /// - long-long-suffix unsigned-suffix(opt)
    fn read_int_suffix(&mut self) -> (Option<LongIntSuffix>, bool) {
        if let Some(ch) = self.get_char() {
            if ch == 'l' || ch == 'L' {
                let long_suffix = self.read_long_integer_suffix();
                let unsign_suffix = self.read_unsigned_integer_suffix();
                return (long_suffix, unsign_suffix);
            }
            if ch == 'u' || ch == 'U' {
                let unsign_suffix = self.read_unsigned_integer_suffix();
                let long_suffix = self.read_long_integer_suffix();
                return (long_suffix, unsign_suffix);
            }
        }
        return (None, false);
    }
    fn read_long_integer_suffix(&mut self) -> Option<LongIntSuffix> {
        if let Some(ch) = self.get_char() {
            if ch == 'l' || ch == 'L' {
                if let Some(next_ch) = self.source[self.current_offset + 1 ..].chars().next() {
                    if ch == 'l' || next_ch == 'l' {
                        self.eat_char();
                        self.eat_char();
                        return Some(LongIntSuffix::LongLong);
                    }
                    if ch == 'L' || next_ch == 'L' {
                        self.eat_char();
                        self.eat_char();
                        return Some(LongIntSuffix::LongLong);
                    }
                }else {
                    self.eat_char();
                    return Some(LongIntSuffix::Long);
                }
            }
        }
        return None;
    }
    fn read_unsigned_integer_suffix(&mut self)-> bool {
        if let Some(ch) = self.get_char() {
            if ch == 'u' || ch == 'U' {
                self.eat_char();
                return true;
            }
        }
        return false;
    }
    /// Read float suffix if possible, return a bool to 
    /// indicate is a float suffix being read or not.
    fn read_float_suffix(&mut self) -> bool {
        if let Some(ch) = self.get_char() {
            if ch == 'l' || ch == 'L' || ch == 'f' || ch == 'F' {
                self.eat_char();
                return true;
            }
        }
        return false;
    }
    fn read_decimal_sequence(&mut self) {
        loop {
            if let Some(ch) = self.get_char() {
                match ch {
                    '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' => self.eat_char(),
                    _ => break
                }
            }else {
                break;
            }
        }
    }
    fn read_hex_sequence(&mut self) {
        loop {
            if let Some(ch) = self.get_char() {
                match ch {
                    '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 
                    'a' | 'b' | 'c' | 'd' | 'e' | 'f' |
                    'A' | 'B' | 'C' | 'D' | 'E' | 'F' => self.eat_char(),
                    _ => break
                }
            }else {
                break;
            }
        }
    }
    fn read_oct_sequence(&mut self) {
        loop {
            if let Some(ch) = self.get_char() {
                match ch {
                    '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'  => self.eat_char(),
                    _ => break
                }
            }else {
                break;
            }
        }
    }
}
