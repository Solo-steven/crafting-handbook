use std::borrow::Cow;
use crate::parser::{Parser, ParserResult};
use crate::ast::expression::*;
use crate::span::Span;
use crate::token::TokenKind;
use crate::{
    expect, 
    expect_but_not_eat, 
    expect_with_start_span, expect_with_finish_span, get_binary_op_precedence, is_assignment_op_token, is_binary_op_token, is_unary_op_token, is_update_op_token, map_token_to_assignment_op, map_token_to_binary_op, map_token_to_unary_op, map_token_to_update_op, match_token
};

struct ArgumentMeta<T> {
    start: Span, 
    finish: Span,
    nodes: Vec<T>,
    traling_comma: bool,
}

impl<'a> Parser<'a> {
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
    pub (super) fn parse_assignment_expr_disallow_in_operator(&mut self) -> ParserResult<Expression<'a>> {
        self.in_operator_stack.push(false);
        let expr = self.parse_assignment_expr_base();
        self.in_operator_stack.pop();
        expr
    }
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
        Ok(if exprs.len() == 0 {
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
        let left_pattern = self.to_assignment_pattern(left);
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
        let mut argument : Option<Box<Expression<'a>>> = None;
        if !(self.test_semi(true, false)?) {
            argument = Some(Box::new(self.parse_assignment_expr()?));
        }
        // TODO ERROR message
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
                    Expression::UnaryExpr(_) => return Err(()),
                    _ => {}
                }
            }
            BinaryOperatorKinds::NullishOperator => {
                match next_op {
                    BinaryOperatorKinds::LogicalANDOperator | BinaryOperatorKinds::LogicalOROperator => {
                        return Err(())
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
                        return Err(())
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
                return Err(())
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
    fn parse_left_hand_side_expr(&mut self) -> ParserResult<Expression<'a>> {
        let mut base = self.parse_primary_expr()?;
        let mut should_stop = true;
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
                        return Err(())
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
                    return Err(());
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
        unreachable!();
    }
    fn parse_tag_template_expr(&mut self,base: Expression<'a>,) -> ParserResult<Expression<'a>> {
        let quasi = self.parse_template_literal()?;
        Ok(Expression::TaggedTemplateExpr(TaggedTemplateExpression { quasi, tag: Box::new(base) }))
    }
    fn parse_primary_expr(&mut self) -> ParserResult<Expression<'a>> {
        todo!();
    }
    fn parse_identifier_with_keyword(&mut self) -> ParserResult<Identifier<'a>> {
        let start = self.get_start_span().offset;
        let finish = self.get_finish_span_ref().offset;
        let value = self.get_value(start, finish);
        self.next_token();
        Ok(Identifier { name: value })
    }
    fn parse_identifier(&mut self) -> ParserResult<Identifier<'a>> {
        match self.get_token_ref() {
            TokenKind::YieldKeyword => {
                self.next_token();
                if self.is_current_function_generator() || !self.is_in_strict_mode() {
                    Err(())
                }else {
                    Ok(Identifier { name: Cow::Borrowed("yield") })
                }
            }
            TokenKind::AwaitKeyword => {
                self.next_token();
                if self.is_current_function_async() {
                    Err(())
                }else {
                    Ok(Identifier { name: Cow::Borrowed("await") })
                }
            }
            TokenKind::LetKeyword => {
                self.next_token();
                if self.is_in_strict_mode() {
                    Err(())
                }else {
                    Ok(Identifier { name: Cow::Borrowed("let") })
                }
            }
            TokenKind::Identifier => {
                let start = self.get_start_span().offset;
                let finish = self.get_finish_span_ref().offset;
                let value = self.get_value(start, finish);
                self.next_token();
                Ok(Identifier { name: value })
            }
            _ => unreachable!(),
        }
    }
    fn parse_private_name(&mut self) -> ParserResult<PrivateName<'a>> {
        todo!();
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
}