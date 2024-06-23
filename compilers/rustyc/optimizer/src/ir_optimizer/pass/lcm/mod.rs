mod expr_key;
mod pre_proc;
mod earliest;
mod latest;
mod rewrite;
mod debugger;

use std::collections::{HashMap, HashSet};
use crate::ir::function::{BasicBlock, Function};
use crate::ir::instructions::Instruction;
use expr_key::{ExpreKey, ExprValueNumberSet};

pub struct LCMPass {
    all_expr_value_number: HashSet<u64>,
    // 1 to 1 mapping
    value_number_map_expr_key: HashMap<u64, ExpreKey>,
    // 1 to many mapping ( 1 more inst might have same key)
    inst_map_value_number: HashMap<Instruction, u64>,
    // Pre-procrss pass
    expression_use: HashMap<BasicBlock,ExprValueNumberSet>,
    expression_kill: HashMap<BasicBlock, ExprValueNumberSet>,
    dfs_order: Vec<BasicBlock>,
    reverse_dfs_order: Vec<BasicBlock>,
    // Get earliest pass
    anticipate_in: HashMap<BasicBlock, ExprValueNumberSet>,
    anticipate_out: HashMap<BasicBlock, ExprValueNumberSet>,
    available_in: HashMap<BasicBlock, ExprValueNumberSet>,
    available_out: HashMap<BasicBlock, ExprValueNumberSet>,
    earliest_in: HashMap<BasicBlock, ExprValueNumberSet>,
    // Get latest pass
    postponable_in: HashMap<BasicBlock, ExprValueNumberSet>,
    postponable_out: HashMap<BasicBlock, ExprValueNumberSet>,
    latest_in: HashMap<BasicBlock, ExprValueNumberSet>,
    used_expr_in: HashMap<BasicBlock, ExprValueNumberSet>,
    // Rewrite pass
}

impl LCMPass {    
    pub fn new() -> Self {
        Self {
            all_expr_value_number: Default::default(),
            value_number_map_expr_key: Default::default(),
            inst_map_value_number: Default::default(),

            expression_use: Default::default(),
            expression_kill: Default::default(),
            dfs_order: Default::default(),
            reverse_dfs_order: Default::default(),

            anticipate_in: Default::default(),
            anticipate_out: Default::default(),
            available_in: Default::default(),
            available_out: Default::default(),
            earliest_in: Default::default(),

            postponable_in: Default::default(),
            postponable_out: Default::default(),
            latest_in: Default::default(),
            used_expr_in: Default::default(),
        }
    }
    pub fn process(&mut self, function: &mut Function,) {
        // pre process pass
        self.pre_proc_pass(function);
        // earliest pass
        self.anticipate_expr_pass(function);
        self.available_expr_pass(function);
        self.earliest_pass(function);
        // latest pass
        self.postponable_pass(function);
        self.latest_pass(function);
        self.used_expr_pass(function);

    }
}
