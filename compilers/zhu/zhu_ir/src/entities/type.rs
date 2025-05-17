#[derive(Debug, PartialEq, Clone, Eq)]
pub enum ValueType {
    U8,
    U16,
    U32,
    U64,
    I16,
    I32,
    I64,
    F32,
    F64,
    Mem(MemType), // register store a address to memory
}

#[derive(Debug, PartialEq, Clone, Eq, Hash, Copy)]
pub struct MemType(pub u32);
#[derive(Debug, PartialEq, Clone, Eq)]
pub enum MemTypeData {
    Struct(StructTypeData),
    Array(ArrayTypeData),
    Unknow,
}
#[derive(Debug, PartialEq, Clone, Eq)]
pub struct StructTypeData {
    pub size: u32,
    pub fields: Vec<StructTypeDataField>,
}
#[derive(Debug, PartialEq, Clone, Eq)]
pub struct StructTypeDataField {
    pub offset: u32,
    pub ty: ValueType,
}
#[derive(Debug, PartialEq, Clone, Eq)]
pub struct ArrayTypeData {
    pub size: u32,
    // ty of array type can not be array
    pub ty: ValueType,
}
