use serde::{Deserialize, Serialize};
use crate::ast::expr::{Identifier, Expression};
use crate::ast::stmt::CompoundStatement;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag="type")]
pub enum Declaration<'a> {
    DelcarList(DeclarationList<'a>),
    #[serde(untagged)]
    ValueType(ValueType<'a>),
    #[serde(untagged)]
    FunType(FunctionType<'a>),
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DeclarationList<'a> {
    pub value_type: ValueType<'a>,
    pub declarators: Vec<Declarator<'a>>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Declarator<'a> {
    pub value_type: ValueType<'a>,
    pub id: Identifier<'a>,
    pub init_value: Option<Expression<'a>>
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum FunctionType<'a> {
    #[serde(rename="FuncDeclar")]
    Declar(FunctionDeclaration<'a>),
    #[serde(rename="FuncDef")]
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
    // other (struct, enum, union, pointer, array)
    FunctionPointer {
        id: Identifier<'a>,
        return_type: Box<ValueType<'a>>,
        param_types: Vec<ValueType<'a>>,
    },
    PointerType(Box<PointerType<'a>>),
    ArrayType(Box<ArrayType<'a>>),
    #[serde(untagged)]
    Struct(Box<StructType<'a>>),
    #[serde(untagged)]
    Enum(Box<EnumType<'a>>),
    #[serde(untagged)]
    Union(Box<UnionType<'a>>),
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum StorageClassSpecifier {
    Extern,
    Auto,
    Register,
    Static,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum StructType<'a> {
    #[serde(rename="StructDef")]
    Def(StructDefinition<'a>),
    #[serde(rename="StructDeclar")]
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
    pub qualifiers: Vec<Vec<Qualifiers>>,
    pub level: usize
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
    #[serde(rename="EnumDef")]
    Declar(EnumDeclaration<'a>),
    #[serde(rename="EnumDeclar")]
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
    #[serde(rename="UnionDef")]
    Declar(UnionDeclaration<'a>),
    #[serde(rename="UnionDeclar")]
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
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ArrayType<'a> {
    pub dims: Vec<Expression<'a>>,
    pub array_of: Box<ValueType<'a>>
}
