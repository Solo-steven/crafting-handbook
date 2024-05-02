use std::borrow::Cow;
use crate::lexer::TokenWithSpan;
use crate::parser::{Parser, ParserResult};
use crate::ast::expression::*;
use crate::span::Span;
use crate::token::TokenKind;
use crate::{
    expect, expect_but_not_eat, expect_with_finish_span, expect_with_start_and_finish_span, expect_with_start_span, expect_with_token_and_span, get_binary_op_precedence, is_assignment_op_token, is_binary_op_token, is_lookahead_validate_property_name_start, is_unary_op_token, is_update_op_token, map_token_to_assignment_op, map_token_to_binary_op, map_token_to_unary_op, map_token_to_update_op, match_token, sematic_error, syntax_error
};

use super::{ClassAccessor, ClassBody, ClassConstructor, ClassElement, ClassMethodDefinition, FunctionBody, PrivateNameOrPropertyName, ClassProperty};

struct ArgumentMeta<T> {
    start: Span, 
    finish: Span,
    nodes: Vec<T>,
    traling_comma: bool,
}

impl<'a> Parser<'a> {
    pub (super) fn check_strict_mode(&mut self, expr: &Expression) -> ParserResult<()> {
        if let Expression::String(literal) = expr {
            if literal.raw_val.as_ref() == "use strict" {
                if self.is_direct_to_function_context() {
                    if !self.is_simple_parameter() {
                        sematic_error!(self.error_map.illegal_use_strict_in_non_simple_parameter_list);
                    }
                    self.set_current_function_context_strict_mode();
                }
            }
        }
        Ok(())
    }
    pub (super) fn parse_expr(&mut self) -> ParserResult<Expression<'a>> {
        self.in_operator_stack.push(true);
        let expr = self.parse_expr_base()?;
        self.in_operator_stack.pop();
        Ok(expr)
    }
    pub (super) fn parse_expr_disallow_in_operator(&mut self) -> ParserResult<Expression<'a>> {
        self.in_operator_stack.push(false);
        let expr = self.parse_expr_base()?;
        self.in_operator_stack.pop();
        Ok(expr)
    }
    pub (super) fn parse_assignment_expr(&mut self) -> ParserResult<Expression<'a>> {
        self.in_operator_stack.push(true);
        let expr = self.parse_assignment_expr_base();
        self.in_operator_stack.pop();
        expr
    }
    // pub (super) fn parse_assignment_expr_disallow_in_operator(&mut self) -> ParserResult<Expression<'a>> {
    //     self.in_operator_stack.push(false);
    //     let expr = self.parse_assignment_expr_base();
    //     self.in_operator_stack.pop();
    //     expr
    // }
    fn parse_expr_base(&mut self) -> ParserResult<Expression<'a>> {
        let mut exprs = Vec::with_capacity(1);
        exprs.push(self.parse_assignment_expr_base()?);
        loop {
            if self.get_token_ref() != &TokenKind::CommaToken {
                break;
            }
            self.next_token();
            exprs.push(self.parse_assignment_expr_base()?);
        }
        Ok(if exprs.len() == 1 {
            exprs.pop().unwrap()
        }else {
            Expression::SequenceExpr(SequenceExpression { exprs })
        })
    }
    fn parse_assignment_expr_base(&mut self) -> ParserResult<Expression<'a>> {
        if match_token!(TokenKind::ParenthesesLeftPunctuator, self) {
            self.maybe_arrow = true;
        };
        if match_token!(TokenKind::YieldKeyword, self) && self.is_current_function_generator() {
            return  self.parse_yield_expr();
        }
        let left = self.parse_conditional_expr()?;
        
        if !is_assignment_op_token!(self) {
            return Ok(left);
        }
        let left_pattern = self.expr_to_pattern(left, false)?;
        let op = map_token_to_assignment_op!(self);
        self.next_token();
        let right = self.parse_assignment_expr_base()?;
        Ok(Expression::AssigmentExpr(AssignmentExpression { left: Box::new(left_pattern), right: Box::new(right), operator: op }))
    }
    fn parse_conditional_expr(&mut self) -> ParserResult<Expression<'a>> {
        let test = self.parse_binary_expr()?;
        if !match_token!(TokenKind::QustionOperator, self) {
            return Ok(test);
        }
        self.next_token();
        let conseq = self.parse_assignment_expr()?;
        expect!(TokenKind::ColonPunctuator, self);
        let alter = self.parse_assignment_expr()?;
        Ok(Expression::ConditionalExpr(ConditionalExpression { test: Box::new(test), conseq: Box::new(conseq), alter: Box::new(alter) }))
    }
    fn parse_yield_expr(&mut self) -> ParserResult<Expression<'a>> {
        let start = expect_with_start_span!(TokenKind::YieldKeyword, self);
        let mut deletgate = false;
        if match_token!(TokenKind::MultiplyOperator, self) {
            self.next_token();
            deletgate = true;
        }
        let argument = if !(self.test_semi(true, false)?) {
            Some(Box::new(self.parse_assignment_expr()?))
        }else {
            None
        };
        // TODO ERROR message
        if deletgate && argument.is_none() {
            sematic_error!(self.error_map.yield_deletgate_can_must_be_followed_by_assignment_expression);
        }
        if self.is_in_parameter() {
            sematic_error!(self.error_map.yield_expression_can_not_used_in_parameter_list);
        }
        Ok(Expression::YieldExpr(YieldExpression { argument, deletgate }))
    }
    fn parse_binary_expr(&mut self) -> ParserResult<Expression<'a>> {
        let unary = self.parse_unary_expr()?;
        match &unary {
            Expression::ArrorFunctionExpr(_) => Ok(unary),
            _ => {
                if is_binary_op_token!(self) {
                    self.parse_binary_ops(unary, 0)
                }else {
                    Ok(unary)
                }
            }
        }   
    }
    fn parse_binary_ops(&mut self, mut left: Expression<'a>, last_op_pre: i8) -> ParserResult<Expression<'a>> {
        loop {
            if !is_binary_op_token!(self) {
                break;
            }
            let cur_op = map_token_to_binary_op!(self);
            self.next_token();
            let cur_pre = get_binary_op_precedence!(cur_op);
            if cur_pre < last_op_pre {
                break;
            }
            let mut right = self.parse_unary_expr()?;
            if is_binary_op_token!(self) {
                let next_op = map_token_to_binary_op!(self);
                self.check_nullish_and_expont_operator(&cur_op, &left, &next_op)?;
                let next_pre = get_binary_op_precedence!(next_op);
                if cur_pre < next_pre {
                    right = self.parse_binary_ops(right, next_pre)?;
                }
            }
            left = Expression::BinaryExpr(BinaryExpression { 
                left: Box::new(left),
                right: Box::new(right),
                operator: cur_op
            });
        }
        Ok(left)
    }
    fn check_nullish_and_expont_operator(&self, cur_op: &BinaryOperatorKinds, expr: &Expression, next_op: &BinaryOperatorKinds) -> ParserResult<()> {
        match cur_op {
            BinaryOperatorKinds::ExponOperator => {
                match expr {
                    Expression::UnaryExpr(_) => { 
                        sematic_error!(self.error_map.expont_operator_need_parans); 
                    },
                    _ => {}
                }
            }
            BinaryOperatorKinds::NullishOperator => {
                match next_op {
                    BinaryOperatorKinds::LogicalANDOperator | BinaryOperatorKinds::LogicalOROperator => {
                        sematic_error!(self.error_map.nullish_require_parans);
                    }
                    _ => {}
                }
            }
            _ => {}
        }
        match next_op {
            BinaryOperatorKinds::NullishOperator => {
                match cur_op {
                    BinaryOperatorKinds::LogicalANDOperator | BinaryOperatorKinds::LogicalOROperator => {
                        sematic_error!(self.error_map.nullish_require_parans);
                    }
                    _ => {}
                }
            }
            _ => {}
        }
        Ok(())
    }
    fn parse_unary_expr(&mut self) -> ParserResult<Expression<'a>> {
        if is_unary_op_token!(self) {
            let op = map_token_to_unary_op!(self);
            let start = self.get_start_span();
            self.next_token();
            let argumenent = self.parse_unary_expr()?;
            return Ok(Expression::UnaryExpr(UnaryExpression { argument: Box::new(argumenent), operator: op }))
        }
        if match_token!(TokenKind::AwaitKeyword, self) && self.is_current_function_async() {
            if self.is_in_parameter() {
                sematic_error!(self.error_map.await_expression_can_not_used_in_parameter_list);
            }
            let start = self.get_start_span();
            self.next_token();
            let argument = Box::new(self.parse_unary_expr()?);
            return Ok(Expression::AwaitExpr(AwaitExpression { argument }));
        }
        self.parse_update_expr()
    }
    fn parse_update_expr(&mut self) -> ParserResult<Expression<'a>> {
        if is_update_op_token!(self) {
            let op = map_token_to_update_op!(self);
            let start = self.get_start_span();
            self.next_token();
            let argument = Box::new(self.parse_left_hand_side_expr()?);
            return Ok(Expression::UpdateExpr(UpdateExpression { argument, prefix: true, operator: op }))
        }
        let argument = self.parse_left_hand_side_expr()?;
        if is_update_op_token!(self) {
            let op = map_token_to_update_op!(self);
            let finish = self.get_finish_span();
            self.next_token();
            return Ok(Expression::UpdateExpr(UpdateExpression { argument: Box::new(argument), prefix: false, operator: op }))
        }
        Ok(argument)
    }
    pub (super) fn parse_left_hand_side_expr(&mut self) -> ParserResult<Expression<'a>> {
        let mut base = self.parse_primary_expr()?;
        let mut should_stop = false;
        let mut has_optional = false;
        while !should_stop {
            let mut inner_optional = false;
            if match_token!(TokenKind::QustionDotOperator, self) {
                inner_optional = true;
                has_optional = true;
                self.next_token();
            }
            match self.get_token_ref() {
                TokenKind::ParenthesesLeftPunctuator => {
                    base = self.parse_call_expr(base, inner_optional)?;
                    continue;
                }
                TokenKind::DotOperator | TokenKind::BracketLeftPunctuator => {
                    base = self.parse_member_expr(base, inner_optional)?;
                    continue;
                }
                TokenKind::TemplateHead | TokenKind::TemplateNoSubstitution => {
                    if inner_optional {
                        sematic_error!(self.error_map.tag_template_expression_can_not_use_option_chain);
                    }
                    base = self.parse_tag_template_expr(base)?;
                    continue;
                }
                _ => {
                    if inner_optional {
                        base = self.parse_member_expr(base, inner_optional)?;
                        continue;
                    }
                }
            }
            // failback case
            should_stop = true;
        }
        Ok(if has_optional {
            Expression::ChainExpr(ChainExpression { expr: Box::new(base) })
        }else {
            base
        })
    }
    fn parse_call_expr(&mut self, callee: Expression<'a>, optional: bool) -> ParserResult<Expression<'a>> {
        expect_but_not_eat!(TokenKind::ParenthesesLeftPunctuator, self);
        let meta = self.parse_arguments()?;
        Ok(Expression::CallExpr(CallExpression { callee: Box::new(callee), arguments: meta.nodes, optional }))
    }
    fn parse_arguments(&mut self) -> ParserResult<ArgumentMeta<Expression<'a>>> {
        let start = expect_with_start_span!(TokenKind::ParenthesesLeftPunctuator, self);
        let mut is_start = true;
        let mut traling_comma = false;
        let mut arguments = Vec::new();
        loop {
            match self.get_token_ref() {
                TokenKind::ParenthesesRightPunctuator | TokenKind::EOFToken => {
                    break;
                }
                _ => {}
            }
            if is_start {
                is_start = false;
                if match_token!(TokenKind::CommaToken, self) {
                    sematic_error!(self.error_map.function_argument_can_not_have_empty_trailing_comma);
                }
            }else {
                traling_comma = true;
                expect!(TokenKind::CommaToken, self);
            }
            if match_token!(TokenKind::ParenthesesRightPunctuator, self) {
                break;
            }
            traling_comma = false;
            arguments.push(
                if match_token!(TokenKind::CommaToken, self) {
                    self.parse_spread_element()?
                }else {
                    self.parse_assignment_expr()?
                }
            );
            println!(":::");
        }
        let finish = expect_with_finish_span!(TokenKind::ParenthesesRightPunctuator, self);
        Ok(ArgumentMeta { start, finish, nodes: arguments, traling_comma,} )
    }
    fn parse_spread_element(&mut self) -> ParserResult<Expression<'a>> {
        let start = expect_with_start_span!(TokenKind::SpreadOperator, self);
        let argument = Box::new(self.parse_assignment_expr()?);
        Ok(Expression::Spread(SpreadElement { argument }))
    }
    fn parse_member_expr(&mut self, base: Expression<'a>, optional: bool) -> ParserResult<Expression<'a>> {
        match self.get_token_ref() {
            TokenKind::DotOperator => {
                self.next_token();
                let property = Expression::Ident(self.parse_identifier_with_keyword()?);
                return Ok(Expression::MemberExpr(MemberExpression { object: Box::new(base), property: Box::new(property), optional, computed: false }));
            }
            TokenKind::BracketLeftPunctuator => {
                self.next_token();
                let property = Expression::Ident(self.parse_identifier_with_keyword()?);
                let finish = expect_with_finish_span!(TokenKind::BracketRightPunctuator, self);
                return Ok(Expression::MemberExpr(MemberExpression { object: Box::new(base), property: Box::new(property), optional, computed: true }));
            }
            _ => {
                if optional {
                    self.next_token();
                    let property = Expression::Ident(self.parse_identifier_with_keyword()?);
                    return Ok(Expression::MemberExpr(MemberExpression { object: Box::new(base), property: Box::new(property), optional, computed: false }));
                }
            }
        }
        syntax_error!(self.error_map.unexpect_token);
    }
    fn parse_tag_template_expr(&mut self,base: Expression<'a>,) -> ParserResult<Expression<'a>> {
        let quasi = self.parse_template_literal()?;
        Ok(Expression::TaggedTemplateExpr(TaggedTemplateExpression { quasi, tag: Box::new(base) }))
    }
    fn parse_primary_expr(&mut self) -> ParserResult<Expression<'a>> {
       Ok(match self.get_token_ref() {
            TokenKind::LtOperator => { todo!() }
            TokenKind::DivideOperator | TokenKind::DivideAssignOperator => { todo!() }
            TokenKind::UndefinedKeyword => { Expression::Undefined(self.parse_undefined_literal()?) }
            TokenKind::NullKeyword => { Expression::Null(self.parse_null_literal()?) }
            TokenKind::TrueKeyword | TokenKind::FalseKeyword => { Expression::Bool(self.parse_bool_literal()?) }
            TokenKind::NumberLiteral => { Expression::Number(self.parse_number_literal()?) }
            TokenKind::StringLiteral => { Expression::String(self.parse_string_literal()?) }
            TokenKind::TemplateHead | TokenKind::TemplateNoSubstitution => { Expression::Template(self.parse_template_literal()?) }
            TokenKind::ImportKeyword => {
                let lookahead = self.lookahead_token();
                match lookahead {
                    TokenKind::DotOperator => { Expression::Meta(self.parse_import_meta()?) }
                    TokenKind::ParenthesesLeftPunctuator => { Expression::CallExpr(self.parse_import_call()?) }
                    _ => {
                        syntax_error!(self.error_map.unexpect_token);
                    }
                }
            }
            TokenKind::NewKeyword => {
                match self.lookahead_token() {
                    TokenKind::DotOperator => { Expression::Meta(self.parse_new_target()?) }
                    _ => { Expression::NewExpr(self.parse_new_expr()?) }
                }
            }
            TokenKind::SuperKeyword => { self.parse_super()? }
            TokenKind::ThisKeyword => { Expression::This(self.parse_this_expr()?) }
            TokenKind::BracesLeftPunctuator => { Expression::ObjectExpr(self.parse_object_expr()?) }
            TokenKind::BracketLeftPunctuator => { Expression::ArrayExpr(self.parse_array_expr()?) }
            TokenKind::FunctionKeyword => { Expression::FunctionExpr(self.parse_function_expr(false)?) }
            TokenKind::ClassKeyword => { Expression::ClassExpr(self.parse_class_expr()?) }
            TokenKind::ParenthesesLeftPunctuator => { self.parse_cover_expr_or_arrow_function()? }
            TokenKind::PrivateName => { Expression::Private(self.parse_private_name()?) }
            TokenKind::Identifier | TokenKind::LetKeyword | TokenKind::AwaitKeyword | TokenKind::YieldKeyword => {
                let (lookahead, flag) = self.lexer.lookahead_token_and_flag();
                let is_id_async = self.get_current_value().as_ref() == "async";
                if lookahead == TokenKind::ArrowOperator {
                    self.enter_function_scope(false, false);
                    let arguments = vec![Expression::Ident(self.parse_identifier()?)];
                    let start = Span::new(0,0,0);
                    let finish = Span::new(0,0,0);
                    if self.lexer.get_line_terminator_flag() {
                        sematic_error!(self.error_map.no_line_break_is_allowed_before_arrow);
                    }
                    let arrow_expr = self.parse_arrow_function_expr(
                        ArgumentMeta { start, finish, nodes: arguments, traling_comma: false }
                    )?;
                    self.exit_scope();
                    return Ok(Expression::ArrorFunctionExpr(arrow_expr));
                }
                if is_id_async {
                    match lookahead {
                        TokenKind::Identifier | TokenKind::AwaitKeyword | TokenKind::YieldKeyword => {
                            if flag {
                                return Ok(Expression::Ident(self.parse_identifier()?))
                            }
                            self.next_token();
                            self.enter_function_scope(true, false);
                            let arguments = vec![Expression::Ident(self.parse_identifier()?)];
                            let start = Span::new(0,0,0);
                            let finish = Span::new(0,0,0);
                            if self.lexer.get_line_terminator_flag() {
                                sematic_error!(self.error_map.no_line_break_is_allowed_before_arrow);
                            }
                            let arrow_expr = self.parse_arrow_function_expr(
                                ArgumentMeta { start, finish, nodes: arguments, traling_comma: false }
                            )?;
                            self.exit_scope();
                            return Ok(Expression::ArrorFunctionExpr(arrow_expr));
                        }
                        TokenKind::QustionDotOperator => {
                            let id = self.parse_identifier()?;
                            let meta = self.parse_arguments()?;
                            return Ok(Expression::CallExpr(CallExpression {
                                callee:Box::new(Expression::Ident(id)),
                                arguments: meta.nodes,
                                optional: false,
                            }))
                        }
                        TokenKind::ParenthesesLeftPunctuator => {
                            let id = self.parse_identifier()?;
                            let meta = self.parse_arguments()?;
                            if flag || !match_token!(TokenKind::ArrowOperator, self) {
                                return Ok(Expression::CallExpr(CallExpression { 
                                    callee: Box::new(Expression::Ident(id)), 
                                    arguments: meta.nodes, 
                                    optional: false
                                }))
                            }
                            self.enter_function_scope(true, false);
                            let arrow_expr = self.parse_arrow_function_expr(meta)?;
                            self.exit_scope();
                            return Ok(Expression::ArrorFunctionExpr(arrow_expr));
                        }
                        TokenKind::FunctionKeyword => {
                            expect_with_start_and_finish_span!(TokenKind::Identifier, self);
                            if self.lexer.get_line_terminator_flag() {
                                return Ok(Expression::Ident(Identifier { name: Cow::Borrowed("async") }))
                            }
                            return Ok(Expression::FunctionExpr(self.parse_function_expr(true)?))
                        }
                        _ => {}
                    }
                }
                return Ok(Expression::Ident(self.parse_identifier()?));
            }
            _ => {
                syntax_error!(self.error_map.unexpect_token);
            }
        })
    }
    pub (super) fn parse_identifier_with_keyword(&mut self) -> ParserResult<Identifier<'a>> {
        let start = self.get_start_span().offset;
        let finish = self.get_finish_span_ref().offset;
        let value = self.get_value(start, finish);
        self.next_token();
        Ok(Identifier { name: value })
    }
    pub (super) fn parse_identifier(&mut self) -> ParserResult<Identifier<'a>> {
        match self.get_token_ref() {
            TokenKind::YieldKeyword => {
                self.next_token();
                if self.is_current_function_generator() || !self.is_in_strict_mode() {
                    sematic_error!(self.error_map.when_in_yield_context_yield_will_be_treated_as_keyword);
                }
                Ok(Identifier { name: Cow::Borrowed("yield") })
            }
            TokenKind::AwaitKeyword => {
                self.next_token();
                if self.is_current_function_async() {
                    sematic_error!(self.error_map.when_in_async_context_await_keyword_will_treat_as_keyword);
                }
                Ok(Identifier { name: Cow::Borrowed("await") })
            }
            TokenKind::LetKeyword => {
                if self.is_in_strict_mode() {
                   sematic_error!(self.error_map.unexpect_keyword_in_stric_mode);
                }
                self.next_token();
                Ok(Identifier { name: Cow::Borrowed("let") })
            }
            TokenKind::Identifier => {
                let start = self.get_start_span().offset;
                let finish = self.get_finish_span_ref().offset;
                let value = self.get_value(start, finish);
                self.next_token();
                Ok(Identifier { name: value })
            }
            _ => { 
                syntax_error!(self.error_map.unexpect_token);
            }
        }
    }
    pub (super) fn parse_private_name(&mut self) -> ParserResult<PrivateName<'a>> {
        let meta = expect_with_token_and_span!(TokenKind::PrivateName, self);
        let value = self.get_value(meta.start_span.offset, meta.finish_span.offset);
        Ok(PrivateName { name: value })
    }
    fn parse_null_literal(&mut self) -> ParserResult<NullLiteral> {
        let meta = expect_with_start_and_finish_span!(TokenKind::NullKeyword, self);
        Ok(NullLiteral {})
    }
    fn parse_undefined_literal(&mut self) -> ParserResult<UndefinedLiteral> {
        let meta = expect_with_start_and_finish_span!(TokenKind::UndefinedKeyword, self);
        Ok(UndefinedLiteral{})
    }
    fn parse_number_literal(&mut self) -> ParserResult<NumberLiteral<'a>> {
        let meta = expect_with_token_and_span!(TokenKind::NumberLiteral, self);
        let value = self.get_value(meta.start_span.offset, meta.finish_span.offset);
        Ok(NumberLiteral { raw_val: value })
    }
    fn parse_string_literal(&mut self) -> ParserResult<StringLiteral<'a>> {
        let meta = expect_with_token_and_span!(TokenKind::PrivateName, self);
        let value = self.get_value(meta.start_span.offset, meta.finish_span.offset);
        Ok(StringLiteral { raw_val: value })
    }
    fn parse_bool_literal(&mut self) -> ParserResult<BoolLiteral<'a>> {
        let meta = expect_with_token_and_span!(TokenKind::PrivateName, self);
        let value = self.get_value(meta.start_span.offset, meta.finish_span.offset);
        Ok(BoolLiteral { 
            value: match value.as_ref() {
                "true" => true,
                "false" => false,
                _ => unreachable!()
            },
            raw_val: value, 
        }) 
    }
    fn parse_template_literal(&mut self) -> ParserResult<TemplateLiteral<'a>> {
        let start = self.get_start_span();
        if match_token!(TokenKind::TemplateNoSubstitution, self) {
            let finish = self.get_finish_span();
            let value = self.get_value(start.offset, finish.offset);
            self.next_token();
            let mut quasis = Vec::new();
            quasis.push(TemplateElement { raw_val: value , tail: false});
            return Ok(TemplateLiteral { quasis, exprs: Vec::new() });
        }
        self.next_token();
        let mut exprs =vec![self.parse_expr()?];
        let mut quasis = Vec::new();
        loop {
            match self.get_token_ref() {
                TokenKind::TemplateTail | TokenKind::EOFToken => break,
                TokenKind::TemplateMiddle => {
                    let start = self.get_start_span().offset;
                    let finish = self.get_finish_span_ref().offset;
                    let value = self.get_value(start, finish);
                    quasis.push(TemplateElement { raw_val: value, tail: false });
                    self.next_token();
                    exprs.push(self.parse_expr()?);
                }
                _ => {}
            }
        }
        let start = self.get_start_span().offset;
        let finish = self.get_finish_span_ref().offset;
        let value = self.get_value(start, finish);
        quasis.push(TemplateElement { raw_val: value, tail: true });
        self.next_token();
        Ok(TemplateLiteral { quasis, exprs })
    }
    fn parse_import_meta(&mut self) -> ParserResult<MetaPropery<'a>> {
        let (start, finish) = expect_with_start_and_finish_span!(TokenKind::ImportKeyword, self);
        expect!(TokenKind::DotOperator, self);
        if self.get_current_value().as_ref() != "meta" {
            sematic_error!(self.error_map.import_meta_invalid_property);
        }
        let property = self.parse_identifier()?;
        Ok(MetaPropery { 
            meta: Identifier { name: Cow::Borrowed("import") }, 
            property 
        })
    }
    fn parse_import_call(&mut self) -> ParserResult<CallExpression<'a>>  {
        let (start, finish) = expect_with_start_and_finish_span!(TokenKind::ImportKeyword, self);
        expect!(TokenKind::ParenthesesLeftPunctuator, self);
        let argument = self.parse_assignment_expr()?;
        let final_finish = expect_with_finish_span!(TokenKind::ParenthesesRightPunctuator, self);
        Ok(CallExpression { 
            callee: Box::new(Expression::Ident(Identifier { name: Cow::Borrowed("import") })), 
            arguments: vec![argument], 
            optional: false, 
        })
    }
    fn parse_new_target(&mut self) -> ParserResult<MetaPropery<'a>> {
        let (start, finish) = expect_with_start_and_finish_span!(TokenKind::NewKeyword, self);
        expect!(TokenKind::DotOperator, self);
        let cur_value = self.get_current_value();
        if cur_value.as_ref() != "target" {

        }
        if self.is_top_level() && !self.is_in_class_context() {

        }
        self.next_token();
        Ok(MetaPropery {
            meta: Identifier { name: Cow::Borrowed("new") },
            property: Identifier { name: Cow::Borrowed("target") }
        })
    }
    fn parse_new_expr(&mut self) -> ParserResult<NewExpression<'a>> {
        let start = expect_with_start_span!(TokenKind::NewKeyword, self);
        let mut base = if match_token!(TokenKind::NewKeyword, self) && self.lookahead_token() == TokenKind::DotOperator  {
            Expression::NewExpr(self.parse_new_expr()?)
        }else {
            self.parse_primary_expr()?
        };
        match &base {
            Expression::CallExpr(call_expr) => {
                if let Expression::Ident(ident) = call_expr.callee.as_ref() {
                    if ident.name.as_ref() == "import" {
                        sematic_error!(self.error_map.import_call_is_not_allow_as_new_expression_called);
                    }
                }
            },
            _ => {}
        }
        loop {
            match self.get_token_ref() {
                TokenKind::DotOperator | TokenKind::BracketLeftPunctuator  => {
                    base = self.parse_primary_expr()?
                }
                TokenKind::QustionDotOperator => {
                    sematic_error!(self.error_map.new_expression_cant_using_optional_chain);
                }
                _ => break
            }
        }
        let meta = self.parse_arguments()?;
        Ok(if !match_token!(TokenKind::ParenthesesLeftPunctuator, self) {
            NewExpression { callee: Box::new(base), arguments: meta.nodes }
        }else {
            NewExpression { callee: Box::new(base), arguments: meta.nodes }
        })
    }
    fn parse_super(&mut self) -> ParserResult<Expression<'a>> {
        todo!()
    }
    fn parse_this_expr(&mut self) -> ParserResult<ThisExpression> {
        let meta = expect_with_token_and_span!(TokenKind::ThisKeyword, self);
        Ok(ThisExpression {})
    }
    fn parse_function_expr(&mut self, is_async: bool) -> ParserResult<FunctionExpression<'a>> {
        self.parse_function(true, is_async)
    }
    fn parse_class_expr(&mut self) -> ParserResult<ClassExpression<'a>> {
        self.parse_class()
    }
    /// ## Parse Object literal
    fn parse_object_expr(&mut self) -> ParserResult<ObjectExpression<'a>> {
        let start = expect_with_start_span!(TokenKind::BracesLeftPunctuator, self);
        let mut is_start = true;
        let mut property_definition_list = Vec::new();
        let mut trailing_comma = false;
        loop {
            match self.get_token_ref() {
                TokenKind::BracesRightPunctuator | TokenKind::EOFToken => break,
                _ => {
                    if is_start {
                        property_definition_list.push(self.parse_property_definition()?);
                        is_start = false;
                        continue;
                    }
                    expect!(TokenKind::CommaToken, self);
                    if match_token!(TokenKind::BracesRightPunctuator, self) {
                        trailing_comma = true;
                        break;
                    }
                    property_definition_list.push(self.parse_property_definition()?);
                }
            }
        }
        let end = expect_with_finish_span!(TokenKind::BracesRightPunctuator, self);
        Ok(ObjectExpression { properties: property_definition_list, trailing_comma })
    }
    fn parse_property_definition(&mut self) -> ParserResult<PropertyDefinition<'a>> {
        if match_token!(TokenKind::PrivateName, self) {
            sematic_error!(self.error_map.private_field_can_not_use_in_object);
        }
        if match_token!(TokenKind::SpreadOperator, self) {
            match self.parse_spread_element()? {
                Expression::Spread(spread_element) =>  {
                    return Ok(PropertyDefinition::Spread(spread_element));
                }
                _ => unreachable!(),
            }
        }
        if self.check_method_start_with_modifier() {
            return Ok(match self.parse_method_definition( None, false)? {
                MethodDefinition::ObjAccessor(accessor) => {
                    PropertyDefinition::ObjAccessor(accessor)
                }, 
                MethodDefinition::ObjMethod(method) => {
                    PropertyDefinition::ObjMethodDef(method)
                },
                _ => unreachable!()
            })
        }
        let (property_name, is_compute) = self.parse_property_name()?;
        Ok(match self.get_token_ref() {
            TokenKind::ParenthesesLeftPunctuator => {
                match self.parse_method_definition( Some(PrivateNameOrPropertyName::Prop(property_name)), false)? {
                    MethodDefinition::ObjAccessor(accessor) => {
                        PropertyDefinition::ObjAccessor(accessor)
                    }, 
                    MethodDefinition::ObjMethod(method) => {
                        PropertyDefinition::ObjMethodDef(method)
                    },
                    _ => {
                        unreachable!()
                    }
                }
            }
            TokenKind::ColonPunctuator | TokenKind::AssginOperator => {
                self.next_token();
                let expr = self.parse_assignment_expr()?;
                PropertyDefinition::ObjProp(ObjectProperty { key: property_name, value: Some(expr), computed: is_compute, shorted: false })
            }
            _ => {
                PropertyDefinition::ObjProp(ObjectProperty { key: property_name, value: None, computed: is_compute, shorted: true })
            }
        })
    }
    pub (super) fn check_method_start_with_modifier(&mut self) -> bool {
        if match_token!(TokenKind::MultiplyOperator, self) {
            true
        }else {
            let cur_value = self.get_current_value();
            let (lookahead, flag) = self.lexer.lookahead_token_and_flag();
            match cur_value.as_ref() {
                "set" | "get" => is_lookahead_validate_property_name_start!(lookahead),
                "async" => !flag && is_lookahead_validate_property_name_start!(lookahead),
                _ => false
            }
        }
    }
    pub (super) fn parse_property_name(&mut self) -> ParserResult<(PropertyName<'a>, bool)> {
        Ok(match self.get_token_ref() {
            TokenKind::StringLiteral => {
                (PropertyName::String(self.parse_string_literal()?), false)
            }
            TokenKind::NumberLiteral => {
                (PropertyName::Number(self.parse_number_literal()?), false)
            }
            TokenKind::BracesLeftPunctuator => {
                self.next_token();
                let expr = self.parse_assignment_expr()?;
                (PropertyName::Expr(expr), true)
            }
            _ => {
                (PropertyName::Ident(self.parse_identifier_with_keyword()?), false)
            }
        })
    }
    pub (super) fn parse_method_definition(
        &mut self,
        mut with_property_name: Option<PrivateNameOrPropertyName<'a>>,
        is_static: bool
    ) -> ParserResult<MethodDefinition<'a>> {
        let mut method_type = None;
        let mut start : Option<Span> = None;
        let mut is_async = false;
        let mut generator = false;
        let mut computed = false;
        if with_property_name.is_none() {
            let mut cur_val = self.get_current_value();
            match cur_val.as_ref() {
                "set" => {
                    method_type = Some(AccessorType::Setter);
                    start = Some(self.get_start_span());
                    self.next_token();
                }
                "get" => {
                    method_type = Some(AccessorType::Getter);
                    start = Some(self.get_start_span());
                    self.next_token();
                }
                _ => {}
            }
            cur_val = self.get_current_value();
            if cur_val.as_ref() == "async" {
                let kind = self.lookahead_token();
                if kind != TokenKind::ParenthesesLeftPunctuator {
                    if start.is_none() {
                        start = Some(self.get_start_span());
                    }
                    self.next_token();
                    is_async = true;
                }
            }
            if match_token!(TokenKind::MultiplyOperator, self) {
                self.next_token();
                generator = true;
            }
            match self.get_token_ref() {
                TokenKind::PrivateName => {
                    with_property_name = Some(PrivateNameOrPropertyName::Private(self.parse_private_name()?))
                }
                _ => {
                    let (property_name, comp) = self.parse_property_name()?;
                    with_property_name = Some(PrivateNameOrPropertyName::Prop(property_name));
                    computed = comp;
                }
            }
        }else {
            // should clone property name's start span
            start = Some(Span::new(0, 0, 0));
        }
        self.enter_function_scope(is_async, generator);
        let params = self.parse_function_params()?;
        let body = self.parse_function_body()?;
        self.exit_scope();

        match &method_type {
            Some(ty) => {
                match ty {
                    AccessorType::Getter => {
                        if params.len() > 0 {
                            sematic_error!(self.error_map.getter_should_never_has_params);
                        }
                        if is_async || generator {
                            sematic_error!(self.error_map.getter_should_never_has_params);
                        }
                    }
                    AccessorType::Setter => {
                        if params.len() != 1 {
                            sematic_error!(self.error_map.setter_should_has_only_one_params);
                        } 
                        for param in &params {
                            if let Pattern::Rest(_) = param {
                                sematic_error!(self.error_map.setter_can_not_have_rest_element_as_argument);
                            }
                        }
                        if is_async || generator {
                            sematic_error!(self.error_map.setter_can_not_be_async_or_generator);
                        }
                    }
                }
            }
            _ => {}
        }

        Ok(if !self.is_in_class_context() {
            let key = match with_property_name {
                Some(name) => {
                    match name {
                        PrivateNameOrPropertyName::Prop(prop) => prop,
                        PrivateNameOrPropertyName::Private(_) => {
                            sematic_error!(self.error_map.private_field_can_not_use_in_object);
                        }
                    }
                }
                None => unreachable!(), // should be unreaching 
            };
            match method_type {
                None => {
                    MethodDefinition::ObjMethod(ObjectMethodDefinition { 
                        key , body, params, 
                        computed, generator, is_async
                    })
                }
                Some(ty) => {
                    match ty {
                        AccessorType::Getter => {
                            MethodDefinition::ObjAccessor(ObjectAccessor { 
                                key, accessor_type: AccessorType::Getter, 
                                body, params, computed
                            })
                        }
                        AccessorType::Setter => {
                            MethodDefinition::ObjAccessor(ObjectAccessor { 
                                key, accessor_type: AccessorType::Setter, 
                                body, params, computed
                            })
                        }
                    }
                }
            }
        }else {
            let start_span = start.unwrap();
            let key = match with_property_name {
                Some(name) => name,
                None => unreachable!(),
            };
            match method_type {
                None => {
                   let id_value = match &key {
                    PrivateNameOrPropertyName::Private(private_name) => Some(private_name.name.as_ref()),
                    PrivateNameOrPropertyName::Prop(props) => match props {
                        PropertyName::Ident(id) => Some(id.name.as_ref()),
                        _ => None,
                    }
                   };
                   if id_value.is_some() && id_value.unwrap() == "constructor" {
                        if computed || is_async || is_static || generator {
                            sematic_error!(self.error_map.constructor_can_not_be_async_or_generator);
                        }
                        MethodDefinition::ClassCtor(ClassConstructor { key, body, params, start_span, finish_span: self.get_last_finish_span() })
                   }else {
                        MethodDefinition::ClassMethod(ClassMethodDefinition { 
                            key, body, params, 
                            computed, generator, is_async, is_static,
                            start_span, finish_span: self.get_last_finish_span()
                        })
                    }
                }
                Some(ty) => {
                    match ty {
                        AccessorType::Getter => {
                            MethodDefinition::ClassAccessor(ClassAccessor { 
                                key, accessor_type: AccessorType::Getter, 
                                body, params, computed,
                                start_span, finish_span: self.get_last_finish_span()
                            })
                        }
                        AccessorType::Setter => {
                            MethodDefinition::ClassAccessor(ClassAccessor  { 
                                key, accessor_type: AccessorType::Setter, 
                                body, params, computed,
                                start_span, finish_span: self.get_last_finish_span()
                            })
                        }
                    }
                }
            }
        })
    }
    fn parse_array_expr(&mut self) -> ParserResult<ArrayExpression<'a>> {
        todo!();
    }
    fn parse_cover_expr_or_arrow_function(&mut self) -> ParserResult<Expression<'a>> {
        let mut meta = self.parse_arguments()?;
        if !self.maybe_arrow  || !match_token!(TokenKind::ArrowOperator, self) {
            for node in &meta.nodes {
                if let Expression::Spread(_) = node {
                    sematic_error!(self.error_map.rest_element_can_not_use_in_cover);
                }
            }
            if meta.nodes.len() == 1 {
                return Ok(meta.nodes.pop().unwrap());
            }
            if meta.traling_comma {
                sematic_error!(self.error_map.sequence_expression_can_not_have_trailing_comma);
            }
            let seq = Expression::SequenceExpr(SequenceExpression { exprs: meta.nodes });
            return Ok(seq);
        }
        self.enter_function_scope(false, false);
        let expr = self.parse_arrow_function_expr(meta)?;
        self.exit_scope();
        Ok(Expression::ArrorFunctionExpr(expr))
    }
    fn parse_arrow_function_expr(&mut self, meta: ArgumentMeta<Expression<'a>>) ->ParserResult<ArrowFunctionExpression<'a>> {
        expect!(TokenKind::ArrowOperator, self);
        if self.lexer.get_line_terminator_flag() {
            sematic_error!(self.error_map.no_line_break_is_allowed_before_arrow);
        }
        let function_params = self.transform_function_argument_to_params(meta.nodes, meta.traling_comma)?;
        let body;
        let is_expr = false;
        if match_token!(TokenKind::BracesLeftPunctuator, self) {
            body = ExpressionOrFunctionBody::FuncBody(self.parse_function_body()?)
        }else {
            body = ExpressionOrFunctionBody::Expr(Box::new(self.parse_assignment_expr()?));
        }
        Ok(ArrowFunctionExpression { 
            is_async: self.is_current_function_async(), 
            expression_body: is_expr, body, params: function_params 
        })
    }
    fn transform_function_argument_to_params(&mut self, arguments: Vec<Expression<'a>>, trailing_comma: bool) -> ParserResult<Vec<Pattern<'a>>> {
        let mut patterns = Vec::new();
        for argument in arguments {
            patterns.push(self.expr_to_pattern(argument, true)?);
        }
        self.check_is_simple_parameter_list(&patterns);
        self.check_is_right_expr_of_param_is_await_or_yield_expr(&patterns)?;
        if trailing_comma && self.check_params_have_multi_rest_elements(&patterns)? {
            sematic_error!(self.error_map.rest_element_can_not_end_with_comma);
        }
        Ok(patterns)
    }
    fn check_is_right_expr_of_param_is_await_or_yield_expr(&self, params: &Vec<Pattern<'a>>) -> ParserResult<()> {
        for param in params {
            if let Pattern::Assgin(assign_pattern) = param {
                match assign_pattern.right {
                    Expression::AwaitExpr(_) => {
                        sematic_error!(self.error_map.await_expression_can_not_used_in_parameter_list);
                    }
                    Expression::YieldExpr(_) => {
                        sematic_error!(self.error_map.yield_expression_can_not_used_in_parameter_list);
                    }
                    _ => {}
                }
            }
        }
        Ok(())
    }
    fn check_params_have_multi_rest_elements(&self, params: &Vec<Pattern> ) -> ParserResult<bool> {
        let mut flag = false;
        for param in params {
            if let Pattern::Rest(_) = param {
                if flag {
                    sematic_error!(self.error_map.rest_element_should_be_last_property);
                }
                flag = true;
            }else {
                if flag {
                    sematic_error!(self.error_map.rest_element_should_be_last_property);
                }
            }
        }
        Ok(flag)
    }
}