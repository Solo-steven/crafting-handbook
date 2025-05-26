mod inst_operand_key;

use crate::entities::block::Block;
use crate::entities::function::Function;
use crate::entities::instruction::Instruction;
use crate::entities::instruction::InstructionData;
use crate::entities::value::Value;
use crate::opti::cfg::ControlFlowGraph;
use crate::opti::domtree::DomTree;
use crate::opti::rpo::RevresePostOrder;
use crate::opti::OptiPass;
use inst_operand_key::InstOperandKey;
use std::collections::HashMap;
use std::collections::HashSet;

pub fn gvn_pass(function: &mut Function, dom: &DomTree, cfg: &ControlFlowGraph, rpo: &RevresePostOrder) {
    let mut gvn_pass = GvnPass::new(dom, cfg, rpo);
    gvn_pass.process(function);
}

pub struct GvnPass<'a> {
    reduntant_map: HashMap<InstOperandKey, Value>,
    replace_map: HashMap<Value, Value>,
    dom: &'a DomTree,
    cfg: &'a ControlFlowGraph,
    rpo: &'a RevresePostOrder,
}

impl<'a> OptiPass for GvnPass<'a> {
    fn process(&mut self, function: &mut Function) {
        let entry_block = self.cfg.get_entry();
        let mut remove_insts = Vec::new();
        self.dfs_visit_dom_tree_block(entry_block, function, &mut remove_insts);
        self.remove_redundant_insts(function, remove_insts);
    }
}

impl<'a> GvnPass<'a> {
    pub fn new(dom: &'a DomTree, cfg: &'a ControlFlowGraph, rpo: &'a RevresePostOrder) -> Self {
        GvnPass {
            reduntant_map: HashMap::new(),
            replace_map: HashMap::new(),
            dom,
            cfg,
            rpo,
        }
    }

    fn replace_inst_data_operands(&self, inst_data: &mut InstructionData) {
        match inst_data {
            InstructionData::Unary { value, .. } | InstructionData::BinaryI { value, .. } => {
                if let Some(replace_value) = self.replace_map.get(value) {
                    *value = replace_value.clone();
                }
            }
            InstructionData::Convert { src, .. }
            | InstructionData::Move { src, .. }
            | InstructionData::GlobalStore { src, .. } => {
                if let Some(replace_value) = self.replace_map.get(src) {
                    *src = replace_value.clone();
                }
            }
            InstructionData::Binary { args, .. } => {
                for arg in args.iter_mut() {
                    if let Some(replace_value) = self.replace_map.get(arg) {
                        *arg = replace_value.clone();
                    }
                }
            }
            InstructionData::Icmp { args, .. } => {
                for arg in args.iter_mut() {
                    if let Some(replace_value) = self.replace_map.get(arg) {
                        *arg = replace_value.clone();
                    }
                }
            }
            InstructionData::Fcmp { args, .. } => {
                for arg in args.iter_mut() {
                    if let Some(replace_value) = self.replace_map.get(arg) {
                        *arg = replace_value.clone();
                    }
                }
            }
            InstructionData::Call { params, .. } => {
                for param in params.iter_mut() {
                    if let Some(replace_value) = self.replace_map.get(param) {
                        *param = replace_value.clone();
                    }
                }
            }
            InstructionData::Ret { value, .. } => {
                for ret_value in value.iter_mut() {
                    if let Some(replace_value) = self.replace_map.get(ret_value) {
                        *ret_value = replace_value.clone();
                    }
                }
            }
            InstructionData::LoadRegister { base, .. } => {
                if let Some(replace_value) = self.replace_map.get(base) {
                    *base = replace_value.clone();
                }
            }
            InstructionData::StoreRegister { base, src, .. } => {
                if let Some(replace_value) = self.replace_map.get(base) {
                    *base = replace_value.clone();
                }
                if let Some(replace_value) = self.replace_map.get(src) {
                    *src = replace_value.clone();
                }
            }
            InstructionData::BrIf { test, .. } => {
                if let Some(replace_value) = self.replace_map.get(test) {
                    *test = replace_value.clone();
                }
            }
            InstructionData::Phi { from, .. } => {
                for (_, value) in from.iter_mut() {
                    if let Some(replace_value) = self.replace_map.get(value) {
                        *value = replace_value.clone();
                    }
                }
            }
            _ => {}
        }
    }
    fn remove_inst_if_redundant(
        &mut self,
        function: &Function,
        inst: Instruction,
        inst_data: &InstructionData,
        remove_insts: &mut Vec<Instruction>,
        added_to_reduntant_map_insts: &mut HashSet<Instruction>,
    ) {
        if let Some(inst_operand_key) = inst_data.to_inst_operand_key() {
            if let Some(already_computed_value) = self.reduntant_map.get(&inst_operand_key) {
                // If instruction has already been compute, remove if and link it's result to value
                // already computed
                remove_insts.push(inst);
                if let Some(result) = function.get_inst_result(inst) {
                    self.replace_map.insert(result, already_computed_value.clone());
                }
            } else {
                // otherwise, mark this inst as already computed
                if let Some(result) = function.get_inst_result(inst) {
                    self.reduntant_map.insert(inst_operand_key, result);
                    added_to_reduntant_map_insts.insert(inst);
                }
            }
        }
    }
    fn dfs_visit_dom_tree_block(&mut self, block: Block, function: &mut Function, remove_insts: &mut Vec<Instruction>) {
        let mut inst_added_this_level = HashSet::new();
        for inst in function.get_insts_of_block(block) {
            let inst_data = function.get_inst_data_mut(inst);
            self.replace_inst_data_operands(inst_data);
            // Get immutable data after replacing operands, just make borrow checker happy
            let inst_data = function.get_inst_data(inst);
            self.remove_inst_if_redundant(function, inst, inst_data, remove_insts, &mut inst_added_this_level);
        }
        for dom_child in self
            .rpo
            .sort_blocks_in_rpo(self.dom.children(block).iter().map(|b| b.clone()).collect())
        {
            self.dfs_visit_dom_tree_block(dom_child, function, remove_insts);
        }
        for inst in inst_added_this_level {
            // if inst has been added to redundant map, it must have a inst operand key
            let key = function.get_inst_data(inst).to_inst_operand_key().unwrap();
            self.reduntant_map.remove(&key);
        }
    }
    fn remove_redundant_insts(&mut self, function: &mut Function, remove_insts: Vec<Instruction>) {
        for inst in remove_insts {
            function.remove_inst(inst);
        }
    }
}
