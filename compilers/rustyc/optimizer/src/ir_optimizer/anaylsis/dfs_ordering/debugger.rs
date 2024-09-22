use super::DFSOrdering;
use crate::ir::function::BasicBlock;
use crate::ir::function::Function;
use crate::ir_optimizer::anaylsis::DebuggerAnaylsis;
use crate::ir_optimizer::print_table_helper::{get_max_block_id_len, print_divider, print_header};

impl DebuggerAnaylsis<Vec<BasicBlock>> for DFSOrdering {
    fn debugger(&mut self, function: &Function, table: &Vec<BasicBlock>) -> String {
        let mut output_string = String::new();
        let max_block_id_len = get_max_block_id_len(function);
        let row_len = if "DFS Ordering".len() > max_block_id_len {
            "DFS Ordering".len() + 2
        } else {
            max_block_id_len + 2
        };
        output_string.push_str(print_divider(row_len).as_str());
        output_string.push_str(print_header("DFS Ordering", row_len).as_str());
        output_string.push_str(print_divider(row_len).as_str());
        for block in table {
            output_string.push_str(&print_header(format!("BB {}", block.0).as_str(), row_len));
        }
        output_string.push_str(print_divider(row_len).as_str());
        output_string
    }
}
