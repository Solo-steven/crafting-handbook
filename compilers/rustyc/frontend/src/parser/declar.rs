use crate::ast::declar::*;
use crate::ast::expr::{Expression, Identifier, InitExpression};
use crate::parser::{Parser, ParserResult};
use crate::token::*;
use crate::{expect_token, is_token};

fn combine_value_type_with_signed(signed: Option<bool>, value_type: ValueType) -> ValueType {
    match signed {
        Some(value) => match value {
            true => value_type,
            false => match value_type {
                ValueType::Char => ValueType::UnSignedChar,
                ValueType::Shorted => ValueType::UnsignedShort,
                ValueType::Long => ValueType::UnsignedLong,
                ValueType::LongLong => ValueType::UnsignedLongLong,
                ValueType::Int => ValueType::Unsigned,
                _ => {
                    panic!()
                }
            },
        },
        _ => value_type,
    }
}

impl<'a> Parser<'a> {
    /// Parse a block item when start with any type possible keyword
    /// - long, char, int, float, double, unsigned, signed
    /// - struct, union, enum
    pub(super) fn parse_declaration(&mut self) -> ParserResult<Declaration<'a>> {
        let mut value_type = self.parse_value_type(None)?;

        let is_function_pointer = match value_type {
            ValueType::FunctionPointer { .. } => true,
            _ => false,
        };
        match self.get_token() {
            TokenKind::Multiplication
            | TokenKind::Identifier
            | TokenKind::Semi
            | TokenKind::Assignment
            | TokenKind::Comma => {
                if self.get_token() == TokenKind::Semi && !is_function_pointer {
                    expect_token!(TokenKind::Semi, self);
                    return ParserResult::Ok(Declaration::ValueType(value_type));
                }
                let is_identifier = self.get_token() == TokenKind::Identifier;
                let mut pointer_type = self.parse_type_with_pointer_type(value_type.clone());
                let id = match &pointer_type {
                    ValueType::FunctionPointer {
                        id, return_type, ..
                    } => {
                        value_type = return_type.as_ref().clone();
                        id.clone()
                    }
                    _ => self.parse_identifier()?,
                };
                if is_token!(TokenKind::BracketLeft, self) {
                    pointer_type = self.parse_type_with_array_type(pointer_type)?;
                }
                match self.get_token() {
                    TokenKind::ParenthesesLeft => {
                        if is_identifier {
                            ParserResult::Ok(Declaration::FunType(
                                self.parse_function_type(value_type, id)?,
                            ))
                        } else {
                            ParserResult::Ok(Declaration::FunType(
                                self.parse_function_type(pointer_type, id)?,
                            ))
                        }
                    }
                    TokenKind::Semi => {
                        self.next_token();
                        ParserResult::Ok(Declaration::DelcarList(DeclarationList {
                            value_type,
                            declarators: vec![Declarator {
                                value_type: pointer_type,
                                id,
                                init_value: None,
                            }],
                        }))
                    }
                    TokenKind::Assignment => {
                        self.next_token();
                        let init_value = Some(self.parse_declarator_init_value()?);
                        let declarators = self.parse_declaration_list(
                            vec![Declarator {
                                id,
                                init_value,
                                value_type: pointer_type,
                            }],
                            value_type.clone(),
                        )?;
                        ParserResult::Ok(Declaration::DelcarList(DeclarationList {
                            value_type,
                            declarators,
                        }))
                    }
                    TokenKind::Comma => {
                        let declarators = self.parse_declaration_list(
                            vec![Declarator {
                                id,
                                init_value: None,
                                value_type: pointer_type,
                            }],
                            value_type.clone(),
                        )?;
                        ParserResult::Ok(Declaration::DelcarList(DeclarationList {
                            value_type,
                            declarators,
                        }))
                    }
                    _ => ParserResult::Err(String::from("")),
                }
            }
            _ => {
                println!("{:?}, {:?}", value_type, self.get_token());
                expect_token!(TokenKind::Semi, self);
                ParserResult::Ok(Declaration::ValueType(value_type))
            }
        }
    }
    /// Parse Type Specifier, reference: C99 6.7.2, it have sub-state machine
    /// - `parse_signed_value_type``
    /// - `parse_long_value_type`
    /// - `parse_shorted_value_type`
    /// - `parse_float_value_type`
    /// - `parse_double_value_type`
    /// ### Wht signed need to be option bool, not just bool
    pub(super) fn parse_value_type(&mut self, signed: Option<bool>) -> ParserResult<ValueType<'a>> {
        let start_type = match self.get_token() {
            TokenKind::Char => {
                self.next_token();
                ValueType::Char
            }
            TokenKind::Void => {
                self.next_token();
                ValueType::Void
            }
            TokenKind::Int => {
                self.next_token();
                ValueType::Int
            }
            TokenKind::Signed => {
                self.next_token();
                self.parse_value_type(Some(true))?
            }
            TokenKind::Unsigned => {
                self.next_token();
                self.parse_value_type(Some(false))?
            }
            TokenKind::Long => self.parse_long_value_type(signed)?,
            TokenKind::Short => self.parse_short_value_type(signed)?,
            TokenKind::Float => self.parse_float_value_type()?,
            TokenKind::Double => self.parse_double_value_type()?,
            TokenKind::Struct => ValueType::Struct(Box::new(self.parse_struct_type()?)),
            TokenKind::Enum => ValueType::Enum(Box::new(self.parse_enum_type()?)),
            TokenKind::Union => ValueType::Union(Box::new(self.parse_union_type()?)),
            _ => return ParserResult::Err(String::from("expect token")),
        };
        if is_token!(TokenKind::ParenthesesLeft, self) {
            self.next_token();
            expect_token!(TokenKind::Multiplication, self);
            let id = self.parse_identifier()?;
            expect_token!(TokenKind::ParenthesesRight, self);
            expect_token!(TokenKind::ParenthesesLeft, self);
            let mut params = Vec::new();
            let mut is_start = true;
            loop {
                if is_token!(TokenKind::ParenthesesRight, self) {
                    break;
                }
                if is_start {
                    is_start = false;
                } else {
                    expect_token!(TokenKind::Comma, self);
                }
                if is_token!(TokenKind::ParenthesesRight, self) {
                    break;
                }
                params.push(self.parse_value_type(None)?);
            }
            expect_token!(TokenKind::ParenthesesRight, self);
            ParserResult::Ok(ValueType::FunctionPointer {
                id,
                return_type: Box::new(start_type),
                param_types: params,
            })
        } else {
            ParserResult::Ok(start_type)
        }
    }
    /// Parse type specifier with 'float' keyword start, is possbible can be
    /// - float
    /// - float _Complex
    fn parse_float_value_type(&mut self) -> ParserResult<ValueType<'a>> {
        self.next_token();
        match self.get_token() {
            TokenKind::_Complex => {
                self.next_token();
                ParserResult::Ok(ValueType::FloatComplex)
            }
            _ => ParserResult::Ok(ValueType::Float),
        }
    }
    /// Parse type specifier with 'float' keyword start, is possbible can be
    /// - double
    /// - double _Complex
    fn parse_double_value_type(&mut self) -> ParserResult<ValueType<'a>> {
        self.next_token();
        match self.get_token() {
            TokenKind::_Complex => {
                self.next_token();
                ParserResult::Ok(ValueType::DoubleComplex)
            }
            _ => ParserResult::Ok(ValueType::Double),
        }
    }
    /// Parse type specifier with `short` keyword start, reference
    /// - short
    /// - short int
    fn parse_short_value_type(&mut self, signed: Option<bool>) -> ParserResult<ValueType<'a>> {
        self.next_token();
        match self.get_token() {
            TokenKind::Int => {
                self.next_token();
            }
            _ => {}
        }
        ParserResult::Ok(combine_value_type_with_signed(signed, ValueType::Shorted))
    }
    /// Parser Type specifier when start with `long` keyword. reference : C99 6.7.2
    /// - long
    /// - long int
    /// - long long
    /// - long long int
    /// - long double
    /// - long double _Complex
    fn parse_long_value_type(&mut self, signed: Option<bool>) -> ParserResult<ValueType<'a>> {
        // must start with long
        self.next_token();
        match self.get_token() {
            TokenKind::Int => {
                self.next_token();
                // long int
                ParserResult::Ok(combine_value_type_with_signed(signed, ValueType::Long))
            }
            TokenKind::Long => {
                self.next_token();
                match self.get_token() {
                    TokenKind::Int => {
                        self.next_token();
                    }
                    _ => {}
                }
                ParserResult::Ok(combine_value_type_with_signed(signed, ValueType::LongLong))
            }
            TokenKind::Double => {
                self.next_token();
                match self.get_token() {
                    TokenKind::_Complex => {
                        self.next_token();
                        ParserResult::Ok(combine_value_type_with_signed(
                            signed,
                            ValueType::LongDoubleComplex,
                        ))
                    }
                    _ => ParserResult::Ok(combine_value_type_with_signed(
                        signed,
                        ValueType::LongDouble,
                    )),
                }
            }
            _ => ParserResult::Ok(combine_value_type_with_signed(signed, ValueType::Long)),
        }
    }
    pub(super) fn parse_type_with_pointer_type(
        &mut self,
        value_type: ValueType<'a>,
    ) -> ValueType<'a> {
        let mut qualifiers = Vec::new();
        let mut level = 0;
        loop {
            if is_token!(TokenKind::Multiplication, self) {
                self.next_token();
            } else {
                break;
            }
            level += 1;
            let mut layer_qualifiers = Vec::new();
            loop {
                match self.get_token() {
                    TokenKind::Const => {
                        self.next_token();
                        layer_qualifiers.push(Qualifiers::Const);
                    }
                    TokenKind::Restrict => {
                        self.next_token();
                        layer_qualifiers.push(Qualifiers::Restrict);
                    }
                    TokenKind::Volatile => {
                        self.next_token();
                        layer_qualifiers.push(Qualifiers::Volatile);
                    }
                    _ => break,
                }
            }
            qualifiers.push(layer_qualifiers);
        }
        if level > 0 {
            ValueType::PointerType(Box::new(PointerType {
                pointer_to: Box::new(value_type),
                level,
                qualifiers,
            }))
        } else {
            value_type
        }
    }
    pub(super) fn parse_type_with_array_type(
        &mut self,
        value_type: ValueType<'a>,
    ) -> ParserResult<ValueType<'a>> {
        let mut dims = Vec::new();
        loop {
            if is_token!(TokenKind::BracketLeft, self) {
                self.next_token();
            } else {
                break;
            }
            dims.push(self.parse_assignment_expr()?);
            expect_token!(TokenKind::BracketRight, self);
        }
        if dims.len() > 0 {
            Ok(ValueType::ArrayType(Box::new(ArrayType {
                dims,
                array_of: Box::new(value_type),
            })))
        } else {
            Ok(value_type)
        }
    }
    /// Parse enum type. enum type have two possible format
    /// - enum declaration, just enum name, can be using in declaration enum type,
    ///   member of struct or variable decalration.
    /// - enum definition, used when define a enum type.
    fn parse_enum_type(&mut self) -> ParserResult<EnumType<'a>> {
        expect_token!(TokenKind::Enum, self);
        let mut id = None;
        if is_token!(TokenKind::Identifier, self) {
            id = Some(self.parse_identifier()?);
        }
        if is_token!(TokenKind::BracesLeft, self) {
            expect_token!(TokenKind::BracesLeft, self);
            let mut body = Vec::new();
            let mut is_start = true;
            loop {
                // break loop if meeted  `}`
                if is_token!(TokenKind::BracesRight, self) {
                    self.next_token();
                    break;
                }
                // eat colon if not start
                if is_start {
                    is_start = false;
                } else {
                    expect_token!(TokenKind::Semi, self);
                }
                // break loop if semi followed by `}`
                if is_token!(TokenKind::BracesRight, self) {
                    self.next_token();
                    break;
                }
                // parse 'type name (colon const-expr)'?
                let name = self.parse_identifier()?;
                body.push(Enumerator {
                    id: name,
                    init_vale: None,
                });
            }
            ParserResult::Ok(EnumType::Def(EnumDefinition {
                id,
                enumerators: body,
            }))
        } else {
            ParserResult::Ok(EnumType::Declar(EnumDeclaration { id: id.unwrap() }))
        }
    }
    /// Parse union type, same as `parse_sture_type`
    fn parse_union_type(&mut self) -> ParserResult<UnionType<'a>> {
        expect_token!(TokenKind::Union, self);
        let mut id = None;
        if is_token!(TokenKind::Identifier, self) {
            id = Some(self.parse_identifier()?);
        }
        if is_token!(TokenKind::BracesLeft, self) {
            let body = self.parse_struct_declarator_list()?;
            ParserResult::Ok(UnionType::Def(UnionDefinition {
                id,
                declarator: body,
            }))
        } else {
            ParserResult::Ok(UnionType::Declar(UnionDeclaration { id: id.unwrap() }))
        }
    }
    fn parse_struct_type(&mut self) -> ParserResult<StructType<'a>> {
        expect_token!(TokenKind::Struct, self);
        let mut id = None;
        if is_token!(TokenKind::Identifier, self) {
            id = Some(self.parse_identifier()?);
        }
        if is_token!(TokenKind::BracesLeft, self) {
            let body = self.parse_struct_declarator_list()?;
            ParserResult::Ok(StructType::Def(StructDefinition {
                id,
                declarator: body,
            }))
        } else {
            ParserResult::Ok(StructType::Declar(StructDeclaration { id: id.unwrap() }))
        }
    }
    pub fn parse_struct_declarator_list(&mut self) -> ParserResult<Vec<StructDeclarator<'a>>> {
        expect_token!(TokenKind::BracesLeft, self);
        let mut body = Vec::new();
        let mut is_start = true;
        loop {
            // break loop if meeted  `}`
            if is_token!(TokenKind::BracesRight, self) {
                self.next_token();
                break;
            }
            // eat colon if not start
            if is_start {
                is_start = false;
            } else {
                expect_token!(TokenKind::Semi, self);
            }
            // break loop if semi followed by `}`
            if is_token!(TokenKind::BracesRight, self) {
                self.next_token();
                break;
            }
            // parse 'type (pointer)? name (colon const-expr)'?
            body.push(self.parse_strute_declarator()?)
        }
        Ok(body)
    }
    fn parse_strute_declarator(&mut self) -> ParserResult<StructDeclarator<'a>> {
        let mut value_type = self.parse_value_type(None)?;
        value_type = self.parse_type_with_pointer_type(value_type);
        println!("{:?}", value_type);
        let id = match &value_type {
            ValueType::FunctionPointer { id, .. } => id.clone(),
            _ => self.parse_identifier()?,
        };
        value_type = self.parse_type_with_array_type(value_type)?;
        // TODO init value
        ParserResult::Ok(StructDeclarator {
            value_type,
            id,
            init_value: None,
        })
    }
    /// Parse function type, function declar or function definition
    fn parse_function_type(
        &mut self,
        return_type: ValueType<'a>,
        id: Identifier<'a>,
    ) -> ParserResult<FunctionType<'a>> {
        let params = self.parse_param_list()?;
        if is_token!(TokenKind::Semi, self) {
            self.next_token();
            Ok(FunctionType::Declar(FunctionDeclaration {
                return_type,
                id,
                params,
            }))
        } else {
            let compound = self.parse_compound_statement()?;
            Ok(FunctionType::Def(FunctionDefinition {
                return_type,
                id,
                params,
                compound,
            }))
        }
    }
    fn parse_param_list(&mut self) -> ParserResult<Vec<ParamDeclar<'a>>> {
        expect_token!(TokenKind::ParenthesesLeft, self);
        let mut body = Vec::new();
        let mut is_start = true;
        loop {
            // break loop if meeted  `)`
            if is_token!(TokenKind::ParenthesesRight, self) {
                self.next_token();
                break;
            }
            // eat comma if not start
            if is_start {
                is_start = false;
            } else {
                expect_token!(TokenKind::Comma, self);
            }
            // break loop if semi followed by `(`
            if is_token!(TokenKind::ParenthesesRight, self) {
                self.next_token();
                break;
            }
            // parse param declar
            let value_type = self.parse_value_type(None)?;
            let id = self.parse_identifier()?;
            body.push(ParamDeclar { id, value_type })
        }
        Ok(body)
    }
    fn parse_declaration_list(
        &mut self,
        mut list: Vec<Declarator<'a>>,
        value_type: ValueType<'a>,
    ) -> ParserResult<Vec<Declarator<'a>>> {
        loop {
            if is_token!(TokenKind::Semi, self) {
                self.next_token();
                break;
            }
            expect_token!(TokenKind::Comma, self);
            let declarator = self.parse_init_declarator(value_type.clone())?;
            list.push(declarator)
        }
        ParserResult::Ok(list)
    }
    /// Parse a declarator with possible init value
    fn parse_init_declarator(&mut self, value_type: ValueType<'a>) -> ParserResult<Declarator<'a>> {
        let pointer_type = self.parse_type_with_pointer_type(value_type);
        let id = self.parse_identifier()?;
        if is_token!(TokenKind::Assignment, self) {
            self.next_token();
            ParserResult::Ok(Declarator {
                value_type: pointer_type,
                id,
                init_value: Some(self.parse_declarator_init_value()?),
            })
        } else {
            ParserResult::Ok(Declarator {
                value_type: pointer_type,
                id,
                init_value: None,
            })
        }
    }
    fn parse_declarator_init_value(&mut self) -> ParserResult<Expression<'a>> {
        ParserResult::Ok(if is_token!(TokenKind::BracesLeft, self) {
            Expression::InitExpr(InitExpression {
                value_type: None,
                designators: self.parse_designator_list()?,
            })
        } else {
            self.parse_assignment_expr()?
        })
    }
}
