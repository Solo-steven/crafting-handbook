use crate::entities::function::Function;
use crate::entities::module::Module;
use crate::entities::r#type::{MemType, MemTypeData};
use crate::formatter::Formatter;
use std::cmp::Ordering;

fn sort_mem_type(mut ids: Vec<MemType>) -> Vec<MemType> {
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

impl Formatter {
    /// Format function, need module instance since we need format external name
    pub fn fmt_function(&self, symbol_name: &str, function: &Function, module: &Module) -> String {
        let mut string = String::new();
        // write signature
        let mut arguments_string = String::new();
        for index in 0..function.signature.params.len() {
            let ty = &function.signature.params[index];
            let param = &function.entities.params[index];
            if index == 0 {
                arguments_string.push_str(format!("reg{}: {}", param.0, self.fmt_value_type(ty, function)).as_str());
            } else {
                arguments_string.push_str(format!(", reg{}: {}", param.0, self.fmt_value_type(ty, function)).as_str());
            }
        }
        string.push_str(format!("func {} ({})", symbol_name, arguments_string).as_str());
        if let Some(return_ty) = &function.signature.return_type {
            string.push_str(format!(": {}", &self.fmt_value_type(return_ty, function)).as_str());
        }
        // write puncator for function body start
        string.push_str(format!(" {{\n").as_str());
        // write structs
        let mem_types = sort_mem_type(function.mem_type.keys().map(|k| k.clone()).collect());
        for mem_type in &mem_types {
            let mem_data = function.mem_type.get(mem_type).unwrap();
            if let Some(mem_type_data_in_string) = self.fmt_mem_type_data(mem_data, function) {
                string.push_str(&format!(
                    "{} = {}",
                    self.fmt_struct_name(mem_type),
                    &mem_type_data_in_string
                ));
            }
        }
        // write global
        for (global, _) in &function.global_values {
            string.push_str(format!("  {}\n", self.fmt_global(global, function, module)).as_str());
        }
        // write block and instruction
        if let Some(mut block) = function.layout.first_block {
            loop {
                let block_layout = function.layout.blocks.get(&block).unwrap();
                string.push_str(format!("block{}:\n", block.0).as_str());
                let mut cur_inst = block_layout.first_inst.clone();
                loop {
                    if let Some(inst) = cur_inst {
                        string.push_str(format!("  {}\n", self.fmt_inst(inst, function, module)).as_str());
                        let inst_node = function.layout.insts.get(&inst).unwrap();
                        cur_inst = inst_node.next.clone()
                    } else {
                        break;
                    }
                }
                if let Some(next_block) = function.layout.blocks.get(&block).unwrap().next {
                    block = next_block;
                } else {
                    break;
                }
            }
        }
        // write puncator for function body end
        string.push_str(format!("}}").as_str());

        string
    }
    fn fmt_mem_type_data(&self, mem_data: &MemTypeData, function: &Function) -> Option<String> {
        if let MemTypeData::Struct(struct_type) = mem_data {
            let mut string = format!("{{ ");
            let mut is_start = true;
            for field in &struct_type.fields {
                if is_start {
                    is_start = false
                } else {
                    string.push_str(", ");
                }
                string.push_str(&self.fmt_value_type(&field.ty, function));
            }
            string.push_str(" }\n");
            Some(string)
        } else {
            None
        }
    }
}
