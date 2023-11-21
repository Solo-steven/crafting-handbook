use crate::parser::{Parser, ParserResult};
use crate::ast::expr::*;
use crate::ast::declar::*;
use crate::token::*;
use crate::{
    is_token, expect_token, 
    is_assignment_ops_token,
    is_binary_ops_token,
    is_unary_ops_token,
    is_update_ops_token,
    map_assignment_token_to_assignment_ops,
    map_binary_token_to_binary_ops,
    get_binary_op_priority,
    map_unary_token_to_unary_ops,
    map_update_token_to_update_ops,
};

impl<'a> Parser<'a> {
    pub (super) fn parse_expr(&mut self) -> ParserResult<Expression<'a>> {
        let mut is_start = true;
        let mut exprs = Vec::new();
        loop {
            if is_start {
                is_start = false;
            }else {
                if is_token!(TokenKind::Comma, self) {
                    self.next_token();
                }else {
                    break;
                }
            }
            let expr = self.parse_assignment_expr()?;
            exprs.push(expr);
        }
        // TODO: take expr if exprs vec len is just one.
        ParserResult::Ok(Expression::SequentialExpr(SequentialExpression { exprs }))
    }
    pub (super) fn parse_assignment_expr(&mut self) -> ParserResult<Expression<'a>> {
        let left = self.parse_condition_expr()?;
        if is_assignment_ops_token!(self) {
            let ops = map_assignment_token_to_assignment_ops!(self.get_token());
            self.next_token();
            let right = self.parse_condition_expr()?;
            ParserResult::Ok(Expression::AssignmentExpr(AssignmentExpression { left: Box::new(left), right: Box::new(right), ops }))
        }else {
            ParserResult::Ok(left)
        }
    }
    fn parse_condition_expr(&mut self) -> ParserResult<Expression<'a>> {
        let condi = self.parse_binary_expr()?;
        if is_token!(TokenKind::Qustion, self) {
            self.next_token();
            let conseq = self.parse_binary_expr()?;
            expect_token!(TokenKind::Colon, self);
            let alter = self.parse_binary_expr()?;
            ParserResult::Ok(Expression::ConditionalExpr(ConditionalExpression { condi: Box::new(condi), conseq: Box::new(conseq), alter: Box::new(alter) }))
        }else {
            ParserResult::Ok(condi)
        }
    }
    fn parse_binary_expr(&mut self) -> ParserResult<Expression<'a>> {
        let left = self.parse_unary_expr()?;
        if is_binary_ops_token!(self) {
            self.parse_binary_operation(left, 0)
        }else {
            ParserResult::Ok(left)
        }
    }
    fn parse_binary_operation(&mut self, mut left: Expression<'a>, ops_priority: usize) -> ParserResult<Expression<'a>> {
        loop {
            // Bounary case, if ops of current loop is smeller than base op
            // or next ops is not exist.
            if !is_binary_ops_token!(self) {
                break;
            }
            let cur_ops = map_binary_token_to_binary_ops!(self.get_token());
            if get_binary_op_priority!(&cur_ops) < ops_priority {
                break;
            }
            // General case, get right as current ops, lookahead to next op,
            // if next op is priority then current op, parse it as util
            // else wrap left and right into a new expr tree.
            self.next_token();
            let mut right = self.parse_unary_expr()?;
            if is_binary_ops_token!(self) {
                let next_ops = map_binary_token_to_binary_ops!(self.get_token());
                if get_binary_op_priority!(&next_ops) > get_binary_op_priority!(&cur_ops) {
                    right = self.parse_binary_operation(right, get_binary_op_priority!(&next_ops))?;
                }
            }
            left = Expression::BinaryExpr(BinaryExpression { left: Box::new(left), right: Box::new(right), ops: cur_ops });
        }
        ParserResult::Ok(left)
    }
    fn parse_unary_expr(&mut self) -> ParserResult<Expression<'a>> {
        if is_unary_ops_token!(self) {
            let unary_op = map_unary_token_to_unary_ops!(self.get_token());
            self.next_token();
            // TODO: handle `sizeof (type-name)`
            let expr = self.parse_unary_expr()?;
            ParserResult::Ok(Expression::UnaryExpr(UnaryExpression { expr: Box::new(expr), ops: unary_op }))
        }else {
            self.parse_update_expr()
        }
    }
    fn parse_update_expr(&mut self) -> ParserResult<Expression<'a>> {
        let mut expr: Expression<'a>;
        if is_update_ops_token!(self) {
            let update_ops = map_update_token_to_update_ops!(self.get_token());
            self.next_token();
            expr = Expression::UpdateExpr(UpdateExpression { expr: Box::new(self.parse_unary_expr()?), posfix: false, ops: update_ops })
        }else {
            expr = self.parse_lefthand_side_expr()?
        }
        while is_update_ops_token!(self) {
            let update_ops = map_update_token_to_update_ops!(self.get_token());
            expr = Expression::UpdateExpr(UpdateExpression { expr: Box::new(expr), posfix: true, ops: update_ops })
        }
        ParserResult::Ok(expr)
    }
    fn parse_lefthand_side_expr(&mut self) -> ParserResult<Expression<'a>> {
        let mut base = self.parse_primary_expr()?;
        let mut should_stop = false;
        while should_stop == false {
            match self.get_token() {
                TokenKind::BracketLeft => {
                    self.next_token();
                    let index = self.parse_expr()?;
                    expect_token!(TokenKind::BracesRight, self);
                    base = Expression::SubscriptExpr(SubscriptionExpression { object: Box::new(base), index: Box::new(index) });
                },
                TokenKind::Dot => {
                    // .
                    self.next_token();
                    let property = self.parse_identifier()?;
                    base = Expression::MemberExpr(MemberExpression { object: Box::new(base), property: Box::new(property) });
                }
                TokenKind::Arrow => {
                    self.next_token();
                    let property = self.parse_identifier()?;
                    base = Expression::DereferenceExpr(DereferenceExpression { pointer: Box::new(base), property: Box::new(property) });
                }
                TokenKind::ParenthesesLeft => {
                    self.next_token();
                    let mut argus = Vec::new();
                    let mut is_start = true;
                    loop {
                        if is_token!(TokenKind::ParenthesesRight, self) {
                            break;
                        }
                        if is_start {
                            is_start = false;
                        }else {
                            expect_token!(TokenKind::Comma, self);
                        }
                        if is_token!(TokenKind::ParenthesesRight, self) {
                            break;
                        }
                        argus.push(self.parse_assignment_expr()?);
                    }
                    expect_token!(TokenKind::ParenthesesRight, self);
                    base = Expression::CallExpr(CallExpression { callee: Box::new(base), arguments: argus })
                }
                _ => should_stop = true,
            }
        }
        ParserResult::Ok(base)
    }
    /// Parse primary expression. it can be one of following
    /// - float const
    /// - int const
    /// - string literal
    /// - char literal
    /// - identifier
    /// - ParenthesesExpr
    fn parse_primary_expr(&mut self) -> ParserResult<Expression<'a>> {
        match self.get_token() {
            TokenKind::Identifier => {
                ParserResult::Ok(Expression::Identifier(self.parse_identifier()?))
            }
            TokenKind::IntLiteral(base, (long_suffix, is_short)) => {
                let raw_value = self.get_raw_value();
                self.next_token();
                ParserResult::Ok(Expression::IntLiteral(IntLiteral {
                    raw_value,
                    base,
                    value_type: match long_suffix {
                        Some(suffix) => {
                            match suffix {
                                LongIntSuffix::Long => TypeSpecifier::Long,
                                LongIntSuffix::LongLong => TypeSpecifier::LongLong
                            }
                        }
                        _ =>  if is_short { TypeSpecifier::Shorted } else { TypeSpecifier::Int }
                    }
                }))
            }
            TokenKind::FloatLiteral(base, is_float ) => {
                let raw_value= self.get_raw_value();
                self.next_token();
                ParserResult::Ok(Expression::FloatLiteral(FloatLiteral { 
                    raw_value , base,
                    value_type: if is_float { TypeSpecifier::Float } else { TypeSpecifier::Double }
                }))
            }
            TokenKind::CharLiteral => {
                let raw_value = self.get_raw_value();
                self.next_token();
                ParserResult::Ok(Expression::CharLiteral(CharLiteral{ raw_value }))
            }
            TokenKind::StringLiteral => {
                let raw_value = self.get_raw_value();
                self.next_token();
                ParserResult::Ok(Expression::StringLiteral(StringLiteral { raw_value }))
            }
            _ => {
                ParserResult::Err(String::from(""))
            }
        }
    }
    /// Parse a identifier, it would return error result if not match identifier token.
    pub (super) fn parse_identifier(&mut self) -> ParserResult<Identifier<'a>> {
        match self.get_token() {
            TokenKind::Identifier => {
                let value = self.lexer.get_raw_value();
                self.next_token();
                return ParserResult::Ok(Identifier {
                    name: value
                })
            }
            _ => {
                ParserResult::Err(String::from(""))
            }
        }
    }
}