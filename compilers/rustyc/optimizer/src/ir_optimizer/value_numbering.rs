use std::collections::HashMap;

use crate::ir::function::*;
use crate::ir::value::*;
use crate::ir::instructions::*;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum InstOpKey {
    Binary((usize, usize, OpCode)),
    Unary((usize, OpCode)),
    Cmp((usize, usize, CmpFlag)),
}
pub type NumberingTable = HashMap<Value, usize>;
pub type CacheTable = HashMap<InstOpKey, Value>;
/// Performance local value numbering for a basic block in a function
pub fn local_value_numbering(block_id: BasicBlock, function: &mut Function, numbering_table: &mut NumberingTable, cache_table: &mut CacheTable) {
    let block_data = function.blocks.get(&block_id).unwrap();
    for inst_id in  &block_data.instructions {
        let inst = function.instructions.get_mut(inst_id).unwrap();
        let possible_key = construct_key_from_inst(inst, numbering_table);
        if let Some((key, dst)) = possible_key {
            if cache_table.contains_key(&key) {
                let src = cache_table.get(&key).unwrap().clone();
                *inst = InstructionData::Move { opcode: OpCode::Mov, src, dst, };
            }else {
                cache_table.insert(key, dst);
            }
        }
    }
}
/// Construct Key for a instruction. some instruction can not be semms as redundant, like load instruction or stackalloc
/// instruction, so if meet those instruction, will return a None to stop table lookup.
fn construct_key_from_inst(inst: &InstructionData, numbering_table: &mut NumberingTable) -> Option<(InstOpKey, Value)> {
    match inst {
        InstructionData::Add { opcode, src1, src2, dst } |
        InstructionData::Sub { opcode, src1, src2, dst } |
        InstructionData::Mul { opcode, src1, src2, dst } |
        InstructionData::Divide { opcode, src1, src2, dst } |
        InstructionData::Reminder { opcode , src1, src2, dst } |
        InstructionData::FAdd { opcode , src1, src2, dst } |
        InstructionData::FSub { opcode , src1, src2, dst } |
        InstructionData::FMul { opcode, src1, src2, dst } |
        InstructionData::FDivide { opcode, src1, src2, dst } |
        InstructionData::FReminder { opcode , src1, src2, dst } |
        InstructionData::BitwiseAnd { opcode , src1, src2, dst } |
        InstructionData::BitwiseOR { opcode , src1, src2, dst } |
        InstructionData::LogicalAnd { opcode , src1, src2, dst } |
        InstructionData::LogicalOR { opcode , src1, src2, dst }  |
        InstructionData::ShiftLeft { opcode , src1, src2, dst } |
        InstructionData::ShiftRight { opcode , src1, src2, dst } => {
            let src1_number =  get_numbering(src1, numbering_table);
            let src2_number =  get_numbering(src2, numbering_table);
            
            Some((InstOpKey::Binary((src1_number, src2_number,opcode.clone())), dst.clone()))
        },
        InstructionData::Neg { opcode, src, dst } |
        InstructionData::BitwiseNot { opcode , src, dst } |
        InstructionData::LogicalNot { opcode, src, dst } |
        InstructionData::ToU8 { opcode , src, dst } |
        InstructionData::ToU16 { opcode , src, dst } |
        InstructionData::ToU32 { opcode, src, dst } |
        InstructionData::ToU64 { opcode , src, dst } |
        InstructionData::ToI16 { opcode , src, dst } |
        InstructionData::ToI32 { opcode , src, dst } |
        InstructionData::ToI64 { opcode , src, dst } |
        InstructionData::ToF32 { opcode , src, dst } |
        InstructionData::ToF64 { opcode , src, dst }  => {
            let src_number = get_numbering(src, numbering_table);
            Some((InstOpKey::Unary((src_number, opcode.clone())), dst.clone()))
        },
        InstructionData::Icmp { opcode: _, flag, src1, src2, dst } |
        InstructionData::Fcmp { opcode: _, flag, src1, src2, dst }=> {
            let src1_number =  get_numbering(src1, numbering_table);
            let src2_number =  get_numbering(src2, numbering_table);
            Some((InstOpKey::Cmp((src1_number, src2_number, flag.clone())), dst.clone()))
        }
        // those instruction should not be see as redunent.
        InstructionData::Jump { opcode:_, dst: _dst } => None,
        InstructionData::BrIf { opcode, test, conseq , alter } => None,
        InstructionData::StackAlloc { opcode, size, align, dst } => None,
        InstructionData::StoreRegister { opcode, base, offset, src, data_type } => None,
        InstructionData::LoadRegister { opcode:_, base, offset, dst, data_type } => None,
        InstructionData::Call { params: _ }=> None,
        InstructionData::Move { opcode, src, dst } => None,
        // TODO: Phi
        _ => None,
    }
}
/// Helper function for getting a value numbering from numbering table,
/// if value not existed in numbering table, insert a new one.
fn get_numbering(src: &Value, numbering_table: &mut NumberingTable) -> usize {
    if !numbering_table.contains_key(src) {
        let next_index = numbering_table.len();
        numbering_table.insert(src.clone(), next_index);
        next_index
    }else {
        numbering_table.get(src).unwrap().clone()
    }
}