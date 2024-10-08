mod builder;
pub mod print;
use crate::ir::instructions::*;
use crate::ir::value::*;
use std::collections::{HashMap, VecDeque};
#[derive(Debug, PartialEq, Clone)]
pub struct Function {
    pub name: String,
    pub return_type: Option<IrValueType>,

    pub instructions: InstructionMap,
    pub(super) next_inst_index: usize,

    pub blocks: BasicBlockMap,
    pub(super) next_block_index: usize,

    pub values: ValueMap,
    pub value_types: TypeMap,
    pub(super) next_value_index: usize,
    pub(super) next_temp_register_index: usize,
    /***** relationship *****/
    ///
    pub inst_map_block: HashMap<Instruction, BasicBlock>,
    pub params_value: Vec<Value>,

    pub entry_block: Vec<BasicBlock>,
    pub exit_block: Vec<BasicBlock>,

    pub current_block: Option<BasicBlock>,
}
#[derive(Debug, PartialEq, Clone, Hash, Eq, Copy)]
pub struct BasicBlock(pub usize);
#[derive(Debug, PartialEq, Clone)]
pub struct BasicBlockData {
    pub name: String,
    pub successor: Vec<BasicBlock>,
    pub predecessor: Vec<BasicBlock>,
    pub instructions: VecDeque<Instruction>,
}

pub type BasicBlockMap = HashMap<BasicBlock, BasicBlockData>;

impl Function {
    /// Create a new function with's name and param and return type
    pub fn new(name: String) -> Self {
        Function {
            name,
            return_type: None,
            instructions: HashMap::new(),
            next_inst_index: 1,
            blocks: HashMap::new(),
            next_block_index: 1,
            inst_map_block: HashMap::new(),
            params_value: Vec::new(),
            values: HashMap::new(),
            value_types: HashMap::new(),
            next_value_index: 1,
            next_temp_register_index: 1,
            entry_block: Vec::new(),
            exit_block: Vec::new(),
            current_block: None,
        }
    }
    fn get_next_inst_id(&mut self) -> Instruction {
        let id = self.next_inst_index;
        self.next_inst_index += 1;
        Instruction(id)
    }
    /// Create a basic block, and this block is not conncet yet.
    pub fn create_block(&mut self) -> BasicBlock {
        let block_id = BasicBlock(self.next_block_index);
        self.blocks.insert(
            block_id,
            BasicBlockData {
                name: format!("block{}", self.next_block_index),
                successor: Vec::new(),
                predecessor: Vec::new(),
                instructions: VecDeque::new(),
            },
        );
        self.next_block_index += 1;
        block_id
    }
    /// Connect two basic block as successor and predeccesor relationship.
    pub fn connect_block(&mut self, predecessor: BasicBlock, successor: BasicBlock) {
        let successor_block = self.blocks.get_mut(&successor);
        if let Some(s) = successor_block {
            s.predecessor.push(predecessor);
        } else {
            panic!("Block {:?} is not existed", successor);
        }
        let predecessor_block = self.blocks.get_mut(&predecessor);
        if let Some(pre) = predecessor_block {
            pre.successor.push(successor);
        } else {
            panic!("Block {:?} is not existed", predecessor);
        }
    }
    /// switch current block before insert any instruction to block.
    pub fn switch_to_block(&mut self, id: BasicBlock) {
        if let Some(_) = self.blocks.get(&id) {
            self.current_block = Some(id);
        } else {
            panic!("Block {:?} is not existed", id);
        }
    }
    /// mark block as entry
    pub fn mark_as_entry(&mut self, id: BasicBlock) {
        self.entry_block.push(id);
    }
    pub fn mark_as_exit(&mut self, id: BasicBlock) {
        self.exit_block.push(id);
    }
    /// Get basic block instrcution belong to.
    pub fn get_block_from_inst(&self, inst: &Instruction) -> Option<&BasicBlock> {
        self.inst_map_block.get(&inst)
    }
    pub fn insert_inst_to_block_front(&mut self, block: &BasicBlock, inst_data: InstructionData) -> Instruction {
        let inst_id = self.get_next_inst_id();
        self.blocks
            .get_mut(block)
            .unwrap()
            .instructions
            .push_front(inst_id.clone());
        self.instructions.insert(inst_id.clone(), inst_data);
        inst_id
    }
    pub fn remove_inst_from_block(&mut self, block: &BasicBlock, inst: &Instruction) {
        self.blocks
            .get_mut(block)
            .unwrap()
            .instructions
            .retain(|inst_id| inst != inst_id);
        self.instructions.remove(inst);
    }
    pub fn change_inst(&mut self, inst: &Instruction, inst_data: InstructionData) {
        self.instructions.remove(inst);
        self.instructions.insert(inst.clone(), inst_data);
    }
    pub fn insert_value_data_and_type(&mut self, value_data: ValueData, ir_type: Option<IrValueType>) -> Value {
        if let ValueData::Immi(_) = &value_data {
            let value_id = Value(self.next_value_index);
            self.values.insert(value_id, value_data);
            self.next_value_index += 1;
            value_id
        } else {
            let value_id = Value(self.next_value_index);
            self.values.insert(value_id, value_data);
            self.value_types.insert(value_id, ir_type.unwrap());
            self.next_value_index += 1;
            value_id
        }
    }
    /// ## Helper function to Align two value with same type.
    /// when performance some instuction, we maybe need to prompt or narrow data type for instruction.
    /// so we this helper function will generate convert instruction if need, you can givn this `target_type`
    /// or pass `None` to make prompt to highest type of two value.
    pub fn align_two_base_type_value_to_same_type(
        &mut self,
        mut left_value: Value,
        mut right_value: Value,
        target_type: Option<IrValueType>,
    ) -> (Value, Value, IrValueType) {
        let left_type = self.get_value_ir_type(left_value);
        let right_type = self.get_value_ir_type(right_value);
        match target_type {
            Some(target) => {
                if left_type != target {
                    left_value = self.generate_type_convert(left_value, &target);
                }
                if right_type != target {
                    right_value = self.generate_type_convert(right_value, &target);
                }
                (left_value, right_value, target)
            }
            None => {
                let target;
                // Get final type. Generate promot type if need,
                if left_type > right_type {
                    right_value = self.generate_type_convert(right_value, &left_type);
                    target = &left_type;
                } else if left_type < right_type {
                    left_value = self.generate_type_convert(left_value, &right_type);
                    target = &right_type;
                } else {
                    target = &left_type
                }
                (left_value, right_value, target.clone())
            }
        }
    }
    /// ## Helper functin to generate type convert
    /// this function will generate type convert instruction to target ir type.
    /// this function will not check is src value and target type is same.
    pub fn generate_type_convert(&mut self, src: Value, ir_type: &IrValueType) -> Value {
        match ir_type {
            IrValueType::Void => panic!(),
            IrValueType::U8 => self.build_to_u8_inst(src),
            IrValueType::U16 => self.build_to_u16_inst(src),
            IrValueType::U32 => self.build_to_u32_inst(src),
            IrValueType::U64 => self.build_to_u64_inst(src),
            IrValueType::I16 => self.build_to_i16_inst(src),
            IrValueType::I32 => self.build_to_i32_inst(src),
            IrValueType::I64 => self.build_to_i64_inst(src),
            IrValueType::F32 => self.build_to_f32_inst(src),
            IrValueType::F64 => self.build_to_f64_inst(src),
            IrValueType::Address => self.build_to_address_inst(src),
            _ => todo!(),
        }
    }
}
