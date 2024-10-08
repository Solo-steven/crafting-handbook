mod debugger;
mod expr_key;
mod scope_table;

use crate::ir::function::{BasicBlock, Function};
use crate::ir::instructions::OpCode;
use crate::ir::instructions::{Instruction, InstructionData};
use crate::ir::value::Value;
use crate::ir_optimizer::anaylsis::domtree::DomTable;
use crate::ir_optimizer::pass::OptimizerPass;
use expr_key::get_right_hand_side_inst_key;
use scope_table::{sorted_dom_children_in_dfs_ordering, ScopeInstCacheTable, ScopeReplaceValueCacheTable};
use std::collections::HashMap;

pub struct GVNPass<'a> {
    dom_table: &'a DomTable,
    /// Replace table is used to replace right hand side operand.
    /// - if key is exist in table, mean value have same value as key
    replaceable_value_table: ScopeReplaceValueCacheTable,
    /// Cache table is used to replace entire right hand side as a value.
    /// - if expr key is exist in table, mean entire inst could be rewrite
    ///   as a assignment expr.
    cache_inst_table: ScopeInstCacheTable,
    /// Post process cache to reomve inst.
    need_remove_insts: Vec<(BasicBlock, Instruction)>,
    /// Cache for debugger
    cache_inst_strings: HashMap<Instruction, String>,
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
            cache_inst_strings: Default::default(),
        }
    }
    /// ## Main Algorithm of GVN
    /// - for phi : remove it if meanless and redundant
    /// - for other inst: remove it if redundant.
    /// 1. A inst is redundant if and only if it's ExprKey is already computed.
    /// 2. A meanless phi mean all the src value is same, like `a = phi b b1, b b2, b b3`.
    fn visit_block(
        &mut self,
        function: &mut Function,
        block_id: BasicBlock,
        sorted_dom_chilren: &HashMap<BasicBlock, Vec<BasicBlock>>,
    ) {
        self.cache_inst_table.enter_scope();
        self.replaceable_value_table.enter_scope();
        let block_data = function.blocks.get(&block_id).unwrap();
        for inst in &block_data.instructions {
            let inst_data = function.instructions.get_mut(inst).unwrap();
            if let InstructionData::Phi { dst, from, .. } = &inst_data {
                if self.rewrite_phi_by_cache_table(dst, from) {
                    self.need_remove_insts.push((block_id.clone(), inst.clone()))
                }
                continue;
            }
            self.rewrite_inst_operand_by_replaceable_table(inst_data);
            if self.rewrite_inst_by_cache_table(inst_data) {
                self.need_remove_insts.push((block_id.clone(), inst.clone()))
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
    /// ## Post-process to remove inst
    /// Because ownership problem, we can not remove inst while borrow it, we need
    /// remove inst after gvn traversal.
    fn remove_redundant_insts(&mut self, function: &mut Function) {
        for (block_id, inst) in &self.need_remove_insts {
            let mut string = String::new();
            function.print_inst(&mut string, function.instructions.get(inst).unwrap());
            string = string.trim().to_string();
            function.remove_inst_from_block(&block_id, &inst);
            self.cache_inst_strings.insert(inst.clone(), string);
        }
    }
    /// ## Rewrite phi is meanless or redundant,
    /// - return true when meanless and redundant.
    /// - otherwise return false.
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
            let replace_value = self.replaceable_value_table.get(last_value).unwrap_or(last_value);
            self.replaceable_value_table.insert(dst.clone(), replace_value.clone());
            return true;
        }
        // check is redundant
        self.rewrite_inst_by_cache_table(&InstructionData::Phi {
            opcode: OpCode::Phi,
            dst: dst.clone(),
            from: from.clone(),
        })
    }
    fn rewrite_successor_phi_by_replaceable_table(&mut self, function: &mut Function, successor_id: &BasicBlock) {
        let successor_block_data = function.blocks.get(successor_id).unwrap();
        for inst in &successor_block_data.instructions {
            let inst_data = function.instructions.get_mut(inst).unwrap();
            if let InstructionData::Phi { from, .. } = inst_data {
                for (_, value) in from {
                    self.rewrite_value_by_replaceable_table(value)
                }
            }
        }
    }
    /// ## Rewrite Inst by Cache Table
    /// - return true if given inst need to remove
    /// - otherwise, return false.
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
    /// Wrapper of `rewrite_value_by_replaceable_table`, just unwind the inst values and dist.
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
    /// ## Try to over write a value by replace table
    /// if the given value exist in replaceable table, overwrite that value by table value.
    fn rewrite_value_by_replaceable_table(&mut self, value: &mut Value) {
        if let Some(replace_able_value) = self.replaceable_value_table.get(value) {
            *value = replace_able_value.clone();
        }
    }
}
