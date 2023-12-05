use std::collections::HashMap;
use std::mem::replace;
use crate::ir::value::*;
use crate::ir::instructions::*;
use crate::ir::function::*;
use crate::ir::function::print::get_text_format_of_value;

pub type ValueTuple = (BasicBlock, Instruction, Value);
/// Def table, mapping a Value in right hand side of three-address code 
/// to a definition (a instruction assign a value).
pub type DefTable = HashMap<Value, Instruction>;
/// Use table, mapping the Value in left hand side of three-address code
/// to a series of use (instruction use value in right hand side).
pub type UseTable = HashMap<Value, Vec<Instruction>>;
/// A struct for a basic block, contain information that every value in 
/// this basic block's use and def relationship.
#[derive(Debug, Clone, PartialEq)]
pub struct UseDefEntry  {
    use_table: UseTable,
    def_table: DefTable,
}
/// Mapping basic block to use-def-table.
pub type UseDefTable = HashMap<BasicBlock, UseDefEntry>;

/// Struct for building use def table for a functioon.
pub struct UseDefAnaylsier {
    /// a value is def in 
    def_cache: HashMap<Value, (BasicBlock, Instruction)>,
    /// a value is used in set of blocks
    use_cache: HashMap<Value, Vec<(BasicBlock, Instruction)>>,
    use_def_table: UseDefTable,
}

/// helper function to print out all the 
pub fn print_use_def_table(table: &UseDefTable, function: &Function) {
    for entry in table {
        println!("==== {} ====", entry.0.0);
        println!("use table:");
        for use_entry in &entry.1.use_table {
            let mut is_start_inner = true;
            let start_str = format!("{} --->", get_text_format_of_value(function.values.get(use_entry.0).unwrap()));
            for use_inst in use_entry.1 {
                let mut inst_text = String::new();
                function.print_inst(&mut inst_text, function.instructions.get(use_inst).unwrap());
                if is_start_inner {
                    print!("{} {}", start_str, inst_text);
                }else {
                    is_start_inner = false;
                    print!("{} {}", start_str, get_text_format_of_value(function.values.get(use_entry.0).unwrap()));
                }
            }
        }
        println!("def table:");
        for def_entry in &entry.1.def_table {
            let mut inst_text = String::new();
            function.print_inst(&mut inst_text, function.instructions.get(def_entry.1).unwrap());
            print!(
                "{} ---> {}", 
                get_text_format_of_value(function.values.get(def_entry.0).unwrap()),
                inst_text,
            )
        }
        
    }
}

impl UseDefAnaylsier {
    /// Create a new use-def anayliser.
    pub fn new() -> Self {
        Self {
            def_cache: HashMap::new(),
            use_cache: HashMap::new(),
            use_def_table: HashMap::new()
        }
    }
    /// Anaylsis use-def relation for a function (CFG).
    pub fn anaylsis(&mut self, function: &Function) -> UseDefTable {
        // this anaylsis use two iter to add all use-def relation.
        // - frist iterate find all def and use as a tuple mapping 
        // - second iterate fill all relation aoccroding to cache.
        self.find_all_use_def_tuple(function);
        self.fill_table_with_cache();
        self.def_cache.clear();
        self.use_cache.clear();
        replace(&mut self.use_def_table, HashMap::new())
    }
    fn find_all_use_def_tuple(&mut self, function: &Function) {
        for (block_id, bb) in &function.blocks {
            self.use_def_table.insert(block_id.clone(), UseDefEntry { use_table: HashMap::new(), def_table: HashMap::new() });
            for inst_id in &bb.instructions {
                let inst = function.instructions.get(inst_id).unwrap();
                match inst {
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
                        if self.is_value_register(dst, function) { self.add_to_def_cache(dst.clone(), block_id.clone(), inst_id.clone())}
                        if self.is_value_register(src1, function) { self.add_to_use_cache(src1.clone(), block_id.clone(), inst_id.clone())}
                        if self.is_value_register(src2, function) { self.add_to_use_cache(src2.clone(), block_id.clone(), inst_id.clone())}
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
                        if self.is_value_register(dst, function) { self.add_to_def_cache(dst.clone(), block_id.clone(), inst_id.clone())}
                        if self.is_value_register(src, function) { self.add_to_use_cache(src.clone(), block_id.clone(), inst_id.clone())}
                    }
                    InstructionData::Icmp { opcode: _, flag: _1, src1, src2, dst }  | 
                    InstructionData::Fcmp { opcode: _, flag: _1, src1, src2, dst }=> {
                        if self.is_value_register(dst, function) { self.add_to_def_cache(dst.clone(), block_id.clone(), inst_id.clone())}
                        if self.is_value_register(src1, function) { self.add_to_use_cache(src1.clone(), block_id.clone(), inst_id.clone())}
                        if self.is_value_register(src2, function) { self.add_to_use_cache(src2.clone(), block_id.clone(), inst_id.clone())}
                    }
                    InstructionData::StoreRegister { 
                        opcode: _ , 
                        base, 
                        offset, 
                        src, 
                        data_type: _1 
                    } => {
                        if self.is_value_register(base, function) { self.add_to_use_cache(base.clone(), block_id.clone(), inst_id.clone())}
                        if self.is_value_register(offset, function) { self.add_to_use_cache(offset.clone(), block_id.clone(), inst_id.clone())}
                        if self.is_value_register(src, function) { self.add_to_use_cache(src.clone(), block_id.clone(), inst_id.clone())}
                    }
                    InstructionData::LoadRegister { 
                        opcode: _ , 
                        base, 
                        offset, 
                        dst, 
                        data_type: _1, 
                    } => {
                        if self.is_value_register(dst, function) { self.add_to_def_cache(dst.clone(), block_id.clone(), inst_id.clone())}
                        if self.is_value_register(base, function) { self.add_to_use_cache(base.clone(), block_id.clone(), inst_id.clone())}
                        if self.is_value_register(offset, function) { self.add_to_use_cache(offset.clone(), block_id.clone(), inst_id.clone())}
                    }
                    InstructionData::Jump { opcode: _, dst: _1 } => {}
                    InstructionData::BrIf { opcode: _, test, conseq: _1, alter: _2} => {
                        if self.is_value_register(test, function) { self.add_to_use_cache(test.clone(), block_id.clone(), inst_id.clone())}
                    }
                    InstructionData::StackAlloc { opcode: _ , size: _1, align: _2, dst } => {
                        if self.is_value_register(dst, function) { self.add_to_def_cache(dst.clone(), block_id.clone(), inst_id.clone())}
                    }
                    InstructionData::Move { opcode: _, src, dst } => {
                        if self.is_value_register(dst, function) { self.add_to_def_cache(dst.clone(), block_id.clone(), inst_id.clone())}
                        if self.is_value_register(src, function) { self.add_to_use_cache(src.clone(), block_id.clone(), inst_id.clone())}
                    }
                    InstructionData::Call { params } => {
                        for value in params {
                            if self.is_value_register(value, function) { self.add_to_use_cache(value.clone(), block_id.clone(), inst_id.clone())}
                        }
                    }
                }
            }
        }
    }
    fn fill_table_with_cache(&mut self) {
        for (use_value, use_blocks_and_insts) in &self.use_cache {
            let (def_block_id, def_inst_id) = self.def_cache.get(use_value).unwrap();
            for (use_block_id, use_inst_id) in use_blocks_and_insts {
                let used_entry = self.use_def_table.get_mut(use_block_id).unwrap();
                let def_table = &mut used_entry.def_table;
                def_table.insert(use_value.clone(), def_inst_id.clone());

                let def_entry = self.use_def_table.get_mut(def_block_id).unwrap();
                let use_table = &mut def_entry.use_table;
                if use_table.contains_key(use_value) {
                    use_table.get_mut(use_value).unwrap().push(use_inst_id.clone());
                }else {
                    use_table.insert(use_value.clone(), vec![use_inst_id.clone()]);
                }
            }
        }
    }
    /// add value and related info to def cache
    fn add_to_def_cache(&mut self, value: Value, block: BasicBlock, inst: Instruction) {
        self.def_cache.insert(value, (block, inst));
    }
    /// add a value and related info to use cache.
    fn add_to_use_cache(&mut self, value: Value, block: BasicBlock, inst: Instruction) {
        if self.use_cache.contains_key(&value) {
            let vec = self.use_cache.get_mut(&value).unwrap();
            vec.push((block, inst));
        }else {
            self.use_cache.insert(value, vec![(block, inst)]);
        }
    }
    /// test a value is virtual register or not.
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