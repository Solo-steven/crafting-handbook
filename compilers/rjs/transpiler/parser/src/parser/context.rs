
#[derive(Debug, Clone, PartialEq)]
pub enum ScopeContext {
    BlockContext,
    FunctionContext(FunctionContext),
}
#[derive(Debug, Clone, PartialEq)]
pub struct FunctionContext  {
    pub is_async: bool,
    pub is_generator: bool,
    pub in_parameter: bool,
    pub is_simple_parameter: bool,
    pub in_strict: bool,
}
