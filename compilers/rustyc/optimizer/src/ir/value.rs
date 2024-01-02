use std::collections::HashMap;
#[derive(Debug, PartialEq, Clone, Hash, Eq, Copy)]
pub struct  Value(pub usize);
#[derive(Debug, PartialEq, Clone)]
pub enum ValueData {
    GlobalRef(String),
    FunctionRef(String),
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

impl Immi {
    pub fn get_data_as_i128(&self) -> i128 {
        match *self {
            Immi::U8(data) => data as i128,   
            Immi::U16(data) => data as i128,
            Immi::U32(data) => data as i128,
            Immi::U64(data) => data as i128,
            Immi::I16(data) => data as i128,
            Immi::I32(data) => data as i128,
            Immi::I64(data) => data as i128,
            Immi::F32(data) => data as i128,
            Immi::F64(data) => data as i128,
        }
    }
    pub fn get_data_as_f64(&self) -> f64 {
        match *self {
            Immi::U8(data) => data as f64,   
            Immi::U16(data) => data as f64,
            Immi::U32(data) => data as f64,
            Immi::U64(data) => data as f64,
            Immi::I16(data) => data as f64,
            Immi::I32(data) => data as f64,
            Immi::I64(data) => data as f64,
            Immi::F32(data) => data as f64,
            Immi::F64(data) => data as f64,
        }
    }
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
