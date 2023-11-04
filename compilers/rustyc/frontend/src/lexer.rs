use std::borrow::Cow;
use std::str::CharIndices;

use crate::span::Span;
use crate::token::{TokenKind, PunctuatorKind, OperatorKind, KeywordKind};

#[derive(Debug, Clone, PartialEq)]
struct TokenWithSpan {
    kind: TokenKind,
    start_span: Span,
    finish_span: Span,
}

/// 
pub struct Lexer<'a> {
    source: Cow<'a, str>,
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
        Self {
            source: Cow::Borrowed(source),
            iter,
            lookahead_buffer: Vec::with_capacity(10),
            current_kind: start_token,
            current_char: ch,
            current_line_start: offset,
            current_offset: offset,
            current_line: 0,
            start_span: Span::new(),
            finish_span: Span::new(),
        }
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
    /// `current_line`` and `current_line_start` property if meet change-line 
    /// char
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
                self.current_kind = TokenKind::EOFToken;
            }
            Some(ch) => {
                match ch {
                    ',' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::Punctuators(PunctuatorKind::Comma);
                    }
                    ';' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::Punctuators(PunctuatorKind::Semi);
                    }
                    '{' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::Punctuators(PunctuatorKind::BracesLeft);
                    }
                    '}' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::Punctuators(PunctuatorKind::BracesRight);
                    }
                    '[' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::Punctuators(PunctuatorKind::BracketLeft);
                    }
                    ']' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::Punctuators(PunctuatorKind::BracesRight);
                    }
                    '(' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::Punctuators(PunctuatorKind::ParenthesesLeft);
                    }
                    ')' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::Punctuators(PunctuatorKind::ParenthesesRight);
                    }
                    '*' => {
                        self.read_multiple_start();
                    }
                    '/' => {

                    }
                    '%' => {
                        self.read_reminder_start();
                    }
                    '?' => {
                        self.eat_char();
                        self.finish_token();
                        self.current_kind = TokenKind::Operators(OperatorKind::Qustion);
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
                    self.current_kind = TokenKind::Operators(OperatorKind::Increment);
                }
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::SumAssignment)
                }
                _ => {
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::Plus)
                }
            }
        }else {
            self.finish_token();
            self.current_kind = TokenKind::Operators(OperatorKind::Plus)
        };
    }
    /// Read token when start with '-', it possible can be '-', '--', '-=', '->'
    fn read_minus_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '-' => {
                    self.eat_char();
                    self.current_kind = TokenKind::Operators(OperatorKind::Decrement);
                }
                '=' => {
                    self.eat_char();
                    self.current_kind = TokenKind::Operators(OperatorKind::DiffAssignment);
                }
                '>' => {
                    self.eat_char();
                    self.current_kind = TokenKind::Operators(OperatorKind::Arrow);
                }
                _ => {
                    self.current_kind = TokenKind::Operators(OperatorKind::Minus);
                }
            }
        }else {
            self.current_kind = TokenKind::Operators(OperatorKind::Minus);
        }
    }
    /// Read token when start with '*' char, is possible can be '*' or '*='
    fn read_multiple_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::ProductAssignment);
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Operators(OperatorKind::Multiplication);
    }
    /// Read token when start with '/', it possble can be '/', '/=', comment or blockcomment
    fn read_division_start() {

    }
    /// Read token when start with '%', it possible can be '%', '%='
    fn read_reminder_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::RemainderAssignment);
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Operators(OperatorKind::Remainder);
    }
    /// Read token when start with '>', it possible can be '>', '>>', '>=', '>>='
    fn read_gt_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::Geqt);
                    return;
                }
                '>' => {
                    self.eat_char();
                    if let Some(ch) = self.get_char() {
                        match ch {
                            '=' => {
                                self.eat_char();
                                self.finish_token();
                                self.current_kind = TokenKind::Operators(OperatorKind::BitwiseRightShiftAssignment);
                                return;
                            }
                            _ => {}
                        }
                    }
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::BitwiseRightShift);
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Operators(OperatorKind::Gt);
    }
    // Read token when start with '<', it possible can be '>', '>=', '>>', '>>='
    fn read_lt_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::Leqt);
                    return;
                }
                '<' => {
                    self.eat_char();
                    if let Some(ch) = self.get_char() {
                        match ch {
                            '=' => {
                                self.eat_char();
                                self.finish_token();
                                self.current_kind = TokenKind::Operators(OperatorKind::BitwiseLeftShiftAssignment);
                                return;
                            }
                            _ => {}
                        }
                    }
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::BitwiseLeftShift);
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Operators(OperatorKind::Lt);
    }
    /// Read token start with '=', it possible can be '=', '==' 
    fn read_eq_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::Equal);
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Operators(OperatorKind::Assignment);
    }
    /// Read token when start with '&', it possible can be '&', '&=', '&&'
    fn read_and_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::BitwiseAndAssignment);
                    return;
                }
                '&' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::LogicalAnd);
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Operators(OperatorKind::BitwiseAnd);
    }
    /// Read token when start with '|', it possible can be '|', '|=', '||'
    fn read_or_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::BitwiseOrAssignment);
                    return;
                }
                '&' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::LogicalOr);
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Operators(OperatorKind::BitwiseOr);
    }
    /// Read token when start with '!', it possible can be '!', '!='
    fn read_not_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::NotEqual);
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Operators(OperatorKind::LogicalNot);
    }
    /// Read token when start with '~', it possible can be '~'
    fn read_bitwise_not_start(&mut self) {
        self.eat_char();
        self.finish_token();
        self.current_kind = TokenKind::Operators(OperatorKind::BitwiseNot);
    }
    /// Read token when start with '~', it possible can be '^', '^='
    fn read_xor_start(&mut self) {
        self.eat_char();
        if let Some(ch) = self.get_char() {
            match ch {
                '=' => {
                    self.eat_char();
                    self.finish_token();
                    self.current_kind = TokenKind::Operators(OperatorKind::BitwiseXorAssignment);
                    return;
                }
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::Operators(OperatorKind::BitwiseXor);
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
                    '{' | '}' | '[' | ']' | '(' | ')' => break,
                    '\t' | ' '| '\n' => break,
                    _ => self.eat_char()
                }
            }
        }
        self.finish_token();
        let word = &self.source[self.start_span.offset..self.current_offset];
        self.current_kind = match word  {
            "auto" => TokenKind::Keyword(KeywordKind::Auto),
            "break" => TokenKind::Keyword(KeywordKind::Break), 
            "case" => TokenKind::Keyword(KeywordKind::Case),
            "char" => TokenKind::Keyword(KeywordKind::Char),
            "const" => TokenKind::Keyword(KeywordKind::Const),
            "continue" => TokenKind::Keyword(KeywordKind::Continue),
            "default" => TokenKind::Keyword(KeywordKind::Default),
            "Do" => TokenKind::Keyword(KeywordKind::Do),
            "double" => TokenKind::Keyword(KeywordKind::Double),
            "else" => TokenKind::Keyword(KeywordKind::Else),
            "enum" => TokenKind::Keyword(KeywordKind::Enum),
            "extern" => TokenKind::Keyword(KeywordKind::Extern),
            "float" => TokenKind::Keyword(KeywordKind::Float),
            "for" => TokenKind::Keyword(KeywordKind::For),
            "goto" => TokenKind::Keyword(KeywordKind::Goto),
            "if" => TokenKind::Keyword(KeywordKind::If),
            "inline" => TokenKind::Keyword(KeywordKind::Inline),
            "int" => TokenKind::Keyword(KeywordKind::Int),
            "long" => TokenKind::Keyword(KeywordKind::Long),
            "register" => TokenKind::Keyword(KeywordKind::Register),
            "restrict" => TokenKind::Keyword(KeywordKind::Restrict),
            "return" => TokenKind::Keyword(KeywordKind::Return),
            "short" => TokenKind::Keyword(KeywordKind::Short),
            "signed" => TokenKind::Keyword(KeywordKind::Signed), 
            "sizeof" => TokenKind::Operators(OperatorKind::Sizeof),
            "static" => TokenKind::Keyword(KeywordKind::Static),
            "struct" => TokenKind::Keyword(KeywordKind::Struct),
            "switch" => TokenKind::Keyword(KeywordKind::Switch),
            "typedef" => TokenKind::Keyword(KeywordKind::Typedef),
            "union" => TokenKind::Keyword(KeywordKind::Union),
            "unsigned" => TokenKind::Keyword(KeywordKind::Unsigned),
            "void" => TokenKind::Keyword(KeywordKind::Void),
            "volatile" => TokenKind::Keyword(KeywordKind::Volatile),
            "while" => TokenKind::Keyword(KeywordKind::While),
            "_Bool" => TokenKind::Keyword(KeywordKind::_Bool),
            "_Complex" => TokenKind::Keyword(KeywordKind::_Complex),
            "_Imaginary" => TokenKind::Keyword(KeywordKind::_Imaginary),
            _ => TokenKind::Identifier,
        };
    }
    fn read_number(&mut self) {
        loop {
            if let Some(ch) = self.get_char() {
                match ch {
                    '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'  => self.eat_char(),
                    _ => break
                }
            }
        }
        if let Some(ch) = self.get_char() {
            match ch {
                '.' => {}
                _ => {}
            }
        }
        self.finish_token();
        self.current_kind = TokenKind::LiteralValue;
    }
    fn read_digital_number() {
        
    }
}