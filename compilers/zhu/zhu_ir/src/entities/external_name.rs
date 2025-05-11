/// ## Data Entuty: External Name
/// The term `External` is a view from function aspect.
#[derive(Debug, PartialEq, Clone, Eq)]
pub enum ExternalName {
    UserDefName { namespace: UserDefNamespace, value: u32 },
}
#[derive(Debug, PartialEq, Clone, Eq)]
pub enum UserDefNamespace {
    Data,
    Function,
    MemType,
    Other(u32),
}
