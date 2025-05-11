use std::collections::HashMap;

use crate::entities::external_name::{ExternalName, UserDefNamespace};
use crate::entities::function::{ExternalFunctionData, Function};
use crate::entities::global_value::{GlobalValue, GlobalValueData};
// use crate::entities::r#type::{MemType, MemTypeData};

/// Module level entity for compiler
///
/// A module should contain function and data and a symbol table to map the
/// symbol name to data or function.
pub struct Module {
    pub functions: HashMap<FuncId, Function>,
    pub data_objects: HashMap<DataId, DataDescription>,
    pub symbol_table: HashMap<String, ModuleLevelId>,
    // mem_types: HashMap<MemType, MemTypeData>,
}
/// Reference to data in module
#[derive(Debug, PartialEq, Clone, Eq, Hash, Copy)]
pub struct DataId(pub u32);
#[derive(Debug, PartialEq, Clone)]
pub struct DataDescription {}

impl DataDescription {
    pub fn new() -> Self {
        Self {}
    }
}
/// Reference to function in module
#[derive(Debug, PartialEq, Clone, Eq, Hash, Copy)]
pub struct FuncId(pub u32);
/// Reference to function in module
#[derive(Debug, PartialEq, Clone, Eq, Hash, Copy)]
pub enum ModuleLevelId {
    Func(FuncId),
    Data(DataId),
    // Mem(MemType),
}
impl Module {
    /// Private method to get the next index of data objects
    fn get_data_len(&self) -> u32 {
        self.data_objects.len() as u32
    }
    /// Private method to get the next index of functions
    fn get_function_len(&self) -> u32 {
        self.functions.len() as u32
    }
    // fn get_mem_type_len(&self) -> u32 {
    //     self.mem_types.len() as u32
    // }
}
impl Module {
    pub fn new() -> Self {
        Self {
            functions: HashMap::new(),
            data_objects: HashMap::new(),
            symbol_table: HashMap::new(),
        }
    }
    /// Define a data
    /// define a data in module level, with a name to insert into symbol table
    /// this function will not declar global value data in function level, if
    /// needed to let function access to it, need to call `declar_data_in_function`.
    pub fn define_data(&mut self, name: &str, data_description: DataDescription) -> DataId {
        let data_id = DataId(self.get_data_len());
        self.data_objects.insert(data_id, data_description);
        self.symbol_table.insert(name.to_owned(), ModuleLevelId::Data(data_id));
        data_id
    }
    /// Declarate a data in function
    /// declarate a data in a function, this function will create a global value data with external
    /// name to connect to module in given function, the data must be defined before call this function.
    pub fn declar_data_in_function(&mut self, data_id: DataId, function_id: FuncId) -> GlobalValue {
        let func = self.functions.get_mut(&function_id).unwrap();
        func.declar_global_value(GlobalValueData::Symbol {
            name: ExternalName::UserDefName {
                namespace: UserDefNamespace::Data,
                value: data_id.0,
            },
        })
    }
    /// Get data reference by Data Id
    pub fn get_data(&mut self, data_id: DataId) -> Option<&DataDescription> {
        self.data_objects.get(&data_id)
    }
    /// Get data mutatble reference by data id
    pub fn get_mut_data(&mut self, data_id: DataId) -> Option<&mut DataDescription> {
        self.data_objects.get_mut(&data_id)
    }
    /// Declarate a empty function
    /// This function only create a placeholder, to add return type and param type
    /// you will need to get mutable reference to mutate the function.
    pub fn declar_function(&mut self, name: &str) -> FuncId {
        let func_id = FuncId(self.get_function_len());
        self.functions.insert(func_id, Function::new());
        self.symbol_table.insert(name.to_owned(), ModuleLevelId::Func(func_id));
        func_id
    }
    pub fn define_function(&mut self, name: &str, function: Function) -> FuncId {
        let func_id = FuncId(self.get_function_len());
        self.functions.insert(func_id, function);
        self.symbol_table.insert(name.to_owned(), ModuleLevelId::Func(func_id));
        func_id
    }
    /// Declarare function signature to another function
    /// declar `source` function into the `target` function.
    pub fn declar_function_in_function(&mut self, source: FuncId, target: FuncId) {
        let source_func_sig = self.functions.get(&source).unwrap().signature.clone();
        let target_func = self.functions.get_mut(&target).unwrap();
        target_func.declar_external_function(ExternalFunctionData {
            sig: source_func_sig,
            name: ExternalName::UserDefName {
                namespace: UserDefNamespace::Function,
                value: source.0,
            },
        });
    }
    /// Get function reference by function id
    pub fn get_function(&self, func_id: FuncId) -> Option<&Function> {
        self.functions.get(&func_id)
    }
    /// Get function mutable reference by function id
    pub fn get_mut_function(&mut self, func_id: FuncId) -> Option<&mut Function> {
        self.functions.get_mut(&func_id)
    }
    /// Get module level id from symbol name
    pub fn get_module_id_by_symbol(&self, symbol: &str) -> Option<&ModuleLevelId> {
        self.symbol_table.get(symbol)
    }
    pub fn get_symbol_by_module_id(&self, id: ModuleLevelId) -> Option<&str> {
        for (sym_name, sym_id) in &self.symbol_table {
            if *sym_id == id {
                return Some(&sym_name);
            }
        }
        None
    }
}
