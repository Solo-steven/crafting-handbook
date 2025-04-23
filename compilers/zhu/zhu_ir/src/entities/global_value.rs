use crate::entities::r#type::ValueType;
use crate::entities::symbol_name::SymbolName;
#[derive(Debug, PartialEq, Clone, Eq, Hash, Copy)]
pub struct GlobalValue(pub u32);
#[derive(Debug, PartialEq, Clone, Eq)]
pub enum GlobalValueData {
    // external symbol, need to resolve by linker (rellocate)
    Symbol {
        name: SymbolName,
    },
    ///
    Load {
        base: GlobalValue,
        offset: u32,
        ty: ValueType,
    },
    ///
    AddI {
        base: GlobalValue,
        offset: u32,
        ty: ValueType,
    },
}
