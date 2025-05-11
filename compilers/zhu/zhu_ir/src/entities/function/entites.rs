use crate::entities::block::{Block, BlockData};
use crate::entities::instruction::{Instruction, InstructionData};
use crate::entities::value::{Value, ValueData};
use std::collections::HashMap;

#[derive(Debug, PartialEq, Clone)]
struct FunctionEntitiesNextContext {
    pub next_block_index: u32,
    pub next_inst_index: u32,
    pub next_value_index: u32,
}
#[derive(Debug, PartialEq, Clone)]
pub struct FunctionEntities {
    pub blocks: HashMap<Block, BlockData>,
    pub insts: HashMap<Instruction, InstructionData>,
    pub values: HashMap<Value, ValueData>,
    pub insts_result: HashMap<Instruction, Value>,
    pub params: Vec<Value>,
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
            next_context: FunctionEntitiesNextContext {
                next_block_index: 0,
                next_inst_index: 0,
                next_value_index: 0,
            },
        }
    }
}

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
    /// Create a block
    pub fn create_block(&mut self, block_data: BlockData) -> Block {
        let block = Block(self.block_index());
        self.blocks.insert(block, block_data);
        block
    }
}
