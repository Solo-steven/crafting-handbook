
use std::collections::HashMap;

use crate::ir::function::*;
use crate::ir::function::print::get_text_format_of_datatype;
use crate::ir::value::*;
#[derive(Debug, Clone)]
pub struct GloablValue {
    pub size: usize,
    pub align: usize,
    pub ir_type: Option<IrValueType>,
    pub init_value: Option<Value>
}

pub type GloablValueMap = HashMap<String, GloablValue>;

pub struct Module {
    pub functions: Vec<Function>,
    pub globals: GloablValueMap,
    pub values: ValueMap,
    pub value_types: TypeMap,
    pub const_string: HashMap<String, usize>,
    pub next_value_index: usize,
    pub next_temp_register_index: usize,
}

impl Module {
    pub fn new() -> Self {
        Self {
            functions: Vec::new(),
            globals: Default::default(),
            value_types: Default::default(),
            values: Default::default(),
            next_temp_register_index: 1,
            next_value_index: 1,
            const_string: Default::default(),
        }
    }
    pub fn print_to_string(&self) -> String {
        let mut output_code = String::new();
        for (global, data) in &self.globals {
            output_code.push_str(format!(
                "{} =  global {}  size {}, align {} {}\n", 
                global,
                match &data.ir_type {
                    Some(ir) => get_text_format_of_datatype(ir),
                    None => "aggregate",
                },
                data.size,
                data.align,
                match &data.init_value {
                    Some(value) => format!("= {}",get_text_format_of_value(self.values.get(value).unwrap()).as_str()),
                    None => String::from(""),
                }
            ).as_str())
        }
        for (const_string, index) in &self.const_string {
            output_code.push_str(
                format!(
                    "str{} = {}\n",
                    index,
                    const_string
                ).as_str())
        }
        for fun in &self.functions {
            output_code.push_str(fun.print_to_string().as_ref());
        }
        output_code
    }
    pub fn create_global_variable_ref(&mut self, global_name: String) -> Value {
        println!("{:?}", global_name);
        let value_id = Value(self.next_value_index);
        self.values.insert(value_id, ValueData::GlobalRef(global_name));
        self.value_types.insert(value_id, IrValueType::Address);
        self.next_value_index += 1;
        value_id
    }
    /// Create u8 const and insert into value list.
    pub fn create_u8_const(&mut self, data: u8) -> Value {
        let value_id =  Value(self.next_value_index);
        self.next_value_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::U8(data)));
        value_id
    }
    /// Create u16 const and insert into value list.
    pub fn create_u16_const(&mut self, data: u16) -> Value {
        let value_id =  Value(self.next_value_index);
        self.next_value_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::U16(data)));
        value_id
    }    
    /// Create u32 const and insert into value list.
    pub fn create_u32_const(&mut self, data: u32) -> Value {
        let value_id =  Value(self.next_value_index);
        self.next_value_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::U32(data)));
        value_id
    }
    /// Create u64 const and insert into value list.
    pub fn create_u64_const(&mut self, data: u64)-> Value {
        let value_id =  Value(self.next_value_index);
        self.next_value_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::U64(data)));
        value_id
    }
    /// Create i16 const and insert into value list.
    pub fn create_i16_const(&mut self, data: i16) -> Value {
        let value_id =  Value(self.next_value_index);
        self.next_value_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::I16(data)));
        value_id
    }   
    /// Create i32 const and insert into value list.
    pub fn create_i32_const(&mut self, data: i32) -> Value {
        let value_id =  Value(self.next_value_index);
        self.next_value_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::I32(data)));
        value_id
    }
    /// Create i64 const and insert into value list.
    pub fn create_i64_const(&mut self, data: i64) -> Value {
        let value_id =  Value(self.next_value_index);
        self.next_value_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::I64(data)));
        value_id
    }
    /// Create f32 const and insert into value list.
    pub fn create_f32_const(&mut self, data: f32) -> Value {
        let value_id =  Value(self.next_value_index);
        self.next_value_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::F32(data)));
        value_id
    }
    /// Create f64 const and insert into value list.
    pub fn create_f64_const(&mut self, data: f64) -> Value {
        let value_id = Value(self.next_temp_register_index);
        self.next_temp_register_index += 1;
        self.values.insert(value_id, ValueData::Immi(Immi::F64(data)));
        value_id
    }
}
/// Get the text format of a ValueData
pub fn get_text_format_of_value(value: &ValueData) -> String {
    match value {
        ValueData::Immi(immi) => {
            match immi {
                Immi::U8(data) => format!("{}",data),
                Immi::U16(data) => format!("{}", data),
                Immi::I16(data) => format!("{}", data),
                Immi::I32(data) => format!("{}", data),
                Immi::I64(data) => format!("{}", data),
                Immi::U32(data) => format!("{}", data),
                Immi::U64(data) => format!("{}", data),
                Immi::F32(data) => format!("{}", data),
                Immi::F64(data) => format!("{}", data),
            }
        }
        ValueData::VirRegister(register) | ValueData::GlobalRef(register) | ValueData::FunctionRef(register) => {
            register.clone()
        }
    }
}