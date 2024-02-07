use crate::lexer::TokenKind;
use crate::finish_token_with_eat;
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
                        is_escap = true;
                        self.eat_char();
                    }
                    '\n' => {
                        if is_escap {
                            self.eat_char();
                            is_escap = false;
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
}