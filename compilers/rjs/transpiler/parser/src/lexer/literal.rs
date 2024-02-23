use crate::lexer::TokenKind;
use crate::{finish_token_with_eat, finish_token};
use super::{Lexer, LexerResult};

impl<'a> Lexer<'a> {
    pub (super) fn read_string_literal(&mut self, end_char: char) -> LexerResult {
        let mut is_escap = false;
        loop {
            if let Some(ch) = self.get_char() {
                if ch == end_char && !is_escap {
                    finish_token_with_eat!(TokenKind::StringLiteral, self);
                }
                match ch {
                    '\\' => {
                        is_escap = !is_escap ;
                        self.eat_char();
                    }
                    '\n' => {
                        if is_escap {
                            self.eat_char();
                            is_escap = false;
                            self.cur_line += 1;
                            self.cur_offset = self.cur_offset;
                        }else {
                            // TODO: string change line but no escap
                            panic!()
                        }
                    }
                    _ => {
                        is_escap = false;
                        self.eat_char();
                    }
                }
            }else {
                panic!()
            }
        }
    }
    pub (super) fn read_template(&mut self, is_head: bool) -> LexerResult {
        self.eat_char();
        let mut is_escpa = false;
        loop {
            if let Some(ch) = self.get_char() {
                match ch {
                    '\n' => {
                        self.eat_char();
                        is_escpa = false;
                        self.cur_line += 1;
                        self.cur_offset = self.cur_offset;
                    }
                    '`' => {
                        if is_escpa {
                            self.eat_char();
                            is_escpa = false;
                        }else {
                            finish_token_with_eat!(
                                if is_head  {
                                    TokenKind::TemplateNoSubstitution
                                } else {
                                    self.is_in_template_literal_stack_counter -= 1;
                                    TokenKind::TemplateTail
                                }, 
                                self
                            );
                        }
                    }
                    '$' => {
                        if is_escpa {
                            self.eat_char();
                            is_escpa = false;
                        }else {
                            self.eat_char();
                            if Some('{') == self.get_char() {
                                self.is_in_template_literal_stack_counter += 1;
                                self.template_liter_braces_stack.push(1);
                                finish_token_with_eat!(
                                    if is_head  {
                                        TokenKind::TemplateHead
                                    } else {
                                        TokenKind::TemplateMiddle
                                    }, 
                                    self
                                );
                            }
                        }
                    }
                    '\\' => {
                        is_escpa = !is_escpa;
                        self.eat_char();
                    }
                    _ => { 
                        is_escpa = false;
                        self.eat_char()
                    }
                }
            }else {
                // TODO ERROR:
                panic!("{:?}", is_head)
            }
        }
    }
    pub (super) fn read_number_literal(&mut self) -> LexerResult {
        let start_ch = self.get_char().unwrap();
        if start_ch == '0' {
            self.eat_char();
            if let Some(ch) = self.get_char() {
                println!("{}", ch);
                match ch {
                    '.' => {
                        self.eat_char();
                        self.read_digital_string();
                        finish_token!(TokenKind::NumberLiteral, self);
                    },
                    'b' | 'B' => { return self.read_binary_number_literal() },
                    'o' | 'O' => { return self.read_oct_number_literal() },
                    'x' | 'X' => { return self.read_hex_number_literal() },
                    _ => {}
                }
            }
            finish_token!(TokenKind::NumberLiteral, self);
        }
        // start with non 0, do three step
        // 1. read int part
        // 2. read float part,
        // 3. read expon part
        self.eat_char();
        self.read_digital_string();
        if self.get_char() == Some('.') {
            self.eat_char();
            self.read_digital_string();
        }
        if self.get_char() == Some('e') || self.get_char() == Some('E') {
            self.eat_char();
            if self.get_char() == Some('-') || self.get_char() == Some('+') {
                self.eat_char();
            }
            self.read_digital_string();
        }
        finish_token!(TokenKind::NumberLiteral, self);
    }
    pub (super) fn read_digital_string(&mut self) {
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
    fn read_binary_number_literal(&mut self) -> LexerResult {
        self.eat_char();
        let mut is_seprator = false;
        loop {
            if let Some(ch) = self.get_char() {
                match ch {
                    '0' | '1' => { 
                        is_seprator = false;
                        self.eat_char()
                    },
                    '_' => is_seprator = true,
                    _ => break
                }
            }else {
                break;
            }
        }
        if is_seprator { panic!() }
        finish_token!(TokenKind::NumberLiteral, self);
    }
    fn read_oct_number_literal(&mut self) -> LexerResult {
        self.eat_char();
        let mut is_seprator = false;
        loop {
            if let Some(ch) = self.get_char() {
                match ch {
                    '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' => { 
                        is_seprator = false;
                        self.eat_char()
                    },
                    _ => break
                }
            }else {
                break;
            }
        }
        if is_seprator { panic!() }
        finish_token!(TokenKind::NumberLiteral, self);
    }
    fn read_hex_number_literal(&mut self) -> LexerResult {
        self.eat_char();
        let mut is_seprator = false;
        loop {
            if let Some(ch) = self.get_char() {
                match ch {
                    '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' |
                    'a' | 'b' | 'c' | 'd' | 'e' | 'A' | 'B' | 'C' | 'D' | 'E' 
                    => { 
                        is_seprator = false;
                        self.eat_char()
                    },
                    '_' => is_seprator = true,
                    _ => break
                }
            }else {
                break;
            }
        }
        if is_seprator { panic!() }
        finish_token!(TokenKind::NumberLiteral, self);
    }
}