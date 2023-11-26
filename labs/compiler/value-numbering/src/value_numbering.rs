use std::collections::HashMap;
use lab_shared_data_structure::{BasicBlock, Identifier, Instruction, IdentifierOrConst, BinaryOps, UnaryInstruction};

#[derive(PartialEq, Debug, Hash, Eq)]
pub struct CacheKeyTuple(usize, usize, BinaryOps);
pub struct Table  {
    cache_table: HashMap<CacheKeyTuple, Identifier>,
    value_table: HashMap<Identifier, usize>,
    next_index: usize,
}

impl Table {
    pub fn new() -> Self {
        Self {
            cache_table: HashMap::new(),
            value_table: HashMap::new(),
            next_index: 0,
        }
    }
    /// Get a value for a register, if given register is not existed
    /// insert new entry of mapping given register id to a index value.
    pub fn get_value(&mut self, src: &Identifier) -> usize {
        if let Some(value) = self.value_table.get(src) {
            value.clone()
        }else {
            self.value_table.insert(src.clone(), self.next_index);
            let value = self.next_index;
            self.next_index += 1;
            value
        }
    }
    /// Update a identifier's index value, if identifier already existed as 
    /// a key of an entry, update this entry's value, otherwise insert a 
    /// new entry. 
    pub fn update_value(&mut self, dst: &Identifier) {
        self.value_table.insert(dst.clone(), self.next_index);
        self.next_index += 1;
    }
    /// Get cache entry by the given key if entry exsited.
    pub fn get_cache(&self, src: &CacheKeyTuple) -> Option<&Identifier> {
        self.cache_table.get(src)
    }
    /// Insert cache entry by given key(src) and value(dst).
    pub fn insert_cache(&mut self, src: CacheKeyTuple, dst: Identifier) {
        self.cache_table.insert(src, dst);
    }
}
/// Local value numbering metod for compiler optimization, replace possible 
/// redundant expression with existed register value
pub fn local_value_numbering(basic_block: &mut BasicBlock, table: &mut Table) {
    for inst in &mut basic_block.instructions {
        let mut replace_tuple = None;
        match *inst {
            Instruction::BinInst(ref mut binary_instruction) => {
                if let IdentifierOrConst::Identifier(src1) = &binary_instruction.src1 {
                    if let IdentifierOrConst::Identifier(src2) = &binary_instruction.src2 {
                        let val1 = table.get_value(src1);
                        let val2 = table.get_value(src2);
                        let key = CacheKeyTuple (val1, val2, binary_instruction.ops.clone());
                        if let Some(id_ref) = table.get_cache(&key) {
                            replace_tuple = Some(( binary_instruction.dst.clone(), id_ref.clone(), ));
                        }else {
                            table.insert_cache(key, binary_instruction.dst.clone());
                        }
                        table.update_value(&binary_instruction.dst);
                    }
                }
            }
            _ => {}
        }
        if let Some((dst,src)) = replace_tuple {
            *inst = Instruction::UnaryInst(UnaryInstruction { src: IdentifierOrConst::Identifier(src), dst, ops: lab_shared_data_structure::UnaryOps::Copy  })
        }
    }
}

/// Super local value numbering method for compiler optimization, 
pub fn super_local_value_numbering() {
    
}