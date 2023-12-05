mod builder;
pub mod print;
use crate::ir::instructions::*;
use crate::ir::value::*;
use std::collections::HashMap;
#[derive(Debug, PartialEq, Clone)]
pub struct Function {
    pub name: String,

    pub instructions: InstructionMap,
    pub blocks: BasicBlockMap,
    pub (super) next_block_index: usize,
    pub values: ValueMap,
    pub value_types: TypeMap,
    pub (super) next_temp_register_index: usize,
    inst_map_block: HashMap<Instruction, BasicBlock>,

    pub entry_block: Vec<BasicBlock>,
    pub exit_block: Vec<BasicBlock>,

    pub current_block: Option<BasicBlock>,
}
#[derive(Debug, PartialEq, Clone, Hash, Eq, Copy)]
pub struct BasicBlock(pub usize);
#[derive(Debug, PartialEq, Clone)]
pub struct BasicBlockData {
    pub name: String,
    pub successor: Vec<BasicBlock>,
    pub predecessor: Vec<BasicBlock>,
    pub instructions: Vec<Instruction>,
}

pub type BasicBlockMap = HashMap<BasicBlock, BasicBlockData>;

impl Function {
    /// Create a new function with's name and param and return type
    pub fn new(name: String) -> Self {
        Function {
            name,
            instructions: HashMap::new(),
            blocks: HashMap::new(),
            next_block_index: 0,
            inst_map_block: HashMap::new(),
            values: HashMap::new(),
            value_types: HashMap::new(),
            next_temp_register_index: 0,
            entry_block: Vec::new(),
            exit_block: Vec::new(),
            current_block: None
        }
    }
    /// Create a basic block, and this block is not conncet yet.
    pub fn create_block(&mut self) -> BasicBlock {
        let block_id = BasicBlock(self.blocks.len());
        self.blocks.insert(
            block_id, 
            BasicBlockData {  name: format!("block{}", self.next_block_index), successor: Vec::new(), predecessor: Vec::new(), instructions: Vec::new() }
        );
        self.next_block_index += 1;
        block_id
    }
    /// Connect two basic block as successor and predeccesor relationship.
    pub fn connect_block(&mut self, predecessor: BasicBlock, successor: BasicBlock) {
        let successor_block = self.blocks.get_mut(&successor);
        if let Some(s) = successor_block {
            s.predecessor.push(predecessor);
        }else {
            panic!("Block {:?} is not existed", successor);
        }
        let predecessor_block = self.blocks.get_mut(&predecessor);
        if let Some(pre) = predecessor_block {
            pre.successor.push(successor);
        }else {
            panic!("Block {:?} is not existed", predecessor);
        }
    }
    /// switch current block before insert any instruction to block.
    pub fn switch_to_block(&mut self, id: BasicBlock) {
        if let Some(_) = self.blocks.get(&id) {
            self.current_block = Some(id);
        }else {
            panic!("Block {:?} is not existed", id);
        }
    }
    /// mark block as entry
    pub fn mark_as_entry(&mut self, id:BasicBlock) {
        self.entry_block.push(id);
    }
    /// Get basic block instrcution belong to.
    pub fn get_block_from_inst(&self, inst: &Instruction) -> Option<&BasicBlock> {
        self.inst_map_block.get(&inst)
    }
}