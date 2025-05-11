use crate::entities::external_name::ExternalName;
use crate::entities::immediate::Offset;
use crate::entities::r#type::ValueType;
#[derive(Debug, PartialEq, Clone, Eq, Hash, Copy)]
pub struct GlobalValue(pub u32);
#[derive(Debug, PartialEq, Clone, Eq)]
pub enum GlobalValueData {
    // external symbol, need to resolve by linker (rellocate)
    Symbol {
        name: ExternalName,
    },
    ///
    Load {
        base: GlobalValue,
        offset: Offset,
        ty: ValueType,
    },
    ///
    AddI {
        base: GlobalValue,
        offset: Offset,
        ty: ValueType,
    },
}
