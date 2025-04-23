use std::fmt;

#[derive(Debug, PartialEq, Clone, Eq, Hash, Copy)]
pub struct Constant(pub u32);
#[derive(Debug, PartialEq, Clone, Eq)]
pub struct ConstantData {
    pub bytes: Vec<u8>,
}
impl fmt::Display for ConstantData {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for byte in &self.bytes {
            write!(f, "{:X}", byte)?
        }
        Ok(())
    }
}
