use crate::parser::{Parser, ParserResult};
use crate::ast::declaration::*;
use crate::ast::expression::{Pattern, FunctionExpression, Identifier, ClassExpression, MethodDefinition};
use crate::token::TokenKind;
use crate::{match_token, sematic_error, syntax_error, expect, expect_with_start_span, expect_with_finish_span};

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
            TokenKind::ConstKeyword | TokenKind::LetKeyword | TokenKind::VarKeyword => {
                Declaration::VarDeclar(self.parse_variable_declaration(false)?)
            }
            TokenKind::ClassKeyword => {
                Declaration::ClassDeclar(self.parse_class_declaration()?)
            }
            _ => unreachable!()
        })
    }
    pub (super) fn parse_function_declaration(&mut self, is_async: bool) -> ParserResult<FunctionDeclaration<'a>> {
        let func_expr = self.parse_function(false, is_async)?;
        // TODO error: function name is none
        Ok(FunctionDeclaration { 
            name: func_expr.id, 
            params: func_expr.params, 
            body: func_expr.body, 
            generator: func_expr.generator, 
            is_async: func_expr.is_async,
            start_span: func_expr.start_span,
            finish_span: func_expr.finish_span,
        })
    }
    pub (super) fn parse_function(&mut self, is_expr: bool, is_async: bool) -> ParserResult<FunctionExpression<'a>> {
        self.enter_function_scope(is_async, false);
        let start_span = expect_with_start_span!(TokenKind::FunctionKeyword, self);
        let mut generator = false;
        if match_token!(TokenKind::MultiplyOperator, self) {
            generator = true;
            self.next_token();
            self.set_current_function_context_generator();
        }
        let id = self.parse_function_name(is_expr)?;
        let params = self.parse_function_params()?;
        let body = self.parse_function_body()?;
        let finish_span = self.get_last_finish_span();
        self.check_strict_mode_rules_for_function_name_and_params_in_current_function_scope(&id, &params)?;
        self.exit_scope();
        Ok(FunctionExpression {
            id, params, body,
            is_async: self.is_current_function_async(),
            generator,
            is_paran: false,
            start_span,
            finish_span,
        })
    }
    fn check_strict_mode_rules_for_function_name_and_params_in_current_function_scope(&self, name: &Option<Identifier>, params: &Vec<Pattern>) -> ParserResult<()> {
        if self.is_in_strict_mode() {
            if let Some(id) = name {
                match id.name.as_ref() {
                    "yield" | "let" | "static" | "implements" | "interface" | "package"| "private"| "protected"| "public" => {
                        sematic_error!(self.error_map.unexpect_keyword_in_stric_mode);
                    }
                    _ => {}
                }
            }
        }
        Ok(())
    }
    pub (super) fn parse_function_name(&mut self, is_expr: bool) -> ParserResult<Option<Identifier<'a>>> {
        Ok(match self.get_token_ref() {
            TokenKind::Identifier | TokenKind::LetKeyword => {
                Some(self.parse_identifier()?)
            }
            TokenKind::AwaitKeyword => {
                if is_expr {
                    if self.is_current_function_async() {
                        sematic_error!(self.error_map.when_in_async_context_await_keyword_will_treat_as_keyword);
                    }
                }else {
                    if self.is_parent_function_async() {
                        sematic_error!(self.error_map.when_in_async_context_await_keyword_will_treat_as_keyword);
                    }
                }
                Some(self.parse_identifier_with_keyword()?)
            },
            TokenKind::YieldKeyword => {
                if is_expr {
                    if self.is_current_function_generator() {
                        sematic_error!(self.error_map.when_in_yield_context_yield_will_be_treated_as_keyword);
                    }
                }else {
                    if self.is_parent_function_generator() {
                        sematic_error!(self.error_map.when_in_yield_context_yield_will_be_treated_as_keyword);
                    }
                }
                if self.is_in_strict_mode() {
                    sematic_error!(self.error_map.when_in_yield_context_yield_will_be_treated_as_keyword);
                }
                Some(self.parse_identifier_with_keyword()?)
            }
            _ => None
        })
    }
    pub (super) fn parse_function_params(&mut self) -> ParserResult<Vec<Pattern<'a>>> {
        expect!(TokenKind::ParenthesesLeftPunctuator, self);
        self.enter_function_parameter();
        let mut is_start = true;
        let mut is_end_with_rest = false;
        let mut params = Vec::new();
        loop {
            match self.get_token_ref() {
                TokenKind::ParenthesesRightPunctuator | TokenKind::EOFToken => break,
                _ => {
                    if is_start {
                        if match_token!(TokenKind::CommaToken, self) {
                            sematic_error!(self.error_map.function_parameter_can_not_have_empty_trailing_comma);
                        }
                        is_start = false;
                    }else {
                        expect!(TokenKind::CommaToken, self);
                    }
                    if match_token!(TokenKind::ParenthesesRightPunctuator, self) {
                        break;
                    }
                    if match_token!(TokenKind::SpreadOperator, self) {
                        is_end_with_rest = true;
                        params.push(Pattern::Rest(self.parse_rest_element(true)?));
                        break;
                    }
                    params.push(self.parse_binding_element()?);
                }
            }
        }
        if !match_token!(TokenKind::ParenthesesRightPunctuator, self) {
            if is_end_with_rest && match_token!(TokenKind::CommaToken, self) {
                sematic_error!(self.error_map.rest_element_can_not_end_with_comma);
            }
            syntax_error!(self.error_map.unexpect_token);
        }
        expect!(TokenKind::ParenthesesRightPunctuator, self);
        self.check_is_simple_parameter_list(&params);
        self.exist_function_parameter();
        Ok(params)
    }
    pub (super) fn check_is_simple_parameter_list(&mut self, params: &Vec<Pattern<'a>>) {
        for param in params {
            match param {
                Pattern::Ident(_) => {}
                _ => {
                    self.set_current_function_parameter_is_not_simple();
                    return;
                }
            }
        }
    }
    pub (super) fn parse_function_body(&mut self) -> ParserResult<FunctionBody<'a>> {
        let start_span = expect_with_start_span!(TokenKind::BracesLeftPunctuator, self);
        let mut body = Vec::new();
        loop {
            match self.get_token_ref() {
                TokenKind::BracesRightPunctuator | TokenKind::EOFToken => break,
                _ => body.push(self.parse_stmt_list_item()?)
            }
        }
        let finish_span = expect_with_finish_span!(TokenKind::BracesRightPunctuator, self);
        Ok(FunctionBody { body, start_span, finish_span })
    }
    
    pub (super) fn parse_variable_declaration(&mut self, in_for_init: bool) -> ParserResult<VariableDeclaration<'a>> {
        let mut declarators = Vec::new();
        let (variant, start) = match self.get_token_ref() {
            TokenKind::VarKeyword => { (DeclarationKind::Var, self.get_start_span()) },
            TokenKind::LetKeyword =>{  (DeclarationKind::Let, self.get_start_span()) },
            TokenKind::ConstKeyword => { (DeclarationKind::Const, self.get_start_span()) },
            _ => unreachable!(),
        };
        self.next_token();
        let mut is_start = true;
        loop {
            if is_start {
                is_start = false;
            }else {
                if !match_token!(TokenKind::CommaToken, self) {
                    break;
                }
                self.next_token();
            }
            let start = self.get_start_span();
            let pattern = self.parse_binding_element_without_assignment()?;
            let is_bindling_pattern = if let Pattern::Ident(_) = &pattern { false } else { true };
            // if variant != DeclarationKind::Var || self.is_in_strict_mode() {
                
            // }
            let is_assignment = match_token!(TokenKind::AssginOperator, self);
            if is_bindling_pattern && !is_assignment && !in_for_init {
                sematic_error!("???");
            }

            let init = if is_assignment {
                self.next_token();
                Some(self.parse_assignment_expr()?)
            }else {
                None
            };
            declarators.push(VariableDeclarator { id: pattern, init, start_span: start, finish_span: self.get_last_finish_span() })
        }
        if !in_for_init {
            self.semi()?;
        }
        Ok(VariableDeclaration { variant, declarators, start_span: start, finish_span: self.lexer.get_last_token_finish_span()  })
    }
    fn parse_class_declaration(&mut self) -> ParserResult<ClassDeclaration<'a>> {
        let start_span = self.get_start_span();
        let class_expr = self.parse_class()?;
        let id = match class_expr.id {
            Some(name) => name,
            None => panic!(),
        };
        let super_class = match class_expr.super_class {
            Some(box_ptr) => Some(*box_ptr),
            None => None
        };
        Ok(ClassDeclaration { id, super_class, body: class_expr.body, start_span, finish_span: self.get_last_finish_span() })
    }
    pub (super) fn parse_class(&mut self) -> ParserResult<ClassExpression<'a>> {
        let start = expect_with_start_span!(TokenKind::ClassKeyword, self);
        let name = match self.get_token_ref() {
            TokenKind::Identifier | TokenKind::YieldKeyword | TokenKind::AwaitKeyword | TokenKind::LetKeyword => {
                Some(self.parse_identifier()?)
            }
            _ => None
        };
        let super_class = if match_token!(TokenKind::ExtendsKeyword, self) {
            self.next_token();
            self.enter_class_scope(true);
            Some(Box::new(self.parse_left_hand_side_expr()?))
        }else {
            self.enter_class_scope(false);
            None
        };
        let body = self.parse_class_body()?;
        self.exist_class_scope();
        Ok(ClassExpression { id: name, super_class, body })
    }
    fn parse_class_body(&mut self) -> ParserResult<ClassBody<'a>> {
        let start_span = expect_with_start_span!(TokenKind::BracesLeftPunctuator, self);
        let mut body = Vec::new();
        loop {
            match self.get_token_ref() {
                TokenKind::BracesRightPunctuator | TokenKind::EOFToken => break,
                TokenKind::SemiPunctuator => self.next_token(),
                _ => {  body.push(self.parse_class_element()?)   }
            }
        }
        let finish_span = expect_with_finish_span!(TokenKind::BracesRightPunctuator, self);
        Ok(ClassBody { body, start_span , finish_span })
    }
    fn parse_class_element(&mut self) -> ParserResult<ClassElement<'a>> {
        let is_static = if self.get_current_value().as_ref() == "static"  {
            if self.lookahead_token() != TokenKind::ParenthesesLeftPunctuator {
                self.next_token();
                true
            }else {
                false
            }
        }else {
            false
        };
        if self.check_method_start_with_modifier() {
            return Ok(match self.parse_method_definition(None, is_static)? {
                MethodDefinition::ClassCtor(ctor) => ClassElement::ClassCtor(ctor),
                MethodDefinition::ClassMethod(method) => ClassElement::ClassMethodDef(method),
                MethodDefinition::ClassAccessor(accessor) => ClassElement::ClassAccessor(accessor),
                _ => unreachable!(),
            })
        }
        if match_token!(TokenKind::BracesLeftPunctuator, self) && is_static {
            todo!()
        }
        let start_span = self.get_start_span();
        let (key ,is_compute) = if match_token!(TokenKind::PrivateName, self) {
            (PrivateNameOrPropertyName::Private(self.parse_private_name()?) , false)
        }else {
            let tuple = self.parse_property_name()?;
            (PrivateNameOrPropertyName::Prop(tuple.0), tuple.1)
        };
        if match_token!(TokenKind::ParenthesesLeftPunctuator, self) {
            return Ok(match self.parse_method_definition(Some(key), is_static)? {
                MethodDefinition::ClassCtor(ctor) => ClassElement::ClassCtor(ctor),
                MethodDefinition::ClassMethod(method) => ClassElement::ClassMethodDef(method),
                MethodDefinition::ClassAccessor(accessor) => ClassElement::ClassAccessor(accessor),
                _ => unreachable!(),
            })
        }
        if match_token!(TokenKind::AssginOperator, self) {
            self.next_token();
            let expr = self.parse_assignment_expr()?;
            self.semi()?;
            return Ok(ClassElement::ClassProp(ClassProperty { key , value: Some(expr), computed: is_compute, short: false, is_static, start_span, finish_span: self.get_last_finish_span() }))
        }
        self.semi()?;
        Ok(ClassElement::ClassProp(ClassProperty { key, value: None, computed: is_compute, short: true, is_static, start_span, finish_span: self.get_last_finish_span() }))
    }
}
