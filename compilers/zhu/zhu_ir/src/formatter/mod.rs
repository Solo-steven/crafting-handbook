use crate::entities::external_name::{ExternalName, UserDefNamespace};
use crate::entities::function::Function;
use crate::entities::global_value::{GlobalValue, GlobalValueData};
use crate::entities::module::{DataDescription, DataId, FuncId, Module, ModuleLevelId};
use crate::entities::r#type::{MemType, MemTypeData, ValueType};
use std::cmp::Ordering;

pub mod func;
pub mod inst;

fn sort_func_ids(mut ids: Vec<FuncId>) -> Vec<FuncId> {
    ids.sort_by(|a, b| {
        if a.0 == b.0 {
            Ordering::Equal
        } else if a.0 < b.0 {
            Ordering::Less
        } else {
            Ordering::Greater
        }
    });
    ids
}

pub struct Formatter {}

impl Formatter {
    /// Create a new formatter
    pub fn new() -> Self {
        Self {}
    }
    /// Private method to formate data description
    fn fmt_data_description(&self, _data_description: &DataDescription, _module: &Module) -> String {
        format!("{{}}")
    }
    /// Format a module
    pub fn fmt_module(&self, module: &Module) -> String {
        let mut module_in_string = String::new();
        for (data_id, data_obj) in &module.data_objects {
            let sym_name = module
                .get_symbol_by_module_id(ModuleLevelId::Data(data_id.clone()))
                .unwrap();
            module_in_string
                .push_str(format!("{} = @data {}\n", sym_name, self.fmt_data_description(data_obj, module)).as_str())
        }
        let func_ids = sort_func_ids(module.functions.keys().map(|k| k.clone()).collect());
        for func_id in func_ids {
            let func = module.functions.get(&func_id).unwrap();
            let sym_name = module
                .get_symbol_by_module_id(ModuleLevelId::Func(func_id.clone()))
                .unwrap();
            module_in_string.push_str(self.fmt_function(sym_name, func, module).as_str());
            module_in_string.push('\n');
        }
        module_in_string
    }
    /// Private function to format global data
    fn fmt_global(&self, global: &GlobalValue, function: &Function, module: &Module) -> String {
        let global_data = function.global_values.get(global).unwrap();
        let rhs_text = match global_data {
            GlobalValueData::Symbol { name } => {
                format!("symbol {}", self.fmt_external_name(name, module))
            }
            GlobalValueData::Load { base, offset, ty } => {
                format!("{}, load [{}, {}]", self.fmt_value_type(ty, function), base.0, offset.0)
            }
            GlobalValueData::AddI { base, offset, ty } => {
                format!("{}, addi [{}, {}]", self.fmt_value_type(ty, function), base.0, offset.0)
            }
        };
        format!("greg{} = @global {}", global.0, rhs_text)
    }
    /// Private method to format value type
    fn fmt_value_type(&self, ty: &ValueType, function: &Function) -> String {
        match ty {
            ValueType::U8 => format!("u8"),
            ValueType::U16 => format!("u16"),
            ValueType::U32 => format!("u32"),
            ValueType::U64 => format!("u64"),
            ValueType::I16 => format!("i16"),
            ValueType::I32 => format!("i32"),
            ValueType::I64 => format!("i64"),
            ValueType::F32 => format!("f32"),
            ValueType::F64 => format!("f64"),
            ValueType::Mem(mem_type) => {
                let mem_type_data = function.mem_type.get(&mem_type).unwrap();
                match mem_type_data {
                    MemTypeData::Unknow => format!("mem"),
                    MemTypeData::Array(array_type) => {
                        format!(
                            "[{} * {}]",
                            array_type.size,
                            self.fmt_value_type(&array_type.ty, function)
                        )
                    }
                    MemTypeData::Struct(_) => self.fmt_struct_name(mem_type),
                }
            }
        }
    }
    /// Private function to format the external name
    fn fmt_external_name(&self, external_name: &ExternalName, module: &Module) -> String {
        match external_name {
            ExternalName::UserDefName { namespace, value } => match namespace {
                UserDefNamespace::Data => {
                    format!(
                        "{}",
                        module
                            .get_symbol_by_module_id(ModuleLevelId::Data(DataId(*value)))
                            .unwrap()
                    )
                }
                UserDefNamespace::Function => {
                    format!(
                        "{}",
                        module
                            .get_symbol_by_module_id(ModuleLevelId::Func(FuncId(*value)))
                            .unwrap()
                    )
                }
                UserDefNamespace::Other(other_ty) => {
                    format!("User_{}_{}", other_ty, value)
                }
            },
        }
    }
    fn fmt_struct_name(&self, mem_type: &MemType) -> String {
        format!("struct%{}", mem_type.0)
    }
}

pub fn format(module: &Module) -> String {
    let formatter = Formatter::new();
    formatter.fmt_module(module)
}
