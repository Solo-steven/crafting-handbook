use std::collections::HashMap;

use super::SSCPPass;
use crate::ir::function::Function;
use crate::ir::value::ValueData;
use crate::ir_optimizer::pass::DebuggerPass;
use crate::ir_optimizer::print_table_helper::{print_divider, print_header, sort_value_ids};

impl<'a> DebuggerPass for SSCPPass<'a> {
    fn debugger(&self, function: &Function) -> String {
        let mut output = String::new();
        let sorted_values = sort_value_ids(self.lvalue_map_element.keys().map(|k| k.clone()).collect());
        let mut row_size = 0 as usize;
        let mut element_string_map = HashMap::new();
        for (value, element) in &self.lvalue_map_element {
            let element_string = format!("{:?}", element);
            if element_string.len() > row_size {
                row_size = element_string.len();
            }
            element_string_map.insert(value.clone(), element_string);
        }
        row_size += 15;
        output.push_str(print_divider(row_size).as_str());
        output.push_str(print_header("Lattice Element", row_size).as_str());
        output.push_str(print_divider(row_size).as_str());
        for value in sorted_values {
            let reg = match function.values.get(&value).unwrap() {
                ValueData::VirRegister(reg) | ValueData::FunctionRef(reg) | ValueData::GlobalRef(reg) => reg,
                _ => unreachable!(),
            };
            let element_string = element_string_map.get(&value).unwrap();
            output.push_str(print_header(format!("{} = {}", reg, element_string).as_str(), row_size).as_str());
        }
        output.push_str(print_divider(row_size).as_str());

        output
    }
}
