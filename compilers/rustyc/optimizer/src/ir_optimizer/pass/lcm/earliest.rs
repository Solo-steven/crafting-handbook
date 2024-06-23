
use super::LCMPass;
use super::expr_key::{intersection_content_ref_sets, union_content_ref_sets, different_content_ref_sets, get_content_ref_of_set, content_ref_set_to_own};
use std::collections::HashSet;
use crate::ir::function::Function;


impl LCMPass {
    pub (super) fn available_expr_pass(&mut self, function: &Function) {
        // Init set, since available expression is forward data flow anaylsis
        // set entry to empty and other set to all expression.
        for (block_id, _) in &function.blocks {
            self.available_out.insert(block_id.clone(), self.all_expr_value_number.clone());
        }
        for block_id in &function.entry_block {
            self.available_out.insert(block_id.clone(), HashSet::new());
        }
        // Iteration Data flow anaylsis algorithm
        // 
        let mut is_change = true;
        while is_change {
            is_change = false;
            for block_id in &self.dfs_order {
                // Get Avialble In
                let block_data = function.blocks.get(block_id).unwrap();
                let next_avaliable_in = {
                    let mut next_set: Option<HashSet<_>> = None;
                    for predecessor_id in &block_data.predecessor { 
                        let predecessor_out_set =  get_content_ref_of_set(self.available_out.get(predecessor_id).unwrap());
                        if next_set.is_none() {
                            next_set = Some(predecessor_out_set.clone());
                            continue;
                        }
                        next_set = Some(intersection_content_ref_sets(next_set.unwrap(), predecessor_out_set));
                    }
                    content_ref_set_to_own(next_set.unwrap_or(Default::default()))
                };
                self.available_in.insert(block_id.clone(), next_avaliable_in);
                // Get Available Out
                let next_available_out = {
                    let available_in = get_content_ref_of_set(self.available_in.get(block_id).unwrap());
                    let use_set = get_content_ref_of_set(self.anticipate_in.get(block_id).unwrap());
                    content_ref_set_to_own(union_content_ref_sets(available_in, use_set))
                };
                // Change if value of set is changed
                let exised_avaiable_out = self.available_out.get(block_id).unwrap();
                if next_available_out != *exised_avaiable_out {
                    is_change = true;
                    self.available_out.insert(block_id.clone(), next_available_out);
                }
            }
        }
    }
    pub (super) fn anticipate_expr_pass(&mut self, function: &Function) {
        // init set
        for (block_id, _) in &function.blocks {
            self.anticipate_in.insert(block_id.clone(), self.all_expr_value_number.clone());
        }
        for block_id in &function.exit_block {
            self.anticipate_in.insert(block_id.clone(), Default::default());
        }
        let mut is_change = true;
        while is_change {
            is_change = false;
            for block_id in &self.reverse_dfs_order {
                let block_data = function.blocks.get(block_id).unwrap();
                let next_anticipate_out  = {
                    let mut next_set = None;
                    for sucessor_id in &block_data.successor {
                        let sucessor_anticipate_in = get_content_ref_of_set(self.anticipate_in.get(sucessor_id).unwrap());
                        if next_set.is_none() {
                            next_set = Some(sucessor_anticipate_in.clone());
                        }else {
                            next_set = Some(intersection_content_ref_sets(next_set.unwrap(), sucessor_anticipate_in));
                        }
                    }
                    content_ref_set_to_own(next_set.unwrap_or(Default::default()))
                };
                self.anticipate_out.insert(block_id.clone(), next_anticipate_out);
                let next_anticipate_in = {
                    let anticipate_out = get_content_ref_of_set(self.anticipate_out.get(block_id).unwrap());
                    let use_set = get_content_ref_of_set(self.expression_use.get(block_id).unwrap());
                    let kill_set = get_content_ref_of_set(self.expression_kill.get(block_id).unwrap());
                    content_ref_set_to_own(
                        different_content_ref_sets(
                            union_content_ref_sets(anticipate_out, use_set), 
                            kill_set,
                    ))
                };
                let existed_anticipate_in = self.anticipate_in.get(block_id).unwrap();
                if *existed_anticipate_in != next_anticipate_in {
                    is_change = true;
                    self.anticipate_in.insert(block_id.clone(), next_anticipate_in);
                }
            }
        }
    }
    pub (super) fn earliest_pass(&mut self, function: &Function) {
        for (block_id, _) in &function.blocks {
            let mut earliest_in  = self.anticipate_in.get(block_id).unwrap().clone();
            let available_in = self.available_in.get(block_id).unwrap().clone();
            earliest_in.retain(| key| !available_in.contains(key));
            self.earliest_in.insert(
                block_id.clone(), 
                earliest_in,
            );
        }
    }
}