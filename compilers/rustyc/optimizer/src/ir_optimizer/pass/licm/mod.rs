mod debugger;
mod util;
use std::collections::HashSet;
use util::*;

use crate::ir::function::{BasicBlock, Function};
use crate::ir::instructions::{Instruction, InstructionData};
use crate::ir::value::Value;
use crate::ir_optimizer::anaylsis::domtree::DomTable;
use crate::ir_optimizer::anaylsis::use_def_chain::{DefKind, UseDefTable};
use crate::ir_optimizer::pass::OptimizerPass;

type Edge = (BasicBlock, BasicBlock);
#[derive(Debug, Clone, PartialEq)]
struct NaturalLoop {
    header: BasicBlock,
    tails: BasicBlock,
    exits: HashSet<BasicBlock>,
    blocks: HashSet<BasicBlock>,
}

/// ## Loop-Invariant-Code-Motion Pass
/// perform LICM. require dom table and use-def-table.
/// reference: https://www.cs.cmu.edu/afs/cs/academic/class/15745-s19/www/lectures/L9-LICM.pdf
pub struct LICMPass<'a> {
    // Use and Def Table
    use_def_table: &'a UseDefTable,
    // Dom Table
    dom_table: &'a DomTable,
    /// All natural loop in CFG.
    loops: Vec<NaturalLoop>,
    // Propagation Loop invariant.
    known_loop_invariants: HashSet<Value>,
}

impl<'a> OptimizerPass for LICMPass<'a> {
    fn process(&mut self, function: &mut Function) {
        self.build_natural_loop(function);
        let hoistable_insts = self.traversal_loop_to_find_hoistable_loop_invariant(function);
        self.motion_hoistable_loop_invarant(function, hoistable_insts);
    }
}

impl<'a> LICMPass<'a> {
    pub fn new(use_def_table: &'a UseDefTable, dom_table: &'a DomTable) -> Self {
        Self {
            use_def_table,
            dom_table,
            loops: Default::default(),
            known_loop_invariants: Default::default(),
        }
    }
    fn dfs_visit_to_find_backward_edges(
        &self,
        function: &Function,
        id: BasicBlock,
        visited_blocks: &mut HashSet<BasicBlock>,
        table: &mut HashSet<Edge>,
    ) {
        // debug
        debug_assert!(!visited_blocks.contains(&id));
        // visit block
        visited_blocks.insert(id);
        for successor in &function.blocks.get(&id).unwrap().successor {
            if visited_blocks.contains(successor) {
                table.insert((id, successor.clone()));
            } else {
                self.dfs_visit_to_find_backward_edges(function, successor.clone(), visited_blocks, table);
            }
        }
    }
    /// ## Fins Backward Edges
    /// Using simple dfs traversal to find the edge that revisit the visited block.
    /// please note that backward edge is construct as (tail, head).
    fn find_backward_edges(&self, function: &Function) -> HashSet<Edge> {
        let mut table: HashSet<Edge> = HashSet::new();
        self.dfs_visit_to_find_backward_edges(
            function,
            function.entry_block[0].clone(),
            &mut HashSet::new(),
            &mut table,
        );
        let mut backwared_edges: HashSet<Edge> = HashSet::new();
        for (tail, head) in table {
            if self.dom_table.get(&tail).unwrap().dom.contains(&head) {
                backwared_edges.insert((tail, head));
            }
        }
        backwared_edges
    }
    /// ## DSF Implementation of find Loop Blocks and Exits
    /// - return true if block can reach tail from head (one of path can reach tail from head).
    /// - return false if block absolutly can not reach tail from head.
    fn dfs_visit_to_find_loop_blocks(
        &self,
        function: &Function,
        last: &BasicBlock,
        current: &BasicBlock,
        tail: &BasicBlock,
        blocks: &mut HashSet<BasicBlock>,
        exits: &mut HashSet<BasicBlock>,
        visited_blocks: &mut HashSet<BasicBlock>,
    ) -> bool {
        if visited_blocks.contains(current) {
            return false;
        }
        blocks.insert(last.clone());
        visited_blocks.insert(current.clone());
        if current.0 == tail.0 {
            return true;
        }
        // PLEASE NOTE: reaching tail and exit loop is not a absolute complement event.
        let mut reach_tail = false;
        let mut can_exit_loop = false;
        for successor in &function.blocks.get(current).unwrap().successor {
            let can_successor_reach_tail =
                self.dfs_visit_to_find_loop_blocks(function, current, successor, tail, blocks, exits, visited_blocks);
            reach_tail = can_successor_reach_tail || reach_tail;
            can_exit_loop = !can_successor_reach_tail || can_exit_loop;
        }
        visited_blocks.remove(current);
        if !reach_tail {
            blocks.remove(last);
        }
        if can_exit_loop {
            exits.insert(current.clone());
        }
        return reach_tail;
    }

    /// ## Find Loop Blocks
    /// Using DSF traversal to find the blocks of loop and the exits of loop by
    /// the head and tail of block.
    fn find_loop_blocks(
        &self,
        function: &Function,
        head: &BasicBlock,
        tail: &BasicBlock,
    ) -> (HashSet<BasicBlock>, HashSet<BasicBlock>) {
        let mut blocks = HashSet::new();
        let mut exits = HashSet::new();
        for successor in &function.blocks.get(head).unwrap().successor {
            self.dfs_visit_to_find_loop_blocks(
                function,
                head,
                &successor,
                tail,
                &mut blocks,
                &mut exits,
                &mut HashSet::new(),
            );
        }
        return (blocks, exits);
    }
    /// ## Entry function to build natural loop
    pub fn build_natural_loop(&mut self, function: &Function) {
        let backwared_edges = self.find_backward_edges(function);
        for (tail, head) in backwared_edges {
            let (mut blocks, exits) = self.find_loop_blocks(function, &head, &tail);
            blocks.insert(tail.clone());
            self.loops.push(NaturalLoop {
                header: head,
                tails: tail,
                blocks,
                exits,
            });
        }
    }
    /// ## Helper Function: Is Instruction a loop invariant
    /// - return Some(value) if is loop invariant, value is LHS of inst.
    /// - return None, if inst is not loop invariant.
    fn is_loop_invatant(
        &self,
        inst: &Instruction,
        function: &Function,
        loop_blocks: &HashSet<BasicBlock>,
    ) -> Option<Value> {
        let inst_data = function.instructions.get(inst).unwrap();
        match get_rhs_values(inst_data) {
            // for side effect inst, can not hoist
            None => None,
            Some(rhs_values) => {
                let mut is_loop_invariant = true;
                for rhs_value in rhs_values {
                    let is_cur_rhs_value_def_out_of_loop = match self.use_def_table.1.get(&rhs_value) {
                        // for const, always loop invarant
                        None => true,
                        // for def, check is def out of loop
                        Some(cur_rhs_value_def) => match cur_rhs_value_def {
                            DefKind::InternalDef(def_inst) => {
                                let def_block = function.get_block_from_inst(def_inst).unwrap();
                                !loop_blocks.contains(def_block)
                            }
                            _ => true,
                        },
                    };
                    let is_cur_rhs_value_known_as_loop_invarant = self.known_loop_invariants.contains(&rhs_value);
                    let is_cur_rhs_value_loop_invarant =
                        is_cur_rhs_value_def_out_of_loop || is_cur_rhs_value_known_as_loop_invarant;
                    is_loop_invariant = is_loop_invariant && is_cur_rhs_value_loop_invarant;
                }
                if is_loop_invariant {
                    get_lhs_value(inst_data)
                } else {
                    None
                }
            }
        }
    }
    /// ## Helper Function: Is block of inst is dominate all exits of loop
    /// simple helper function for test condition for LICM.
    fn is_block_dominate_exits(&self, block: &BasicBlock, exits: &HashSet<BasicBlock>) -> bool {
        let mut is_dominate = true;
        for exit in exits {
            let dom_table = &self.dom_table.get(exit).unwrap().dom;
            is_dominate = is_dominate && dom_table.contains(block)
        }
        is_dominate
    }
    /// ## Find Code Motionable Loop Invariant
    /// perform standard LICM algorithm
    /// ```markdown
    /// for inst in natural-loop {
    ///    if (
    ///      defs of right-hand-side is outside of loop &&
    ///      block of inst is dominate all exits of loop
    ///    ) {
    ///      mark inst need to code motion;
    ///   }
    /// }
    /// ```
    fn traversal_loop_to_find_hoistable_loop_invariant(&mut self, function: &Function) -> Vec<(Instruction, usize)> {
        let mut need_to_code_motion = Vec::new();
        let mut index = 0 as usize;
        for natural_loop in &self.loops {
            for block in &natural_loop.blocks {
                for inst in &function.blocks.get(block).unwrap().instructions {
                    let is_loop_invariant = match self.is_loop_invatant(inst, function, &natural_loop.blocks) {
                        Some(val) => {
                            self.known_loop_invariants.insert(val);
                            true
                        }
                        None => false,
                    };
                    if is_loop_invariant
                        && self
                            .is_block_dominate_exits(function.get_block_from_inst(inst).unwrap(), &natural_loop.exits)
                    {
                        need_to_code_motion.push((inst.clone(), index));
                    }
                }
            }
            index += 1;
        }
        need_to_code_motion
    }
    /// ## Entry function to motion the Loop invariant
    fn motion_hoistable_loop_invarant(&self, function: &mut Function, inst_and_loop_indexs: Vec<(Instruction, usize)>) {
        for (inst, index) in inst_and_loop_indexs {
            let natural_loop = &self.loops[index];
            let preheader_block = function.create_block();
            function.connect_block(preheader_block, natural_loop.header);
            for header_predecessor in function.blocks.get(&natural_loop.header).unwrap().predecessor.clone() {
                function.connect_block(header_predecessor, preheader_block);
                self.rewrite_branch_target_of_header(
                    function,
                    &header_predecessor,
                    &preheader_block,
                    &natural_loop.header,
                );
            }
            let inst_data = function.instructions.get(&inst).unwrap().clone();
            function.insert_inst_to_block_front(&preheader_block, inst_data);
            function.remove_inst_from_block(&natural_loop.header, &inst);
            function.switch_to_block(preheader_block);
            function.build_jump_inst(natural_loop.header);
        }
    }
    /// ## Helper function to connect predesucceeor of header to preheader
    /// since we will change the connection of predecessir of header to preheader, we also
    /// need to rewrite the branch target of jump and branch instruction of header to preheader.
    fn rewrite_branch_target_of_header(
        &self,
        function: &mut Function,
        predesuccessor_block: &BasicBlock,
        preheader_block: &BasicBlock,
        header_block: &BasicBlock,
    ) {
        for inst in &function.blocks.get(predesuccessor_block).unwrap().instructions {
            match function.instructions.get_mut(inst).unwrap() {
                InstructionData::Jump { dst, .. } => {
                    *dst = preheader_block.clone();
                }
                InstructionData::BrIf { conseq, alter, .. } => {
                    if conseq.0 == header_block.0 {
                        *conseq = preheader_block.clone();
                    }
                    if alter.0 == header_block.0 {
                        *alter = preheader_block.clone();
                    }
                }
                _ => {}
            }
        }
    }
}
