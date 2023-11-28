use std::collections::HashMap;
use lab_shared_data_structure::{BasicBlock, Identifier, Instruction, IdentifierOrConst, BinaryOps, UnaryInstruction, UnaryOps, BinaryInstruction};
#[derive(PartialEq, Debug, Clone, Hash, Eq)]
pub enum ValueIndexORConst {
    ValueIndex(usize),
    Const(usize)
}
#[derive(PartialEq, Debug, Hash, Eq, Clone)]
pub enum CacheKeyTuple {
    BinaryKey(ValueIndexORConst, ValueIndexORConst, BinaryOps),
    UnaryKey(ValueIndexORConst, UnaryOps)
}
pub struct Table  {
    cache_table: HashMap<CacheKeyTuple, usize>,
    value_table: HashMap<Identifier, usize>,
    reverse_value_table: HashMap<usize, Identifier>,
    next_index: usize,
}

impl Table {
    pub fn new() -> Self {
        Self {
            cache_table: HashMap::new(),
            value_table: HashMap::new(),
            reverse_value_table: HashMap::new(),
            next_index: 0,
        }
    }
    fn is_update_to_newset(&self, value_number: &usize) -> bool {
        if let Some(id) = self.reverse_value_table.get(value_number) {
            if let Some(last_value_number) = self.value_table.get(id) {
                println!("{:?}, {:?}", *last_value_number, *value_number);
                return *last_value_number == *value_number;
            }
        }
        false
    }
    /// Get a value for a register, if given register is not existed
    /// insert new entry of mapping given register id to a index value.
    pub fn get_value(&mut self, src: &Identifier) -> usize {
        if let Some(value) = self.value_table.get(src) {
            value.clone()
        }else {
            self.value_table.insert(src.clone(), self.next_index);
            self.reverse_value_table.insert(self.next_index, src.clone());
            let value = self.next_index;
            self.next_index += 1;
            value
        }
    }
    pub fn get_name(&self, key: &usize) -> Option<&Identifier> {
        self.reverse_value_table.get(key)
    }
    /// Update a identifier's index value, if identifier already existed as 
    /// a key of an entry, update this entry's value, otherwise insert a 
    /// new entry. 
    pub fn update_or_insert_value(&mut self, dst: &Identifier) -> usize {
        self.value_table.insert(dst.clone(), self.next_index);
        self.reverse_value_table.insert(self.next_index, dst.clone());
        let value = self.next_index;
        self.next_index += 1;
        value
    }
    /// Get cache entry by the given key if entry exsited.
    pub fn get_cache(&self, src: &CacheKeyTuple) -> Option<&usize> {
        self.cache_table.get(src).clone()
    }
    /// Insert cache entry by given key(src) and value(dst).
    pub fn insert_cache(&mut self, src: CacheKeyTuple, dst: usize) {
        self.cache_table.insert(src, dst);
    }
}

/// Local value numbering metod for compiler optimization, replace possible 
/// redundant expression with existed register value
pub fn local_value_numbering(basic_block: &mut BasicBlock, table: &mut Table) {
    for inst in &mut basic_block.instructions {
        let (key_option, dst) = construct_key_from_instruction(inst, table);
        let mut replace_tuple = None;
        'look_up: { 
            if let Some(key) = key_option {
                if let Some(cache_value_number) = table.get_cache(&key) {
                    if table.is_update_to_newset(cache_value_number) {
                        replace_tuple = Some(( 
                            dst.clone().unwrap(), 
                            table.get_name(cache_value_number).unwrap().clone()
                        ));
                        break 'look_up;
                    }
                }
                let next_dst_value_number = table.update_or_insert_value(dst.as_ref().unwrap());
                table.insert_cache(key, next_dst_value_number);
            }
        }
        if let Some((dst,src)) = replace_tuple {
            *inst = Instruction::UnaryInst(UnaryInstruction { src: IdentifierOrConst::Identifier(src), dst, ops: UnaryOps::Copy  })
        }
    }
}

fn construct_key_from_instruction(inst: &Instruction, table: &mut Table) -> (Option<CacheKeyTuple>, Option<Identifier>) {
    let mut key_option = None;
    let mut dst = None;
    match *inst {
        Instruction::BinInst(ref binary_instruction) => {
            // construct the key
            match (&binary_instruction.src1, &binary_instruction.src2) {
                (IdentifierOrConst::Identifier(src1), IdentifierOrConst::Identifier(src2)) => {
                    let val1 = table.get_value(src1);
                    let val2 = table.get_value(src2);
                    key_option = Some(CacheKeyTuple::BinaryKey(
                        ValueIndexORConst::ValueIndex(val1), 
                        ValueIndexORConst::ValueIndex(val2), 
                        binary_instruction.ops.clone()
                    ));
                }
                (IdentifierOrConst::Const(const_num), IdentifierOrConst::Identifier(src)) |
                (IdentifierOrConst::Identifier(src), IdentifierOrConst::Const(const_num)) => {
                    let val = table.get_value(src);
                    key_option = Some(CacheKeyTuple::BinaryKey(
                        ValueIndexORConst::ValueIndex(val), 
                        ValueIndexORConst::Const(const_num.clone()), 
                        binary_instruction.ops.clone()
                    ));
                }
                (IdentifierOrConst::Const(const_num1), IdentifierOrConst::Const(const_num2)) => {
                    key_option = Some(CacheKeyTuple::BinaryKey (
                        ValueIndexORConst::Const(const_num1.clone()), 
                        ValueIndexORConst::Const(const_num2.clone()), 
                        binary_instruction.ops.clone()
                    ));
                }
            }
            dst = Some(binary_instruction.dst.clone());
        }
        Instruction::UnaryInst(ref unary_instruction) => {
            key_option = Some(CacheKeyTuple::UnaryKey(
                match &unary_instruction.src {
                    IdentifierOrConst::Const(const_num) => ValueIndexORConst::Const(const_num.clone()),
                    IdentifierOrConst::Identifier(id) => ValueIndexORConst::ValueIndex(table.get_value(id))
                }, 
                unary_instruction.ops.clone()
            ));
            dst = Some(unary_instruction.dst.clone());
        }
        _ => {}
    }
    (key_option, dst)
}

/// Super local value numbering method for compiler optimization, 
pub fn super_local_value_numbering() {
    
}