use crate::ir::function::*;
use crate::ir::instructions::*;
use crate::ir::value::*;
use std::collections::{HashMap, HashSet};
use std::mem::replace;

pub type ValueTuple = (BasicBlock, Instruction, Value);
/// Def table, mapping a Value in right hand side of three-address code
/// to a definition (a instruction assign a value).
pub type DefTable = HashMap<Value, DefKind>;
/// Use table, mapping the Value in left hand side of three-address code
/// to a series of use (instruction use value in right hand side).
pub type UseTable = HashMap<Value, HashSet<Instruction>>;
/// Use
#[derive(Debug, Clone, PartialEq)]
pub enum DefKind {
    InternalDef(Instruction),
    ParamDef(Value),
    ExternalDef,
}
/// A struct for a basic block, contain information that every value in
/// this basic block's use and def relationship.
#[derive(Debug, Clone, PartialEq)]
pub struct UseDefEntry {
    pub use_table: UseTable,
    pub def_table: DefTable,
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

impl UseDefAnaylsier {
    /// Create a new use-def anayliser.
    pub fn new() -> Self {
        Self {
            def_cache: HashMap::new(),
            use_cache: HashMap::new(),
            use_def_table: HashMap::new(),
        }
    }
    /// Anaylsis use-def relation for a function (CFG).
    pub fn anaylsis(&mut self, function: &Function) -> UseDefTable {
        // this anaylsis use two iter to add all use-def relation.
        // - frist iterate find all def and use as a tuple mapping
        // - second iterate fill all relation aoccroding to cache.
        self.find_all_use_def_tuple(function);
        self.fill_table_with_cache(function);
        self.def_cache.clear();
        self.use_cache.clear();
        replace(&mut self.use_def_table, HashMap::new())
    }
    fn find_all_use_def_tuple(&mut self, function: &Function) {
        for (block_id, bb) in &function.blocks {
            self.use_def_table.insert(
                block_id.clone(),
                UseDefEntry {
                    use_table: HashMap::new(),
                    def_table: HashMap::new(),
                },
            );
            for inst_id in &bb.instructions {
                let inst = function.instructions.get(inst_id).unwrap();
                match inst {
                    InstructionData::Add {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::Sub {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::Mul {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::Divide {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::Reminder {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::FAdd {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::FSub {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::FMul {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::FDivide {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::FReminder {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::BitwiseAnd {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::BitwiseOR {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::LogicalAnd {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::LogicalOR {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::ShiftLeft {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::ShiftRight {
                        opcode: _,
                        src1,
                        src2,
                        dst,
                    } => {
                        if self.is_value_register(dst, function) {
                            self.add_to_def_cache(dst.clone(), block_id.clone(), inst_id.clone())
                        }
                        if self.is_value_register(src1, function) {
                            self.add_to_use_cache(src1.clone(), block_id.clone(), inst_id.clone())
                        }
                        if self.is_value_register(src2, function) {
                            self.add_to_use_cache(src2.clone(), block_id.clone(), inst_id.clone())
                        }
                    }
                    InstructionData::Neg {
                        opcode: _,
                        src,
                        dst,
                    }
                    | InstructionData::BitwiseNot {
                        opcode: _,
                        src,
                        dst,
                    }
                    | InstructionData::LogicalNot {
                        opcode: _,
                        src,
                        dst,
                    }
                    | InstructionData::ToU8 {
                        opcode: _,
                        src,
                        dst,
                    }
                    | InstructionData::ToU16 {
                        opcode: _,
                        src,
                        dst,
                    }
                    | InstructionData::ToU32 {
                        opcode: _,
                        src,
                        dst,
                    }
                    | InstructionData::ToU64 {
                        opcode: _,
                        src,
                        dst,
                    }
                    | InstructionData::ToI16 {
                        opcode: _,
                        src,
                        dst,
                    }
                    | InstructionData::ToI32 {
                        opcode: _,
                        src,
                        dst,
                    }
                    | InstructionData::ToI64 {
                        opcode: _,
                        src,
                        dst,
                    }
                    | InstructionData::ToF32 {
                        opcode: _,
                        src,
                        dst,
                    }
                    | InstructionData::ToF64 {
                        opcode: _,
                        src,
                        dst,
                    }
                    | InstructionData::ToAddress {
                        opcode: _,
                        src,
                        dst,
                    } => {
                        if self.is_value_register(dst, function) {
                            self.add_to_def_cache(dst.clone(), block_id.clone(), inst_id.clone())
                        }
                        if self.is_value_register(src, function) {
                            self.add_to_use_cache(src.clone(), block_id.clone(), inst_id.clone())
                        }
                    }
                    InstructionData::Icmp {
                        opcode: _,
                        flag: _1,
                        src1,
                        src2,
                        dst,
                    }
                    | InstructionData::Fcmp {
                        opcode: _,
                        flag: _1,
                        src1,
                        src2,
                        dst,
                    } => {
                        if self.is_value_register(dst, function) {
                            self.add_to_def_cache(dst.clone(), block_id.clone(), inst_id.clone())
                        }
                        if self.is_value_register(src1, function) {
                            self.add_to_use_cache(src1.clone(), block_id.clone(), inst_id.clone())
                        }
                        if self.is_value_register(src2, function) {
                            self.add_to_use_cache(src2.clone(), block_id.clone(), inst_id.clone())
                        }
                    }
                    InstructionData::StoreRegister {
                        opcode: _,
                        base,
                        offset,
                        src,
                        data_type: _1,
                    } => {
                        if self.is_value_register(base, function) {
                            self.add_to_use_cache(base.clone(), block_id.clone(), inst_id.clone())
                        }
                        if self.is_value_register(offset, function) {
                            self.add_to_use_cache(offset.clone(), block_id.clone(), inst_id.clone())
                        }
                        if self.is_value_register(src, function) {
                            self.add_to_use_cache(src.clone(), block_id.clone(), inst_id.clone())
                        }
                    }
                    InstructionData::LoadRegister {
                        opcode: _,
                        base,
                        offset,
                        dst,
                        data_type: _1,
                    } => {
                        if self.is_value_register(dst, function) {
                            self.add_to_def_cache(dst.clone(), block_id.clone(), inst_id.clone())
                        }
                        if self.is_value_register(base, function) {
                            self.add_to_use_cache(base.clone(), block_id.clone(), inst_id.clone())
                        }
                        if self.is_value_register(offset, function) {
                            self.add_to_use_cache(offset.clone(), block_id.clone(), inst_id.clone())
                        }
                    }
                    InstructionData::Jump { opcode: _, dst: _1 } => {}
                    InstructionData::BrIf {
                        opcode: _,
                        test,
                        conseq: _1,
                        alter: _2,
                    } => {
                        if self.is_value_register(test, function) {
                            self.add_to_use_cache(test.clone(), block_id.clone(), inst_id.clone())
                        }
                    }
                    InstructionData::StackAlloc {
                        opcode: _,
                        size: _1,
                        align: _2,
                        dst,
                        ir_type: _4,
                    } => {
                        if self.is_value_register(dst, function) {
                            self.add_to_def_cache(dst.clone(), block_id.clone(), inst_id.clone())
                        }
                    }
                    InstructionData::Move {
                        opcode: _,
                        src,
                        dst,
                    } => {
                        if self.is_value_register(dst, function) {
                            self.add_to_def_cache(dst.clone(), block_id.clone(), inst_id.clone())
                        }
                        if self.is_value_register(src, function) {
                            self.add_to_use_cache(src.clone(), block_id.clone(), inst_id.clone())
                        }
                    }
                    InstructionData::Call {
                        opcode: _,
                        name: _1,
                        params,
                        dst,
                    } => {
                        for value in params {
                            if self.is_value_register(value, function) {
                                self.add_to_use_cache(
                                    value.clone(),
                                    block_id.clone(),
                                    inst_id.clone(),
                                )
                            }
                        }
                        match dst {
                            Some(value) => {
                                self.add_to_def_cache(
                                    value.clone(),
                                    block_id.clone(),
                                    inst_id.clone(),
                                );
                            }
                            None => {}
                        };
                    }
                    InstructionData::Ret { opcode: _, value } => {
                        if let Some(val) = value {
                            if self.is_value_register(val, function) {
                                self.add_to_use_cache(
                                    val.clone(),
                                    block_id.clone(),
                                    inst_id.clone(),
                                );
                            }
                        }
                    }
                    InstructionData::Phi {
                        opcode: _,
                        dst,
                        from,
                    } => {
                        if self.is_value_register(dst, function) {
                            self.add_to_def_cache(dst.clone(), block_id.clone(), inst_id.clone())
                        }
                        for (_block, value) in from {
                            if self.is_value_register(value, function) {
                                self.add_to_use_cache(
                                    value.clone(),
                                    block_id.clone(),
                                    inst_id.clone(),
                                );
                            }
                        }
                    }
                    InstructionData::Comment(_) => {}
                }
            }
        }
    }
    fn fill_table_with_cache(&mut self, function: &Function) {
        for (use_value, use_blocks_and_insts) in &self.use_cache {
            match self.def_cache.get(use_value) {
                Some(def) => {
                    let (def_block_id, def_inst_id) = def;
                    for (use_block_id, use_inst_id) in use_blocks_and_insts {
                        // add use to def
                        let used_entry = self.use_def_table.get_mut(use_block_id).unwrap();
                        let def_table = &mut used_entry.def_table;
                        def_table
                            .insert(use_value.clone(), DefKind::InternalDef(def_inst_id.clone()));
                        // get table of def block id, and insert use value to that table.
                        let def_entry = self.use_def_table.get_mut(def_block_id).unwrap();
                        let use_table = &mut def_entry.use_table;
                        if use_table.contains_key(use_value) {
                            use_table
                                .get_mut(use_value)
                                .unwrap()
                                .insert(use_inst_id.clone());
                        } else {
                            use_table
                                .insert(use_value.clone(), HashSet::from([use_inst_id.clone()]));
                        }
                    }
                }
                None => {
                    if function.params_value.contains(use_value) {
                        let entry_id = function.entry_block[0].clone();
                        for (use_block_id, use_inst_id) in use_blocks_and_insts {
                            // add def-relation to use
                            let used_entry = self.use_def_table.get_mut(use_block_id).unwrap();
                            let def_table = &mut used_entry.def_table;
                            def_table
                                .insert(use_value.clone(), DefKind::ParamDef(use_value.clone()));
                            // get use-relation to def
                            let def_entry = self.use_def_table.get_mut(&entry_id).unwrap();
                            let use_table = &mut def_entry.use_table;
                            if use_table.contains_key(use_value) {
                                use_table
                                    .get_mut(use_value)
                                    .unwrap()
                                    .insert(use_inst_id.clone());
                            } else {
                                use_table.insert(
                                    use_value.clone(),
                                    HashSet::from([use_inst_id.clone()]),
                                );
                            }
                        }
                    } else {
                        // reference to global value
                        todo!()
                    }
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
        } else {
            self.use_cache.insert(value, vec![(block, inst)]);
        }
    }
    /// test a value is virtual register or not.
    fn is_value_register(&self, value: &Value, function: &Function) -> bool {
        match function.values.get(value) {
            Some(data) => match data {
                ValueData::Immi(_) => false,
                _ => true,
            },
            None => panic!(),
        }
    }
}
