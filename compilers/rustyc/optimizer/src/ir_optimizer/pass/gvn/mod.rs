use crate::ir::function::{BasicBlock, Function};
use crate::ir::instructions::OpCode;
use crate::ir::instructions::{Instruction, InstructionData};
use crate::ir::value::Value;
use crate::ir_optimizer::anaylsis::domtree::DomTable;
use std::collections::HashMap;

use expr_key::{get_right_hand_side_inst_key, ScopeCacheTable};

mod expr_key;

pub struct GVNPass {
    replaceable_value_table: HashMap<Value, Value>,
    cache_inst_table: ScopeCacheTable,

    need_remove_insts: Vec<(BasicBlock, Instruction)>,
}

impl GVNPass {
    pub fn new() -> Self {
        Self {
            replaceable_value_table: Default::default(),
            cache_inst_table: ScopeCacheTable::new(),
            need_remove_insts: Default::default(),
        }
    }
    pub fn process(&mut self, function: &mut Function, dom_table: &DomTable) {
        self.visit_block(function, function.entry_block[0].clone(), dom_table);
        self.remove_redundant_insts(function);
    }
    fn visit_block(&mut self, function: &mut Function, block_id: BasicBlock, dom_table: &DomTable) {
        self.cache_inst_table.enter_scope();
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
        for dom_child in &dom_table.get(&block_id).unwrap().dom_tree_children {
            self.visit_block(function, dom_child.clone(), dom_table);
        }
        self.cache_inst_table.exit_scope();
    }
    fn remove_redundant_insts(&mut self, function: &mut Function) {
        for (block_id, inst) in &self.need_remove_insts {
            function.remove_inst_from_block(&block_id, &inst);
        }
        self.need_remove_insts = Vec::new();
    }
    fn rewrite_phi_by_cache_table(&mut self, dst: &Value, from: &Vec<(BasicBlock, Value)>) -> bool {
        // check is meanless
        let last_block_id = &from[0].0;
        let last_value = &from[0].1;
        let mut is_meaning_less = true;
        for (block_id, value) in from {
            if last_block_id == block_id && last_value == value {
                continue;
            }
            is_meaning_less = false;
            break;
        }
        if is_meaning_less {
            let replace_value = self
                .replaceable_value_table
                .get(last_value)
                .or(Some(last_value))
                .unwrap();
            self.replaceable_value_table
                .insert(dst.clone(), replace_value.clone());
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
