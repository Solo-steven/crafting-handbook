use crate::entities::block::Block;
use crate::entities::instruction::Instruction;
use std::collections::HashMap;

#[derive(Debug, PartialEq, Clone, Eq)]
pub struct BlockNode {
    pub prev: Option<Block>,
    pub next: Option<Block>,
    pub first_inst: Option<Instruction>,
    pub last_inst: Option<Instruction>,
}
#[derive(Debug, PartialEq, Clone, Eq)]
pub struct InstNode {
    pub block: Option<Block>,
    pub prev: Option<Instruction>,
    pub next: Option<Instruction>,
}
#[derive(Debug, PartialEq, Clone, Eq)]
pub struct FunctionLayout {
    pub blocks: HashMap<Block, BlockNode>,
    pub insts: HashMap<Instruction, InstNode>,
    pub first_block: Option<Block>,
    pub last_block: Option<Block>,
}

impl FunctionLayout {
    pub fn new() -> Self {
        Self {
            blocks: Default::default(),
            insts: Default::default(),
            first_block: Default::default(),
            last_block: Default::default(),
        }
    }
}

/// Implement action for block layout
impl FunctionLayout {
    /// Append block in the end dof program
    pub fn append_block(&mut self, block: Block) {
        if let Some(last_block) = self.last_block {
            let last_block_node = self.blocks.get_mut(&last_block).unwrap();
            last_block_node.next = Some(block);
            self.blocks.insert(
                block,
                BlockNode {
                    prev: Some(last_block),
                    next: None,
                    first_inst: None,
                    last_inst: None,
                },
            );
        } else {
            self.first_block = Some(block);
            self.last_block = Some(block);
            self.blocks.insert(
                block,
                BlockNode {
                    prev: None,
                    next: None,
                    first_inst: None,
                    last_inst: None,
                },
            );
        }
    }
    /// Insert a block after given block.
    pub fn insert_block_after(&mut self, block: Block, after: Block) {
        let mut block_node = BlockNode {
            prev: Some(after),
            next: None,
            first_inst: None,
            last_inst: None,
        };
        let pre_block_node = self.blocks.get_mut(&after).unwrap();
        let next_block_option = pre_block_node.next.clone();
        pre_block_node.next = Some(block);
        if let Some(next_block) = next_block_option {
            let next_block_node = self.blocks.get_mut(&next_block).unwrap();
            next_block_node.prev = Some(block);
            block_node.next = Some(next_block);
        }
        self.blocks.insert(block, block_node);
    }
    /// Insert a block before given block.
    pub fn insert_block_before(&mut self, block: Block, before: Block) {
        let mut block_node = BlockNode {
            prev: None,
            next: Some(before),
            first_inst: None,
            last_inst: None,
        };
        let next_bode_node = self.blocks.get_mut(&before).unwrap();
        let pre_block_option = next_bode_node.prev.clone();
        next_bode_node.prev = Some(block);
        if let Some(pre_block) = pre_block_option {
            let pre_block_node = self.blocks.get_mut(&pre_block).unwrap();
            pre_block_node.next = Some(block);
            block_node.prev = Some(pre_block);
        }
        self.blocks.insert(block, block_node);
    }
    pub fn remove_block(&mut self, block: Block) {
        let block_data = self.blocks.remove(&block).unwrap();
        let before = block_data.prev;
        let after = block_data.next;

        if let Some(before_block) = before {
            let before_block_data = self.blocks.get_mut(&before_block).unwrap();
            before_block_data.next = after.clone();
        }
        if let Some(after_block) = after {
            let after_block_data = self.blocks.get_mut(&after_block).unwrap();
            after_block_data.prev = before.clone()
        }
        let mut cur_inst = block_data.first_inst;
        loop {
            if let Some(inst) = cur_inst {
                let inst_data = self.insts.remove(&inst).unwrap();
                cur_inst = inst_data.prev.clone();
            } else {
                break;
            }
        }
    }
}
/// Implement action for instruction layout
impl FunctionLayout {
    /// Append instruction in the end of given block.
    pub fn append_inst(&mut self, inst: Instruction, block: Block) {
        let block_node = self.blocks.get_mut(&block).unwrap();
        if let Some(last_inst) = block_node.last_inst {
            let last_inst_data = self.insts.get_mut(&last_inst).unwrap();
            last_inst_data.next = Some(inst);
            self.insts.insert(
                inst,
                InstNode {
                    block: Some(block),
                    prev: Some(last_inst),
                    next: None,
                },
            );
            block_node.last_inst = Some(inst);
        } else {
            self.insts.insert(
                inst,
                InstNode {
                    block: Some(block),
                    prev: None,
                    next: None,
                },
            );
            block_node.first_inst = Some(inst);
            block_node.last_inst = Some(inst);
        }
    }
    /// Insert a block before given instruction.
    pub fn insert_inst_before(&mut self, inst: Instruction, before: Instruction) {
        let mut inst_node = InstNode {
            block: None,
            prev: None,
            next: Some(before),
        };
        let next_inst_node = self.insts.get_mut(&before).unwrap();
        inst_node.block = next_inst_node.block.clone();
        let pre_inst_option = next_inst_node.prev.clone();
        next_inst_node.prev = Some(inst);
        if let Some(pre_inst) = pre_inst_option {
            let pre_inst_node = self.insts.get_mut(&pre_inst).unwrap();
            pre_inst_node.next = Some(inst);
            inst_node.prev = Some(pre_inst);
        } else {
            // next inst(before) is first inst of block
            let block_data = self.blocks.get_mut(&inst_node.block.unwrap()).unwrap();
            block_data.first_inst = Some(inst);
        }
        self.insts.insert(inst, inst_node);
    }
    /// Insert block after given instruction.
    pub fn insert_inst_after(&mut self, inst: Instruction, after: Instruction) {
        let mut inst_node = InstNode {
            block: None,
            prev: Some(after),
            next: None,
        };
        let pre_inst_node = self.insts.get_mut(&after).unwrap();
        inst_node.block = pre_inst_node.block.clone();
        let next_inst_option = pre_inst_node.next.clone();
        pre_inst_node.next = Some(inst);
        if let Some(next_inst) = next_inst_option {
            let next_inst_node = self.insts.get_mut(&next_inst).unwrap();
            next_inst_node.prev = Some(inst);
            inst_node.next = Some(next_inst);
        } else {
            // prev inst(after) is last inst of block.
            let block_node = self.blocks.get_mut(&inst_node.block.unwrap()).unwrap();
            block_node.last_inst = Some(inst);
        }
        self.insts.insert(inst, inst_node);
    }
    /// Remove a instruction from block.
    pub fn remove_inst(&mut self, inst: Instruction) {
        let inst_node = self.insts.remove(&inst).unwrap();
        if let Some(prev_inst) = &inst_node.prev {
            let prev_inst_node = self.insts.get_mut(prev_inst).unwrap();
            prev_inst_node.next = inst_node.next;
        } else {
            let block_node = self.blocks.get_mut(&inst_node.block.unwrap()).unwrap();
            block_node.first_inst = inst_node.next;
        }
        if let Some(next_inst) = inst_node.next {
            let next_inst_node = self.insts.get_mut(&next_inst).unwrap();
            next_inst_node.prev = inst_node.prev;
        } else {
            let block_node = self.blocks.get_mut(&inst_node.block.unwrap()).unwrap();
            block_node.last_inst = inst_node.prev;
        }
    }
}
