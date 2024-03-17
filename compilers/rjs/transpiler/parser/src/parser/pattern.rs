use crate::{expect, expect_with_finish_span, expect_with_start_span, match_token, sematic_error, syntax_error};
use crate::parser::{Parser, ParserResult};
use crate::ast::expression::{
    ArrayExpression, ObjectExpression, SpreadElement,AssignmentExpression, Identifier,PropertyDefinition,
    Expression, AssignmentOperatorKinds,
    ObjectProperty, PropertyName, AssignmentPattern, Pattern, RestElement, ArrayPattern, ObjectPattern, ObjectPatternProperty};
use crate::token::TokenKind;

enum PossibleToPatternNode<'a> {
    Array(ArrayExpression<'a>),
    Obj(ObjectExpression<'a>),
    Spread(SpreadElement<'a>),
    Assignment(AssignmentExpression<'a>),
    Ident(Identifier<'a>),
}

impl<'a> Parser<'a> {
    pub (super) fn expr_to_pattern(&mut self, node: Expression<'a>, is_binding: bool) -> ParserResult<Pattern<'a>> {
        match node {
            Expression::MemberExpr(member_expr) => Ok(Pattern::MemberExpr(member_expr)),
            Expression::ArrayExpr(array) => Ok(self.node_to_pattern_like(PossibleToPatternNode::Array(array), is_binding)?),
            Expression::ObjectExpr(obj) => Ok(self.node_to_pattern_like(PossibleToPatternNode::Obj(obj), is_binding)?),
            Expression::Spread(spread) => Ok(self.node_to_pattern_like(PossibleToPatternNode::Spread(spread), is_binding)?),
            Expression::AssigmentExpr(assign) => Ok(self.node_to_pattern_like(PossibleToPatternNode::Assignment(assign), is_binding)?),
            Expression::Ident(ident) => Ok(self.node_to_pattern_like(PossibleToPatternNode::Ident(ident), is_binding)?),
            _ => { sematic_error!(self.error_map.invalid_left_value) }
        }
    }
    fn node_to_pattern_like(&mut self, node: PossibleToPatternNode<'a>, is_binding: bool) -> ParserResult<Pattern<'a>> {
        match node {
            PossibleToPatternNode::Ident(ident) => {
                Ok(Pattern::Ident(ident))
            }
            PossibleToPatternNode::Spread(spread) => {
                Ok(Pattern::Rest(
                    RestElement { argument: Box::new(self.expr_to_pattern(*spread.argument, is_binding)?) }
                ))
            }
            PossibleToPatternNode::Assignment(assignment) => {
                if let AssignmentOperatorKinds::AssginOperator = assignment.operator {
                    Ok(Pattern::Assgin(AssignmentPattern { 
                        left: assignment.left, right: *assignment.right 
                    }))
                }else {
                    sematic_error!(self.error_map.assigment_pattern_only_can_use_assigment_operator);
                }
            }
            PossibleToPatternNode::Array(array) => {
                let mut elements = Vec::new();
                let mut index = 0;
                let len = array.elements.len();
                for element in array.elements {
                    if let Some(ele) = element {
                        let pattern = self.expr_to_pattern(ele, is_binding)?;
                        if let Pattern::Rest(_) = &pattern {
                            if array.trailing_comma || index != len -1 {
                                sematic_error!(self.error_map.rest_element_can_not_end_with_comma);
                            }
                        }
                        elements.push(Some(pattern));
                    }else {
                        elements.push(None);
                    }
                    index += 1;
                }
                Ok(Pattern::Array(ArrayPattern { elements }))
            }
            PossibleToPatternNode::Obj(obj) => {
                let mut properties = Vec::new();
                for definition in obj.properties {
                    match definition {
                        PropertyDefinition::ObjProp(props) => {
                            properties.push(self.object_property_to_object_pattern_property(props, is_binding)?);
                        }
                        PropertyDefinition::Spread(spread) => {
                            properties.push(ObjectPatternProperty::Rest(
                                match self.node_to_pattern_like(PossibleToPatternNode::Spread(spread), is_binding)? {
                                    Pattern::Rest(rest) => rest,
                                    _ => unreachable!()
                                }
                            ))
                        }
                        _ => { sematic_error!(self.error_map.invalid_left_value); }
                    }
                }
                Ok(Pattern::Obj(ObjectPattern { properties }))
            }
        }
    }
    fn object_property_to_object_pattern_property(&mut self, object_prop: ObjectProperty<'a>, is_binding: bool) -> ParserResult<ObjectPatternProperty<'a>> {
        if !object_prop.shorted {
            let is_identifier = if let PropertyName::Ident(_) = &object_prop.key { true } else { false };
            if !is_identifier || object_prop.computed {
                sematic_error!(self.error_map.assignment_pattern_left_value_can_only_be_idenifier_or_pattern);
            }
            let left = if let PropertyName::Ident(ident) = object_prop.key { ident } else { unreachable!() };
            return Ok(ObjectPatternProperty::Assign(AssignmentPattern { 
                left: Box::new(Pattern::Ident(left)), right: object_prop.value.unwrap() 
            }))
        }
        Ok(
            ObjectPatternProperty::Property { 
                key: object_prop.key, 
                value: match object_prop.value {
                    Some(expr) => Some(Box::new(self.expr_to_pattern(expr, is_binding)?)),
                    None => None
                } , computed: object_prop.computed, shorted: object_prop.shorted
            }
        )
    }
    pub (super) fn parse_binding_element(&mut self) -> ParserResult<Pattern<'a>> {
        let left  = match self.get_token_ref() {
            TokenKind::BracketLeftPunctuator | TokenKind::BracesLeftPunctuator => {
                self.parse_binding_pattern()?
            }
            _ => {
                Pattern::Ident(self.parse_identifier()?)
            }
        };
        Ok(if match_token!(TokenKind::AssginOperator, self) {
            self.next_token();
            let right = self.parse_assignment_expr()?;
            Pattern::Assgin(AssignmentPattern { left: Box::new(left), right })
        }else {
            left
        })
    }
    pub (super) fn parse_binding_element_without_assignment(&mut self) -> ParserResult<Pattern<'a>> {
        match self.get_token_ref() {
            TokenKind::BracketLeftPunctuator | TokenKind::BracesLeftPunctuator => {
                self.parse_binding_pattern()
            }
            _ => {
                Ok(Pattern::Ident(self.parse_identifier()?))
            }
        }
    }
    pub (super) fn parse_rest_element(&mut self, allow_pattern: bool) -> ParserResult<RestElement<'a>> {
        let start = expect_with_start_span!(TokenKind::SpreadOperator, self);
        match self.get_token() {
            TokenKind::BracketLeftPunctuator | TokenKind::BracesLeftPunctuator => {
                if allow_pattern {
                    Ok(RestElement { argument: Box::new(Pattern::Ident(self.parse_identifier()?)) })
                }else {
                    syntax_error!(self.error_map.unexpect_token);
                }
            }
            _ => {
                Ok(RestElement { argument: Box::new(self.parse_binding_pattern()?) })
            }
        }
    }
    fn parse_binding_pattern(&mut self) -> ParserResult<Pattern<'a>> {
        match self.get_token_ref() {
            TokenKind::BracesLeftPunctuator => {
                Ok(Pattern::Obj(self.parse_object_pattern()?))
            }
            TokenKind::BracketLeftPunctuator => {
                Ok(Pattern::Array(self.parse_array_pattern()?))
            }
            _ => {
                syntax_error!(self.error_map.unexpect_token);
            }
        }
    }
    fn parse_object_pattern(&mut self) -> ParserResult<ObjectPattern<'a>> {
        let start = expect_with_start_span!(TokenKind::BracesLeftPunctuator, self);
        let mut is_start = true;
        let mut is_rest_last = false;
        let mut properties = Vec::new();
        loop {
            match self.get_token_ref() {
                TokenKind::BracesRightPunctuator | TokenKind::EOFToken => break,
                _ => {
                    if is_start {
                        is_start = false;
                    }else {
                        expect!(TokenKind::CommaToken, self);
                    }
                    if match_token!(TokenKind::BracketRightPunctuator, self) {
                        break;
                    }
                    if is_rest_last {
                        sematic_error!(self.error_map.rest_element_should_be_last_property);
                    }
                    if match_token!(TokenKind::SpreadOperator, self) {
                        properties.push(ObjectPatternProperty::Rest(self.parse_rest_element(true)?));
                        is_rest_last = true;
                        continue;
                    }
                    let (property_name, is_compute) = self.parse_property_name()?;
                    match self.get_token_ref() {
                        TokenKind::AssginOperator => {
                            self.next_token();
                            let expr = self.parse_assignment_expr()?;
                            if let PropertyName::Ident(ident) = property_name {
                                properties.push(ObjectPatternProperty::Assign(AssignmentPattern { 
                                    left: Box::new(Pattern::Ident(ident)) , right: expr
                                }))
                            }else {
                                sematic_error!("assignment pattern left value can only allow identifier or pattern");
                            }
                        }
                        TokenKind::ColonPunctuator => {
                            self.next_token();
                            let pattern = self.parse_binding_element()?;
                            properties.push(ObjectPatternProperty::Property { key: property_name, value: Some(Box::new(pattern)), computed: is_compute, shorted: false });
                        }
                        _ => {
                            self.check_property_shorted_is_keyword(&property_name)?;
                            properties.push(ObjectPatternProperty::Property { key: property_name, value: None, computed: is_compute, shorted: true });
                        }
                    }
                }
            }
        }
        Ok(ObjectPattern { properties })
    }
    fn check_property_shorted_is_keyword(&self, property_name: &PropertyName<'a>) -> ParserResult<()> {
        match property_name {
            PropertyName::Ident(ident) => {
                match ident.name.as_ref() {
                    "await" | "break"| "case"| "catch"| "class"|
                    "const"| "continue"| "debugger"| "default"| "do"|
                    "else"| "enum"| "export" | "extends" | "finally" |
                    "for"| "function" | "if" | "import" | "new" |
                    "return"| "super" | "switch" | "this" | "throw" |
                    "try"| "var"| "with" | "while" | "yield" | "let" |
                    "delete"| "void"| "typeof"|
                    "in" | "instanceof" => {
                        sematic_error!(self.error_map.invalid_property_name);
                    }
                    "static" | "implements" | "interface" | 
                    "package" | "private" | "protected" | "public" => {
                        if self.is_in_strict_mode() {
                            sematic_error!(self.error_map.invalid_property_name);
                        }else {
                            Ok(())
                        }
                    }
                    _ => {Ok(())}
                }
            }
            _ => Ok(())
        }
    }
    fn parse_array_pattern(&mut self) -> ParserResult<ArrayPattern<'a>> {
        let start = expect_with_start_span!(TokenKind::BracketLeftPunctuator, self);
        let mut is_start = true;
        let mut elements = Vec::new();
        loop {
            match self.get_token_ref() {
                TokenKind::BracketRightPunctuator | TokenKind::EOFToken => break,
                _ => {
                    if is_start {
                        is_start = false;
                    }else {
                        expect!(TokenKind::CommaToken, self);
                    }
                    if match_token!(TokenKind::BracketRightPunctuator, self) {
                        break;
                    }
                    if match_token!(TokenKind::CommaToken, self) {
                        elements.push(None);
                        continue;
                    }
                    if match_token!(TokenKind::SpreadOperator, self) {
                        elements.push(Some(Pattern::Rest(self.parse_rest_element(true)?)));
                        if !match_token!(TokenKind::BracketRightPunctuator, self) {
                            sematic_error!(self.error_map.rest_element_can_not_end_with_comma);
                        }
                        break;
                    }
                    elements.push(Some(self.parse_binding_element()?));
                }
            }
        }
        let finish = expect_with_finish_span!(TokenKind::BracketRightPunctuator, self);
        Ok(ArrayPattern { elements })
    }

}