use crate::ast::declar::ValueType;
use crate::token::{FloatLiteralBase, IntLiteralBase};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
/// Variant of All Possible Expressions.
pub enum Expression<'a> {
    SequentialExpr(SequentialExpression<'a>),
    AssignmentExpr(AssignmentExpression<'a>),
    ConditionalExpr(ConditionalExpression<'a>),
    BinaryExpr(BinaryExpression<'a>),
    UnaryExpr(UnaryExpression<'a>),
    SizeOfValueExpr(SizeOfValueExpression<'a>),
    SizeOfTypeExpr(SizeOfTypeExpression<'a>),
    CastExpr(CastExpression<'a>),
    UpdateExpr(UpdateExpression<'a>),
    MemberExpr(MemberExpression<'a>),
    SubscriptExpr(SubscriptionExpression<'a>),
    CallExpr(CallExpression<'a>),
    DereferenceExpr(DereferenceExpression<'a>),
    InitExpr(InitExpression<'a>),
    StringLiteral(StringLiteral<'a>),
    CharLiteral(CharLiteral<'a>),
    IntLiteral(IntLiteral<'a>),
    FloatLiteral(FloatLiteral<'a>),
    Identifier(Identifier<'a>),
    ParenthesesExpr(ParenthesesExpression<'a>),
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SequentialExpression<'a> {
    pub exprs: Vec<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct AssignmentExpression<'a> {
    pub left: Box<Expression<'a>>,
    pub right: Box<Expression<'a>>,
    pub ops: AssignmentOps,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum AssignmentOps {
    Assignment,                  // =,
    SumAssignment,               // +=
    DiffAssignment,              // -=
    ProductAssignment,           // *=
    QuotientAssignment,          // /=
    RemainderAssignment,         // %=
    BitwiseLeftShiftAssignment,  // <<=
    BitwiseRightShiftAssignment, // >>=
    BitwiseAndAssignment,        // &=
    BitwiseOrAssignment,         // |=
    BitwiseXorAssignment,        // ^=
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ConditionalExpression<'a> {
    pub condi: Box<Expression<'a>>,
    pub conseq: Box<Expression<'a>>,
    pub alter: Box<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BinaryExpression<'a> {
    pub left: Box<Expression<'a>>,
    pub right: Box<Expression<'a>>,
    pub ops: BinaryOps,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum BinaryOps {
    Plus,              // +
    Minus,             // -
    Multiplication,    // *
    Division,          // /
    Remainder,         // %
    LogicalAnd,        // &&
    LogicalOr,         // ||
    BitwiseAnd,        // & (same as adress of operator)
    BitwiseOr,         // |
    BitwiseXor,        // ^
    BitwiseLeftShift,  // <<
    BitwiseRightShift, // >>
    Equal,             // ==
    NotEqual,          // !=
    Gt,                // >
    Geqt,              // >=
    Lt,                // <
    Leqt,              // <=
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct UnaryExpression<'a> {
    pub expr: Box<Expression<'a>>,
    pub ops: UnaryOps,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SizeOfTypeExpression<'a> {
    pub value_type: ValueType<'a>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SizeOfValueExpression<'a> {
    pub expr: Box<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum UnaryOps {
    Plus,        // +
    Minus,       // -
    BitwiseNot,  // ~
    LogicalNot,  // !
    Sizeof,      // sizeof
    AddressOf,   // &
    Dereference, // *
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CastExpression<'a> {
    pub type_name: ValueType<'a>,
    pub expr: Box<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct UpdateExpression<'a> {
    pub expr: Box<Expression<'a>>,
    pub posfix: bool,
    pub ops: UpdateOps,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum UpdateOps {
    Increment, // ++
    Decrement, // --
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
/// AST for dot operator access a struct. like `someStruct.someMember`
pub struct MemberExpression<'a> {
    pub object: Box<Expression<'a>>,
    pub property: Box<Identifier<'a>>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
/// AST for access pointer index, like `somePointer[someIndex]`
pub struct SubscriptionExpression<'a> {
    pub object: Box<Expression<'a>>,
    pub index: Box<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
/// AST for function call, like `SomeFun(argumenrList)`
pub struct CallExpression<'a> {
    pub callee: Box<Expression<'a>>,
    pub arguments: Vec<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
/// AST for pointer access, like `somePointer->someThing`
pub struct DereferenceExpression<'a> {
    pub pointer: Box<Expression<'a>>,
    pub property: Box<Identifier<'a>>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct InitExpression<'a> {
    pub value_type: Option<ValueType<'a>>,
    pub designators: Vec<Designator<'a>>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Designator<'a> {
    pub id: Identifier<'a>,
    pub init_value: Expression<'a>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StringLiteral<'a> {
    pub raw_value: Cow<'a, str>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct IntLiteral<'a> {
    pub raw_value: Cow<'a, str>,
    pub value_type: ValueType<'a>,
    pub base: IntLiteralBase,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FloatLiteral<'a> {
    pub raw_value: Cow<'a, str>,
    pub value_type: ValueType<'a>,
    pub base: FloatLiteralBase,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CharLiteral<'a> {
    pub raw_value: Cow<'a, str>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Identifier<'a> {
    pub name: Cow<'a, str>,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ParenthesesExpression<'a> {
    pub expr: Box<Expression<'a>>,
}
