use super::expr_key::RightHandSideInst;
use crate::ir::function::{BasicBlock, Function};
use crate::ir::value::Value;
use crate::ir_optimizer::anaylsis::dfs_ordering::DFSOrdering;
use crate::ir_optimizer::anaylsis::domtree::DomTable;
use crate::ir_optimizer::anaylsis::OptimizerAnaylsis;
use std::collections::HashMap;

/// ## Scope Inst Cache Table
/// cache table is used to store the expr-key map to the value that has already
/// computed the inst right hand side.
/// - scope means that we could enter and exit by dom-tree relationship
pub struct ScopeInstCacheTable {
    current_index: usize,
    table: Vec<HashMap<RightHandSideInst, Value>>,
}
impl ScopeInstCacheTable {
    pub fn new() -> Self {
        Self {
            current_index: 0,
            table: vec![HashMap::new()],
        }
    }
    pub fn insert(&mut self, key: RightHandSideInst, value: Value) {
        let table = &mut self.table[self.current_index];
        table.insert(key, value);
    }
    pub fn get(&self, key: &RightHandSideInst) -> Option<&Value> {
        for table in &self.table {
            if let Some(val) = table.get(key) {
                return Some(val);
            }
        }
        return None;
    }
    pub fn enter_scope(&mut self) {
        self.current_index += 1;
        self.table.push(HashMap::new());
    }
    pub fn exit_scope(&mut self) {
        self.current_index -= 1;
        self.table.pop();
    }
}
/// ## Scope Replace Value Cache Table
/// replace table is used to store the value that is can be replaced by other value,
/// for exapmple:
/// ```ir
/// a = b * c
/// d = b * c
/// e = d + d
/// ```
/// when d is rewrited by cache table to `d = a`, that for following inst `e = d + d`,
/// d should be replace by a to remove the duplicate check for equal value  d = a.
pub struct ScopeReplaceValueCacheTable {
    current_index: usize,
    table: Vec<HashMap<Value, Value>>,
}

impl ScopeReplaceValueCacheTable {
    pub fn new() -> Self {
        Self {
            current_index: 0,
            table: vec![HashMap::new()],
        }
    }
    pub fn insert(&mut self, key: Value, value: Value) {
        let table = &mut self.table[self.current_index];
        table.insert(key, value);
    }
    pub fn get(&self, key: &Value) -> Option<&Value> {
        for table in &self.table {
            if let Some(val) = table.get(key) {
                return Some(val);
            }
        }
        return None;
    }
    pub fn enter_scope(&mut self) {
        self.current_index += 1;
        self.table.push(HashMap::new());
    }
    pub fn exit_scope(&mut self) {
        self.current_index -= 1;
        self.table.pop();
    }
}

pub fn sorted_dom_children_in_dfs_ordering<'a>(
    dom_table: &'a DomTable,
    function: &'a Function,
) -> HashMap<BasicBlock, Vec<BasicBlock>> {
    let mut map = HashMap::new();
    let mut dfs_order_anaylsis = DFSOrdering::new();
    let mut id_map_order = HashMap::new();
    let mut index = 0 as usize;
    for block_id in dfs_order_anaylsis.anaylsis(&function) {
        id_map_order.insert(block_id, index);
        index += 1;
    }
    for (block_id, entry) in dom_table {
        let mut children = entry.dom_tree_children.clone().into_iter().collect::<Vec<_>>();
        if children.len() == 0 {
            map.insert(block_id.clone(), children);
            continue;
        }
        for i in 0..(children.len() - 1) {
            for j in 0..(children.len() - 1 - i) {
                let current_id = children[j];
                let next_id = children[j + 1];
                if id_map_order.get(&current_id).unwrap() > id_map_order.get(&next_id).unwrap() {
                    let temp = current_id;
                    children[j] = children[j + 1];
                    children[j + 1] = temp;
                }
            }
        }
        map.insert(block_id.clone(), children);
    }
    map
}
