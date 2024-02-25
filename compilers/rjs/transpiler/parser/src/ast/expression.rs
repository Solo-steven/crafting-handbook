use std::borrow::Cow;
use crate::ast::declaration::{ClassBody, FunctionBody};
use serde::{Deserialize, Serialize};
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct SuperExpression;
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ThisExpression;
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct Identifier<'a> {
    pub name: Cow<'a, str>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct PrivateName<'a> {
    pub name: Cow<'a, str>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct NumberLiteral<'a> {
    pub raw_val: Cow<'a, str>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct StringLiteral<'a> {
    pub raw_val: Cow<'a, str>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct BooleanLiteral<'a> {
    pub raw_val: Cow<'a, str>,
    pub value: bool,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct NullLiteral;
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct UndefinedLiteral;
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct RegexLiteral<'a> {
    pub pattern: Cow<'a, str>,
    pub flags: Cow<'a, str>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct TemplateLiteral<'a> {
    pub quasis: Vec<TemplateElement<'a>>,
    pub exprs: Vec<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct TemplateElement<'a> {
    pub raw_val: Cow<'a, str>,
    pub tail: bool,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ObjectExpression<'a> {
    pub properties: Vec<PropertyDefinition<'a>>,
    pub trailing_comma: bool,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
#[serde(tag="type")]
pub enum PropertyName<'a> {
    Ident(Identifier<'a>),
    String(StringLiteral<'a>),
    Number(NumberLiteral<'a>),
    Expr(Expression<'a>),
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
#[serde(tag="type")]
pub enum PropertyDefinition<'a> {
    ObjProp(ObjectProperty<'a>),
    ObjMethodDef(ObjectMethodDefinition<'a>),
    Spread(SpreadElement<'a>),
    ObjAccessor(ObjectAccessor<'a>)
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ObjectProperty<'a> {
    pub key: PropertyName<'a>,
    pub value: Option<Expression<'a>>,
    pub computed: bool,
    pub shorted: bool,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ObjectMethodDefinition<'a> {
    pub key: PropertyName<'a>,
    pub body: FunctionBody<'a>,
    pub params: Vec<Pattern<'a>>,
    pub computed: bool,
    pub generator: bool,
    pub is_async: bool,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ObjectAccessor<'a> {
    pub key: PropertyName<'a>,
    pub accessor_type: AccessorType,
    pub body: FunctionBody<'a>,
    pub params: Vec<Pattern<'a>>,
    pub computed: bool,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct SpreadElement<'a> {
    pub argument: Box<Expression<'a>>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub enum AccessorType {
    Setter,
    Getter
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ClassExpression<'a> {
    pub id: Option<Identifier<'a>>,
    pub super_class: Option<Box<Expression<'a>>>,
    pub body: ClassBody<'a>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ArrayExpression<'a> {
    pub elements: Vec<Option<Expression<'a>>>,
    pub trailing_comma: bool,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct FunctionExpression<'a> {
    pub id: Option<Identifier<'a>>,
    pub params: Vec<Pattern<'a>>,
    pub body: FunctionBody<'a>,
    pub generator: bool,
    pub is_async: bool,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ArrowFunctionExpression<'a> {
    pub is_async: bool,
    pub expression_body: bool,
    pub body: ExpressionOrFunctionBody<'a>,
    pub params: Vec<Pattern<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub enum ExpressionOrFunctionBody<'a> {
    Expr(Box<Expression<'a>>),
    FuncBody(FunctionBody<'a>)
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct MetaPropery<'a> {
    pub property: Identifier<'a>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct AwaitExpression<'a> {
    pub argument: Box<Expression<'a>>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct NewExpression<'a> {
    pub callee: Box<Expression<'a>>,
    pub arguments: Vec<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct MemberExpression<'a> {
    pub object: Box<Expression<'a>>,
    pub property: Box<Expression<'a>>,
    pub computed: bool,
    pub optional: bool
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct CallExpression<'a> {
    pub callee: Box<Expression<'a>>,
    pub arguments: Vec<Expression<'a>>,
    pub optional: bool
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct TaggedTemplateExpression<'a> {
    pub quasi: TemplateLiteral<'a>,
    pub tag: Box<Expression<'a>>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ChainExpression<'a> {
    pub expr: Box<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct UpdateExpression<'a> {
    pub argument: Box<Expression<'a>>,
    pub prefix: bool,
    pub operator:UpdateOperatorKinds,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub enum UpdateOperatorKinds {
    IncreOperator,
    DecreOperator
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct UnaryExpression<'a> {
    pub argument: Box<Expression<'a>>,
    pub operator: UnaryOperatorKinds,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub enum UnaryOperatorKinds {
    LogicalNOTOperator, // !
    BitwiseNOTOperator, // ~
    BitwiseXOROperator, // ^
    PlusOperator,       // +
    MinusOperator,      // -
    DeleteKeyword,      // delete
    VoidKeyword,        // void
    TypeofKeyword       // typeof
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct BinaryExpression<'a> {
    pub left: Box<Expression<'a>>,
    pub right: Box<Expression<'a>>,
    pub operator: BinaryOperatorKinds
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
#[serde(tag="type")]
pub enum BinaryOperatorKinds {
    PlusOperator,       // +
    MinusOperator,      // -
    DivideOperator,     // /
    MultiplyOperator,   // *
    ModOperator,    // %
    ExponOperator,  // **
    GtOperator,     // >
    LtOperator,     // <
    EqOperator,     // ==
    NotEqOperator,  // !=
    GeqtOperator,   // >=
    LeqtOperator,   // <=
    StrictEqOperator,       // ===
    StrictNotEqOperator,    // !==
    BitwiseOROperator,      // |
    BitwiseANDOperator,     // &
    BitwiseXOROperator,     // ^
    BitwiseLeftShiftOperator,      // <<
    BitwiseRightShiftOperator,     // >>
    BitwiseRightShiftFillOperator,  // >>>
    LogicalANDOperator, // &&
    LogicalOROperator, // ||
    InKeyword,
    InstanceofKeyword,
    NullishOperator // ??
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ConditionalExpression<'a> {
    pub test: Box<Expression<'a>>,
    pub conseq: Box<Expression<'a>>,
    pub alter: Box<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct YieldExpression<'a> {
    pub argument: Option<Box<Expression<'a>>>,
    pub deletgate: bool,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct AssignmentExpression<'a> {
    pub left: Box<ExprORPat<'a>>,
    pub right: Box<Expression<'a>>,
    pub operator: AssignmentOperatorKinds
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
#[serde(tag="type")]
pub enum AssignmentOperatorKinds {
   AssginOperator,
   PlusAssignOperator,
   MinusAssignOperator,
   ExponAssignOperator,
   DivideAssignOperator,
   MultiplyAssignOperator,
   ModAssignOperator,
   BitwiseORAssginOperator,    // |=
   BitwiseANDAssginOperator,   // &=
   BitwiseNOTAssginOperator,   // ~=
   BitwiseXORAssginOperator,   // ^=
   LogicalORAssignOperator ,   // ||=
   LogicalAndassginOperator,   // &&=
   BitwiseLeftShiftAssginOperator,     // <<=
   BitwiseRightShiftAssginOperator,    // >>=
   BitwiseRightShiftFillAssginOperator // >>>=
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct SequenceExpression<'a> {
    pub exprs: Vec<Expression<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
#[serde(tag="type")]
pub enum Expression<'a> {
    // idents
    Super(SuperExpression),
    This(ThisExpression),
    Ident(Identifier<'a>),
    Private(PrivateName<'a>),
    // literals
    Number(NumberLiteral<'a>),
    String(StringLiteral<'a>),
    Bool(BooleanLiteral<'a>),
    Template(TemplateLiteral<'a>),
    Undefined(UndefinedLiteral),
    Null(NullLiteral),
    ObjectExpr(ObjectExpression<'a>), 
    ArrayExpr(ArrayExpression<'a>),
    ArrorFunctionExpr(ArrowFunctionExpression<'a>),
    FunctionExpr(FunctionExpression<'a>),
    ClassExpr(ClassExpression<'a>),
    // meta
    Spread(SpreadElement<'a>),
    Meta(MetaPropery<'a>),
    // exprs
    CallExpr(CallExpression<'a>),
    MemberExpr(MemberExpression<'a>),
    TaggedTemplateExpr(TaggedTemplateExpression<'a>),
    NewExpr(NewExpression<'a>),
    ChainExpr(ChainExpression<'a>),
    UpdateExpr(UpdateExpression<'a>),
    UnaryExpr(UnaryExpression<'a>),
    AwaitExpr(AwaitExpression<'a>),
    BinaryExpr(BinaryExpression<'a>),
    ConditionalExpr(ConditionalExpression<'a>),
    YieldExpr(YieldExpression<'a>),
    AssigmentExpr(AssignmentExpression<'a>),
    SequenceExpr(SequenceExpression<'a>),
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
#[serde(tag="type")]
pub enum Pattern<'a> {
    Ident(Identifier<'a>),
    Assgin(AssignmentPattern<'a>),
    Obj(ObjectPattern<'a>),
    Array(ArrayPattern<'a>),
    Rest(RestElement<'a>),
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ObjectPattern<'a> {
    pub properties: Vec<ObjectPatternProperty<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub enum  ObjectPatternProperty<'a> {
    Property {
        key: PropertyName<'a>,
        value: Option<Box<Pattern<'a>>>,
        computed: bool,
        shorted: bool,
    },
    Assign(AssignmentPattern<'a>),
    Rest(RestElement<'a>),
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct AssignmentPattern<'a> {
    pub left: Box<Pattern<'a>>,
    pub right: Expression<'a>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ArrayPattern<'a> {
    pub elements: Vec<Option<Pattern<'a>>>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct RestElement<'a> {
    pub argument: Box<Pattern<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub enum ExprORPat<'a> {
    Expr(Expression<'a>),
    Pat(Pattern<'a>)
}