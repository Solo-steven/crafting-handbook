use crate::ast::expression::{
    Expression,
    Identifier,
    StringLiteral,
    Pattern,
    AccessorType,
    PrivateName,
    PropertyName
};
use crate::ast::StatementListItem;
use super::expression::FunctionExpression;
use serde::{Deserialize, Serialize};
use rjs_attribute_marco::js_node;
use crate::span::Span;

#[js_node]
pub struct VariableDeclaration<'a> {
    pub variant: DeclarationKind,
    pub declarators: Vec<VariableDeclarator<'a>>,
}
#[js_node]
pub enum DeclarationKind {
    Let,
    Const,
    Var,
}
#[js_node]
pub struct VariableDeclarator<'a> {
    pub id: Pattern<'a>,
    pub init: Option<Expression<'a>>,
}
#[js_node]
pub struct FunctionBody<'a> {
    pub body: Vec<StatementListItem<'a>>,
}
#[js_node]
pub struct FunctionDeclaration<'a> {
    pub name: Option<Identifier<'a>>,
    pub params: Vec<Pattern<'a>>,
    pub body: FunctionBody<'a>,
    pub generator: bool,
    pub is_async: bool,
}
#[js_node]
pub struct ClassBody<'a> {
    pub body: Vec<ClassElement<'a>>,
}
#[js_node]
pub struct ClassProperty<'a> {
    pub key: PrivateNameOrPropertyName<'a>,
    pub value: Option<Expression<'a>>,
    pub computed: bool,
    pub short: bool,
    pub is_static: bool,
}
#[js_node]
pub struct ClassMethodDefinition<'a> {
    pub key: PrivateNameOrPropertyName<'a>,
    pub body: FunctionBody<'a>,
    pub params: Vec<Pattern<'a>>,
    pub computed: bool,
    pub generator: bool,
    pub is_async: bool,
    pub is_static: bool,
}
#[js_node]
pub struct ClassAccessor<'a> {
    pub key: PrivateNameOrPropertyName<'a>,
    pub accessor_type: AccessorType,
    pub body: FunctionBody<'a>,
    pub params: Vec<Pattern<'a>>,
    pub computed: bool,
}
#[js_node]
pub struct ClassConstructor<'a> {
    pub key: PrivateNameOrPropertyName<'a>,
    pub body: FunctionBody<'a>,
    pub params: Vec<Pattern<'a>>,
}
#[js_node]
#[serde(tag="type")]
pub enum PrivateNameOrPropertyName<'a> {
    #[serde(rename="PrivateName")]
    Private(PrivateName<'a>),
    #[serde(untagged)]
    Prop(PropertyName<'a>),
}
#[js_node]
#[serde(tag="type")]
pub enum ClassElement<'a> {
    #[serde(rename="ClassProperty")]
    ClassProp(ClassProperty<'a>),
    #[serde(rename="ClassMethodDefintion")]
    ClassMethodDef(ClassMethodDefinition<'a>),
    #[serde(rename="ClassAccessor")]
    ClassAccessor(ClassAccessor<'a>),
    #[serde(rename="ClassConstructor")]
    ClassCtor(ClassConstructor<'a>)
}
#[js_node]
pub struct ClassDeclaration<'a> {
    pub id: Identifier<'a>,
    pub super_class:Option<Expression<'a>>,
    pub body: ClassBody<'a>,
}
#[js_node]
#[serde(tag="type")]
pub enum Declaration<'a> {
    #[serde(rename="FunctionDeclaration")]
    FunDeclar(FunctionDeclaration<'a>),
    #[serde(rename="VariableDeclaration")]
    VarDeclar(VariableDeclaration<'a>),
    #[serde(rename="ClassDeclaration")]
    ClassDeclar(ClassDeclaration<'a>)
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ImportDeclaration<'a> {
    pub specifiers: Vec<ImportSpecifierKind<'a>>,
    pub source: StringLiteral<'a>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub enum ImportSpecifierKind<'a> {
    Default(ImportDefaultSpecifier<'a>),
    Namespace(ImportNamespaceSpecifier<'a>),
    Specifier(ImportSpecifier<'a>),
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ImportDefaultSpecifier<'a> {
    pub imported: Identifier<'a>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ImportNamespaceSpecifier<'a> {
    pub imported: Identifier<'a>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ImportSpecifier<'a> {
    pub imported: ModuleName<'a>,
    pub local: Option<Identifier<'a>>
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub enum ModuleName<'a> {
    Ident(Identifier<'a>),
    String(StringLiteral<'a>),
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ExportNameDeclaration<'a> {
    pub specifiers: Vec<ExportSpecifier<'a>>,
    pub declaration: Option<Declaration<'a>>,
    pub source: Option<StringLiteral<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ExportSpecifier<'a> {
   pub exported: ModuleName<'a>,
   pub local: Option<ModuleName<'a>>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ExportDefaultDeclaration<'a> {
    pub declaration: DefaultDeclaration<'a>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub enum DefaultDeclaration<'a> {
    FunctionDeclar(FunctionDeclaration<'a>),
    FunctionExpr(FunctionExpression<'a>),
    ClassDeclar(ClassDeclaration<'a>),
    Expr(Expression<'a>),
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct ExportAllDeclaration<'a> {
    pub exported: Option<Identifier<'a>>,
    pub source: StringLiteral<'a>,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub enum ExportDeclaration<'a> {
    Name(ExportNameDeclaration<'a>),
    Default(ExportDefaultDeclaration<'a>),
    All(ExportAllDeclaration<'a>)
}