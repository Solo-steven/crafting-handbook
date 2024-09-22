mod debugger;

use crate::ir::function::*;
use crate::ir::instructions::*;
use crate::ir::value::*;
use crate::ir_optimizer::anaylsis::OptimizerAnaylsis;
use std::collections::{HashMap, HashSet};
use std::mem::replace;

#[derive(Debug, Clone, PartialEq)]
pub enum DefKind {
    InternalDef(Instruction),
    ParamDef(Value),
    ExternalDef,
}

pub type UseTable = HashMap<Value, HashSet<Instruction>>;
pub type DefTable = HashMap<Value, DefKind>;
pub type UseDefTable = (UseTable, DefTable);

/// Struct for building use def table for a functioon.
pub struct UseDefAnaylsier {
    use_table: UseTable,
    def_table: DefTable,
}

impl OptimizerAnaylsis<UseDefTable> for UseDefAnaylsier {
    /// Anaylsis use-def relation for a function (CFG).
    fn anaylsis(&mut self, function: &Function) -> UseDefTable {
        self.traversal_all_instruction_to_fill_use_def_table(function);
        let use_table = replace(&mut self.use_table, HashMap::new());
        let def_table = replace(&mut self.def_table, HashMap::new());
        (use_table, def_table)
    }
}

impl UseDefAnaylsier {
    /// Create a new use-def anayliser.
    pub fn new() -> Self {
        Self {
            use_table: HashMap::new(),
            def_table: HashMap::new(),
        }
    }
    /// add value and related info to def cache
    fn add_to_def_table(&mut self, value: Value, def_kind: DefKind, function: &Function) {
        if !self.is_value_register(&value, function) {
            return;
        }
        self.def_table.insert(value, def_kind);
    }
    /// add a value and related info to use cache.
    fn add_to_use_table(&mut self, value: Value, inst: Instruction, function: &Function) {
        if !self.is_value_register(&value, function) {
            return;
        }
        if let Some(set) = self.use_table.get_mut(&value) {
            set.insert(inst);
        } else {
            let mut set = HashSet::new();
            set.insert(inst);
            self.use_table.insert(value, set);
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
    fn traversal_all_instruction_to_fill_use_def_table(&mut self, function: &Function) {
        for param in &function.params_value {
            self.add_to_def_table(param.clone(), DefKind::ParamDef(param.clone()), function);
        }
        for (_, bb) in &function.blocks {
            for inst_id in &bb.instructions {
                let inst = function.instructions.get(inst_id).unwrap();
                match inst {
                    InstructionData::Add {
                        src1, src2, dst, ..
                    }
                    | InstructionData::Sub {
                        src1, src2, dst, ..
                    }
                    | InstructionData::Mul {
                        src1, src2, dst, ..
                    }
                    | InstructionData::Divide {
                        src1, src2, dst, ..
                    }
                    | InstructionData::Reminder {
                        src1, src2, dst, ..
                    }
                    | InstructionData::FAdd {
                        src1, src2, dst, ..
                    }
                    | InstructionData::FSub {
                        src1, src2, dst, ..
                    }
                    | InstructionData::FMul {
                        src1, src2, dst, ..
                    }
                    | InstructionData::FDivide {
                        src1, src2, dst, ..
                    }
                    | InstructionData::FReminder {
                        src1, src2, dst, ..
                    }
                    | InstructionData::BitwiseAnd {
                        src1, src2, dst, ..
                    }
                    | InstructionData::BitwiseOR {
                        src1, src2, dst, ..
                    }
                    | InstructionData::LogicalAnd {
                        src1, src2, dst, ..
                    }
                    | InstructionData::LogicalOR {
                        src1, src2, dst, ..
                    }
                    | InstructionData::ShiftLeft {
                        src1, src2, dst, ..
                    }
                    | InstructionData::ShiftRight {
                        src1, src2, dst, ..
                    }
                    | InstructionData::Icmp {
                        src1, src2, dst, ..
                    }
                    | InstructionData::Fcmp {
                        src1, src2, dst, ..
                    } => {
                        self.add_to_def_table(
                            dst.clone(),
                            DefKind::InternalDef(inst_id.clone()),
                            function,
                        );
                        self.add_to_use_table(src1.clone(), inst_id.clone(), function);
                        self.add_to_use_table(src2.clone(), inst_id.clone(), function);
                    }
                    InstructionData::StoreRegister {
                        base, offset, src, ..
                    } => {
                        self.add_to_use_table(base.clone(), inst_id.clone(), function);
                        self.add_to_use_table(offset.clone(), inst_id.clone(), function);
                        self.add_to_use_table(src.clone(), inst_id.clone(), function);
                    }
                    InstructionData::LoadRegister {
                        base, offset, dst, ..
                    } => {
                        self.add_to_def_table(
                            dst.clone(),
                            DefKind::InternalDef(inst_id.clone()),
                            function,
                        );
                        self.add_to_use_table(base.clone(), inst_id.clone(), function);
                        self.add_to_use_table(offset.clone(), inst_id.clone(), function);
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
                        self.add_to_def_table(
                            dst.clone(),
                            DefKind::InternalDef(inst_id.clone()),
                            function,
                        );
                        self.add_to_use_table(src.clone(), inst_id.clone(), function);
                    }
                    InstructionData::BrIf { test, .. } => {
                        self.add_to_use_table(test.clone(), inst_id.clone(), function);
                    }
                    InstructionData::StackAlloc { dst, .. } => self.add_to_def_table(
                        dst.clone(),
                        DefKind::InternalDef(inst_id.clone()),
                        function,
                    ),
                    InstructionData::Move { src, dst, .. } => {
                        self.add_to_def_table(
                            dst.clone(),
                            DefKind::InternalDef(inst_id.clone()),
                            function,
                        );
                        self.add_to_use_table(src.clone(), inst_id.clone(), function);
                    }
                    InstructionData::Call { params, dst, .. } => {
                        for value in params {
                            self.add_to_use_table(value.clone(), inst_id.clone(), function)
                        }
                        if let Some(value) = dst {
                            self.add_to_def_table(
                                value.clone(),
                                DefKind::InternalDef(inst_id.clone()),
                                function,
                            );
                        };
                    }
                    InstructionData::Ret { value, .. } => {
                        if let Some(val) = value {
                            self.add_to_use_table(val.clone(), inst_id.clone(), function);
                        }
                    }
                    InstructionData::Phi { dst, from, .. } => {
                        if self.is_value_register(dst, function) {
                            self.add_to_def_table(
                                dst.clone(),
                                DefKind::InternalDef(inst_id.clone()),
                                function,
                            )
                        }
                        for (_block, value) in from {
                            self.add_to_use_table(value.clone(), inst_id.clone(), function);
                        }
                    }
                    InstructionData::Jump { opcode: _, dst: _1 } => {}
                    InstructionData::Comment(_) => {}
                }
            }
        }
    }
}
