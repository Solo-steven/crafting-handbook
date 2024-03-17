use std::str::CharIndices;
use std::borrow::Cow;
use std::mem::replace;
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
pub struct LexerStateCache<'a> {
    pub token: TokenKind,
    pub raw_value: Cow<'a, str>,
    pub start_span: Span,
    pub finish_span: Span,
    pub last_finish_span: Span,
    pub line_terminator_flag: bool,
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
    /// (special purpose) is current lexer in template string state
    is_in_template_literal_stack_counter: usize,
    /// (special purpose) if current lexer in template string state, record the stack of bracs
    template_liter_braces_stack: Vec<i8>,
    /// (special purpose) 
    last_finish_span: Span,
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
                    last_finish_span: Span::new(0, 0, 0),
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
                    last_finish_span: Span::new(0, 0, 0),
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
        self.last_finish_span = replace(&mut self.finish_span, Span::new(self.cur_offset, self.cur_line, self.cur_offset - self.cur_line_start));
    }
    /// Move to next token
    pub fn next_token(&mut self) {
        if self.lookahead_buffer.len() > 0 {
            let next_token_with_span = self.lookahead_buffer.pop().unwrap();
            self.cur_token = next_token_with_span.token;
            self.start_span = next_token_with_span.start_span;
            self.last_finish_span =  replace(&mut self.finish_span, next_token_with_span.finish_span);
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
    /// Get start span immutable reference
    pub fn get_start_span_ref(&self) -> &Span {
        &self.start_span
    }
    /// Get finish span of current token
    pub fn get_finish_span(&self) -> Span {
        self.finish_span.clone()
    }
    /// Get finish span immutable reference
    pub fn get_finish_span_ref(&self) -> &Span {
        &self.finish_span
    }
    /// Lookahead next token
    pub fn lookahead_token(&mut self) -> TokenKind {
        if self.lookahead_buffer.len() != 0 {
            self.lookahead_buffer.last().unwrap().token.clone()
        }else {
            let cur_token_with_span = TokenWithSpan {
                token: self.get_token(),
                start_span: self.get_start_span(),
                finish_span: self.get_finish_span(),
            };
            let cur_last_span = self.last_finish_span.clone();
            self.next_token();
            let next_token_with_span =  TokenWithSpan {
                token: self.get_token(),
                start_span: self.get_start_span(),
                finish_span: self.get_finish_span(),
            };
            let return_token = next_token_with_span.token.clone();
            self.lookahead_buffer.push(next_token_with_span);
            self.cur_token = cur_token_with_span.token;
            self.start_span = cur_token_with_span.start_span;
            self.finish_span = cur_token_with_span.finish_span;
            self.last_finish_span = cur_last_span;
            return_token
        }
    }
    pub fn lookahead_token_and_flag(&mut self) -> (TokenKind, bool) {
        if self.lookahead_buffer.len() != 0 {
            let lookahead = self.lookahead_buffer.last().unwrap();
            let token = lookahead.token.clone();
            let mut flag = false;
            let last_offset = lookahead.start_span.offset;
            let cur_start_offset = self.finish_span.offset;
            let mut chars = self.source[cur_start_offset..last_offset].chars();
            loop {
                let ch_opt = chars.next();
                if let Some(ch) = ch_opt {
                    if ch == '\n' {
                        flag = true;
                        break;
                    }
                }else {
                    break;
                }
            }
            (token, flag)
        }else {
            let cur_token_with_span = TokenWithSpan {
                token: self.get_token(),
                start_span: self.get_start_span(),
                finish_span: self.get_finish_span(),
            };
            let cur_last_span = self.last_finish_span.clone();
            self.next_token();
            let next_token_with_span =  TokenWithSpan {
                token: self.get_token(),
                start_span: self.get_start_span(),
                finish_span: self.get_finish_span(),
            };
            let token = self.get_token();
            let flag = self.get_line_terminator_flag();
            self.lookahead_buffer.push(next_token_with_span);
            self.cur_token = cur_token_with_span.token;
            self.start_span = cur_token_with_span.start_span;
            self.finish_span = cur_token_with_span.finish_span;
            self.last_finish_span = cur_last_span;
           (token, flag)
        }
    }
    pub fn lookahead_lexer_state(&mut self) -> LexerStateCache<'a> {
        if self.lookahead_buffer.len() != 0 {
            let lookahead = self.lookahead_buffer.last().unwrap().clone();
            let mut flag = false;
            let last_offset = lookahead.start_span.offset;
            let cur_start_offset = self.finish_span.offset;
            let mut chars = self.source[cur_start_offset..last_offset].chars();
            loop {
                let ch_opt = chars.next();
                if let Some(ch) = ch_opt {
                    if ch == '\n' {
                        flag = true;
                        break;
                    }
                }else {
                    break;
                }
            }
            let value = self.get_value(lookahead.start_span.offset, lookahead.finish_span.offset);
            LexerStateCache {
                token: lookahead.token,
                start_span: lookahead.start_span,
                finish_span: lookahead.finish_span,
                last_finish_span: self.get_finish_span(),
                line_terminator_flag: flag,
                raw_value: value
            }
        }else {
            let cur_token_with_span = TokenWithSpan {
                token: self.get_token(),
                start_span: self.get_start_span(),
                finish_span: self.get_finish_span(),
            };
            let cur_last_span = self.last_finish_span.clone();
            self.next_token();
            let next_token_with_span =  TokenWithSpan {
                token: self.get_token(),
                start_span: self.get_start_span(),
                finish_span: self.get_finish_span(),
            };
            let value = self.get_value(self.get_start_span_ref().offset,  self.get_finish_span_ref().offset);
            let flag = self.get_line_terminator_flag();
            self.lookahead_buffer.push(next_token_with_span.clone());
            self.cur_token = cur_token_with_span.token;
            self.start_span = cur_token_with_span.start_span;
            self.finish_span = cur_token_with_span.finish_span;
            self.last_finish_span = cur_last_span;
            LexerStateCache {
                token: next_token_with_span.token,
                start_span: next_token_with_span.start_span,
                finish_span: next_token_with_span.finish_span,
                last_finish_span: self.finish_span.clone(),
                line_terminator_flag: flag,
                raw_value: value
            }
        }
    }
    pub fn get_value(&self, start_offset: usize, finish_offset: usize) -> Cow<'a, str> {
        Cow::Borrowed(&self.source[start_offset..finish_offset])
    }
    pub fn get_current_value(&self) -> Cow<'a, str> {
        let start_offset = self.start_span.offset;
        let finish_offset = self.finish_span.offset;
        Cow::Borrowed(&self.source[start_offset..finish_offset])
    }
    pub fn get_line_terminator_flag(&self) -> bool {
        let last_offset = self.last_finish_span.offset;
        let cur_start_offset = self.start_span.offset;
        let mut chars = self.source[last_offset..cur_start_offset].chars();
        loop {
            let ch_opt = chars.next();
            if let Some(ch) = ch_opt {
                if ch == '\n' {
                    return true;
                }
            }else {
                break;
            }
        }
        false
    }
    /// ## Get Span of last finish token
    /// Expose this api for parser needed. for example, think about parse a expression statement.
    /// ```test
    /// fn parse_expr_stmt(&mut self) -> ParserResult<ExpressionStatement<'a>> {
    ///     let expr = self.parse_expr()?;
    ///     self.check_strict_mode(&expr)?;
    ///     self.semi()?;
    ///     Ok(ExpressionStatement { expr })
    /// }
    /// ```
    /// if we wanna to get a finish span of expression statement, we need to check the semi exist or not, 
    /// if not exsit, we will need to clone the finish span of expression statement, otherwise, get the
    /// finish span of semi.
    /// ```test
    /// let option_span = self.semi()?;
    /// let finish_sapn = if let Some(span) = option_span {
    ///     span
    /// }else {
    ///     expr.finish_span.clone()
    /// }
    /// ```
    /// Just for getting the finish span, we need to add more the 5 line of code with a if statement. 
    /// but actually, no matter semi exsit or not, the `last_finish_span` will storage the correct info
    /// about last token, just might be semi or finish span of expression, so with this api. we can get
    /// finish span with just one line of code, which is more concise and reduce the cost of if statement.
    /// ```test
    /// let finish_span = self.get_last_token_finish_span();
    /// ```
    pub fn get_last_token_finish_span(&self) -> Span {
        self.last_finish_span.clone()
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