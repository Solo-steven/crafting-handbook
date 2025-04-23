use std::fmt;
#[derive(Debug, PartialEq, Clone, Eq)]
pub enum SymbolName {
    UserDefName { namespace: u32, value: u32 },
}

impl fmt::Display for SymbolName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match *self {
            SymbolName::UserDefName { namespace, value } => {
                write!(f, "{}::{}", namespace, value)
            }
        }
    }
}
