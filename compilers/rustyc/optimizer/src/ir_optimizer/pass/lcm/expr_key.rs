use crate::ir::function::Function;
use crate::ir::instructions::{CmpFlag, Instruction, InstructionData, OpCode};
use crate::ir::value::Value;
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum ExpreKey {
    Binary((Value, Value, OpCode)),
    Unary((Value, OpCode)),
    Cmp((Value, Value, CmpFlag)),
}

pub type ExprValueNumber = u64;
pub type ExprValueNumberSet = HashSet<ExprValueNumber>;

pub fn get_expr_key_and_values(instruction: &InstructionData) -> Option<(ExpreKey, Vec<Value>)> {
    match instruction {
        InstructionData::Add {
            opcode, src1, src2, ..
        }
        | InstructionData::Sub {
            opcode, src1, src2, ..
        }
        | InstructionData::Mul {
            opcode, src1, src2, ..
        }
        | InstructionData::Divide {
            opcode, src1, src2, ..
        }
        | InstructionData::Reminder {
            opcode, src1, src2, ..
        }
        | InstructionData::FAdd {
            opcode, src1, src2, ..
        }
        | InstructionData::FSub {
            opcode, src1, src2, ..
        }
        | InstructionData::FMul {
            opcode, src1, src2, ..
        }
        | InstructionData::FDivide {
            opcode, src1, src2, ..
        }
        | InstructionData::FReminder {
            opcode, src1, src2, ..
        }
        | InstructionData::BitwiseAnd {
            opcode, src1, src2, ..
        }
        | InstructionData::BitwiseOR {
            opcode, src1, src2, ..
        }
        | InstructionData::LogicalAnd {
            opcode, src1, src2, ..
        }
        | InstructionData::LogicalOR {
            opcode, src1, src2, ..
        }
        | InstructionData::ShiftLeft {
            opcode, src1, src2, ..
        }
        | InstructionData::ShiftRight {
            opcode, src1, src2, ..
        } => Some((
            ExpreKey::Binary((src1.clone(), src2.clone(), opcode.clone())),
            vec![src1.clone(), src2.clone()],
        )),
        InstructionData::Neg { opcode, src, .. }
        | InstructionData::BitwiseNot { opcode, src, .. }
        | InstructionData::LogicalNot { opcode, src, .. }
        | InstructionData::ToU8 { opcode, src, .. }
        | InstructionData::ToU16 { opcode, src, .. }
        | InstructionData::ToU32 { opcode, src, .. }
        | InstructionData::ToU64 { opcode, src, .. }
        | InstructionData::ToI16 { opcode, src, .. }
        | InstructionData::ToI32 { opcode, src, .. }
        | InstructionData::ToI64 { opcode, src, .. }
        | InstructionData::ToF32 { opcode, src, .. }
        | InstructionData::ToF64 { opcode, src, .. }
        | InstructionData::ToAddress { opcode, src, .. } => Some((
            ExpreKey::Unary((src.clone(), opcode.clone())),
            vec![src.clone()],
        )),
        InstructionData::Icmp {
            opcode: _,
            flag,
            src1,
            src2,
            ..
        }
        | InstructionData::Fcmp {
            opcode: _,
            flag,
            src1,
            src2,
            ..
        } => Some((
            ExpreKey::Cmp((src1.clone(), src2.clone(), flag.clone())),
            vec![src1.clone(), src2.clone()],
        )),
        _ => None,
    }
}

pub fn get_dst_value(instruction: &InstructionData) -> Option<Value> {
    match instruction {
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
        | InstructionData::Icmp { dst, .. }
        | InstructionData::Fcmp { dst, .. }
        | InstructionData::Move { dst, .. }
        | InstructionData::Phi { dst, .. }
        | InstructionData::LoadRegister { dst, .. }
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
        | InstructionData::ToAddress { dst, .. } => Some(dst.clone()),
        _ => None,
    }
}
/// ## ExprKeyManager: Manage ExprKey for us.
///
pub(super) struct ExprKeyManager {
    // cache set of all expr key
    all_expr_value_number: ExprValueNumberSet,
    // 1-to-1 mapping of value number and exprkey
    value_number_map_expr_key: HashMap<ExprValueNumber, ExpreKey>,
    // revserse mapping of expr key to value number.
    expr_key_map_value_number: HashMap<ExpreKey, ExprValueNumber>,
    /// Mapping relation of ExprKey and Inst, ExprKey is constructed by right
    /// hand side of inst, so multi inst might have same key, but for inst it
    /// -self, it would only have a value number.
    inst_map_value_number: HashMap<Instruction, ExprValueNumber>,
    /// Mapping of relation of ExprKey to it's inst, since ExprKey only take
    /// right hand side to construct key, a key could map to multi inst.
    value_number_map_inst: HashMap<ExprValueNumber, HashSet<Instruction>>,
    /// Mapping a dst value to the ExprKey it kill, used for build kill set
    /// of LCM.
    ir_value_map_kill_exprs: HashMap<Value, ExprValueNumberSet>,
}

impl ExprKeyManager {
    pub fn new() -> Self {
        Self {
            all_expr_value_number: Default::default(),
            value_number_map_expr_key: Default::default(),
            expr_key_map_value_number: Default::default(),
            inst_map_value_number: Default::default(),
            value_number_map_inst: Default::default(),
            ir_value_map_kill_exprs: Default::default(),
        }
    }
    pub fn build_tables_mapping(&mut self, function: &Function) {
        for (inst, inst_data) in &function.instructions {
            if let Some((key, values)) = get_expr_key_and_values(inst_data) {
                // for use
                let value_number =
                    if let Some(value_number) = self.expr_key_map_value_number.get(&key) {
                        self.inst_map_value_number
                            .insert(inst.clone(), value_number.clone());
                        value_number.clone()
                    } else {
                        let next_value_number = self.value_number_map_expr_key.len() as u64;
                        self.all_expr_value_number.insert(next_value_number);
                        self.inst_map_value_number
                            .insert(inst.clone(), next_value_number);
                        self.value_number_map_expr_key
                            .insert(next_value_number, key.clone());
                        self.expr_key_map_value_number
                            .insert(key, next_value_number);
                        next_value_number
                    };
                if let Some(inst_set) = self.value_number_map_inst.get_mut(&value_number) {
                    inst_set.insert(inst.clone());
                } else {
                    let mut inst_set: HashSet<Instruction> = Default::default();
                    inst_set.insert(inst.clone());
                    self.value_number_map_inst.insert(value_number, inst_set);
                }
                // for kill
                for valus in values {
                    if let Some(key_set) = self.ir_value_map_kill_exprs.get_mut(&valus) {
                        key_set.insert(value_number);
                    } else {
                        let mut key_set: HashSet<ExprValueNumber> = Default::default();
                        key_set.insert(value_number);
                        self.ir_value_map_kill_exprs.insert(valus, key_set);
                    }
                }
            }
        }
    }
    /// ## Get expr value number from inst id
    /// This function is used to build `expr_use` set of LCM.
    pub fn get_expr_value_number_from_inst(
        &self,
        instruction: &Instruction,
    ) -> Option<&ExprValueNumber> {
        self.inst_map_value_number.get(instruction)
    }
    /// ## Get expr value numbers from value (dst)
    /// This function is used to build `expr_kil` set of LCM.
    pub fn get_kill_expr_value_numbers_from_dst_value(
        &self,
        value: &Value,
    ) -> Option<&HashSet<ExprValueNumber>> {
        self.ir_value_map_kill_exprs.get(value)
    }
    /// ## Get entire value number set
    /// This function is used by every fixed point algorithm
    /// to get the init set.
    pub fn get_value_number_set(&self) -> ExprValueNumberSet {
        self.all_expr_value_number.clone()
    }
    /// ##
    pub fn get_expr_key_from_value_number(
        &self,
        value_number: &ExprValueNumber,
    ) -> Option<&ExpreKey> {
        self.value_number_map_expr_key.get(value_number)
    }
    pub fn borrow_all_expr_keys(&self) -> &ExprValueNumberSet {
        &self.all_expr_value_number
    }
    // Used when rewrite
    // pub fn get_insts_from_value_number() {

    // }
}

pub fn get_content_ref_of_set<'a>(
    hash_set: &'a ExprValueNumberSet,
) -> HashSet<&'a ExprValueNumber> {
    hash_set.into_iter().map(|key| key).collect()
}
pub fn content_ref_set_to_own(hash_set: HashSet<&ExprValueNumber>) -> ExprValueNumberSet {
    hash_set.into_iter().map(|key| key.clone()).collect()
}
pub fn intersection_content_ref_sets<'a>(
    target_set: HashSet<&'a ExprValueNumber>,
    other_set: HashSet<&'a ExprValueNumber>,
) -> HashSet<&'a ExprValueNumber> {
    target_set
        .intersection(&other_set)
        .into_iter()
        .map(|key| *key)
        .collect()
}
pub fn union_content_ref_sets<'a>(
    target_set: HashSet<&'a ExprValueNumber>,
    other_set: HashSet<&'a ExprValueNumber>,
) -> HashSet<&'a ExprValueNumber> {
    target_set
        .union(&other_set)
        .into_iter()
        .map(|key| *key)
        .collect()
}
pub fn different_content_ref_sets<'a>(
    target_set: HashSet<&'a ExprValueNumber>,
    other_set: HashSet<&'a ExprValueNumber>,
) -> HashSet<&'a ExprValueNumber> {
    target_set
        .difference(&other_set)
        .into_iter()
        .map(|key| *key)
        .collect()
}
