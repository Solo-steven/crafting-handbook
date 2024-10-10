use std::collections::HashMap;

use super::{DefKind, UseDefAnaylsier, UseDefTable, ValueData};
use crate::ir::instructions::Instruction;
use crate::ir::value::Value;
use crate::ir_optimizer::anaylsis::DebuggerAnaylsis;
use crate::ir_optimizer::print_table_helper::{
    print_divider, print_header, print_table_row, sort_inst_ids, sort_value_ids,
};

impl DebuggerAnaylsis<UseDefTable> for UseDefAnaylsier {
    fn debugger(&mut self, function: &super::Function, table: &UseDefTable) -> String {
        let mut output_string = String::new();

        // get all inst string and max inst string len
        let mut inst_map_string: HashMap<Instruction, String> = HashMap::new();
        let mut max_len_of_insts = 0 as usize;
        for (inst, inst_data) in &function.instructions {
            let mut string = String::new();
            function.print_inst(&mut string, inst_data);
            string = string.trim().to_string();
            if max_len_of_insts < string.len() {
                max_len_of_insts = string.len();
            }
            inst_map_string.insert(inst.clone(), string);
        }
        max_len_of_insts += 2;
        // get all value string and max value len
        let mut value_map_string: HashMap<Value, String> = HashMap::new();
        let mut max_len_of_value = 0 as usize;
        for (value, value_data) in &function.values {
            if let ValueData::VirRegister(reg) = value_data {
                value_map_string.insert(value.clone(), reg.clone());
                if reg.len() > max_len_of_value {
                    max_len_of_value = reg.len();
                }
            }
        }
        max_len_of_value += 2;
        // get len of row
        let max_len = max_len_of_insts + max_len_of_value + 1;
        // print def table
        output_string.push_str(print_divider(max_len).as_str());
        output_string.push_str(print_header("Def Table", max_len).as_str());
        output_string.push_str(print_divider(max_len).as_str());
        let values = table.1.keys().into_iter().map(|k| k.clone()).collect::<Vec<_>>();
        let sorted_values = sort_value_ids(values);
        for value in sorted_values {
            let def_kind = table.1.get(&value).unwrap();
            match def_kind {
                DefKind::InternalDef(def_inst) => {
                    if let Some(reg_str) = value_map_string.get(&value) {
                        let inst_string = inst_map_string.get(def_inst).unwrap();
                        output_string.push_str(&print_table_row(
                            reg_str,
                            inst_string,
                            max_len_of_value,
                            max_len_of_insts,
                        ));
                    }
                }
                DefKind::ParamDef(value) => {
                    if let Some(reg_str) = value_map_string.get(&value) {
                        let value_data = {
                            if let Some(val) = function.values.get(value) {
                                if let ValueData::VirRegister(reg) = val {
                                    reg.clone()
                                } else {
                                    panic!("[unreach]")
                                }
                            } else {
                                panic!("[unreach]")
                            }
                        };
                        let right_string = format!("{}(param)", value_data);
                        output_string.push_str(&print_table_row(
                            reg_str,
                            &right_string,
                            max_len_of_value,
                            max_len_of_insts,
                        ));
                    }
                }
                _ => {}
            }
        }
        output_string.push_str(print_divider(max_len).as_str());
        // print use table
        output_string.push_str(print_divider(max_len).as_str());
        output_string.push_str(print_header("Use Table", max_len).as_str());
        output_string.push_str(print_divider(max_len).as_str());
        let values = table.0.keys().into_iter().map(|k| k.clone()).collect::<Vec<_>>();
        let sorted_values = sort_value_ids(values);
        for value in sorted_values {
            let insts = table.0.get(&value).unwrap();
            let mut index = 0 as usize;
            let insts_len = insts.len();
            let sorted_insts = sort_inst_ids(insts.into_iter().map(|k| k.clone()).collect());
            for inst in &sorted_insts {
                let left = if index != insts_len / 2 {
                    format!(" ")
                } else {
                    value_map_string.get(&value).unwrap().clone()
                };
                let inst_string = inst_map_string.get(inst).unwrap();
                //println!("{}", inst_string);
                output_string.push_str(&print_table_row(&left, inst_string, max_len_of_value, max_len_of_insts));
                index += 1;
            }
            output_string.push_str(print_divider(max_len).as_str());
        }
        output_string
    }
}
