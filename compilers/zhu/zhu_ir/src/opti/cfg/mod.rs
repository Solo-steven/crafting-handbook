use crate::entities::block::Block;
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
