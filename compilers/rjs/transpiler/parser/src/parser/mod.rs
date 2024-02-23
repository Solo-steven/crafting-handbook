use crate::{lexer::Lexer, token::TokenKind};

pub struct Parser<'a> {
    lexer: Lexer<'a>
}

impl <'a> Parser<'a> {

    fn next_token(&mut self) {
        self.lexer.next_token();
    }
    fn get_token(&mut self) -> TokenKind {
        self.get_token()
    }
    pub fn parse(&mut self) {

    }
    
}