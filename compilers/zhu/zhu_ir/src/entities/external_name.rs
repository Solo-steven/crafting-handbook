use crate::entities::module::ModuleLevelId;

/// ## Data Entuty: External Name
/// The term `External` is a view from function aspect.
#[derive(Debug, PartialEq, Clone, Eq)]
pub enum ExternalName {
    UserDefName { namespace: UserDefNamespace, value: u32 },
}

impl ExternalName {
    pub fn from_module_level_id(id: ModuleLevelId) -> Self {
        match id {
            ModuleLevelId::Data(data_id) => Self::UserDefName {
                namespace: UserDefNamespace::Data,
                value: data_id.0,
            },
            ModuleLevelId::Func(func_id) => Self::UserDefName {
                namespace: UserDefNamespace::Function,
                value: func_id.0,
            },
        }
    }
}
#[derive(Debug, PartialEq, Clone, Eq)]
pub enum UserDefNamespace {
    Data,
    Function,
    Other(u32),
}
