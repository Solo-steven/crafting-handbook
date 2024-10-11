use super::DCEPass;
use crate::ir::function::Function;
use crate::ir_optimizer::pass::DebuggerPass;
use crate::ir_optimizer::print_table_helper::{print_divider, print_header, sort_inst_ids};

impl<'a> DebuggerPass for DCEPass<'a> {
    fn debugger(&self, _function: &Function) -> String {
        if let Some(map) = &self.debug_mark_inst_map_string {
            // get max len of instruction
            let mut max_len_of_inst = 0 as usize;
            for inst_string in map.values() {
                if inst_string.len() > max_len_of_inst {
                    max_len_of_inst = inst_string.len();
                }
            }
            let row_len = if "Marked Inst".len() > max_len_of_inst {
                "Marked Inst".len()
            } else {
                max_len_of_inst
            } + 10;
            let mut output_code = String::new();
            output_code.push_str(print_divider(row_len).as_str());
            output_code.push_str(print_header("Marked Inst", row_len).as_str());
            output_code.push_str(print_divider(row_len).as_str());
            print_divider(row_len);
            let sorted_insts = sort_inst_ids(self.marked_insts.iter().map(|k| k.clone()).collect::<Vec<_>>());
            for inst in sorted_insts {
                let inst_string = map.get(&inst).unwrap();
                output_code.push_str(print_header(&inst_string, row_len).as_str());
            }
            output_code
        } else {
            String::new()
        }
    }
}

impl<'a> DCEPass<'a> {
    pub(super) fn store_debuuger_info(&mut self, function: &Function) {
        if let Some(map) = &mut self.debug_mark_inst_map_string {
            for inst in self.marked_insts.clone() {
                let inst_data = function.instructions.get(&inst).unwrap();
                let mut output = String::new();
                function.print_inst(&mut output, inst_data);
                output = String::from(output.trim());
                map.insert(inst, output);
            }
        }
    }
}
