#[derive(Debug,Clone)]
pub enum SymbolType {
    BasicType(IrValueType),
    StructalType(HashMap<String, SymbolType>),
    PointerType(PointerSymbolType),
}
#[derive(Debug, Clone)]
struct PointerSymbolType {
    pub level: usize,
    pub pointer_to: Box<SymbolType>
}
#[derive(Debug)]
pub struct SymbolEntry {
    pub reg: Value,
    pub data_type: SymbolType,
}
pub type SymbolTable = HashMap<String, SymbolEntry>;