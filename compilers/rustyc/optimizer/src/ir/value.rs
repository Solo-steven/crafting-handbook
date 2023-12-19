use std::collections::HashMap;
#[derive(Debug, PartialEq, Clone, Hash, Eq, Copy)]
pub struct  Value(pub usize);
#[derive(Debug, PartialEq, Clone)]
pub enum ValueData {
    GlobalRef(String),
    VirRegister(String),
    Immi(Immi)
}
#[derive(Debug, PartialEq, Clone)]
pub enum Immi {
    U8(u8),
    U16(u16),
    U32(u32),
    U64(u64),
    I16(i16),
    I32(i32),
    I64(i64),
    F32(f32),
    F64(f64),
}
#[derive(Debug, PartialEq, Clone, PartialOrd)]
pub enum IrValueType {
    Void,
    U8,
    U16,
    U32,
    U64,
    I16,
    I32,
    I64,
    F32,
    F64,
    Address,
}
pub type ValueMap = HashMap<Value, ValueData>;
pub type TypeMap = HashMap<Value, IrValueType>;
