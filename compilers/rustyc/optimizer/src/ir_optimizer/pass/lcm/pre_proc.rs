use std::collections::{HashMap, HashSet};

use crate::ir::function::Function;
use crate::ir::value::Value;
use super::expr_key::{get_expr_key_and_values, get_dst_value, ExprValueNumber, ExpreKey};
use super::LCMPass;
use crate::ir_optimizer::anaylsis::dfs_ordering::DFSOrdering;

impl LCMPass {
    pub (super) fn pre_proc_pass(&mut self, function: &Function) {
        self.build_use_kill_expr(function);
        self.build_dfs_ordering(function);
    }
    // fn remove_critical_edge(&mut self, function: &Function) {
    //     // TODO
    // }
    fn build_use_kill_expr(&mut self, function: &Function) {
      let mut expr_key_map_value_number: HashMap<ExpreKey, u64> = HashMap::new();
      let mut values_map_kill_expr: HashMap<Value, HashSet<ExprValueNumber>> = HashMap::new();
      for (inst, inst_data) in &function.instructions {
         if let Some((key, values)) = get_expr_key_and_values(inst_data) {
            // for use
            let value_number = if let Some(value_number) = expr_key_map_value_number.get(&key) {
                self.inst_map_value_number.insert(inst.clone(), value_number.clone());
                value_number.clone()
            }else {
                let next_value_number = self.value_number_map_expr_key.len() as u64;
                self.all_expr_value_number.insert(next_value_number);
                self.inst_map_value_number.insert(inst.clone(), next_value_number);
                self.value_number_map_expr_key.insert(next_value_number, key.clone());
                expr_key_map_value_number.insert(
                    key, 
                    next_value_number
                );
                next_value_number
            };
            // for kill
            for valus in values {
                if let Some(key_set) = values_map_kill_expr.get_mut(&valus) {
                    key_set.insert(value_number);
                }else {
                    let mut key_set: HashSet<ExprValueNumber> = Default::default();
                    key_set.insert(value_number);
                    values_map_kill_expr.insert(valus, key_set);
                }
            }
         }
      }

      for (block_id, block_data) in &function.blocks {
        let mut expr_use = HashSet::new();
        for inst in &block_data.instructions {
            if let Some(val_number) = self.inst_map_value_number.get(inst) {
                expr_use.insert(val_number.clone());
            }
        }
        self.expression_use.insert(block_id.clone(), expr_use);

        for (block_id, block_data) in &function.blocks {
            let mut expr_kill = HashSet::new();
            for inst in &block_data.instructions {
                let inst_data = function.instructions.get(inst).unwrap();
                if let Some(value) = get_dst_value(inst_data) {
                    if let Some(kill_set) = values_map_kill_expr.get(&value) {
                        expr_kill.extend(kill_set.into_iter());
                    }
                }
            }
            self.expression_kill.insert(block_id.clone(), expr_kill);
        }
    }

   }
    fn build_dfs_ordering(&mut self, function: &Function) {
      let mut dfs = DFSOrdering::new();
      self.dfs_order = dfs.get_order(function.entry_block[0].clone(), &function.blocks);
      let mut reverse_dfs_order = self.dfs_order.clone();
      reverse_dfs_order.reverse();
      self.reverse_dfs_order = reverse_dfs_order;
   }

}