use crate::parser::{Parser, ParserResult};
use crate::ast::declar::*;
use crate::token::*;
use crate::{expect_token, is_token};

fn combine_type_specifier_with_signed(signed: Option<bool>, type_specifier: TypeSpecifier) -> TypeSpecifier {
    match signed {
        Some(value) => {
            match value  {
                true => type_specifier,
                false => {
                    match type_specifier {
                        TypeSpecifier::Char => TypeSpecifier::UnSignedChar,
                        TypeSpecifier::Shorted => TypeSpecifier::UnsignedShort,
                        TypeSpecifier::Long => TypeSpecifier::UnsignedLong,
                        TypeSpecifier::LongLong => TypeSpecifier::UnsignedLongLong,
                        TypeSpecifier::Int => TypeSpecifier::Unsigned,
                        _ => {
                            panic!()
                        }
                    }
                }
            }
        }
        _  => type_specifier,
    }
}

impl<'a> Parser<'a> {
    pub (super) fn parse_struct_type(&mut self) -> ParserResult<StructType<'a>> {
        expect_token!(TokenKind::Struct, self);
        let mut id = None;
        if is_token!(TokenKind::Identifier, self)  {
            id = Some(self.parse_identifier()?);
        }
        if is_token!(TokenKind::BracesLeft, self) {
            let body = self.parse_declarator_list()?;
            ParserResult::Ok(StructType::Def(StructDefinition{
                id,
                declarator: body,
            }))
        }else {
            ParserResult::Ok(StructType::Declar(StructDeclaration {
                id: id.unwrap()
            }))
        }
    }
    pub (super) fn parse_declarator_list(&mut self) -> ParserResult<Vec<Declarator<'a>>> {
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
            }else {
                expect_token!(TokenKind::Semi, self);
            }
            // break loop if semi followed by `}`
            if is_token!(TokenKind::BracesRight, self) {
                self.next_token();
                break;
            }
            // parse 'type name (colon const-expr)'?
            let mut type_specifier = self.parse_type_specifier(None)?;
            if is_token!(TokenKind::Multiplication, self) {
                type_specifier = self.parse_maybe_pointer_type(type_specifier);
            }
            let name = self.parse_identifier()?;
            body.push(Declarator {
                type_specifier,
                id: name,
                init_value: None,
            })
        }
        Ok(body)
    }
    /// Parse Type Specifier, reference: C99 6.7.2, it have sub-state machine
    /// - `parse_signed_type_specifier``
    /// - `parse_long_type_specifier`
    /// - `parse_shorted_type_specifier`
    /// - `parse_float_type_specifier`
    /// - `parse_double_type_specifier`
    /// ### Wht signed need to be option bool, not just bool
    pub (super) fn parse_type_specifier(&mut self, signed: Option<bool>)  -> ParserResult<TypeSpecifier<'a>>{
        match self.get_token() {
            TokenKind::Char => {
                self.next_token();
                ParserResult::Ok(TypeSpecifier::Char)
            }
            TokenKind::Void => {
                self.next_token();
                ParserResult::Ok(TypeSpecifier::Void)
            }
            TokenKind::Int => {
                self.next_token();
                ParserResult::Ok(TypeSpecifier::Int)
            }
            TokenKind::Signed => {
                self.next_token();
                self.parse_type_specifier(Some(true))
            }
            TokenKind::Unsigned => {
                self.next_token();
                self.parse_type_specifier(Some(false))
            }
            TokenKind::Long => {
                self.parse_long_type_specifier(signed)
            }
            TokenKind::Short => {
                self.parse_short_type_specifier(signed)
            }
            TokenKind::Float => {
                self.parse_float_type_specifier()
            }
            TokenKind::Double => {
                self.parse_double_type_specifier()
            }
            TokenKind::Struct => {
                Ok(TypeSpecifier::Struct(Box::new(self.parse_struct_type()?)))
            }
            TokenKind::Enum => {
                Ok(TypeSpecifier::Enum(Box::new(self.parse_enum_type()?)))
            }
            TokenKind::Union => {
                Ok(TypeSpecifier::Union(Box::new(self.parse_union_type()?)))
            }
            _ => {
                ParserResult::Err(String::from(""))
            }
        }
    }
    /// Parse type specifier with 'float' keyword start, is possbible can be 
    /// - float
    /// - float _Complex
    pub (super) fn parse_float_type_specifier(&mut self) -> ParserResult<TypeSpecifier<'a>> {
        self.next_token();
        match self.get_token() {
            TokenKind::_Complex => {
                self.next_token(); 
                ParserResult::Ok(TypeSpecifier::FloatComplex)
            }
            _ => ParserResult::Ok(TypeSpecifier::Float)
        }
    }
    /// Parse type specifier with 'float' keyword start, is possbible can be 
    /// - double
    /// - double _Complex
    pub (super) fn parse_double_type_specifier(&mut self) -> ParserResult<TypeSpecifier<'a>> {
        self.next_token();
        match self.get_token() {
            TokenKind::_Complex => { 
                self.next_token(); 
                ParserResult::Ok(TypeSpecifier::DoubleComplex)
            },
            _ => ParserResult::Ok(TypeSpecifier::Double)
        }
    }
    /// Parse type specifier with `short` keyword start, reference
    /// - short
    /// - short int 
    pub (super) fn parse_short_type_specifier(&mut self, signed: Option<bool>) -> ParserResult<TypeSpecifier<'a>> {
        self.next_token();
        match self.get_token() {
            TokenKind::Int => { self.next_token(); },
            _ => {}
        }
        ParserResult::Ok(combine_type_specifier_with_signed(signed, TypeSpecifier::Shorted))
    }
    /// Parser Type specifier when start with `long` keyword. reference : C99 6.7.2
    /// - long
    /// - long int
    /// - long long
    /// - long long int
    /// - long double 
    /// - long double _Complex
    pub (super) fn parse_long_type_specifier(&mut self, signed:Option<bool>) -> ParserResult<TypeSpecifier<'a>> {
        // must start with long
        self.next_token();
        match self.get_token() {
            TokenKind::Int => {
                self.next_token();
                // long int
                ParserResult::Ok(combine_type_specifier_with_signed(signed,TypeSpecifier::Long))
            }
            TokenKind::Long => {
                self.next_token();
                match self.get_token() {
                    TokenKind::Int => {
                        self.next_token();
                    }
                    _ => {}
                }
                ParserResult::Ok(combine_type_specifier_with_signed(signed, TypeSpecifier::LongLong))
            }
            TokenKind::Double => {
                self.next_token();
                match self.get_token() {
                    TokenKind::_Complex => {
                        self.next_token();
                        ParserResult::Ok(combine_type_specifier_with_signed(signed, TypeSpecifier::LongDoubleComplex))
                    }
                    _ => ParserResult::Ok(combine_type_specifier_with_signed(signed, TypeSpecifier::LongDouble))
                }
            }
            _ => ParserResult::Ok(combine_type_specifier_with_signed(signed,TypeSpecifier::Long))
        }
    }
    /// Parse pointer type following the some type.
    pub (super) fn parse_maybe_pointer_type(&mut self , mut type_specifier: TypeSpecifier<'a>) -> TypeSpecifier<'a> {
        loop {
            if is_token!(TokenKind::Multiplication, self) {
                self.next_token();
            }else {
                break;
            }
            let mut qualifiers = Vec::new();
            loop {
                match self.get_token() {
                    TokenKind::Const => {
                        self.next_token();
                        qualifiers.push(Qualifiers::Const);
                    }
                    TokenKind::Restrict => {
                        self.next_token();
                        qualifiers.push(Qualifiers::Restrict);
                    }
                    TokenKind::Volatile => {
                        self.next_token();
                        qualifiers.push(Qualifiers::Volatile);
                    }
                    _ => break,
                }
            }
            type_specifier = TypeSpecifier::Pointer(Box::new(PointerType {
                qualifiers,
                point_to: type_specifier,
            }))
        }
        type_specifier
    }
    /// Parse enum type.
    pub (super) fn parse_enum_type(&mut self) -> ParserResult<EnumType<'a>> {
        println!("{:?}", self.get_token());
        expect_token!(TokenKind::Enum, self);
        let mut id = None;
        if is_token!(TokenKind::Identifier, self)  {
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
                }else {
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
            ParserResult::Ok(EnumType::Def(EnumDefinition{
                id,
                enumerators: body,
            }))
        }else {
            ParserResult::Ok(EnumType::Declar(EnumDeclaration {
                id: id.unwrap()
            }))
        }
    }
    /// Parse union type, same as `parse_sture_type`, need to 
    /// refactor two function into one. 
    pub (super) fn parse_union_type (&mut self) -> ParserResult<UnionType<'a>> {
        expect_token!(TokenKind::Union, self);
        let mut id = None;
        if is_token!(TokenKind::Identifier, self)  {
            id = Some(self.parse_identifier()?);
        }
        if is_token!(TokenKind::BracesLeft, self) {
            let body =self.parse_declarator_list()?;
            ParserResult::Ok(UnionType::Def(UnionDefinition{
                id,
                declarator: body,
            }))
        }else {
            ParserResult::Ok(UnionType::Declar(UnionDeclaration {
                id: id.unwrap()
            }))
        }
    }
    /// Parse function type, function declar or function definition
    pub (super) fn parse_function_type(&mut self) -> ParserResult<FunctionType> {
        let mut return_type = self.parse_type_specifier(None)?;
        return_type = self.parse_maybe_pointer_type(return_type);
        let id = self.parse_identifier()?;
        let params = self.parse_param_list()?;

        if is_token!(TokenKind::Semi, self) {
            self.next_token();
            Ok(FunctionType::Declar(FunctionDeclaration { return_type, id, params }))
        }else {
            let compound = self.parse_compound_statement()?;
            Ok(FunctionType::Def(FunctionDefinition { return_type, id, params, compound }))
        }
    }
    pub (super) fn parse_param_list(&mut self) -> ParserResult<Vec<ParamDeclar<'a>>> {
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
            }else {
                expect_token!(TokenKind::Comma, self);
            }
            // break loop if semi followed by `(`
            if is_token!(TokenKind::ParenthesesRight, self) {
                self.next_token();
                break;
            }
            // parse param declar
            let mut value_type = self.parse_type_specifier(None)?;
            value_type = self.parse_maybe_pointer_type(value_type);
            let id = self.parse_identifier()?;
            body.push(ParamDeclar {
                id,
                value_type,
            })
        }
        Ok(body)
    }
}