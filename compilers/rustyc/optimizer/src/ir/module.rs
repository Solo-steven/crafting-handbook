
use std::collections::HashMap;

use crate::ir::function::*;
use crate::ir::function::print::get_text_format_of_datatype;
use crate::ir::value::IrValueType;
#[derive(Debug, Clone)]
pub struct GloablValue {
    pub size: usize,
    pub align: usize,
    pub ir_type: Option<IrValueType>,
}

pub type GloablValueMap = HashMap<String, GloablValue>;

pub struct Module {
    pub functions: Vec<Function>,
    pub globals: GloablValueMap,
}

impl Module {
    pub fn print_to_string(&self) -> String {
        let mut output_code = String::new();
        for (global, data) in &self.globals {
            output_code.push_str(format!(
                "{} =  global {}  size {}, align {}\n", 
                global,
                match &data.ir_type {
                    Some(ir) => get_text_format_of_datatype(ir),
                    None => "aggregate",
                },
                data.size,
                data.align,
            ).as_str())
        }
        for fun in &self.functions {
            output_code.push_str(fun.print_to_string().as_ref());
        }
        output_code
    }
}