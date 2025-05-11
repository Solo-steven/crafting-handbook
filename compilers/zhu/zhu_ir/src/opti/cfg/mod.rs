use crate::entities::block::Block;
use crate::entities::function::Function;
use crate::entities::instruction::InstructionData;
use std::collections::{HashMap, HashSet};

#[derive(Debug, PartialEq, Clone, Eq)]
pub struct CFGNode {
    pub predecessors: HashSet<Block>,
    pub successors: HashSet<Block>,
}
#[derive(Debug, PartialEq, Clone, Eq)]
pub struct ControlFlowGraph {
    pub entry: Option<Block>,
    pub exists: HashSet<Block>,
    pub blocks: HashMap<Block, CFGNode>,
}

impl ControlFlowGraph {
    pub fn new() -> Self {
        Self {
            entry: None,
            exists: Default::default(),
            blocks: Default::default(),
        }
    }
    fn connect(&mut self, predecessor: &Block, successor: &Block) {
        self.blocks
            .get_mut(predecessor)
            .unwrap()
            .successors
            .insert(successor.clone());
        self.blocks
            .get_mut(successor)
            .unwrap()
            .predecessors
            .insert(predecessor.clone());
    }
    fn init(&mut self, function: &Function) {
        for block in function.entities.blocks.keys() {
            self.blocks.insert(
                block.clone(),
                CFGNode {
                    predecessors: Default::default(),
                    successors: Default::default(),
                },
            );
        }
        self.entry = function.layout.first_block.clone();
    }
    pub fn process(&mut self, function: &Function) {
        // init
        self.init(function);
        // compute loop
        for block in function.entities.blocks.keys() {
            let last_inst = function.layout.blocks.get(block).unwrap().last_inst.unwrap();
            let last_inst_data = function.entities.insts.get(&last_inst).unwrap();
            match last_inst_data {
                InstructionData::Jump { dst, .. } => {
                    self.connect(block, dst);
                }
                InstructionData::BrIf { conseq, alter, .. } => {
                    self.connect(block, conseq);
                    self.connect(block, alter);
                }
                InstructionData::Ret { .. } => {
                    self.exists.insert(block.clone());
                }
                _ => { /* Should be unreach */ }
            }
        }
    }
}
