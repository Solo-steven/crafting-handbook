use crate::ast::expr::{Identifier, Expression};
use crate::ast::stmt::CompoundStatement;

#[derive(Debug, Clone, PartialEq)]
pub enum Declaration<'a> {
    FunDeclar(FunctionDeclaration<'a>),
    StructDeclar(StructDeclaration<'a>),
    EnumDeclar(EnumDeclaration<'a>),
    UnionDeclar(UnionDeclaration<'a>)
}
#[derive(Debug, Clone, PartialEq)]
pub enum Definition<'a> {
    FunDef(FunctionDefinition<'a>),
    StrcutDef(StructDefinition<'a>),
    EnumDef(EnumDefinition<'a>),
    UnionDef(UnionDefinition<'a>),
}
#[derive(Debug, Clone, PartialEq)]
pub enum FunctionType<'a> {
    Declar(FunctionDeclaration<'a>),
    Def(FunctionDefinition<'a>),
}
#[derive(Debug, Clone, PartialEq)]
pub struct FunctionDeclaration<'a> {
    pub return_type: TypeSpecifier<'a>,
    pub id: Identifier<'a>,
    pub params: Vec<ParamDeclar<'a>>,    
}
#[derive(Debug, Clone, PartialEq)]
pub struct FunctionDefinition<'a> {
    pub return_type: TypeSpecifier<'a>,
    pub id: Identifier<'a>,
    pub params: Vec<ParamDeclar<'a>>,
    pub compound: CompoundStatement
}
#[derive(Debug, Clone, PartialEq)]
pub struct ParamDeclar<'a> {
    pub id: Identifier<'a>,
    pub value_type: TypeSpecifier<'a>
}
#[derive(Debug, Clone, PartialEq)]
pub enum TypeSpecifier<'a> {
    // void
    Void,
    // char
    // - char
    // - signed char
    // - unsigned char
    Char,
    UnSignedChar,
    // shorted
    // - short
    // - short int
    // - signed short
    // - signed short int
    // - unsigned short
    // - unsigned short int
    Shorted,
    UnsignedShort,
    // Int type 
    // - int 
    // - signed
    // - signed int
    // - unsigned
    // - unsigned int
    Int,
    Unsigned,
    // long 
    // - long
    // - long int
    // - signed long
    // - signed long int
    // - unsigned long
    // - unsiged long int
    Long,
    UnsignedLong,
    // long long
    // - long long 
    // - long long int
    // - signed long long 
    // - singed long long int
    // - unsigned long long  
    // - unsigned long long int
    LongLong,
    UnsignedLongLong,
    // float
    // - float
    Float,
    // double
    // - double
    Double,
    // long double
    LongDouble,
    // float _Complex 
    FloatComplex,
    // double _Complex
    DoubleComplex,
    // long double Complex
    LongDoubleComplex,
    // other (struct, pointer, enum, union)
    Pointer(Box<PointerType<'a>>),
    Struct(Box<StructType<'a>>),
    Enum(Box<EnumType<'a>>),
    Union(Box<UnionType<'a>>)
}
#[derive(Debug, Clone, PartialEq)]
pub enum StructType<'a> {
    Def(StructDefinition<'a>),
    Declar(StructDeclaration<'a>),
}
#[derive(Debug, Clone, PartialEq)]
pub struct StructDeclaration<'a> {
    pub id : Identifier<'a>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct StructDefinition<'a> {
    pub id: Option<Identifier<'a>>,
    pub declarator: Vec<Declarator<'a>>
}
#[derive(Debug, Clone, PartialEq)]
pub struct Declarator<'a> {
    pub type_specifier: TypeSpecifier<'a>,
    pub id: Identifier<'a>,
    pub init_value: Option<Expression<'a>>
}
#[derive(Debug, Clone, PartialEq)]
pub struct PointerType<'a> {
    pub qualifiers: Vec<Qualifiers>,
    pub point_to: TypeSpecifier<'a>
}
#[derive(Debug, Clone, PartialEq)]
pub enum Qualifiers {
    Const,
    Restrict,
    Volatile,
}
#[derive(Debug, Clone, PartialEq)]
pub enum EnumType<'a> {
    Declar(EnumDeclaration<'a>),
    Def(EnumDefinition<'a>),
}
#[derive(Debug, Clone, PartialEq)]
pub struct EnumDeclaration<'a> {
    pub id : Identifier<'a>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct EnumDefinition<'a> {
    pub id: Option<Identifier<'a>>,
    pub enumerators: Vec<Enumerator<'a>>
}
#[derive(Debug, Clone, PartialEq)]
pub struct Enumerator<'a> {
    pub id: Identifier<'a>,
    pub init_vale: Option<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub enum UnionType<'a> {
    Declar(UnionDeclaration<'a>),
    Def(UnionDefinition<'a>)
}
#[derive(Debug, Clone, PartialEq)]
pub struct UnionDeclaration<'a> {
    pub id: Identifier<'a>
}
#[derive(Debug, Clone, PartialEq)]
pub struct UnionDefinition<'a> {
    pub id: Option<Identifier<'a>>,
    pub declarator: Vec<Declarator<'a>>
}