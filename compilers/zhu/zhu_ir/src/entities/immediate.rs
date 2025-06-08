use crate::entities::r#type::ValueType;
use std::fmt;

#[derive(Debug, PartialEq, Clone)]
pub enum Immediate {
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

impl Immediate {
    pub fn get_value_type(&self) -> ValueType {
        match *self {
            Immediate::U8(_) => ValueType::U8,
            Immediate::U16(_) => ValueType::U16,
            Immediate::U32(_) => ValueType::U32,
            Immediate::U64(_) => ValueType::U64,
            Immediate::I16(_) => ValueType::I16,
            Immediate::I32(_) => ValueType::I32,
            Immediate::I64(_) => ValueType::I64,
            Immediate::F32(_) => ValueType::F32,
            Immediate::F64(_) => ValueType::F64,
        }
    }
    pub fn get_bytes(&self) -> [u8; 8] {
        match *self {
            Immediate::U8(value) => (value as u64).to_le_bytes(),
            Immediate::U16(value) => (value as u64).to_le_bytes(),
            Immediate::U32(value) => (value as u64).to_le_bytes(),
            Immediate::U64(value) => value.to_le_bytes(),
            Immediate::I16(value) => (value as i64).to_le_bytes(),
            Immediate::I32(value) => (value as i64).to_le_bytes(),
            Immediate::I64(value) => value.to_le_bytes(),
            Immediate::F32(value) => (value as f64).to_le_bytes(),
            Immediate::F64(value) => value.to_le_bytes(),
        }
    }
}

impl fmt::Display for Immediate {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match *self {
            Immediate::U8(num) => write!(f, "{}", num),
            Immediate::U16(num) => write!(f, "{}", num),
            Immediate::U32(num) => write!(f, "{}", num),
            Immediate::U64(num) => write!(f, "{}", num),
            Immediate::I16(num) => write!(f, "{}", num),
            Immediate::I32(num) => write!(f, "{}", num),
            Immediate::I64(num) => write!(f, "{}", num),
            Immediate::F32(num) => write!(f, "{}", num),
            Immediate::F64(num) => write!(f, "{}", num),
        }?;
        Ok(())
    }
}

#[derive(Debug, PartialEq, Clone, Eq)]
pub struct Offset(pub i32);
