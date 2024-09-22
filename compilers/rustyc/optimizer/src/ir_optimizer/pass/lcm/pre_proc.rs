use super::expr_key::get_dst_value;
use super::LCMPass;
use crate::ir::function::Function;
use crate::ir_optimizer::anaylsis::dfs_ordering::DFSOrdering;
use crate::ir_optimizer::anaylsis::OptimizerAnaylsis;
use std::collections::HashSet;

impl LCMPass {
    pub(super) fn pre_proc_pass(&mut self, function: &Function) {
        self.key_manager.build_tables_mapping(function);
        self.build_use_kill_expr(function);
        self.build_dfs_ordering(function);
    }
    // fn remove_critical_edge(&mut self, function: &Function) {
    //     // TODO
    // }
    fn build_use_kill_expr(&mut self, function: &Function) {
        for (block_id, block_data) in &function.blocks {
            let mut expr_use = HashSet::new();
            for inst in &block_data.instructions {
                if let Some(val_number) = self.key_manager.get_expr_value_number_from_inst(inst) {
                    expr_use.insert(val_number.clone());
                }
            }
            self.expression_use.insert(block_id.clone(), expr_use);
        }
        for (block_id, block_data) in &function.blocks {
            let mut expr_kill = HashSet::new();
            for inst in &block_data.instructions {
                let inst_data = function.instructions.get(inst).unwrap();
                if let Some(value) = get_dst_value(inst_data) {
                    if let Some(kill_set) = self
                        .key_manager
                        .get_kill_expr_value_numbers_from_dst_value(&value)
                    {
                        expr_kill.extend(kill_set.into_iter());
                    }
                }
            }
            self.expression_kill.insert(block_id.clone(), expr_kill);
        }
    }
    fn build_dfs_ordering(&mut self, function: &Function) {
        let mut dfs = DFSOrdering::new();
        self.dfs_order = dfs.anaylsis(function);
        let mut reverse_dfs_order = self.dfs_order.clone();
        reverse_dfs_order.reverse();
        self.reverse_dfs_order = reverse_dfs_order;
    }
}
