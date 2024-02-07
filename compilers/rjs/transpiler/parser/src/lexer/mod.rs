
use std::str::CharIndices;
use crate::token::TokenKind;
use crate::{finish_token, finish_token_with_eat};
use crate::span::Span;

mod operator;
mod literal;
mod keyword;

pub struct Lexer<'a> {
    source: &'a str,
    char_iter: CharIndices<'a>,
    cur_char: Option<char>,
    cur_token: TokenKind,

    cur_line: usize,
    cur_line_start: usize,
    cur_offset: usize,

    start_span: Span,
    finish_span: Span,
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
                    finish_span: Span::new(0, 0, 0)
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
                    finish_span: Span::new(0, 0, 0)
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
        match self.scan() {
            Ok(_) => {}
            Err(_) => {}
        }
    }
    /// Get current token
    pub fn get_token(&self) -> TokenKind {
        self.cur_token.clone()
    }
    /// Get start span of current token
    pub fn get_start_span(&self) -> Span {
        self.start_span.clone()
    }
    /// Get finish span of current token
    pub fn get_finish_span(&self) -> Span {
        self.finish_span.clone()
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
                    // 
                    // ==========================
                    '{' => { finish_token_with_eat!(TokenKind::BracesLeftPunctuator, self); },
                    '}' => { finish_token_with_eat!(TokenKind::BracesRightPunctuator, self); }
                    '[' => { finish_token_with_eat!(TokenKind::BracketLeftPunctuator, self); }
                    ']' => { finish_token_with_eat!(TokenKind::BracesRightPunctuator, self); }
                    '(' => { finish_token_with_eat!(TokenKind::ParenthesesRightPunctuator, self); }
                    ')' => { finish_token_with_eat!(TokenKind::ParenthesesRightPunctuator, self); }
                    ':' => { finish_token_with_eat!(TokenKind::ColonPunctuator, self); }
                    ';' => { finish_token_with_eat!(TokenKind::SemiPunctuator, self); }
                    // ==========================
                    //  
                    // ==========================
                    ',' => { finish_token_with_eat!(TokenKind::CommaToken, self); }
                    '+' => self.read_plus(),
                    '-' => self.read_minus(),
                    '*' => self.read_multi(),
                    '/' =>  self.read_divide(),
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
                    // ==========================
                    //  
                    // ========================== 
                    '\'' | '\"' => self.read_string_literal(ch),
                    '`' => {
                        todo!()
                    }
                    _ => self.read_word()
                }
            }
        }
    }

}