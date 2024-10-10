mod debugger;
use crate::ir::function::*;
use crate::ir_optimizer::anaylsis::dfs_ordering::DFSOrdering;
use crate::ir_optimizer::anaylsis::OptimizerAnaylsis;
use std::collections::{HashMap, HashSet};
use std::mem::replace;

/// Table for record every block's dom and idom and dom-frontier
pub struct PostDomTable {
    table: HashMap<BasicBlock, PostDomTableEntry>,
    extra_exit_block: Option<BasicBlock>,
}
/// Entry for record dom, idom and dom-frontier for a bb.
#[derive(Debug, Clone, PartialEq)]
pub struct PostDomTableEntry {
    pub post_dom: HashSet<BasicBlock>,
    pub post_idom: Option<BasicBlock>,
    pub post_dom_frontier: HashSet<BasicBlock>,
}
/// Struct for anaylsis dom related info for a control flow graph
pub struct PostDomAnaylsier {
    post_dom_table: PostDomTable,
}

impl OptimizerAnaylsis<PostDomTable> for PostDomAnaylsier {
    /// Public api for anaylsis dom information
    fn anaylsis(&mut self, function: &Function) -> PostDomTable {
        let temp_store_for_skleton: Option<Function>;
        let skleton_function = if let Some(fun) = self.make_reverse_cfg(function) {
            temp_store_for_skleton = Some(fun);
            &temp_store_for_skleton.unwrap()
        } else {
            function
        };
        self.init_table_entry(skleton_function);
        // post-dominator relative analysis
        self.post_dom_analysis(skleton_function);
        self.post_idom_anaylsis(skleton_function);
        self.post_dom_frontier_analysis(skleton_function);
        replace(
            &mut self.post_dom_table,
            PostDomTable {
                table: Default::default(),
                extra_exit_block: None,
            },
        )
    }
}

impl PostDomAnaylsier {
    pub fn new() -> Self {
        Self {
            post_dom_table: PostDomTable {
                table: Default::default(),
                extra_exit_block: None,
            },
        }
    }
    fn init_table_entry(&mut self, function: &Function) {
        for (block_id, _) in &function.blocks {
            self.post_dom_table.table.insert(
                block_id.clone(),
                PostDomTableEntry {
                    post_dom: HashSet::new(),
                    post_idom: None,
                    post_dom_frontier: HashSet::new(),
                },
            );
        }
    }
    fn get_all_dom_set(function: &Function) -> HashSet<BasicBlock> {
        function.blocks.keys().map(|key| key.clone()).collect()
    }
    fn make_reverse_cfg(&mut self, function: &Function) -> Option<Function> {
        if function.exit_block.len() <= 1 {
            None
        } else {
            let mut skleton_function = function.skeleton();
            let final_exit_block = skleton_function.create_block();
            for exit_block in &function.exit_block {
                skleton_function.connect_block(exit_block.clone(), final_exit_block);
            }
            skleton_function.exit_block = vec![final_exit_block];
            self.post_dom_table.extra_exit_block = Some(final_exit_block);
            Some(skleton_function)
        }
    }
    fn post_dom_analysis(&mut self, function: &Function) {
        let mut exit_block_set: HashSet<BasicBlock> = HashSet::with_capacity(function.exit_block.len());
        for bb in &function.exit_block {
            exit_block_set.insert(bb.clone());
        }
        // Init post dom property of table entry
        //  - for exit block: only contain exit block itself
        //  - for other block: all blocks
        for (block_id, _) in &function.blocks {
            if exit_block_set.contains(block_id) {
                let entry = self.post_dom_table.table.get_mut(block_id).unwrap();
                entry.post_dom = HashSet::from([block_id.clone()]);
            } else {
                let entry = self.post_dom_table.table.get_mut(block_id).unwrap();
                entry.post_dom = Self::get_all_dom_set(function);
            }
        }
        // Iterative algorithm for Post Dom data flow analysis
        let mut is_change = true;
        let mut dfs_ordering_anaylsiser = DFSOrdering::new();
        let mut reverse_ordering = dfs_ordering_anaylsiser.anaylsis(function);
        reverse_ordering.reverse();
        while is_change {
            is_change = false;
            for block_id in &reverse_ordering {
                let successor = &function.blocks.get(block_id).unwrap().successor;
                let mut next_set = HashSet::new();
                if exit_block_set.contains(block_id) {
                    continue;
                }
                for pre in successor {
                    let successor_dom_entry = self.post_dom_table.table.get(pre).unwrap();
                    let successor_post_dom = &successor_dom_entry.post_dom;
                    if next_set.len() == 0 {
                        next_set = successor_post_dom.clone();
                    } else {
                        next_set = next_set.intersection(successor_post_dom).map(|id| id.clone()).collect();
                    }
                }
                next_set.insert(block_id.clone());
                let cur_entry = self.post_dom_table.table.get_mut(block_id).unwrap();
                let cur_post_dom = &cur_entry.post_dom;
                if next_set != *cur_post_dom {
                    is_change = true;
                    cur_entry.post_dom = next_set;
                }
            }
        }
    }
    /// Post IDOM (post immi dom) anaylsis for control flow graph, this function is based on `post_dom_anaylsis`,
    /// it need the post dom info already store in dom table.
    fn post_idom_anaylsis(&mut self, function: &Function) {
        let mut exit_block_set: HashSet<BasicBlock> = HashSet::with_capacity(function.exit_block.len());
        for bb in &function.exit_block {
            exit_block_set.insert(bb.clone());
        }
        for (bb, entry) in &mut self.post_dom_table.table {
            if exit_block_set.contains(bb) {
                continue;
            }
            let post_dom_set = &entry.post_dom;
            let block_data = function.blocks.get(bb).unwrap();
            let mut successors = block_data.successor.clone();
            // using nested loop to perfomance bottom-up bfs search for idom
            'find: loop {
                if successors.len() == 0 {
                    break 'find;
                }
                // frist iterate over the predecessor to find if predecessor beem
                // have dominate bb or not.
                for successor in &successors {
                    if post_dom_set.contains(successor) && successor.0 != bb.0 {
                        entry.post_idom = Some(successor.clone());
                        break 'find;
                    }
                }
                // if we can not find idom in cuurent predecessor. we contine find idom
                // in predecessor's predecessor
                let mut next_successor = Vec::new();
                for successor in &successors {
                    for successor_of_successor in &function.blocks.get(successor).unwrap().successor {
                        if !next_successor.contains(successor_of_successor) {
                            next_successor.push(successor_of_successor.clone());
                        }
                    }
                }
                successors = next_successor;
            }
        }
    }
    fn post_dom_frontier_analysis(&mut self, function: &Function) {
        for (block_id, block_data) in &function.blocks {
            if block_data.successor.len() > 1 {
                for successor_id in &block_data.successor {
                    let mut runner_id = successor_id.clone();
                    let post_idom =
                        if let Some(post_idom) = self.post_dom_table.table.get(block_id).unwrap().post_idom.clone() {
                            post_idom
                        } else {
                            continue;
                        };
                    while runner_id != post_idom {
                        self.post_dom_table
                            .table
                            .get_mut(&runner_id)
                            .unwrap()
                            .post_dom_frontier
                            .insert(block_id.clone());
                        runner_id =
                            if let Some(next_runner_id) = self.post_dom_table.table.get(&runner_id).unwrap().post_idom {
                                next_runner_id
                            } else {
                                break;
                            }
                    }
                }
            }
        }
    }
}
