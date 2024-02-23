use std::str::CharIndices;
use std::borrow::Cow;
use serde::{Deserialize, Serialize};
use crate::token::TokenKind;
use crate::{finish_token, finish_token_with_eat};
use crate::span::Span;

mod operator;
mod literal;
mod keyword;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TokenWithSpan {
    pub token: TokenKind,
    pub start_span: Span,
    pub finish_span: Span,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TokenWithSpanAndValue<'a> {
    pub token: TokenKind,
    pub raw_value: Cow<'a, str>,
    pub start_span: Span,
    pub finish_span: Span,
}
/// ## JavaScript Lexer Structure
pub struct Lexer<'a> {
    /// source code string
    source: &'a str,
    /// unicode iterator of source code
    char_iter: CharIndices<'a>,
    /// current char, None when reach eof of line.
    cur_char: Option<char>,
    /// current token
    cur_token: TokenKind,
    /// current line
    cur_line: usize,
    /// offset of current line
    cur_line_start: usize,
    /// current offset
    cur_offset: usize,
    /// start span structure of current token
    start_span: Span,
    /// finish span structure of current token
    finish_span: Span,
    /// lookahead buffer
    lookahead_buffer: Vec<TokenWithSpan>,
    /// is current lexer in template string state
    is_in_template_literal_stack_counter: usize,
    /// if current lexer in template string state, record the stack of bracs
    template_liter_braces_stack: Vec<i8>,
}

pub type LexerResult = Result<(), ()>;

impl<'a> Lexer<'a> {
    /// create a new lexer by given source code.
    pub fn new(source: &'a str) -> Self {
        let mut iter = source.char_indices();
        let mut lexer =  match iter.next() {
            Some((offset, ch)) => {
                Self {
                    source,
                    char_iter: iter,
                    cur_char: Some(ch),
                    cur_token : TokenKind::Start,
                    cur_line: 0,
                    cur_line_start: offset,
                    cur_offset: offset,
                    start_span: Span::new(0,0,0),
                    finish_span: Span::new(0, 0, 0),
                    lookahead_buffer: Vec::with_capacity(4),
                    is_in_template_literal_stack_counter: 0,
                    template_liter_braces_stack: Vec::new(),
                }
            }
            None => {
                Self {
                    source,
                    char_iter: iter,
                    cur_char: None,
                    cur_token: TokenKind::EOFToken,
                    cur_line:0, cur_line_start: 0, cur_offset: 0,
                    start_span: Span::new(0,0,0),
                    finish_span: Span::new(0, 0, 0),
                    lookahead_buffer: Vec::with_capacity(4),
                    is_in_template_literal_stack_counter: 0,
                    template_liter_braces_stack: Vec::new(),
                }
            }
        };
        if lexer.cur_token == TokenKind::Start {
            lexer.next_token();
        }
        lexer
    }
    /// ## Get Current Charater
    /// Private method for get current char, it current char is None, meaning that
    /// lexer has read end of file.
    fn get_char(&self) -> Option<char> {
        self.cur_char
    }
    /// ## Eat Current Char
    /// Private method for move to next char and change the value of offset.
    fn eat_char(&mut self) {
        match self.char_iter.next() {
            Some((offset, ch)) => {
                self.cur_offset = offset;
                self.cur_char = Some(ch);
            }
            None => {
                self.cur_offset = self.source.len();
                self.cur_char = None;
            }
        }
    }
    fn start_token(&mut self) {
        self.start_span = Span::new(self.cur_offset, self.cur_line, self.cur_offset - self.cur_line_start);
    }
    fn finish_token(&mut self) {
        self.finish_span = Span::new(self.cur_offset, self.cur_line, self.cur_offset - self.cur_line_start);
    }
    /// Move to next token
    pub fn next_token(&mut self) {
        if self.lookahead_buffer.len() > 0 {
            let next_token_with_span = self.lookahead_buffer.pop().unwrap();
            self.cur_token = next_token_with_span.token;
            self.start_span = next_token_with_span.start_span;
            self.finish_span = next_token_with_span.finish_span;
            return;
        }
        match self.scan() {
            Ok(_) => {}
            Err(_) => {}
        }
    }
    /// Get current token
    pub fn get_token(&self) -> TokenKind {
        self.cur_token.clone()
    }
    /// Get current token immutable reference
    pub fn get_token_ref(&self) -> &TokenKind {
        &self.cur_token
    }
    /// Get start span of current token
    pub fn get_start_span(&self) -> Span {
        self.start_span.clone()
    }
    /// Get start span ref 
    pub fn get_start_span_ref(&self) -> &Span {
        &self.start_span
    }
    /// Get finish span of current token
    pub fn get_finish_span(&self) -> Span {
        self.finish_span.clone()
    }
    pub fn get_finish_span_ref(&self) -> &Span {
        &self.finish_span
    }
    pub fn lookahead(&mut self) -> TokenWithSpan {
        if self.lookahead_buffer.len() != 0 {
            self.lookahead_buffer.last().unwrap().clone()
        }else {
            let cur_token_with_span = TokenWithSpan {
                token: self.get_token(),
                start_span: self.get_start_span(),
                finish_span: self.get_finish_span(),
            };
            self.next_token();
            let next_token_with_span =  TokenWithSpan {
                token: self.get_token(),
                start_span: self.get_start_span(),
                finish_span: self.get_finish_span(),
            };
            self.lookahead_buffer.push(next_token_with_span.clone());
            self.cur_token = cur_token_with_span.token;
            self.start_span = cur_token_with_span.start_span;
            self.finish_span = cur_token_with_span.finish_span;
            next_token_with_span
        }
    }
    pub fn get_value(&self, start_offset: usize, finish_offset: usize) -> Cow<'a, str> {
        Cow::Borrowed(&self.source[start_offset..finish_offset])
    }
    /// ## Skip all space and change line 
    /// Private method for lexer, when start scan a token, we need to 
    /// skip space and change line when read a token.
    fn skip_spacn_and_change_line(&mut self) {
        loop {
            if let Some(ch) = self.get_char() {
                match ch {
                    ' ' | '\t' => {
                        self.eat_char();
                        continue;
                    }
                    '\n' => {
                        self.eat_char();
                        self.cur_line += 1;
                        self.cur_line_start = self.cur_offset;
                        continue;
                    }
                    _ => {}
                }
            }
            break;
        }
    }
    /// ## Lexer State Machine
    /// Private method for reading a token, skip all ignoreable char frist, then switch between
    /// state machine to read token.
    fn scan(&mut self) -> LexerResult {
        self.skip_spacn_and_change_line();
        self.start_token();
        match self.get_char() {
            None => {
                finish_token!(TokenKind::EOFToken, self);
            }
            Some(ch) => {
                match ch {
                    // ==========================
                    //  Punctuator
                    // ==========================
                    '{' => { 
                        if self.is_in_template_literal_stack_counter > 0 {
                            self.template_liter_braces_stack.push(-1);
                        };
                        finish_token_with_eat!(TokenKind::BracesLeftPunctuator, self);
                    },
                    '}' => { 
                        if self.is_in_template_literal_stack_counter > 0 {
                            if let Some(stack_top )= self.template_liter_braces_stack.pop() {
                                if stack_top == 1 {
                                    return self.read_template(false);
                                }
                            }
                        } 
                        finish_token_with_eat!(TokenKind::BracesRightPunctuator, self); 
                    }
                    '[' => { finish_token_with_eat!(TokenKind::BracketLeftPunctuator, self); }
                    ']' => { finish_token_with_eat!(TokenKind::BracesRightPunctuator, self); }
                    '(' => { finish_token_with_eat!(TokenKind::ParenthesesLeftPunctuator, self); }
                    ')' => { finish_token_with_eat!(TokenKind::ParenthesesRightPunctuator, self); }
                    ':' => { finish_token_with_eat!(TokenKind::ColonPunctuator, self); }
                    ';' => { finish_token_with_eat!(TokenKind::SemiPunctuator, self); }
                    // ==========================
                    //  Operators
                    // ==========================
                    ',' => { finish_token_with_eat!(TokenKind::CommaToken, self); }
                    '+' => {self.read_plus() },
                    '-' => self.read_minus(),
                    '*' => self.read_multi(),
                    '/' => self.read_divide(),
                    '%' => self.read_mod(),
                    '>' => self.read_gt_then(),
                    '<' => self.read_lt_then(),
                    '=' => self.read_equal(),
                    '!' => self.read_logical_not(),
                    '&' => self.read_bitwise_and(),
                    '|' => self.read_bitwise_or(), 
                    '?' => self.read_question(),
                    '^' => self.read_bitwisexor(),
                    '~' => self.read_bitwisenot(),
                    '.' => self.read_dot(),
                    // ==========================
                    //  Literal
                    // ========================== 
                    '\'' | '\"' => self.read_string_literal(ch),
                    '`' => self.read_template(true),
                    '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' => self.read_number_literal(),
                    _ => self.read_word()
                }
            }
        }
    }
}