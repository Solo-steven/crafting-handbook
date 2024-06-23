use super::expr_key::{
    content_ref_set_to_own, different_content_ref_sets, get_content_ref_of_set,
    intersection_content_ref_sets, union_content_ref_sets,
};
use super::LCMPass;
use crate::ir::function::Function;
use std::collections::{HashMap, HashSet};

impl LCMPass {
    pub(super) fn postponable_pass(&mut self, function: &Function) {
        // init set
        for (block_id, _) in &function.blocks {
            self.postponable_out
                .insert(block_id.clone(), self.key_manager.get_value_number_set());
        }
        for block_id in &function.entry_block {
            self.postponable_out
                .insert(block_id.clone(), Default::default());
        }
        //
        let mut is_change = true;
        while is_change {
            is_change = false;
            for block_id in &self.dfs_order {
                let block_data = function.blocks.get(block_id).unwrap();
                let next_postponable_in = {
                    let mut next_set = None;
                    for predecessor_id in &block_data.predecessor {
                        let predecessor_postponable_out = get_content_ref_of_set(
                            self.postponable_out.get(predecessor_id).unwrap(),
                        );
                        if next_set.is_none() {
                            next_set = Some(predecessor_postponable_out.clone());
                        } else {
                            next_set = Some(intersection_content_ref_sets(
                                next_set.unwrap(),
                                predecessor_postponable_out,
                            ));
                        }
                    }
                    content_ref_set_to_own(next_set.unwrap_or(Default::default()))
                };
                self.postponable_in
                    .insert(block_id.clone(), next_postponable_in);

                let next_postponable_out = {
                    let postponable_in =
                        get_content_ref_of_set(self.postponable_in.get(block_id).unwrap());
                    let earliest_in =
                        get_content_ref_of_set(self.earliest_in.get(block_id).unwrap());
                    let use_expr =
                        get_content_ref_of_set(self.expression_use.get(block_id).unwrap());
                    content_ref_set_to_own(different_content_ref_sets(
                        union_content_ref_sets(postponable_in, earliest_in),
                        use_expr,
                    ))
                };
                let existed_postponable_out = self.postponable_out.get(block_id).unwrap();
                if *existed_postponable_out != next_postponable_out {
                    is_change = true;
                    self.postponable_out
                        .insert(block_id.clone(), next_postponable_out);
                }
            }
        }
    }
    pub(super) fn latest_pass(&mut self, function: &Function) {
        let mut putable_set = HashMap::new();
        for (block_id, _) in &function.blocks {
            let earliest_in = get_content_ref_of_set(self.earliest_in.get(block_id).unwrap());
            let postponable_in = get_content_ref_of_set(self.postponable_in.get(block_id).unwrap());
            putable_set.insert(
                block_id.clone(),
                union_content_ref_sets(earliest_in, postponable_in),
            );
        }
        for (block_id, block_data) in &function.blocks {
            let use_expr = get_content_ref_of_set(self.expression_use.get(block_id).unwrap());
            let sucessor_all_putable = {
                let mut next_set = None;
                for sucessor_id in &block_data.successor {
                    let successor_putable_set = putable_set.get(sucessor_id).unwrap().clone();
                    if next_set.is_none() {
                        next_set = Some(successor_putable_set.clone());
                    } else {
                        next_set = Some(intersection_content_ref_sets(
                            next_set.unwrap(),
                            successor_putable_set,
                        ));
                    }
                }
                next_set.unwrap_or(Default::default())
            };
            let one_of_succesor_not_putable = different_content_ref_sets(
                get_content_ref_of_set(&self.key_manager.borrow_all_expr_keys()),
                sucessor_all_putable,
            );

            let left = union_content_ref_sets(use_expr, one_of_succesor_not_putable);
            self.latest_in.insert(
                block_id.clone(),
                content_ref_set_to_own(intersection_content_ref_sets(
                    left,
                    putable_set.get(block_id).unwrap().clone(),
                )),
            );
        }
    }
    pub(super) fn used_expr_pass(&mut self, function: &Function) {
        // init set
        for (block_id, _) in &function.blocks {
            self.used_expr_in
                .insert(block_id.clone(), Default::default());
        }
        let mut is_change = true;
        while is_change {
            is_change = false;
            for (block_id, block_data) in &function.blocks {
                let used_expr_out = {
                    let mut next_set = None;
                    for successor_id in &block_data.successor {
                        let successor_used_expr_in =
                            get_content_ref_of_set(self.used_expr_in.get(successor_id).unwrap());
                        if next_set.is_none() {
                            next_set = Some(successor_used_expr_in);
                        } else {
                            next_set = Some(union_content_ref_sets(
                                next_set.unwrap(),
                                successor_used_expr_in,
                            ));
                        }
                    }
                    next_set.unwrap_or(Default::default())
                };
                let next_used_expr_in = {
                    let use_expr =
                        get_content_ref_of_set(self.expression_use.get(block_id).unwrap());
                    let latest_in = self.latest_in.get(block_id).unwrap();
                    let mut next_set = used_expr_out
                        .union(&use_expr)
                        .into_iter()
                        .map(|key| *key)
                        .collect::<HashSet<_>>();
                    next_set.retain(|key| !latest_in.contains(*key));
                    next_set
                        .into_iter()
                        .map(|key| key.clone())
                        .collect::<HashSet<_>>()
                };
                let existed_used_expr_in = self.used_expr_in.get(block_id).unwrap();
                if *existed_used_expr_in != next_used_expr_in {
                    is_change = true;
                    self.used_expr_in
                        .insert(block_id.clone(), next_used_expr_in);
                }
            }
        }
    }
}
