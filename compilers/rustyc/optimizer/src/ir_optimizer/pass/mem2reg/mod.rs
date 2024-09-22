use std::collections::HashSet;

use crate::ir::function::*;
use crate::ir::instructions::*;
use crate::ir::value::*;
use crate::ir_optimizer::anaylsis::domtree::*;
use crate::ir_optimizer::anaylsis::use_def_chain::*;
use crate::ir_optimizer::pass::OptimizerPass;
/// Struct for mem2reg pass.
pub struct Mem2RegPass<'a> {
    use_def_table: &'a UseDefTable,
    dom_table: &'a DomTable,
}

impl<'a> OptimizerPass for Mem2RegPass<'a> {
    /// Mutate the function and promte the usage of memory to just register.
    fn process(&mut self, function: &mut Function) {
        // find all alloc pointer
        let alloc_pointers_and_bb_ids = self.find_all_alloc_inst_from_entry_block(function);
        // insert phi is df of store inst of alloc use.
        for (alloc_pointer, inst_id, bb_id) in &alloc_pointers_and_bb_ids {
            let use_table = &self.use_def_table.0;
            let use_set = use_table.get(alloc_pointer).unwrap();
            // if have pointer access, skip
            let mut is_pointer_access = false;
            for use_inst_id in use_set {
                let inst = function.instructions.get(use_inst_id).unwrap();
                if let InstructionData::StoreRegister { src, .. } = inst {
                    if src == alloc_pointer {
                        is_pointer_access = true;
                    }
                }
            }
            if is_pointer_access {
                continue;
            }
            // if in same block, just perform a simple walk
            if self.is_use_in_same_block(function, bb_id, use_set) {
                if !self.simple_traversal_for_same_block(function, bb_id, use_set) {
                    function.remove_inst_from_block(bb_id, &inst_id);
                }
            } else {
                // if there is no pointer access and use is in multiple block, perform ssa construct algorithm for phi inst.
                let rename_phis =
                    self.insert_phi_node_in_df_of_store_inst(alloc_pointer, function, use_table);
                if !self.rename_load_and_store_inst(
                    bb_id.clone(),
                    function,
                    &rename_phis,
                    use_set,
                    &mut Vec::new(),
                    &mut HashSet::new(),
                ) {
                    function.remove_inst_from_block(bb_id, &inst_id);
                }
            }
        }
    }
}

impl<'a> Mem2RegPass<'a> {
    /// Create a new instance to performan mem2reg.
    pub fn new(use_def_table: &'a UseDefTable, dom_table: &'a DomTable) -> Self {
        Self {
            use_def_table,
            dom_table,
        }
    }
    /// check is all use of alloc pointer in a same block or not
    fn is_use_in_same_block(
        &mut self,
        function: &Function,
        alloc_block: &BasicBlock,
        use_set: &HashSet<Instruction>,
    ) -> bool {
        for inst in use_set {
            if function.get_block_from_inst(inst).unwrap() != alloc_block {
                return false;
            }
        }
        true
    }
    /// perform simple iterative walk though to a basic block when every use of alloc pointer is in same block.
    /// return value indict is this alloc pointer have use before def.
    fn simple_traversal_for_same_block(
        &mut self,
        function: &mut Function,
        block_id: &BasicBlock,
        use_set: &HashSet<Instruction>,
    ) -> bool {
        let mut remove_insts = Vec::new();
        let mut change_to_mov_insts = Vec::new();
        let mut stack: Vec<Value> = Vec::new();
        let mut uninit_variable = false;
        let mut index = 0;
        for inst in &function.blocks.get(block_id).unwrap().instructions {
            if use_set.contains(inst) {
                match function.instructions.get(inst).unwrap() {
                    InstructionData::LoadRegister { dst, .. } => {
                        // if there is no assignment value before use. we can not replace the value.
                        if let Some(new_src) = stack.last() {
                            change_to_mov_insts.push((inst.clone(), dst.clone(), new_src.clone()));
                            if index == 0 {
                                uninit_variable = true;
                            }
                        }
                    }
                    InstructionData::StoreRegister { src, .. } => {
                        stack.push(src.clone());
                        remove_insts.push(inst.clone());
                    }
                    InstructionData::Phi {
                        opcode: _,
                        dst,
                        from: _1,
                    } => {
                        stack.push(dst.clone());
                    }
                    _ => {}
                }
            }
            index += 1;
        }
        // remove all store instruction
        for remove_inst in remove_insts {
            function.remove_inst_from_block(&block_id, &remove_inst);
        }
        // change all load instruction to simple mov instructiom
        for (change_inst, dst, src) in change_to_mov_insts {
            function.change_inst(
                &change_inst,
                InstructionData::Move {
                    opcode: OpCode::Mov,
                    src,
                    dst,
                },
            )
        }
        uninit_variable
    }
    /// Find All alloc instruction that can be prompted into memory
    fn find_all_alloc_inst_from_entry_block(
        &mut self,
        function: &mut Function,
    ) -> Vec<(Value, Instruction, BasicBlock)> {
        let mut alloc_pointers_and_bb_ids = Vec::new();
        for entry_block_id in &function.entry_block {
            let block_data = function.blocks.get(entry_block_id).unwrap();
            for inst_id in &block_data.instructions {
                if let InstructionData::StackAlloc {
                    opcode: _0,
                    size: _1,
                    align: _2,
                    dst,
                    ir_type: _3,
                } = function.instructions.get(inst_id).unwrap()
                {
                    alloc_pointers_and_bb_ids.push((
                        dst.clone(),
                        inst_id.clone(),
                        entry_block_id.clone(),
                    ));
                }
            }
        }
        alloc_pointers_and_bb_ids
    }
    /// Frist stage of phi insertion algorithm, using use_def_table to find all use of store instruction of a alloc value,
    /// and insert phi node to the DF of all store
    fn insert_phi_node_in_df_of_store_inst(
        &mut self,
        alloc_pointer: &Value,
        function: &mut Function,
        use_table: &UseTable,
    ) -> HashSet<Instruction> {
        let uses_of_alloc = use_table.get(alloc_pointer).unwrap();
        // since we can not mutation function when borrow instruction, so we record all information we need to
        // mutate function later .
        let mut store_blocks = Vec::new();
        for use_of_alloc in uses_of_alloc {
            if let InstructionData::StoreRegister {
                opcode: _1,
                base: _2,
                offset: _3,
                src: _4,
                data_type,
            } = function.instructions.get(use_of_alloc).unwrap()
            {
                let block_of_store = function.get_block_from_inst(use_of_alloc).unwrap();
                store_blocks.push((block_of_store.clone(), data_type.clone()));
            }
        }
        // mutate function by insert all phi instruction of serise of basic block have store instruction
        // using rename_phi_block to record the block we already insert phi, to provide double insert.
        let mut rename_phis: HashSet<Instruction> = HashSet::new();
        let mut rename_phi_blocks: HashSet<BasicBlock> = HashSet::new();
        for (block_of_store, data_type) in store_blocks {
            for dom_front in &self.dom_table.get(&block_of_store).unwrap().dom_frontier {
                if rename_phi_blocks.contains(dom_front) {
                    continue;
                }
                let dst = function.add_register(data_type.clone());
                let phi_id = function.insert_inst_to_block_front(
                    dom_front,
                    InstructionData::Phi {
                        opcode: OpCode::Phi,
                        dst,
                        from: Vec::new(),
                    },
                );
                rename_phis.insert(phi_id);
                rename_phi_blocks.insert(dom_front.clone());
            }
        }
        rename_phis
    }
    /// Second stage of phi insertt algorithm, using DFS to traversal all basic block and remove all load and store instruction
    /// that belong to the alloc instruction.
    /// - `block`: the bb we gonna visit.
    /// - `function`: function of bb.
    /// - `rename`: all rename phi of last stage, using this to ensure only mutate the phis inserted in last stage.
    /// - `use_set` : the use_set of alloc inst. using this to ensure only mutate the load/store of alloc inst.
    /// - `stack` : the values stack to keep track the value change of memory.
    /// - `visit_mark`: marks for record which bb we have been visited.
    fn rename_load_and_store_inst(
        &mut self,
        block: BasicBlock,
        function: &mut Function,
        rename_phis: &HashSet<Instruction>,
        use_set: &HashSet<Instruction>,
        stack: &mut Vec<(Value, BasicBlock)>,
        visit_marks: &mut HashSet<BasicBlock>,
    ) -> bool {
        // if a block have N predecessor, it would be visited n time, and every time is from a different predecessor
        // so we can insert the source of predecessor every time we visit to the phi instruction we create earlier.
        for inst_id in &function.blocks.get(&block).unwrap().instructions {
            if rename_phis.contains(inst_id) {
                if let InstructionData::Phi {
                    opcode: _,
                    dst: _1,
                    from,
                } = function.instructions.get_mut(inst_id).unwrap()
                {
                    let (src_value, src_block) = stack.last().unwrap();
                    from.push((src_block.clone(), src_value.clone()));
                }
            }
        }
        // if this block already been visit, do not need to rename it, only need to insert source for phi insertion
        if visit_marks.contains(&block) {
            return false;
        }
        // if this block is not visit, rename all load, store instruction relate the alloc instruction we need.
        // we using use_set argument to test if load and store is belong to alloc command we target to.
        // since we can not mutate the function while we borrow it as immutation (`function.instructions.get(inst_id).unwrap()`)
        // so we need to record necessary info to mutate later.
        visit_marks.insert(block.clone());
        let mut remove_insts = Vec::new();
        let mut change_to_mov_insts = Vec::new();
        let mut add_stack_count = 0;
        let mut uninit_variable = false;
        for inst_id in &function.blocks.get(&block).unwrap().instructions {
            if use_set.contains(inst_id) || rename_phis.contains(inst_id) {
                match function.instructions.get(inst_id).unwrap() {
                    InstructionData::LoadRegister {
                        opcode: _,
                        base: _1,
                        offset: _2,
                        dst,
                        data_type: _3,
                    } => {
                        // if there is no assignment value before use. we can not replace the value.
                        if let Some(new_src) = stack.last() {
                            uninit_variable = true;
                            change_to_mov_insts.push((
                                inst_id.clone(),
                                dst.clone(),
                                new_src.clone(),
                            ));
                        }
                    }
                    InstructionData::StoreRegister {
                        opcode: _,
                        base: _1,
                        offset: _2,
                        src,
                        data_type: _3,
                    } => {
                        stack.push((src.clone(), block.clone()));
                        add_stack_count += 1;
                        remove_insts.push(inst_id.clone());
                    }
                    InstructionData::Phi {
                        opcode: _,
                        dst,
                        from: _1,
                    } => {
                        stack.push((dst.clone(), block.clone()));
                        add_stack_count += 1;
                    }
                    _ => {}
                }
            }
        }
        // remove all store instruction
        for remove_inst in remove_insts {
            function.remove_inst_from_block(&block, &remove_inst);
        }
        // change all load instruction to simple mov instructiom
        for (change_inst, dst, (src, _block)) in change_to_mov_insts {
            function.change_inst(
                &change_inst,
                InstructionData::Move {
                    opcode: OpCode::Mov,
                    src,
                    dst,
                },
            )
        }
        // DFS traveral all sucessor with same argument
        for sucessor in function.blocks.get(&block).unwrap().successor.clone() {
            uninit_variable = self.rename_load_and_store_inst(
                sucessor.clone(),
                function,
                rename_phis,
                use_set,
                stack,
                visit_marks,
            ) && uninit_variable;
        }
        // recover the stack by poping out the value insert in this basic block.
        for _i in 0..add_stack_count {
            stack.pop();
        }
        uninit_variable
    }
}
