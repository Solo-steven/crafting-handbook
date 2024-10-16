mod debugger;
mod util;

use crate::ir::function::{BasicBlock, Function};
use crate::ir::instructions::{Instruction, InstructionData};
use crate::ir_optimizer::anaylsis::use_def_chain::DefKind;
use crate::ir_optimizer::anaylsis::{post_domtree::PostDomTable, use_def_chain::UseDefTable};
use crate::ir_optimizer::pass::OptimizerPass;
use std::collections::{HashMap, HashSet};
use std::mem::replace;
use util::get_rhs_values;

pub struct DCEPass<'a> {
    worklist: Vec<Instruction>,
    marked_insts: HashSet<Instruction>,
    marked_blocks: HashSet<BasicBlock>,
    use_def_table: &'a UseDefTable,
    post_dom_table: &'a PostDomTable,
    // Ad-hoc data structure only for debug usage
    debug_mark_inst_map_string: Option<HashMap<Instruction, String>>,
}

impl<'a> OptimizerPass for DCEPass<'a> {
    fn process(&mut self, function: &mut Function) {
        self.mark_pass(function);
        self.store_debuuger_info(function);
        self.swap_pass(function);
        self.remove_unreach_block(function);
    }
}

impl<'a> DCEPass<'a> {
    pub fn new(use_def_table: &'a UseDefTable, post_dom_table: &'a PostDomTable, debugger: bool) -> Self {
        Self {
            worklist: Default::default(),
            marked_insts: Default::default(),
            marked_blocks: Default::default(),
            use_def_table,
            post_dom_table,
            debug_mark_inst_map_string: if debugger { Some(Default::default()) } else { None },
        }
    }
    fn mark_inst_if_need(&mut self, inst: Instruction) {
        if !self.marked_insts.contains(&inst) {
            self.worklist.push(inst.clone());
            self.marked_insts.insert(inst);
        }
    }
    fn mark_blocks_if_need(&mut self, block: &BasicBlock) {
        self.marked_blocks.insert(block.clone());
    }
    fn mark_branch_inst_in_post_df(&mut self, function: &Function, block: &BasicBlock) {
        for bb in &self.post_dom_table.table.get(block).unwrap().post_dom_frontier {
            for inst_in_post_df in &function.blocks.get(bb).unwrap().instructions {
                match function.instructions.get(inst_in_post_df).unwrap() {
                    InstructionData::Jump { .. } | InstructionData::BrIf { .. } => {
                        self.mark_inst_if_need(inst_in_post_df.clone());
                        self.mark_blocks_if_need(bb);
                    }
                    _ => {}
                }
            }
        }
    }
    fn mark_pass(&mut self, function: &Function) {
        // Init stage, mark all return and store instruction as critical
        for (inst, inst_data) in &function.instructions {
            match *inst_data {
                InstructionData::Ret { .. } | InstructionData::StoreRegister { .. } | InstructionData::Call { .. } => {
                    self.mark_inst_if_need(inst.clone());
                }
                _ => {}
            }
        }
        // propagation stage, get all def of instruction as mark
        while self.worklist.len() > 0 {
            let inst = self.worklist.pop().unwrap();
            // mark the usage
            let rhs_values = get_rhs_values(function.instructions.get(&inst).unwrap());
            for rhs_val in rhs_values {
                if let Some(def_kind) = self.use_def_table.1.get(&rhs_val) {
                    if let DefKind::InternalDef(inst) = def_kind {
                        self.mark_inst_if_need(inst.clone());
                        self.mark_blocks_if_need(function.get_block_from_inst(inst).unwrap());
                    }
                }
            }
            if let Some(extra_bb) = &self.post_dom_table.extra_exit_block {
                self.mark_branch_inst_in_post_df(function, extra_bb);
            }
            // mark is df
            let block_of_inst = function.get_block_from_inst(&inst).unwrap();
            self.mark_branch_inst_in_post_df(function, block_of_inst);
        }
    }
    fn swap_pass(&self, function: &mut Function) {
        let mut need_to_remove_insts = Vec::new();
        for inst in function.instructions.keys() {
            if !self.marked_insts.contains(inst) {
                need_to_remove_insts.push(inst.clone());
            }
        }
        for inst in need_to_remove_insts {
            let block_of_inst = function.get_block_from_inst(&inst).unwrap().clone();
            let is_jump = match function.instructions.get(&inst).unwrap() {
                InstructionData::Jump { .. } => true,
                InstructionData::BrIf { .. } => true,
                _ => false,
            };
            function.remove_inst_from_block(&block_of_inst, &inst);

            if is_jump {
                function.switch_to_block(block_of_inst);
                let nearest_post_idom = self.find_nearest_post_dom(function, &block_of_inst);
                function.build_jump_inst(nearest_post_idom);
                // adjust block connection
                let block_data = function.blocks.get_mut(&block_of_inst).unwrap();
                let origin_successors = replace(&mut block_data.successor, Vec::with_capacity(1));
                // remove then add, since successor might already contain the `block_of_inst`, add and remove it will
                // make `block_of_inst` be remove eventually.
                for successor in origin_successors {
                    let successor_block_data = function.blocks.get_mut(&successor).unwrap();
                    let predecessor_of_sucessor = replace(&mut successor_block_data.predecessor, Default::default());
                    let next_predecessor_of_sucessor = predecessor_of_sucessor
                        .into_iter()
                        .filter(|bb| *bb != block_of_inst)
                        .collect::<Vec<_>>();
                    successor_block_data.predecessor = next_predecessor_of_sucessor;
                }
                function.connect_block(block_of_inst, nearest_post_idom);
            }
        }
        // println!("{:#?}", function.blocks);
    }
    fn find_nearest_post_dom(&self, function: &mut Function, bb: &BasicBlock) -> BasicBlock {
        let entry = self.post_dom_table.table.get(bb).unwrap();
        let post_dom_set = &entry.post_dom;
        let block_data = function.blocks.get(bb).unwrap();
        let mut successors = block_data.successor.clone();
        loop {
            if successors.len() == 0 {
                panic!();
            }
            // frist iterate over the predecessor to find if predecessor beem
            // have dominate bb or not.
            for successor in &successors {
                if post_dom_set.contains(successor) && self.marked_blocks.contains(successor) {
                    return successor.clone();
                }
            }
            // if we can not find idom in cuurent predecessor. we contine find idom
            // in predecessor's predecessor
            let mut next_successor = Vec::new();
            for successor in &successors {
                for successor_of_successor in &function.blocks.get(successor).unwrap().successor {
                    if !next_successor.contains(successor_of_successor) {
                        next_successor.push(successor_of_successor.clone());
                    }
                }
            }
            successors = next_successor;
        }
    }
    fn remove_unreach_block(&self, function: &mut Function) {
        let mut visit_block = HashSet::new();
        let mut worklist = vec![function.entry_block[0].clone()];
        while worklist.len() > 0 {
            let current = worklist.pop().unwrap();
            if visit_block.contains(&current) {
                continue;
            }
            visit_block.insert(current);
            for &sucessor in &function.blocks.get(&current).unwrap().successor {
                worklist.push(sucessor);
            }
        }
        let mut blocks_need_remove = Vec::new();
        for (block, _) in &function.blocks {
            if !visit_block.contains(&block) {
                blocks_need_remove.push(block.clone());
            }
        }
        for block in blocks_need_remove {
            function.blocks.remove(&block);
        }
    }
}
