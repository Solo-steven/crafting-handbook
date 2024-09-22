mod debugger;

use crate::ir::function::*;
use crate::ir_optimizer::anaylsis::OptimizerAnaylsis;
/// This module implement depth frist search ordering algorithm
/// this algorithm can construct the order of CFG even if there
/// are cycle in CFG, the order can be use to iterative data flow
/// algorithm to reduce the time of iteration
use std::mem::take;
pub struct DFSOrdering {
    index: usize,
    marks: Vec<bool>,
    orders: Vec<BasicBlock>,
}

impl OptimizerAnaylsis<Vec<BasicBlock>> for DFSOrdering {
    fn anaylsis(&mut self, function: &Function) -> Vec<BasicBlock> {
        let entry_id = function.entry_block[0];
        let blocks = &function.blocks;
        // init data
        self.index = blocks.len();
        self.marks = vec![false; blocks.len()];
        // dfs ordering
        self.dfs_visit(entry_id, blocks);
        // take ownership of orders.
        let mut orders = take(&mut self.orders);
        orders.reverse();
        orders
    }
}

impl DFSOrdering {
    /// Create a DFS ordering struct to get the order of blocks in a cfg.
    pub fn new() -> Self {
        Self {
            index: 0,
            marks: Vec::new(),
            orders: Vec::new(),
        }
    }
    fn dfs_visit(&mut self, block: BasicBlock, blocks: &BasicBlockMap) {
        if self.marks[block.0 - 1] == true {
            return;
        }
        self.marks[block.0 - 1] = true;
        for sucessor in &blocks.get(&block).unwrap().successor {
            self.dfs_visit(sucessor.clone(), blocks);
        }
        self.orders.push(block);
    }
    // pub fn get_order_with_map(
    //     &mut self,
    //     entry_id: BasicBlock,
    //     blocks: &BasicBlockMap,
    // ) -> (Vec<BasicBlock>, HashMap<BasicBlock, usize>) {
    //     let mut map = HashMap::new();
    //     // init data
    //     self.index = blocks.len();
    //     self.marks = vec![false; blocks.len()];
    //     // dfs ordering
    //     self.dfs_visit_with_map(entry_id, blocks, &mut map);
    //     // take ownership of orders.
    //     let mut orders = take(&mut self.orders);
    //     orders.reverse();
    //     (orders, map)
    // }
    // fn dfs_visit_with_map(
    //     &mut self,
    //     block: BasicBlock,
    //     blocks: &BasicBlockMap,
    //     map: &mut HashMap<BasicBlock, usize>,
    // ) {
    //     if self.marks[block.0 - 1] == true {
    //         return;
    //     }
    //     self.marks[block.0 - 1] = true;
    //     for sucessor in &blocks.get(&block).unwrap().successor {
    //         self.dfs_visit_with_map(sucessor.clone(), blocks, map);
    //     }
    //     map.insert(block, self.index);
    //     self.orders.push(block);
    // }
}
