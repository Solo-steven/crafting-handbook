use crate::ir::function::BasicBlock;
use crate::ir::function::Function;

static DIVIDE_CHAR: &'static str = "-";

pub fn print_header(name: &str, total_len: usize) -> String {
    format!("|{name:^total_len$}|\n")
}
pub fn print_divider(total_len: usize) -> String {
    format!("|{DIVIDE_CHAR:->total_len$}|\n")
}
pub fn print_table_row(left: &str, right: &str, left_len: usize, right_len: usize) -> String {
    format!("|{left:^left_len$}|{right:^right_len$}|\n")
}
pub fn get_max_block_id_len(function: &Function) -> usize {
    let mut max_block_id_len = 0;
    for (block_id, _) in &function.blocks {
        let block_id_len = block_id.0.to_string().len();
        if block_id_len > max_block_id_len {
            max_block_id_len = block_id_len
        }
    }
    max_block_id_len
}
pub fn sort_block_ids(mut block_ids: Vec<BasicBlock>) -> Vec<BasicBlock> {
    if block_ids.len() == 0 {
        return block_ids;
    }
    for i in 0..block_ids.len() - 1 {
        for j in 0..(block_ids.len() - 1 - i) {
            if block_ids[j].0 > block_ids[j + 1].0 {
                let temp = block_ids[j];
                block_ids[j] = block_ids[j + 1];
                block_ids[j + 1] = temp;
            }
        }
    }
    block_ids
}
