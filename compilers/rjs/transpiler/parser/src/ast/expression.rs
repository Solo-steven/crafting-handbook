

use std::borrow::Cow;


pub struct Super;
pub struct ThisExpression;

pub struct Identifier<'a> {
    pub name: Cow<'a, str>
}
pub struct PrivateName<'a> {
    pub name: Cow<'a, str>
}
pub struct NumberLiteral {
    
}