use crate::entities::block::{Block, BlockData};
use crate::entities::instruction::{Instruction, InstructionData};
use crate::entities::value::{Value, ValueData};
use std::collections::HashMap;

#[derive(Debug, PartialEq, Clone)]
pub struct FunctionEntities {
    pub blocks: HashMap<Block, BlockData>,
    pub insts: HashMap<Instruction, InstructionData>,
    pub values: HashMap<Value, ValueData>,
    pub insts_result: HashMap<Instruction, Value>,
    pub params: Vec<Value>,
}

impl FunctionEntities {
    pub fn new() -> Self {
        Self {
            blocks: Default::default(),
            insts: Default::default(),
            values: Default::default(),
            insts_result: Default::default(),
            params: Default::default(),
        }
    }
}

impl FunctionEntities {
    fn value_num(&self) -> u32 {
        self.values.len() as u32
    }
    fn inst_nums(&self) -> u32 {
        self.insts.len() as u32
    }
    fn block_num(&self) -> u32 {
        self.blocks.len() as u32
    }
    pub fn create_value(&mut self, value_data: ValueData) -> Value {
        let value = Value(self.value_num());
        self.values.insert(value, value_data);
        value
    }
    pub fn mark_param(&mut self, value: Value) {
        self.params.push(value);
    }
    pub fn create_inst(&mut self, inst_data: InstructionData) -> Instruction {
        let inst = Instruction(self.inst_nums());
        self.insts.insert(inst, inst_data);
        inst
    }
    pub fn mark_inst_result(&mut self, value: Value, inst: Instruction) {
        self.insts_result.insert(inst, value);
    }
    pub fn create_block(&mut self, block_data: BlockData) -> Block {
        let block = Block(self.block_num());
        self.blocks.insert(block, block_data);
        block
    }
}
