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
#[derive(Debug, Clone, PartialEq)]
pub struct VariableDeclaration<'a> {
    pub variant: DeclarationKind,
    pub declarators: Vec<VariableDeclarator<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub enum DeclarationKind {
    Let,
    Const,
    Var,
}
#[derive(Debug, Clone, PartialEq)]
pub struct VariableDeclarator<'a> {
    pub id: Pattern<'a>,
    pub init: Option<Expression<'a>>
}
#[derive(Debug, Clone, PartialEq)]
pub struct FunctionBody<'a> {
    pub body: Vec<StatementListItem<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct FunctionDeclaration<'a> {
    pub name: Identifier<'a>,
    pub body: FunctionBody<'a>,
    pub generator: bool,
    pub is_async: bool,
}
#[derive(Debug, Clone, PartialEq)]
pub struct ClassBody<'a> {
    pub body: Vec<ClassElement<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct ClassProperty<'a> {
    pub key: PrivateNameOrPropertyName<'a>,
    pub value: Option<Expression<'a>>,
    pub computed: bool,
    pub short: bool,
    pub is_static: bool,
}
#[derive(Debug, Clone, PartialEq)]
pub struct ClassMethodDefinition<'a> {
    pub key: PrivateNameOrPropertyName<'a>,
    pub body: FunctionBody<'a>,
    pub params: Vec<Pattern<'a>>,
    pub computed: bool,
    pub generator: bool,
    pub is_async: bool,
}
#[derive(Debug, Clone, PartialEq)]
pub struct ClassAccessor<'a> {
    pub key: PrivateNameOrPropertyName<'a>,
    pub accessor_type: AccessorType,
    pub body: FunctionBody<'a>,
    pub params: Vec<Pattern<'a>>,
    pub computed: bool,
}
#[derive(Debug, Clone, PartialEq)]
pub struct ClassConstructor<'a> {
    pub key: PrivateNameOrPropertyName<'a>,
    pub body: FunctionBody<'a>,
    pub params: Vec<Pattern<'a>>,
}
#[derive(Debug, Clone, PartialEq)]
pub enum PrivateNameOrPropertyName<'a> {
    Prop(PropertyName<'a>),
    Private(PrivateName<'a>),
}
#[derive(Debug, Clone, PartialEq)]
pub enum ClassElement<'a> {
    ClassProp(ClassProperty<'a>),
    ClassMethodDef(ClassMethodDefinition<'a>),
    ClassAccessor(ClassAccessor<'a>),
    ClassCtor(ClassConstructor<'a>)
}
#[derive(Debug, Clone, PartialEq)]
pub struct ClassDeclaration<'a> {
    pub id: Identifier<'a>,
    pub super_class: Expression<'a>,
    pub body: ClassBody<'a>
}
#[derive(Debug, Clone, PartialEq)]
pub enum Declaration<'a> {
    FunDeclar(FunctionDeclaration<'a>),
    VarDeclar(VariableDeclaration<'a>),
    ClassDeclar(ClassDeclaration<'a>)
}
#[derive(Debug, Clone, PartialEq)]
pub struct ImportDeclaration<'a> {
    pub specifiers: Vec<ImportSpecifierKind<'a>>,
    pub source: StringLiteral<'a>
}#[derive(Debug, Clone, PartialEq)]
pub enum ImportSpecifierKind<'a> {
    Default(ImportDefaultSpecifier<'a>),
    Namespace(ImportNamespaceSpecifier<'a>),
    Specifier(ImportSpecifier<'a>),
}#[derive(Debug, Clone, PartialEq)]
pub struct ImportDefaultSpecifier<'a> {
    pub imported: Identifier<'a>
}#[derive(Debug, Clone, PartialEq)]
pub struct ImportNamespaceSpecifier<'a> {
    pub imported: Identifier<'a>
}#[derive(Debug, Clone, PartialEq)]
pub struct ImportSpecifier<'a> {
    pub imported: ModuleName<'a>,
    pub local: Option<Identifier<'a>>
}#[derive(Debug, Clone, PartialEq)]
pub enum ModuleName<'a> {
    Ident(Identifier<'a>),
    String(StringLiteral<'a>),
}#[derive(Debug, Clone, PartialEq)]
pub struct ExportNameDeclaration<'a> {
    pub specifiers: Vec<ExportSpecifier<'a>>,
    pub declaration: Option<Declaration<'a>>,
    pub source: Option<StringLiteral<'a>>,
}#[derive(Debug, Clone, PartialEq)]
pub struct ExportSpecifier<'a> {
   pub exported: ModuleName<'a>,
   pub local: Option<ModuleName<'a>>,
}#[derive(Debug, Clone, PartialEq)]
pub struct ExportDefaultDeclaration<'a> {
    pub declaration: DefaultDeclaration<'a>,
}#[derive(Debug, Clone, PartialEq)]
pub enum DefaultDeclaration<'a> {
    FunctionDeclar(FunctionDeclaration<'a>),
    FunctionExpr(FunctionExpression<'a>),
    ClassDeclar(ClassDeclaration<'a>),
    Expr(Expression<'a>),
}#[derive(Debug, Clone, PartialEq)]
pub struct ExportAllDeclaration<'a> {
    pub exported: Option<Identifier<'a>>,
    pub source: StringLiteral<'a>,
}
#[derive(Debug, Clone, PartialEq)]
pub enum ExportDeclaration<'a> {
    Name(ExportNameDeclaration<'a>),
    Default(ExportDefaultDeclaration<'a>),
    All(ExportAllDeclaration<'a>)
}