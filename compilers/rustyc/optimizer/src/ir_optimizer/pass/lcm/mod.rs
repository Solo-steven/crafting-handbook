
mod expr_key;

use std::collections::{HashMap, HashSet};
use crate::ir::function::{BasicBlock, Function};
use expr_key::{RightHandSideInst, RightHandSideInstructionSet,get_all_right_hand_expr_set, get_right_hand_side_inst_key};

struct LCMPass {
    pub expression_use: HashMap<BasicBlock,RightHandSideInstructionSet>,

    pub anticipate_in: HashMap<BasicBlock, RightHandSideInstructionSet>,
    pub anticipate_out: HashMap<BasicBlock, RightHandSideInstructionSet>,
    pub available_in: HashMap<BasicBlock, RightHandSideInstructionSet>,
    pub available_out: HashMap<BasicBlock, RightHandSideInstructionSet>,
    pub earliest: HashMap<(BasicBlock, BasicBlock), RightHandSideInstructionSet>,

    // ordering
    pub dfs_order: Vec<BasicBlock>,
    pub reverse_dfs_order: Vec<BasicBlock>,
}

impl LCMPass {    
    pub fn process(&mut self, function: &mut Function) {
        self.get_use_expr_pass(function);
        self.available_expr_pass(function);
        self.anticipate_expr_pass(function);
        self.earliest_pass(function);
    }
    fn get_use_expr_pass(&mut self, function: &Function) {
        for (block_id, block_data) in &function.blocks {
            let mut expr_use = HashSet::new();
            for inst in &block_data.instructions {
                let inst_data = function.instructions.get(inst).unwrap();
                match get_right_hand_side_inst_key(inst_data) {
                    (Some(key), Some(_)) => {
                        expr_use.insert(key);
                    }
                    (Some(key), None) => {
                        expr_use.insert(key);
                    }
                    _ => {}
                }
            }
            self.expression_use.insert(block_id.clone(), expr_use);
        }
    }
    fn available_expr_pass(&mut self, function: &Function) {
        // Init set, since available expression is forward data flow anaylsis
        // set entry to empty and other set to all expression.
        for (block_id, _) in &function.blocks {
            let init_set = get_all_right_hand_expr_set(function);
            self.available_out.insert(block_id.clone(), init_set);
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
                    let mut next_set = HashSet::new();
                    for predecessor_id in &block_data.predecessor { 
                        let predecessor_out_set = self.available_out.get(predecessor_id).unwrap();
                        if next_set.is_empty() {
                            next_set = predecessor_out_set.clone();
                            continue;
                        }
                        next_set.retain(|key| {
                            predecessor_out_set.contains(key)
                        })
                    }
                    next_set
                };
                self.available_in.insert(block_id.clone(), next_avaliable_in);
                // Get Available Out
                let next_available_out: HashSet<RightHandSideInst> = {
                    let available_in = self.available_in.get(block_id).unwrap();
                    let use_set = self.expression_use.get(block_id).unwrap();
                    available_in.intersection(use_set).into_iter().map(|key| {key.clone()}).collect::<HashSet<_>>()
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
    fn anticipate_expr_pass(&mut self, function: &Function) {
        // init set
        for (block_id, _) in &function.blocks {
            let init_set = get_all_right_hand_expr_set(function);
            self.anticipate_in.insert(block_id.clone(), init_set);
        }
        for block_id in &function.exit_block {
            self.anticipate_in.insert(block_id.clone(), HashSet::new());
        }
        let mut is_change = true;
        while is_change {
            is_change = false;
            for block_id in &self.reverse_dfs_order {
                let block_data = function.blocks.get(block_id).unwrap();
                let next_anticipate_out  = {
                    let mut next_set = HashSet::new();
                    for sucessor_id in &block_data.successor {
                        let sucessor_anticipate_in = &self.anticipate_in.get(sucessor_id).unwrap().clone();
                        if next_set.is_empty() {
                            next_set = sucessor_anticipate_in.clone();
                        }else {
                            next_set.retain(|key| {
                                sucessor_anticipate_in.contains(key)
                            })
                        }
                    }
                    next_set
                };
                self.anticipate_out.insert(block_id.clone(), next_anticipate_out);
                let next_anticipate_in = {
                    let anticipate_out = self.anticipate_out.get(block_id).unwrap();
                    let use_set = self.expression_use.get(block_id).unwrap();
                    anticipate_out.intersection(use_set).into_iter().map(|key| {key.clone()}).collect::<HashSet<_>>()
                };
                let existed_anticipate_in = self.anticipate_in.get(block_id).unwrap();
                if *existed_anticipate_in != next_anticipate_in {
                    is_change = true;
                    self.anticipate_in.insert(block_id.clone(), next_anticipate_in);
                }
            }
        }
    }
    fn earliest_pass(&mut self, function: &Function) {
        for (block_id, block_data) in &function.blocks {
            let start_block = block_id;
            for successor_id in &block_data.successor {
                let end_block = successor_id;
                let start_block_available_out = self.anticipate_out.get(start_block).unwrap();
                let start_block_aniticipate_out = self.anticipate_out.get(start_block).unwrap();
                let end_block_aniticipate_in = self.anticipate_in.get(end_block).unwrap();
                let earliest = start_block_available_out
                    .intersection(start_block_aniticipate_out)
                    .collect::<HashSet<_>>()
                    .intersection(&end_block_aniticipate_in.into_iter().map(|key| { key }).collect::<HashSet<_>>())
                    .into_iter().map(|key| { (*key).clone() })
                    .collect::<HashSet<_>>()
                ;
                self.earliest.insert((start_block.clone(), end_block.clone()), earliest);
            }
        }
    }
}