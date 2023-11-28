#[derive(Debug,Clone)]
enum SymbolType {
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
struct SymbolEntry {
    reg: Value,
    data_type: SymbolType,
}
