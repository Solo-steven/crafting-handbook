use crate::parser::{Parser, ParserResult};
use crate::ast::declaration::*;
use crate::token::TokenKind;

impl<'a> Parser<'a> {
    pub (super) fn parse_declaration(&mut self) -> ParserResult<Declaration<'a>> {
        Ok(match self.get_token_ref() {
            TokenKind::Identifier => {
                // TODO: Document, this code only reach by pre-checking is aync
                Declaration::FunDeclar(self.parse_function_declaration(true)?)
            }
            TokenKind::FunctionKeyword => {
                Declaration::FunDeclar(self.parse_function_declaration(false)?)
            }
            TokenKind::ConstKeyword | TokenKind::LetKeyword => {
                Declaration::VarDeclar(self.parse_variable_declaration(false)?)
            }
            TokenKind::ClassKeyword => {
                Declaration::ClassDeclar(self.parse_class_declaration()?)
            }
            _ => unreachable!()
        })
    }
    fn parse_function_declaration(&mut self, is_async: bool) -> ParserResult<FunctionDeclaration<'a>> {
        todo!()
    }
    fn parse_variable_declaration(&mut self, in_for_init: bool) -> ParserResult<VariableDeclaration<'a>> {
        todo!()
    }
    fn parse_class_declaration(&mut self) -> ParserResult<ClassDeclaration<'a>> {
        todo!()
    }
}
