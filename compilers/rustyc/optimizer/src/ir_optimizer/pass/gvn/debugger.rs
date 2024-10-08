use super::GVNPass;
use crate::ir::function::Function;
use crate::ir::instructions::Instruction;
use crate::ir_optimizer::pass::DebuggerPass;
use crate::ir_optimizer::print_table_helper::{get_max_block_id_len, print_divider, print_header};
use std::collections::HashMap;

impl<'a> DebuggerPass for GVNPass<'a> {
    fn debugger(&self, function: &Function) -> String {
        let mut output_string = String::new();
        // get inst len
        let inst_map_string: &HashMap<Instruction, String> = &self.cache_inst_strings;
        let mut max_len_of_insts = 0 as usize;
        for string in &inst_map_string.values().collect::<Vec<_>>() {
            if max_len_of_insts < string.len() {
                max_len_of_insts = string.len();
            }
        }

        let max_block_len = get_max_block_id_len(function);
        let row_len = max_len_of_insts + max_block_len + "block ".len() + 2;
        output_string.push_str(&print_divider(row_len));
        output_string.push_str(&print_header("GVN Table", row_len));
        output_string.push_str(&print_divider(row_len));
        for (block_id, inst) in &self.need_remove_insts {
            output_string.push_str(&print_header(
                format!("block {}: {}", block_id.0, inst_map_string.get(inst).unwrap()).as_str(),
                row_len,
            ));
        }
        output_string.push_str(&print_divider(row_len));
        output_string
    }
}
