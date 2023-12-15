mod builder;
pub mod print;
use crate::ir::instructions::*;
use crate::ir::value::*;
use std::collections::{HashMap, VecDeque};
#[derive(Debug, PartialEq, Clone)]
pub struct Function {
    pub name: String,
    pub return_type: Option<IrValueType>,

    pub instructions: InstructionMap,
    pub (super) next_inst_index: usize,

    pub blocks: BasicBlockMap,
    pub (super) next_block_index: usize,

    pub values: ValueMap,
    pub value_types: TypeMap,
    pub (super) next_value_index: usize,
    pub (super) next_temp_register_index: usize,
    /***** relationship *****/
    /// 
    pub inst_map_block: HashMap<Instruction, BasicBlock>,
    pub params_value: Vec<Value>,

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
    pub instructions: VecDeque<Instruction>,
}

pub type BasicBlockMap = HashMap<BasicBlock, BasicBlockData>;

impl Function {
    /// Create a new function with's name and param and return type
    pub fn new(name: String) -> Self {
        Function {
            name,
            return_type: None,
            instructions: HashMap::new(),
            next_inst_index: 1,
            blocks: HashMap::new(),
            next_block_index: 1,
            inst_map_block: HashMap::new(),
            params_value: Vec::new(),
            values: HashMap::new(),
            value_types: HashMap::new(),
            next_value_index: 1,
            next_temp_register_index: 1,
            entry_block: Vec::new(),
            exit_block: Vec::new(),
            current_block: None
        }
    }
    /// Create a basic block, and this block is not conncet yet.
    pub fn create_block(&mut self) -> BasicBlock {
        let block_id = BasicBlock(self.next_block_index);
        self.blocks.insert(
            block_id, 
            BasicBlockData {  name: format!("block{}", self.next_block_index), successor: Vec::new(), predecessor: Vec::new(), instructions: VecDeque::new() }
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
    pub fn insert_inst_to_block_front(&mut self, block: &BasicBlock, inst_data: InstructionData) -> Instruction {
        let inst_id = Instruction(self.instructions.len());
        self.blocks.get_mut(block).unwrap().instructions.push_front(inst_id.clone());
        self.instructions.insert(inst_id.clone(), inst_data);
        inst_id
    }
    pub fn remove_inst_from_block(&mut self, block: &BasicBlock, inst: &Instruction) {
        self.blocks.get_mut(block).unwrap().instructions.retain(|inst_id| inst != inst_id );
        self.instructions.remove(inst);
    }
    pub fn change_inst(&mut self, inst: &Instruction, inst_data: InstructionData) {
        self.instructions.remove(inst);
        self.instructions.insert(inst.clone(), inst_data);
    }
}