mod debugger;
use crate::ir::function::*;
use crate::ir_optimizer::anaylsis::dfs_ordering::DFSOrdering;
use crate::ir_optimizer::anaylsis::OptimizerAnaylsis;
use std::collections::{HashMap, HashSet};
use std::mem::replace;
/// Table for record every block's dom and idom and dom-frontier
pub type DomTable = HashMap<BasicBlock, DomTableEntry>;
/// Entry for record dom, idom and dom-frontier for a bb.
#[derive(Debug, Clone, PartialEq)]
pub struct DomTableEntry {
    pub dom: HashSet<BasicBlock>,
    pub idom: Option<BasicBlock>,
    pub dom_tree_children: HashSet<BasicBlock>,
    pub dom_frontier: HashSet<BasicBlock>,
}
/// Struct for anaylsis dom related info for a control flow graph
pub struct DomAnaylsier {
    dom_table: DomTable,
}

impl OptimizerAnaylsis<DomTable> for DomAnaylsier {
    /// Public api for anaylsis dom information
    fn anaylsis(&mut self, function: &Function) -> DomTable {
        self.init_table_entry(function);
        // dominator relative analysis
        self.dom_anaylsis(function);
        self.idom_anaylsis(function);
        self.dom_frontier_anaylsis(function);
        replace(&mut self.dom_table, HashMap::new())
    }
}

impl DomAnaylsier {
    pub fn new() -> Self {
        Self {
            dom_table: HashMap::new(),
        }
    }
    fn init_table_entry(&mut self, function: &Function) {
        for (block_id, _) in &function.blocks {
            self.dom_table.insert(
                block_id.clone(),
                DomTableEntry {
                    dom: HashSet::new(),
                    idom: None,
                    dom_tree_children: HashSet::new(),
                    dom_frontier: HashSet::new(),
                },
            );
        }
    }
    fn get_all_dom_set(function: &Function) -> HashSet<BasicBlock> {
        function.blocks.keys().map(|key| key.clone()).collect()
    }
    /// Iterative DOM data flow anaylsis, algorithm is from the book `Engineering a Compiler`.
    fn dom_anaylsis(&mut self, function: &Function) {
        // init dom property of table entry
        //  - for entry block: only contain entry block itself
        //  - for other block: all blocks
        for (block_id, _) in &function.blocks {
            if block_id.0 == function.entry_block[0].0 {
                let entry = self.dom_table.get_mut(block_id).unwrap();
                entry.dom = HashSet::from([block_id.clone()]);
            } else {
                let entry = self.dom_table.get_mut(block_id).unwrap();
                entry.dom = Self::get_all_dom_set(function);
            }
        }
        // iterative algorithm for dom data flow analysis
        let mut is_change = true;
        let mut dfs_ordering_anaylsiser = DFSOrdering::new();
        let ordering = dfs_ordering_anaylsiser.anaylsis(function);
        while is_change {
            is_change = false;
            for block_id in &ordering {
                let bb = function.blocks.get(block_id).unwrap();
                // Skip if is entry
                if block_id.0 == function.entry_block[0].0 {
                    continue;
                }
                let mut next_set = HashSet::new();
                for pre in &bb.predecessor {
                    let pre_dom_entry = self.dom_table.get(pre).unwrap();
                    let pre_dom = &pre_dom_entry.dom;
                    if next_set.len() == 0 {
                        next_set = pre_dom.clone();
                    } else {
                        next_set = next_set.intersection(pre_dom).map(|id| id.clone()).collect();
                    }
                }
                next_set.insert(block_id.clone());
                let cur_entry = self.dom_table.get_mut(block_id).unwrap();
                let cur_dom = &cur_entry.dom;
                if next_set != *cur_dom {
                    is_change = true;
                    cur_entry.dom = next_set;
                }
            }
        }
    }
    /// IDOM (immi dom) anaylsis for control flow graph, this function is based on `dom_anaylsis`,
    /// it need the dom info already store in dom table.
    fn idom_anaylsis(&mut self, function: &Function) {
        let mut dom_tree_children_map: HashMap<BasicBlock, HashSet<BasicBlock>> = HashMap::new();
        for entry in &mut self.dom_table {
            if entry.0 .0 == function.entry_block[0].0 {
                continue;
            }
            let dom_set = &entry.1.dom;
            let block_data = function.blocks.get(entry.0).unwrap();
            let mut predecessors = block_data.predecessor.clone();
            // using nested loop to perfomance bottom-up bfs search for idom
            'find: loop {
                if predecessors.len() == 0 {
                    break 'find;
                }
                // frist iterate over the predecessor to find if predecessor beem
                // have dominate bb or not.
                for pre in &predecessors {
                    if dom_set.contains(pre) && pre.0 != entry.0 .0 {
                        entry.1.idom = Some(pre.clone());
                        if let Some(children) = dom_tree_children_map.get_mut(pre) {
                            children.insert(entry.0.clone());
                        } else {
                            let children = HashSet::from([entry.0.clone()]);
                            dom_tree_children_map.insert(pre.clone(), children);
                        }
                        break 'find;
                    }
                }
                // if we can not find idom in cuurent predecessor. we contine find idom
                // in predecessor's predecessor
                let mut next_predecessor = Vec::new();
                for pre in &predecessors {
                    for pre_pre in &function.blocks.get(pre).unwrap().predecessor {
                        if !next_predecessor.contains(pre_pre) {
                            next_predecessor.push(pre_pre.clone());
                        }
                    }
                }
                predecessors = next_predecessor;
            }
        }
        for (block_id, entry) in &mut self.dom_table {
            entry.dom_tree_children = replace(
                dom_tree_children_map.get_mut(block_id).unwrap_or(&mut HashSet::new()),
                Default::default(),
            );
        }
    }
    /// DF data flow anaylsis for a control flow graph. the function rely on `idom_anaylsis` to stpre
    /// idom information in dom table to perform the algorithm
    fn dom_frontier_anaylsis(&mut self, function: &Function) {
        for (block_id, block_data) in &function.blocks {
            if block_data.predecessor.len() > 1 {
                for pre_id in &block_data.predecessor {
                    let mut runner_id = pre_id.clone();
                    let idom = if let Some(idom) = self.dom_table.get(block_id).unwrap().idom.clone() {
                        idom
                    } else {
                        continue;
                    };
                    while runner_id != idom {
                        self.dom_table
                            .get_mut(&runner_id)
                            .unwrap()
                            .dom_frontier
                            .insert(block_id.clone());
                        runner_id = if let Some(next_runner_id) = self.dom_table.get(&runner_id).unwrap().idom {
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
