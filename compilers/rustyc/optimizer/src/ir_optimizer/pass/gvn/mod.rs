mod expr_key;
mod scope_table;
mod debugger;

use std::collections::HashMap;
use crate::ir::function::{BasicBlock, Function};
use crate::ir::instructions::OpCode;
use crate::ir::instructions::{Instruction, InstructionData};
use crate::ir::value::Value;
use crate::ir_optimizer::anaylsis::domtree::DomTable;
use crate::ir_optimizer::pass::OptimizerPass;
use expr_key::get_right_hand_side_inst_key;
use scope_table::{ScopeInstCacheTable, ScopeReplaceValueCacheTable, sorted_dom_children_in_dfs_ordering};

pub struct GVNPass<'a> {
    dom_table: &'a DomTable,
    replaceable_value_table: ScopeReplaceValueCacheTable,
    cache_inst_table: ScopeInstCacheTable,
    need_remove_insts: Vec<(BasicBlock, Instruction)>,
}

impl<'a> OptimizerPass for GVNPass<'a> {
    fn process(&mut self, function: &mut Function) {
        let map = sorted_dom_children_in_dfs_ordering(&self.dom_table, function);
        self.visit_block(function, function.entry_block[0].clone(), &map);
        self.remove_redundant_insts(function);
    }
}
impl<'a> GVNPass<'a> {
    pub fn new(dom_table: &'a DomTable) -> Self {
        Self {
            dom_table,
            replaceable_value_table: ScopeReplaceValueCacheTable::new(),
            cache_inst_table: ScopeInstCacheTable::new(),
            need_remove_insts: Default::default(),
        }
    }
    fn visit_block(&mut self, function: &mut Function, block_id: BasicBlock, sorted_dom_chilren: &HashMap<BasicBlock, Vec<BasicBlock>>) {
        self.cache_inst_table.enter_scope();
        self.replaceable_value_table.enter_scope();
        let block_data = function.blocks.get(&block_id).unwrap();
        for inst in &block_data.instructions {
            let inst_data = function.instructions.get_mut(inst).unwrap();
            if let InstructionData::Phi { dst, from, .. } = &inst_data {
                if self.rewrite_phi_by_cache_table(dst, from) {
                    self.need_remove_insts
                        .push((block_id.clone(), inst.clone()))
                }
                continue;
            }
            self.rewrite_inst_operand_by_replaceable_table(inst_data);
            if self.rewrite_inst_by_cache_table(inst_data) {
                self.need_remove_insts
                    .push((block_id.clone(), inst.clone()))
            }
        }
        for sucessor_id in &block_data.successor.clone() {
            self.rewrite_successor_phi_by_replaceable_table(function, sucessor_id)
        }
        // visit dom children
        for dom_child in sorted_dom_chilren.get(&block_id).unwrap() {
            self.visit_block(function, dom_child.clone(), sorted_dom_chilren);
        }
        self.replaceable_value_table.exit_scope();
        self.cache_inst_table.exit_scope();
    }
    fn remove_redundant_insts(&mut self, function: &mut Function) {
        for (block_id, inst) in &self.need_remove_insts {
            function.remove_inst_from_block(&block_id, &inst);
        }
    }
    fn rewrite_phi_by_cache_table(&mut self, dst: &Value, from: &Vec<(BasicBlock, Value)>) -> bool {
        // check is meanless
        let last_value = &from[0].1;
        let mut is_meaning_less = true;
        for (_, value) in from {
            if last_value == value {
                continue;
            }
            is_meaning_less = false;
            break;
        }
        if is_meaning_less {
            let replace_value = self
                .replaceable_value_table
                .get(last_value)
                .unwrap_or(last_value);
            self.replaceable_value_table
                .insert(dst.clone(), replace_value.clone());
            return true;
        }
        // check is redundant
        self.rewrite_inst_by_cache_table(&InstructionData::Phi {
            opcode: OpCode::Phi,
            dst: dst.clone(),
            from: from.clone(),
        })
    }
    fn rewrite_successor_phi_by_replaceable_table(
        &mut self,
        function: &mut Function,
        successor_id: &BasicBlock,
    ) {
        let successor_block_data = function.blocks.get(successor_id).unwrap();
        for inst in &successor_block_data.instructions {
            let inst_data = function.instructions.get_mut(inst).unwrap();
            if let InstructionData::Phi { from, .. } = inst_data {
                self.rewrite_phi_operand_by_replaceable_table(from);
            }
        }
    }
    fn rewrite_phi_operand_by_replaceable_table(&mut self, from: &mut Vec<(BasicBlock, Value)>) {
        for (_, value) in from {
            self.rewrite_value_by_replaceable_table(value)
        }
    }
    fn rewrite_inst_by_cache_table(&mut self, inst_data: &InstructionData) -> bool {
        match get_right_hand_side_inst_key(inst_data) {
            Some((key, dst_value)) => {
                if let Some(replace_value) = self.cache_inst_table.get(&key) {
                    self.replaceable_value_table
                        .insert(dst_value.clone(), replace_value.clone());
                    return true;
                } else {
                    self.cache_inst_table.insert(key.clone(), dst_value);
                    return false;
                }
            }
            _ => return false,
        }
    }
    fn rewrite_inst_operand_by_replaceable_table(&mut self, inst_data: &mut InstructionData) {
        match inst_data {
            InstructionData::Add { src1, src2, .. }
            | InstructionData::Sub { src1, src2, .. }
            | InstructionData::Mul { src1, src2, .. }
            | InstructionData::Divide { src1, src2, .. }
            | InstructionData::Reminder { src1, src2, .. }
            | InstructionData::FAdd { src1, src2, .. }
            | InstructionData::FSub { src1, src2, .. }
            | InstructionData::FMul { src1, src2, .. }
            | InstructionData::FDivide { src1, src2, .. }
            | InstructionData::FReminder { src1, src2, .. }
            | InstructionData::BitwiseAnd { src1, src2, .. }
            | InstructionData::BitwiseOR { src1, src2, .. }
            | InstructionData::LogicalAnd { src1, src2, .. }
            | InstructionData::LogicalOR { src1, src2, .. }
            | InstructionData::ShiftLeft { src1, src2, .. }
            | InstructionData::ShiftRight { src1, src2, .. }
            | InstructionData::Icmp { src1, src2, .. }
            | InstructionData::Fcmp { src1, src2, .. } => {
                self.rewrite_value_by_replaceable_table(src1);
                self.rewrite_value_by_replaceable_table(src2);
            }
            InstructionData::Neg { src, .. }
            | InstructionData::BitwiseNot { src, .. }
            | InstructionData::LogicalNot { src, .. }
            | InstructionData::ToU8 { src, .. }
            | InstructionData::ToU16 { src, .. }
            | InstructionData::ToU32 { src, .. }
            | InstructionData::ToU64 { src, .. }
            | InstructionData::ToI16 { src, .. }
            | InstructionData::ToI32 { src, .. }
            | InstructionData::ToI64 { src, .. }
            | InstructionData::ToF32 { src, .. }
            | InstructionData::ToF64 { src, .. }
            | InstructionData::ToAddress { src, .. } => {
                self.rewrite_value_by_replaceable_table(src);
            }
            _ => {}
        }
    }
    fn rewrite_value_by_replaceable_table(&mut self, value: &mut Value) {
        if let Some(replace_able_value) = self.replaceable_value_table.get(value) {
            *value = replace_able_value.clone();
        }
    }
}
