use crate::entities::block::{Block, BlockData};
use crate::entities::instruction::{Instruction, InstructionData};
use crate::entities::value::{Value, ValueData};
use std::collections::HashMap;

#[derive(Debug, PartialEq, Clone)]
struct FunctionEntitiesNextContext {
    next_block_index: u32,
    next_inst_index: u32,
    next_value_index: u32,
}
impl FunctionEntitiesNextContext {
    pub fn new() -> Self {
        Self {
            next_block_index: 0,
            next_inst_index: 0,
            next_value_index: 0,
        }
    }
}
#[derive(Debug, PartialEq, Clone)]
pub struct FunctionEntities {
    pub blocks: HashMap<Block, BlockData>,
    pub insts: HashMap<Instruction, InstructionData>,
    pub values: HashMap<Value, ValueData>,

    pub params: Vec<Value>,
    pub insts_result: HashMap<Instruction, Value>,
    next_context: FunctionEntitiesNextContext,
}

impl FunctionEntities {
    pub fn new() -> Self {
        Self {
            blocks: Default::default(),
            insts: Default::default(),
            values: Default::default(),
            insts_result: Default::default(),
            params: Default::default(),
            next_context: FunctionEntitiesNextContext::new(),
        }
    }
}

/// Private method for FunctionEntities to get NextIndexContext
impl FunctionEntities {
    fn value_index(&mut self) -> u32 {
        let next_index = self.next_context.next_value_index;
        self.next_context.next_value_index += 1;
        next_index
    }
    fn inst_index(&mut self) -> u32 {
        let next_index = self.next_context.next_inst_index;
        self.next_context.next_inst_index += 1;
        next_index
    }
    fn block_index(&mut self) -> u32 {
        let next_index = self.next_context.next_block_index;
        self.next_context.next_block_index += 1;
        next_index
    }
}

fn format_block_not_found(block: &Block) -> String {
    format!("Block {:?} not found in FunctionEntities.", block)
}
fn format_inst_not_found(inst: &Instruction) -> String {
    format!("Instruction {:?} not found in FunctionEntities.", inst)
}
fn format_value_not_found(value: &Value) -> String {
    format!("Value {:?} not found in FunctionEntities.", value)
}

/// Immutable or mutable methods for FunctionEntities to get
///
/// - blockData
/// - instData
/// - valueData
///
/// It will panic if the block, inst or value not exists
impl FunctionEntities {
    pub fn get_block_data(&self, block: Block) -> &BlockData {
        self.blocks.get(&block).expect(&format_block_not_found(&block))
    }
    pub fn get_inst_data(&self, inst: Instruction) -> &InstructionData {
        self.insts.get(&inst).expect(&format_inst_not_found(&inst))
    }
    pub fn get_value_data(&self, value: Value) -> &ValueData {
        self.values.get(&value).expect(&format_value_not_found(&value))
    }
    pub fn get_block_data_mut(&mut self, block: Block) -> &mut BlockData {
        self.blocks.get_mut(&block).expect(&format_block_not_found(&block))
    }
    pub fn get_inst_data_mut(&mut self, inst: Instruction) -> &mut InstructionData {
        self.insts.get_mut(&inst).expect(&format_inst_not_found(&inst))
    }
    pub fn get_value_data_mut(&mut self, value: Value) -> &mut ValueData {
        self.values.get_mut(&value).expect(&format_value_not_found(&value))
    }
}

/// Immutable data getters for FunctionEntities to get relations
///  between blocks, instructions and values.
impl FunctionEntities {
    pub fn get_inst_result(&self, inst: Instruction) -> Option<Value> {
        self.insts_result.get(&inst).cloned()
    }
}

/// Mutate methods for FunctionEntities to create and mark relation
/// between blocks, instructions and values.
impl FunctionEntities {
    /// Should be only used by parser, after parse the ir text format
    /// reset the next index context of block
    pub(crate) fn set_block_next_index(&mut self, next_index: u32) {
        self.next_context.next_block_index = next_index;
    }
    /// Should be only used by parser, after parse the ir text format,
    /// reset the next index context of value
    pub(crate) fn set_value_next_index(&mut self, next_index: u32) {
        self.next_context.next_value_index = next_index;
    }
    /// Create a Value
    pub fn create_value(&mut self, value_data: ValueData) -> Value {
        let value = Value(self.value_index());
        self.values.insert(value, value_data);
        value
    }
    /// Mark vakue as param
    pub fn mark_param(&mut self, value: Value) {
        self.params.push(value);
    }
    /// Create a instruction
    pub fn create_inst(&mut self, inst_data: InstructionData) -> Instruction {
        let inst = Instruction(self.inst_index());
        self.insts.insert(inst, inst_data);
        inst
    }
    /// Mark value as result of instruction
    pub fn mark_inst_result(&mut self, value: Value, inst: Instruction) {
        self.insts_result.insert(inst, value);
    }
    pub fn mark_inst_block(&mut self, inst: Instruction, block: Block) {
        self.blocks.get_mut(&block).unwrap().insts.insert(inst);
    }
    pub fn mark_phi_block(&mut self, inst: Instruction, block: Block) {
        self.blocks.get_mut(&block).unwrap().phis.insert(inst);
    }
    /// Create a block
    pub fn create_block(&mut self, block_data: BlockData) -> Block {
        let block = Block(self.block_index());
        self.blocks.insert(block, block_data);
        block
    }
}
