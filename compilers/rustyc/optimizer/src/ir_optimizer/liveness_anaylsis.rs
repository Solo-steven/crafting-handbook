use std::collections::{HashSet, HashMap};
use std::mem::replace;
use crate::ir::instructions::InstructionData;
use crate::ir::value::*;
use crate::ir::function::*;

/// Live out table for a control flow graph will mapping every basic block
/// to a set contain the virtual register that will live out.
pub type LiveOutTable = HashMap<BasicBlock, LiveOutSet>;
/// Set for storage virtual register which live out the block.
pub type LiveOutSet = HashSet<Value>;

type UseTable = HashMap<BasicBlock, HashSet<Value>>;
type KillTable = HashMap<BasicBlock, HashSet<Value>>;
/// Struct for Liveness anaylsis.
pub struct LivenessAnaylsier {
    /// use set for each block
    use_table: UseTable,
    /// kill set for each block
    kill_table: KillTable,
    /// liveout set for each block.
    liveness_table: LiveOutTable,
}

pub fn print_set(set: &HashSet<Value>, function: &Function, title: &str) {
    print!("{}: ", title);
    for value in set {
        let data = function.values.get(value).unwrap();
        match data {
            ValueData::VirRegister(name) => print!("{:?} ", name),
            ValueData::Immi(_) => {}
        }
    }
    println!("");
    println!("-------------------");
}

impl LivenessAnaylsier {
    /// Create a new liveness Anaylsier.
    pub fn new() -> Self {
        Self {
            use_table: Default::default(),
            kill_table: Default::default(),
            liveness_table: Default::default()
        }
    }
    /// liveness anaylsis for a control flow graph, it will return a map, mapping blockid to a set,
    /// in which will contain serveral value that tell developer which value will liveout from this 
    /// basic block.
    pub fn anaylsis(&mut self, function: &Function) -> LiveOutTable {
        // Gather the information in blocks
        for (block, block_data) in &function.blocks {
            let (kill_set, use_set ) = self.compute_kill_and_use_set(block_data, function);
            self.kill_table.insert(block.clone(), kill_set);
            self.use_table.insert(block.clone(), use_set);
        }
        // init live out set for every block
        for block_id in function.blocks.keys() {
            self.liveness_table.insert(block_id.clone(), HashSet::new());
        }
        // main iterative algorithm of liveness anaylsis
        let mut changed = true;
        while changed {
            changed = false;
            for (block_id, block_data) in &function.blocks {
                if self.computed_liveout_set(block_id, block_data) {
                    changed = true;
                }
            }
        }
        // clear data struct for next usage.
        self.kill_table = HashMap::new();
        self.use_table = HashMap::new();
        replace(&mut self.liveness_table, HashMap::new())
    }
    fn computed_liveout_set(&mut self, block_id: &BasicBlock, block_data: &BasicBlockData) -> bool {
        let mut change = false;
        let mut next_liveout = HashSet::new();
        for sucessor_id in &block_data.successor {
            let sucessor_liveout = self.liveness_table.get(sucessor_id).unwrap();
            let sucessor_use = self.use_table.get(sucessor_id).unwrap();
            let sucessor_kill = self.kill_table.get(sucessor_id).unwrap();
            let mut next = sucessor_liveout - sucessor_kill;
            for value in sucessor_use {
                next.insert(value.clone());
            }
            next_liveout.extend(next.into_iter());
        }
        let cur_liveout = self.liveness_table.get_mut(block_id).unwrap();
        for value in &next_liveout {
            if !cur_liveout.contains(value) {
                change = true;
                cur_liveout.insert(value.clone());
            }
        }
        if change { self.liveness_table.insert(block_id.clone(), next_liveout);}
        change
    }
    /// compute use and kill set by the instructions in the basic block, return kill set and use set for a given block
    /// - kill set : any value show in left hand side 
    /// - use set : any value show in right hand side before show in left hand side.
    fn compute_kill_and_use_set(&mut self, block_data: &BasicBlockData, function: &Function ) -> (HashSet<Value>, HashSet<Value>) {
        let mut kill_set = HashSet::new();
        let mut use_set = HashSet::new();
        for inst in &block_data.instructions {
            let inst_data = function.instructions.get(inst).unwrap();
            match inst_data {
                InstructionData::Add { opcode: _, src1, src2, dst } |
                InstructionData::Sub { opcode: _, src1, src2, dst } |
                InstructionData::Mul { opcode: _, src1, src2, dst } |
                InstructionData::Divide { opcode: _, src1, src2, dst } |
                InstructionData::Reminder { opcode: _ , src1, src2, dst } |
                InstructionData::FAdd { opcode: _ , src1, src2, dst } |
                InstructionData::FSub { opcode: _ , src1, src2, dst } |
                InstructionData::FMul { opcode: _, src1, src2, dst } |
                InstructionData::FDivide { opcode: _, src1, src2, dst } |
                InstructionData::FReminder { opcode: _ , src1, src2, dst } |
                InstructionData::BitwiseAnd { opcode: _ , src1, src2, dst } |
                InstructionData::BitwiseOR { opcode: _ , src1, src2, dst } |
                InstructionData::LogicalAnd { opcode: _ , src1, src2, dst } |
                InstructionData::LogicalOR { opcode: _ , src1, src2, dst }  |
                InstructionData::ShiftLeft { opcode: _ , src1, src2, dst } |
                InstructionData::ShiftRight { opcode: _ , src1, src2, dst } => {
                    if self.is_value_register(src1, function) && !kill_set.contains(src1) {
                        use_set.insert(src1.clone());
                    }    
                    if self.is_value_register(src2, function) && !kill_set.contains(src2) {
                        use_set.insert(src2.clone());
                    }
                    kill_set.insert(dst.clone());
                },
                InstructionData::Neg { opcode: _, src, dst } |
                InstructionData::BitwiseNot { opcode: _ , src, dst } |
                InstructionData::LogicalNot { opcode: _, src, dst } |
                InstructionData::ToU8 { opcode: _ , src, dst } |
                InstructionData::ToU16 { opcode: _ , src, dst } |
                InstructionData::ToU32 { opcode: _, src, dst } |
                InstructionData::ToU64 { opcode: _ , src, dst } |
                InstructionData::ToI16 { opcode: _ , src, dst } |
                InstructionData::ToI32 { opcode: _ , src, dst } |
                InstructionData::ToI64 { opcode: _ , src, dst } |
                InstructionData::ToF32 { opcode: _ , src, dst } |
                InstructionData::ToF64 { opcode: _ , src, dst } => {
                    if self.is_value_register(src, function) && !kill_set.contains(src) {
                        use_set.insert(src.clone());
                    }
                    kill_set.insert(dst.clone());
                }
                InstructionData::Icmp { opcode: _, flag: _1, src1, src2, dst }  | 
                InstructionData::Fcmp { opcode: _, flag: _1, src1, src2, dst }=> {
                    if self.is_value_register(src1, function) && !kill_set.contains(src1) {
                        use_set.insert(src1.clone());
                    }    
                    if self.is_value_register(src2, function) && !kill_set.contains(src2) {
                        use_set.insert(src2.clone());
                    }
                    kill_set.insert(dst.clone());
                }
                InstructionData::StoreRegister { 
                    opcode: _ , 
                    base, 
                    offset, 
                    src, 
                    data_type: _1 
                } => {
                    if self.is_value_register(base, function) && kill_set.contains(base) {
                        use_set.insert(base.clone());
                    }
                    if self.is_value_register(offset, function) && !kill_set.contains(offset) {
                        use_set.insert(offset.clone());
                    }
                    kill_set.insert(src.clone());
                }
                InstructionData::LoadRegister { 
                    opcode: _ , 
                    base, 
                    offset, 
                    dst, 
                    data_type: _1, 
                } => {
                    if self.is_value_register(base, function) && kill_set.contains(base) {
                        use_set.insert(base.clone());
                    }
                    if self.is_value_register(offset, function) && !kill_set.contains(offset) {
                        use_set.insert(offset.clone());
                    }
                    kill_set.insert(dst.clone());
                }
                InstructionData::Jump { opcode: _, dst: _1 } => {}
                InstructionData::BrIf { opcode: _, test, conseq: _1, alter: _2} => {
                    if self.is_value_register(test, function) && !kill_set.contains(test) {
                        use_set.insert(test.clone());
                    }
                }
                InstructionData::StackAlloc { 
                    opcode: _ , 
                    size: _1, 
                    align: _2, 
                    dst 
                } => {
                    kill_set.insert(dst.clone());
                }
                InstructionData::Move { opcode: _, src, dst } => {
                    if self.is_value_register(src, function) && !kill_set.contains(src) {
                        use_set.insert(src.clone());
                    }
                    kill_set.insert(dst.clone());
                }
                InstructionData::Call { params } => {
                    for value in params {
                        if self.is_value_register(value, function)  && !kill_set.contains(value) {
                            use_set.insert(value.clone());
                        }
                    }
                }
                // TODO: phi
                _ => {}
            }
        }
        (kill_set, use_set)
    }
    fn is_value_register(&self, value: &Value, function: &Function) -> bool {
        match function.values.get(value) {
            Some(data) => {
                match data {
                    ValueData::Immi(_) => false,
                    ValueData::VirRegister(_) => true,
                }
            }
            None => panic!(),
        }
    }
}
