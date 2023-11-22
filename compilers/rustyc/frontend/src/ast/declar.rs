use serde::{Deserialize, Serialize};
use crate::ast::expr::{Identifier, Expression};
use crate::ast::stmt::CompoundStatement;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Declaration<'a> {
    ValueType(ValueType<'a>),
    FunType(FunctionType<'a>),
    DelcarList(DeclarationList<'a>),
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DeclarationList<'a> {
    pub value_type: ValueType<'a>,
    pub declarators: Vec<Declarator<'a>>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Declarator<'a> {
    pub pointer_declarator: Option<PointerDeclarator>,
    pub id: Identifier<'a>,
    pub init_value: Option<Expression<'a>>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum FunctionType<'a> {
    Declar(FunctionDeclaration<'a>),
    Def(FunctionDefinition<'a>),
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FunctionDeclaration<'a> {
    pub return_type: ValueType<'a>,
    pub id: Identifier<'a>,
    pub params: Vec<ParamDeclar<'a>>,    
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FunctionDefinition<'a> {
    pub return_type: ValueType<'a>,
    pub id: Identifier<'a>,
    pub params: Vec<ParamDeclar<'a>>,
    pub compound: CompoundStatement<'a>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ParamDeclar<'a> {
    pub id: Identifier<'a>,
    pub value_type: ValueType<'a>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ValueType<'a> {
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
    // other (struct, enum, union)
    PointerType(Box<PointerType<'a>>),
    Struct(Box<StructType<'a>>),
    Enum(Box<EnumType<'a>>),
    Union(Box<UnionType<'a>>)
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum StructType<'a> {
    Def(StructDefinition<'a>),
    Declar(StructDeclaration<'a>),
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StructDeclaration<'a> {
    pub id : Identifier<'a>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StructDefinition<'a> {
    pub id: Option<Identifier<'a>>,
    pub declarator: Vec<StructDeclarator<'a>>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StructDeclarator<'a> {
    pub value_type: ValueType<'a>,
    pub id: Identifier<'a>,
    pub init_value: Option<Expression<'a>>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PointerType<'a> {
    pub pointer_to: Box<ValueType<'a>>,
    pub qualifiers: Vec<Qualifiers>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PointerDeclarator {
    pub qualifiers: Vec<Vec<Qualifiers>>,
    pub level: usize,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Qualifiers {
    Const,
    Restrict,
    Volatile,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum EnumType<'a> {
    Declar(EnumDeclaration<'a>),
    Def(EnumDefinition<'a>),
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct EnumDeclaration<'a> {
    pub id : Identifier<'a>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct EnumDefinition<'a> {
    pub id: Option<Identifier<'a>>,
    pub enumerators: Vec<Enumerator<'a>>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Enumerator<'a> {
    pub id: Identifier<'a>,
    pub init_vale: Option<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum UnionType<'a> {
    Declar(UnionDeclaration<'a>),
    Def(UnionDefinition<'a>)
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct UnionDeclaration<'a> {
    pub id: Identifier<'a>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct UnionDefinition<'a> {
    pub id: Option<Identifier<'a>>,
    pub declarator: Vec<StructDeclarator<'a>>
}