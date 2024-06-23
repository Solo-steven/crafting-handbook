use crate::ir::function::{BasicBlock, Function};
use crate::ir::instructions::{CmpFlag, Instruction, InstructionData, OpCode};
use crate::ir::module::get_text_format_of_value;
use crate::ir::value::Value;
use crate::ir_optimizer::anaylsis::dfs_ordering::DFSOrdering;
use std::collections::{HashMap, HashSet};

use crate::ir_optimizer::anaylsis::domtree::DomTable;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum RightHandSideInst {
    Binary((Value, Value, OpCode)),
    Unary((Value, OpCode)),
    Cmp((Value, Value, CmpFlag)),
}

impl RightHandSideInst {
    pub fn get_value_ref(&self) -> Vec<&Value> {
        match self {
            RightHandSideInst::Binary((src1, src2, _))
            | RightHandSideInst::Cmp((src1, src2, _)) => {
                vec![src1, src2]
            }
            RightHandSideInst::Unary((src, _)) => {
                vec![src]
            }
        }
    }
}
/// ## Right-Hand-Side-Expression Inst
/// Right hand side expression instruction set is used to storage
/// hash of right hand side expression.
pub type RightHandSideInstructionSet = HashSet<RightHandSideInst>;
/// ## Struct of Lazy code motion
pub struct LazyCodeMotionPass {
    // use and kill expression set
    pub expression_use: HashMap<BasicBlock, RightHandSideInstructionSet>,
    pub expression_kill: HashMap<BasicBlock, HashSet<Value>>,
    // data flow result set
    pub anticipate_in: HashMap<BasicBlock, RightHandSideInstructionSet>,
    pub anticipate_out: HashMap<BasicBlock, RightHandSideInstructionSet>,
    pub available_in: HashMap<BasicBlock, RightHandSideInstructionSet>,
    pub available_out: HashMap<BasicBlock, RightHandSideInstructionSet>,
    pub earliest: HashMap<BasicBlock, RightHandSideInstructionSet>,
    pub postponable_in: HashMap<BasicBlock, RightHandSideInstructionSet>,
    pub postponable_out: HashMap<BasicBlock, RightHandSideInstructionSet>,
    pub lastest: HashMap<BasicBlock, RightHandSideInstructionSet>,
    pub live_expr_in: HashMap<BasicBlock, RightHandSideInstructionSet>,
    pub live_expr_out: HashMap<BasicBlock, RightHandSideInstructionSet>,
    // ordering
    pub dfs_order: Vec<BasicBlock>,
    pub reverse_dfs_order: Vec<BasicBlock>,
}

impl Default for LazyCodeMotionPass {
    fn default() -> Self {
        LazyCodeMotionPass::new()
    }
}

impl LazyCodeMotionPass {
    pub fn new() -> Self {
        Self {
            expression_use: HashMap::new(),
            expression_kill: HashMap::new(),

            anticipate_in: HashMap::new(),
            anticipate_out: HashMap::new(),
            available_in: HashMap::new(),
            available_out: HashMap::new(),
            postponable_in: HashMap::new(),
            postponable_out: HashMap::new(),
            live_expr_in: HashMap::new(),
            live_expr_out: HashMap::new(),
            earliest: HashMap::new(),
            lastest: HashMap::new(),

            dfs_order: Vec::new(),
            reverse_dfs_order: Vec::new(),
        }
    }
    pub fn process(&mut self, function: &mut Function, dom_table: &DomTable) {
        let mut dfs_pass = DFSOrdering::new();
        let mut ordering = dfs_pass.get_order(function.entry_block[0].clone(), &function.blocks);
        self.dfs_order = ordering.clone();
        ordering.reverse();
        self.reverse_dfs_order = ordering;

        self.pass_get_kill_use_set(function);
        self.pass_anticipate_expression(function);
        self.pass_available_expression(function);
        self.pass_earliest();
        self.pass_postponable(function);
        self.pass_lastest(function);
        self.pass_live_expr(function);

        self.pass_ssa_rewrite(function, dom_table)
    }
    fn get_right_hand_side_inst_key(
        &self,
        instruction: &InstructionData,
    ) -> (Option<RightHandSideInst>, Option<Value>) {
        match instruction {
            InstructionData::Add {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::Sub {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::Mul {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::Divide {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::Reminder {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::FAdd {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::FSub {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::FMul {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::FDivide {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::FReminder {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::BitwiseAnd {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::BitwiseOR {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::LogicalAnd {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::LogicalOR {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::ShiftLeft {
                opcode,
                src1,
                src2,
                dst,
            }
            | InstructionData::ShiftRight {
                opcode,
                src1,
                src2,
                dst,
            } => (
                Some(RightHandSideInst::Binary((
                    src1.clone(),
                    src2.clone(),
                    opcode.clone(),
                ))),
                Some(dst.clone()),
            ),
            InstructionData::Neg { opcode, src, dst }
            | InstructionData::BitwiseNot { opcode, src, dst }
            | InstructionData::LogicalNot { opcode, src, dst }
            | InstructionData::ToU8 { opcode, src, dst }
            | InstructionData::ToU16 { opcode, src, dst }
            | InstructionData::ToU32 { opcode, src, dst }
            | InstructionData::ToU64 { opcode, src, dst }
            | InstructionData::ToI16 { opcode, src, dst }
            | InstructionData::ToI32 { opcode, src, dst }
            | InstructionData::ToI64 { opcode, src, dst }
            | InstructionData::ToF32 { opcode, src, dst }
            | InstructionData::ToF64 { opcode, src, dst }
            | InstructionData::ToAddress { opcode, src, dst } => (
                Some(RightHandSideInst::Unary((src.clone(), opcode.clone()))),
                Some(dst.clone()),
            ),
            InstructionData::Icmp {
                opcode: _,
                flag,
                src1,
                src2,
                dst,
            }
            | InstructionData::Fcmp {
                opcode: _,
                flag,
                src1,
                src2,
                dst,
            } => (
                Some(RightHandSideInst::Cmp((
                    src1.clone(),
                    src2.clone(),
                    flag.clone(),
                ))),
                Some(dst.clone()),
            ),
            InstructionData::Move { dst, .. }
            | InstructionData::Phi { dst, .. }
            | InstructionData::LoadRegister { dst, .. } => (None, Some(dst.clone())),
            _ => (None, None),
        }
    }
    fn get_all_right_hand_expr_set(&self, function: &Function) -> RightHandSideInstructionSet {
        let mut set = HashSet::new();
        for (_, data) in &function.instructions {
            let tuple = self.get_right_hand_side_inst_key(data);
            if let Some(key) = tuple.0 {
                set.insert(key);
            };
        }
        set
    }
    /// ## Compute use and kill expression
    /// Use expression is a expression is right hand
    fn pass_get_kill_use_set(&mut self, function: &Function) {
        for (block_id, block_data) in &function.blocks {
            let mut expr_use_set = HashSet::new();
            let mut expr_kill_set = HashSet::new();

            for inst in &block_data.instructions {
                let inst_data = function.instructions.get(inst).unwrap();
                match self.get_right_hand_side_inst_key(inst_data) {
                    (Some(key), Some(value)) => {
                        expr_use_set.insert(key);
                        expr_kill_set.insert(value);
                    }
                    (Some(key), None) => {
                        expr_use_set.insert(key);
                    }
                    (None, Some(value)) => {
                        expr_kill_set.insert(value);
                    }
                    (None, None) => {}
                }
            }
            self.expression_use.insert(block_id.clone(), expr_use_set);
            self.expression_kill.insert(block_id.clone(), expr_kill_set);
        }
    }
    /// ## Compute anticipate expression of each basic block.
    /// A expression e is anticipate at the program point p if and only if there is a path from p to some
    /// point a that use expression e before any re-define argument of expression e.
    fn pass_anticipate_expression(&mut self, function: &Function) {
        // init set
        for (block_id, _) in &function.blocks {
            let init_set = self.get_all_right_hand_expr_set(function);
            self.anticipate_in.insert(block_id.clone(), init_set);
        }
        for block_id in &function.exit_block {
            self.anticipate_in.insert(block_id.clone(), HashSet::new());
        }
        // backward data flow iter algorithm
        let mut change = true;
        while change {
            change = false;
            // for every block, get out-set from predecessor's in-set.
            // then get in-set from self-compute
            for block_id in &self.reverse_dfs_order {
                let block_data = function.blocks.get(block_id).unwrap();
                // Get out set from intersection of suceesor's in-set
                let next_anticipate_out = {
                    let mut index = 0;
                    let mut next_set = HashSet::new();
                    for sucessor_id in &block_data.successor {
                        if index == 0 {
                            next_set = self.anticipate_in.get(sucessor_id).unwrap().clone();
                        } else {
                            next_set.retain(|key| {
                                self.anticipate_in.get(sucessor_id).unwrap().contains(key)
                            })
                        }
                        index += 1;
                    }
                    next_set
                };
                // Get in-set from transfer function
                // remove expr which value in kill set,
                // then union the use set.
                self.anticipate_out
                    .insert(block_id.clone(), next_anticipate_out);
                let next_anticipate_in = {
                    let mut next_set = self.anticipate_out.get(block_id).unwrap().clone();
                    let kill_set = self.expression_kill.get(block_id).unwrap();
                    next_set.retain(|key| {
                        let values = key.get_value_ref();
                        for val in values {
                            if kill_set.contains(val) {
                                return false;
                            }
                        }
                        return true;
                    });
                    let use_set = self.expression_use.get(block_id).unwrap().clone();
                    next_set.extend(use_set.into_iter());
                    next_set
                };
                let existed_anticipate_in = self.anticipate_in.get(block_id).unwrap();
                if *existed_anticipate_in != next_anticipate_in {
                    change = true;
                    self.anticipate_in
                        .insert(block_id.clone(), next_anticipate_in);
                }
            }
        }
    }
    /// ## Compute available expression
    /// A expression e is available is
    fn pass_available_expression(&mut self, function: &Function) {
        // init as forward data flow anaylsis
        for (block_id, _) in &function.blocks {
            let init_set = self.get_all_right_hand_expr_set(function);
            self.available_out.insert(block_id.clone(), init_set);
        }
        for block_id in &function.entry_block {
            self.available_out.insert(block_id.clone(), HashSet::new());
        }
        // forward data flow iter algorithm
        let mut change = true;
        while change {
            change = false;
            // for every block
            for block_id in &self.dfs_order {
                let block_data = function.blocks.get(block_id).unwrap();
                let next_available_in = {
                    let mut index = 0;
                    let mut next_set = HashSet::new();
                    for predecessor_id in &block_data.predecessor {
                        let predecessor_out_set = self.available_out.get(predecessor_id).unwrap();
                        if index == 0 {
                            next_set = predecessor_out_set.clone();
                        } else {
                            next_set.retain(|key| predecessor_out_set.contains(key))
                        }
                        index += 1;
                    }
                    next_set
                };
                self.available_in
                    .insert(block_id.clone(), next_available_in);
                let next_available_out = {
                    let mut out_set = self.available_in.get(block_id).unwrap().clone();
                    let kill_set = self.expression_kill.get(block_id).unwrap();
                    let anticipate_in = self.anticipate_in.get(block_id).unwrap();
                    out_set.retain(|key| {
                        let values = key.get_value_ref();
                        for val in values {
                            if kill_set.contains(val) {
                                return false;
                            };
                        }
                        return true;
                    });
                    'out: for inst in anticipate_in {
                        let values = inst.get_value_ref();
                        for val in values {
                            if kill_set.contains(val) {
                                continue 'out;
                            };
                        }
                        out_set.insert(inst.clone());
                    }
                    out_set
                };
                let exised_avaiable_out = self.available_out.get(block_id).unwrap();
                if next_available_out != *exised_avaiable_out {
                    change = true;
                    self.available_out
                        .insert(block_id.clone(), next_available_out);
                }
            }
        }
    }
    fn pass_earliest(&mut self) {
        for (block_id, mut anticipate_set) in self.anticipate_in.clone() {
            let aviailable = self.available_in.get(&block_id).unwrap();
            anticipate_set.retain(|inst| aviailable.contains(inst));
            self.earliest.insert(block_id, anticipate_set);
        }
    }
    fn pass_postponable(&mut self, function: &Function) {
        // init as forward data flow anaylsis
        for (block_id, _) in &function.blocks {
            let init_set = self.get_all_right_hand_expr_set(function);
            self.postponable_out.insert(block_id.clone(), init_set);
        }
        for block_id in &function.entry_block {
            self.postponable_out
                .insert(block_id.clone(), HashSet::new());
        }
        // forward data flow iter algorithm
        let mut change = true;
        while change {
            change = false;
            // for every block
            for block_id in &self.dfs_order {
                let block_data = function.blocks.get(block_id).unwrap();
                let next_postponable_in = {
                    let mut index = 0;
                    let mut next_set = HashSet::new();
                    for predecessor_id in &block_data.predecessor {
                        let predecessor_out_set = self.postponable_out.get(predecessor_id).unwrap();
                        if index == 0 {
                            next_set = predecessor_out_set.clone();
                        } else {
                            next_set.retain(|key| predecessor_out_set.contains(key))
                        }
                        index += 1;
                    }
                    next_set
                };
                self.postponable_in
                    .insert(block_id.clone(), next_postponable_in);
                let next_postponable_out = {
                    let mut out_set = self.postponable_in.get(block_id).unwrap().clone();
                    out_set.extend(self.earliest.get(block_id).unwrap().clone().into_iter());
                    let use_set = self.expression_use.get(block_id).unwrap();
                    out_set.retain(|key| !use_set.contains(key));
                    out_set
                };
                let exised_postponable_out = self.postponable_out.get(block_id).unwrap();
                if next_postponable_out != *exised_postponable_out {
                    change = true;
                    self.postponable_out
                        .insert(block_id.clone(), next_postponable_out);
                }
            }
        }
    }
    fn pass_lastest(&mut self, function: &Function) {
        for (block_id, block_data) in &function.blocks {
            // base case, earlest or postponable
            let mut base = HashSet::new();
            base.extend(self.earliest.get(block_id).unwrap().clone().into_iter());
            base.extend(
                self.postponable_in
                    .get(block_id)
                    .unwrap()
                    .clone()
                    .into_iter(),
            );
            let mut other_base = base.clone();
            // use expression
            let use_expr = self.expression_use.get(block_id).unwrap();
            base.retain(|inst| use_expr.contains(inst));
            // sucessor candi
            let mut sucessor_candi = HashSet::new();
            for sucessor_id in &block_data.successor {
                sucessor_candi.extend(self.earliest.get(sucessor_id).unwrap().clone().into_iter());
                sucessor_candi.extend(
                    self.postponable_in
                        .get(sucessor_id)
                        .unwrap()
                        .clone()
                        .into_iter(),
                );
            }
            other_base.retain(|key| !sucessor_candi.contains(key));
            base.extend(other_base.into_iter());
            self.lastest.insert(block_id.clone(), base);
        }
    }
    fn pass_live_expr(&mut self, function: &Function) {
        // init in-set
        for (block_id, _) in &function.blocks {
            self.live_expr_in
                .insert(block_id.clone(), Default::default());
        }
        let mut change = true;
        while change {
            change = false;
            for block_id in &self.reverse_dfs_order {
                let block_data = function.blocks.get(block_id).unwrap();
                let next_live_expr_out = {
                    let mut next_set = HashSet::new();
                    let mut index = 0;
                    for sucessor_id in &block_data.successor {
                        let sucessor_live_expr_in = self.live_expr_in.get(sucessor_id).unwrap();
                        if index == 0 {
                            next_set = sucessor_live_expr_in.clone();
                        } else {
                            next_set.extend(sucessor_live_expr_in.clone().into_iter());
                        }
                        index += 1;
                    }
                    next_set
                };
                self.live_expr_out
                    .insert(block_id.clone(), next_live_expr_out);
                let next_live_expr_in = {
                    let mut next_set = self.live_expr_out.get(block_id).unwrap().clone();
                    let use_set = self.expression_use.get(block_id).unwrap().clone();
                    next_set.extend(use_set.into_iter());
                    let lastest = self.lastest.get(block_id).unwrap();
                    next_set.retain(|key| !lastest.contains(key));
                    next_set
                };
                let existed_live_expr_in = self.live_expr_in.get(block_id).unwrap();
                if next_live_expr_in != *existed_live_expr_in {
                    change = true;
                    self.live_expr_in
                        .insert(block_id.clone(), next_live_expr_in);
                }
            }
        }
    }
    fn pass_ssa_rewrite(&self, function: &mut Function, dom_table: &DomTable) {
        let replace_key = self.pass_ssa_rewrite_find_all_replaceable_key(function);
        let mut visited_key = HashSet::new();
        for (inst, inst_data, key, dst) in replace_key {
            if visited_key.contains(&key) {
                continue;
            }
            let (record_phis, record_new_insts) = self
                .pass_ssa_rewrite_motion_inst_and_insert_phi_of_key(
                    function, dom_table, &key, &dst, &inst, &inst_data,
                );
            self.pass_ssa_rewrite_rename_other_inst_of_key(
                function.entry_block[0].clone(),
                function,
                &key,
                &record_new_insts,
                &record_phis,
                &mut Vec::new(),
                &mut HashSet::new(),
            );
            visited_key.insert(key);
        }
    }
    fn pass_ssa_rewrite_find_all_replaceable_key(
        &self,
        function: &Function,
    ) -> Vec<(Instruction, InstructionData, RightHandSideInst, Value)> {
        let mut replaceable_key = Vec::new();
        for (inst, inst_data) in &function.instructions {
            match self.get_right_hand_side_inst_key(&inst_data) {
                (Some(key), Some(dst)) => {
                    replaceable_key.push((inst.clone(), inst_data.clone(), key, dst));
                }
                _ => {}
            }
        }
        replaceable_key
    }
    fn pass_ssa_rewrite_motion_inst_and_insert_phi_of_key(
        &self,
        function: &mut Function,
        dom_table: &DomTable,
        key: &RightHandSideInst,
        dst: &Value,
        inst: &Instruction,
        inst_data: &InstructionData,
    ) -> (HashSet<Instruction>, HashSet<Instruction>) {
        let mut record_phi = HashSet::new();
        let mut record_new_inst = HashSet::new();
        let mut motion_vec = Vec::new();
        let mut rewrite_to_copy_vec = Vec::new();
        let mut to_be_insert_phis = HashMap::new();
        for (block_id, _) in &function.blocks {
            // If block is a lasest and live out contain a expression e
            let lastest = self.lastest.get(block_id).unwrap();
            let live_expr_out = self.live_expr_out.get(block_id).unwrap();
            if lastest.contains(&key) && live_expr_out.contains(&key) {
                // change inst to copy and motion inst to front of block
                let data_type = function
                    .value_types
                    .get(&helper_get_dst_of_inst(inst_data))
                    .unwrap()
                    .clone();
                motion_vec.push((block_id.clone(), inst_data.clone(), data_type));
                rewrite_to_copy_vec.push(inst.clone());
                // insert phi into domfrotier and record it
                for df_block in &dom_table.get(block_id).unwrap().dom_frontier {
                    let data_type = function.value_types.get(dst).unwrap();
                    to_be_insert_phis.insert(df_block.clone(), data_type.clone());
                }
            }
        }
        let mut map_dst_value: Vec<Value> = Vec::new();
        for (block_id, mut motion_inst_data, data_type) in motion_vec {
            let new_dst = function.add_register(data_type);
            helper_rewrite_inst_dst(&mut motion_inst_data, new_dst);
            let new_inst = function.insert_inst_to_block_front(&block_id, motion_inst_data);
            let new_inst_data = function.instructions.get(&new_inst).unwrap();
            record_new_inst.insert(new_inst);
            map_dst_value.push(helper_get_dst_of_inst(new_inst_data));
        }
        let mut index = 0;
        for inst_id in rewrite_to_copy_vec {
            let data = function.instructions.get_mut(&inst_id).unwrap();
            let dst = helper_get_dst_of_inst(data);
            *data = InstructionData::Move {
                opcode: OpCode::Mov,
                src: map_dst_value[index],
                dst,
            };
            index += 1;
        }
        for (block_id, data_type) in to_be_insert_phis {
            let new_dst = function.add_register(data_type);
            let phi_data = InstructionData::Phi {
                opcode: OpCode::Phi,
                dst: new_dst,
                from: Vec::new(),
            };
            let phi_inst = function.insert_inst_to_block_front(&block_id, phi_data);
            record_phi.insert(phi_inst);
        }
        (record_phi, record_new_inst)
    }
    fn pass_ssa_rewrite_rename_other_inst_of_key(
        &self,
        block_id: BasicBlock,
        function: &mut Function,
        target_key: &RightHandSideInst,
        record_new_insts: &HashSet<Instruction>,
        record_phis: &HashSet<Instruction>,
        stack: &mut Vec<(BasicBlock, Value)>,
        mark: &mut HashSet<BasicBlock>,
    ) {
        for inst in &function.blocks.get(&block_id).unwrap().instructions {
            let data = function.instructions.get_mut(inst).unwrap();
            if let InstructionData::Phi { from, .. } = data {
                from.push(stack.last().unwrap().clone());
            }
        }
        if mark.contains(&block_id) {
            return;
        }
        mark.insert(block_id.clone());
        let mut count = 0;
        for inst in &function.blocks.get(&block_id).unwrap().instructions {
            let data = function.instructions.get_mut(inst).unwrap();
            match data {
                InstructionData::Phi { dst, .. } => {
                    if record_phis.contains(inst) {
                        stack.push((block_id.clone(), dst.clone()));
                        count += 1;
                    };
                }
                _ => match self.get_right_hand_side_inst_key(data) {
                    (Some(inst_key), _) => {
                        if inst_key == *target_key {
                            if record_new_insts.contains(inst) {
                                stack.push((block_id.clone(), helper_get_dst_of_inst(data)));
                                count += 1;
                            } else {
                                let origin_dst = helper_get_dst_of_inst(&data);
                                let new_src = stack.last().unwrap().1;
                                *data = InstructionData::Move {
                                    opcode: OpCode::Mov,
                                    src: new_src,
                                    dst: origin_dst,
                                }
                            }
                        }
                    }
                    _ => {}
                },
            }
        }
        for sucessor_id in function.blocks.get(&block_id).unwrap().successor.clone() {
            self.pass_ssa_rewrite_rename_other_inst_of_key(
                sucessor_id,
                function,
                target_key,
                record_new_insts,
                record_phis,
                stack,
                mark,
            );
        }
        for _i in 0..count {
            stack.pop();
        }
    }
}
fn helper_get_dst_of_inst(inst_data: &InstructionData) -> Value {
    match inst_data {
        InstructionData::Add { dst, .. }
        | InstructionData::Sub { dst, .. }
        | InstructionData::Mul { dst, .. }
        | InstructionData::Divide { dst, .. }
        | InstructionData::Reminder { dst, .. }
        | InstructionData::FAdd { dst, .. }
        | InstructionData::FSub { dst, .. }
        | InstructionData::FMul { dst, .. }
        | InstructionData::FDivide { dst, .. }
        | InstructionData::FReminder { dst, .. }
        | InstructionData::BitwiseAnd { dst, .. }
        | InstructionData::BitwiseOR { dst, .. }
        | InstructionData::LogicalAnd { dst, .. }
        | InstructionData::LogicalOR { dst, .. }
        | InstructionData::ShiftLeft { dst, .. }
        | InstructionData::ShiftRight { dst, .. }
        | InstructionData::Neg { dst, .. }
        | InstructionData::BitwiseNot { dst, .. }
        | InstructionData::LogicalNot { dst, .. }
        | InstructionData::ToU8 { dst, .. }
        | InstructionData::ToU16 { dst, .. }
        | InstructionData::ToU32 { dst, .. }
        | InstructionData::ToU64 { dst, .. }
        | InstructionData::ToI16 { dst, .. }
        | InstructionData::ToI32 { dst, .. }
        | InstructionData::ToI64 { dst, .. }
        | InstructionData::ToF32 { dst, .. }
        | InstructionData::ToF64 { dst, .. }
        | InstructionData::ToAddress { dst, .. }
        | InstructionData::Icmp { dst, .. }
        | InstructionData::Fcmp { dst, .. }
        | InstructionData::Move { dst, .. }
        | InstructionData::Phi { dst, .. }
        | InstructionData::LoadRegister { dst, .. } => dst.clone(),
        _ => panic!(),
    }
}
fn helper_rewrite_inst_dst(inst_data: &mut InstructionData, new_dst: Value) {
    match inst_data {
        InstructionData::Add { dst, .. }
        | InstructionData::Sub { dst, .. }
        | InstructionData::Mul { dst, .. }
        | InstructionData::Divide { dst, .. }
        | InstructionData::Reminder { dst, .. }
        | InstructionData::FAdd { dst, .. }
        | InstructionData::FSub { dst, .. }
        | InstructionData::FMul { dst, .. }
        | InstructionData::FDivide { dst, .. }
        | InstructionData::FReminder { dst, .. }
        | InstructionData::BitwiseAnd { dst, .. }
        | InstructionData::BitwiseOR { dst, .. }
        | InstructionData::LogicalAnd { dst, .. }
        | InstructionData::LogicalOR { dst, .. }
        | InstructionData::ShiftLeft { dst, .. }
        | InstructionData::ShiftRight { dst, .. }
        | InstructionData::Neg { dst, .. }
        | InstructionData::BitwiseNot { dst, .. }
        | InstructionData::LogicalNot { dst, .. }
        | InstructionData::ToU8 { dst, .. }
        | InstructionData::ToU16 { dst, .. }
        | InstructionData::ToU32 { dst, .. }
        | InstructionData::ToU64 { dst, .. }
        | InstructionData::ToI16 { dst, .. }
        | InstructionData::ToI32 { dst, .. }
        | InstructionData::ToI64 { dst, .. }
        | InstructionData::ToF32 { dst, .. }
        | InstructionData::ToF64 { dst, .. }
        | InstructionData::ToAddress { dst, .. }
        | InstructionData::Icmp { dst, .. }
        | InstructionData::Fcmp { dst, .. }
        | InstructionData::Move { dst, .. }
        | InstructionData::Phi { dst, .. }
        | InstructionData::LoadRegister { dst, .. } => *dst = new_dst,
        _ => panic!(),
    }
}
/// Print all set table of lazy code motion, need function as argument to get the
/// instruction data.
pub fn print_lazy_code_motion_table(pass: &LazyCodeMotionPass, function: &Function) {
    fn get_length_of_find_longest_set(sets: Vec<&RightHandSideInstructionSet>) -> usize {
        let mut max_size = 0;
        for set in sets {
            if set.len() > max_size {
                max_size = set.len();
            }
        }
        max_size
    }
    fn get_text_format_of_operator(opcode: &OpCode) -> &'static str {
        match opcode {
            OpCode::Add | OpCode::FAdd => "+",
            OpCode::Divide | OpCode::FDivide => "/",
            OpCode::Sub | OpCode::FSub | OpCode::Neg => "-",
            OpCode::Mul | OpCode::FMul => "*",
            OpCode::Reminder | OpCode::FReminder => "%",
            OpCode::BitwiseAnd => "&",
            OpCode::BitwiseNot => "~",
            OpCode::BitwiseOR => "|",
            OpCode::LogicalAnd => "&&",
            OpCode::LogicalNot => "!",
            OpCode::LogicalOR => "||",
            _ => panic!(),
        }
    }
    fn get_inst_string(instruction_key: &RightHandSideInst, function: &Function) -> String {
        match instruction_key {
            RightHandSideInst::Binary((src1, src2, opcode)) => {
                let src1_string = get_text_format_of_value(function.values.get(src1).unwrap());
                let src2_string = get_text_format_of_value(function.values.get(src2).unwrap());
                let op_string = get_text_format_of_operator(opcode);
                format!("{} {} {}", src1_string, op_string, src2_string)
            }
            RightHandSideInst::Unary((src, opcode)) => {
                let src_string = get_text_format_of_value(function.values.get(src).unwrap());
                let op_string = get_text_format_of_operator(opcode);
                format!(" {} {} ", op_string, src_string)
            }
            RightHandSideInst::Cmp((src1, src2, _cmp_flag)) => {
                let src1_string = get_text_format_of_value(function.values.get(src1).unwrap());
                let src2_string = get_text_format_of_value(function.values.get(src2).unwrap());
                format!("{} {}", src1_string, src2_string)
            }
        }
    }
    fn print_right_hand_side_exprs_table(
        table: &HashMap<BasicBlock, RightHandSideInstructionSet>,
        function: &Function,
    ) {
        let max_len = get_length_of_find_longest_set(table.values().collect());
        let mut inst_vec = vec![vec![String::from("       "); table.len()]; max_len];
        for (block_id, exprs) in table {
            let col_index = block_id.0 - 1;
            let mut row_index = 0;
            for right_hand_expr in exprs {
                inst_vec[row_index][col_index] = get_inst_string(right_hand_expr, function);
                row_index += 1;
            }
        }
        let mut block_id_string = String::new();
        for id in 0..function.blocks.len() {
            block_id_string.push_str(format!("|   {}   ", id).as_str())
        }
        block_id_string.push_str("|");
        let mut start_string = vec!["--------"; table.len()].join("");
        start_string.push_str("-");
        println!("{}", start_string);
        println!("{}", block_id_string);
        println!("{}", start_string);
        for vec_string in inst_vec {
            print!("|");
            for string in vec_string {
                print!("{}", string);
                print!("|");
            }
            println!("");
        }
        println!("{}", start_string);
    }
    print_right_hand_side_exprs_table(&pass.expression_use, function);
    print_right_hand_side_exprs_table(&pass.anticipate_in, function);
    print_right_hand_side_exprs_table(&pass.anticipate_out, function);
    print_right_hand_side_exprs_table(&pass.available_in, function);
    print_right_hand_side_exprs_table(&pass.available_out, function);
    print_right_hand_side_exprs_table(&pass.earliest, function);
    print_right_hand_side_exprs_table(&pass.postponable_in, function);
    print_right_hand_side_exprs_table(&pass.postponable_out, function);
    print_right_hand_side_exprs_table(&pass.lastest, function);
    print_right_hand_side_exprs_table(&pass.live_expr_in, function);
    print_right_hand_side_exprs_table(&pass.live_expr_out, function);
}
