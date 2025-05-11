use crate::entities::block::{Block, BlockData};
use crate::entities::constant::{Constant, ConstantData};
use crate::entities::external_name::ExternalName;
use crate::entities::function::entites::FunctionEntities;
use crate::entities::function::layout::FunctionLayout;
use crate::entities::global_value::{GlobalValue, GlobalValueData};
use crate::entities::instruction::{Instruction, InstructionData};
use crate::entities::r#type::{MemType, MemTypeData, ValueType};
use crate::entities::value::{Value, ValueData};
use std::collections::HashMap;

pub mod entites;
pub mod layout;

#[derive(Debug, PartialEq, Clone, Eq, Hash, Copy)]
pub struct FunctionRef(pub u32);
#[derive(Debug, PartialEq, Clone)]
pub struct FunctionSignature {
    pub params: Vec<ValueType>,
    pub return_type: Option<ValueType>,
}

impl FunctionSignature {
    pub fn new() -> Self {
        Self {
            params: Default::default(),
            return_type: None,
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ExternalFunctionData {
    pub sig: FunctionSignature,
    pub name: ExternalName,
}

#[derive(Debug, PartialEq, Clone)]
pub struct Function {
    // signature
    pub signature: FunctionSignature,
    // function body
    pub entities: FunctionEntities,
    pub layout: FunctionLayout,
    // function info
    pub mem_type: HashMap<MemType, MemTypeData>,
    pub constants: HashMap<Constant, ConstantData>,
    // (might be) external info
    pub external_funcs: HashMap<FunctionRef, ExternalFunctionData>,
    pub global_values: HashMap<GlobalValue, GlobalValueData>,
}

impl Function {
    pub fn new() -> Self {
        Self {
            signature: FunctionSignature::new(),
            entities: FunctionEntities::new(),
            layout: FunctionLayout::new(),
            mem_type: Default::default(),
            constants: Default::default(),
            external_funcs: Default::default(),
            global_values: Default::default(),
        }
    }
}

/// Data mutation to signature.
impl Function {
    pub fn def_func_param(&mut self, ty: ValueType) -> Value {
        self.signature.params.push(ty.clone());
        let param = self.entities.create_value(ValueData::Param {
            ty,
            index: self.signature.params.len() - 1,
        });
        self.entities.mark_param(param);
        param
    }
    pub fn set_return_type(&mut self, ty: ValueType) {
        self.signature.return_type = Some(ty);
    }
}
/// Data mutation to function block.
impl Function {
    /// Create Block in function. append block in the end of function.
    pub fn create_block(&mut self) -> Block {
        let block = self.entities.create_block(BlockData {
            phis: Default::default(),
            insts: Default::default(),
        });
        self.layout.append_block(block);
        block
    }
    /// Create remove a inst in layout.
    pub fn remove_inst(&mut self, inst: Instruction) {
        self.layout.remove_inst(inst);
    }
    /// replace a inst with given new inst data.
    pub fn replace_inst(&mut self, inst: Instruction, inst_data: InstructionData) {
        self.entities.insts.insert(inst, inst_data);
    }
}
impl Function {
    pub fn value_type(&self, value: Value) -> &ValueType {
        let value_data = self.entities.values.get(&value).unwrap();
        match value_data {
            ValueData::Inst { ty, .. } => ty,
            ValueData::Param { index, .. } => &self.signature.params[*index],
            ValueData::Alias { .. } => panic!(),
        }
    }
    pub fn declar_external_function(&mut self, exfun_data: ExternalFunctionData) -> FunctionRef {
        let func_ref = FunctionRef(self.external_funcs.len() as u32);
        self.external_funcs.insert(func_ref, exfun_data);
        func_ref
    }
    pub fn declar_global_value(&mut self, global_data: GlobalValueData) -> GlobalValue {
        let global_value = GlobalValue(self.global_values.len() as u32);
        self.global_values.insert(global_value, global_data);
        global_value
    }
    pub fn declar_mem_type(&mut self, mem_type_data: MemTypeData) -> MemType {
        let mem_type = MemType(self.mem_type.len() as u32);
        self.mem_type.insert(mem_type, mem_type_data);
        mem_type
    }
}
