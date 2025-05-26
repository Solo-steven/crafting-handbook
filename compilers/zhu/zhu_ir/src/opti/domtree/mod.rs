use crate::entities::block::Block;
use crate::opti::cfg::ControlFlowGraph;
use std::collections::{HashMap, HashSet};

pub fn domtree_analysis(cfg: &ControlFlowGraph) -> DomTree {
    let mut dom_tree = DomTree::new();
    dom_tree.process(cfg);
    dom_tree
}
#[derive(Debug, Clone, PartialEq)]
struct DomTableEntry {
    immediate_dominator: Option<Block>,
    dominate_children: HashSet<Block>,
    dominators: HashSet<Block>,
    dominate_frontier: HashSet<Block>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct DomTree {
    table: HashMap<Block, DomTableEntry>,
}

impl DomTree {
    fn compute_dom(&mut self, cfg: &ControlFlowGraph) {
        // init
        for block in cfg.blocks.keys() {
            let all_block: HashSet<Block> = cfg.blocks.keys().map(|b| b.clone()).collect();
            self.table.insert(
                block.clone(),
                DomTableEntry {
                    immediate_dominator: None,
                    dominate_children: Default::default(),
                    dominators: all_block,
                    dominate_frontier: Default::default(),
                },
            );
        }
        self.table.get_mut(&cfg.get_entry()).unwrap().dominators = HashSet::from([cfg.get_entry()]);
        // iter
        let mut is_change = true;
        while is_change {
            is_change = false;
            for block in cfg.blocks.keys() {
                let mut next_dom_of_bb = self.table.get_mut(block).unwrap().dominators.clone();
                for predecessor in cfg.get_predecessors(block) {
                    let dom_of_predecessor = &self.table.get_mut(&predecessor).unwrap().dominators;
                    next_dom_of_bb = next_dom_of_bb
                        .intersection(dom_of_predecessor)
                        .map(|b| b.clone())
                        .collect();
                }
                next_dom_of_bb.insert(block.clone());
                if next_dom_of_bb != self.table.get(block).unwrap().dominators {
                    self.table.get_mut(block).unwrap().dominators = next_dom_of_bb;
                    is_change = true;
                }
            }
        }
    }
    fn compute_idom(&mut self, cfg: &ControlFlowGraph) {
        for block in cfg.blocks.keys() {
            let mut worklist: Vec<Block> = cfg.get_predecessors(block).iter().map(|b| b.clone()).collect();
            let mut marks: HashSet<Block> = HashSet::from([block.clone()]);
            'backward_traversal: while worklist.len() != 0 {
                let mut next_worklist = Vec::new();
                for b in worklist.iter() {
                    if marks.contains(b) {
                        continue;
                    } else {
                        marks.insert(b.clone());
                        if self.table.get(block).unwrap().dominators.contains(b) {
                            self.table.get_mut(block).unwrap().immediate_dominator = Some(b.clone());
                            self.table.get_mut(b).unwrap().dominate_children.insert(block.clone());
                            break 'backward_traversal;
                        }
                        next_worklist.extend(cfg.get_predecessors(b).iter().map(|b| b.clone()));
                    }
                }
                worklist = next_worklist;
            }
        }
    }
    fn compute_df(&mut self, cfg: &ControlFlowGraph) {
        // collect join nodes
        let mut join_nodes = Vec::new();
        for (block, block_node) in &cfg.blocks {
            if block_node.predecessors.len() > 1 {
                join_nodes.push(block.clone());
            }
        }
        // for each join_node, it will be df of ancestor util idom
        for join_node in join_nodes {
            // when idom is none, node must be entry point and entry point can not
            // be DF of any node.
            let idom = if let Some(bb) = self.idom(join_node) {
                bb
            } else {
                continue;
            };
            for predeceesor_block in cfg.get_predecessors(&join_node) {
                let mut runner_id = predeceesor_block.clone();
                while runner_id != idom {
                    self.table
                        .get_mut(&runner_id)
                        .unwrap()
                        .dominate_frontier
                        .insert(join_node);
                    runner_id = self.idom(runner_id).unwrap();
                }
            }
        }
    }
    pub fn process(&mut self, cfg: &ControlFlowGraph) {
        self.compute_dom(cfg);
        self.compute_idom(cfg);
        self.compute_df(cfg);
    }
}

impl DomTree {
    pub fn new() -> Self {
        Self {
            table: Default::default(),
        }
    }
    /// Is bloock a dominate block b
    /// -> Dom(b) contain a
    pub fn dominate(&self, a: Block, b: Block) -> bool {
        if let Some(entry) = self.table.get(&b) {
            entry.dominators.contains(&a)
        } else {
            panic!()
        }
    }
    /// Get dominators of block
    /// -> Dom(b)
    pub fn dom(&self, block: Block) -> &HashSet<Block> {
        if let Some(entry) = self.table.get(&block) {
            &entry.dominators
        } else {
            panic!()
        }
    }
    /// Get immediate dominator of block
    /// -> idom(b)
    pub fn idom(&self, block: Block) -> Option<Block> {
        if let Some(entry) = self.table.get(&block) {
            entry.immediate_dominator.clone()
        } else {
            panic!()
        }
    }
    /// Get dominate frontier of block
    /// -> DF(b)
    pub fn df(&self, block: Block) -> &HashSet<Block> {
        if let Some(entry) = self.table.get(&block) {
            &entry.dominate_frontier
        } else {
            panic!()
        }
    }
}
