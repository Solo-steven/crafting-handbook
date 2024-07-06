mod debugger;
mod earliest;
mod expr_key;
mod latest;
mod pre_proc;
mod rewrite;

use crate::ir::function::{BasicBlock, Function};
use crate::ir_optimizer::pass::OptimizerPass;
use expr_key::{ExprKeyManager, ExprValueNumberSet};
use std::collections::HashMap;

pub struct LCMPass {
    // manage key and inst, value mapping
    key_manager: ExprKeyManager,
    // Pre-procrss pass
    expression_use: HashMap<BasicBlock, ExprValueNumberSet>,
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
            key_manager: ExprKeyManager::new(),

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
}

impl OptimizerPass for LCMPass {
    fn process(&mut self, function: &mut Function) {
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
